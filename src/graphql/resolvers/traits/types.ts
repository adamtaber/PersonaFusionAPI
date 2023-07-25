import { Trait } from "../graphql-types";

export const isTrait = (input: any): input is Trait => {
  const trait = (input.traitId !== undefined) &&
                (input.description !== undefined) &&
                (input.name !== undefined) &&
                (input.category !== undefined)
  return trait
}

export const isTraitArray = (input: any): input is Trait[] => {
  if (!Array.isArray(input)) return false
  const initLength = input.length
  const filter = input.filter(isTrait)
  return initLength === filter.length
}