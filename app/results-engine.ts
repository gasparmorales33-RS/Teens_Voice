/**
 * Motor de resultados.
 *
 * Antes cada pestaña del panel inventaba sus cifras por separado: el
 * comparativo docente salía de un hash del nombre, la matriz de una rampa
 * lineal por índice de pregunta, y las áreas de apoyo y el reporte de
 * literales escritos a mano. Cuatro fuentes distintas describiendo la misma
 * institución, así que no podían respaldarse entre sí.
 *
 * Aquí se genera UN conjunto de respuestas individuales y todas las vistas se
 * agregan a partir de él. La consistencia entre pestañas deja de ser algo que
 * haya que vigilar y pasa a ser una propiedad de la construcción.
 *
 * Los datos son SIMULADOS y deterministas mientras no exista base de datos.
 * `buildDataset` es la costura por donde entrarán las respuestas reales: si
 * devuelve filas de Supabase en vez de generadas, el resto no cambia.
 */

import { teacherCatalog, type TeacherAssignment } from "./teacher-catalog";

/* -------------------------------------------------------------------------
   Instrumento
   El test usa DOS escalas distintas y mezclarlas produciría promedios sin
   sentido, así que se declaran por separado y cada una se agrega con su
   propio criterio de respuesta favorable.
   ------------------------------------------------------------------------- */

/** Docentes: 7 puntos, 1 = Excelente. Menor es mejor. */
export const TEACHER_SCALE_MAX = 7;
/** Directivos, red de apoyo y experiencia IMMA: 4 puntos, 1 = Sí, totalmente. */
export const SUPPORT_SCALE_MAX = 4;

export const teacherQuestions = [
  { id: "q01", dimension: "Cumplimiento profesional", text: "El maestro asiste a todas sus clases." },
  { id: "q02", dimension: "Cumplimiento profesional", text: "El maestro empieza y termina la clase a tiempo." },
  { id: "q03", dimension: "Planeación y evaluación", text: "Explica claramente las reglas de la clase y cómo va a calificar." },
  { id: "q04", dimension: "Dominio y claridad", text: "Conoce bien los temas de la materia." },
  { id: "q05", dimension: "Dominio y claridad", text: "Explica los temas de forma clara y fácil de entender." },
  { id: "q06", dimension: "Acompañamiento", text: "Responde nuestras preguntas y aclara nuestras dudas." },
  { id: "q07", dimension: "Participación y aprendizaje", text: "Motiva a los estudiantes a participar en clase." },
  { id: "q08", dimension: "Participación y aprendizaje", text: "Relaciona los temas con situaciones de la vida diaria." },
  { id: "q09", dimension: "Participación y aprendizaje", text: "Organiza actividades para trabajar en equipo." },
  { id: "q10", dimension: "Recursos didácticos", text: "Utiliza recursos y tecnología que ayudan a aprender." },
  { id: "q11", dimension: "Convivencia y respeto", text: "Trata a los estudiantes con respeto." },
  { id: "q12", dimension: "Convivencia y respeto", text: "Crea un ambiente de confianza, inclusión y respeto." },
  { id: "q13", dimension: "Estrategias didácticas", text: "Hace que sus clases sean dinámicas e interesantes." },
  { id: "q14", dimension: "Planeación y evaluación", text: "Califica de forma clara y de acuerdo con lo que explicó." },
  { id: "q15", dimension: "Valoración global", text: "En general, ¿cómo calificas el trabajo del maestro?" },
] as const;

export const teacherDimensions = [...new Set(teacherQuestions.map((question) => question.dimension))];

/**
 * Áreas de apoyo. Cada reactivo corresponde a una pregunta que el test
 * realmente hace: los `id` coinciden con los del formulario, de modo que el
 * día que lleguen respuestas reales se agregan sin traducción intermedia.
 */
