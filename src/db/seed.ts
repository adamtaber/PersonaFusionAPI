import { p5rItems } from "../../seed-data/p5rItems"
import { p5rPersonas } from "../../seed-data/p5rPersonas"
import { p5rSkills } from "../../seed-data/p5rSkills"
import { itemQueries } from "../graphql/resolvers/items"
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

export const seedItems = async () => {
  const itemInputQuery = `
    INSERT INTO items (type, name, description)
    VALUES ($1, $2, $3)
  `

  const itemArr = Object.entries(p5rItems)
  itemArr.forEach(async (item) => {
    const name = item[0]
    const type = item[1].type
    const description = item[1].description
    const values = [type, name, description]

    await pool.query(itemInputQuery, values)
  })
}

export const seedPersonas = async () => {
  const personaInputQuery = `
    INSERT INTO personas (name, base_level, special, inheritance_type,
      stats, elementals, arcana, normal_item_id, fusion_alarm_item_id, 
      normal_skillcard_id, fusion_alarm_skillcard_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING persona_id
  `

  const itemQuery = `
    SELECT item_id
    FROM items
    WHERE name = $1
  `

  const skillQuery = `
    SELECT skill_id
    FROM skills
    WHERE name = $1
  `

  const personaSkillInputQuery = `
    INSERT INTO persona_skills (level, persona_id, skill_id)
    VALUES ($1, $2, $3)
  `

  const personaArr = Object.entries(p5rPersonas)
  // personaArr.forEach(async (persona) => {
  for (let i = 0; i < personaArr.length; i++) {
    const persona = personaArr[i]

    const name = persona[0]
    const baseLevel = persona[1].level
    const special = persona[1].special ?? false
    const inheritanceType = persona[1].inherits
    const stats = persona[1].stats
    const elementals = persona[1].elems
    const arcana = persona[1].arcana
    const skillCardQuery = persona[1].skillCard
      ? await pool.query(skillQuery, [persona[1].item])
      : null
    const fusionAlarmSkillCardQuery = persona[1].skillCard
      ? await pool.query(skillQuery, [persona[1].itemr])
      : null
    const normalItemQuery = !persona[1].skillCard
      ? await pool.query(itemQuery, [persona[1].item])
      : null
    const fusionAlarmItemQuery = !persona[1].skillCard
      ? await pool.query(itemQuery, [persona[1].itemr])
      : null
    const skillCardId = skillCardQuery ? skillCardQuery.rows[0].skill_id : null
    const fusionAlarmSkillCardId = fusionAlarmSkillCardQuery
      ? fusionAlarmSkillCardQuery.rows[0].skill_id
      : null
    const itemId = normalItemQuery ? normalItemQuery.rows[0].item_id : null
    const fusionAlarmItemId = fusionAlarmItemQuery 
      ? fusionAlarmItemQuery.rows[0].item_id
      : null

    const values = [name, baseLevel, special, inheritanceType,
      stats, elementals, arcana, itemId, fusionAlarmItemId, skillCardId,
      fusionAlarmSkillCardId]

    const newPersona = await pool.query(personaInputQuery, values)
    const personaId = newPersona.rows[0].persona_id
    
    const skillArr = Object.entries(persona[1].skills)

    for (let i = 0; i < skillArr.length; i++) {
      const skill = skillArr[i]
      const skillIdQuery = await pool.query(skillQuery, [skill[0]])
      const skillId = skillIdQuery.rows[0].skill_id
      const skillLvl = skill[1]
      const values = [skillLvl, personaId, skillId]
      await pool.query(personaSkillInputQuery, values)
    }
  }
}



