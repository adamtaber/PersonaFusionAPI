import { pool } from "../../../db/config"
import humps from 'humps'
import { isPersona } from "./types"
import { GraphQLError } from "graphql"
import { arcanaCombos } from "../../../db/arcanaCombos"

export const getPersonasQuery = (where: string, order: string, limit: string) => {
  return `
    SELECT p.*,
      array_agg(
        json_build_object('level', ps.level, 'skill', 
          json_build_object('cost', s.cost, 'effect', s.effect,
            'name', s.name, 'skill_id', s.skill_id, 'type',
            s.type
          )
        )
      ) as skills,
      json_build_object(
        'cost', s_normal.cost, 'effect', s_normal.effect, 'name',
        s_normal.name, 'skill_id', s_normal.skill_id, 'type', 
        s_normal.type
      ) as normal_skill_card, 
      json_build_object(
        'cost', s_fusion.cost, 'effect', s_fusion.effect, 'name',
        s_fusion.name, 'skill_id', s_fusion.skill_id, 'type', 
        s_fusion.type
      ) as fusion_alarm_skill_card, 
      json_build_object(
        'name', i_normal.name, 'description', i_normal.description,
        'item_id', i_normal.item_id
      ) as normal_item,
      json_build_object(
        'name', i_fusion.name, 'description', i_fusion.description,
        'item_id', i_fusion.item_id
      ) as fusion_alarm_item
    FROM personas p
    LEFT JOIN persona_skills ps
      ON ps.persona_id = p.persona_id
    LEFT JOIN items i_normal
      ON p.normal_item_id = i_normal.item_id
    LEFT JOIN items i_fusion
      ON p.fusion_alarm_item_id = i_fusion.item_id
    LEFT JOIN skills s
      ON ps.skill_id = s.skill_id
    LEFT JOIN skills s_normal
      ON p.normal_skillcard_id = s_normal.skill_id
    LEFT JOIN skills s_fusion
      ON p.fusion_alarm_skillcard_id = s_fusion.skill_id
    ${where}
    GROUP BY p.persona_id, s_normal.skill_id, i_normal.item_id,
      s_fusion.skill_id, i_fusion.item_id
    ${order}
    ${limit}
  `
}

export const checkForSpecial = async (persona1Id: number, persona2Id: number) => {
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
}

interface MinPersona {
  personaId: number,
  name: string,
  baseLevel: number,
  arcana: string,
  treasure: boolean
}

const isMinPersona = (input: any): input is MinPersona => {
  const minPersona = (input.personaId !== undefined) &&
                     (input.name !== undefined) &&
                     (input.baseLevel !== undefined) &&
                     (input.arcana !== undefined) &&
                     (input.treasure !== undefined)
  return minPersona
}

export const getMinPersona = async (personaId: number) => {
  const personaQuery = `
    SELECT base_level, arcana, treasure, name, persona_id
    FROM personas
    WHERE persona_id = $1
  `

  const getPersona = await pool.query(personaQuery, [personaId])
  const persona = humps.camelizeKeys(getPersona.rows[0])

  if (!isMinPersona(persona)) {
    throw new GraphQLError('Not of type MinPersona', {
      extensions: {
        code: 'INVALID_TYPE'
      }
    })
  }

  return persona
}

export const checkForTreasure = 
  async (persona1: any, persona2: any, dlc: boolean) => {
    if (!isMinPersona(persona1) || !isMinPersona(persona2)) {
      throw new GraphQLError('Not of type MinPersona', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    if ((persona1.treasure || persona2.treasure) 
      && !(persona1.treasure && persona2.treasure)) {
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
        
        if (!persona) return null

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

export const checkForStandardFusion = 
  async (persona1: MinPersona, persona2: MinPersona, dlc: boolean) => {
    const fusionLevel = 
      Math.floor((persona1.baseLevel + persona2.baseLevel) / 2) + 1

    const fusionArcana = arcanaCombos.find((combo) => {
      return combo.source.includes(persona1.arcana) 
      && combo.source.includes(persona2.arcana)
    })?.result

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