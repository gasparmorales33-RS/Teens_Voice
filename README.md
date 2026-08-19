# IMAA Teens Voice

Prototipo navegable del test anónimo de experiencia estudiantil del Instituto Mexicano de Alto Aprendizaje.

## Contenido

- Test anónimo dividido por niveles.
- Selección de 1.º, 2.º y 3.º de secundaria y 1.º de preparatoria.
- Grupos A, B y C.
- Evaluación individual de siete docentes con checklist.
- Evaluación de directivos, Psicología, Enfermería y Tutoría.
- Comentarios, reconocimientos y semáforo institucional.
- Guardado temporal de respuestas en el dispositivo.
- Panel de resultados protegido para personal autorizado.
- Filtros combinables por ciclo, grado, grupo y área.
- Resumen, análisis docente, voz del alumnado y reporte ejecutivo.
- Exportación demostrativa para Excel y PDF.
- Regla de participación superior al 50 % y mínimo de 10 respuestas.
- Logotipo oficial e identidad visual azul marino, blanca y amarillo girasol.

## Requisitos

- Node.js 22.13 o posterior.
- npm (el proyecto usa `package-lock.json`).

## Instalación

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000` en el navegador.

Para verificar la versión de producción:

```bash
npm run build
```

## Acceso administrativo de demostración

- Usuario: `admin`
- Contraseña: `imma2026`

Estas credenciales están incorporadas únicamente para la demostración local. Antes de publicar el sistema se debe implementar autenticación del lado del servidor, almacenamiento seguro de contraseñas y perfiles de autorización.

## Archivos principales

- `app/page.tsx`: formulario, navegación, análisis, filtros y reportes.
- `app/teacher-catalog.ts`: catálogo de docentes por grado y grupo.
- `app/globals.css`: identidad visual y diseño adaptable.
- `app/layout.tsx`: metadatos y tipografías.
- `public/imma-logo.png`: logotipo mostrado por la aplicación.
- `public/IMMA_Teens_Voice_Evaluacion_Docente_Plantilla.xlsx`: plantilla base de la exportación docente.
- `package.json`: dependencias y comandos.

## Despliegue

El proyecto es una aplicación Next.js estándar y se despliega en Vercel sin
configuración adicional: Vercel detecta el framework, ejecuta `npm run build` y
publica el resultado. Cada push a `main` genera un despliegue nuevo.

## Funcionamiento de la participación

El sistema almacena respuestas desde el inicio, pero solamente habilita interpretaciones, comparaciones y exportaciones cuando:

1. La participación es mayor al 50 % de la matrícula seleccionada.
2. Existen por lo menos 10 respuestas válidas.

En el prototipo, la matrícula y las respuestas recibidas pueden modificarse manualmente desde el panel. En producción deberán sincronizarse con la fuente institucional externa.

## Consideraciones para producción

- Mover la autenticación y autorización al servidor.
- Sustituir los datos demostrativos por una base institucional.
- Incorporar cuentas y permisos por perfil.
- Guardar respuestas anónimas sin identificadores personales.
- Registrar matrícula agregada por ciclo, grado y grupo.
- Generar archivos PDF y XLSX desde servicios del servidor.
- Mantener auditoría de accesos al panel administrativo.
- Aplicar políticas de respaldo, retención y eliminación de información.
- Revisar comentarios antes de mostrarlos al personal evaluado.

## Privacidad

El test no debe solicitar nombre, matrícula, correo ni teléfono del estudiante. Los comentarios deberán anonimizarse antes de ser canalizados o incluidos en reportes.
