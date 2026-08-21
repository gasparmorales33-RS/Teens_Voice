/**
 * Separa las optativas de inglés del catálogo por grado y grupo.
 *
 * Estaban guardadas con grade "Optativas de secundaria" y group "Ingles", de
 * modo que el alumno las veía en el selector como si fueran un grado más. Peor:
 * seis de los siete docentes de inglés existían SÓLO ahí, sin ninguna
 * asignación en un grado real, así que ningún alumno llegaba nunca a
 * evaluarlos.
 *
 * El inglés se cursa por nivel (Basic, Middle, Advance) y eso cruza los grados,
 * que es justo lo que el modelo grado+grupo no puede representar.
 *
 *   node scripts/split-electives.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";

const FILE = "app/teacher-catalog.ts";
const source = readFileSync(FILE, "utf8");
const start = source.indexOf("= [") + 2;
const catalog = JSON.parse(source.slice(start, source.lastIndexOf("]") + 1));

const isElective = (entry) => entry.grade === "Optativas de secundaria";
const grouped = catalog.filter((entry) => !isElective(entry));
const electives = catalog.filter(isElective).map((entry) => ({
  code: entry.code,
  name: entry.name,
  initials: entry.initials,
  subject: entry.subject,
  level: entry.level,
  // El nombre de la materia ES el nivel que cursa el alumno.
  stream: entry.subject,
}));

const json = (rows) => JSON.stringify(rows, null, 2).replace(/^/gm, "  ").trim();

const output = `export type TeacherAssignment = {
  code: string;
  name: string;
  initials: string;
  subject: string;
  level: "Secundaria" | "Preparatoria";
  grade: string;
  group: string;
};

/**
 * Optativa de inglés. No pertenece a un grupo: el alumno cursa un nivel
 * (Basic, Middle, Advance) que cruza los grados, y lo indica al responder.
 */
export type ElectiveAssignment = {
  code: string;
  name: string;
  initials: string;
  subject: string;
  level: "Secundaria" | "Preparatoria";
  stream: string;
};

export const teacherCatalog: TeacherAssignment[] = ${json(grouped)};

export const electiveCatalog: ElectiveAssignment[] = ${json(electives)};

/** Niveles de inglés que puede elegir un alumno de secundaria. */
export const electiveStreams = [...new Set(electiveCatalog.map((item) => item.stream))].sort((a, b) =>
  a.localeCompare(b, "es"),
);
`;

writeFileSync(FILE, output);
console.log(`asignaciones por grupo: ${grouped.length}`);
console.log(`optativas de inglés:    ${electives.length}`);
console.log(`niveles de inglés:      ${[...new Set(electives.map((e) => e.stream))].length}`);
