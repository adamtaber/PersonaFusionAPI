import { pool } from "../../../../db/config"
import humps from 'humps'
import { isPersona } from "../types"
import { GraphQLError } from "graphql"
import { getPersonasQuery } from "./personaQueries"

export const checkForSpecial = async (
  persona1Id: number, 
  persona2Id: number
) => {
  const specialPersonaQuery = `
    SELECT persona_id
    FROM special_personas
    WHERE array_length(fusion_ids, 1) = 2
      AND $1 = ANY(fusion_ids)
      AND $2 = ANY(fusion_ids)
  `
  const specialPersonaIdQuery = await pool.query(specialPersonaQuery, [
    persona1Id, 
    persona2Id
  ])
  const specialPersonaId = specialPersonaIdQuery.rows[0]?.persona_id

  if (!specialPersonaId) return null

  const whereQuery = 'WHERE p.persona_id = $1'
  const personaQuery = getPersonasQuery(whereQuery, '', '')
  const personaFusionQuery = await pool.query(personaQuery, [
    specialPersonaId
  ])
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