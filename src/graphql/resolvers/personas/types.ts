import { Persona } from "../graphql-types";

export const isPersona = (input: any): input is Persona => {
  const persona = (input.personaId !== undefined) &&
                  (input.name !== undefined) &&
                  (input.baseLevel !== undefined) &&
                  (input.special !== undefined) &&
                  (input.inheritanceType !== undefined) &&
                  (input.stats !== undefined) &&
                  (input.elementals !== undefined) &&
                  (input.skills !== undefined)
  return persona
}

export const isPersonaArray = (input: any): input is Array<Persona> => {
  if (!Array.isArray(input)) return false
  const initLength = input.length
  const filter = input.filter(isPersona)
  return initLength === filter.length
}