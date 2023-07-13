import { pool } from "../../../db/config"
import { QueryResolvers } from "../graphql-types"
import humps from 'humps'
import { isSkillArray } from "./types"
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
  }
}

export default skillQueries