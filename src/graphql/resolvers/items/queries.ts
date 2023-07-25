import { GraphQLError } from "graphql"
import { pool } from "../../../db/config"
import { QueryResolvers } from "../graphql-types"
import humps from 'humps'
import { isItem, isItemArray } from "./types"

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
  },
  itemById: async (_root, { itemId }) => {
    if (!itemId) {
      throw new GraphQLError('Missing parameters')
    }

    const query = `
      SELECT *
      FROM items
      WHERE item_id = $1
    `
    const itemQuery = await pool.query(query, [itemId])
    const item = humps.camelizeKeys(itemQuery.rows[0])

    if (!isItem(item)) {
      throw new GraphQLError('Result is not of type Item')
    }

    return item
  },
  itemByName: async (_root, { name }) => {
    if (!name) {
      throw new GraphQLError('Missing parameters')
    }

    const query = `
      SELECT *
      FROM items
      WHERE name LIKE $1
    `
    const itemQuery = await pool.query(query, [`%${name}$`])
    const items = humps.camelizeKeys(itemQuery.rows)

    if (!isItemArray(items)) {
      throw new GraphQLError('Result is not of type ItemArray')
    }

    return items
  }
}

export default itemQueries