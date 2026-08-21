/**
 * Personal evaluable distinto de los docentes: equipo directivo y red de apoyo.
 *
 * Antes estas cuatro personas estaban escritas dentro del formulario, así que
 * sólo podía existir una por área y sus resultados se guardaban como si fueran
 * de la institución entera. Con varios directivos, o con un tutor por grupo,
 * todas las respuestas se habrían sumado juntas sin poder distinguir a quién
 * correspondía cada una.
 *
 * IMPORTANTE: los registros de abajo son los que venían en el prototipo y
 * sirven de ejemplo de formato. Hay que sustituirlos por el personal real antes
 * de aplicar el instrumento.
 */

export type StaffRole = "directivo" | "psicologia" | "enfermeria" | "tutoria";

export type EvaluatedStaff = {
  code: string;
  name: string;
  initials: string;
  /** Cargo tal como se muestra al alumno. */
  title: string;
  role: StaffRole;
  /**
   * `escuela`: lo evalúan todos los alumnos.
   * `grupo`:   sólo lo evalúan los alumnos de su grado y grupo, como la tutoría.
   */
  scope: "escuela" | "grupo";
  grade?: string;
  group?: string;
};

export const staffCatalog: EvaluatedStaff[] = [
  {
    code: "luis-rodriguez",
    name: "Lic. Luis Rodríguez",
    initials: "LR",
    title: "Coordinación académica",
    role: "directivo",
    scope: "escuela",
  },
  {
    code: "elena-vargas",
    name: "Lic. Elena Vargas",
    initials: "EV",
    title: "Psicología y orientación IMMA",
    role: "psicologia",
    scope: "escuela",
  },
  {
    code: "ana-sanchez",
    name: "Enf. Ana Sánchez",
    initials: "AS",
    title: "Enfermería y salud escolar",
    role: "enfermeria",
    scope: "escuela",
  },
  {
    code: "mariana-lopez",
    name: "Lic. Mariana López",
    initials: "ML",
    title: "Tutora de acompañamiento",
    role: "tutoria",
    scope: "grupo",
    grade: "1.º de secundaria",
    group: "Grupo A",
  },
];

/** Reactivos que se aplican a cada rol. Coinciden con los de results-engine. */
export const staffQuestions: Record<StaffRole, { id: string; text: string; dimension?: string }[]> = {
  directivo: [
    { id: "director_agreements", text: "Cumple los acuerdos y organiza bien las actividades de la escuela.", dimension: "Organización y cumplimiento" },
    { id: "director_communication", text: "Explica con claridad las decisiones, reglas y cambios importantes.", dimension: "Comunicación" },
    { id: "director_listens", text: "Escucha a los estudiantes y toma en cuenta lo que pensamos.", dimension: "Escucha estudiantil" },
    { id: "director_fair", text: "Nos trata con respeto y busca soluciones justas.", dimension: "Respeto y trato justo" },
    { id: "director_followup", text: "Da seguimiento a los problemas hasta que se resuelven.", dimension: "Seguimiento" },
  ],
  psicologia: [
    { id: "psych_listens", text: "Me escuchó con atención y sin juzgarme." },
    { id: "psych_safe", text: "Me hizo sentir en confianza para hablar de lo que me preocupaba." },
    { id: "psych_useful", text: "Su orientación me ayudó a saber qué podía hacer después." },
  ],
  enfermeria: [
    { id: "nurse_care", text: "Me atendió con amabilidad y tomó en serio lo que sentía." },
    { id: "nurse_clear", text: "Me explicó claramente qué debía hacer." },
    { id: "nurse_followup", text: "Me indicó cuándo debía regresar o pedir más ayuda." },
  ],
  tutoria: [
    { id: "tutor_listens", text: "Me escucha cuando tengo una dificultad." },
    { id: "tutor_guidance", text: "Me ayuda a encontrar una solución o el apoyo que necesito." },
    { id: "tutor_cares", text: "Se interesa por cómo estamos, no solo por las calificaciones." },
  ],
};

export const roleLabels: Record<StaffRole, { label: string; icon: string; accent: string }> = {
  directivo: { label: "Dirección y coordinación", icon: "🧭", accent: "purple" },
  psicologia: { label: "Psicología", icon: "🧠", accent: "gold" },
  enfermeria: { label: "Enfermería", icon: "🩺", accent: "cyan" },
  tutoria: { label: "Tutoría", icon: "🤝", accent: "blue" },
};

/** Personal que le corresponde evaluar a un alumno de cierto grado y grupo. */
export const staffForStudent = (grade: string, group: string) =>
  staffCatalog.filter(
    (person) =>
      person.scope === "escuela" || (person.grade === grade && person.group === group),
  );

/** Identificador del reactivo. Mismo patrón que `teacher_<code>_<id>`. */
export const staffAnswerKey = (code: string, questionId: string) => `staff_${code}_${questionId}`;
