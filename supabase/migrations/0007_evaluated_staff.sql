-- =============================================================================
-- Personal evaluable y optativas
--
-- Dos cosas que el esquema inicial no representaba y que la aplicación real sí
-- necesita:
--
--   1. El equipo directivo y la red de apoyo son PERSONAS, no áreas. Las
--      respuestas se guardaban sin referencia a nadie, de modo que con varios
--      directivos —o con un tutor por grupo— todas se habrían sumado juntas sin
--      poder distinguir a quién correspondía cada una.
--
--   2. El inglés se cursa por nivel (Basic, Middle, Advance) y eso cruza los
--      grados, así que no cabe en el modelo grado+grupo. Seis de sus siete
--      docentes no aparecían en ningún grupo real y nadie llegaba a evaluarlos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Personal evaluable
-- Distinto de `staff`, que son las cuentas que entran al panel. Aquí va quien
-- es objeto de evaluación; puede no tener cuenta, y quien tiene cuenta puede no
-- ser evaluado.
-- -----------------------------------------------------------------------------
create table evaluated_staff (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  full_name   text not null,
  initials    text not null,
  title       text not null,
  role        text not null check (role in ('directivo', 'psicologia', 'enfermeria', 'tutoria')),
  -- 'escuela': lo evalúan todos los alumnos.
  -- 'grupo':   sólo los de su grado y grupo, como ocurre con la tutoría.
  scope       text not null check (scope in ('escuela', 'grupo')),
  grade       text,
  group_name  text,
  is_active   boolean not null default true,
  -- Un alcance de grupo sin grupo definido dejaría a esa persona fuera de toda
  -- evaluación sin que nadie lo note.
  constraint evaluated_staff_scope_ck check (
    (scope = 'grupo') = (grade is not null and group_name is not null)
  )
);

create index on evaluated_staff (role, scope);
create index on evaluated_staff (grade, group_name);

alter table evaluated_staff enable row level security;

-- El test necesita saber a quién le toca evaluar a cada alumno antes de que
-- exista sesión, igual que con el catálogo docente.
create policy "catalogo de personal legible" on evaluated_staff
  for select using (is_active);

create policy "direccion administra personal evaluable" on evaluated_staff
  for all using (staff_role() in ('direccion', 'coordinacion'))
  with check (staff_role() in ('direccion', 'coordinacion'));

-- -----------------------------------------------------------------------------
-- Vínculo desde las respuestas
-- -----------------------------------------------------------------------------
alter table responses
  add column evaluated_staff_id uuid references evaluated_staff(id) on delete cascade;

create index on responses (evaluated_staff_id);

-- La restricción anterior sólo contemplaba docentes. Ahora cada respuesta
-- apunta a un docente, a una persona del personal, o a nadie en el caso de los
-- reactivos institucionales, pero nunca a dos a la vez.
alter table responses drop constraint responses_teacher_scope_ck;

alter table responses add constraint responses_target_ck check (
  num_nonnulls(teaching_assignment_id, evaluated_staff_id) <= 1
);

drop index responses_unique_idx;

