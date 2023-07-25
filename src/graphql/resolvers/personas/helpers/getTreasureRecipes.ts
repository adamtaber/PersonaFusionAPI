import { GraphQLError } from "graphql"
import { pool } from "../../../../db/config"
import humps from 'humps'
import { basicPersonasByArcanaQuery, dlcList, getPersonasQuery, treasuresQuery } from "./personaQueries"
import { getFullPersonaInfo } from "./basicHelpers"

export const getTreasureRecipes = 
  async (targetArcana: string, personaId: number, dlc: boolean) => {
    const personaPairs = []

    const getPersonas = await pool.query(basicPersonasByArcanaQuery, [
      targetArcana,
      dlc
    ])
    const personas = humps.camelizeKeys(getPersonas.rows)

    const getTreasures = await pool.query(treasuresQuery(targetArcana))
    const treasures = humps.camelizeKeys(getTreasures.rows)

    if (!Array.isArray(treasures) || !Array.isArray(personas)) {
      throw new GraphQLError('error')
    }

    for (let j = 0; j < personas.length; j++) {
      if (personas[j].personaId === personaId) continue
      for (let k = 0; k < treasures.length; k++) {
        const newIndex = j + treasures[k].modifier
        if (newIndex < 0 || newIndex > personas.length) continue
        const newPersonaId = personas[newIndex]?.personaId

        if (newPersonaId === personaId) {
          const personaPair = await getFullPersonaInfo(
            personas,
            treasures,
            j,
            k
          )
          personaPairs.push(personaPair)
        }
      }
    }

    return personaPairs
}