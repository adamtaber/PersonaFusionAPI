import { GraphQLError } from "graphql";
import { pool } from "../../../db/config";
import { QueryResolvers } from "../graphql-types";
import humps from 'humps'
import { isPersona, isPersonaArray } from "./types";
import { arcanaCombos } from "../../../db/arcanaCombos";
import { getPersonasQuery } from "./helper";

const personaQueries: QueryResolvers = {
  allPersonas: async () => {
    const orderByQuery = 'ORDER BY p.persona_id'
    const query = getPersonasQuery('', orderByQuery, '')
    const allPersonasQuery = await pool.query(query)
    const personas = humps.camelizeKeys(allPersonasQuery.rows)

    if(Array.isArray(personas)) console.log(personas[0].skills2, personas.length)

    if(!isPersonaArray(personas)) {
      throw new GraphQLError('Query result is not an array', {
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
      throw new GraphQLError('Result is not of type Persona', {
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

    const whereQuery = 'WHERE p.name LIKE $1'
    const query = getPersonasQuery(whereQuery, '', '')

    const personaByNameQuery = await pool.query(query, [`%${name}%`])
    const personas = humps.camelizeKeys(personaByNameQuery.rows)

    if (!isPersonaArray(personas)) {
      throw new GraphQLError('Not of type Persona', {
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
      throw new GraphQLError('Invalid parameters', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    //SPECIAL PERSONAS

    const specialPersonaQuery = `
      SELECT persona_id
      FROM special_personas
      WHERE array_length(fusion_ids, 1) = 2
        AND $1 = ANY(fusion_ids)
        AND $2 = ANY(fusion_ids)
    `

    const specialPersonaIdQuery = 
      await pool.query(specialPersonaQuery, [persona1Id, persona2Id])
    const specialPersonaId = specialPersonaIdQuery.rows[0]?.persona_id

    if(specialPersonaId) {
      const whereQuery = 'WHERE p.persona_id = $1'
      const personaQuery = getPersonasQuery(whereQuery, '', '')
      const personaFusionQuery = 
        await pool.query(personaQuery, [specialPersonaId])
      const persona = humps.camelizeKeys(personaFusionQuery.rows[0])

      if(!isPersona(persona)) {
        throw new GraphQLError('Not of type Persona', {
          extensions: {
            code: 'INVALID_TYPE'
          }
        })
      }
      return persona
    }

    const personaQuery = `
      SELECT base_level, arcana, treasure, name, persona_id
      FROM personas
      WHERE persona_id = $1
    `

    const persona1Query = await pool.query(personaQuery, [persona1Id])
    const persona2Query = await pool.query(personaQuery, [persona2Id])
    const persona1 = humps.camelizeKeys(persona1Query.rows[0])
    const persona2 = humps.camelizeKeys(persona2Query.rows[0])

    //TREASURE FUSION
    if (persona1.treasure || persona2.treasure) {
      const treasureId = persona1.treasure 
        ? persona1.personaId 
        : persona2.personaId
      
      const baseLevel = persona1.treasure
        ? persona2.baseLevel
        : persona1.baseLevel
      
      const arcana = persona1.treasure
        ? persona2.arcana
        : persona1.arcana

      const modifierQuery = `
        SELECT ${arcana.toLowerCase()}_mod
        FROM treasure_modifiers
        WHERE persona_id = ${treasureId}
      `

      const getModifier = await pool.query(modifierQuery)
      const modifier = getModifier.rows[0][`${arcana.toLowerCase()}_mod`]

      const newLevel = baseLevel + modifier

      const whereQuery = `
        WHERE p.arcana = $1
          AND p.base_level >= $2
          AND (dlc = $3 OR dlc = false)
          AND p.special = false
      `

      const orderByQuery = `
        ORDER BY p.base_level
      `

      const limit = 'LIMIT 1'

      const fusionQuery = getPersonasQuery(whereQuery, orderByQuery, limit)
      const getFusionQuery = 
        await pool.query(fusionQuery, [arcana, newLevel, dlc])
      const persona = humps.camelizeKeys(getFusionQuery.rows[0])

      if (!isPersona(persona)) {
        throw new GraphQLError('Not of type Persona', {
          extensions: {
            code: 'INVALID_TYPE'
          }
        })
      }

      return persona
    }

    //STANDARD FUSION

    const fusionLevel = 
      Math.floor((persona1.baseLevel + persona2.baseLevel) / 2) + 1

    const arcanaCombo = arcanaCombos.find((combo) => {
      return combo.source.includes(persona1.arcana) 
      && combo.source.includes(persona2.arcana)
    })

    const fusionArcana = arcanaCombo ? arcanaCombo.result : ''

    if (!fusionLevel || !fusionArcana) {
      throw new GraphQLError('Invalid level or arcana', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    const sameArcana = persona1.arcana === persona2.arcana

    const whereQuery = `
      WHERE p.arcana = $1 
        AND p.base_level ${ sameArcana ? '<= $2' : '>= $2' }
        AND (dlc = $3 OR dlc = false)
        AND p.special = false
    `
    const orderByQuery = `
      ORDER BY p.base_level 
      ${sameArcana ? 'DESC' : ''}
    `
    const limit = 'LIMIT 1'
    const fusionQuery = getPersonasQuery(whereQuery, orderByQuery, limit)

    const getFusionQuery = 
      await pool.query(fusionQuery, [fusionArcana, fusionLevel, dlc])
    const persona = humps.camelizeKeys(getFusionQuery.rows[0])

    if (!isPersona(persona)) {
      throw new GraphQLError('Not of type Persona', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    return persona
  }
}

export default personaQueries