create unique index responses_unique_idx on responses (
  session_id,
  item_id,
  coalesce(teaching_assignment_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(evaluated_staff_id,     '00000000-0000-0000-0000-000000000000'::uuid)
);

-- -----------------------------------------------------------------------------
-- Optativas
-- Una asignación de optativa no pertenece a un grupo sino a un nivel, así que
-- grade y group_name dejan de ser obligatorios cuando hay `elective_stream`.
-- -----------------------------------------------------------------------------
alter table teaching_assignments add column elective_stream text;

alter table teaching_assignments alter column grade drop not null;
alter table teaching_assignments alter column group_name drop not null;

alter table teaching_assignments add constraint teaching_assignments_scope_ck check (
  (elective_stream is not null and grade is null and group_name is null)
  or (elective_stream is null and grade is not null and group_name is not null)
);

create index on teaching_assignments (cycle_id, elective_stream);

-- El alumno indica qué nivel de inglés cursa, y eso queda en su sesión: es lo
-- que permite saber qué docente de optativa le tocaba evaluar.
alter table response_sessions add column elective_stream text;

-- -----------------------------------------------------------------------------
-- Validación
-- El disparador anterior exigía asignación docente para 'q%' y la prohibía en el
-- resto. Ahora los reactivos de dirección y apoyo apuntan a una persona.
-- -----------------------------------------------------------------------------
create or replace function validate_response_value()
returns trigger language plpgsql as $$
declare
  item_scale   smallint;
  item_section text;
begin
  select scale_max, section into item_scale, item_section
  from items where id = new.item_id;

  if item_scale is null then
    raise exception 'Reactivo desconocido: %', new.item_id;
  end if;

  if new.value < 1 or new.value > item_scale then
    raise exception 'El reactivo % admite valores de 1 a %, se recibió %',
      new.item_id, item_scale, new.value;
  end if;

  if item_section = 'docente' then
    if new.teaching_assignment_id is null then
      raise exception 'El reactivo docente % requiere una asignación', new.item_id;
    end if;
  elsif item_section = 'institucional' then
    if new.teaching_assignment_id is not null or new.evaluated_staff_id is not null then
      raise exception 'El reactivo institucional % no se dirige a una persona', new.item_id;
    end if;
  else
    -- dirección, psicología, enfermería y tutoría
    if new.evaluated_staff_id is null then
      raise exception 'El reactivo % requiere indicar a quién se evalúa', new.item_id;
    end if;
  end if;

  return new;
end;
$$;

-- El alcance de la persona evaluada también debe corresponder al alumno: una
-- sesión de 1.º A no puede evaluar al tutor de 3.º C.
create or replace function validate_staff_scope()
returns trigger language plpgsql as $$
declare
  session_grade text;
  session_group text;
  target        evaluated_staff%rowtype;
begin
  if new.evaluated_staff_id is null then
    return new;
  end if;

  select grade, group_name into session_grade, session_group
  from response_sessions where id = new.session_id;

  select * into target from evaluated_staff where id = new.evaluated_staff_id;

  if target.scope = 'grupo'
     and (target.grade is distinct from session_grade or target.group_name is distinct from session_group) then
    raise exception '% atiende a otro grupo y no corresponde a esta sesión', target.full_name;
  end if;

  return new;
end;
$$;

create trigger responses_validate_staff_scope
  before insert or update on responses
  for each row execute function validate_staff_scope();

-- -----------------------------------------------------------------------------
-- Resultados por persona
-- Sustituye a la lectura por área: con varias personas en un mismo rol, sumarlas
-- produciría un promedio que no describe a ninguna.
-- -----------------------------------------------------------------------------
create or replace view v_staff_results as
select
  s.cycle_id,
  es.id                                       as staff_id,
  es.full_name,
  es.initials,
  es.title,
  es.role,
  es.scope,
  es.grade,
  es.group_name,
  count(distinct s.id)                        as respondents,
  count(*)                                    as answer_count,
  round(avg(r.value)::numeric, 2)             as average,
  to_index(avg(r.value)::numeric, 4)          as index,
  reading_for(to_index(avg(r.value)::numeric, 4)) as level,
  round(count(*) filter (where r.value <= 2) * 100.0 / count(*))::integer as favorable_pct
from responses r
join response_sessions s on s.id = r.session_id
join evaluated_staff es on es.id = r.evaluated_staff_id
where s.is_complete and is_staff()
group by s.cycle_id, es.id, es.full_name, es.initials, es.title, es.role, es.scope, es.grade, es.group_name
-- Cuenta alumnos y no filas: tres reactivos de un solo alumno superarían un
-- umbral por filas y expondrían su evaluación individual.
having count(distinct s.id) >= min_responses_threshold();

revoke all on v_staff_results from anon;
grant select on v_staff_results to authenticated;
