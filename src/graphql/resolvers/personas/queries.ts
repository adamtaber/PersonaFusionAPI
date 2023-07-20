import { GraphQLError } from "graphql";
import { pool } from "../../../db/config";
import { PersonaRecipe, QueryResolvers } from "../graphql-types";
import humps from 'humps'
import { isPersona, isPersonaArray, isPersonaRecipeArray } from "./types";
import { arcanaCombos } from "../../../db/arcanaCombos";
import { getPersonasQuery } from "./helpers/personaQueries";
import { checkForSpecial } from "./helpers/checkForSpecial";
import { getBasicPersona } from "./helpers/getBasicPersona";
import { checkForTreasure } from "./helpers/checkForTreasure";
import { checkForStandardFusion } from "./helpers/checkForStandardFusion";
import { getDiffArcanaRecipes } from "./helpers/getDiffArcanaRecipes";
import { getSameArcanaRecipes } from "./helpers/getSameArcanaRecipes";
import { getTreasureRecipes } from "./helpers/getTreasureRecipes";
import { getFusionFromIds } from "./helpers/getFusionFromIds";

const personaQueries: QueryResolvers = {
  allPersonas: async (_root, { dlc }) => {
    const orderByQuery = 'ORDER BY p.persona_id'
    const whereQuery = `WHERE (dlc = ${dlc} OR dlc = false)`
    const query = getPersonasQuery(whereQuery, orderByQuery, '')
    const allPersonasQuery = await pool.query(query)
    const personas = humps.camelizeKeys(allPersonasQuery.rows)

    if(Array.isArray(personas)) console.log(personas[0].skills2, personas.length)

    if(!isPersonaArray(personas)) {
      throw new GraphQLError('Query result must be an array', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    return personas
  },
  personaById: async (_root, { personaId }) => {
    if (!personaId) {
      throw new GraphQLError('Missing parameters', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    const whereQuery = 'WHERE p.persona_id = $1'
    const query = getPersonasQuery(whereQuery, '', '')
    
    const personaByIdQuery = await pool.query(query, [personaId])
    const persona = humps.camelizeKeys(personaByIdQuery.rows[0])

    if(!isPersona(persona)) {
      throw new GraphQLError('Query result must be of type Persona', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    return persona
  },
  personaByName: async (_root, { name, dlc }) => {
    if (!name) {
      throw new GraphQLError('Missing parameters', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    const whereQuery = `
      WHERE LOWER(p.name) LIKE LOWER($1)
        AND (dlc = ${dlc} OR dlc = false)
    `
    const query = getPersonasQuery(whereQuery, '', '')

    const personaByNameQuery = await pool.query(query, [`%${name}%`])
    const personas = humps.camelizeKeys(personaByNameQuery.rows)

    if (!isPersonaArray(personas)) {
      throw new GraphQLError('Query result must be of type Persona', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    return personas
  },
  getPersonaFusionById: async (_root, { persona1Id, persona2Id, dlc }) => {
    if (!persona1Id || !persona2Id || dlc === undefined) {
      throw new GraphQLError('Missing parameters', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    if (persona1Id === persona2Id) {
      throw new GraphQLError('Invalid parameters: Personas must be different', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    const persona = getFusionFromIds(persona1Id, persona2Id, dlc)

    return persona
  },
  getPersonaFusionByName: async (_root, { persona1Name, persona2Name, dlc }) => {
    if (!persona1Name || !persona2Name || dlc === undefined) {
      throw new GraphQLError('Missing parameters', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    if (persona1Name === persona2Name) {
      throw new GraphQLError('Invalid parameters: Personas must be different', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    const personaIdQuery = `
      SELECT persona_id
      FROM personas
      WHERE LOWER(name) = LOWER($1)
    `

    const getPersonaId1 = await pool.query(personaIdQuery, [persona1Name])
    const getPersonaId2 = await pool.query(personaIdQuery, [persona2Name])

    const persona1Id = getPersonaId1.rows[0]?.persona_id
    const persona2Id = getPersonaId2.rows[0]?.persona_id

    if (!persona1Id || !persona2Id) {
      throw new GraphQLError('One of the two personas are invalid')
    }

    const persona = await getFusionFromIds(persona1Id, persona2Id, dlc)

    return persona
  },
  getPersonaRecipesById: async (_root, { personaId, dlc }) => {
    if(!personaId || dlc === undefined) {
      throw new GraphQLError('Missing parameters', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    const targetPersona = await getBasicPersona(personaId)
    const arcanaRecipes = arcanaCombos.filter((combo) => {
      return (
        combo.result === targetPersona.arcana &&
        combo.source[0] !== combo.source[1]
      )
    })
    let personaPairs: Array<PersonaRecipe> = []

    const diffArcanaRecipes = await getDiffArcanaRecipes(
      arcanaRecipes, 
      personaId, 
      targetPersona.arcana, 
      dlc
    )
    personaPairs = [...personaPairs, ...diffArcanaRecipes]

    const sameArcanaRecipes = await getSameArcanaRecipes(
      personaId, 
      targetPersona.arcana, 
      dlc
    )
    personaPairs = [...personaPairs, ...sameArcanaRecipes]

    const treasureRecipes = await getTreasureRecipes(
      targetPersona.arcana, 
      personaId, 
      dlc
    )
    personaPairs = [...personaPairs, ...treasureRecipes]

    if(!isPersonaRecipeArray(personaPairs)) {
      throw new GraphQLError('Result is not of type PersonaRecipeArray', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })    
    }

    const sortedPairs = personaPairs.sort((a, b) => {
      return (
        Math.max(a.persona1.baseLevel, a.persona2.baseLevel) -
        Math.max(b.persona1.baseLevel, b.persona2.baseLevel)
      )
    })

    return sortedPairs
  }
}

export default personaQueries

