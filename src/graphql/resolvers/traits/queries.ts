import { pool } from "../../../db/config"
import { QueryResolvers } from "../graphql-types"
import humps from 'humps'
import { isTraitArray } from "./types"
import { GraphQLError } from "graphql"

const traitQueries: QueryResolvers = {
  allTraits: async () => {
    const query = `
      SELECT * 
      FROM traits
    `

    const getTraitsQuery = await pool.query(query)
    const traits = humps.camelizeKeys(getTraitsQuery.rows)

    if (!isTraitArray(traits)) {
      throw new GraphQLError('Result not of type TraitArray')
    }

    return traits
  }
}

export default traitQueries