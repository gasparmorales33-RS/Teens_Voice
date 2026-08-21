-- Generado por scripts/export-supabase-seed.mts · NO editar a mano.
-- Fuente: app/staff-catalog.ts
-- 4 personas. Sustituir por el personal real del ciclo.

insert into evaluated_staff (code, full_name, initials, title, role, scope, grade, group_name) values
  ('luis-rodriguez', 'Lic. Luis Rodríguez', 'LR', 'Coordinación académica', 'directivo', 'escuela', NULL, NULL),
  ('elena-vargas', 'Lic. Elena Vargas', 'EV', 'Psicología y orientación IMMA', 'psicologia', 'escuela', NULL, NULL),
  ('ana-sanchez', 'Enf. Ana Sánchez', 'AS', 'Enfermería y salud escolar', 'enfermeria', 'escuela', NULL, NULL),
  ('mariana-lopez', 'Lic. Mariana López', 'ML', 'Tutora de acompañamiento', 'tutoria', 'grupo', '1.º de secundaria', 'Grupo A')
on conflict (code) do update set
  full_name = excluded.full_name,
  initials = excluded.initials,
  title = excluded.title,
  role = excluded.role,
  scope = excluded.scope,
  grade = excluded.grade,
  group_name = excluded.group_name;
