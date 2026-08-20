/**
 * Genera los archivos de siembra de Supabase a partir de las fuentes que ya
 * existen en el código, en lugar de transcribirlas a SQL a mano.
 *
 * El instrumento sale de `app/results-engine.ts` y el catálogo docente de
 * `app/teacher-catalog.ts`, de modo que la base de datos no puede quedar
 * desalineada con lo que la aplicación pregunta y muestra.
 *
 *   npx tsx scripts/export-supabase-seed.mts
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { teacherCatalog } from "../app/teacher-catalog.ts";
import {
  institutionalQuestions,
  supportAreas,
  teacherQuestions,
} from "../app/results-engine.ts";

const CYCLE_ID = "2026-2027";
const CYCLE_LABEL = "2026–2027";
const OUT = "supabase/seed";
mkdirSync(OUT, { recursive: true });

/** Comillas simples de SQL: se duplican las internas. */
const q = (value: string | null) => (value === null ? "NULL" : `'${value.replace(/'/g, "''")}'`);

/* --------------------------------------------------------------------------
   Instrumento
   -------------------------------------------------------------------------- */
type ItemRow = {
  id: string;
  section: string;
  dimension: string | null;
  label: string | null;
  prompt: string;
  scaleMax: number;
  optional: boolean;
  position: number;
};

const items: ItemRow[] = [];
let position = 0;

for (const question of teacherQuestions) {
  items.push({
    id: question.id,
    section: "docente",
    dimension: question.dimension,
    label: null,
    prompt: question.text,
    scaleMax: 7,
    optional: false,
    position: position++,
  });
}

const sectionForArea: Record<string, string> = {
  "Dirección y coordinación": "direccion",
  "Psicología": "psicologia",
  "Enfermería": "enfermeria",
  "Tutoría": "tutoria",
};

for (const area of supportAreas) {
  for (const question of area.questions) {
    items.push({
      id: question.id,
      section: sectionForArea[area.area] ?? "direccion",
      dimension: null,
      label: question.label,
      prompt: question.text,
      scaleMax: 4,
      optional: area.optional,
      position: position++,
    });
  }
}

for (const question of institutionalQuestions) {
  items.push({
    id: question.id,
    section: "institucional",
    dimension: null,
    label: question.indicator,
    prompt: question.text,
    scaleMax: 4,
    optional: false,
    position: position++,
  });
}

const itemsSql = `-- Generado por scripts/export-supabase-seed.mts · NO editar a mano.
-- Fuente: app/results-engine.ts (${items.length} reactivos)

insert into cycles (id, label, is_open) values (${q(CYCLE_ID)}, ${q(CYCLE_LABEL)}, false)
  on conflict (id) do nothing;

insert into items (id, section, dimension, label, prompt, scale_max, lower_is_better, is_optional, position) values
${items
  .map(
    (item) =>
      `  (${q(item.id)}, ${q(item.section)}, ${q(item.dimension)}, ${q(item.label)}, ${q(item.prompt)}, ${item.scaleMax}, true, ${item.optional}, ${item.position})`,
  )
  .join(",\n")}
on conflict (id) do update set
  section = excluded.section,
  dimension = excluded.dimension,
  label = excluded.label,
  prompt = excluded.prompt,
  scale_max = excluded.scale_max,
  is_optional = excluded.is_optional,
  position = excluded.position;
`;

writeFileSync(`${OUT}/instrument.sql`, itemsSql);

/* --------------------------------------------------------------------------
   Catálogo docente
   Un docente puede impartir varias materias en varios grupos, así que se
   siembran las personas y sus asignaciones por separado.
   -------------------------------------------------------------------------- */
const people = new Map<string, { code: string; name: string; initials: string }>();
for (const assignment of teacherCatalog) {
  // El `code` del catálogo incluye materia y grupo; para la persona se usa su
  // nombre normalizado, que es lo que se repite entre asignaciones.
  const personCode = assignment.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!people.has(personCode)) {
    people.set(personCode, { code: personCode, name: assignment.name, initials: assignment.initials });
  }
}

const teachersSql = `-- Generado por scripts/export-supabase-seed.mts · NO editar a mano.
-- Fuente: app/teacher-catalog.ts
-- ${people.size} docentes · ${teacherCatalog.length} asignaciones

insert into teachers (code, full_name, initials) values
${[...people.values()]
  .map((person) => `  (${q(person.code)}, ${q(person.name)}, ${q(person.initials)})`)
  .join(",\n")}
on conflict (code) do update set full_name = excluded.full_name, initials = excluded.initials;

insert into teaching_assignments (teacher_id, cycle_id, subject, school_level, grade, group_name)
select t.id, ${q(CYCLE_ID)}, v.subject, v.school_level, v.grade, v.group_name
from (values
${teacherCatalog
  .map((assignment) => {
    const personCode = assignment.name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `  (${q(personCode)}, ${q(assignment.subject)}, ${q(assignment.level)}, ${q(assignment.grade)}, ${q(assignment.group)})`;
  })
  .join(",\n")}
) as v(teacher_code, subject, school_level, grade, group_name)
join teachers t on t.code = v.teacher_code
on conflict (teacher_id, cycle_id, subject, grade, group_name) do nothing;
`;

writeFileSync(`${OUT}/teachers.sql`, teachersSql);

console.log(`instrument.sql  → ${items.length} reactivos`);
console.log(`teachers.sql    → ${people.size} docentes, ${teacherCatalog.length} asignaciones`);
