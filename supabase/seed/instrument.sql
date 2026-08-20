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
