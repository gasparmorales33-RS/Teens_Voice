-- ###########################################################################
-- IMAA Teens Voice · Instrumento y catálogos
--
-- Generado por scripts/build-setup-sql.mjs · NO editar a mano.
-- Se regenera desde el código con:
--     npx tsx scripts/export-supabase-seed.mts
--     node scripts/build-setup-sql.mjs
--
-- CÓMO USARLO
--   Ejecutar DESPUÉS de 01-instalacion.sql, en una consulta nueva.
--
-- Este archivo SÍ puede volver a ejecutarse: todas las inserciones llevan
-- "on conflict do update", así que actualiza en vez de duplicar. Es la forma
-- de recargar los catálogos cuando cambie el personal o la plantilla docente.
--
-- OJO: el personal directivo y de apoyo que trae es el del prototipo. Hay que
-- sustituirlo por el real en app/staff-catalog.ts y regenerar.
-- ###########################################################################


-- ═══════════════════════════════════════════════════════════════════════════
-- instrument.sql
-- origen: supabase/seed/instrument.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- Generado por scripts/export-supabase-seed.mts · NO editar a mano.
-- Fuente: app/results-engine.ts (32 reactivos)

insert into cycles (id, label, is_open) values ('2026-2027', '2026–2027', false)
  on conflict (id) do nothing;

insert into items (id, section, dimension, label, prompt, scale_max, lower_is_better, is_optional, position) values
  ('q01', 'docente', 'Cumplimiento profesional', NULL, 'El maestro asiste a todas sus clases.', 7, true, false, 0),
  ('q02', 'docente', 'Cumplimiento profesional', NULL, 'El maestro empieza y termina la clase a tiempo.', 7, true, false, 1),
  ('q03', 'docente', 'Planeación y evaluación', NULL, 'Explica claramente las reglas de la clase y cómo va a calificar.', 7, true, false, 2),
  ('q04', 'docente', 'Dominio y claridad', NULL, 'Conoce bien los temas de la materia.', 7, true, false, 3),
  ('q05', 'docente', 'Dominio y claridad', NULL, 'Explica los temas de forma clara y fácil de entender.', 7, true, false, 4),
  ('q06', 'docente', 'Acompañamiento', NULL, 'Responde nuestras preguntas y aclara nuestras dudas.', 7, true, false, 5),
  ('q07', 'docente', 'Participación y aprendizaje', NULL, 'Motiva a los estudiantes a participar en clase.', 7, true, false, 6),
  ('q08', 'docente', 'Participación y aprendizaje', NULL, 'Relaciona los temas con situaciones de la vida diaria.', 7, true, false, 7),
  ('q09', 'docente', 'Participación y aprendizaje', NULL, 'Organiza actividades para trabajar en equipo.', 7, true, false, 8),
  ('q10', 'docente', 'Recursos didácticos', NULL, 'Utiliza recursos y tecnología que ayudan a aprender.', 7, true, false, 9),
  ('q11', 'docente', 'Convivencia y respeto', NULL, 'Trata a los estudiantes con respeto.', 7, true, false, 10),
  ('q12', 'docente', 'Convivencia y respeto', NULL, 'Crea un ambiente de confianza, inclusión y respeto.', 7, true, false, 11),
  ('q13', 'docente', 'Estrategias didácticas', NULL, 'Hace que sus clases sean dinámicas e interesantes.', 7, true, false, 12),
  ('q14', 'docente', 'Planeación y evaluación', NULL, 'Califica de forma clara y de acuerdo con lo que explicó.', 7, true, false, 13),
  ('q15', 'docente', 'Valoración global', NULL, 'En general, ¿cómo calificas el trabajo del maestro?', 7, true, false, 14),
  ('director_agreements', 'direccion', NULL, 'Organización y cumplimiento', 'Cumple los acuerdos y organiza bien las actividades de la escuela.', 4, true, false, 15),
  ('director_communication', 'direccion', NULL, 'Comunicación', 'Explica con claridad las decisiones, reglas y cambios importantes.', 4, true, false, 16),
  ('director_listens', 'direccion', NULL, 'Escucha estudiantil', 'Escucha a los estudiantes y toma en cuenta lo que pensamos.', 4, true, false, 17),
  ('director_fair', 'direccion', NULL, 'Respeto y trato justo', 'Nos trata con respeto y busca soluciones justas.', 4, true, false, 18),
  ('director_followup', 'direccion', NULL, 'Seguimiento', 'Da seguimiento a los problemas hasta que se resuelven.', 4, true, false, 19),
  ('psych_listens', 'psicologia', NULL, 'Escucha', 'Me escuchó con atención y sin juzgarme.', 4, true, true, 20),
  ('psych_safe', 'psicologia', NULL, 'Confianza', 'Me hizo sentir en confianza para hablar de lo que me preocupaba.', 4, true, true, 21),
  ('psych_useful', 'psicologia', NULL, 'Orientación útil', 'Su orientación me ayudó a saber qué podía hacer después.', 4, true, true, 22),
  ('nurse_care', 'enfermeria', NULL, 'Atención', 'Me atendió con amabilidad y tomó en serio lo que sentía.', 4, true, true, 23),
  ('nurse_clear', 'enfermeria', NULL, 'Indicaciones claras', 'Me explicó claramente qué debía hacer.', 4, true, true, 24),
  ('nurse_followup', 'enfermeria', NULL, 'Seguimiento', 'Me indicó cuándo debía regresar o pedir más ayuda.', 4, true, true, 25),
  ('tutor_listens', 'tutoria', NULL, 'Escucha', 'Me escucha cuando tengo una dificultad.', 4, true, true, 26),
  ('tutor_guidance', 'tutoria', NULL, 'Orientación', 'Me ayuda a encontrar una solución o el apoyo que necesito.', 4, true, true, 27),
  ('tutor_cares', 'tutoria', NULL, 'Interés integral', 'Se interesa por cómo estamos, no solo por las calificaciones.', 4, true, true, 28),
  ('imma_safe', 'institucional', NULL, 'Seguridad', 'Me siento seguro/a dentro del IMMA.', 4, true, false, 29),
  ('imma_help', 'institucional', NULL, 'Acceso a ayuda', 'Sé con quién pedir ayuda cuando la necesito.', 4, true, false, 30),
  ('imma_heard', 'institucional', NULL, 'Escucha estudiantil', 'Siento que mi opinión es tomada en cuenta.', 4, true, false, 31)
