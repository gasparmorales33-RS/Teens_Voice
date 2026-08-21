-- ###########################################################################
-- IMAA Teens Voice · Instalación completa de la base de datos
--
-- Generado por scripts/build-setup-sql.mjs · NO editar a mano.
-- Contiene 7 migraciones concatenadas en orden de dependencia.
--
-- CÓMO USARLO
--   1. Supabase → SQL Editor → New query
--   2. Pegar TODO este archivo
--   3. Run
--
-- Debe terminar con "Success. No rows returned".
--
-- SE EJECUTA UNA SOLA VEZ. Las tablas se crean sin "if not exists" a
-- propósito: si vuelves a ejecutarlo sobre una base ya instalada, fallará en la
-- primera tabla en lugar de alterar en silencio algo que ya funcionaba.
--
-- Después de esto hay que correr 02-catalogos.sql para sembrar el instrumento
-- y los catálogos.
-- ###########################################################################


-- ═══════════════════════════════════════════════════════════════════════════
-- 0001_core.sql
-- origen: supabase/migrations/0001_core.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- =============================================================================
-- IMAA Teens Voice · Esquema base
--
-- Principio rector: la aplicación promete al alumnado "100 % anónimo. No
-- pediremos tu nombre, matrícula ni correo". El esquema debe hacer que esa
-- promesa sea imposible de romper por accidente, no sólo una intención.
--
-- De ahí tres decisiones que conviene no revertir sin pensarlo:
--
--   1. No existe tabla de alumnos. La matrícula se guarda AGREGADA por
--      grado y grupo (`enrollment`), que es todo lo que necesita el cálculo
--      de participación.
--
--   2. `response_sessions` guarda FECHA, no marca de tiempo. Con ~10 alumnos
--      por grupo, un `timestamptz` permitiría correlacionar quién estaba
--      respondiendo a esa hora con la respuesta que entró en ese instante.
--
--   3. Ninguna tabla enlaza una respuesta con quien la emitió. El control de
--      duplicados (0005_tokens.sql) vive en una tabla que deliberadamente NO
--      tiene relación con `response_sessions`.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Ciclos escolares
-- -----------------------------------------------------------------------------
create table cycles (
  id          text primary key,               -- '2026-2027'
  label       text not null,                  -- '2026–2027'
  starts_on   date,
  ends_on     date,
  -- Sólo un ciclo abierto acepta respuestas. Lo aplica una política RLS.
  is_open     boolean not null default false
);

-- -----------------------------------------------------------------------------
-- Catálogo docente
-- Hoy vive en app/teacher-catalog.ts. Un docente puede impartir varias materias
-- en varios grupos, de modo que la unidad evaluable es la ASIGNACIÓN, no la
-- persona: en el catálogo actual "Eli Andres Lopez Gonzalez" aparece dos veces,
-- con Formación Cívica y con Geografía, y son evaluaciones distintas.
-- -----------------------------------------------------------------------------
create table teachers (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  full_name   text not null,
  initials    text not null,
  is_active   boolean not null default true
);

create table teaching_assignments (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references teachers(id) on delete cascade,
  cycle_id    text not null references cycles(id) on delete cascade,
  subject     text not null,
  school_level text not null check (school_level in ('Secundaria', 'Preparatoria')),
  grade       text not null,
  group_name  text not null,
  unique (teacher_id, cycle_id, subject, grade, group_name)
);

create index on teaching_assignments (cycle_id, grade, group_name);

-- -----------------------------------------------------------------------------
-- Matrícula agregada
-- No hay registro por alumno: sólo cuántos hay en cada grupo, que es el
-- denominador de la participación. Antes este número se tecleaba a mano en el
-- panel y movía todos los porcentajes.
-- -----------------------------------------------------------------------------
create table enrollment (
  cycle_id      text not null references cycles(id) on delete cascade,
  grade         text not null,
  group_name    text not null,
  student_count integer not null check (student_count >= 0),
  updated_at    timestamptz not null default now(),
  primary key (cycle_id, grade, group_name)
);

