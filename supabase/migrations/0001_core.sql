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
