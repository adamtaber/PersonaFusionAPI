import { GraphQLError } from "graphql";
import { pool } from "../../../db/config";
import { QueryResolvers } from "../graphql-types";
import humps from 'humps'
import { isPersona, isPersonaArray } from "./types";
import { arcanaCombos } from "../../../db/arcanaCombos";
import { checkForSpecial, checkForStandardFusion, checkForTreasure, getDiffArcanaRecipes, getMinPersona, getPersonasQuery, getSameArcanaRecipes, getTreasureRecipes } from "./helper";

const personaQueries: QueryResolvers = {
  allPersonas: async () => {
    const orderByQuery = 'ORDER BY p.persona_id'
    const query = getPersonasQuery('', orderByQuery, '')
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
  personaByName: async (_root, { name }) => {
    if (!name) {
      throw new GraphQLError('Missing parameters', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    const whereQuery = 'WHERE LOWER(p.name) LIKE LOWER($1)'
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

    const specialFusion = await checkForSpecial(persona1Id, persona2Id)
    if (specialFusion) return specialFusion

    const persona1 = await getMinPersona(persona1Id)
    const persona2 = await getMinPersona(persona2Id)

    const treasureFusion = await checkForTreasure(persona1, persona2, dlc)
    if (treasureFusion) return treasureFusion

    const standardFusion = await checkForStandardFusion(persona1, persona2, dlc)
    if (standardFusion) return standardFusion
    else throw new GraphQLError('Invalid fusion', {
      extensions: {
        code: 'INVALID_TYPE'
      }
    })
  },
  // getPersonaFusionByName: async (_root, { persona1Name, persona2Name, dlc }) => {
  //   if (!persona1Name || !persona2Name || dlc === undefined) {
  //     throw new GraphQLError('Missing parameters', {
  //       extensions: {
  //         code: 'INVALID_TYPE'
  //       }
  //     })
  //   }

  //   if (persona1Name === persona2Name) {
  //     throw new GraphQLError('Invalid parameters: Personas must be different', {
  //       extensions: {
  //         code: 'INVALID_TYPE'
  //       }
  //     })
  //   }

    
  // },
  getPersonaRecipesById: async (_root, { personaId, dlc }) => {
    if(!personaId || !dlc) {
      throw new GraphQLError('Missing parameters', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    const targetPersona = await getMinPersona(personaId)
    const arcanaRecipes = arcanaCombos.filter((combo) => {
      return (
        combo.result === targetPersona.arcana &&
        combo.source[0] !== combo.source[1]
      )
    })
    let personaPairs: Array<any> = []

    const diffArcanaRecipes = 
      await getDiffArcanaRecipes(arcanaRecipes, personaId, 
        targetPersona.arcana, dlc)
    personaPairs = [...personaPairs, ...diffArcanaRecipes]

    const sameArcanaRecipes = 
      await getSameArcanaRecipes(personaId, targetPersona.arcana, dlc)
    personaPairs = [...personaPairs, ...sameArcanaRecipes]

    const treasureRecipes = 
      await getTreasureRecipes(targetPersona.arcana, personaId, dlc)
    personaPairs = [...personaPairs, ...treasureRecipes]

    console.log(personaPairs)

    throw new GraphQLError('TEST')
  }
}

export default personaQueries

