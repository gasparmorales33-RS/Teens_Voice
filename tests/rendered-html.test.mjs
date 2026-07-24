import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the IMAA student experience form", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>IMAA Teens Voice<\/title>/i);
  assert.match(html, /Tu voz puede mejorar el/);
  assert.match(html, /100 % anónimo/);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working/i);
});

test("keeps the prototype privacy copy and production warning", async () => {
  const [page, readme] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /No pediremos tu nombre, matrícula ni correo/);
  assert.match(page, /localStorage\.removeItem\("imma-teens-voice-preview"\)/);
  assert.match(readme, /Antes de publicar el sistema se debe implementar autenticación del lado del servidor/);
});

test("uses the selected scope in exports and classifies teacher comments", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /exportScopeSlug/);
  assert.match(page, /Comentarios docentes/);
  assert.match(page, /Desplegar comentarios/);
  assert.match(page, /Reconocimiento/);
  assert.match(page, /Sugerencia/);
  assert.match(page, /Experiencia de aula/);
  assert.match(page, /exportTeacherPdf/);
  assert.match(page, /Ficha individual docente/);
  assert.match(page, /Descargar ficha PDF/);
  assert.match(page, /exportStudentVoicePdf/);
  assert.match(page, /Ficha · Voz del alumnado/);
  assert.match(page, /Exportar ficha PDF/);
  assert.match(page, /Cómo interpretar esta vista/);
  assert.match(page, /voiceProfiles/);
  assert.match(page, /voiceThemes\.map/);
  assert.match(page, /voiceComments\.filter/);
  assert.match(page, /Respuestas encuesta/);
  assert.match(page, /Indicadores docentes/);
  assert.match(page, /Servicios de apoyo/);
  assert.match(page, /addSheet\("Hallazgos"/);
  assert.match(page, /addSheet\("Metodología"/);
  assert.match(page, /exportChannelPdf/);
  assert.match(page, /Ficha de canalización/);
  assert.match(page, /IMAA-Canalizacion-/);
  assert.match(page, /institutionalReport/);
  assert.match(page, /Plan de acción sugerido para/);
  assert.match(page, /Lectura del área/);
  assert.match(page, /Mtra\. Sofía Fernández/);
  assert.match(page, /Dirección y coordinación.*La búsqueda de soluciones justas/s);
  assert.match(page, /cycle-comparison/);
  assert.match(page, /imaa-action-statuses-preview/);
});
