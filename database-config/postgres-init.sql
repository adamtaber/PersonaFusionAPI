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

CREATE TABLE personas (
  persona_id SERIAL NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  base_level INTEGER NOT NULL,
  arcana TEXT,
  special BOOLEAN NOT NULL,
  dlc BOOLEAN NOT NULL,
  inheritance_type TEXT,
  stats INTEGER [] NOT NULL,
  elementals TEXT [] NOT NULL,
  skills JSON,
  normal_item_id INT,
  fusion_alarm_item_id INT,
  normal_skillcard_id INT,
  fusion_alarm_skillcard_id INT,
  FOREIGN KEY (normal_item_id) REFERENCES items (item_id),
  FOREIGN KEY (fusion_alarm_item_id) REFERENCES items (item_id),
  FOREIGN KEY (normal_skillcard_id) REFERENCES skills (skill_id),
  FOREIGN KEY (fusion_alarm_skillcard_id) REFERENCES skills (skill_id)
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
  fusion_ids INT [] NOT NULL
  FOREIGN KEY (persona_id) REFERENCES personas (persona_id)
)

