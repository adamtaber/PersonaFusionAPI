export const getPersonasQuery = (where: string, order: string, limit: string) => {
  return `
    SELECT p.*,
      array_agg(
        json_build_object('level', ps.level, 'skill', 
          json_build_object('cost', s.cost, 'effect', s.effect,
            'name', s.name, 'skill_id', s.skill_id, 'type',
            s.type
          )
        )
      ) as skills,
      json_build_object(
        'cost', s_normal.cost, 'effect', s_normal.effect, 'name',
        s_normal.name, 'skill_id', s_normal.skill_id, 'type', 
        s_normal.type
      ) as normal_skill_card, 
      json_build_object(
        'cost', s_fusion.cost, 'effect', s_fusion.effect, 'name',
        s_fusion.name, 'skill_id', s_fusion.skill_id, 'type', 
        s_fusion.type
      ) as fusion_alarm_skill_card, 
      json_build_object(
        'name', i_normal.name, 'description', i_normal.description,
        'item_id', i_normal.item_id
      ) as normal_item,
      json_build_object(
        'name', i_fusion.name, 'description', i_fusion.description,
        'item_id', i_fusion.item_id
      ) as fusion_alarm_item
    FROM personas p
    LEFT JOIN persona_skills ps
      ON ps.persona_id = p.persona_id
    LEFT JOIN items i_normal
      ON p.normal_item_id = i_normal.item_id
    LEFT JOIN items i_fusion
      ON p.fusion_alarm_item_id = i_fusion.item_id
    LEFT JOIN skills s
      ON ps.skill_id = s.skill_id
    LEFT JOIN skills s_normal
      ON p.normal_skillcard_id = s_normal.skill_id
    LEFT JOIN skills s_fusion
      ON p.fusion_alarm_skillcard_id = s_fusion.skill_id
    ${where}
    GROUP BY p.persona_id, s_normal.skill_id, i_normal.item_id,
      s_fusion.skill_id, i_fusion.item_id
    ${order}
    ${limit}
  `
}