export const supportAreas = [
  {
    area: "Dirección y coordinación",
    icon: "🧭",
    accent: "purple",
    optional: false,
    questions: [
      { id: "director_agreements", label: "Organización y cumplimiento", text: "Cumple los acuerdos y organiza bien las actividades de la escuela." },
      { id: "director_communication", label: "Comunicación", text: "Explica con claridad las decisiones, reglas y cambios importantes." },
      { id: "director_listens", label: "Escucha estudiantil", text: "Escucha a los estudiantes y toma en cuenta lo que pensamos." },
      { id: "director_fair", label: "Respeto y trato justo", text: "Nos trata con respeto y busca soluciones justas." },
      { id: "director_followup", label: "Seguimiento", text: "Da seguimiento a los problemas hasta que se resuelven." },
    ],
  },
  {
    area: "Psicología",
    icon: "🧠",
    accent: "gold",
    optional: true,
    questions: [
      { id: "psych_listens", label: "Escucha", text: "Me escuchó con atención y sin juzgarme." },
      { id: "psych_safe", label: "Confianza", text: "Me hizo sentir en confianza para hablar de lo que me preocupaba." },
      { id: "psych_useful", label: "Orientación útil", text: "Su orientación me ayudó a saber qué podía hacer después." },
    ],
  },
  {
    area: "Enfermería",
    icon: "🩺",
    accent: "cyan",
    optional: true,
    questions: [
      { id: "nurse_care", label: "Atención", text: "Me atendió con amabilidad y tomó en serio lo que sentía." },
      { id: "nurse_clear", label: "Indicaciones claras", text: "Me explicó claramente qué debía hacer." },
      { id: "nurse_followup", label: "Seguimiento", text: "Me indicó cuándo debía regresar o pedir más ayuda." },
    ],
  },
  {
    area: "Tutoría",
    icon: "🤝",
    accent: "blue",
    optional: true,
    questions: [
      { id: "tutor_listens", label: "Escucha", text: "Me escucha cuando tengo una dificultad." },
      { id: "tutor_guidance", label: "Orientación", text: "Me ayuda a encontrar una solución o el apoyo que necesito." },
      { id: "tutor_cares", label: "Interés integral", text: "Se interesa por cómo estamos, no solo por las calificaciones." },
    ],
  },
] as const;

/**
 * Experiencia institucional. Son exactamente las tres preguntas del test.
 * El panel mostraba además un indicador "Respeto" con 91%, el más alto del
 * reporte ejecutivo, que el instrumento nunca pregunta: se retira, porque un
 * indicador sin reactivo que lo respalde es precisamente lo que hay que evitar.
 */
export const institutionalQuestions = [
  { id: "imma_safe", indicator: "Seguridad", text: "Me siento seguro/a dentro del IMMA." },
  { id: "imma_help", indicator: "Acceso a ayuda", text: "Sé con quién pedir ayuda cuando la necesito." },
  { id: "imma_heard", indicator: "Escucha estudiantil", text: "Siento que mi opinión es tomada en cuenta." },
] as const;

/* -------------------------------------------------------------------------
   Generación determinista
   ------------------------------------------------------------------------- */

/** PRNG determinista. Sustituye al `Math.random()` que hacía que dos directivos
 *  con los mismos filtros vieran resultados distintos. */
const mulberry32 = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hashText = (value: string) =>
  [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);

/** Ruido aproximadamente normal: promedio de uniformes. Evita que las
 *  respuestas se vean repartidas de forma plana e irreal. */
const noise = (random: () => number, spread: number) =>
  ((random() + random() + random()) / 3 - 0.5) * 2 * spread;

const clampRound = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(value)));

export type TeacherResponse = { student: number; teacher: string; question: string; value: number };
export type SupportResponse = { student: number; question: string; value: number };

export type Dataset = {
  students: { id: number; grade: string; group: string; responded: boolean }[];
  teacherResponses: TeacherResponse[];
  supportResponses: SupportResponse[];
  universe: number;
  respondents: number;
};

const groupKeys = [...new Set(teacherCatalog.map((teacher) => `${teacher.grade}|||${teacher.group}`))];

