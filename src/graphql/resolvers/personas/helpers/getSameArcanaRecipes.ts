import { GraphQLError } from "graphql"
import { pool } from "../../../../db/config"
import { BasicPersona } from "../types"
import { getBasicPersonasByArcana, getFullPersonaInfo } from "./basicHelpers"

const getPersonaId = async (
  targetArcana: string,
  fusionLevel: number,
  dlc: boolean,
  personasA: Array<BasicPersona>,
  personasB: Array<BasicPersona>,
  j: number,
  k: number
) => {
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

  const getFusionQuery = await pool.query(standardFusionQuery, [
    targetArcana, 
    fusionLevel, 
    dlc, 
    personasA[j].personaId,
    personasB[k].personaId
  ])

  const fusedPersonaId = getFusionQuery.rows[0]?.persona_id

  return fusedPersonaId
}

export const getSameArcanaRecipes =
  async (personaId: string, targetArcana: string, dlc: boolean) => {
    const personaPairs = []

    const unfilteredPersonas = await getBasicPersonasByArcana(
      targetArcana,
      dlc
    )

    const personas = unfilteredPersonas.filter((persona) => {
      return persona.personaId != personaId
    })

    if(!Array.isArray(personas)) {
      throw new GraphQLError('Not array')
    } 

    const personasA = [...personas]
    const personasB = personas.slice(1)

    for (let j = 0; j < personasA.length; j++) {
      for (let k = 0; k < personasB.length; k++) {
        const fusionLevel = 
          Math.floor(
            (personasA[j].baseLevel + personasB[k].baseLevel) / 2
          ) + 1
        
        if ((personasA[j].treasure || personasB[k].treasure) && 
          !(personasA[j].treasure && personasB[k].treasure)) {
            continue
          }

        const fusedPersonaId = await getPersonaId(
          targetArcana,
          fusionLevel,
          dlc,
          personasA,
          personasB,
          j,
          k
        )

        if (fusedPersonaId === Number(personaId)) {
          const personaPair = await getFullPersonaInfo(
            personasA,
            personasB,
            j,
            k
          )

          personaPairs.push(personaPair)
        }
      }
      personasB.shift()
    }

    return personaPairs
}