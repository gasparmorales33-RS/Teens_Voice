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
