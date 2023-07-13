import { Skill } from "../graphql-types";

export const isSkill = (input: any): input is Skill => {
  const persona = (input.name !== undefined) &&
                  (input.effect !== undefined) &&
                  (input.type !== undefined) &&
                  (input.skillId !== undefined)
  return persona
}

export const isSkillArray = (input: any): input is Array<Skill> => {
  if (!Array.isArray(input)) return false
  const initLength = input.length
  const filter = input.filter(isSkill)
  return initLength === filter.length
}