-- -----------------------------------------------------------------------------
-- Instrumento
-- El test usa DOS escalas y mezclarlas produce promedios sin sentido, así que
-- cada reactivo declara la suya y en qué dirección es mejor.
--   · Docentes: 7 puntos, 1 = Excelente  (lower_is_better = true)
--   · Directivos, red de apoyo, experiencia IMMA: 4 puntos, 1 = Sí, totalmente
-- -----------------------------------------------------------------------------
create table items (
  id               text primary key,          -- 'q01', 'director_listens', 'imma_safe'
  section          text not null check (section in
                     ('docente', 'direccion', 'psicologia', 'enfermeria', 'tutoria', 'institucional')),
  dimension        text,                      -- sólo aplica a la sección docente
  label            text,
  prompt           text not null,
  scale_max        smallint not null check (scale_max in (4, 7)),
  lower_is_better  boolean not null default true,
  -- Los servicios de apoyo sólo los responde quien los usó.
  is_optional      boolean not null default false,
  position         smallint not null default 0
);

-- -----------------------------------------------------------------------------
-- Sesiones de respuesta
-- Una sesión = una aplicación completa del test por un alumno anónimo.
-- `submitted_on` es DATE a propósito (ver nota 2 de la cabecera).
-- -----------------------------------------------------------------------------
create table response_sessions (
  id            uuid primary key default gen_random_uuid(),
  cycle_id      text not null references cycles(id) on delete cascade,
  grade         text not null,
  group_name    text not null,
  submitted_on  date not null default current_date,
  is_complete   boolean not null default false
);

create index on response_sessions (cycle_id, grade, group_name);

-- -----------------------------------------------------------------------------
-- Respuestas
-- `teaching_assignment_id` es NULL en los reactivos institucionales y de apoyo,
-- y obligatorio en los docentes: sin él no se sabría a quién evalúa el valor.
-- -----------------------------------------------------------------------------
create table responses (
  id                     uuid primary key default gen_random_uuid(),
  session_id             uuid not null references response_sessions(id) on delete cascade,
  item_id                text not null references items(id),
  teaching_assignment_id uuid references teaching_assignments(id) on delete cascade,
  value                  smallint not null check (value between 1 and 7),
  constraint responses_teacher_scope_ck check (
    (teaching_assignment_id is not null) = (item_id like 'q%')
  )
);

-- Un alumno responde cada reactivo una sola vez por docente evaluado.
create unique index responses_unique_idx
  on responses (session_id, item_id, coalesce(teaching_assignment_id, '00000000-0000-0000-0000-000000000000'::uuid));

create index on responses (item_id);
create index on responses (teaching_assignment_id);

-- -----------------------------------------------------------------------------
-- Comentarios abiertos
-- Van en su propia tabla y NO se muestran hasta que alguien los revisa: es el
-- texto libre lo que puede identificar a un alumno o nombrar a un tercero.
-- La app ya promete que "los comentarios se revisan para retirar cualquier dato
-- identificable antes de canalizarlos"; aquí eso se vuelve un estado obligatorio.
-- -----------------------------------------------------------------------------
create table comments (
  id                     uuid primary key default gen_random_uuid(),
  session_id             uuid not null references response_sessions(id) on delete cascade,
  scope                  text not null check (scope in
                           ('docente', 'direccion', 'apoyo', 'conservar', 'atencion', 'mejorar')),
  teaching_assignment_id uuid references teaching_assignments(id) on delete cascade,
  body                   text not null check (length(body) between 1 and 500),
  -- pending: nadie lo ha leído · approved: visible · redacted: editado para
  -- quitar datos identificables · reserved: contenido sensible, no se expone
  review_status          text not null default 'pending'
                           check (review_status in ('pending', 'approved', 'redacted', 'reserved')),
  published_body         text,                -- versión saneada que sí se muestra
  reviewed_on            date,
  submitted_on           date not null default current_date
);

create index on comments (review_status);
create index on comments (teaching_assignment_id);

