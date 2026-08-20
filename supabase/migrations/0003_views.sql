-- =============================================================================
-- Vistas de agregación
--
-- El panel NUNCA debe consultar `responses` directamente. Consulta estas
-- vistas, que hacen dos cosas que la interfaz no puede garantizar por sí sola:
--
--   1. Aplican una sola vez la conversión a índice 0–100, de modo que dos
--      pestañas no puedan discrepar. Este es el equivalente en SQL del motor
--      `app/results-engine.ts`, y debe mantenerse alineado con él.
--
--   2. Imponen un mínimo de respuestas antes de exponer cualquier resultado.
--      Con ~10 alumnos por grado-grupo, un desglose fino permitiría deducir
--      quién contestó qué. Hoy esa regla vive sólo en la interfaz, donde un
--      cambio descuidado la desactiva sin que nadie lo note.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Participación
-- Denominador: matrícula agregada. Numerador: sesiones completas.
-- -----------------------------------------------------------------------------
create or replace view v_participation as
select
  e.cycle_id,
  e.grade,
  e.group_name,
  e.student_count,
  count(s.id) filter (where s.is_complete) as response_count,
  case when e.student_count > 0
    then round((count(s.id) filter (where s.is_complete)) * 100.0 / e.student_count)::integer
    else 0 end as participation_rate
from enrollment e
left join response_sessions s
  on s.cycle_id = e.cycle_id and s.grade = e.grade and s.group_name = e.group_name
where is_staff()
group by e.cycle_id, e.grade, e.group_name, e.student_count;

-- -----------------------------------------------------------------------------
-- Resultados por reactivo docente (pestaña Matriz)
-- -----------------------------------------------------------------------------
create or replace view v_item_results as
select
  s.cycle_id,
  s.grade,
  s.group_name,
  i.id                                        as item_id,
  i.dimension,
  i.prompt,
  count(*)                                    as response_count,
  round(avg(r.value)::numeric, 2)             as average,
  to_index(avg(r.value)::numeric, i.scale_max) as index,
  reading_for(to_index(avg(r.value)::numeric, i.scale_max)) as level,
  count(*) filter (where r.value <= 3)        as favorable,
  count(*) filter (where r.value >= 5)        as critical
from responses r
join response_sessions s on s.id = r.session_id
join items i on i.id = r.item_id
where i.section = 'docente' and s.is_complete and is_staff()
group by s.cycle_id, s.grade, s.group_name, i.id, i.dimension, i.prompt, i.scale_max
having count(*) >= min_responses_threshold();

-- -----------------------------------------------------------------------------
-- Resultados por asignación docente (pestaña Docentes)
-- La unidad es la asignación, no la persona: un mismo docente con dos materias
-- recibe dos lecturas, que es como lo vive el alumnado.
-- -----------------------------------------------------------------------------
create or replace view v_teacher_results as
select
  s.cycle_id,
  ta.id                                       as assignment_id,
  t.full_name,
  t.initials,
  ta.subject,
  ta.grade,
  ta.group_name,
  count(distinct s.id)                        as respondents,
  count(*)                                    as answer_count,
  round(avg(r.value)::numeric, 2)             as average,
  to_index(avg(r.value)::numeric, 7)          as index,
  reading_for(to_index(avg(r.value)::numeric, 7)) as level,
  round(count(*) filter (where r.value <= 3) * 100.0 / count(*))::integer as favorable_pct,
  round(count(*) filter (where r.value >= 5) * 100.0 / count(*))::integer as critical_pct
from responses r
join response_sessions s on s.id = r.session_id
join teaching_assignments ta on ta.id = r.teaching_assignment_id
join teachers t on t.id = ta.teacher_id
where s.is_complete and is_staff()
group by s.cycle_id, ta.id, t.full_name, t.initials, ta.subject, ta.grade, ta.group_name
-- El umbral aquí cuenta ALUMNOS, no respuestas: 15 reactivos de un solo alumno
-- superarían un umbral basado en filas y expondrían su evaluación individual.
having count(distinct s.id) >= min_responses_threshold();

-- -----------------------------------------------------------------------------
-- Resultados por dimensión docente
-- -----------------------------------------------------------------------------
create or replace view v_dimension_results as
select
  s.cycle_id,
  s.grade,
  s.group_name,
  i.dimension,
  count(distinct i.id)                        as item_count,
  count(*)                                    as response_count,
  round(avg(r.value)::numeric, 2)             as average,
  to_index(avg(r.value)::numeric, 7)          as index,
  reading_for(to_index(avg(r.value)::numeric, 7)) as level
from responses r
join response_sessions s on s.id = r.session_id
join items i on i.id = r.item_id
where i.section = 'docente' and s.is_complete and is_staff()
group by s.cycle_id, s.grade, s.group_name, i.dimension
having count(*) >= min_responses_threshold();

-- -----------------------------------------------------------------------------
-- Áreas de apoyo, dirección y experiencia institucional
-- Escala de 4 puntos: favorable es "Sí, totalmente" o "Casi siempre".
-- -----------------------------------------------------------------------------
create or replace view v_support_results as
select
  s.cycle_id,
  s.grade,
  s.group_name,
  i.section,
  i.id                                        as item_id,
  i.label,
  i.prompt,
  count(*)                                    as response_count,
  round(avg(r.value)::numeric, 2)             as average,
  to_index(avg(r.value)::numeric, 4)          as index,
  reading_for(to_index(avg(r.value)::numeric, 4)) as level,
  round(count(*) filter (where r.value <= 2) * 100.0 / count(*))::integer as favorable_pct
from responses r
join response_sessions s on s.id = r.session_id
join items i on i.id = r.item_id
where i.section <> 'docente' and s.is_complete and is_staff()
group by s.cycle_id, s.grade, s.group_name, i.section, i.id, i.label, i.prompt
having count(*) >= min_responses_threshold();

-- -----------------------------------------------------------------------------
-- Comentarios publicables
-- Sólo salen los revisados. `pending` y `reserved` no se exponen nunca por esta
-- vía; los reservados se atienden por el circuito confidencial que corresponda.
-- -----------------------------------------------------------------------------
create or replace view v_published_comments as
select
  c.id,
  s.cycle_id,
  s.grade,
  s.group_name,
  c.scope,
  c.teaching_assignment_id,
  coalesce(c.published_body, c.body) as body,
  c.review_status,
  c.submitted_on
from comments c
join response_sessions s on s.id = c.session_id
where c.review_status in ('approved', 'redacted') and is_staff();
