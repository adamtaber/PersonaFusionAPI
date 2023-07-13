import { p5rPersonas } from "../../seed-data/p5rPersonas"
import { p5rSkills } from "../../seed-data/p5rSkills"
import { pool } from "./config"

export const seedSkills = async () => {
  const skillInputQuery = `
    INSERT INTO skills (type, name, effect, cost)
    VALUES ($1, $2, $3, $4)
  `

  const skillArr = Object.entries(p5rSkills)
  skillArr.forEach(async (skill) => {
    const name = skill[0]
    const type = skill[1].element
    const effect = skill[1].effect
    const cost = skill[1].cost
    const values = [type, name, effect, cost]

    await pool.query(skillInputQuery, values)
  })
}

interface skillObj {
  [key: string]: number
}

export const seedPersonas = async () => {
  const personaInputQuery = `
    INSERT INTO personas (name, base_level, special, inheritance_type,
      stats, elementals, skills)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `

  const skillQuery = `
    SELECT skill_id
    FROM skills
    WHERE name = $1
  `

  const personaArr = Object.entries(p5rPersonas)
  personaArr.forEach(async (persona) => {
    const name = persona[0]
    const baseLevel = persona[1].level
    const special = persona[1].special ?? false
    const inheritanceType = persona[1].inherits
    const stats = persona[1].stats
    const elementals = persona[1].elems

    const skillObj: skillObj = {}
    
    const skillArr = Object.entries(persona[1].skills)
    // skillArr.forEach(async (skill) => {
    //   const skillIdQuery = await pool.query(skillQuery, [skill[0]])
    //   const skillId = skillIdQuery.rows[0].skill_id
    //   skillObj[skillId] = skill[1]
    //   console.log(skillId)
    // })

    for (let i = 0; i < skillArr.length; i++) {
      const skill = skillArr[i]
      const skillIdQuery = await pool.query(skillQuery, [skill[0]])
      const skillId = skillIdQuery.rows[0].skill_id
      skillObj[skillId] = skill[1]
    }
    const skills = JSON.stringify(skillObj)
    const values = [name, baseLevel, special, inheritanceType,
      stats, elementals, skills]

    await pool.query(personaInputQuery, values)
  })
}



