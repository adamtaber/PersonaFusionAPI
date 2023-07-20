import { GraphQLError } from "graphql"
import { pool } from "../../../../db/config"
import { BasicPersona, isBasicPersona, isPersona } from "../types"
import { basicPersonaQuery, basicPersonasByArcanaQuery, getPersonasQuery, treasureModifierQuery } from "./personaQueries"
import humps from "humps"
import { Persona } from "../../graphql-types"

export const getBasicPersona = async (personaId: number) => {
  const getPersona = await pool.query(basicPersonaQuery, [personaId])
  const persona = humps.camelizeKeys(getPersona.rows[0])

  if (!isBasicPersona(persona)) {
    throw new GraphQLError('Not of type MinPersona', {
      extensions: {
        code: 'INVALID_TYPE'
      }
    })
  }

  return persona
}

export const getBasicPersonasByArcana = async (
  arcana: string, 
  dlc: boolean
) => {
  const getPersonas = await pool.query(basicPersonasByArcanaQuery, [
    arcana, 
    dlc
  ])
  const personas = humps.camelizeKeys(getPersonas.rows)

  if (!Array.isArray(personas)) {
    throw new GraphQLError('Result is not an Array', {
      extensions: {
        code: 'INVALID_TYPE'
      }
    })
  }

  return personas
}

export const getTreasureModifier = async (
  arcana: string, 
  treasureId: number
) => {
  const getModifier = await pool.query(treasureModifierQuery(
    arcana, 
    treasureId
  ))

  const modifier = getModifier.rows[0][`${arcana.toLowerCase()}_mod`]

  return modifier
}

export const findNewTreasureFusionId = async (
  personas: Array<Persona>,
  normalPersona: BasicPersona,
  modifier: number
) => {
  const personaIndex = personas.findIndex((persona) => {
    return persona.personaId === normalPersona.personaId
  })
  const newPersonaIndex = personaIndex + modifier

  if (newPersonaIndex < 0 || newPersonaIndex > personas.length) return null

  const newPersonaId = personas[newPersonaIndex]?.personaId

  return newPersonaId
}

export const getFullPersonaInfo = async (
  personasA: Array<BasicPersona>,
  personasB: Array<BasicPersona>,
  j: number,
  k: number
) => {
  const whereQuery1 = `WHERE p.persona_id = ${personasA[j].personaId}`
  const whereQuery2 = `WHERE p.persona_id = ${personasB[k].personaId}`
  const persona1Query = await pool.query(
    getPersonasQuery(whereQuery1, '', '')
  )
  const persona2Query = await pool.query(
    getPersonasQuery(whereQuery2, '', '')
  )
  const persona1 = humps.camelizeKeys(persona1Query.rows[0])
  const persona2 = humps.camelizeKeys(persona2Query.rows[0])

  if (!isPersona(persona1) || !isPersona(persona2)) {
    throw new GraphQLError('Not of type Persona')
  }

  const personaPair = { persona1, persona2 }

  return personaPair
}