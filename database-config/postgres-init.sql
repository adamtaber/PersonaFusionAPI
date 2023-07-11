CREATE TABLE personas (
  persona_id serial NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  special BOOLEAN NOT NULL,
  inheritance_type TEXT NOT NULL,
  stats INTEGER [] NOT NULL,
  elementals TEXT [] NOT NULL,
  skills json NOT NULL,
  normal_item_id uuid,
  fusion_alarm_item_id uuid,
  FOREIGN_KEY (normal_item_id) REFERENCES items (item_id),
  FOREIGN_KEY (fusion_alarm_item_id) REFERENCES items (item_id)
);

CREATE TABLE items (
  item_id serial NOT NULL PRIMARY KEY,
  fusion_type TEXT NOT NULL,
  item_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE skills (
  skill_id serial NOT NULL PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  effect TEXT NOT NULL,
  cost INTEGER
)