-- -----------------------------------------------------------------------------
-- Personal autorizado
-- Sustituye a las credenciales `admin` / `imma2026` que hoy viven en el bundle
-- del cliente, legibles por cualquiera que abra las herramientas del navegador.
-- Se apoya en Supabase Auth: `id` es el mismo uuid de auth.users.
-- -----------------------------------------------------------------------------
create table staff (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null check (role in ('direccion', 'coordinacion', 'lectura')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Registro de accesos al panel. La app declara en su README la intención de
-- "mantener auditoría de accesos al panel administrativo".
create table access_log (
  id          bigserial primary key,
  staff_id    uuid references staff(id) on delete set null,
  action      text not null,
  scope       text,
  occurred_at timestamptz not null default now()
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 0002_helpers.sql
-- origen: supabase/migrations/0002_helpers.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- =============================================================================
-- Funciones de apoyo
-- Se definen antes que las vistas y las políticas porque ambas las usan.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Identidad y permisos
-- -----------------------------------------------------------------------------
create or replace function is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where id = auth.uid() and is_active)
$$;

create or replace function staff_role()
returns text language sql stable security definer set search_path = public as $$
  select role from staff where id = auth.uid() and is_active
$$;

create or replace function cycle_is_open(target_cycle text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from cycles where id = target_cycle and is_open)
$$;

-- -----------------------------------------------------------------------------
-- Reglas de exposición y de escala
-- -----------------------------------------------------------------------------

-- Umbral de exposición. Por debajo de este número ninguna vista devuelve
-- resultados. Con ~10 alumnos por grado-grupo, un desglose fino permitiría
-- deducir quién contestó qué; hoy esa regla vive sólo en la interfaz, donde un
-- cambio descuidado la desactiva sin que nadie lo note.
create or replace function min_responses_threshold()
returns integer language sql immutable as $$ select 10 $$;

-- Índice 0–100 comparable entre las dos escalas del instrumento: 100 es el
-- mejor resultado posible tanto en la de 7 puntos como en la de 4. Es la única
-- conversión del sistema y se aplica siempre igual, de modo que dos vistas no
-- puedan discrepar. Equivale a `toIndex` en app/results-engine.ts.
create or replace function to_index(avg_value numeric, scale_max integer)
returns integer language sql immutable as $$
  select case
    when avg_value is null or avg_value <= 0 then null
    else round(((scale_max - avg_value) / (scale_max - 1)) * 100)::integer
  end
$$;

create or replace function reading_for(index_value integer)
returns text language sql immutable as $$
  select case
    when index_value is null then null
    when index_value >= 75 then 'Fortaleza'
    when index_value >= 50 then 'Atención'
    else 'Área prioritaria'
  end
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- 0003_views.sql
-- origen: supabase/migrations/0003_views.sql
-- ═══════════════════════════════════════════════════════════════════════════

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


-- ═══════════════════════════════════════════════════════════════════════════
-- 0004_rls.sql
-- origen: supabase/migrations/0004_rls.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- =============================================================================
-- Row Level Security
--
-- Modelo en una frase: el alumnado ESCRIBE y no lee nada; el personal LEE
-- agregados y nunca respuestas individuales.
--
-- Esto sustituye a las credenciales `admin` / `imma2026`, que hoy viajan en el
-- JavaScript del cliente y cualquiera puede leer con las herramientas del
-- navegador. Con RLS, aunque alguien obtenga la llave pública `anon`, no puede
-- leer una sola respuesta: la restricción vive en el servidor.
-- =============================================================================

alter table cycles               enable row level security;
alter table teachers             enable row level security;
alter table teaching_assignments enable row level security;
alter table enrollment           enable row level security;
alter table items                enable row level security;
alter table response_sessions    enable row level security;
alter table responses            enable row level security;
alter table comments             enable row level security;
alter table staff                enable row level security;
alter table access_log           enable row level security;

-- -----------------------------------------------------------------------------
-- Catálogos: lectura pública
-- El test necesita saber qué docentes le tocan a cada grado y grupo antes de
-- que exista sesión alguna, así que estos catálogos son legibles por `anon`.
-- No contienen ningún dato de alumnos.
-- -----------------------------------------------------------------------------
create policy "catalogos legibles" on cycles               for select using (true);
create policy "catalogos legibles" on teachers             for select using (is_active);
create policy "catalogos legibles" on teaching_assignments for select using (true);
create policy "catalogos legibles" on items                for select using (true);

-- La matrícula es sensible en agregado (permite deducir participación), así que
-- sólo la ve el personal.
create policy "matricula solo personal" on enrollment for select using (is_staff());
create policy "matricula editable por direccion" on enrollment for all
  using (staff_role() in ('direccion', 'coordinacion'))
  with check (staff_role() in ('direccion', 'coordinacion'));

-- -----------------------------------------------------------------------------
-- Respuestas del alumnado
-- Insertar sí; leer, actualizar y borrar, nunca. Ni siquiera el propio alumno
-- puede releer lo que envió: no hay forma de saber que era suyo, y ese es
-- precisamente el punto.
-- -----------------------------------------------------------------------------
create policy "el alumnado abre sesion en ciclo abierto" on response_sessions
  for insert to anon, authenticated
  with check (cycle_is_open(cycle_id));

create policy "el alumnado completa su sesion" on response_sessions
  for update to anon, authenticated
  using (cycle_is_open(cycle_id) and not is_complete)
  with check (cycle_is_open(cycle_id));

create policy "el alumnado registra respuestas" on responses
  for insert to anon, authenticated
  with check (exists (
    select 1 from response_sessions s
    where s.id = session_id and cycle_is_open(s.cycle_id) and not s.is_complete
  ));

create policy "el alumnado deja comentarios" on comments
  for insert to anon, authenticated
  with check (exists (
    select 1 from response_sessions s
    where s.id = session_id and cycle_is_open(s.cycle_id) and not s.is_complete
  ));

-- -----------------------------------------------------------------------------
-- Personal
-- Deliberadamente NO hay política de SELECT sobre `responses`. El panel lee las
-- vistas de 0002_views.sql, que ya aplican el umbral mínimo. Si algún día hace
-- falta acceso a filas crudas, que sea una decisión consciente y no una
-- consecuencia de haber abierto la tabla "por comodidad".
-- -----------------------------------------------------------------------------
create policy "el personal lee sesiones agregables" on response_sessions
  for select using (is_staff());

-- Moderación de comentarios: leerlos es parte del trabajo de revisión, y por eso
-- queda registrado en `access_log`.
create policy "el personal revisa comentarios" on comments
  for select using (is_staff());

create policy "direccion modera comentarios" on comments
  for update using (staff_role() in ('direccion', 'coordinacion'))
  with check (staff_role() in ('direccion', 'coordinacion'));

create policy "el personal se ve a si mismo" on staff
  for select using (id = auth.uid() or staff_role() = 'direccion');

create policy "direccion administra personal" on staff
  for all using (staff_role() = 'direccion') with check (staff_role() = 'direccion');

create policy "el personal registra su acceso" on access_log
  for insert to authenticated with check (staff_id = auth.uid());

create policy "direccion audita accesos" on access_log
  for select using (staff_role() = 'direccion');

-- -----------------------------------------------------------------------------
-- Vistas
-- Se dejan como SECURITY DEFINER (sin security_invoker) a propósito: así
-- pueden agregar sobre "responses", tabla que el personal NO puede consultar
-- directamente. Cada vista lleva además un guardia is_staff() en su WHERE, de
-- modo que un usuario autenticado que no sea personal obtiene cero filas.
--
-- Marcarlas como invoker haría lo contrario de lo que parece: respetarían el
-- RLS de "responses", que niega la lectura, y el panel quedaría en blanco.
-- -----------------------------------------------------------------------------
revoke all on
  v_participation, v_item_results, v_teacher_results,
  v_dimension_results, v_support_results, v_published_comments
from anon;

grant select on
  v_participation, v_item_results, v_teacher_results,
  v_dimension_results, v_support_results, v_published_comments
to authenticated;


-- ═══════════════════════════════════════════════════════════════════════════
-- 0005_integrity.sql
-- origen: supabase/migrations/0005_integrity.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- =============================================================================
-- Integridad de las respuestas
--
-- El CHECK de `responses.value` sólo puede acotar 1–7, porque una restricción
-- de columna no puede consultar otra tabla. Pero el instrumento tiene dos
-- escalas: los reactivos docentes van de 1 a 7 y los de dirección, red de apoyo
-- y experiencia institucional de 1 a 4.
--
-- Sin esta validación, un 7 en un reactivo de 4 puntos entraría sin protestar y
-- desplazaría el promedio de esa área. Sería además el tipo de error más difícil
-- de detectar después: la cifra se ve plausible y nada indica que esté mal.
-- =============================================================================

create or replace function validate_response_value()
returns trigger language plpgsql as $$
declare
  item_scale smallint;
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

  -- Coherencia entre el reactivo y el docente evaluado: sólo la sección docente
  -- lleva asignación, y llevarla es obligatorio para ella.
  if item_section = 'docente' and new.teaching_assignment_id is null then
    raise exception 'El reactivo docente % requiere una asignación', new.item_id;
  end if;
  if item_section <> 'docente' and new.teaching_assignment_id is not null then
    raise exception 'El reactivo % no corresponde a un docente', new.item_id;
  end if;

  return new;
end;
$$;

create trigger responses_validate_value
  before insert or update on responses
  for each row execute function validate_response_value();

-- -----------------------------------------------------------------------------
-- Un alumno sólo evalúa a los docentes que le corresponden
-- Sin esto, una sesión de 1.º A podría enviar evaluaciones de un docente de
-- 3.º C y contaminar sus resultados.
-- -----------------------------------------------------------------------------
create or replace function validate_response_scope()
returns trigger language plpgsql as $$
declare
  session_grade text;
  session_group text;
  session_cycle text;
  assignment_ok boolean;
begin
  if new.teaching_assignment_id is null then
    return new;
  end if;

  select grade, group_name, cycle_id
    into session_grade, session_group, session_cycle
  from response_sessions where id = new.session_id;

  select exists (
    select 1 from teaching_assignments ta
    where ta.id = new.teaching_assignment_id
      and ta.cycle_id = session_cycle
      and ta.grade = session_grade
      and ta.group_name = session_group
  ) into assignment_ok;

  if not assignment_ok then
    raise exception 'La asignación % no corresponde a % · % del ciclo %',
      new.teaching_assignment_id, session_grade, session_group, session_cycle;
  end if;

  return new;
end;
$$;

create trigger responses_validate_scope
  before insert or update on responses
  for each row execute function validate_response_scope();

-- -----------------------------------------------------------------------------
-- Una sesión completa no se vuelve a tocar
-- Evita que alguien reabra una sesión ya enviada y cambie respuestas.
-- -----------------------------------------------------------------------------
create or replace function freeze_complete_session()
returns trigger language plpgsql as $$
begin
  if old.is_complete then
    raise exception 'La sesión % ya fue enviada y no admite cambios', old.id;
  end if;
  return new;
end;
$$;

create trigger response_sessions_freeze
  before update on response_sessions
  for each row execute function freeze_complete_session();


-- ═══════════════════════════════════════════════════════════════════════════
-- 0006_tokens.sql
-- origen: supabase/migrations/0006_tokens.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- =============================================================================
-- Fichas de participación
--
-- Resuelven una tensión real: hay que impedir que una persona responda muchas
-- veces y hay que saber qué porcentaje del grupo participó, pero sin identificar
-- a nadie. La escuela emite fichas por grupo, las reparte, y cada una sirve una
-- sola vez.
--
-- Dos decisiones sostienen el anonimato y conviene no revertirlas:
--
--   1. La ficha NO guarda cuándo se usó, sólo si se usó. Con unos diez alumnos
--      por grupo, un `used_at` permitiría cruzar "esta ficha se canjeó a tal
--      hora" con "esta sesión entró a tal hora". Un booleano no dice nada.
--
--   2. Ninguna columna enlaza una ficha con una sesión. `redeem_token` canjea la
--      ficha y abre la sesión en la misma transacción, y no deja rastro de la
--      correspondencia entre ambas. Ni con acceso total a la base se puede
--      reconstruir quién respondió qué.
--
-- Queda una responsabilidad operativa que la base de datos no puede cubrir: si
-- al repartir las fichas alguien anota qué ficha recibió cada alumno, se pierde
-- el anonimato fuera del sistema. Deben repartirse al azar y sin registro.
-- =============================================================================

create table participation_tokens (
  token_hash  text primary key,          -- sha256 del código; el código nunca se guarda
  cycle_id    text not null references cycles(id) on delete cascade,
  grade       text not null,
  group_name  text not null,
  issued_on   date not null default current_date,
  -- Deliberadamente booleano y no marca de tiempo. Ver nota 1.
  is_used     boolean not null default false
);

create index on participation_tokens (cycle_id, grade, group_name, is_used);

alter table participation_tokens enable row level security;

-- Nadie consulta esta tabla directamente, ni siquiera el personal: poder leer
-- los hashes permitiría verificar si un código concreto existe. El personal ve
-- el avance por la vista agregada de más abajo.
create policy "solo direccion administra fichas" on participation_tokens
  for all using (staff_role() in ('direccion', 'coordinacion'))
  with check (staff_role() in ('direccion', 'coordinacion'));

-- -----------------------------------------------------------------------------
-- Emisión
-- Devuelve los códigos EN CLARO una sola vez, en el momento de crearlos. No se
-- guardan: si se pierden antes de imprimirlos, se anulan y se emiten otros.
-- -----------------------------------------------------------------------------
create or replace function issue_tokens(
  target_cycle text,
  target_grade text,
  target_group text,
  quantity     integer
)
returns setof text
language plpgsql security definer set search_path = public, extensions as $$
declare
  -- Alfabeto sin caracteres que se confunden al leerlos en papel: sin O ni 0,
  -- sin I ni 1. Los va a teclear un adolescente desde su teléfono.
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i integer;
  j integer;
begin
  if staff_role() not in ('direccion', 'coordinacion') then
    raise exception 'Sólo dirección o coordinación pueden emitir fichas'
      using errcode = '42501';
  end if;

  if quantity is null or quantity < 1 or quantity > 500 then
    raise exception 'Cantidad fuera de rango (1 a 500)' using errcode = '22023';
  end if;

  for i in 1..quantity loop
    loop
      code := '';
      for j in 1..8 loop
        code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
      end loop;
      -- Reintenta si el código ya existía; con 32^8 combinaciones es raro.
      exit when not exists (
        select 1 from participation_tokens
        where token_hash = encode(digest(code, 'sha256'), 'hex')
      );
    end loop;

    insert into participation_tokens (token_hash, cycle_id, grade, group_name)
    values (encode(digest(code, 'sha256'), 'hex'), target_cycle, target_grade, target_group);

    return next code;
  end loop;
end;
$$;

revoke all on function issue_tokens(text, text, text, integer) from public, anon;
grant execute on function issue_tokens(text, text, text, integer) to authenticated;

-- -----------------------------------------------------------------------------
-- Canje
-- Es el único camino por el que nace una sesión. La política de inserción de
-- `response_sessions` se retira en favor de esta función, para que no exista
-- forma de abrir una sesión sin ficha.
-- -----------------------------------------------------------------------------
create or replace function redeem_token(raw_token text)
returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare
  hashed      text;
  token_row   participation_tokens%rowtype;
  new_session uuid;
begin
  if raw_token is null or length(trim(raw_token)) = 0 then
    raise exception 'Escribe el código de tu ficha' using errcode = '22023';
  end if;

  -- Se normaliza para que dé igual mayúsculas o espacios al teclearlo.
  hashed := encode(digest(upper(replace(trim(raw_token), ' ', '')), 'sha256'), 'hex');

  select * into token_row from participation_tokens
  where token_hash = hashed
  for update;

  if not found then
    raise exception 'La ficha no es válida' using errcode = '22023';
  end if;

  if token_row.is_used then
    raise exception 'Esta ficha ya se utilizó' using errcode = '22023';
  end if;

  if not cycle_is_open(token_row.cycle_id) then
    raise exception 'El periodo de respuesta está cerrado' using errcode = '22023';
  end if;

  update participation_tokens set is_used = true where token_hash = hashed;

  insert into response_sessions (cycle_id, grade, group_name)
  values (token_row.cycle_id, token_row.grade, token_row.group_name)
  returning id into new_session;

  -- Se devuelve el identificador de la sesión y nada más. En ningún punto se
  -- guarda la relación entre esta sesión y la ficha que la abrió.
  return new_session;
end;
$$;

grant execute on function redeem_token(text) to anon, authenticated;

-- La sesión ya sólo puede nacer por canje de ficha.
drop policy if exists "el alumnado abre sesion en ciclo abierto" on response_sessions;

-- -----------------------------------------------------------------------------
-- Avance de la aplicación
-- Le dice a coordinación cuántas fichas repartió y cuántas se canjearon, sin
-- exponer ningún hash.
-- -----------------------------------------------------------------------------
create or replace view v_token_progress as
select
  cycle_id,
  grade,
  group_name,
  count(*)                             as issued,
  count(*) filter (where is_used)      as redeemed,
  count(*) filter (where not is_used)  as pending
from participation_tokens
where is_staff()
group by cycle_id, grade, group_name;

revoke all on v_token_progress from anon;
grant select on v_token_progress to authenticated;


-- ═══════════════════════════════════════════════════════════════════════════
-- 0007_evaluated_staff.sql
-- origen: supabase/migrations/0007_evaluated_staff.sql
-- ═══════════════════════════════════════════════════════════════════════════

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