/**
 * Construye el conjunto de respuestas individuales.
 *
 * Cada docente tiene una calidad latente estable y cada reactivo una
 * dificultad propia (no monótona: antes la pregunta 1 salía siempre la mejor
 * y la 15 siempre la peor porque el promedio era `1.55 + índice * 0.075`).
 * Cada alumno aporta además su propia severidad, así que dos grupos no salen
 * idénticos ni difieren por una constante fija.
 */
export const buildDataset = (universe: number, respondents: number, cycleSeed = 0): Dataset => {
  const random = mulberry32(0x1a3ac0 ^ cycleSeed);
  const safeUniverse = Math.max(1, Math.round(universe));
  const safeRespondents = Math.max(0, Math.min(safeUniverse, Math.round(respondents)));

  const students = Array.from({ length: safeUniverse }, (_, index) => {
    const [grade, group] = groupKeys[index % groupKeys.length].split("|||");
    return { id: index, grade, group, responded: index < safeRespondents };
  });

  // Calidad latente por docente, en la escala 1–7 donde menor es mejor.
  const teacherQuality = new Map<string, number>();
  for (const teacher of teacherCatalog) {
    const base = mulberry32(hashText(teacher.code) ^ cycleSeed);
    teacherQuality.set(teacher.code, 1.5 + base() * 2.1);
  }

  // Dificultad por reactivo: estable, distinta entre preguntas, sin orden.
  const questionBias = new Map<string, number>();
  for (const question of teacherQuestions) {
    const base = mulberry32(hashText(question.id + "bias"));
    questionBias.set(question.id, (base() - 0.5) * 0.9);
  }

  const supportBias = new Map<string, number>();
  for (const area of supportAreas) {
    // Sesgo por área además del sesgo por reactivo: sin él, al promediar sus
    // tres o cinco preguntas todas las áreas tienden al mismo centro y el
    // panel acaba diciendo que todo requiere atención por igual, que es
    // justo lo que impide priorizar.
    const areaBase = mulberry32(hashText(area.area) ^ cycleSeed);
    const areaOffset = (areaBase() - 0.5) * 0.95;
    for (const question of area.questions) {
      const base = mulberry32(hashText(question.id + "bias") ^ cycleSeed);
      supportBias.set(question.id, 1.72 + areaOffset + base() * 0.5);
    }
  }
  for (const question of institutionalQuestions) {
    const base = mulberry32(hashText(question.id + "bias") ^ cycleSeed);
    supportBias.set(question.id, 1.8 + base() * 0.62);
  }

  const teacherResponses: TeacherResponse[] = [];
  const supportResponses: SupportResponse[] = [];

  for (const student of students) {
    if (!student.responded) continue;
    const severity = noise(random, 0.55);

    const assigned = teacherCatalog.filter(
      (teacher) => teacher.grade === student.grade && teacher.group === student.group,
    );
    for (const teacher of assigned) {
      const quality = teacherQuality.get(teacher.code) ?? 2.4;
      for (const question of teacherQuestions) {
        const value = clampRound(
          quality + (questionBias.get(question.id) ?? 0) + severity + noise(random, 0.85),
          1,
          TEACHER_SCALE_MAX,
        );
        teacherResponses.push({ student: student.id, teacher: teacher.code, question: question.id, value });
      }
    }

    for (const area of supportAreas) {
      // Los servicios opcionales sólo los responde quien los usó: el test pide
      // seleccionar únicamente los que se conocen.
      if (area.optional && random() > 0.55) continue;
      for (const question of area.questions) {
        const value = clampRound(
          (supportBias.get(question.id) ?? 1.8) + severity * 0.6 + noise(random, 0.95),
          1,
          SUPPORT_SCALE_MAX,
        );
        supportResponses.push({ student: student.id, question: question.id, value });
      }
    }

    for (const question of institutionalQuestions) {
      const value = clampRound(
        (supportBias.get(question.id) ?? 1.8) + severity * 0.6 + noise(random, 0.97),
        1,
        SUPPORT_SCALE_MAX,
      );
      supportResponses.push({ student: student.id, question: question.id, value });
    }
  }

  return { students, teacherResponses, supportResponses, universe: safeUniverse, respondents: safeRespondents };
};

