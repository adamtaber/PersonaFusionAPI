import { ArcanaCombo } from "../types"
import { pool } from "../../../../db/config"
import { standardFusionQuery } from "./personaQueries"
import { getBasicPersonasByArcana, getFullPersonaInfo } from "./getBasicPersona"

export const getDiffArcanaRecipes = async (
  arcanaRecipes: Array<ArcanaCombo>, 
  personaId: number, 
  targetArcana: string, 
  dlc: boolean
) => {
  const personaPairs = []

  for (let i = 0; i < arcanaRecipes.length; i++) {
    const personasA = await getBasicPersonasByArcana(
      arcanaRecipes[i].source[0], 
      dlc
    )
    const personasB = await getBasicPersonasByArcana(
      arcanaRecipes[i].source[1], 
      dlc
    )

    for (let j = 0; j < personasA.length; j++) {
      if (personasA[j].personaId === personaId) continue

      for (let k = 0; k < personasB.length; k++) {
        if (personasB[k].personaId === personaId) continue
        
        const fusionLevel = 
          Math.floor(
            (personasA[j].baseLevel + personasB[k].baseLevel) / 2
          ) + 1
        
        if (
          (personasA[j].treasure || personasB[k].treasure) && 
          !(personasA[j].treasure && personasB[k].treasure)
        ) {
            continue
        }

        const getFusionQuery = await pool.query(standardFusionQuery, [
            targetArcana, 
            fusionLevel, 
            dlc, 
            personasA[j].personaId,
            personasB[k].personaId
        ])
        const fusedPersonaId = getFusionQuery.rows[0]?.persona_id

        if (fusedPersonaId === personaId) {
          const personaPair = await getFullPersonaInfo(
            personasA, 
            personasB, 
            j,
            k
          )
  
          personaPairs.push(personaPair)
        }
      }
    }
  }

  return personaPairs
}