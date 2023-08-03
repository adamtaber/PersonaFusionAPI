CREATE EXTENSION unaccent;

CREATE TABLE items (
  item_id SERIAL NOT NULL PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE skills (
  skill_id SERIAL NOT NULL PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  effect TEXT NOT NULL,
  cost INTEGER
);

CREATE TABLE traits (
  trait_id SERIAL NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE personas (
  persona_id SERIAL NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  base_level INTEGER NOT NULL,
  arcana TEXT,
  special BOOLEAN NOT NULL,
  dlc BOOLEAN NOT NULL,
  treasure BOOLEAN NOT NULL,
  inheritance_type TEXT,
  background TEXT NOT NULL,
  fusion_quote TEXT,
  trait_id INT,
  normal_item_id INT,
  fusion_alarm_item_id INT,
  normal_skillcard_id INT,
  fusion_alarm_skillcard_id INT,
  FOREIGN KEY (trait_id) REFERENCES traits (trait_id),
  FOREIGN KEY (normal_item_id) REFERENCES items (item_id),
  FOREIGN KEY (fusion_alarm_item_id) REFERENCES items (item_id),
  FOREIGN KEY (normal_skillcard_id) REFERENCES skills (skill_id),
  FOREIGN KEY (fusion_alarm_skillcard_id) REFERENCES skills (skill_id)
);

CREATE TABLE treasure_traits (
  treasure_trait_id SERIAL NOT NULL PRIMARY KEY,
  persona_id INTEGER NOT NULL,
  trait_id INTEGER NOT NULL,
  FOREIGN KEY (persona_id) REFERENCES personas (persona_id),
  FOREIGN KEY (trait_id) REFERENCES traits (trait_id)
);

CREATE TABLE persona_affinities (
  persona_affinities_id SERIAL NOT NULL PRIMARY KEY,
  persona_id INTEGER NOT NULL,
  phys TEXT NOT NULL,
  gun TEXT NOT NULL,
  fire TEXT NOT NULL,
  ice TEXT NOT NULL,
  elec TEXT NOT NULL,
  wind TEXT NOT NULL,
  psy TEXT NOT NULL,
  nuke TEXT NOT NULL,
  bless TEXT NOT NULL,
  curse TEXT NOT NULL,
  FOREIGN KEY (persona_id) REFERENCES personas (persona_id)
);

CREATE TABLE persona_stats (
  persona_stats_id SERIAL NOT NULL PRIMARY KEY,
  persona_id INTEGER NOT NULL,
  strength INTEGER NOT NULL,
  magic INTEGER NOT NULL,
  endurance INTEGER NOT NULL,
  agility INTEGER NOT NULL,
  luck INTEGER NOT NULL,
  FOREIGN KEY (persona_id) REFERENCES personas (persona_id)
);

CREATE TABLE persona_skills (
  persona_skill_id SERIAL NOT NULL PRIMARY KEY,
  level INTEGER NOT NULL,
  persona_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  FOREIGN KEY (persona_id) REFERENCES personas (persona_id),
  FOREIGN KEY (skill_id) REFERENCES skills (skill_id)
);

CREATE TABLE special_personas (
  special_persona_id SERIAL NOT NULL PRIMARY KEY,
  persona_id INT NOT NULL,
  fusion_ids INT [] NOT NULL,
  FOREIGN KEY (persona_id) REFERENCES personas (persona_id)
);

CREATE TABLE treasure_modifiers (
  treasure_modifier_id SERIAL NOT NULL PRIMARY KEY,
  persona_id INT NOT NULL,
  fool_mod INT NOT NULL,
  magician_mod INT NOT NULL,
  priestess_mod INT NOT NULL,
  empress_mod INT NOT NULL,
  emperor_mod INT NOT NULL,
  hierophant_mod INT NOT NULL,
  lovers_mod INT NOT NULL,
  chariot_mod INT NOT NULL,
  justice_mod INT NOT NULL,
  hermit_mod INT NOT NULL,
  fortune_mod INT NOT NULL,
  strength_mod INT NOT NULL,
  hanged_mod INT NOT NULL,
  death_mod INT NOT NULL,
  temperance_mod INT NOT NULL,
  devil_mod INT NOT NULL,
  tower_mod INT NOT NULL,
  star_mod INT NOT NULL,
  moon_mod INT NOT NULL,
  sun_mod INT NOT NULL,
  judgement_mod INT NOT NULL,
  faith_mod INT NOT NULL,
  councillor_mod INT NOT NULL,
  world_mod INT NOT NULL,
  FOREIGN KEY (persona_id) REFERENCES personas (persona_id)
);

