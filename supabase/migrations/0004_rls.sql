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
