export const seedSkillsQuery = `
  INSERT INTO skills (type, name, effect, cost)
  VALUES ($1, $2, $3, $4)
`
export const seedItemsQuery = `
  INSERT INTO items (type, name, description)
  VALUES ($1, $2, $3)
`

export const seedTraitsQuery = `
  INSERT INTO traits (name, description, category)
  VALUES ($1, $2, $3)
`

export const seedPersonasQuery = `
  INSERT INTO personas (
    name, 
    base_level, 
    special, 
    dlc, 
    treasure,
    inheritance_type,
    arcana, 
    background,
    fusion_quote,
    trait_id,
    normal_item_id, 
    fusion_alarm_item_id, 
    normal_skillcard_id, 
    fusion_alarm_skillcard_id
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING persona_id
`

export const findItemQuery = `
  SELECT item_id
  FROM items
  WHERE name = $1
`

export const findSkillQuery = `
  SELECT skill_id
  FROM skills
  WHERE name = $1
`

export const findTraitQuery = `
  SELECT trait_id
  FROM traits
  WHERE name = $1
`

export const seedPersonaSkillsQuery = `
  INSERT INTO persona_skills (level, persona_id, skill_id)
  VALUES ($1, $2, $3)
`

export const seedPersonaStatsQuery = `
  INSERT INTO persona_stats (
    persona_id, 
    strength,
    magic,
    endurance,
    agility,
    luck
  )
  VALUES ($1, $2, $3, $4, $5, $6)
`

export const seedPersonaAffinitiesQuery = `
  INSERT INTO persona_affinities (
    persona_id,
    phys,
    gun,
    fire,
    ice,
    elec,
    wind,
    psy,
    nuke,
    bless,
    curse
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
`