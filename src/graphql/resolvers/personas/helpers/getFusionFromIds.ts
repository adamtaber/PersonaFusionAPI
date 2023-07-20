import { GraphQLError } from "graphql"
import { checkForSpecial } from "./checkForSpecial"
import { checkForTreasure } from "./checkForTreasure"
import { getBasicPersona } from "./getBasicPersona"
import { checkForStandardFusion } from "./checkForStandardFusion"

export const getFusionFromIds = async (
  persona1Id: number, 
  persona2Id: number,
  dlc: boolean
) => {
  const specialFusion = await checkForSpecial(persona1Id, persona2Id)
  if (specialFusion) return specialFusion

  const persona1 = await getBasicPersona(persona1Id)
  const persona2 = await getBasicPersona(persona2Id)

  if (
    (persona1.treasure || persona2.treasure) && 
    !(persona1.treasure && persona2.treasure)
  ) {
    const treasureFusion = await checkForTreasure(persona1, persona2, dlc)
    if (treasureFusion) return treasureFusion
    else throw new GraphQLError('No Treasure Fusion')
  }

  const standardFusion = await checkForStandardFusion(
    persona1, 
    persona2, 
    dlc
  )
  if (standardFusion) return standardFusion
  else 
    throw new GraphQLError('Invalid fusion', {
      extensions: {
        code: 'INVALID_TYPE'
      }
    })
}