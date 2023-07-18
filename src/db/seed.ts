import { p5rItems } from "../../seed-data/p5rItems"
import { p5rPersonas } from "../../seed-data/p5rPersonas"
import { p5rSkills } from "../../seed-data/p5rSkills"
import { p5rSpecials } from "../../seed-data/p5rSpecials"
import { itemQueries } from "../graphql/resolvers/items"
import { pool } from "./config"
import { treasureCombos, treasureDemons } from "./treasureCombos"

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
    INSERT INTO personas (name, base_level, special, dlc, treasure,
      inheritance_type,
      stats, elementals, arcana, normal_item_id, fusion_alarm_item_id, 
      normal_skillcard_id, fusion_alarm_skillcard_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
    const dlc = persona[1].dlc ?? false
    const treasure = persona[1].rare ?? false
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

    const values = [name, baseLevel, special, dlc, treasure, inheritanceType,
      stats, elementals, arcana, itemId, fusionAlarmItemId, skillCardId,
      fusionAlarmSkillCardId]

    const newPersona = await pool.query(personaInputQuery, values)
    const personaId = newPersona.rows[0].persona_id
    console.log(personaId)
    
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

export const seedSpecialPersonas = async () => {
  const specialPersonaInputQuery = `
    INSERT INTO special_personas (persona_id, fusion_ids)
    VALUES ($1, $2)
  `

  for(let i = 0; i < p5rSpecials.length; i++) {
    const specialPersona = p5rSpecials[i]

    const personaQuery = `
      SELECT persona_id
      FROM personas
      WHERE name = $1
    `
    const personaIdQuery = 
      await pool.query(personaQuery, [specialPersona.result])
    const personaId = personaIdQuery.rows[0].persona_id

    const fusionPersonasQuery = `
      SELECT persona_id
      FROM personas p
      WHERE p.name = ANY ($1)
    `
    const fusionIdQuery = 
      await pool.query(fusionPersonasQuery, [specialPersona.sources])
    const fusionIds = fusionIdQuery.rows

    const idArr = fusionIds.map(id => id.persona_id)

    await pool.query(specialPersonaInputQuery, [personaId, idArr])
  }
}

export const seedTreasureMods = async () => {
  const treasureModInputQuery = `
    INSERT INTO treasure_modifiers (
      persona_id, fool_mod, magician_mod,
      priestess_mod, empress_mod, emperor_mod,
      hierophant_mod, lovers_mod, chariot_mod,
      justice_mod, hermit_mod, fortune_mod,
      strength_mod, hanged_mod, death_mod,
      temperance_mod, devil_mod, tower_mod,
      star_mod, moon_mod, sun_mod, judgement_mod,
      faith_mod, councillor_mod, world_mod
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
      $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
      $23, $24, $25
    )
  `

  const personaQuery = `
    SELECT persona_id
    FROM personas
    WHERE name = $1
  `

  for (let i = 0; i < treasureDemons.length; i++) {
    const treasureName = treasureDemons[i]
    const personaIdQuery = await pool.query(personaQuery, [treasureName])
    const personaId = personaIdQuery.rows[0].persona_id

    await pool.query(treasureModInputQuery, [
      personaId, treasureCombos["Fool"][i], treasureCombos["Magician"][i], 
      treasureCombos["Priestess"][i], treasureCombos["Empress"][i],
      treasureCombos["Emperor"][i], treasureCombos["Hierophant"][i], 
      treasureCombos["Lovers"][i], treasureCombos["Chariot"][i],
      treasureCombos["Justice"][i], treasureCombos["Hermit"][i],
      treasureCombos["Fortune"][i], treasureCombos["Strength"][i],
      treasureCombos["Hanged"][i], treasureCombos["Death"][i],
      treasureCombos["Temperance"][i], treasureCombos["Devil"][i],
      treasureCombos["Tower"][i], treasureCombos["Star"][i],
      treasureCombos["Moon"][i], treasureCombos["Sun"][i],
      treasureCombos["Judgement"][i], treasureCombos["Faith"][i],
      treasureCombos["Councillor"][i], treasureCombos["World"][i]
    ])
  }
}


