import { GraphQLError } from "graphql"
import { pool } from "../../../../db/config"
import humps from "humps"
import { getPersonasQuery } from "./personaQueries"
import { isBasicPersona, isPersona } from "../types"
import { findNewTreasureFusionId, getBasicPersonasByArcana, getTreasureModifier } from "./basicHelpers"

const treasureFusion = async (newPersonaId: string) => {
  const whereQuery = `
    WHERE p.persona_id = ${newPersonaId}
  `
  const fusionQuery = getPersonasQuery(whereQuery, '', '')
  const getFusionQuery = await pool.query(fusionQuery)
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

export const checkForTreasure = async (
  persona1: any, 
  persona2: any, 
  dlc: boolean
) => {
  if (!isBasicPersona(persona1) || !isBasicPersona(persona2)) {
    throw new GraphQLError('Not of type MinPersona', {
      extensions: {
        code: 'INVALID_TYPE'
      }
    })
  }

  const treasurePersona = persona1.treasure ? persona1 : persona2
  const normalPersona = persona1.treasure ? persona2 : persona1

  const personas = await getBasicPersonasByArcana(
    normalPersona.arcana, 
    dlc
  )

  if (!Array.isArray(personas)) return null

  const modifier = await getTreasureModifier(
    normalPersona.arcana, 
    treasurePersona.personaId
  )

  const newPersonaId = await findNewTreasureFusionId(
    personas, 
    normalPersona, 
    modifier
  )

  if (!newPersonaId) return null

  const persona = await treasureFusion(newPersonaId)

  return persona
}