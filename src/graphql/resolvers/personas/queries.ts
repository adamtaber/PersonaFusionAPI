import { GraphQLError } from "graphql";
import { pool } from "../../../db/config";
import { QueryResolvers } from "../graphql-types";
import humps from 'humps'
import { isPersonaArray } from "./types";

const personaQueries: QueryResolvers = {
  allPersonas: async () => {
    const query = `
      SELECT p.*,
        array_agg(
          json_build_object('level', ps.level, 'skill', 
            json_build_object('cost', s.cost, 'effect', s.effect,
              'name', s.name, 'skill_id', s.skill_id, 'type',
              s.type
            )
          )
        ) as skills
      FROM personas p
      JOIN persona_skills ps
        ON ps.persona_id = p.persona_id
      JOIN skills s
        ON ps.skill_id = s.skill_id
      GROUP BY p.persona_id
      ORDER BY p.persona_id
    `
    const allPersonasQuery = await pool.query(query)
    const personas = humps.camelizeKeys(allPersonasQuery.rows)

    console.log(personas)

    if(Array.isArray(personas)) console.log(personas[0].skills2, personas.length)

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