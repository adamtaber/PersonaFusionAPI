import { GraphQLError } from "graphql";
import { pool } from "../../../db/config";
import { QueryResolvers } from "../graphql-types";
import humps from 'humps'
import { isPersonaArray } from "./types";

const personaQueries: QueryResolvers = {
  allPersonas: async () => {
    const query = `
      SELECT *
      FROM personas p
      JOIN skills s
    `
    const allPersonasQuery = await pool.query(query)
    const personas = humps.camelizeKeys(allPersonasQuery.rows)

    console.log(personas)

    if(!isPersonaArray(personas)) {
      throw new GraphQLError('Query result is not an array', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    return personas
  }
}

export default personaQueries