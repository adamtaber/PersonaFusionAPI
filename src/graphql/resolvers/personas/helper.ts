import { pool } from "../../../db/config"
import humps from 'humps'
import { isPersona } from "./types"
import { GraphQLError } from "graphql"
import { arcanaCombos } from "../../../db/arcanaCombos"
import { treasureCombos, treasureDemons } from "../../../db/treasureCombos"

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
        
        const personaId = persona1.treasure
          ? persona2.personaId
          : persona1.personaId
        
        const baseLevel = persona1.treasure
          ? persona2.baseLevel
          : persona1.baseLevel
        
        const arcana = persona1.treasure
          ? persona2.arcana
          : persona1.arcana
        
        const personasQuery = `
          SELECT persona_id
          FROM personas
          WHERE arcana = $1
          ORDER BY base_level
        `
        const getPersonas = await pool.query(personasQuery, [arcana])
        const personas = humps.camelizeKeys(getPersonas.rows)

        if (!Array.isArray(personas)) return null

        const modifierQuery = `
          SELECT ${arcana.toLowerCase()}_mod
          FROM treasure_modifiers
          WHERE persona_id = ${treasureId}
        `
        const getModifier = await pool.query(modifierQuery)
        const modifier = getModifier.rows[0][`${arcana.toLowerCase()}_mod`]

        const personaIndex = personas.findIndex((persona) => {
          return persona.personaId === personaId
        })
        const newPersonaIndex = personaIndex + modifier
        if(newPersonaIndex < 0 || newPersonaIndex > personas.length) return null
        const newPersonaId = personas[newPersonaIndex]?.personaId

        const whereQuery = `
          WHERE p.persona_id = ${newPersonaId}
        `
        
        const fusionQuery = getPersonasQuery(whereQuery, '', '')
        const getFusionQuery = 
          await pool.query(fusionQuery)
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

    const sameArcana = persona1.arcana === persona2.arcana

    const findArcana = arcanaCombos.find((combo) => {
      return combo.source.includes(persona1.arcana) 
      && combo.source.includes(persona2.arcana)
    })?.result

    const fusionArcana = sameArcana ? persona1.arcana : findArcana

    if (!fusionLevel || !fusionArcana) {
      throw new GraphQLError('Invalid level or arcana', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    const whereQuery = `
      WHERE p.arcana = $1 
        AND p.base_level ${ sameArcana ? '<= $2' : '>= $2' }
        AND (dlc = $3 OR dlc = false)
        AND p.special = false
        AND p.persona_id != $4
        AND p.persona_id != $5
    `
    const orderByQuery = `
      ORDER BY p.base_level 
      ${sameArcana ? 'DESC' : ''}
    `
    const limit = 'LIMIT 1'
    const fusionQuery = getPersonasQuery(whereQuery, orderByQuery, limit)

    const getFusionQuery = 
      await pool.query(fusionQuery, [
        fusionArcana, fusionLevel, dlc, persona1.personaId, persona2.personaId
      ])
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

interface ArcanaCombo {
  source: Array<String>,
  result: String
}

export const getDiffArcanaRecipes = 
  async (arcanaRecipes: Array<ArcanaCombo>, personaId: number, 
  targetArcana: string, dlc: boolean) => {
    const personaPairs = []

    for (let i = 0; i < arcanaRecipes.length; i++) {
      const personasQuery = `
        SELECT base_level, persona_id, name, arcana, treasure
        FROM personas
        WHERE arcana = $1
          AND persona_id != $2
      `
      const getPersonasA = await pool.query(personasQuery, [
        arcanaRecipes[i].source[0],
        personaId
      ])

      const getPersonasB = await pool.query(personasQuery, [
        arcanaRecipes[i].source[1],
        personaId
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
          
          if ((personasA[j].treasure || personasB[k].treasure) && 
            !(personasA[j].treasure && personasB[k].treasure)) {
              continue
            }

          const standardFusionQuery = `
            SELECT persona_id
            FROM personas
            WHERE arcana = $1 
              AND base_level >= $2
              AND (dlc = $3 OR dlc = false)
              AND special = false
              AND persona_id != $4
              AND persona_id != $5
            ORDER BY base_level
            LIMIT 1
          `

          const getFusionQuery = 
            await pool.query(standardFusionQuery, [
              targetArcana, fusionLevel, dlc, personasA[j].personaId,
              personasB[k].personaId
            ])
          const fusedPersonaId = getFusionQuery.rows[0]?.persona_id

          if (fusedPersonaId === personaId) {
            const whereQuery1 = `WHERE p.persona_id = ${personasA[j].personaId}`
            const whereQuery2 = `WHERE p.persona_id = ${personasB[k].personaId}`
            const persona1Query = await pool.query(getPersonasQuery(whereQuery1, '', ''))
            const persona2Query = await pool.query(getPersonasQuery(whereQuery2, '', ''))
            const persona1 = humps.camelizeKeys(persona1Query.rows[0])
            const persona2 = humps.camelizeKeys(persona2Query.rows[0])
            personaPairs.push({
              persona1,
              persona2
            })
          }
        }
      }
    }

    return personaPairs
}

export const getSameArcanaRecipes =
  async (personaId: number, targetArcana: string, dlc: boolean) => {
    const personaPairs = []

    const personasQuery = `
      SELECT base_level, persona_id, name, arcana, treasure
      FROM personas
      WHERE arcana = $1
        AND persona_id != $2
    `
    const getPersonas = await pool.query(personasQuery, [
      targetArcana,
      personaId
    ])

    const personas = humps.camelizeKeys(getPersonas.rows)

    if(!Array.isArray(personas)) {
      throw new GraphQLError('Not array')
    } 

    const personasA = [...personas]
    const personasB = personas.slice(1)

    for (let j = 0; j < personasA.length; j++) {
      for (let k = 0; k < personasB.length; k++) {
        const fusionLevel = 
          Math.floor((personasA[j].baseLevel + personasB[k].baseLevel) / 2) + 1
        
        if ((personasA[j].treasure || personasB[k].treasure) && 
          !(personasA[j].treasure && personasB[k].treasure)) {
            continue
          }

        const standardFusionQuery = `
          SELECT persona_id
          FROM personas
          WHERE arcana = $1 
            AND base_level <= $2
            AND (dlc = $3 OR dlc = false)
            AND special = false
            AND persona_id != $4
            AND persona_id != $5
          ORDER BY base_level DESC
          LIMIT 1
        `

        const getFusionQuery = 
          await pool.query(standardFusionQuery, [
            targetArcana, fusionLevel, dlc, personasA[j].personaId,
            personasB[k].personaId
          ])
        const fusedPersonaId = getFusionQuery.rows[0]?.persona_id

        if (fusedPersonaId === personaId) {
          const whereQuery1 = 
            `WHERE p.persona_id = ${personasA[j].personaId}`
          const whereQuery2 = 
            `WHERE p.persona_id = ${personasB[k].personaId}`
          const persona1Query = 
            await pool.query(getPersonasQuery(whereQuery1, '', ''))
          const persona2Query = 
            await pool.query(getPersonasQuery(whereQuery2, '', ''))
          const persona1 = humps.camelizeKeys(persona1Query.rows[0])
          const persona2 = humps.camelizeKeys(persona2Query.rows[0])
          personaPairs.push({
            persona1,
            persona2
          })
        }
      }
      personasB.shift()
    }

    return personaPairs
}

export const getTreasureRecipes = 
  async (targetArcana: string, personaId: number, dlc: boolean) => {
  const personaPairs = []

  const allArcanaPersonasQuery = `
    SELECT base_level, persona_id, name, arcana, treasure
    FROM personas
    WHERE arcana = $1
    ORDER BY base_level
  `
  const getPersonas = await pool.query(allArcanaPersonasQuery, [
    targetArcana
  ])
  const allArcanaPersonas = humps.camelizeKeys(getPersonas.rows)

  const treasureQuery = `
    SELECT p.persona_id, p.name, p.arcana, 
      p.treasure, 
      ${`${targetArcana.toLowerCase()}_mod`} as modifier
    FROM personas p
    JOIN treasure_modifiers t
      ON t.persona_id = p.persona_id
    WHERE treasure = true
  `
  const getTreasures = await pool.query(treasureQuery)
  const treasures = humps.camelizeKeys(getTreasures.rows)

  if (!Array.isArray(treasures) || !Array.isArray(allArcanaPersonas)) {
    throw new GraphQLError('error')
  }

  const filteredPersonas = allArcanaPersonas.filter((persona) => {
    return persona.personaId !== personaId
  })

  for (let j = 0; j < filteredPersonas.length; j++) {
    for (let k = 0; k < treasures.length; k++) {
      const newIndex = (j + 1) + treasures[k].modifier
      if (newIndex < 0 || newIndex > allArcanaPersonas.length) continue
      const newPersonaId = allArcanaPersonas[newIndex]?.personaId

      if (newPersonaId === personaId) {
        const whereQuery1 = 
          `WHERE p.persona_id = ${filteredPersonas[j].personaId}`
        const whereQuery2 = 
          `WHERE p.persona_id = ${treasures[k].personaId}`
        const persona1Query = 
          await pool.query(getPersonasQuery(whereQuery1, '', ''))
        const persona2Query = 
          await pool.query(getPersonasQuery(whereQuery2, '', ''))
        const persona1 = humps.camelizeKeys(persona1Query.rows[0])
        const persona2 = humps.camelizeKeys(persona2Query.rows[0])
        personaPairs.push({
          persona1,
          persona2
        })
      }
    }
  }

  return personaPairs
}