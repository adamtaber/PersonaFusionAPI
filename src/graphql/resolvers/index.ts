import { itemQueries } from "./items"
import { personaQueries } from "./personas"
import { skillQueries } from "./skills"
import { traitQueries } from "./traits"

const resolvers = {
    Query: {
        ...personaQueries,
        ...itemQueries,
        ...skillQueries,
        ...traitQueries
    }
}

export default resolvers