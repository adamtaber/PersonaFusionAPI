import { ApolloServer } from '@apollo/server'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { expressMiddleware } from '@apollo/server/express4';
import { startStandaloneServer } from '@apollo/server/standalone'
import { ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import typeDefs from './graphql/schema'
import resolvers from './graphql/resolvers'
import * as dotenv from 'dotenv'
import { seedItems, seedPersonas, seedSkills, seedSpecialPersonas, seedTraits, seedTreasureMods } from './db/seed';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })


const app = express()
const httpServer = http.createServer(app)
const schema = makeExecutableSchema({ typeDefs, resolvers})
const port = parseInt(process.env.PORT || '3000')

const server = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
})

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port }
  })
  console.log(`Server ready at ${url}`)
}

startServer()

// const seedData = async () => {
//   await seedSkills()
//   await seedItems()
//   await seedTraits()
//   await seedPersonas()
//   await seedSpecialPersonas()
//   await seedTreasureMods()
// }

// seedData()