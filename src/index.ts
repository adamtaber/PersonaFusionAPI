import { ApolloServer } from '@apollo/server'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import typeDefs from './graphql/schema'
import resolvers from './graphql/resolvers'
import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })


const app = express()
const httpServer = http.createServer(app)
const schema = makeExecutableSchema({ typeDefs, resolvers})
const port = process.env.PORT || 3000

const server = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
})

const startServer = async () => {
  await server.start()

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server)
  )

  httpServer.listen(port, () => 
  console.log(`server listening on port ${port}`))
}

startServer()