-- Generado por scripts/export-supabase-seed.mts · NO editar a mano.
-- Fuente: app/teacher-catalog.ts (electiveCatalog)
-- 6 docentes · 7 niveles de inglés

insert into teachers (code, full_name, initials) values
  ('norma-carolina-lizarraga-osuna', 'Norma Carolina Lizarraga Osuna', 'NC'),
  ('elizabeth-gaxiola-tirado', 'Elizabeth Gaxiola Tirado', 'EG'),
  ('beatriz-gutierrez-duran', 'Beatriz Gutierrez Duran', 'BG'),
  ('marielisa-osuna-ramirez', 'Marielisa Osuna Ramirez', 'MO'),
  ('ana-isabel-laris-cutino', 'Ana Isabel Laris Cutiño', 'AI'),
  ('sheccid-tirado-cuellar', 'Sheccid Tirado Cuellar', 'ST')
on conflict (code) do update set full_name = excluded.full_name, initials = excluded.initials;

insert into teaching_assignments (teacher_id, cycle_id, subject, school_level, elective_stream)
select t.id, '2026-2027', v.subject, v.school_level, v.stream
from (values
  ('norma-carolina-lizarraga-osuna', 'Advance English 1', 'Secundaria', 'Advance English 1'),
  ('elizabeth-gaxiola-tirado', 'Advance English 2', 'Secundaria', 'Advance English 2'),
  ('elizabeth-gaxiola-tirado', 'Advanced 1b', 'Secundaria', 'Advanced 1b'),
  ('beatriz-gutierrez-duran', 'Basic English 1', 'Secundaria', 'Basic English 1'),
  ('marielisa-osuna-ramirez', 'Basic English 2', 'Secundaria', 'Basic English 2'),
  ('ana-isabel-laris-cutino', 'Middle English 1', 'Secundaria', 'Middle English 1'),
  ('sheccid-tirado-cuellar', 'Middle English 2', 'Secundaria', 'Middle English 2')
) as v(teacher_code, subject, school_level, stream)
join teachers t on t.code = v.teacher_code;
