import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs } from '@graphql-tools/merge'

const typesArray = loadFilesSync(`${__dirname}`, { ignoreIndex: true })
const typeDefs = mergeTypeDefs(typesArray)

export default typeDefs