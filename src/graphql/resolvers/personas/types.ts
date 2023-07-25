import { Persona, PersonaRecipe } from "../graphql-types";

export const isPersona = (input: any): input is Persona => {
  const persona = (input.personaId !== undefined) &&
                  (input.name !== undefined) &&
                  (input.baseLevel !== undefined) &&
                  (input.special !== undefined) &&
                  (input.inheritanceType !== undefined) &&
                  (input.stats !== undefined) &&
                  (input.affinities !== undefined) &&
                  (input.skills !== undefined)
  return persona
}

export const isPersonaArray = (input: any): input is Array<Persona> => {
  if (!Array.isArray(input)) return false
  const initLength = input.length
  const filter = input.filter(isPersona)
  return initLength === filter.length
}

export const isPersonaRecipe = (input: any): input is PersonaRecipe => {
  const personaRecipe = (isPersona(input.persona1)) &&
                        (isPersona(input.persona2))
  return personaRecipe
}

export const isPersonaRecipeArray = (input: any): input is Array<PersonaRecipe> => {
  if (!Array.isArray(input)) return false
  const initLength = input.length
  const filter = input.filter(isPersonaRecipe)
  return initLength === filter.length
}

export interface BasicPersona {
  personaId: number,
  name: string,
  baseLevel: number,
  arcana: string,
  treasure: boolean
}

export const isBasicPersona = (input: any): input is BasicPersona => {
  const minPersona = (input.personaId !== undefined) &&
                     (input.name !== undefined) &&
                     (input.baseLevel !== undefined) &&
                     (input.arcana !== undefined) &&
                     (input.treasure !== undefined)
  return minPersona
}

export interface ArcanaCombo {
  source: Array<string>,
  result: string
}
