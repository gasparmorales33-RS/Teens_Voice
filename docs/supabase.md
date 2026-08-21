# Migración a Supabase

Guía operativa para pasar de datos simulados en el navegador a una base de
datos real. Todo el SQL vive en `supabase/` y su sintaxis está verificada.

## Qué se resuelve con esta migración

| Hoy | Después |
| --- | --- |
| Las respuestas viven en `localStorage`, por dispositivo | Persisten y se agregan entre todos los alumnos |
| El panel muestra datos simulados por `results-engine.ts` | Muestra respuestas reales, agregadas por las vistas |
| Matrícula y respuestas se teclean a mano en el panel | Salen de `enrollment` y del conteo real de sesiones |
| Acceso con `admin` / `imma2026` incrustado en el bundle | Supabase Auth con perfiles en la tabla `staff` |
| La regla de mínimo 10 respuestas vive en la interfaz | La imponen las vistas, en el servidor |

## Orden de ejecución

Las migraciones son acumulativas y deben correr en orden. El nombre del archivo
manda porque unas dependen de otras: las vistas usan las funciones de `0002`, y
las políticas de `0004` usan `is_staff()`, definida también en `0002`.

```
supabase/migrations/0001_core.sql        Tablas
supabase/migrations/0002_helpers.sql     Funciones de permisos y de escala
supabase/migrations/0003_views.sql       Agregados con umbral mínimo
supabase/migrations/0004_rls.sql         Políticas de acceso
supabase/migrations/0005_integrity.sql   Disparadores de validación
supabase/migrations/0006_tokens.sql      Fichas de participación
supabase/migrations/0007_evaluated_staff.sql  Personal evaluable y optativas
supabase/seed/instrument.sql             32 reactivos
supabase/seed/teachers.sql               18 docentes · 95 asignaciones
supabase/seed/electives.sql              6 docentes · 7 niveles de inglés
supabase/seed/staff.sql                  Equipo directivo y red de apoyo
```

Desde el editor SQL del panel de Supabase, pegando cada archivo en orden. O por
línea de comandos:

```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_core.sql
# …y así con el resto, en orden
```

Los archivos de `seed/` se regeneran desde el código, nunca se editan a mano:

```bash
npx tsx scripts/export-supabase-seed.mts
```

Así el instrumento de la base de datos no puede desalinearse de lo que la
aplicación pregunta. Si cambia el catálogo docente el próximo ciclo, se edita
`app/teacher-catalog.ts`, se regenera y se vuelve a sembrar.

## Después de sembrar

1. **Registrar la matrícula.** Es el denominador de la participación. Sin ella,
   `v_participation` no devuelve filas.

   ```sql
   insert into enrollment (cycle_id, grade, group_name, student_count) values
     ('2026-2027', '1.º de secundaria', 'Grupo A', 11);
   ```

2. **Crear la primera cuenta de personal.** Se da de alta en Supabase Auth
   (Authentication → Users → Add user) y luego se enlaza:

   ```sql
   insert into staff (id, full_name, role)
   values ('<uuid de auth.users>', 'Nombre Apellido', 'direccion');
   ```

   Perfiles disponibles: `direccion` (todo, incluida la gestión de personal),
   `coordinacion` (modera comentarios y edita matrícula), `lectura` (sólo
   consulta).

3. **Abrir el ciclo.** Mientras `is_open` sea `false`, las políticas rechazan
   toda inserción de respuestas. Es el interruptor de la aplicación del test.

   ```sql
   update cycles set is_open = true where id = '2026-2027';
   ```

## Fichas de participación

Cada alumno necesita una ficha de un solo uso para poder responder. Es lo que
permite a la vez impedir respuestas repetidas y conocer la participación real,
sin identificar a nadie.

**Emitir**, por grupo, tantas como alumnos haya:

```sql
select * from issue_tokens('2026-2027', '1.º de secundaria', 'Grupo A', 11);
```

Devuelve los códigos en claro **una sola vez**. La base guarda únicamente su
hash, así que no hay forma de recuperarlos después: se imprimen o se copian en
ese momento, y si se pierden se emiten otros.

