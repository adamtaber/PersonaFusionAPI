import { GraphQLError } from "graphql"
import { arcanaCombos } from "../../../../db/arcanaCombos"
import { BasicPersona, isPersona } from "../types"
import { getPersonasQuery } from "./personaQueries"
import { pool } from "../../../../db/config"
import humps from 'humps'

const standardFusion = async (
  sameArcana: boolean,
  fusionArcana: string,
  fusionLevel: number,
  dlc: boolean,
  persona1: BasicPersona,
  persona2: BasicPersona
) => {
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

  const getFusionQuery = await pool.query(fusionQuery, [
      fusionArcana, 
      fusionLevel, 
      dlc, 
      persona1.personaId, 
      persona2.personaId
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

export const checkForStandardFusion = async (
  persona1: BasicPersona, 
  persona2: BasicPersona, 
  dlc: boolean
) => {
  const fusionLevel = 
    Math.floor((persona1.baseLevel + persona2.baseLevel) / 2) + 1

  const sameArcana = persona1.arcana === persona2.arcana

  const arcana = arcanaCombos.find((combo) => {
    return (
      combo.source.includes(persona1.arcana) && 
      combo.source.includes(persona2.arcana)
    )
  })?.result

  const fusionArcana = sameArcana ? persona1.arcana : arcana

  if (!fusionLevel || !fusionArcana) {
    throw new GraphQLError('Invalid level or arcana', {
      extensions: {
        code: 'INVALID_TYPE'
      }
    })
  }

  const persona = await standardFusion(
    sameArcana,
    fusionArcana, 
    fusionLevel, 
    dlc,
    persona1,
    persona2
  )

  return persona
}