/* -------------------------------------------------------------------------
   Agregación
   ------------------------------------------------------------------------- */

const average = (values: number[]) =>
  values.length ? Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(2)) : 0;

/** Índice 0–100 comparable entre las dos escalas: 100 es el mejor resultado
 *  posible en ambas. Es la única conversión que hace el motor, y se aplica
 *  siempre igual, de modo que dos pestañas nunca puedan discrepar. */
export const toIndex = (avg: number, scaleMax: number) =>
  avg > 0 ? Math.round(((scaleMax - avg) / (scaleMax - 1)) * 100) : 0;

export const readingFor = (index: number) =>
  index >= 75 ? "Fortaleza" : index >= 50 ? "Atención" : "Área prioritaria";

export const priorityFor = (index: number) =>
  index >= 80 ? "Fortaleza" : index >= 65 ? "Seguimiento" : "Mejora";

export type Filters = { grade: string; group: string };

export const aggregate = (dataset: Dataset, filters: Filters) => {
  const inScope = (student: { grade: string; group: string }) =>
    (filters.grade === "Todos los grados" || student.grade === filters.grade)
    && (filters.group === "Todos los grupos" || student.group === filters.group);

  const scopedStudents = dataset.students.filter(inScope);
  const scopedIds = new Set(scopedStudents.map((student) => student.id));
  const respondents = scopedStudents.filter((student) => student.responded);

  const teacherRows = dataset.teacherResponses.filter((row) => scopedIds.has(row.student));
  const supportRows = dataset.supportResponses.filter((row) => scopedIds.has(row.student));

  const universe = scopedStudents.length;
  const responseCount = respondents.length;
  const participationRate = universe > 0 ? Math.round((responseCount / universe) * 100) : 0;

  // --- Docentes -----------------------------------------------------------
  const byTeacher = new Map<string, number[]>();
  const byTeacherQuestion = new Map<string, number[]>();
  for (const row of teacherRows) {
    (byTeacher.get(row.teacher) ?? byTeacher.set(row.teacher, []).get(row.teacher)!).push(row.value);
    const key = `${row.teacher}|${row.question}`;
    (byTeacherQuestion.get(key) ?? byTeacherQuestion.set(key, []).get(key)!).push(row.value);
  }

  const teacherByCode = new Map(teacherCatalog.map((teacher) => [teacher.code, teacher]));
  const teachers = [...byTeacher.entries()]
    .map(([code, values]) => {
      const teacher = teacherByCode.get(code) as TeacherAssignment;
      const avg = average(values);
      const index = toIndex(avg, TEACHER_SCALE_MAX);
      const favorable = values.filter((value) => value <= 3).length;
      const critical = values.filter((value) => value >= 5).length;

      const dimensionScores = teacherDimensions.map((dimension) => {
        const ids = teacherQuestions.filter((question) => question.dimension === dimension).map((q) => q.id);
        const scores = ids.flatMap((id) => byTeacherQuestion.get(`${code}|${id}`) ?? []);
        const dimensionAverage = average(scores);
        return { dimension, average: dimensionAverage, index: toIndex(dimensionAverage, TEACHER_SCALE_MAX) };
      }).filter((entry) => entry.average > 0);

      const ranked = [...dimensionScores].sort((a, b) => b.index - a.index);
      return {
        ...teacher,
        responses: new Set(teacherRows.filter((row) => row.teacher === code).map((row) => row.student)).size,
        answers: values.length,
        average: avg,
        index,
        favorable,
        critical,
        favorablePct: values.length ? Math.round((favorable / values.length) * 100) : 0,
        criticalPct: values.length ? Math.round((critical / values.length) * 100) : 0,
        dimensions: dimensionScores,
        strength: ranked[0]?.dimension ?? "",
        opportunity: ranked[ranked.length - 1]?.dimension ?? "",
        priority: priorityFor(index),
      };
    })
    .sort((a, b) => b.index - a.index);

  // --- Matriz por reactivo y dimensión ------------------------------------
  const questions = teacherQuestions.map((question) => {
    const values = teacherRows.filter((row) => row.question === question.id).map((row) => row.value);
    const avg = average(values);
    const index = toIndex(avg, TEACHER_SCALE_MAX);
    const favorable = values.filter((value) => value <= 3).length;
    const critical = values.filter((value) => value >= 5).length;
    return {
      ...question,
      responses: values.length,
      average: avg,
      performanceIndex: index,
      favorable,
      critical,
      level: readingFor(index),
    };
  });

  const dimensions = teacherDimensions.map((dimension) => {
    const rows = questions.filter((question) => question.dimension === dimension);
    const values = teacherRows.filter((row) =>
      rows.some((question) => question.id === row.question),
    ).map((row) => row.value);
    const avg = average(values);
    const index = toIndex(avg, TEACHER_SCALE_MAX);
    return { dimension, questions: rows.length, average: avg, performanceIndex: index, level: readingFor(index) };
  });

  // --- Áreas de apoyo -----------------------------------------------------
  const support = supportAreas.map((area) => {
    const questionResults = area.questions.map((question) => {
      const values = supportRows.filter((row) => row.question === question.id).map((row) => row.value);
      const avg = average(values);
      return {
        ...question,
        responses: values.length,
        average: avg,
        index: toIndex(avg, SUPPORT_SCALE_MAX),
        positive: values.length ? Math.round((values.filter((value) => value <= 2).length / values.length) * 100) : 0,
      };
    });
    const answered = questionResults.filter((question) => question.responses > 0);
    const areaIndex = answered.length
      ? Math.round(answered.reduce((total, question) => total + question.index, 0) / answered.length)
      : 0;
    return {
      ...area,
      questions: questionResults,
      responses: Math.max(0, ...questionResults.map((question) => question.responses)),
      index: areaIndex,
      average: answered.length ? average(answered.map((question) => question.average)) : 0,
      level: readingFor(areaIndex),
    };
  });

  // --- Experiencia institucional -----------------------------------------
  const indicators = institutionalQuestions.map((question) => {
    const values = supportRows.filter((row) => row.question === question.id).map((row) => row.value);
    const avg = average(values);
    const index = toIndex(avg, SUPPORT_SCALE_MAX);
    return {
      ...question,
      responses: values.length,
      average: avg,
      index,
      value: values.length ? Math.round((values.filter((value) => value <= 2).length / values.length) * 100) : 0,
      reading: readingFor(index),
    };
  });

  const institutionAverage = average(teacherRows.map((row) => row.value));
  const institutionIndex = toIndex(institutionAverage, TEACHER_SCALE_MAX);
  const supportIndex = support.filter((area) => area.responses > 0);
  const experienceIndex = Math.round(
    [institutionIndex, ...indicators.filter((i) => i.responses > 0).map((i) => i.index), ...supportIndex.map((a) => a.index)]
      .reduce((total, value, _index, list) => total + value / list.length, 0),
  );

  return {
    universe,
    responseCount,
    participationRate,
    analysisReady: participationRate > 50 && responseCount >= 10,
    responsesNeeded: Math.max(0, Math.floor(universe * 0.5) + 1 - responseCount),
    teachers,
    questions,
    dimensions,
    support,
    indicators,
    institutionAverage,
    institutionIndex,
    experienceIndex,
    favorablePct: teacherRows.length
      ? Math.round((teacherRows.filter((row) => row.value <= 3).length / teacherRows.length) * 100)
      : 0,
  };
};

export type Aggregate = ReturnType<typeof aggregate>;