on conflict (id) do update set
  section = excluded.section,
  dimension = excluded.dimension,
  label = excluded.label,
  prompt = excluded.prompt,
  scale_max = excluded.scale_max,
  is_optional = excluded.is_optional,
  position = excluded.position;


-- ═══════════════════════════════════════════════════════════════════════════
-- teachers.sql
-- origen: supabase/seed/teachers.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- Generado por scripts/export-supabase-seed.mts · NO editar a mano.
-- Fuente: app/teacher-catalog.ts
-- 18 docentes · 95 asignaciones

insert into teachers (code, full_name, initials) values
  ('brenda-elicet-giles-miranda', 'Brenda Elicet Giles Miranda', 'BE'),
  ('veronica-pamela-jimenez-gutierrez', 'Verónica Pamela Jiménez Gutiérrez', 'VP'),
  ('elias-marcelo-tejeda-aguirre', 'Elias Marcelo Tejeda Aguirre', 'EM'),
  ('maria-fernanda-rojas-pena', 'Maria Fernanda Rojas Peña', 'MF'),
  ('jesus-ernesto-ramos-torres', 'Jesus Ernesto Ramos Torres', 'JE'),
  ('cecilia-guadalupe-castillo-ortiz', 'Cecilia Guadalupe Castillo Ortiz', 'CG'),
  ('sheccid-tirado-cuellar', 'Sheccid Tirado Cuellar', 'ST'),
  ('julio-adrian-cerna-estrada', 'Julio Adrian Cerna Estrada', 'JA'),
  ('jesus-fabian-arellano-ornelas', 'Jesus Fabian Arellano Ornelas', 'JF'),
  ('emilia-elizabeth-sanchez-arellano', 'Emilia Elizabeth Sanchez Arellano', 'EE'),
  ('melissa-arleth-balverde-juarez', 'Melissa Arleth Balverde Juarez', 'MA'),
  ('jessica-maria-orrante-alcaraz', 'Jessica Maria Orrante Alcaraz', 'JM'),
  ('eli-andres-lopez-gonzalez', 'Eli Andres Lopez Gonzalez', 'EA'),
  ('jahayra-elizabeth-lopez-flores', 'Jahayra Elizabeth Lopez Flores', 'JE'),
  ('santiago-garate-martinez', 'Santiago Garate Martinez', 'SG'),
  ('perla-guadalupe-morales-partida', 'Perla Guadalupe Morales Partida', 'PG'),
  ('karime-sinahi-pena-huerta', 'Karime Sinahí Peña Huerta', 'KS'),
  ('teresita-de-jesus-ruiz-castaneda', 'Teresita De Jesús Ruiz Castañeda', 'TD')
on conflict (code) do update set full_name = excluded.full_name, initials = excluded.initials;

