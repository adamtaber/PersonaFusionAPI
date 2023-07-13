import { itemQueries } from "./items"
import { personaQueries } from "./personas"
import { skillQueries } from "./skills"

const resolvers = {
    Query: {
        ...personaQueries,
        ...itemQueries,
        ...skillQueries
    }
}

export default resolvers