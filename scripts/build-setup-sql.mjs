/**
 * Concatena las migraciones y las semillas en dos archivos listos para pegar en
 * el editor SQL de Supabase, respetando el orden de dependencias.
 *
 * Se genera en vez de mantenerse a mano para que no pueda quedar desactualizado
 * respecto a supabase/migrations y supabase/seed.
 *
 *   node scripts/build-setup-sql.mjs
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "supabase/setup";
mkdirSync(OUT, { recursive: true });

const banner = (titulo, detalle) => `
-- ═══════════════════════════════════════════════════════════════════════════
-- ${titulo}
-- ${detalle}
-- ═══════════════════════════════════════════════════════════════════════════
`;

const build = (carpeta, archivos, encabezado) => {
  const partes = archivos.map((nombre) => {
    const sql = readFileSync(join("supabase", carpeta, nombre), "utf8").trimEnd();
    return `${banner(nombre, `origen: supabase/${carpeta}/${nombre}`)}\n${sql}\n`;
  });
  return `${encabezado}\n${partes.join("\n")}\n`;
};

/* ---------------------------------------------------------------------------
   Migraciones. El orden es obligatorio: las vistas de 0003 usan las funciones
   de 0002, y las políticas de 0004 usan is_staff(), definida también en 0002.
   --------------------------------------------------------------------------- */
const migraciones = readdirSync("supabase/migrations").sort();

const cabeceraMigraciones = `-- ###########################################################################
-- IMAA Teens Voice · Instalación completa de la base de datos
--
-- Generado por scripts/build-setup-sql.mjs · NO editar a mano.
-- Contiene ${migraciones.length} migraciones concatenadas en orden de dependencia.
--
-- CÓMO USARLO
--   1. Supabase → SQL Editor → New query
--   2. Pegar TODO este archivo
--   3. Run
--
-- Debe terminar con "Success. No rows returned".
--
-- SE EJECUTA UNA SOLA VEZ. Las tablas se crean sin "if not exists" a
-- propósito: si vuelves a ejecutarlo sobre una base ya instalada, fallará en la
-- primera tabla en lugar de alterar en silencio algo que ya funcionaba.
--
-- Después de esto hay que correr 02-catalogos.sql para sembrar el instrumento
-- y los catálogos.
-- ###########################################################################
`;

writeFileSync(`${OUT}/01-instalacion.sql`, build("migrations", migraciones, cabeceraMigraciones));

/* ---------------------------------------------------------------------------
   Semillas. instrument.sql va primero porque crea el ciclo escolar al que se
   enganchan las asignaciones docentes.
   --------------------------------------------------------------------------- */
const semillas = ["instrument.sql", "teachers.sql", "electives.sql", "staff.sql"];

const cabeceraSemillas = `-- ###########################################################################
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
`;

writeFileSync(`${OUT}/02-catalogos.sql`, build("seed", semillas, cabeceraSemillas));

const tamaño = (archivo) => `${Math.round(readFileSync(archivo, "utf8").length / 1024)} KB`;
console.log(`01-instalacion.sql  ${migraciones.length} migraciones · ${tamaño(`${OUT}/01-instalacion.sql`)}`);
console.log(`02-catalogos.sql    ${semillas.length} semillas · ${tamaño(`${OUT}/02-catalogos.sql`)}`);
