import { pool } from "../../../db/config"
import { QueryResolvers } from "../graphql-types"
import humps from 'humps'
import { isSkill, isSkillArray } from "./types"
import { GraphQLError } from "graphql"

const skillQueries: QueryResolvers = {
  allSkills: async () => {
    const query = `
      SELECT *
      FROM skills
    `

    const allSkillsQuery = await pool.query(query)
    const personas = humps.camelizeKeys(allSkillsQuery.rows)

    if(!isSkillArray(personas)) {
      throw new GraphQLError('Query result is not an array', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    return personas
  },
  skillById: async (_root, { skillId }) => {
    if (!skillId) {
      throw new GraphQLError('Missing parameters')
    }

    const query = `
      SELECT *
      FROM skills
      WHERE skill_id = $1
    `
    const skillQuery = await pool.query(query, [skillId])
    const skill = humps.camelizeKeys(skillQuery.rows[0])

    if (!isSkill(skill)) {
      throw new GraphQLError('Result is not of type Skill')
    }

    return skill
  },
  skillByName: async (_root, { name }) => {
    if (!name) {
      throw new GraphQLError('Missing parameters')
    }

    const query = `
      SELECT *
      FROM skills
      WHERE name LIKE $1
    `
    const skillQuery = await pool.query(query, [`%${name}%`])
    const skills = humps.camelizeKeys(skillQuery.rows)

    if (!isSkillArray(skills)) {
      throw new GraphQLError('Result is not of type SkillArray')
    }

    return skills
  }
}

export default skillQueries