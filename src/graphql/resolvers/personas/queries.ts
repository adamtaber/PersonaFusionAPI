import { GraphQLError } from "graphql";
import { pool } from "../../../db/config";
import { QueryResolvers } from "../graphql-types";
import humps from 'humps'
import { isPersona, isPersonaArray } from "./types";
import { arcanaCombos } from "../../../db/arcanaCombos";
import { checkForSpecial, checkForStandardFusion, checkForTreasure, getMinPersona, getPersonasQuery } from "./helper";

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

    const personaQuery = `
      SELECT arcana, special, base_level
      FROM personas
      WHERE persona_id = $1
    `
    const getPersona = await pool.query(personaQuery, [personaId])
    const targetPersona = getPersona.rows[0]

    const arcanaRecipes = arcanaCombos.filter((combo) => {
      return combo.result === targetPersona.arcana
    })

    const personaPairs = []

    for (let i = 0; i < arcanaRecipes.length; i++) {
      const personasQuery = `
        SELECT base_level, persona_id, name, arcana, treasure
        FROM personas
        WHERE arcana = $1
          AND special = false
      `
      const getPersonasA = await pool.query(personasQuery, [
        arcanaRecipes[i].source[0]
      ])

      const getPersonasB = await pool.query(personasQuery, [
        arcanaRecipes[i].source[1]
      ])

      const personasA = humps.camelizeKeys(getPersonasA.rows)
      const personasB = humps.camelizeKeys(getPersonasB.rows)

      if(!Array.isArray(personasA) || !Array.isArray(personasB)) {
        throw new GraphQLError('Not array')
      } 

      for (let j = 0; j < personasA.length; j++) {
        for (let k = 0; k < personasB.length; k++) {
          const fusionLevel = 
            Math.floor((personasA[j].baseLevel + personasB[k].baseLevel) / 2) + 1
          
          const sameArcana = personasA[j].arcana === personasB[k].arcana

          if ((personasA[j].treasure || personasB[k].treasure) && 
            !(personasA[j].treasure && personasB[k].treasure)) {
              continue
            }

          const standardFusionQuery = `
            SELECT persona_id
            FROM personas
            WHERE arcana = $1 
              AND base_level ${ sameArcana ? '<= $2' : '>= $2' }
              AND (dlc = $3 OR dlc = false)
              AND special = false
            ORDER BY base_level ${sameArcana ? 'DESC' : ''}
            LIMIT 1
          `

          const getFusionQuery = 
            await pool.query(standardFusionQuery, [targetPersona.arcana, fusionLevel, dlc])
          const fusedPersonaId = getFusionQuery.rows[0]?.persona_id

          if (fusedPersonaId === personaId) {
            personaPairs.push({
              persona1: personasA[j].personaId,
              persona2: personasB[k].personaId
            })
          }
        }
      }
    }
    console.log(personaPairs.length)

    throw new GraphQLError('TEST')
  }
}

export default personaQueries

