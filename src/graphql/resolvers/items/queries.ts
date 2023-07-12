import { GraphQLError } from "graphql"
import { pool } from "../../../db/config"
import { QueryResolvers } from "../graphql-types"
import humps from 'humps'
import { isItemArray } from "./types"

const itemQueries: QueryResolvers = {
  allItems: async () => {
    const query = `
      SELECT *
      FROM items
    `
    const allItemsQuery = await pool.query(query)
    const items = humps.camelizeKeys(allItemsQuery.rows)

    if(!Array.isArray(items) || !isItemArray(items)) {
      throw new GraphQLError('Query result is not an array', {
        extensions: {
          code: 'INVALID_TYPE'
        }
      })
    }

    return items
  }
}

export default itemQueries