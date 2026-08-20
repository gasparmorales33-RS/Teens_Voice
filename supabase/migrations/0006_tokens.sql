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