**Repartir al azar y sin registro.** Es la única parte que la base de datos no
puede proteger: si alguien anota qué ficha recibió cada alumno, el anonimato se
rompe fuera del sistema.

**Seguir el avance** sin ver ningún código:

```sql
select * from v_token_progress;
```

**Canjear** ocurre desde la aplicación cuando el alumno escribe su código.
`redeem_token` verifica la ficha, la marca usada y abre la sesión en la misma
transacción, sin dejar rastro de la correspondencia entre ambas.

La ficha guarda si se usó, pero no cuándo. Con unos diez alumnos por grupo, una
marca de tiempo permitiría cruzar el canje con la entrada de una respuesta.

## Moderación de comentarios

Coordinación revisa desde el panel antes de que nada se muestre. Los estados de
`comments.review_status`:

| Estado | Significado |
| --- | --- |
| `pending` | Recién recibido. Nadie lo ha leído y no se muestra |
| `approved` | Revisado, se muestra tal cual |
| `redacted` | Se editó para quitar datos identificables; se muestra `published_body` |
| `reserved` | Contenido sensible. No se expone; se atiende por el circuito confidencial |

`v_published_comments` sólo devuelve `approved` y `redacted`.

## Decisiones de diseño que conviene no revertir

**No existe tabla de alumnos.** La aplicación promete "no pediremos tu nombre,
matrícula ni correo". La matrícula se guarda agregada por grupo, que es todo lo
que necesita el cálculo de participación.

**`response_sessions.submitted_on` es `date`, no `timestamptz`.** Con unos diez
alumnos por grado-grupo, una marca de tiempo precisa permitiría correlacionar
quién estaba respondiendo a esa hora con la respuesta que entró en ese instante.

**El panel no puede leer `responses`.** No hay política de `SELECT` para el
personal sobre esa tabla, a propósito. El panel consulta las vistas, que aplican
el umbral mínimo de diez respuestas antes de exponer nada. Las vistas son
`SECURITY DEFINER` para poder agregar sobre una tabla que quien consulta no
puede leer, y cada una lleva un guardia `is_staff()`.

**Los comentarios nacen en `pending` y no se muestran hasta revisarse.** El
texto libre es lo que puede identificar a un alumno o nombrar a un tercero.
`v_published_comments` sólo expone los que están en `approved` o `redacted`.

## Fases de integración en la aplicación

La migración de datos y la de código pueden ir por separado. El motor actual
está construido para eso: `aggregate()` en `app/results-engine.ts` produce
exactamente las formas que devuelven las vistas.

1. **Base de datos en pie, aplicación intacta.** Se corren migraciones y semilla.
   La app sigue con datos simulados. Sin riesgo.
2. **Escritura.** El test envía a Supabase además de guardar en `localStorage`.
   El panel sigue simulado. Se puede verificar que llegan respuestas reales.
3. **Lectura.** El panel pasa a consultar las vistas. `buildDataset()` deja de
   usarse; `aggregate()` se sustituye por las consultas equivalentes.
4. **Autenticación.** Se retira `admin` / `imma2026` y entra Supabase Auth.

El paso 4 conviene no dejarlo para el final: mientras siga ahí, el panel
publicado en Vercel expone evaluaciones docentes con nombre y apellido a
cualquiera que abra las herramientas del navegador.

## Correspondencia entre el motor y las vistas

| `results-engine.ts` | Vista |
| --- | --- |
| `results.participationRate`, `universe`, `responseCount` | `v_participation` |
| `results.questions` | `v_item_results` |
| `results.teachers` | `v_teacher_results` |
| `results.dimensions` | `v_dimension_results` |
| `results.support`, `results.indicators` | `v_support_results` |
| comentarios reales del test | `v_published_comments` |
| `toIndex()` | `to_index()` |
| `readingFor()` | `reading_for()` |
| umbral de análisis (10 respuestas) | `min_responses_threshold()` |

Las dos implementaciones deben mantenerse alineadas mientras convivan. Cuando la
lectura pase a Supabase, la de TypeScript puede retirarse.
