import { p5rItems } from "../../seed-data/p5rItems"
import { p5rPersonas } from "../../seed-data/p5rPersonas"
import { p5rSkills } from "../../seed-data/p5rSkills"
import { p5rSpecials } from "../../seed-data/p5rSpecials"
import { p5rTraits } from "../../seed-data/p5rTraits"
import { itemQueries } from "../graphql/resolvers/items"
import { pool } from "./config"
import { findItemQuery, findSkillQuery, findTraitQuery, seedItemsQuery, seedPersonaAffinitiesQuery, seedPersonaSkillsQuery, seedPersonaStatsQuery, seedPersonasQuery, seedSkillsQuery, seedTraitsQuery, seedTreasureTraitsQuery } from "./seedQueries"
import { treasureCombos, treasureDemons } from "./treasureCombos"

export const seedSkills = async () => {
  const skillArr = Object.entries(p5rSkills)

  for (let i = 0; i < skillArr.length; i++) {
    const skill = skillArr[i]

    if (skill[1].element === "trait") continue

    const name = skill[0]
    const type = skill[1].element
    const effect = skill[1].effect
    const cost = skill[1].cost
    const values = [type, name, effect, cost]

    await pool.query(seedSkillsQuery, values)
  }
}

export const seedItems = async () => {
  const itemArr = Object.entries(p5rItems)

  for (let i = 0; i < itemArr.length; i++) {
    const item = itemArr[i]

    const name = item[0]
    const type = item[1].type
    const description = item[1].description
    const values = [type, name, description]

    await pool.query(seedItemsQuery, values)
  }
}

export const seedTraits = async () => {
  const traitArr = Object.entries(p5rTraits)

  for (let i = 0; i < traitArr.length; i++) {
    const trait = traitArr[i]

    const name = trait[0]
    const description = trait[1].description
    const category = trait[1].category

    const values = [name, description, category]

    await pool.query(seedTraitsQuery, values)
  }
}

const seedPersonaSkills = async (
  skills: [string, number][],
  personaId: number
) => {
  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i]
    const skillIdQuery = await pool.query(findSkillQuery, [skill[0]])
    const skillId = skillIdQuery.rows[0].skill_id
    const skillLvl = skill[1]
    const values = [skillLvl, personaId, skillId]
    await pool.query(seedPersonaSkillsQuery, values)
  }
}

const seedPersonaStats = async (stats: number[], personaId: number) => {
  const strength = stats[0]
  const magic = stats[1]
  const endurance = stats[2]
  const agility = stats[3]
  const luck = stats[4]

  const values = [personaId, strength, magic, endurance, agility, luck]

  await pool.query(seedPersonaStatsQuery, values)
}

const seedPersonaAffinities = async (
  affinities: string[], 
  personaId: number
) => {
  const phys = affinities[0]
  const gun = affinities[1]
  const fire = affinities[2]
  const ice = affinities[3]
  const elec = affinities[4]
  const wind = affinities[5]
  const psy = affinities[6]
  const nuke = affinities[7]
  const bless = affinities[8]
  const curse = affinities[9]

  const values = [
    personaId, phys, gun, fire, ice, elec, wind, psy, nuke,
    bless, curse
  ]

  await pool.query(seedPersonaAffinitiesQuery, values)
}

const seedTreasureTraits = async (treasureTraits: string[], personaId: number) => {
  for (let i = 0; i < treasureTraits.length; i++ ) {
    const trait = treasureTraits[i]
    const traitQuery = await pool.query(findTraitQuery, [trait])
    const traitId =  traitQuery?.rows[0].trait_id ?? null
    
    await pool.query(seedTreasureTraitsQuery, [personaId, traitId])
  }
}

export const seedPersonas = async () => {
  const personaArr = Object.entries(p5rPersonas)

  for (let i = 0; i < personaArr.length; i++) {
    const persona = personaArr[i]
    const name = persona[0]
    const baseLevel = persona[1].level
    const special = persona[1].special ?? false
    const dlc = persona[1].dlc ?? false
    const treasure = persona[1].rare ?? false
    const inheritanceType = persona[1].inherits
    const arcana = persona[1].arcana
    const background = persona[1].background
    const fusionQuote = persona[1].fusionQuote ?? null
    const traitQuery = persona[1].trait
      ? await pool.query(findTraitQuery, [persona[1].trait])
      : null
    const skillCardQuery = persona[1].skillCard
      ? await pool.query(findSkillQuery, [persona[1].item])
      : null
    const fusionAlarmSkillCardQuery = persona[1].skillCard
      ? await pool.query(findSkillQuery, [persona[1].itemr])
      : null
    const normalItemQuery = !persona[1].skillCard
      ? await pool.query(findItemQuery, [persona[1].item])
      : null
    const fusionAlarmItemQuery = !persona[1].skillCard
      ? await pool.query(findItemQuery, [persona[1].itemr])
      : null
    const trait = traitQuery?.rows[0].trait_id ?? null
    const skillCardId = skillCardQuery?.rows[0].skill_id ?? null
    const fusionAlarmSkillCardId = 
      fusionAlarmSkillCardQuery?.rows[0].skill_id ?? null
    const itemId = normalItemQuery?.rows[0].item_id ?? null
    const fusionAlarmItemId = 
      fusionAlarmItemQuery?.rows[0].item_id ?? null

    const values = [
      name, baseLevel, special, dlc, treasure, inheritanceType,
      arcana, background, fusionQuote, trait, itemId, fusionAlarmItemId, skillCardId,
      fusionAlarmSkillCardId
    ]

    const newPersona = await pool.query(seedPersonasQuery, values)
    const personaId = newPersona.rows[0].persona_id
    
    const skillArr = Object.entries(persona[1].skills)

    seedPersonaSkills(skillArr, personaId)
    seedPersonaStats(persona[1].stats, personaId)
    seedPersonaAffinities(persona[1].elems, personaId)
    if (persona[1].treasureTraits) {
      seedTreasureTraits(persona[1].treasureTraits, personaId)
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


