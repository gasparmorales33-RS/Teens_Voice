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