insert into teaching_assignments (teacher_id, cycle_id, subject, school_level, grade, group_name)
select t.id, '2026-2027', v.subject, v.school_level, v.grade, v.group_name
from (values
  ('brenda-elicet-giles-miranda', 'Ciencias Naturales, Experimentales Y Tecnología I', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('veronica-pamela-jimenez-gutierrez', 'Ciencias Sociales I', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('elias-marcelo-tejeda-aguirre', 'Cultura Digital I', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('maria-fernanda-rojas-pena', 'Danza', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('jesus-ernesto-ramos-torres', 'Deportes', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('cecilia-guadalupe-castillo-ortiz', 'Finanzas', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('sheccid-tirado-cuellar', 'Inglés I', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('veronica-pamela-jimenez-gutierrez', 'Laboratorio De Investigación', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('julio-adrian-cerna-estrada', 'Lengua Y Comunicación I', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('jesus-fabian-arellano-ornelas', 'Música', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('emilia-elizabeth-sanchez-arellano', 'Pensamiento Filosófico Y Humanidades I', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('elias-marcelo-tejeda-aguirre', 'Pensamiento Matemático I', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('melissa-arleth-balverde-juarez', 'Socioemocional', 'Preparatoria', '1.º de preparatoria', 'Grupo A'),
  ('jessica-maria-orrante-alcaraz', 'Ciencias (biología)', 'Secundaria', '1.º de secundaria', 'Grupo A'),
  ('jesus-ernesto-ramos-torres', 'Educación Física', 'Secundaria', '1.º de secundaria', 'Grupo A'),
  ('cecilia-guadalupe-castillo-ortiz', 'Finanzas Personales', 'Secundaria', '1.º de secundaria', 'Grupo A'),
  ('eli-andres-lopez-gonzalez', 'Formación Cívica Y Ética', 'Secundaria', '1.º de secundaria', 'Grupo A'),
  ('eli-andres-lopez-gonzalez', 'Geografía', 'Secundaria', '1.º de secundaria', 'Grupo A'),
  ('emilia-elizabeth-sanchez-arellano', 'Historia', 'Secundaria', '1.º de secundaria', 'Grupo A'),
  ('julio-adrian-cerna-estrada', 'Lengua Materna (español)', 'Secundaria', '1.º de secundaria', 'Grupo A'),
  ('jahayra-elizabeth-lopez-flores', 'Matemáticas', 'Secundaria', '1.º de secundaria', 'Grupo A'),
  ('jesus-fabian-arellano-ornelas', 'Taller De Artes', 'Secundaria', '1.º de secundaria', 'Grupo A'),
  ('santiago-garate-martinez', 'Tecnología', 'Secundaria', '1.º de secundaria', 'Grupo A'),
  ('perla-guadalupe-morales-partida', 'Tutoria', 'Secundaria', '1.º de secundaria', 'Grupo A'),
  ('jessica-maria-orrante-alcaraz', 'Ciencias (biología)', 'Secundaria', '1.º de secundaria', 'Grupo B'),
  ('jesus-ernesto-ramos-torres', 'Educación Física', 'Secundaria', '1.º de secundaria', 'Grupo B'),
  ('cecilia-guadalupe-castillo-ortiz', 'Finanzas Personales', 'Secundaria', '1.º de secundaria', 'Grupo B'),
  ('eli-andres-lopez-gonzalez', 'Formación Cívica Y Ética', 'Secundaria', '1.º de secundaria', 'Grupo B'),
  ('eli-andres-lopez-gonzalez', 'Geografía', 'Secundaria', '1.º de secundaria', 'Grupo B'),
  ('emilia-elizabeth-sanchez-arellano', 'Historia', 'Secundaria', '1.º de secundaria', 'Grupo B'),
  ('julio-adrian-cerna-estrada', 'Lengua Materna (español)', 'Secundaria', '1.º de secundaria', 'Grupo B'),
  ('jahayra-elizabeth-lopez-flores', 'Matemáticas', 'Secundaria', '1.º de secundaria', 'Grupo B'),
  ('jesus-fabian-arellano-ornelas', 'Taller De Artes', 'Secundaria', '1.º de secundaria', 'Grupo B'),
  ('santiago-garate-martinez', 'Tecnología', 'Secundaria', '1.º de secundaria', 'Grupo B'),
  ('perla-guadalupe-morales-partida', 'Tutoria', 'Secundaria', '1.º de secundaria', 'Grupo B'),
  ('karime-sinahi-pena-huerta', 'Ciencias (física)', 'Secundaria', '2.º de secundaria', 'Grupo A'),
  ('jesus-ernesto-ramos-torres', 'Educación Física', 'Secundaria', '2.º de secundaria', 'Grupo A'),
  ('cecilia-guadalupe-castillo-ortiz', 'Finanzas Personales', 'Secundaria', '2.º de secundaria', 'Grupo A'),
  ('eli-andres-lopez-gonzalez', 'Formación Cívica Y Ética', 'Secundaria', '2.º de secundaria', 'Grupo A'),
  ('emilia-elizabeth-sanchez-arellano', 'Historia Ii', 'Secundaria', '2.º de secundaria', 'Grupo A'),
  ('teresita-de-jesus-ruiz-castaneda', 'Lengua Materna (español)', 'Secundaria', '2.º de secundaria', 'Grupo A'),
  ('jahayra-elizabeth-lopez-flores', 'Matemáticas', 'Secundaria', '2.º de secundaria', 'Grupo A'),
  ('maria-fernanda-rojas-pena', 'Taller De Artes', 'Secundaria', '2.º de secundaria', 'Grupo A'),
  ('santiago-garate-martinez', 'Tecnología', 'Secundaria', '2.º de secundaria', 'Grupo A'),
  ('perla-guadalupe-morales-partida', 'Tutoria', 'Secundaria', '2.º de secundaria', 'Grupo A'),
  ('karime-sinahi-pena-huerta', 'Ciencias (física)', 'Secundaria', '2.º de secundaria', 'Grupo B'),
  ('jesus-ernesto-ramos-torres', 'Educación Física', 'Secundaria', '2.º de secundaria', 'Grupo B'),
  ('cecilia-guadalupe-castillo-ortiz', 'Finanzas Personales', 'Secundaria', '2.º de secundaria', 'Grupo B'),
  ('eli-andres-lopez-gonzalez', 'Formación Cívica Y Ética', 'Secundaria', '2.º de secundaria', 'Grupo B'),
  ('emilia-elizabeth-sanchez-arellano', 'Historia Ii', 'Secundaria', '2.º de secundaria', 'Grupo B'),
  ('teresita-de-jesus-ruiz-castaneda', 'Lengua Materna (español)', 'Secundaria', '2.º de secundaria', 'Grupo B'),
  ('karime-sinahi-pena-huerta', 'Matemáticas', 'Secundaria', '2.º de secundaria', 'Grupo B'),
  ('maria-fernanda-rojas-pena', 'Taller De Artes', 'Secundaria', '2.º de secundaria', 'Grupo B'),
  ('santiago-garate-martinez', 'Tecnología', 'Secundaria', '2.º de secundaria', 'Grupo B'),
  ('perla-guadalupe-morales-partida', 'Tutoria', 'Secundaria', '2.º de secundaria', 'Grupo B'),
  ('maria-fernanda-rojas-pena', 'Artes', 'Secundaria', '2.º de secundaria', 'Grupo C'),
  ('karime-sinahi-pena-huerta', 'Ciencias (física)', 'Secundaria', '2.º de secundaria', 'Grupo C'),
  ('jesus-ernesto-ramos-torres', 'Educación Física', 'Secundaria', '2.º de secundaria', 'Grupo C'),
  ('cecilia-guadalupe-castillo-ortiz', 'Finanzas Personales', 'Secundaria', '2.º de secundaria', 'Grupo C'),
  ('eli-andres-lopez-gonzalez', 'Formación Cívica Y Ética', 'Secundaria', '2.º de secundaria', 'Grupo C'),
  ('emilia-elizabeth-sanchez-arellano', 'Historia Ii', 'Secundaria', '2.º de secundaria', 'Grupo C'),
  ('teresita-de-jesus-ruiz-castaneda', 'Lengua Materna (español)', 'Secundaria', '2.º de secundaria', 'Grupo C'),
  ('jahayra-elizabeth-lopez-flores', 'Matemáticas', 'Secundaria', '2.º de secundaria', 'Grupo C'),
  ('santiago-garate-martinez', 'Tecnología', 'Secundaria', '2.º de secundaria', 'Grupo C'),
  ('perla-guadalupe-morales-partida', 'Tutoria', 'Secundaria', '2.º de secundaria', 'Grupo C'),
  ('jesus-fabian-arellano-ornelas', 'Artes', 'Secundaria', '3.º de secundaria', 'Grupo A'),
  ('jessica-maria-orrante-alcaraz', 'Ciencias Iii (énfasis En Química)', 'Secundaria', '3.º de secundaria', 'Grupo A'),
  ('jesus-ernesto-ramos-torres', 'Educación Física', 'Secundaria', '3.º de secundaria', 'Grupo A'),
  ('teresita-de-jesus-ruiz-castaneda', 'Español Iii', 'Secundaria', '3.º de secundaria', 'Grupo A'),
  ('cecilia-guadalupe-castillo-ortiz', 'Finanzas Personales', 'Secundaria', '3.º de secundaria', 'Grupo A'),
  ('veronica-pamela-jimenez-gutierrez', 'Formación Cívica Y Ética Ii', 'Secundaria', '3.º de secundaria', 'Grupo A'),
  ('emilia-elizabeth-sanchez-arellano', 'Historia Iii', 'Secundaria', '3.º de secundaria', 'Grupo A'),
  ('cecilia-guadalupe-castillo-ortiz', 'Matemáticas Iii', 'Secundaria', '3.º de secundaria', 'Grupo A'),
  ('santiago-garate-martinez', 'Tecnología', 'Secundaria', '3.º de secundaria', 'Grupo A'),
  ('perla-guadalupe-morales-partida', 'Tutoria', 'Secundaria', '3.º de secundaria', 'Grupo A'),
  ('jessica-maria-orrante-alcaraz', 'Ciencias Iii (énfasis En Química)', 'Secundaria', '3.º de secundaria', 'Grupo B'),
  ('jesus-ernesto-ramos-torres', 'Educación Física', 'Secundaria', '3.º de secundaria', 'Grupo B'),
  ('teresita-de-jesus-ruiz-castaneda', 'Español Iii', 'Secundaria', '3.º de secundaria', 'Grupo B'),
  ('cecilia-guadalupe-castillo-ortiz', 'Finanzas Personales', 'Secundaria', '3.º de secundaria', 'Grupo B'),
  ('eli-andres-lopez-gonzalez', 'Formación Cívica Y Ética Ii', 'Secundaria', '3.º de secundaria', 'Grupo B'),
  ('veronica-pamela-jimenez-gutierrez', 'Historia Iii', 'Secundaria', '3.º de secundaria', 'Grupo B'),
  ('cecilia-guadalupe-castillo-ortiz', 'Matemáticas Iii', 'Secundaria', '3.º de secundaria', 'Grupo B'),
  ('jesus-fabian-arellano-ornelas', 'Taller De Artes', 'Secundaria', '3.º de secundaria', 'Grupo B'),
  ('santiago-garate-martinez', 'Tecnología', 'Secundaria', '3.º de secundaria', 'Grupo B'),
  ('perla-guadalupe-morales-partida', 'Tutoria', 'Secundaria', '3.º de secundaria', 'Grupo B'),
  ('brenda-elicet-giles-miranda', 'Ciencias Iii (énfasis En Química)', 'Secundaria', '3.º de secundaria', 'Grupo C'),
  ('jesus-ernesto-ramos-torres', 'Educación Física', 'Secundaria', '3.º de secundaria', 'Grupo C'),
  ('julio-adrian-cerna-estrada', 'Español Iii', 'Secundaria', '3.º de secundaria', 'Grupo C'),
  ('cecilia-guadalupe-castillo-ortiz', 'Finanzas Personales', 'Secundaria', '3.º de secundaria', 'Grupo C'),
  ('eli-andres-lopez-gonzalez', 'Formación Cívica Y Ética Ii', 'Secundaria', '3.º de secundaria', 'Grupo C'),
  ('veronica-pamela-jimenez-gutierrez', 'Historia Iii', 'Secundaria', '3.º de secundaria', 'Grupo C'),
  ('elias-marcelo-tejeda-aguirre', 'Matemáticas Iii', 'Secundaria', '3.º de secundaria', 'Grupo C'),
  ('jesus-fabian-arellano-ornelas', 'Taller De Artes', 'Secundaria', '3.º de secundaria', 'Grupo C'),
  ('santiago-garate-martinez', 'Tecnología', 'Secundaria', '3.º de secundaria', 'Grupo C'),
  ('perla-guadalupe-morales-partida', 'Tutoria', 'Secundaria', '3.º de secundaria', 'Grupo C')
) as v(teacher_code, subject, school_level, grade, group_name)
join teachers t on t.code = v.teacher_code
on conflict (teacher_id, cycle_id, subject, grade, group_name) do nothing;


-- ═══════════════════════════════════════════════════════════════════════════
-- electives.sql
-- origen: supabase/seed/electives.sql
-- ═══════════════════════════════════════════════════════════════════════════

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


-- ═══════════════════════════════════════════════════════════════════════════
-- staff.sql
-- origen: supabase/seed/staff.sql
-- ═══════════════════════════════════════════════════════════════════════════

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

