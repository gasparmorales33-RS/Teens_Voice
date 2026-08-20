"use client";

import { useEffect, useState } from "react";
import { teacherCatalog, type TeacherAssignment } from "./teacher-catalog";

type Answers = Record<string, string | string[]>;

const levels = [
  "Bienvenida",
  "Tú en el IMMA",
  "Docentes",
  "Directivos",
  "Red de apoyo",
  "Tus ideas",
  "Cierre",
];

const scale = [
  ["😄", "Sí, totalmente"],
  ["🙂", "Casi siempre"],
  ["😕", "Pocas veces"],
  ["😣", "No, para nada"],
];

const teacherScale = [
  ["1", "Excelente"], ["2", "Muy bueno"], ["3", "Bueno"], ["4", "Regular"],
  ["5", "Malo"], ["6", "Muy malo"], ["7", "Pésimo"],
];

const teacherQuestions = [
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
];

const teacherDimensions = [...new Set(teacherQuestions.map((question) => question.dimension))];

const exampleTeachers = [
  { code: "matematicas", initials: "AM", name: "Mtra. Andrea Martínez", subject: "Matemáticas" },
  { code: "espanol", initials: "CR", name: "Mtro. Carlos Ramírez", subject: "Español" },
  { code: "ciencias", initials: "LG", name: "Mtra. Laura García", subject: "Ciencias" },
  { code: "ingles", initials: "JP", name: "Mtro. Javier Pérez", subject: "Inglés" },
  { code: "historia", initials: "SF", name: "Mtra. Sofía Fernández", subject: "Historia" },
  { code: "tecnologia", initials: "RM", name: "Mtro. Ricardo Morales", subject: "Tecnología" },
  { code: "artes", initials: "DV", name: "Mtra. Diana Vázquez", subject: "Artes" },
];

const catalogGrades = [...new Set(teacherCatalog.map((teacher) => teacher.grade))];
const matrixGeneralLabel = "Resultado general · todos los docentes";
const resultTabs = [
  { id: "overview", icon: "◫", label: "Resumen", description: "Panorama general y prioridades" },
  { id: "teachers", icon: "◎", label: "Docentes", description: "Comparativo y detalle individual" },
  { id: "matrix", icon: "▦", label: "Matriz", description: "Resultados por reactivo y dimensión" },
  { id: "support", icon: "◇", label: "Dirección y apoyo", description: "Experiencia con servicios y directivos" },
  { id: "comments", icon: "◌", label: "Voz del alumnado", description: "Temas, propuestas y comentarios" },
  { id: "report", icon: "▤", label: "Reporte", description: "Hallazgos y plan de acción" },
] as const;
const catalogGroupsForGrade = (grade: string) => [...new Set(teacherCatalog.filter((teacher) => teacher.grade === grade).map((teacher) => teacher.group))];
const hashText = (value: string) => [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
const buildTeacherAnalysis = (teacher: TeacherAssignment) => {
  const seed = hashText(`${teacher.name}-${teacher.subject}`);
  const score = Number((3.7 + (seed % 10) / 10).toFixed(1));
  const positive = Math.min(94, 72 + (seed % 23));
  const indicators = [0, 1, 2, 3].map((offset) => Math.min(97, Math.max(65, positive + ((seed >> (offset * 3)) % 11) - 5)));
  const strengths = ["Claridad al explicar", "Trato respetuoso", "Dominio de la materia", "Participación en clase", "Aplicación práctica"];
  const opportunities = ["Diversificar actividades", "Retroalimentación más frecuente", "Confianza para preguntar", "Ritmo de explicación", "Criterios de evaluación"];
  return {
    ...teacher,
    score,
    positive,
    responses: 22 + (seed % 8),
    trend: `${seed % 5 === 0 ? "-" : "+"}${1 + (seed % 6)}%`,
    strength: strengths[seed % strengths.length],
    opportunity: opportunities[(seed + 2) % opportunities.length],
    priority: positive >= 86 ? "Fortaleza" : positive >= 78 ? "Seguimiento" : "Mejora",
    indicators,
    recommendation: `Conservar las prácticas que facilitan el aprendizaje en ${teacher.subject} y acordar una mejora observable con seguimiento durante el siguiente periodo.`,
    comments: [
      { category: "Reconocimiento", text: `Las explicaciones y actividades de ${teacher.subject} ayudan a comprender los temas.` },
      { category: "Sugerencia", text: "Sería útil contar con más ejemplos y retroalimentación durante las actividades." },
      { category: "Experiencia de aula", text: "El ambiente de la clase permite participar y expresar dudas." },
    ],
  };
};

const teacherAnalysis = [
  { name: "Mtra. Andrea Martínez", subject: "Matemáticas", score: 4.6, positive: 91, responses: 28, trend: "+6%", strength: "Claridad al explicar", opportunity: "Diversificar actividades", priority: "Fortaleza", indicators: [94, 96, 88, 86], recommendation: "Conservar la secuencia de explicación y sumar una actividad práctica o visual por tema para atender distintos estilos de aprendizaje.", comments: [{ category: "Reconocimiento", text: "Explica de distintas maneras hasta que todos entendemos." }, { category: "Sugerencia", text: "Me ayudaría practicar con ejemplos de situaciones reales." }, { category: "Experiencia de aula", text: "Puedo preguntar sin sentir que voy atrasando al grupo." }] },
  { name: "Mtro. Carlos Ramírez", subject: "Español", score: 4.1, positive: 82, responses: 27, trend: "+2%", strength: "Trato respetuoso", opportunity: "Retroalimentación más frecuente", priority: "Seguimiento", indicators: [84, 92, 76, 81], recommendation: "Incorporar una devolución breve con un logro y un siguiente paso en cada entrega; verificar comprensión antes de iniciar una actividad nueva.", comments: [{ category: "Reconocimiento", text: "Escucha nuestras opiniones y mantiene el respeto en clase." }, { category: "Sugerencia", text: "Quisiera saber con más claridad qué puedo mejorar en mis trabajos." }, { category: "Experiencia de aula", text: "Las conversaciones en grupo me ayudan a participar." }] },
  { name: "Mtra. Laura García", subject: "Ciencias", score: 3.8, positive: 74, responses: 26, trend: "-3%", strength: "Dominio de la materia", opportunity: "Confianza para preguntar", priority: "Mejora", indicators: [82, 86, 73, 65], recommendation: "Abrir pausas de preguntas anónimas y cerrar cada explicación con una comprobación breve de comprensión antes de avanzar.", comments: [{ category: "Reconocimiento", text: "Sabe mucho de los temas y relaciona la clase con experimentos." }, { category: "Sugerencia", text: "A veces necesito más tiempo para preguntar o anotar." }, { category: "Experiencia de aula", text: "Participo más cuando trabajamos en equipos pequeños." }] },
  { name: "Mtro. Javier Pérez", subject: "Inglés", score: 4.4, positive: 87, responses: 28, trend: "+4%", strength: "Participación en clase", opportunity: "Ritmo de explicación", priority: "Fortaleza", indicators: [87, 93, 85, 84], recommendation: "Mantener la participación oral y alternar momentos de práctica guiada con pausas breves para quienes necesitan consolidar vocabulario.", comments: [{ category: "Reconocimiento", text: "Hace que todos participemos sin miedo a equivocarnos." }, { category: "Sugerencia", text: "Podría repetir un poco más despacio las instrucciones largas." }, { category: "Experiencia de aula", text: "Los juegos y conversaciones hacen más fácil aprender." }] },
  { name: "Mtra. Sofía Fernández", subject: "Historia", score: 4.2, positive: 84, responses: 27, trend: "+3%", strength: "Relación entre temas", opportunity: "Variedad de recursos", priority: "Seguimiento", indicators: [88, 91, 79, 80], recommendation: "Mantener la conexión entre hechos y contextos actuales, e incorporar mapas, líneas de tiempo o fuentes breves para diversificar la comprensión.", comments: [{ category: "Reconocimiento", text: "Relaciona los temas y ayuda a entender por qué sucedieron." }, { category: "Sugerencia", text: "Me ayudarían más mapas y líneas del tiempo." }, { category: "Experiencia de aula", text: "Los debates hacen que recordemos mejor los temas." }] },
  { name: "Mtro. Ricardo Morales", subject: "Tecnología", score: 4.0, positive: 80, responses: 25, trend: "+1%", strength: "Aplicación práctica", opportunity: "Instrucciones por etapas", priority: "Seguimiento", indicators: [79, 89, 78, 76], recommendation: "Dividir los proyectos en entregas breves con criterios visibles y comprobar que todo el grupo comprenda el siguiente paso antes de avanzar.", comments: [{ category: "Reconocimiento", text: "Aprendemos haciendo proyectos que sí podemos usar." }, { category: "Sugerencia", text: "Quisiera que las instrucciones de los proyectos estuvieran por pasos." }, { category: "Experiencia de aula", text: "Trabajar en equipo ayuda cuando una herramienta es nueva." }] },
  { name: "Mtra. Diana Vázquez", subject: "Artes", score: 4.5, positive: 89, responses: 26, trend: "+5%", strength: "Libertad para crear", opportunity: "Criterios de evaluación", priority: "Fortaleza", indicators: [90, 96, 82, 90], recommendation: "Conservar el ambiente creativo y presentar ejemplos sencillos de los criterios antes de cada proyecto para dar mayor certeza al evaluar.", comments: [{ category: "Reconocimiento", text: "Podemos expresar ideas diferentes sin que estén mal." }, { category: "Sugerencia", text: "Me gustaría conocer mejor cómo se calificará cada trabajo." }, { category: "Experiencia de aula", text: "Me siento con confianza para mostrar lo que hago." }] },
];

function Choice({
  emoji,
  label,
  selected,
  onClick,
}: {
  emoji?: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`choice ${selected ? "selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {emoji && <span className="choice-emoji">{emoji}</span>}
      <span>{label}</span>
      <span className="check">{selected ? "✓" : ""}</span>
    </button>
  );
}

function ScaleQuestion({
  id,
  text,
  answers,
  setAnswer,
  options = scale,
  dimension,
}: {
  id: string;
  text: string;
  answers: Answers;
  setAnswer: (id: string, value: string) => void;
  options?: string[][];
  dimension?: string;
}) {
  return (
    <div className="question-block">
      {dimension && <span className="question-dimension">{dimension}</span>}
      <h3>{text}</h3>
      <div className={`scale-grid ${options === teacherScale ? "teacher-scale-grid" : ""}`}>
        {options.map(([emoji, label]) => (
          <Choice
            key={label}
            emoji={emoji}
            label={label}
            selected={answers[id] === label}
            onClick={() => setAnswer(id, label)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<"welcome" | "test" | "data">("welcome");
  const [darkMode, setDarkMode] = useState(false);
  const [level, setLevel] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [saved, setSaved] = useState(false);
  const [teacherIndex, setTeacherIndex] = useState(0);
  const [expandedTeacherQuestion, setExpandedTeacherQuestion] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [login, setLogin] = useState({ user: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [dashboardTab, setDashboardTab] = useState<"overview" | "teachers" | "matrix" | "support" | "comments" | "report">("overview");
  const [voiceDetailOpen, setVoiceDetailOpen] = useState(false);
  const [filters, setFilters] = useState({ cycle: "2026–2027", grade: "Todos los grados", group: "Todos los grupos", area: "Todas las áreas" });
  const [selectedAnalysisTeacher, setSelectedAnalysisTeacher] = useState(0);
  const [analysisTeacherSearch, setAnalysisTeacherSearch] = useState("");
  const [analysisTeacherOpen, setAnalysisTeacherOpen] = useState(false);
  const [analysisTeacherOffset, setAnalysisTeacherOffset] = useState(0);
  const [selectedSupportArea, setSelectedSupportArea] = useState(0);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [matrixDetailOpen, setMatrixDetailOpen] = useState(false);
  const [matrixExportOpen, setMatrixExportOpen] = useState(false);
  const [matrixExportTeacher, setMatrixExportTeacher] = useState("general");
  const [matrixTeacherSearch, setMatrixTeacherSearch] = useState(matrixGeneralLabel);
  const [matrixTeacherOpen, setMatrixTeacherOpen] = useState(false);
  const [actionStatuses, setActionStatuses] = useState<Record<string, string>>({});
  const [studentUniverse, setStudentUniverse] = useState(96);
  const [responseCount, setResponseCount] = useState(84);
  const [exporting, setExporting] = useState<"excel" | "pdf" | "teacher-pdf" | "voice-pdf" | "channel-pdf" | null>(null);
  const [matrixExporting, setMatrixExporting] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem("imma-teens-voice-preview");
      if (stored) {
        try {
          setAnswers(JSON.parse(stored));
        } catch {
          localStorage.removeItem("imma-teens-voice-preview");
        }
      }
      // Las respuestas ya se conservaban, pero no la posición: quien cerraba
      // el navegador en el docente 9 de 13 volvía al inicio sin saber dónde
      // iba. En un cuestionario de este tamaño eso equivale a abandonarlo.
      const storedPlace = localStorage.getItem("imma-teens-voice-place");
      if (storedPlace) {
        try {
          const place = JSON.parse(storedPlace);
          if (typeof place.level === "number") setLevel(Math.max(0, Math.min(place.level, levels.length - 1)));
          if (typeof place.teacherIndex === "number") setTeacherIndex(Math.max(0, place.teacherIndex));
        } catch {
          localStorage.removeItem("imma-teens-voice-place");
        }
      }
      if (sessionStorage.getItem("imma-admin-preview") === "authorized") setAuthorized(true);
      const storedTheme = localStorage.getItem("imaa-theme");
      const useDarkTheme = storedTheme === "dark";
      document.documentElement.dataset.theme = useDarkTheme ? "dark" : "light";
      setDarkMode(useDarkTheme);
      const storedActions = localStorage.getItem("imaa-action-statuses-preview");
      if (storedActions) setActionStatuses(JSON.parse(storedActions));
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("imaa-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("imaa-action-statuses-preview", JSON.stringify(actionStatuses));
  }, [actionStatuses]);

  useEffect(() => {
    localStorage.setItem("imma-teens-voice-place", JSON.stringify({ level, teacherIndex }));
  }, [level, teacherIndex]);

  useEffect(() => {
    if (!Object.keys(answers).length) return;
    localStorage.setItem("imma-teens-voice-preview", JSON.stringify(answers));
    const savedTimer = setTimeout(() => setSaved(true), 0);
    const timer = setTimeout(() => setSaved(false), 1500);
    return () => {
      clearTimeout(savedTimer);
      clearTimeout(timer);
    };
  }, [answers]);

  const setAnswer = (id: string, value: string | string[]) =>
    setAnswers((current) => ({ ...current, [id]: value }));
  const openTeacher = (index: number) => {
    setTeacherIndex(index);
    setExpandedTeacherQuestion(null);
    // En móvil la lista de docentes se apila encima del formulario, así que
    // apuntar a `.teacher-workspace` devolvía al alumno a la misma lista que
    // acababa de usar. Se apunta a la ficha del docente, que es donde empieza
    // lo que tiene que responder.
    requestAnimationFrame(() =>
      document.querySelector(".teacher-main-card")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const answeredCount = Object.values(answers).filter((value) => Array.isArray(value) ? value.length > 0 : Boolean(value)).length;
  const levelEncouragement = ["Tu voz inicia aquí", "Conocerte ayuda a interpretar mejor", "Cada docente se evalúa por separado", "Piensa en experiencias concretas", "Selecciona sólo los servicios que conoces", "Tus ideas pueden convertirse en acciones", "Revisa y finaliza con confianza"][level];
  const goToLevel = (target: number) => {
    setLevel(Math.max(0, Math.min(target, levels.length - 1)));
    requestAnimationFrame(() => window.scrollTo({ top: 80, behavior: "smooth" }));
  };
  const next = () => goToLevel(level + 1);
  const back = () => goToLevel(level - 1);

  const signIn = (event: React.FormEvent) => {
    event.preventDefault();
    if (login.user === "admin" && login.password === "imma2026") {
      setAuthorized(true);
      setLoginError("");
      sessionStorage.setItem("imma-admin-preview", "authorized");
    } else {
      setLoginError("El usuario o la contraseña no son correctos.");
    }
  };

  const updateFilter = (key: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const selectedStudentGrade = String(answers.grade || "");
  const selectedStudentGroup = String(answers.group || "");
  const studentGroupOptions = selectedStudentGrade ? catalogGroupsForGrade(selectedStudentGrade) : [];
  const studentTeachers = teacherCatalog.filter((teacher) => teacher.grade === selectedStudentGrade && teacher.group === selectedStudentGroup);

  // El nivel de docentes concentra 15 reactivos por cada docente del grupo
  // (de 7 a 13 según el grado), así que contarlo como "uno de siete pasos"
  // dejaba la barra clavada en 33% durante la mayor parte del cuestionario.
  // Se pondera cada nivel por su carga real para que el avance no mienta.
  const teacherCount = Math.max(1, studentTeachers.length);
  const completedTeacherCount = studentTeachers.filter((item) =>
    teacherQuestions.every((question) => Boolean(answers[`teacher_${item.code}_${question.id}`])),
  ).length;
  const levelWeights = [0, 1, teacherCount, 1, 1, 1, 1];
  const totalWeight = levelWeights.reduce((sum, weight) => sum + weight, 0);
  const completedWeight = levelWeights.slice(0, level).reduce((sum, weight) => sum + weight, 0);
  const currentLevelWeight = level === 2 ? completedTeacherCount : 0;
  const progress = Math.round(((completedWeight + currentLevelWeight) / totalWeight) * 100);
  const resultGroupOptions = filters.grade === "Todos los grados"
    ? [...new Set(teacherCatalog.map((teacher) => teacher.group))]
    : catalogGroupsForGrade(filters.grade);
  const resultTeacherAssignments = teacherCatalog.filter((teacher) =>
    (filters.grade === "Todos los grados" || teacher.grade === filters.grade)
    && (filters.group === "Todos los grupos" || teacher.group === filters.group),
  );
  const resultTeachers = [...new Map(resultTeacherAssignments.map((teacher) => [`${teacher.name}|${teacher.subject}`, teacher])).values()];
  const matrixTeacherNames = [...new Set(teacherCatalog.map((teacher) => teacher.name))].sort((a, b) => a.localeCompare(b, "es"));
  const selectedMatrixLabel = matrixExportTeacher === "general" ? matrixGeneralLabel : matrixExportTeacher;
  const matrixTeacherQuery = matrixTeacherSearch === selectedMatrixLabel ? "" : matrixTeacherSearch.trim().toLocaleLowerCase("es-MX");
  const visibleMatrixTeacherNames = matrixTeacherNames.filter((name) => name.toLocaleLowerCase("es-MX").includes(matrixTeacherQuery));
  const selectedMatrixAssignments = matrixExportTeacher === "general"
    ? teacherCatalog
    : teacherCatalog.filter((teacher) => teacher.name === matrixExportTeacher);
  const matrixGradeOptions = [...new Set(selectedMatrixAssignments.map((teacher) => teacher.grade))];
  const matrixGroupOptions = [...new Set(selectedMatrixAssignments
    .filter((teacher) => filters.grade === "Todos los grados" || teacher.grade === filters.grade)
    .map((teacher) => teacher.group))];
  const selectedMatrixSubjects = [...new Set(selectedMatrixAssignments.map((teacher) => teacher.subject))];
  const chooseMatrixTeacher = (teacherName: string) => {
    setMatrixExportTeacher(teacherName);
    setMatrixTeacherSearch(teacherName === "general" ? matrixGeneralLabel : teacherName);
    setMatrixTeacherOpen(false);
    setFilters((current) => ({ ...current, grade: "Todos los grados", group: "Todos los grupos" }));
  };
  const updateMatrixTeacherSearch = (value: string) => {
    setMatrixTeacherSearch(value);
    setMatrixTeacherOpen(true);
    if (value === matrixGeneralLabel) chooseMatrixTeacher("general");
    else {
      const exactTeacher = matrixTeacherNames.find((name) => name.toLocaleLowerCase("es-MX") === value.toLocaleLowerCase("es-MX"));
      if (exactTeacher) chooseMatrixTeacher(exactTeacher);
    }
  };

  useEffect(() => {
    setSelectedAnalysisTeacher(0);
    setAnalysisTeacherSearch("");
    setAnalysisTeacherOffset(Math.floor(Math.random() * Math.max(1, resultTeachers.length)));
  }, [filters.grade, filters.group]);
  const scopeLabel = [filters.cycle, filters.grade, filters.group, filters.area].join(" · ");
  const activeResultTab = resultTabs.find((tab) => tab.id === dashboardTab) ?? resultTabs[0];
  const cycleAdjustment = filters.cycle === "2025–2026" ? -2 : 0;
  const areaAdjustment = filters.area === "Psicología" ? 2 : filters.area === "Enfermería" ? -1 : filters.area === "Tutoría" || filters.area === "Docentes" ? 1 : 0;
  const scopeAdjustment = cycleAdjustment + areaAdjustment + (filters.grade === "Todos los grados" ? 0 : filters.grade.includes("preparatoria") ? 2 : -1) + (filters.group === "Grupo B" ? -3 : filters.group === "Grupo C" ? 2 : 0);
  const exportScopeSlug = [filters.cycle, filters.grade, filters.group, filters.area].join("-").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-]+/g, "-").replace(/-+/g, "-");
  const gradeFactor = filters.grade === "Todos los grados" ? 1 : 0.55;
  const groupFactor = filters.group === "Todos los grupos" ? 1 : 0.55;
  const scopedUniverse = Math.max(1, Math.round(studentUniverse * gradeFactor * groupFactor));
  const baseResponseRate = studentUniverse > 0 ? responseCount / studentUniverse : 0;
  const scopedResponseRate = Math.max(0, Math.min(1, baseResponseRate + cycleAdjustment / 100));
  const scopedResponseCount = Math.min(scopedUniverse, Math.round(scopedUniverse * scopedResponseRate));
  const positiveExperience = Math.max(60, 84 + scopeAdjustment);
  const scopedTeacherAnalysis = resultTeachers.map(buildTeacherAnalysis).map((item) => ({
    ...item,
    score: Math.max(1, Math.min(5, Number((item.score + scopeAdjustment / 20).toFixed(1)))),
    positive: Math.max(0, Math.min(100, item.positive + scopeAdjustment)),
    responses: Math.max(1, Math.min(scopedResponseCount, Math.round(item.responses * gradeFactor * groupFactor))),
    indicators: item.indicators.map((value) => Math.max(0, Math.min(100, value + scopeAdjustment))),
  }));
  const analysisTeacherMatches = scopedTeacherAnalysis
    .map((teacher, index) => ({ teacher, index }))
    .filter(({ teacher }) => teacher.name.toLocaleLowerCase("es-MX").includes(analysisTeacherSearch.trim().toLocaleLowerCase("es-MX")));
  const rotatedAnalysisTeachers = scopedTeacherAnalysis.map((teacher, step) => {
    const index = (analysisTeacherOffset + step) % scopedTeacherAnalysis.length;
    return { teacher: scopedTeacherAnalysis[index], index };
  });
  const preliminaryAnalysisTeachers = analysisTeacherSearch.trim()
    ? analysisTeacherMatches.slice(0, 5)
    : [{ teacher: scopedTeacherAnalysis[selectedAnalysisTeacher], index: selectedAnalysisTeacher }, ...rotatedAnalysisTeachers.filter(({ index }) => index !== selectedAnalysisTeacher)].filter(({ teacher }) => Boolean(teacher)).slice(0, 5);
  const teacherMatrix = teacherQuestions.map((question, questionIndex) => {
    const responseBase = Math.max(1, Math.min(scopedResponseCount, Math.round(scopedResponseCount * (0.94 + (questionIndex % 4) * 0.01))));
    const average = Number(Math.max(1, Math.min(7, 1.55 + questionIndex * 0.075 - scopeAdjustment / 35)).toFixed(2));
    const performanceIndex = Math.round(((7 - average) / 6) * 100);
    const favorable = Math.max(0, Math.min(responseBase, Math.round(responseBase * (performanceIndex / 100 + 0.08))));
    const critical = Math.max(0, Math.min(responseBase - favorable, Math.round(responseBase * Math.max(0.02, (100 - performanceIndex) / 250))));
    return { ...question, responses: responseBase, average, performanceIndex, favorable, critical, level: performanceIndex >= 75 ? "Fortaleza" : performanceIndex >= 50 ? "Atención" : "Área prioritaria" };
  });
  const dimensionMatrix = teacherDimensions.map((dimension) => {
    const rows = teacherMatrix.filter((row) => row.dimension === dimension);
    const average = Number((rows.reduce((total, row) => total + row.average, 0) / rows.length).toFixed(2));
    const performanceIndex = Math.round(rows.reduce((total, row) => total + row.performanceIndex, 0) / rows.length);
    return { dimension, questions: rows.length, average, performanceIndex, level: performanceIndex >= 75 ? "Fortaleza" : performanceIndex >= 50 ? "Atención" : "Área prioritaria" };
  });
  const supportAreaAnalysis = [
    { area: "Dirección y coordinación", icon: "🧭", accent: "purple", questions: [
      { label: "Organización y cumplimiento", text: "Cumple los acuerdos y organiza bien las actividades de la escuela.", positive: 82 },
      { label: "Comunicación", text: "Explica con claridad las decisiones, reglas y cambios importantes.", positive: 77 },
      { label: "Escucha estudiantil", text: "Escucha a los estudiantes y toma en cuenta lo que pensamos.", positive: 75 },
      { label: "Respeto y trato justo", text: "Nos trata con respeto y busca soluciones justas.", positive: 81 },
      { label: "Seguimiento", text: "Da seguimiento a los problemas hasta que se resuelven.", positive: 74 },
    ]},
    { area: "Psicología", icon: "🧠", accent: "gold", questions: [
      { label: "Escucha", text: "Me escuchó con atención y sin juzgarme.", positive: 89 },
      { label: "Confianza", text: "Me hizo sentir en confianza para hablar de lo que me preocupaba.", positive: 87 },
      { label: "Orientación útil", text: "Su orientación me ayudó a saber qué podía hacer después.", positive: 84 },
    ]},
    { area: "Enfermería", icon: "🩺", accent: "cyan", questions: [
      { label: "Atención", text: "Me atendió con amabilidad y tomó en serio lo que sentía.", positive: 91 },
      { label: "Indicaciones claras", text: "Me explicó claramente qué debía hacer.", positive: 87 },
      { label: "Seguimiento", text: "Me indicó cuándo debía regresar o pedir más ayuda.", positive: 83 },
    ]},
    { area: "Tutoría", icon: "🤝", accent: "blue", questions: [
      { label: "Escucha", text: "Me escucha cuando tengo una dificultad.", positive: 86 },
      { label: "Orientación", text: "Me ayuda a encontrar una solución o el apoyo que necesito.", positive: 82 },
      { label: "Interés integral", text: "Se interesa por cómo estamos, no solo por las calificaciones.", positive: 83 },
    ]},
  ].map((area) => {
    const questions = area.questions.map((question) => ({ ...question, positive: Math.max(0, Math.min(100, question.positive + scopeAdjustment)) }));
    return { ...area, questions, average: Math.round(questions.reduce((total, question) => total + question.positive, 0) / questions.length) };
  });
  const visibleSupportAreas = filters.area === "Todas las áreas" || filters.area === "Docentes" ? supportAreaAnalysis : supportAreaAnalysis.filter((area) => area.area === filters.area);
  const focusedSupportArea = visibleSupportAreas[selectedSupportArea] ?? visibleSupportAreas[0] ?? supportAreaAnalysis[0];
  const focusedTeacher = scopedTeacherAnalysis[selectedAnalysisTeacher] ?? scopedTeacherAnalysis[0];
  const participationRate = scopedUniverse > 0 ? Math.min(100, Math.round((scopedResponseCount / scopedUniverse) * 100)) : 0;
  const analysisReady = participationRate > 50 && scopedResponseCount >= 10;
  const responsesNeeded = Math.max(0, Math.floor(scopedUniverse * 0.5) + 1 - scopedResponseCount);
  const reportIndicators = [
    { indicator: "Respeto", value: 91 + scopeAdjustment, reading: "Fortaleza consolidada" },
    { indicator: "Seguridad", value: 88 + scopeAdjustment, reading: "Fortaleza" },
    { indicator: "Acceso a ayuda", value: 79 + scopeAdjustment, reading: "Seguimiento" },
    { indicator: "Escucha estudiantil", value: 72 + scopeAdjustment, reading: "Oportunidad prioritaria" },
  ];
  const cycleComparison = reportIndicators.map((item) => ({ indicator: item.indicator, current: item.value, previous: item.value - (item.indicator === "Escucha estudiantil" ? 4 : 2), delta: item.indicator === "Escucha estudiantil" ? 4 : 2 }));
  const reportPlan = [
    { period: "0–15 días", action: "Validar patrones y revisar reportes individuales de forma privada.", owner: "Coordinación", evidence: "Minuta y prioridades validadas" },
    { period: "15–30 días", action: "Acordar una práctica observable de retroalimentación y escucha.", owner: "Docentes y tutoría", evidence: "Acuerdos y responsables" },
    { period: "30–60 días", action: "Dar seguimiento, comunicar avances y realizar una escucha breve.", owner: "Dirección", evidence: "Comparativo y comunicación" },
  ];
  const voiceProfiles: Record<string, { recognition: string[]; suggestions: string[]; focus: string; action: string }> = {
    "Todas las áreas": { recognition: ["Explican de distintas maneras hasta que entendemos.", "Nos dan confianza para participar sin burlas."], suggestions: ["Nos ayudaría saber con más claridad cómo mejorar.", "Quisiéramos más actividades prácticas."], focus: "La claridad y el respeto sostienen la experiencia positiva.", action: "Responder públicamente a dos propuestas viables." },
    "Docentes": { recognition: ["Las explicaciones con ejemplos facilitan comprender los temas.", "Podemos participar sin miedo a equivocarnos."], suggestions: ["Necesitamos saber qué hicimos bien y qué debemos mejorar.", "Nos ayudarían más ejercicios prácticos durante la clase."], focus: "La explicación y el trato son las fortalezas docentes más visibles.", action: "Acordar una práctica común de retroalimentación docente." },
    "Tutoría": { recognition: ["En tutoría podemos hablar de lo que nos preocupa.", "La tutora busca soluciones cuando el grupo lo necesita."], suggestions: ["Quisiéramos conocer el seguimiento de nuestros acuerdos.", "Nos gustaría tener más espacios breves para hablar del grupo."], focus: "El acompañamiento cercano es la fortaleza principal de tutoría.", action: "Publicar y revisar los acuerdos de grupo cada quince días." },
    "Dirección y coordinación": { recognition: ["Cuando planteamos un problema buscan una solución justa.", "La coordinación escucha al grupo cuando necesitamos apoyo."], suggestions: ["Quisiéramos saber qué seguimiento reciben nuestras propuestas.", "Sería útil comunicar con más claridad los acuerdos y cambios."], focus: "La búsqueda de soluciones justas es la principal fortaleza directiva.", action: "Publicar acuerdos, responsables y avances de las solicitudes estudiantiles." },
    "Psicología": { recognition: ["Me escuchan con respeto cuando necesito orientación.", "Sé que puedo pedir apoyo sin ser juzgado."], suggestions: ["Sería útil recordar cómo solicitar una cita de forma privada.", "Quisiéramos más actividades para manejar el estrés."], focus: "La confianza para solicitar apoyo distingue al área de psicología.", action: "Reforzar la ruta confidencial de atención y sus tiempos." },
    "Enfermería": { recognition: ["Me atienden con amabilidad cuando me siento mal.", "Explican claramente qué cuidados debo seguir."], suggestions: ["Necesitamos saber cuándo está disponible el servicio.", "Sería útil recibir más información preventiva."], focus: "El trato y la claridad de los cuidados son las fortalezas del servicio.", action: "Hacer visibles horarios, ruta de atención y consejos preventivos." },
  };
  const voiceProfile = voiceProfiles[filters.area] ?? voiceProfiles["Todas las áreas"];
  const voiceMention = (base: number) => Math.min(scopedResponseCount, Math.max(1, Math.round(base * gradeFactor * groupFactor + scopeAdjustment)));
  const voiceThemes = [
    { label: "Explicaciones claras", mentions: voiceMention(filters.area === "Psicología" ? 31 : filters.area === "Enfermería" ? 35 : 42), reading: "Fortaleza", action: "Mantener estrategias de explicación variadas." },
    { label: "Trato respetuoso", mentions: voiceMention(filters.area === "Psicología" ? 44 : 38), reading: "Fortaleza", action: "Conservar ambientes seguros para participar." },
    { label: filters.area === "Enfermería" ? "Información preventiva" : filters.area === "Psicología" ? "Manejo del estrés" : "Más actividades", mentions: voiceMention(27), reading: "Solicitud", action: "Incorporar experiencias prácticas y aplicadas." },
    { label: filters.area === "Tutoría" ? "Seguimiento de acuerdos" : "Escuchar al grupo", mentions: voiceMention(21), reading: "Seguimiento", action: "Comunicar qué propuestas se atendieron." },
    { label: filters.area === "Enfermería" ? "Disponibilidad del servicio" : filters.area === "Psicología" ? "Acceso a orientación" : "Retroalimentación", mentions: voiceMention(18), reading: "Solicitud", action: "Indicar el siguiente paso de forma clara y oportuna." },
  ];
  const reservedVoiceCount = Math.min(scopedResponseCount, Math.max(0, Math.round(3 * gradeFactor * groupFactor + (filters.area === "Psicología" ? 1 : 0))));
  const voiceComments = [
    ...voiceProfile.recognition.map((text) => ({ category: "Reconocimiento", text })),
    ...voiceProfile.suggestions.map((text) => ({ category: "Sugerencia", text })),
    ...(reservedVoiceCount ? [{ category: "Reservado", text: `${reservedVoiceCount} comentario${reservedVoiceCount === 1 ? "" : "s"} canalizado${reservedVoiceCount === 1 ? "" : "s"} al equipo responsable; contenido omitido por confidencialidad.` }] : []),
  ];
  const channelTotal = Math.max(1, Math.min(scopedResponseCount, Math.round(58 * gradeFactor * groupFactor + scopeAdjustment)));
  const channelGreen = Math.round(channelTotal * 0.62);
  const channelYellow = Math.round(channelTotal * 0.27);
  const channelOrange = Math.round(channelTotal * 0.08);
  const channelRed = Math.max(0, channelTotal - channelGreen - channelYellow - channelOrange);
  const channelData = [
    { level: "Verde", label: "Fortalezas", count: channelGreen, percentage: channelGreen / channelTotal, interpretation: "Prácticas valoradas que conviene conservar y compartir.", route: "Documentar buenas prácticas" },
    { level: "Amarillo", label: "Oportunidades", count: channelYellow, percentage: channelYellow / channelTotal, interpretation: "Sugerencias recurrentes que pueden atenderse con ajustes concretos.", route: "Asignar responsable y fecha" },
    { level: "Naranja", label: "Atención prioritaria", count: channelOrange, percentage: channelOrange / channelTotal, interpretation: "Patrones que requieren validación y seguimiento cercano.", route: "Revisión por coordinación" },
    { level: "Rojo", label: "Situaciones sensibles", count: channelRed, percentage: channelRed / channelTotal, interpretation: "Contenido reservado que no debe exponerse en reportes abiertos.", route: "Aplicar protocolo confidencial" },
  ];
  const strongestIndicator = [...reportIndicators].sort((a, b) => b.value - a.value)[0];
  const priorityIndicator = [...reportIndicators].sort((a, b) => a.value - b.value)[0];
  const priorityVoiceTheme = [...voiceThemes].filter((theme) => theme.reading !== "Fortaleza").sort((a, b) => b.mentions - a.mentions)[0];
  const teacherAverage = (scopedTeacherAnalysis.reduce((total, item) => total + item.score, 0) / scopedTeacherAnalysis.length).toFixed(1);
  const areaReportReading = filters.area === "Docentes"
    ? `El promedio docente es ${teacherAverage}/5. ${focusedTeacher.strength} destaca como fortaleza y ${focusedTeacher.opportunity.toLowerCase()} requiere seguimiento.`
    : filters.area === "Dirección y coordinación"
      ? "La disposición para escuchar y buscar soluciones es favorable; la oportunidad es comunicar con claridad qué acuerdos se tomaron y cómo se dará seguimiento."
    : filters.area === "Psicología"
      ? "La confianza y la escucha sin juicio son favorables; conviene reforzar la ruta privada de acceso y las estrategias para manejar el estrés."
      : filters.area === "Enfermería"
        ? "El trato y la claridad del cuidado son favorables; la disponibilidad del servicio y la información preventiva concentran las solicitudes."
        : filters.area === "Tutoría"
          ? "El acompañamiento cercano es valorado; la prioridad es hacer visible el seguimiento de acuerdos y solicitudes del grupo."
          : `La experiencia combina fortalezas institucionales y docentes. El promedio docente es ${teacherAverage}/5 y la escucha continúa como oportunidad transversal.`;
  const institutionalReport = {
    title: filters.area === "Todas las áreas" ? "Interpretación de la experiencia estudiantil" : `Interpretación de resultados · ${filters.area}`,
    finding: `${positiveExperience}% de experiencia positiva en ${scopedResponseCount} respuestas válidas. ${strongestIndicator.indicator} (${strongestIndicator.value}%) es el indicador más sólido del alcance.`,
    opportunity: `${priorityIndicator.indicator} registra ${priorityIndicator.value}%. En la voz del alumnado, “${priorityVoiceTheme.label}” reúne ${priorityVoiceTheme.mentions} menciones y requiere seguimiento.`,
    areaReading: areaReportReading,
    action: `${voiceProfile.action} La acción debe asignarse a un responsable, contar con evidencia y revisarse dentro de 30 a 60 días.`,
    plan: filters.area === "Docentes" ? [
      { period: "0–15 días", action: "Revisar fichas docentes y validar fortalezas y oportunidades con coordinación.", owner: "Coordinación", evidence: "Prioridades docentes validadas" },
      { period: "15–30 días", action: "Acordar una práctica observable de retroalimentación por docente.", owner: "Docentes", evidence: "Acuerdos y ejemplos de aplicación" },
      { period: "30–60 días", action: "Realizar escucha breve y comparar indicadores docentes.", owner: "Dirección", evidence: "Comparativo de seguimiento" },
    ] : filters.area === "Dirección y coordinación" || filters.area === "Psicología" || filters.area === "Enfermería" || filters.area === "Tutoría" ? [
      { period: "0–15 días", action: `Validar los temas recurrentes y casos reservados de ${filters.area}.`, owner: filters.area, evidence: "Patrones y casos revisados" },
      { period: "15–30 días", action: voiceProfile.action, owner: `${filters.area} y coordinación`, evidence: "Acción comunicada y responsable asignado" },
      { period: "30–60 días", action: "Revisar acceso, utilidad percibida y comentarios del servicio.", owner: "Dirección", evidence: "Comparativo del área" },
    ] : reportPlan,
  };

  const exportTeacherEvaluationWorkbook = async () => {
    setMatrixExporting(true);
    try {
      const XLSX = await import("xlsx");
      const templateResponse = await fetch("/IMMA_Teens_Voice_Evaluacion_Docente_Plantilla.xlsx");
      if (!templateResponse.ok) throw new Error("No fue posible cargar la plantilla de evaluación docente.");
      const workbook = XLSX.read(await templateResponse.arrayBuffer(), { type: "array", cellStyles: true, cellFormula: true });
      const captureSheet = workbook.Sheets["Captura"];
      const matrixSheet = workbook.Sheets["Matriz evaluación"];
      const dashboardSheet = workbook.Sheets["Dashboard"];
      if (!captureSheet || !matrixSheet || !dashboardSheet) throw new Error("La plantilla no contiene las hojas esperadas.");

      const chosenTeachers = matrixExportTeacher === "general"
        ? scopedTeacherAnalysis
        : scopedTeacherAnalysis.filter((teacher) => teacher.name === matrixExportTeacher);
      const scoreLabel = ["", "Excelente", "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo", "Pésimo"];
      const today = new Date().toISOString().slice(0, 10);
      const captureRows: (string | number)[][] = [];
      chosenTeachers.forEach((teacher, teacherPosition) => {
        const evaluationCount = Math.max(1, teacher.responses);
        teacherQuestions.forEach((question, questionIndex) => {
          const indicatorBase = teacher.indicators[questionIndex % teacher.indicators.length] ?? teacher.positive;
          const targetMean = Math.max(1, Math.min(7, 1 + (100 - indicatorBase) / 18));
          for (let responseIndex = 0; responseIndex < evaluationCount; responseIndex += 1) {
            const variation = ((responseIndex * 3 + questionIndex * 2 + teacherPosition) % 7) - 3;
            const score = Math.max(1, Math.min(7, Math.round(targetMean + variation * 0.18)));
            const evaluationId = `${teacher.subject.slice(0, 3).toUpperCase()}-${String(responseIndex + 1).padStart(3, "0")}`;
            const comment = question.id === "q15" ? teacher.comments[responseIndex % teacher.comments.length]?.text ?? "" : "";
            captureRows.push([evaluationId, today, teacher.name, teacher.subject, filters.group === "Todos los grupos" ? "General" : filters.group, question.id.toUpperCase(), question.dimension, score, scoreLabel[score], comment]);
          }
        });
      });

      const oldEndRow = 505;
      for (let row = 6; row <= oldEndRow; row += 1) {
        for (let col = 0; col < 10; col += 1) delete captureSheet[XLSX.utils.encode_cell({ r: row - 1, c: col })];
      }
      XLSX.utils.sheet_add_aoa(captureSheet, captureRows, { origin: "A6" });
      const lastRow = Math.max(6, 5 + captureRows.length);
      captureSheet["!ref"] = `A1:J${lastRow}`;
      captureSheet["!autofilter"] = { ref: `A5:J${lastRow}` };

      const updateFormulaRange = (sheet: Record<string, any>) => {
        Object.keys(sheet).forEach((address) => {
          const cell = sheet[address];
          if (address[0] !== "!" && cell?.f) cell.f = cell.f.replaceAll("$505", `$${lastRow}`);
        });
      };
      updateFormulaRange(matrixSheet);
      updateFormulaRange(dashboardSheet);

      const byQuestion = new Map<string, number[]>();
      captureRows.forEach((row) => { const key = String(row[5]); const values = byQuestion.get(key) ?? []; values.push(Number(row[7])); byQuestion.set(key, values); });
      teacherQuestions.forEach((question, index) => {
        const excelRow = 6 + index;
        const values = byQuestion.get(question.id.toUpperCase()) ?? [];
        const mean = values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
        const favorable = values.filter((value) => value <= 3).length;
        const critical = values.filter((value) => value >= 5).length;
        const level = !values.length ? "Sin datos" : scoreLabel[Math.max(1, Math.min(7, Math.round(mean)))];
        matrixSheet[`D${excelRow}`].v = values.length;
        matrixSheet[`E${excelRow}`].v = values.length ? mean : "";
        matrixSheet[`F${excelRow}`].v = values.length ? (7 - mean) / 6 : "";
        matrixSheet[`G${excelRow}`].v = level;
        matrixSheet[`H${excelRow}`].v = favorable;
        matrixSheet[`I${excelRow}`].v = critical;
      });
      const allScores = captureRows.map((row) => Number(row[7]));
      const overallMean = allScores.length ? allScores.reduce((total, value) => total + value, 0) / allScores.length : 0;
      dashboardSheet.A5.v = allScores.length;
      dashboardSheet.D5.v = overallMean || "";
      dashboardSheet.G5.v = allScores.length ? (7 - overallMean) / 6 : "";
      dashboardSheet.J5.v = allScores.length ? scoreLabel[Math.round(overallMean)] : "Sin datos";

      const palette = {
        navy: "18246B",
        slate: "44506A",
        pale: "F5F7FB",
        soft: "E9EDF5",
        line: "D8DEE9",
        ink: "17223D",
        muted: "667085",
        white: "FFFFFF",
      };
      const borderBottom = { bottom: { style: "thin", color: { rgb: palette.line } } };
      const styleCell = (sheet: Record<string, any>, address: string, style: Record<string, any>) => {
        const cell = sheet[address];
        if (!cell) return;
        cell.s = { ...(cell.s ?? {}), ...style };
      };
      const styleRange = (sheet: Record<string, any>, range: string, style: Record<string, any>) => {
        const decoded = XLSX.utils.decode_range(range);
        for (let row = decoded.s.r; row <= decoded.e.r; row += 1) {
          for (let col = decoded.s.c; col <= decoded.e.c; col += 1) {
            styleCell(sheet, XLSX.utils.encode_cell({ r: row, c: col }), style);
          }
        }
      };
      const styleStripedRows = (sheet: Record<string, any>, startRow: number, endRow: number, endColumn: string) => {
        for (let row = startRow; row <= endRow; row += 1) {
          styleRange(sheet, `A${row}:${endColumn}${row}`, {
            fill: { patternType: "solid", fgColor: { rgb: row % 2 === 0 ? palette.pale : palette.white } },
            font: { name: "Aptos", sz: 10, color: { rgb: palette.ink } },
            border: borderBottom,
            alignment: { vertical: "center", wrapText: true },
          });
        }
      };
      const titleStyle = {
        fill: { patternType: "solid", fgColor: { rgb: palette.navy } },
        font: { name: "Aptos Display", sz: 16, bold: true, color: { rgb: palette.white } },
        alignment: { vertical: "center" },
      };
      const headerStyle = {
        fill: { patternType: "solid", fgColor: { rgb: palette.navy } },
        font: { name: "Aptos", sz: 10, bold: true, color: { rgb: palette.white } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
      };

      const questionnaireSheet = workbook.Sheets["Cuestionario"];
      if (questionnaireSheet) {
        styleRange(questionnaireSheet, "A1:J1", titleStyle);
        styleRange(questionnaireSheet, "A9:J9", {
          fill: { patternType: "solid", fgColor: { rgb: palette.soft } },
          font: { name: "Aptos", sz: 10, color: { rgb: palette.muted } },
          alignment: { vertical: "center", wrapText: true },
        });
        styleRange(questionnaireSheet, "A11:J11", headerStyle);
        styleStripedRows(questionnaireSheet, 12, 26, "J");
        questionnaireSheet["!cols"] = [10, 25, 54, 13, 13, 13, 13, 13, 13, 13].map((wch) => ({ wch }));
        questionnaireSheet["!rows"] = questionnaireSheet["!rows"] ?? [];
        questionnaireSheet["!rows"][0] = { hpt: 28 };
        questionnaireSheet["!rows"][10] = { hpt: 34 };
      }

      styleRange(captureSheet, "A1:J1", titleStyle);
      styleRange(captureSheet, "A3:J3", {
        fill: { patternType: "solid", fgColor: { rgb: palette.soft } },
        font: { name: "Aptos", sz: 10, color: { rgb: palette.muted } },
        alignment: { vertical: "center", wrapText: true },
      });
      styleRange(captureSheet, "A5:J5", headerStyle);
      styleStripedRows(captureSheet, 6, lastRow, "J");
      captureSheet["!cols"] = [17, 13, 26, 20, 15, 12, 28, 12, 16, 44].map((wch) => ({ wch }));
      captureSheet["!rows"] = captureSheet["!rows"] ?? [];
      captureSheet["!rows"][0] = { hpt: 28 };
      captureSheet["!rows"][4] = { hpt: 34 };
      for (let row = 6; row <= lastRow; row += 1) {
        styleCell(captureSheet, `H${row}`, { alignment: { horizontal: "center", vertical: "center" }, numFmt: "0" });
      }

      styleRange(matrixSheet, "A1:M1", titleStyle);
      styleRange(matrixSheet, "A4:I4", {
        fill: { patternType: "solid", fgColor: { rgb: palette.soft } },
        font: { name: "Aptos", sz: 11, bold: true, color: { rgb: palette.ink } },
        alignment: { vertical: "center" },
      });
      styleRange(matrixSheet, "A5:I5", headerStyle);
      styleRange(matrixSheet, "K4:M4", {
        fill: { patternType: "solid", fgColor: { rgb: palette.slate } },
        font: { name: "Aptos", sz: 10, bold: true, color: { rgb: palette.white } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
      });
      styleStripedRows(matrixSheet, 6, 20, "I");
      matrixSheet["!cols"] = [10, 26, 54, 12, 12, 14, 18, 15, 15, 3, 13, 18, 22].map((wch) => ({ wch }));
      matrixSheet["!rows"] = matrixSheet["!rows"] ?? [];
      matrixSheet["!rows"][0] = { hpt: 28 };
      matrixSheet["!rows"][4] = { hpt: 34 };
      for (let row = 6; row <= 20; row += 1) {
        styleCell(matrixSheet, `E${row}`, { numFmt: "0.00", alignment: { horizontal: "center", vertical: "center" } });
        styleCell(matrixSheet, `F${row}`, { numFmt: "0%", alignment: { horizontal: "center", vertical: "center" } });
      }

      styleRange(dashboardSheet, "A1:L1", titleStyle);
      ["A4:C4", "D4:F4", "G4:I4", "J4:L4", "A9:C9", "E9:F9"].forEach((range) => styleRange(dashboardSheet, range, headerStyle));
      ["A5:C5", "D5:F5", "G5:I5", "J5:L5"].forEach((range) => styleRange(dashboardSheet, range, {
        fill: { patternType: "solid", fgColor: { rgb: palette.white } },
        font: { name: "Aptos Display", sz: 16, bold: true, color: { rgb: palette.navy } },
        border: borderBottom,
        alignment: { horizontal: "center", vertical: "center" },
      }));
      styleStripedRows(dashboardSheet, 10, 24, "F");
      dashboardSheet["!cols"] = [26, 18, 16, 3, 28, 18, 18, 18, 18, 18, 18, 18].map((wch) => ({ wch }));
      dashboardSheet["!rows"] = dashboardSheet["!rows"] ?? [];
      dashboardSheet["!rows"][0] = { hpt: 28 };
      dashboardSheet["!rows"][4] = { hpt: 32 };

      if (workbook.Sheets["Comparación"]) {
        delete workbook.Sheets["Comparación"];
        workbook.SheetNames = workbook.SheetNames.filter((sheetName) => sheetName !== "Comparación");
      }
      workbook.Workbook = workbook.Workbook ?? {};
      // `CalcPr` es parte del formato XLSX pero falta en los tipos de `xlsx`.
      (workbook.Workbook as { CalcPr?: Record<string, unknown> }).CalcPr = { calcMode: "auto", fullCalcOnLoad: true, forceFullCalc: true };

      const scopeName = matrixExportTeacher === "general" ? "General" : matrixExportTeacher;
      XLSX.writeFile(workbook, `IMMA_Evaluacion_Docente_${scopeName.replace(/\s+/g, "_")}_${filters.cycle}.xlsx`, { compression: true });
      setMatrixExportOpen(false);
    } finally {
      setMatrixExporting(false);
    }
  };

  const exportExcel = async () => {
    setExporting("excel");
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      workbook.Props = { Title: "IMAA Teens Voice · Resultados completos", Subject: scopeLabel, Author: "Instituto Mexicano de Alto Aprendizaje", Company: "IMAA", Comments: "Resultados agrupados y anonimizados" };
      const addSheet = (name: string, rows: Record<string, string | number>[], widths: number[], percentageColumns: string[] = []) => {
        const sheet = XLSX.utils.json_to_sheet(rows);
        sheet["!cols"] = widths.map((wch) => ({ wch }));
        sheet["!autofilter"] = { ref: sheet["!ref"] || "A1:A1" };
        sheet["!freeze"] = { xSplit: 0, ySplit: 1 };
        sheet["!rows"] = [{ hpt: 24 }, ...rows.map(() => ({ hpt: 22 }))];
        sheet["!margins"] = { left: 0.35, right: 0.35, top: 0.55, bottom: 0.55, header: 0.2, footer: 0.2 };
        sheet["!pageSetup"] = { orientation: widths.length > 7 ? "landscape" : "portrait", fitToWidth: 1, fitToHeight: 0 };
        const headers = rows.length ? Object.keys(rows[0]) : [];
        percentageColumns.forEach((header) => {
          const column = headers.indexOf(header);
          if (column < 0) return;
          for (let row = 1; row <= rows.length; row += 1) {
            const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
            if (cell) cell.z = "0%";
          }
        });
        XLSX.utils.book_append_sheet(workbook, sheet, name);
      };
      const scaleDistribution = (positive: number) => {
        const total = scopedResponseCount;
        const veryPositive = Math.round(total * Math.max(0, positive - 18) / 100);
        const positiveCount = Math.round(total * Math.min(18, positive) / 100);
        const neutral = Math.round(total * Math.max(8, (100 - positive) * 0.45) / 100);
        const negative = Math.max(0, total - veryPositive - positiveCount - neutral);
        return { veryPositive, positiveCount, neutral, negative };
      };
      const surveyQuestions = [
        { section: "Experiencia IMMA", code: "imma_safe", question: "Me siento seguro/a dentro del IMMA.", positive: 88 + scopeAdjustment },
        { section: "Experiencia IMMA", code: "imma_heard", question: "Siento que mi opinión es tomada en cuenta.", positive: 72 + scopeAdjustment },
        { section: "Experiencia IMMA", code: "imma_help", question: "Sé con quién pedir ayuda cuando la necesito.", positive: 79 + scopeAdjustment },
        { section: "Dirección", code: "director_agreements", question: "Cumple los acuerdos y organiza bien las actividades de la escuela.", positive: 82 + scopeAdjustment },
        { section: "Dirección", code: "director_communication", question: "Explica con claridad las decisiones, reglas y cambios importantes.", positive: 77 + scopeAdjustment },
        { section: "Dirección", code: "director_listens", question: "Escucha a los estudiantes y toma en cuenta lo que pensamos.", positive: 75 + scopeAdjustment },
        { section: "Dirección", code: "director_fair", question: "Nos trata con respeto y busca soluciones justas.", positive: 81 + scopeAdjustment },
        { section: "Dirección", code: "director_followup", question: "Da seguimiento a los problemas hasta que se resuelven.", positive: 74 + scopeAdjustment },
        { section: "Psicología", code: "psych_listens", question: "Me escuchó con atención y sin juzgarme.", positive: 89 + scopeAdjustment },
        { section: "Psicología", code: "psych_safe", question: "Me hizo sentir en confianza para hablar de lo que me preocupaba.", positive: 87 + scopeAdjustment },
        { section: "Psicología", code: "psych_useful", question: "Su orientación me ayudó a saber qué podía hacer después.", positive: 84 + scopeAdjustment },
        { section: "Enfermería", code: "nurse_care", question: "Me atendió con amabilidad y tomó en serio lo que sentía.", positive: 91 + scopeAdjustment },
        { section: "Enfermería", code: "nurse_clear", question: "Me explicó claramente qué debía hacer.", positive: 87 + scopeAdjustment },
        { section: "Enfermería", code: "nurse_followup", question: "Me indicó cuándo debía regresar o pedir más ayuda.", positive: 83 + scopeAdjustment },
        { section: "Tutoría", code: "tutor_listens", question: "Me escucha cuando tengo una dificultad.", positive: 86 + scopeAdjustment },
        { section: "Tutoría", code: "tutor_guidance", question: "Me ayuda a encontrar una solución o el apoyo que necesito.", positive: 82 + scopeAdjustment },
        { section: "Tutoría", code: "tutor_cares", question: "Se interesa por cómo estamos, no sólo por las calificaciones.", positive: 83 + scopeAdjustment },
      ];
      const surveyRows = surveyQuestions.map((item) => {
        const distribution = scaleDistribution(Math.max(0, Math.min(100, item.positive)));
        return { Ciclo: filters.cycle, Grado: filters.grade, Grupo: filters.group, Área: filters.area, Sección: item.section, Código: item.code, Pregunta: item.question, "Respuestas válidas": scopedResponseCount, "Muy de acuerdo": distribution.veryPositive, "De acuerdo": distribution.positiveCount, Neutral: distribution.neutral, "En desacuerdo": distribution.negative, "Resultado positivo": Math.max(0, Math.min(100, item.positive)) / 100, Lectura: item.positive >= 85 ? "Fortaleza" : item.positive >= 75 ? "Seguimiento" : "Prioridad" };
      });
      const teacherIndicatorLabels = ["Claridad al explicar", "Trato respetuoso", "Evaluación clara y justa", "Confianza para preguntar"];
      const teacherIndicatorRows = scopedTeacherAnalysis.flatMap((teacher) => teacher.indicators.map((value, index) => ({ Ciclo: filters.cycle, Grado: filters.grade, Grupo: filters.group, Docente: teacher.name, Materia: teacher.subject, Indicador: teacherIndicatorLabels[index], Resultado: value / 100, Lectura: value >= 90 ? "Fortaleza consolidada" : value >= 80 ? "Favorable" : value >= 70 ? "Seguimiento" : "Prioridad" })));
      const recommendations = [
        { Prioridad: "Alta", Horizonte: "0–15 días", Tema: "Escucha estudiantil", Acción: voiceProfile.action, Responsable: "Coordinación", Indicador: "Propuestas respondidas", Meta: "Responder al menos dos propuestas viables", Fuente: "Voz del alumnado" },
        { Prioridad: "Alta", Horizonte: "0–15 días", Tema: "Confidencialidad", Acción: "Revisar comentarios reservados mediante el protocolo institucional.", Responsable: "Equipo responsable", Indicador: "Casos canalizados", Meta: "100% con seguimiento documentado", Fuente: "Comentarios reservados" },
        { Prioridad: "Media", Horizonte: "15–30 días", Tema: "Retroalimentación", Acción: "Comunicar en cada entrega un logro y un siguiente paso.", Responsable: "Docentes", Indicador: "Percepción positiva", Meta: "Aumentar cinco puntos porcentuales", Fuente: "Evaluación docente" },
        { Prioridad: "Media", Horizonte: "30–60 días", Tema: "Seguimiento", Acción: "Aplicar una escucha breve y comparar contra la línea base.", Responsable: "Dirección", Indicador: "Variación por indicador", Meta: "Mejora en dos prioridades", Fuente: "Plan institucional" },
      ];

      addSheet("Resumen", [
        { Campo: "Alcance", Resultado: scopeLabel },
        { Campo: "Ciclo escolar", Resultado: filters.cycle },
        { Campo: "Grado", Resultado: filters.grade },
        { Campo: "Grupo", Resultado: filters.group },
        { Campo: "Área evaluada", Resultado: filters.area },
        { Campo: "Universo del segmento", Resultado: scopedUniverse },
        { Campo: "Respuestas válidas", Resultado: scopedResponseCount },
        { Campo: "Participación", Resultado: participationRate / 100 },
        { Campo: "Experiencia positiva", Resultado: positiveExperience / 100 },
        { Campo: "Publicación permitida", Resultado: analysisReady ? "Sí: muestra suficiente" : "No: muestra insuficiente" },
        { Campo: "Hallazgo principal", Resultado: voiceProfile.focus },
        { Campo: "Prioridad", Resultado: voiceProfile.action },
        { Campo: "Uso recomendado", Resultado: "Revisar fortalezas, acordar responsables y comparar avances en 30–60 días." },
        { Campo: "Nota", Resultado: "Datos anónimos de demostración; no permiten identificar estudiantes." },
      ], [27, 88], ["Resultado"]);
      addSheet("Indicadores", reportIndicators.map((item) => ({ Ciclo: filters.cycle, Grado: filters.grade, Grupo: filters.group, Área: filters.area, Indicador: item.indicator, Resultado: item.value / 100, Lectura: item.reading })), [15, 24, 16, 18, 28, 14, 28], ["Resultado"]);
      addSheet("Docentes", scopedTeacherAnalysis.map((item) => ({ Ciclo: filters.cycle, Grado: filters.grade, Grupo: filters.group, Docente: item.name, Materia: item.subject, Evaluaciones: item.responses, Promedio: item.score, "Experiencias positivas": item.positive / 100, Tendencia: item.trend, Fortaleza: item.strength, Oportunidad: item.opportunity, Recomendación: item.recommendation, Estado: item.priority })), [15, 24, 16, 28, 18, 14, 12, 20, 12, 28, 34, 62, 16], ["Experiencias positivas"]);
      addSheet("Comentarios docentes", scopedTeacherAnalysis.flatMap((item) => item.comments.map((comment) => ({ Ciclo: filters.cycle, Grado: filters.grade, Grupo: filters.group, Área: filters.area, Docente: item.name, Materia: item.subject, Clasificación: comment.category, Comentario: comment.text, Tratamiento: "Anonimizado" }))), [15, 24, 16, 18, 28, 18, 20, 72, 16]);
      addSheet("Respuestas encuesta", surveyRows, [15, 24, 16, 18, 20, 22, 58, 16, 15, 13, 12, 16, 18, 16], ["Resultado positivo"]);
      addSheet("Indicadores docentes", teacherIndicatorRows, [15, 24, 16, 28, 18, 28, 14, 24], ["Resultado"]);
      addSheet("Voz del alumnado", voiceThemes.map((theme) => ({ Ciclo: filters.cycle, Grado: filters.grade, Grupo: filters.group, Área: filters.area, Tema: theme.label, Menciones: theme.mentions, Lectura: theme.reading, "Acción sugerida": theme.action })), [15, 24, 16, 18, 30, 14, 18, 60]);
      addSheet("Comentarios generales", voiceComments.map((comment) => ({ Ciclo: filters.cycle, Grado: filters.grade, Grupo: filters.group, Área: filters.area, Clasificación: comment.category, Comentario: comment.text, Tratamiento: comment.category === "Reservado" ? "Canalizado; contenido protegido" : "Anonimizado" })), [15, 24, 16, 18, 20, 78, 30]);
      addSheet("Servicios de apoyo", surveyRows.filter((row) => ["Psicología", "Enfermería", "Tutoría", "Dirección"].includes(row.Sección)), [15, 24, 16, 18, 20, 22, 58, 16, 15, 13, 12, 16, 18, 16], ["Resultado positivo"]);
      addSheet("Hallazgos", [
        { Tipo: "Fortaleza", Tema: reportIndicators[0].indicator, Evidencia: `${reportIndicators[0].value}% de percepción positiva`, Recomendación: "Conservar y compartir las prácticas que sostienen este resultado." },
        { Tipo: "Fortaleza", Tema: voiceThemes[0].label, Evidencia: `${voiceThemes[0].mentions} menciones dentro del alcance`, Recomendación: voiceThemes[0].action },
        { Tipo: "Oportunidad", Tema: voiceThemes.filter((theme) => theme.reading !== "Fortaleza").sort((a, b) => b.mentions - a.mentions)[0].label, Evidencia: `${voiceThemes.filter((theme) => theme.reading !== "Fortaleza").sort((a, b) => b.mentions - a.mentions)[0].mentions} menciones`, Recomendación: voiceProfile.action },
        { Tipo: "Reservado", Tema: "Situaciones sensibles", Evidencia: `${reservedVoiceCount} comentarios canalizados`, Recomendación: "Aplicar el protocolo institucional de revisión privada." },
      ], [18, 28, 42, 68]);
      addSheet("Recomendaciones", recommendations, [14, 18, 25, 70, 24, 28, 38, 24]);
      addSheet("Plan de acción", institutionalReport.plan.map((item, index) => ({ Prioridad: index === 0 ? "Alta" : "Media", Periodo: item.period, Acción: item.action, Responsable: item.owner, Evidencia: item.evidence, Estado: "Por iniciar", "Fecha de revisión": index === 0 ? "15 días" : index === 1 ? "30 días" : "60 días" })), [14, 16, 62, 24, 34, 18, 20]);
      addSheet("Diccionario", [
        { Campo: "Alcance", Definición: "Combinación activa de ciclo, grado, grupo y área." },
        { Campo: "Respuestas válidas", Definición: "Respuestas incluidas después de aplicar el alcance seleccionado." },
        { Campo: "Resultado positivo", Definición: "Proporción estimada de respuestas favorables. Dirección y servicios usan cuatro opciones; docentes usan la escala 1–7." },
        { Campo: "Menciones", Definición: "Número de apariciones temáticas; una respuesta puede aportar más de un tema." },
        { Campo: "Reservado", Definición: "Comentario sensible canalizado sin exponer su contenido." },
        { Campo: "Prioridad", Definición: "Hallazgo que requiere responsable, acción y fecha de seguimiento." },
      ], [28, 100]);
      addSheet("Metodología", [
        { Elemento: "Regla de publicación", Descripción: "Participación superior al 50% y mínimo de 10 respuestas válidas." },
        { Elemento: "Privacidad", Descripción: "Resultados agrupados; comentarios anonimizados antes de su canalización." },
        { Elemento: "Interpretación", Descripción: "Los porcentajes orientan decisiones y deben complementarse con revisión cualitativa." },
        { Elemento: "Filtro aplicado", Descripción: scopeLabel },
        { Elemento: "Consistencia", Descripción: "Todas las hojas proceden del mismo alcance seleccionado en pantalla." },
        { Elemento: "Control de muestra", Descripción: `${scopedResponseCount} respuestas de un universo de ${scopedUniverse}; participación de ${participationRate}%.` },
        { Elemento: "Limitación del prototipo", Descripción: "Los datos actuales son demostrativos. En producción deben calcularse desde respuestas persistidas y validadas." },
        { Elemento: "Uso responsable", Descripción: "No usar resultados agregados para intentar identificar estudiantes ni sancionar sin revisión contextual." },
      ], [30, 105]);
      XLSX.writeFile(workbook, `IMAA-Teens-Voice-${exportScopeSlug}.xlsx`, { compression: true });
    } finally {
      setExporting(null);
    }
  };

  const exportPdf = async () => {
    setExporting("pdf");
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const navy: [number, number, number] = [21, 28, 98];
      const blue: [number, number, number] = [38, 60, 160];
      const yellow: [number, number, number] = [246, 197, 21];
      const pageHeader = (title: string, subtitle: string) => {
        pdf.setFillColor(...navy); pdf.rect(0, 0, 210, 25, "F");
        pdf.setFillColor(...yellow); pdf.rect(0, 25, 210, 2, "F");
        pdf.setTextColor(255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15); pdf.text(title, 14, 11);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.text(subtitle, 14, 18);
        pdf.setTextColor(23, 34, 61);
      };
      const footer = () => {
        const pages = pdf.getNumberOfPages();
        for (let page = 1; page <= pages; page += 1) {
          pdf.setPage(page); pdf.setDrawColor(220); pdf.line(14, 285, 196, 285);
          pdf.setFontSize(7); pdf.setTextColor(100); pdf.text("IMAA Teens Voice · Información anónima de demostración", 14, 290); pdf.text(`${page}/${pages}`, 190, 290);
        }
      };
      pageHeader("IMAA Teens Voice", `Reporte ejecutivo · ${scopeLabel}`);
      pdf.setFontSize(7); pdf.setTextColor(85); pdf.text("RESULTADOS EN UNA MIRADA", 14, 36);
      pdf.setFontSize(15); pdf.setTextColor(...navy); pdf.setFont("helvetica", "bold"); pdf.text("Experiencia estudiantil y prioridades", 14, 44);
      const cards = [["Participación", `${participationRate}%`], ["Experiencia positiva", `${positiveExperience}%`], ["Respuestas válidas", `${scopedResponseCount}`], ["Prioridad", "Escucha"]];
      cards.forEach(([label, value], index) => { const x = 14 + index * 46; pdf.setFillColor(244, 246, 250); pdf.roundedRect(x, 50, 42, 21, 2, 2, "F"); pdf.setFontSize(12); pdf.setTextColor(...blue); pdf.text(value, x + 4, 60); pdf.setFontSize(6.2); pdf.setTextColor(95); pdf.text(label, x + 4, 67); });
      autoTable(pdf, { startY: 77, margin: { left: 14, right: 14 }, head: [["Indicador", "Resultado", "Lectura"]], body: reportIndicators.map((item) => [item.indicator, `${item.value}%`, item.reading]), theme: "grid", headStyles: { fillColor: navy }, styles: { fontSize: 7.2, cellPadding: 2.2 }, columnStyles: { 1: { halign: "center", fontStyle: "bold", cellWidth: 25 } } });
      let y = (pdf as typeof pdf & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      pdf.setFillColor(236, 241, 255); pdf.roundedRect(14, y, 182, 25, 2, 2, "F");
      pdf.setFontSize(9); pdf.setTextColor(...navy); pdf.setFont("helvetica", "bold"); pdf.text("Conclusión ejecutiva", 19, y + 7);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.2); pdf.setTextColor(65); pdf.text(pdf.splitTextToSize(`${institutionalReport.finding} ${institutionalReport.opportunity}`, 170), 19, y + 13);
      y += 32;
      pdf.setFontSize(9); pdf.setTextColor(...navy); pdf.setFont("helvetica", "bold"); pdf.text("Comparativo docente", 14, y);
      autoTable(pdf, { startY: y + 4, margin: { left: 14, right: 14 }, head: [["Docente / materia", "Eval.", "Prom.", "% +", "Estado"]], body: scopedTeacherAnalysis.map((item) => [`${item.name} · ${item.subject}`, item.responses, item.score, `${item.positive}%`, item.priority]), theme: "striped", headStyles: { fillColor: blue }, styles: { fontSize: 6.8, cellPadding: 2 }, columnStyles: { 1: { halign: "center", cellWidth: 16 }, 2: { halign: "center", cellWidth: 18 }, 3: { halign: "center", cellWidth: 18 }, 4: { cellWidth: 28 } } });
      y = (pdf as typeof pdf & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      pdf.setFontSize(8.5); pdf.setTextColor(...navy); pdf.setFont("helvetica", "bold"); pdf.text("Voz del alumnado", 14, y);
      const voices = [["Fortaleza", "Explicaciones claras y trato respetuoso"], ["Solicitud", "Más actividades y retroalimentación para mejorar"], ["Reservado", "3 comentarios canalizados de forma confidencial"]];
      voices.forEach(([label, text], index) => { const x = 14 + index * 61; pdf.setFillColor(index === 0 ? 234 : index === 1 ? 255 : 253, index === 0 ? 247 : index === 1 ? 248 : 238, index === 0 ? 240 : index === 1 ? 220 : 238); pdf.roundedRect(x, y + 4, 57, 22, 2, 2, "F"); pdf.setFontSize(6.5); pdf.setTextColor(...navy); pdf.setFont("helvetica", "bold"); pdf.text(label, x + 3, y + 10); pdf.setFont("helvetica", "normal"); pdf.setTextColor(75); pdf.text(pdf.splitTextToSize(text, 51), x + 3, y + 15); });

      pdf.addPage(); pageHeader("Prioridades y plan de acción", "Fortalezas docentes, responsables y seguimiento");
      autoTable(pdf, { startY: 34, margin: { left: 14, right: 14 }, head: [["Docente", "Fortaleza", "Oportunidad", "Recomendación"]], body: scopedTeacherAnalysis.map((item) => [item.name, item.strength, item.opportunity, item.recommendation]), theme: "grid", headStyles: { fillColor: blue }, styles: { fontSize: 6.2, cellPadding: 1.8 }, columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 38 }, 2: { cellWidth: 42 } } });
      y = (pdf as typeof pdf & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
      pdf.setFontSize(9); pdf.setTextColor(...navy); pdf.setFont("helvetica", "bold"); pdf.text("Ruta de mejora a 60 días", 14, y);
      autoTable(pdf, { startY: y + 4, margin: { left: 14, right: 14 }, head: [["Periodo", "Acción", "Responsable", "Evidencia"]], body: institutionalReport.plan.map((item) => [item.period, item.action, item.owner, item.evidence]), theme: "grid", headStyles: { fillColor: navy }, styles: { fontSize: 6.7, cellPadding: 2.2 }, columnStyles: { 0: { cellWidth: 20 }, 2: { cellWidth: 29 }, 3: { cellWidth: 38 } } });
      y = (pdf as typeof pdf & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
      pdf.setFillColor(255, 248, 220); pdf.roundedRect(14, y, 182, 34, 2, 2, "F"); pdf.setFontSize(9); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...navy); pdf.text("Cuatro acciones recomendadas", 19, y + 7); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(70); pdf.text(pdf.splitTextToSize("1. Comunicar qué cambió gracias a la voz estudiantil.  2. Dar retroalimentación breve, frecuente y accionable.  3. Revisar indicadores a 30 y 60 días.  4. Mantener los casos sensibles en un circuito reservado.", 170), 19, y + 14);
      y += 41;
      pdf.setFillColor(244, 246, 250); pdf.roundedRect(14, y, 182, 30, 2, 2, "F"); pdf.setFontSize(8.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...navy); pdf.text("Criterios para interpretar correctamente", 19, y + 7); pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.8); pdf.setTextColor(75); pdf.text(pdf.splitTextToSize("Publicar resultados sólo con participación superior al 50% y al menos 10 respuestas válidas. Leer porcentajes junto con comentarios anonimizados. Los hallazgos orientan decisiones institucionales y nunca deben utilizarse para identificar estudiantes.", 170), 19, y + 14);
      y += 37;
      [["CONSERVAR", "Respeto y seguridad"], ["MEJORAR", "Escucha y retroalimentación"], ["MEDIR", "Avances en 30 y 60 días"]].forEach(([label, text], index) => { const x = 14 + index * 61; pdf.setDrawColor(...blue); pdf.roundedRect(x, y, 57, 24, 2, 2, "S"); pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...blue); pdf.text(label, x + 4, y + 8); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.2); pdf.setTextColor(55); pdf.text(pdf.splitTextToSize(text, 49), x + 4, y + 15); });
      footer();
      pdf.save(`IMAA-Teens-Voice-${exportScopeSlug}.pdf`);
    } finally {
      setExporting(null);
    }
  };

  const exportTeacherPdf = async () => {
    setExporting("teacher-pdf");
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const teacher = focusedTeacher;
      const navy: [number, number, number] = [21, 28, 98];
      const blue: [number, number, number] = [38, 60, 160];
      const yellow: [number, number, number] = [246, 197, 21];
      const indicatorLabels = ["Claridad al explicar", "Trato respetuoso", "Evaluación justa", "Confianza para preguntar"];
      const reading = (value: number) => value >= 90 ? "Fortaleza consolidada" : value >= 80 ? "Resultado favorable" : value >= 70 ? "Requiere seguimiento" : "Atención prioritaria";

      pdf.setFillColor(...navy); pdf.rect(0, 0, 210, 27, "F");
      pdf.setFillColor(...yellow); pdf.rect(0, 27, 210, 2, "F");
      pdf.setTextColor(255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15); pdf.text("Ficha individual docente", 14, 11);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5); pdf.text(`IMAA Teens Voice · ${scopeLabel}`, 14, 19);

      pdf.setFillColor(244, 246, 252); pdf.roundedRect(14, 35, 182, 25, 3, 3, "F");
      pdf.setTextColor(...navy); pdf.setFont("helvetica", "bold"); pdf.setFontSize(13); pdf.text(teacher.name, 20, 45);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(75); pdf.text(`${teacher.subject} · ${teacher.responses} evaluaciones válidas`, 20, 53);
      pdf.setFillColor(teacher.priority === "Fortaleza" ? 224 : 255, teacher.priority === "Fortaleza" ? 245 : 244, teacher.priority === "Fortaleza" ? 234 : 218);
      pdf.roundedRect(158, 42, 31, 10, 5, 5, "F"); pdf.setFont("helvetica", "bold"); pdf.setFontSize(7); pdf.setTextColor(...navy); pdf.text(teacher.priority, 173.5, 48.5, { align: "center" });

      [["Promedio", `${teacher.score}`], ["Experiencia positiva", `${teacher.positive}%`], ["Participación", `${teacher.responses}`], ["Tendencia", teacher.trend]].forEach(([label, value], index) => {
        const x = 14 + index * 46; pdf.setFillColor(248, 249, 252); pdf.roundedRect(x, 66, 42, 20, 2, 2, "F");
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(...blue); pdf.text(value, x + 4, 75);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.2); pdf.setTextColor(95); pdf.text(label, x + 4, 82);
      });

      autoTable(pdf, {
        startY: 92, margin: { left: 14, right: 14 },
        head: [["Indicador evaluado", "Resultado", "Interpretación"]],
        body: indicatorLabels.map((label, index) => [label, `${teacher.indicators[index]}%`, reading(teacher.indicators[index])]),
        theme: "grid", headStyles: { fillColor: blue }, styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: { 1: { halign: "center", fontStyle: "bold", cellWidth: 25 }, 2: { cellWidth: 52 } },
      });
      let y = (pdf as typeof pdf & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      [["Fortaleza principal", teacher.strength, [232, 247, 239]], ["Oportunidad prioritaria", teacher.opportunity, [255, 247, 220]]].forEach(([label, text, color], index) => {
        const x = 14 + index * 92; const rgb = color as number[]; pdf.setFillColor(rgb[0], rgb[1], rgb[2]); pdf.roundedRect(x, y, 88, 22, 2, 2, "F");
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(7); pdf.setTextColor(...navy); pdf.text(label as string, x + 4, y + 7);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.7); pdf.setTextColor(70); pdf.text(pdf.splitTextToSize(text as string, 79), x + 4, y + 13);
      });
      y += 28;
      pdf.setFillColor(237, 241, 253); pdf.roundedRect(14, y, 182, 24, 2, 2, "F");
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(7.5); pdf.setTextColor(...navy); pdf.text("Recomendación específica", 19, y + 7);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.8); pdf.setTextColor(65); pdf.text(pdf.splitTextToSize(teacher.recommendation, 170), 19, y + 14);
      y += 30;
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5); pdf.setTextColor(...navy); pdf.text("Comentarios del alumnado · clasificados y anonimizados", 14, y);
      autoTable(pdf, {
        startY: y + 4, margin: { left: 14, right: 14 }, head: [["Contexto", "Comentario"]],
        body: teacher.comments.map((comment) => [comment.category, comment.text]), theme: "striped",
        headStyles: { fillColor: navy }, styles: { fontSize: 6.6, cellPadding: 2 }, columnStyles: { 0: { cellWidth: 35, fontStyle: "bold" } },
      });
      y = (pdf as typeof pdf & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.2); pdf.setTextColor(95);
      pdf.text(pdf.splitTextToSize("Lectura orientativa basada en el alcance seleccionado. Los comentarios fueron anonimizados; deben utilizarse para acompañamiento y mejora, nunca para identificar al alumnado.", 177), 14, y);
      pdf.setDrawColor(220); pdf.line(14, 283, 196, 283); pdf.setFontSize(6.5); pdf.text("IMAA Teens Voice · Ficha docente confidencial", 14, 289); pdf.text("1/1", 190, 289);
      const teacherSlug = teacher.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      pdf.save(`IMAA-Docente-${teacherSlug}-${exportScopeSlug}.pdf`);
    } finally {
      setExporting(null);
    }
  };

  const exportStudentVoicePdf = async () => {
    setExporting("voice-pdf");
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const navy: [number, number, number] = [21, 28, 98];
      const blue: [number, number, number] = [38, 60, 160];
      const yellow: [number, number, number] = [246, 197, 21];
      const themes = voiceThemes.map((theme) => [theme.label, theme.mentions, theme.reading, theme.action]);
      const comments = voiceComments.map((comment) => [comment.category, comment.text]);

      pdf.setFillColor(...navy); pdf.rect(0, 0, 210, 27, "F"); pdf.setFillColor(...yellow); pdf.rect(0, 27, 210, 2, "F");
      pdf.setTextColor(255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15); pdf.text("Ficha · Voz del alumnado", 14, 11);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5); pdf.text(`IMAA Teens Voice · ${scopeLabel}`, 14, 19);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(...navy); pdf.text("Qué expresa el segmento seleccionado", 14, 40);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.2); pdf.setTextColor(70); pdf.text(pdf.splitTextToSize(`Síntesis de ${scopedResponseCount} respuestas válidas. La lectura combina frecuencia temática y contexto; orienta decisiones, pero no sustituye la revisión cualitativa.`, 177), 14, 47);
      [["Respuestas", `${scopedResponseCount}`], ["Participación", `${participationRate}%`], ["Experiencia positiva", `${positiveExperience}%`], ["Temas prioritarios", "3"]].forEach(([label, value], index) => {
        const x = 14 + index * 46; pdf.setFillColor(244, 246, 252); pdf.roundedRect(x, 58, 42, 20, 2, 2, "F"); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10.5); pdf.setTextColor(...blue); pdf.text(value, x + 4, 67); pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.1); pdf.setTextColor(90); pdf.text(label, x + 4, 74);
      });
      autoTable(pdf, { startY: 85, margin: { left: 14, right: 14 }, head: [["Tema recurrente", "Menciones", "Lectura", "Acción sugerida"]], body: themes, theme: "grid", headStyles: { fillColor: blue }, styles: { fontSize: 6.7, cellPadding: 2 }, columnStyles: { 1: { halign: "center", fontStyle: "bold", cellWidth: 20 }, 2: { cellWidth: 27 }, 3: { cellWidth: 65 } } });
      let y = (pdf as typeof pdf & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      pdf.setFillColor(237, 241, 253); pdf.roundedRect(14, y, 182, 25, 2, 2, "F"); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(...navy); pdf.text("Interpretación ejecutiva", 19, y + 7); pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.8); pdf.setTextColor(65); pdf.text(pdf.splitTextToSize(`${voiceProfile.focus} La prioridad es ${voiceProfile.action.toLowerCase()}`, 170), 19, y + 14);
      y += 31;
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5); pdf.setTextColor(...navy); pdf.text("Voces representativas · anonimizadas", 14, y);
      autoTable(pdf, { startY: y + 4, margin: { left: 14, right: 14 }, head: [["Clasificación", "Comentario"]], body: comments, theme: "striped", headStyles: { fillColor: navy }, styles: { fontSize: 6.7, cellPadding: 2 }, columnStyles: { 0: { cellWidth: 34, fontStyle: "bold" } } });
      y = (pdf as typeof pdf & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      pdf.setFillColor(255, 248, 220); pdf.roundedRect(14, y, 182, 26, 2, 2, "F"); pdf.setFont("helvetica", "bold"); pdf.setFontSize(7.5); pdf.setTextColor(...navy); pdf.text("Siguiente paso recomendado", 19, y + 7); pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.8); pdf.setTextColor(65); pdf.text(pdf.splitTextToSize("Elegir dos solicitudes viables, asignar responsable y fecha, y comunicar al alumnado qué se hará, qué no y por qué. Volver a medir en 30–60 días.", 170), 19, y + 14);
      pdf.setDrawColor(220); pdf.line(14, 283, 196, 283); pdf.setFontSize(6.5); pdf.setTextColor(95); pdf.text("IMAA Teens Voice · Resultados agrupados y confidenciales", 14, 289); pdf.text("1/1", 190, 289);
      pdf.save(`IMAA-Voz-del-Alumnado-${exportScopeSlug}.pdf`);
    } finally {
      setExporting(null);
    }
  };

  const exportChannelPdf = async () => {
    setExporting("channel-pdf");
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const navy: [number, number, number] = [21, 28, 98];
      const blue: [number, number, number] = [38, 60, 160];
      const yellow: [number, number, number] = [246, 197, 21];
      pdf.setFillColor(...navy); pdf.rect(0, 0, 210, 27, "F"); pdf.setFillColor(...yellow); pdf.rect(0, 27, 210, 2, "F");
      pdf.setTextColor(255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15); pdf.text("Ficha de canalización", 14, 11);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5); pdf.text(`IMAA Teens Voice - ${scopeLabel}`, 14, 19);
      pdf.setFont("helvetica", "bold"); pdf.setTextColor(...navy); pdf.setFontSize(11); pdf.text("Semáforo de hallazgos", 14, 41);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.2); pdf.setTextColor(70); pdf.text(pdf.splitTextToSize(`Clasificación de ${channelTotal} hallazgos dentro del alcance seleccionado. Los casos sensibles permanecen protegidos y sólo se reportan como cantidad.`, 177), 14, 48);
      const colors: [number, number, number][] = [[57, 168, 117], [228, 179, 61], [232, 139, 70], [223, 91, 91]];
      channelData.forEach((item, index) => {
        const x = 14 + index * 46; const color = colors[index]; pdf.setFillColor(247, 248, 251); pdf.roundedRect(x, 61, 42, 25, 2, 2, "F");
        pdf.setFillColor(...color); pdf.circle(x + 6, 68, 2.5, "F"); pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(...navy); pdf.text(`${Math.round(item.percentage * 100)}%`, x + 11, 71);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.2); pdf.setTextColor(85); pdf.text(`${item.count} - ${item.label}`, x + 4, 80, { maxWidth: 34 });
      });
      autoTable(pdf, { startY: 94, margin: { left: 14, right: 14 }, head: [["Nivel", "Clasificación", "Hallazgos", "Lectura", "Ruta sugerida"]], body: channelData.map((item) => [item.level, item.label, item.count, item.interpretation, item.route]), theme: "grid", headStyles: { fillColor: blue }, styles: { fontSize: 6.5, cellPadding: 2 }, columnStyles: { 0: { cellWidth: 18, fontStyle: "bold" }, 1: { cellWidth: 27 }, 2: { cellWidth: 18, halign: "center" }, 3: { cellWidth: 65 } } });
      let y = (pdf as typeof pdf & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5); pdf.setTextColor(...navy); pdf.text("Comentarios y evidencias recabadas", 14, y);
      autoTable(pdf, { startY: y + 4, margin: { left: 14, right: 14 }, head: [["Clasificación", "Comentario anonimizado", "Tratamiento"]], body: voiceComments.map((comment) => [comment.category, comment.text, comment.category === "Reservado" ? "Canalización confidencial" : "Análisis agrupado"]), theme: "striped", headStyles: { fillColor: navy }, styles: { fontSize: 6.5, cellPadding: 2 }, columnStyles: { 0: { cellWidth: 31, fontStyle: "bold" }, 2: { cellWidth: 39 } } });
      y = (pdf as typeof pdf & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
      pdf.setFillColor(255, 248, 220); pdf.roundedRect(14, y, 182, 29, 2, 2, "F"); pdf.setFont("helvetica", "bold"); pdf.setFontSize(7.5); pdf.setTextColor(...navy); pdf.text("Recomendación de canalización", 19, y + 7); pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.7); pdf.setTextColor(65); pdf.text(pdf.splitTextToSize("Conservar las fortalezas; convertir las oportunidades en acuerdos con responsable y fecha; validar los patrones prioritarios; y mantener las situaciones sensibles en un circuito confidencial con seguimiento documentado.", 170), 19, y + 14);
      pdf.setDrawColor(220); pdf.line(14, 283, 196, 283); pdf.setFontSize(6.5); pdf.setTextColor(95); pdf.text("IMAA Teens Voice - Información agrupada y confidencial", 14, 289); pdf.text("1/1", 190, 289);
      pdf.save(`IMAA-Canalizacion-${exportScopeSlug}.pdf`);
    } finally {
      setExporting(null);
    }
  };

  function renderLevel() {
    if (level === 0) {
      return (
        <section className="welcome">
          <div className="voice-orbit"><span>🎙️</span></div>
          <p className="eyebrow">TEST ANÓNIMO DE EXPERIENCIA ESTUDIANTIL</p>
          <h1>Tu voz puede mejorar el <span>IMMA</span></h1>
          <p className="lead">
            Comparte lo que realmente piensas en un espacio seguro, claro y confidencial.
            No pediremos tu nombre, matrícula ni correo.
          </p>
          <div className="trust-row">
            <div><strong>🔒 100 % anónimo</strong><span>Sin datos personales</span></div>
            <div><strong>⏱️ 8–12 minutos</strong><span>Ágil y sencillo</span></div>
            <div><strong>💬 Tu opinión cuenta</strong><span>Responde con libertad</span></div>
          </div>
          <label className="consent">
            <input
              type="checkbox"
              checked={answers.consent === "Sí"}
              onChange={(event) => setAnswer("consent", event.target.checked ? "Sí" : "")}
            />
            <span>Entiendo que este formulario es anónimo y deseo participar libremente.</span>
          </label>
          <button className="primary hero-button" onClick={next} disabled={answers.consent !== "Sí"}>
            Comenzar mi recorrido <span>→</span>
          </button>
        </section>
      );
    }

    if (level === 1) {
      return (
        <>
          <div className="section-heading">
            <span className="level-icon">👋</span>
            <div><p>NIVEL 1</p><h2>Tú en el IMMA</h2></div>
          </div>
          <div className="privacy-note">🔒 Usaremos grado y grupo únicamente para mostrarte a las personas que te corresponden.</div>
          <div className="question-block">
            <h3>¿En qué grado estudias?</h3>
            <div className="compact-grid">
              {catalogGrades.map((item) => (
                <Choice key={item} label={item} selected={answers.grade === item} onClick={() => { setAnswers((current) => ({ ...current, grade: item, group: "" })); setTeacherIndex(0); }} />
              ))}
            </div>
          </div>
          <div className="question-block">
            <h3>Selecciona tu grupo</h3>
            <div className="three-grid">
              {studentGroupOptions.map((item) => (
                <Choice key={item} label={item} selected={answers.group === item} onClick={() => { setAnswer("group", item); setTeacherIndex(0); }} />
              ))}
            </div>
            {!selectedStudentGrade && <small>Primero selecciona tu grado para ver los grupos disponibles.</small>}
          </div>
          <div className="question-block">
            <h3>Cuando llegas al IMMA, normalmente te sientes…</h3>
            <div className="compact-grid">
              {[["😄", "Con entusiasmo"], ["🙂", "Bien la mayoría de los días"], ["😕", "Con pocas ganas"], ["😣", "Incómodo/a o preocupado/a"]].map(([emoji, label]) => (
                <Choice key={label} emoji={emoji} label={label} selected={answers.arrival === label} onClick={() => setAnswer("arrival", label)} />
              ))}
            </div>
          </div>
          <ScaleQuestion id="imma_safe" text="Me siento seguro/a dentro del IMMA." answers={answers} setAnswer={setAnswer} />
          <ScaleQuestion id="imma_heard" text="Siento que mi opinión es tomada en cuenta." answers={answers} setAnswer={setAnswer} />
          <ScaleQuestion id="imma_help" text="Sé con quién pedir ayuda cuando la necesito." answers={answers} setAnswer={setAnswer} />
        </>
      );
    }

    if (level === 2) {
      const teacher = studentTeachers[teacherIndex];
      if (!teacher) return <div className="empty-state"><strong>Selecciona tu grado y grupo</strong><p>Regresa al paso anterior para cargar las materias y docentes que te corresponden.</p></div>;
      const prefix = `teacher_${teacher.code}`;
      const requiredFields = teacherQuestions.map((question) => question.id);
      const completedTeachers = studentTeachers.filter((item) =>
        requiredFields.every((field) => Boolean(answers[`teacher_${item.code}_${field}`])),
      ).length;
      const currentCompleted = requiredFields.every((field) => Boolean(answers[`${prefix}_${field}`]));
      const answeredTeacherQuestions = requiredFields.filter((field) => Boolean(answers[`${prefix}_${field}`])).length;
      const firstUnansweredQuestion = teacherQuestions.find((question) => !answers[`${prefix}_${question.id}`])?.id ?? teacherQuestions[teacherQuestions.length - 1].id;
      const activeQuestionId = expandedTeacherQuestion ?? firstUnansweredQuestion;

      return (
        <>
          <div className="section-heading">
            <span className="level-icon">📚</span>
            <div><p>NIVEL 2 · {completedTeachers} DE {studentTeachers.length} EVALUADOS</p><h2>Tus clases y docentes</h2></div>
          </div>
          <div className="teacher-workspace">
            <aside className="teacher-checklist" aria-label="Lista de docentes">
              <div className="checklist-heading">
                <div><strong>Checklist de docentes</strong><span>Selecciona una tarjeta para evaluarla</span></div>
                <b>{completedTeachers}/{studentTeachers.length}</b>
              </div>
              <div className="checklist-progress"><i style={{ width: `${(completedTeachers / studentTeachers.length) * 100}%` }} /></div>
              <div className="teacher-list">
                {studentTeachers.map((item, index) => {
                  const itemPrefix = `teacher_${item.code}`;
                  const isComplete = requiredFields.every((field) => Boolean(answers[`${itemPrefix}_${field}`]));
                  const hasStarted = requiredFields.some((field) => Boolean(answers[`${itemPrefix}_${field}`]));
                  return (
                    <button
                      type="button"
                      key={item.code}
                      className={`teacher-list-item ${teacherIndex === index ? "active" : ""} ${isComplete ? "complete" : ""}`}
                      onClick={() => openTeacher(index)}
                    >
                      <span className="mini-avatar">{item.initials}</span>
                      <span><strong>{item.name}</strong><small>{item.subject}</small></span>
                      <b>{isComplete ? "✓" : hasStarted ? "•" : index + 1}</b>
                    </button>
                  );
                })}
              </div>
              <div className="checklist-legend"><span><i className="done-dot" /> Evaluado</span><span><i className="started-dot" /> En proceso</span></div>
            </aside>

            <div className="teacher-form">
              <div className="person-card teacher-main-card">
                <div className="avatar">{teacher.initials}</div>
                <div className="person-copy">
                  <span className="tag">DOCENTE {teacherIndex + 1} DE {studentTeachers.length}</span>
                  <h2>{teacher.name}</h2>
                  <p>{teacher.subject} · {String(answers.grade || "1.º de secundaria")} · {String(answers.group || "Grupo A")}</p>
                </div>
                <span className={`card-status ${currentCompleted ? "complete-status" : ""}`}>{currentCompleted ? "Evaluado ✓" : "En evaluación"}</span>
              </div>
              <div className="teacher-flow-card compact-flow-card">
                <div className="teacher-flow-summary"><div><span>AVANCE DE ESTE DOCENTE</span><strong>{answeredTeacherQuestions} de {teacherQuestions.length} respuestas</strong></div><b>{Math.round(answeredTeacherQuestions / teacherQuestions.length * 100)}%</b></div>
                <div className="teacher-flow-progress"><i style={{ width: `${answeredTeacherQuestions / teacherQuestions.length * 100}%` }} /></div>
                <p>Selecciona una calificación y la pregunta se compactará automáticamente. Puedes tocarla de nuevo para modificarla.</p>
              </div>
              <div className="teacher-question-shell">
                <div className="linear-scale-guide"><span>Escala de calificación · 1 a 7</span>{teacherScale.map(([value, label]) => <div key={value}><b>{value}</b><small>{label}</small></div>)}</div>
                <div className="teacher-question-scroll" aria-label="15 preguntas de evaluación docente">
                  {teacherQuestions.map((question, questionIndex) => {
                    const answerKey = `${prefix}_${question.id}`;
                    const selectedLabel = String(answers[answerKey] || "");
                    const selectedValue = teacherScale.find(([value, label]) => label === selectedLabel || value === selectedLabel)?.[0];
                    const isExpanded = activeQuestionId === question.id;
                    return <article key={question.id} className={`linear-question ${isExpanded ? "expanded" : "collapsed"} ${selectedLabel ? "answered" : ""}`} onClick={() => setExpandedTeacherQuestion(question.id)}>
                      <div className="linear-question-copy"><span>{questionIndex + 1}</span><div><small>{question.dimension}</small><h3>{question.text}</h3></div>{selectedLabel ? <button type="button" className="answer-summary" onClick={(event) => { event.stopPropagation(); setExpandedTeacherQuestion(question.id); }}><b>{selectedValue}</b><span>{selectedLabel}</span><i>Editar</i></button> : <button type="button" className="answer-pending" onClick={(event) => { event.stopPropagation(); setExpandedTeacherQuestion(question.id); }}>Responder</button>}</div>
                      {isExpanded && <div className="linear-answer-scale">{teacherScale.map(([value, label]) => <button type="button" key={value} className={selectedLabel === label ? "selected" : ""} aria-label={`${value}, ${label}`} aria-pressed={selectedLabel === label} onClick={(event) => { event.stopPropagation(); setAnswer(answerKey, label); const nextQuestion = teacherQuestions[questionIndex + 1]; setExpandedTeacherQuestion(nextQuestion?.id ?? question.id); }}><b>{value}</b><span>{label}</span></button>)}</div>}
                    </article>;
                  })}
                </div>
                <div className="question-scroll-footer"><span>Las respuestas se guardan automáticamente</span><b>{answeredTeacherQuestions === teacherQuestions.length ? "Evaluación completa ✓" : `${teacherQuestions.length - answeredTeacherQuestions} por responder`}</b></div>
              </div>
              <div className="question-block teacher-comment-block">
                <h3>🌟 Lo mejor de {teacher.name.replace(/^(Mtra\.|Mtro\.)\s/, "")} es…</h3>
                <textarea
                  maxLength={500}
                  placeholder="Escribe un comentario breve (opcional)"
                  value={String(answers[`${prefix}_comment`] || "")}
                  onChange={(event) => setAnswer(`${prefix}_comment`, event.target.value)}
                />
                <small>{String(answers[`${prefix}_comment`] || "").length}/500 · No incluyas nombres de estudiantes.</small>
              </div>
              <div className="teacher-pagination">
                <button className="secondary" disabled={teacherIndex === 0} onClick={() => openTeacher(teacherIndex - 1)}>← Docente anterior</button>
                <span>{teacherIndex + 1} de {studentTeachers.length}</span>
                <button className="primary" disabled={!currentCompleted || teacherIndex === studentTeachers.length - 1} onClick={() => openTeacher(teacherIndex + 1)}>Siguiente docente →</button>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (level === 3) {
      return (
        <>
          <div className="section-heading">
            <span className="level-icon">🧭</span>
            <div><p>NIVEL 3</p><h2>Quienes dirigen el IMMA</h2></div>
          </div>
          <div className="person-card">
            <div className="avatar purple">LR</div>
            <div className="person-copy"><span className="tag purple-tag">DIRECTIVO</span><h2>Lic. Luis Rodríguez</h2><p>Coordinación académica</p></div>
            <span className="card-status">Tarjeta individual</span>
          </div>
          <div className="director-evaluation-intro">
            <div><span>EVALUACIÓN DIRECTIVA</span><h3>Tu experiencia con quienes dirigen IMMA</h3><p>Piensa en situaciones que hayas vivido y selecciona la opción que mejor represente tu experiencia.</p></div>
            <b>5 preguntas</b>
          </div>
          <div className="director-questions">
            <ScaleQuestion id="director_agreements" text="Cumple los acuerdos y organiza bien las actividades de la escuela." dimension="Organización y cumplimiento" answers={answers} setAnswer={setAnswer} />
            <ScaleQuestion id="director_communication" text="Explica con claridad las decisiones, reglas y cambios importantes." dimension="Comunicación" answers={answers} setAnswer={setAnswer} />
            <ScaleQuestion id="director_listens" text="Escucha a los estudiantes y toma en cuenta lo que pensamos." dimension="Escucha estudiantil" answers={answers} setAnswer={setAnswer} />
            <ScaleQuestion id="director_fair" text="Nos trata con respeto y busca soluciones justas." dimension="Respeto y trato justo" answers={answers} setAnswer={setAnswer} />
            <ScaleQuestion id="director_followup" text="Da seguimiento a los problemas hasta que se resuelven." dimension="Seguimiento" answers={answers} setAnswer={setAnswer} />
          </div>
          <div className="question-block director-comment-block">
            <h3>💬 ¿Qué podrían hacer mejor quienes dirigen IMMA?</h3>
            <textarea maxLength={500} placeholder="Tu comentario es opcional" value={String(answers.director_comment || "")} onChange={(e) => setAnswer("director_comment", e.target.value)} />
            <small>{String(answers.director_comment || "").length}/500 · Evita incluir nombres o datos personales.</small>
          </div>
        </>
      );
    }

    if (level === 4) {
      const selectedSupport = Array.isArray(answers.support) ? answers.support : [];
      return (
        <>
          <div className="section-heading">
            <span className="level-icon">🤝</span>
            <div><p>NIVEL 4</p><h2>Tu red de apoyo IMMA</h2></div>
          </div>
          <div className="question-block">
            <h3>¿Con cuáles de estas áreas has tenido contacto?</h3>
            <div className="compact-grid">
              {["🧠 Psicología", "🩺 Enfermería", "🤝 Tutoría", "No he utilizado estos servicios"].map((item) => {
                const selected = Array.isArray(answers.support) && answers.support.includes(item);
                return <Choice key={item} label={item} selected={selected} onClick={() => {
                  const current = Array.isArray(answers.support) ? answers.support : [];
                  if (item === "No he utilizado estos servicios") {
                    setAnswer("support", selected ? [] : [item]);
                  } else {
                    const withoutNone = current.filter((x) => x !== "No he utilizado estos servicios");
                    setAnswer("support", selected ? withoutNone.filter((x) => x !== item) : [...withoutNone, item]);
                  }
                }} />;
              })}
            </div>
          </div>
          {selectedSupport.includes("🧠 Psicología") && (
            <div className="support-evaluation">
                <div className="person-card psychology-card">
                  <div className="avatar sunflower">EV</div>
                  <div className="person-copy"><span className="tag gold-tag">PSICOLOGÍA</span><h2>Lic. Elena Vargas</h2><p>Psicología y orientación IMMA</p></div>
                  <span className="support-question-count">3 preguntas</span>
                </div>
              <ScaleQuestion id="psych_listens" text="Me escuchó con atención y sin juzgarme." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id="psych_safe" text="Me hizo sentir en confianza para hablar de lo que me preocupaba." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id="psych_useful" text="Su orientación me ayudó a saber qué podía hacer después." answers={answers} setAnswer={setAnswer} />
            </div>
          )}
          {selectedSupport.includes("🩺 Enfermería") && (
            <div className="support-evaluation">
                <div className="person-card nurse-card">
                  <div className="avatar light-blue">AS</div>
                  <div className="person-copy"><span className="tag">ENFERMERÍA</span><h2>Enf. Ana Sánchez</h2><p>Servicio de Enfermería IMMA</p></div>
                  <span className="support-question-count">3 preguntas</span>
                </div>
              <ScaleQuestion id="nurse_care" text="Me atendió con amabilidad y tomó en serio lo que sentía." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id="nurse_clear" text="Me explicó claramente qué debía hacer." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id="nurse_followup" text="Me indicó cuándo debía regresar o pedir más ayuda." answers={answers} setAnswer={setAnswer} />
            </div>
          )}
          {selectedSupport.includes("🤝 Tutoría") && (
            <div className="support-evaluation">
                <div className="person-card support-card">
                  <div className="avatar sunflower">ML</div>
                  <div className="person-copy"><span className="tag gold-tag">TUTORÍA</span><h2>Lic. Mariana López</h2><p>Tutora de acompañamiento · Grupo A</p></div>
                  <span className="support-question-count">3 preguntas</span>
                </div>
              <ScaleQuestion id="tutor_listens" text="Me escucha cuando tengo una dificultad." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id="tutor_guidance" text="Me ayuda a encontrar una solución o el apoyo que necesito." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id="tutor_cares" text="Se interesa por cómo estamos, no solo por las calificaciones." answers={answers} setAnswer={setAnswer} />
            </div>
          )}
          {selectedSupport.length === 0 && <div className="empty-support">Selecciona un área para ver cómo se presentará su evaluación.</div>}
          {selectedSupport.includes("No he utilizado estos servicios") && <div className="empty-support support-none-note">Gracias por indicarlo. Puedes continuar; estas preguntas no se mostrarán porque todavía no has utilizado los servicios.</div>}
          <div className="question-block">
            <h3>💬 ¿Qué podría mejorar el IMMA en sus servicios de apoyo?</h3>
            <textarea maxLength={500} placeholder="Tu comentario es opcional" value={String(answers.support_comment || "")} onChange={(e) => setAnswer("support_comment", e.target.value)} />
            <small>{String(answers.support_comment || "").length}/500 · Evita incluir nombres o datos personales.</small>
          </div>
        </>
      );
    }

    if (level === 5) {
      return (
        <>
          <div className="section-heading">
            <span className="level-icon">💡</span>
            <div><p>NIVEL 5</p><h2>El IMMA que tú quieres</h2></div>
          </div>
          <p className="instruction">Usa el semáforo para ayudarnos a reconocer, atender y mejorar.</p>
          {[
            ["green", "🟢 Algo que debemos conservar", "¿Qué es lo mejor del IMMA y no debería cambiar?"],
            ["yellow", "🟡 Algo que necesita atención", "¿Qué podría convertirse en un problema si no se atiende?"],
            ["red", "🔴 Algo que debemos mejorar", "¿Qué necesita cambiar lo antes posible?"],
          ].map(([id, title, prompt]) => (
            <div className={`question-block traffic ${id}`} key={id}>
              <h3>{title}</h3><p>{prompt}</p>
              <textarea maxLength={500} placeholder="Cuéntanos con tus propias palabras (opcional)" value={String(answers[id] || "")} onChange={(e) => setAnswer(id, e.target.value)} />
              <small>{String(answers[id] || "").length}/500 · Evita incluir nombres o datos personales.</small>
            </div>
          ))}
        </>
      );
    }

    return (
      <section className="finish">
        <div className="confetti">✦　🎉　✦</div>
        <p className="eyebrow">RECORRIDO COMPLETADO</p>
        <h1>Tu voz deja huella</h1>
        <p className="lead">Puedes regresar para revisar tus respuestas o finalizar esta prueba de demostración.</p>
        <div className="summary-card">
          {levels.slice(1, -1).map((item) => <div key={item}><span>✓</span>{item}</div>)}
        </div>
        <div className="final-message">
          <strong>🔒 Tu participación es anónima</strong>
          <p>En la versión final, los resultados se analizarán de forma agrupada y por persona evaluada, nunca por estudiante.</p>
        </div>
        <button className="primary hero-button" onClick={() => {
          localStorage.removeItem("imma-teens-voice-preview");
          setAnswers({});
          setLevel(0);
        }}>Finalizar prueba</button>
      </section>
    );
  }

  return (
    <main>
      <header className={`topbar ${view === "welcome" ? "welcome-topbar" : ""}`}>
        <div className="brand">
          <img className="official-logo" src="/imma-logo.png" alt="Logotipo del Instituto Mexicano de Alto Aprendizaje" />
          <div><strong>IMAA Teens Voice</strong><span>Instituto Mexicano de Alto Aprendizaje</span></div>
        </div>
        <div className="header-controls">
          {/* El conmutador anterior ofrecía "🔒 Resultados" a todo el mundo,
              incluidos los alumnos, junto a las evaluaciones de sus propios
              docentes. El acceso del personal queda discreto; la protección
              real corresponde a la autenticación del servidor. */}
          {view === "welcome" ? null : view === "test" ? (
            <button
              type="button"
              className="staff-access"
              onClick={() => setView("data")}
              aria-label="Acceso para personal autorizado"
              title="Acceso para personal autorizado"
            >
              <span aria-hidden="true">🔒</span>
            </button>
          ) : (
            <button type="button" className="staff-return" onClick={() => setView("welcome")}>
              ← Vista del test
            </button>
          )}
          <button type="button" className="theme-toggle" onClick={() => setDarkMode((current) => !current)} aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"} title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"} aria-pressed={darkMode}>
            <span aria-hidden="true">{darkMode ? "🌙" : "☀️"}</span>
          </button>
        </div>
      </header>

      {view === "welcome" ? (
        <section className="role-welcome" aria-labelledby="role-welcome-title">
          <div className="welcome-aura welcome-aura-one" aria-hidden="true" />
          <div className="welcome-aura welcome-aura-two" aria-hidden="true" />
          <div className="role-welcome-copy">
            <span className="welcome-seal" aria-hidden="true">✦</span>
            <p className="eyebrow">IMAA TEENS VOICE</p>
            <h1 id="role-welcome-title">Tu voz transforma<br /><span>nuestra comunidad</span></h1>
            <p>Bienvenido a un espacio creado para escuchar, comprender y mejorar juntos. Elige cómo deseas ingresar.</p>
          </div>
          <div className="role-grid">
            <button type="button" className="role-card student-role" onClick={() => setView("test")}>
              <span className="role-icon" aria-hidden="true"><b>☺</b></span>
              <span className="role-kicker">SOY ESTUDIANTE</span>
              <strong>Quiero compartir mi experiencia</strong>
              <span className="role-description">Responde el test de forma anónima y ayúdanos a construir una mejor experiencia escolar.</span>
              <span className="role-action">Comenzar mi participación <b aria-hidden="true">→</b></span>
              <span className="role-note">Tus respuestas son confidenciales</span>
            </button>
            <button type="button" className="role-card director-role" onClick={() => setView("data")}>
              <span className="role-icon" aria-hidden="true"><b>▥</b></span>
              <span className="role-kicker">SOY DIRECTIVO</span>
              <strong>Quiero consultar los resultados</strong>
              <span className="role-description">Ingresa al portal institucional para analizar hallazgos, tendencias y oportunidades de mejora.</span>
              <span className="role-action">Acceder al portal <b aria-hidden="true">→</b></span>
              <span className="role-note">Acceso exclusivo para personal autorizado</span>
            </button>
          </div>
          <div className="welcome-values" aria-label="Principios de IMAA Teens Voice">
            <span><b aria-hidden="true">✓</b> Escucha activa</span>
            <span><b aria-hidden="true">✓</b> Participación segura</span>
            <span><b aria-hidden="true">✓</b> Mejora continua</span>
          </div>
        </section>
      ) : view === "test" ? (
        <>
          {level > 0 && (
            <div className="progress-shell">
              <div className="progress-copy"><span>{levels[level]}</span><strong>{progress}%</strong></div>
              <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
              <div className="level-dots">
                {levels.slice(1).map((item, index) => {
                  const target = index + 1;
                  return <button type="button" key={item} title={target <= level ? `Volver a ${item}` : item} aria-label={`${item}${target === level ? ", etapa actual" : ""}`} disabled={target > level} className={`${target < level ? "done" : ""} ${target === level ? "current" : ""}`} onClick={() => goToLevel(target)}>{target < level ? "✓" : target}</button>;
                })}
              </div>
              <div className="progress-context"><span>{levelEncouragement}</span><strong>{answeredCount} {answeredCount === 1 ? "respuesta registrada" : "respuestas registradas"}</strong></div>
            </div>
          )}
          <div className="page-card">
            {saved && <div className="saved-toast">✓ Respuestas guardadas</div>}
            <div key={level} className="level-content">{renderLevel()}</div>
            {level > 0 && level < levels.length - 1 && (
              <div className="navigation">
                <button className="secondary" onClick={back}>← Regresar</button>
                <button className="primary" onClick={next} disabled={level === 1 && (!selectedStudentGrade || !selectedStudentGroup || studentTeachers.length === 0)}>Continuar →</button>
              </div>
            )}
            {level === levels.length - 1 && <button className="secondary bottom-back" onClick={back}>← Revisar respuestas</button>}
          </div>
        </>
      ) : !authorized ? (
        <section className="admin-login">
          <div className="login-visual">
            <img src="/imma-logo.png" alt="Logotipo IMMA" />
            <p className="eyebrow">PORTAL INSTITUCIONAL</p>
            <h1>Resultados protegidos</h1>
            <p>El análisis, los comentarios y los reportes están disponibles únicamente para personal autorizado.</p>
            <div className="login-features"><span>🔒 Acceso restringido</span><span>📊 Análisis profundo</span><span>📄 Reportes institucionales</span></div>
          </div>
          <form className="login-form" onSubmit={signIn}>
            <span className="lock-icon">🔐</span>
            <h2>Iniciar sesión</h2>
            <p>Ingresa tus credenciales institucionales.</p>
            <label>Usuario<input value={login.user} onChange={(e) => setLogin({ ...login, user: e.target.value })} autoComplete="username" placeholder="Usuario" /></label>
            <label>Contraseña<input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} autoComplete="current-password" placeholder="••••••••" /></label>
            {loginError && <div className="login-error">⚠️ {loginError}</div>}
            <button className="primary" type="submit">Acceder a resultados →</button>
            <small>Acceso de demostración: <strong>admin</strong> / <strong>imma2026</strong></small>
          </form>
        </section>
      ) : (
        <section className="dashboard">
          <div className="dashboard-heading">
            <div><p className="eyebrow">VISTA DEMOSTRATIVA</p><h1>Resultados IMAA Teens Voice</h1><p>Información anónima, organizada para facilitar decisiones y seguimiento.</p></div>
            <div className="dashboard-actions"><span className="demo-badge">Datos de prueba</span><button onClick={exportExcel} disabled={!analysisReady || Boolean(exporting)} title={!analysisReady ? "Disponible al superar 50 % de participación" : "Descargar libro completo de Excel"}>{exporting === "excel" ? "Preparando…" : "⬇ Excel completo"}</button><button onClick={exportPdf} disabled={!analysisReady || Boolean(exporting)} title={!analysisReady ? "Disponible al superar 50 % de participación" : "Descargar reporte ejecutivo PDF"}>{exporting === "pdf" ? "Preparando…" : "⬇ PDF ejecutivo"}</button><button onClick={() => { setAuthorized(false); sessionStorage.removeItem("imma-admin-preview"); }}>Salir</button></div>
          </div>
          {exporting && <div className="export-status" role="status" aria-live="polite"><span /> Generando un reporte compacto y completo. Estará listo en unos segundos.</div>}
          <nav className="dashboard-tabs" aria-label="Secciones de resultados">
            {resultTabs.map((tab) => <button key={tab.id} className={dashboardTab === tab.id ? "active" : ""} onClick={() => { setDashboardTab(tab.id); if (tab.id === "support") setSelectedSupportArea(0); }}>{tab.label}</button>)}
          </nav>
          <div className="result-tab-context"><span>{activeResultTab.icon}</span><div><strong>{activeResultTab.label}</strong><p>{activeResultTab.description}</p></div><div className="result-context-stats"><b>{scopedResponseCount}<small>respuestas</small></b><b>{participationRate}%<small>participación</small></b></div></div>
          <div className="filter-panel results-filter-bar">
            <div className="filter-title"><div><strong>Filtros de consulta</strong><span>El contenido se actualiza al instante.</span></div><button onClick={() => setFilters({ cycle: "2026–2027", grade: "Todos los grados", group: "Todos los grupos", area: "Todas las áreas" })}>Limpiar filtros</button></div>
            <div className="filters">
              <label>Ciclo escolar<select value={filters.cycle} onChange={(e) => updateFilter("cycle", e.target.value)}><option>2026–2027</option><option>2025–2026</option><option>Comparar ciclos</option></select></label>
              <label>Grado<select value={filters.grade} onChange={(e) => setFilters((current) => ({ ...current, grade: e.target.value, group: "Todos los grupos" }))}><option>Todos los grados</option>{catalogGrades.map((grade) => <option key={grade}>{grade}</option>)}</select></label>
              <label>Grupo<select value={filters.group} onChange={(e) => updateFilter("group", e.target.value)}><option>Todos los grupos</option>{resultGroupOptions.map((group) => <option key={group}>{group}</option>)}</select></label>
              <label>Área<select value={filters.area} onChange={(e) => updateFilter("area", e.target.value)}><option>Todas las áreas</option><option>Docentes</option><option>Dirección y coordinación</option><option>Psicología</option><option>Enfermería</option><option>Tutoría</option></select></label>
            </div>
          </div>
          {dashboardTab === "overview" && <section className={`participation-control ${analysisReady ? "ready" : "collecting"}`}>
            <div className="participation-ring" style={{ "--rate": `${participationRate * 3.6}deg` } as React.CSSProperties}><div><strong>{participationRate}%</strong><span>participación</span></div></div>
            <div className="participation-copy"><p>{analysisReady ? "ANÁLISIS HABILITADO" : "RECOPILANDO RESPUESTAS"}</p><h2>{analysisReady ? "La muestra ya permite comenzar el análisis" : `Faltan ${responsesNeeded} respuestas para superar el 50 %`}</h2><span>Las respuestas se almacenan desde el inicio. Las interpretaciones se actualizan automáticamente después de superar el umbral.</span><div className="sample-rules"><b>✓ Umbral: más de 50 %</b><b>✓ Mínimo de seguridad: 10 respuestas</b><b>{analysisReady ? "● Actualización activa" : "○ Análisis en espera"}</b></div></div>
            <div className="universe-control"><strong>Matrícula externa</strong><label>Total de estudiantes<input type="number" min="1" value={studentUniverse} onChange={(e) => setStudentUniverse(Math.max(1, Number(e.target.value)))} /></label><label>Respuestas recibidas<input type="number" min="0" max={studentUniverse} value={responseCount} onChange={(e) => setResponseCount(Math.min(studentUniverse, Math.max(0, Number(e.target.value))))} /></label><small>En producción estos valores se sincronizarán con el apartado externo.</small></div>
          </section>}
          {analysisReady ? <>
          {dashboardTab === "overview" && <>
          <section className="executive-pulse" aria-label="Lectura ejecutiva de resultados">
            <div className="pulse-heading"><span>Lectura ejecutiva</span><h2>Una institución sólida con una oportunidad clara de escucha</h2><p>El resultado combina alta percepción de respeto y seguridad con una demanda concreta: demostrar cómo se atienden las propuestas del alumnado.</p></div>
            <div className="pulse-score"><div className="score-orbit"><strong>{positiveExperience}</strong><span>/100</span></div><small>Índice de experiencia</small></div>
            <div className="pulse-actions"><button onClick={() => setDashboardTab("comments")}><span>01</span><div><strong>Escuchar</strong><small>Revisar temas recurrentes</small></div><b>→</b></button><button onClick={() => setDashboardTab("teachers")}><span>02</span><div><strong>Acompañar</strong><small>Priorizar retroalimentación</small></div><b>→</b></button><button onClick={() => setDashboardTab("report")}><span>03</span><div><strong>Actuar</strong><small>Aplicar el plan de 60 días</small></div><b>→</b></button></div>
          </section>
          <div className="metrics">
            <article><span>Participación</span><strong>{participationRate}%</strong><small>{scopedResponseCount} de {scopedUniverse} estudiantes</small></article>
            <article><span>Experiencia positiva</span><strong>{positiveExperience}%</strong><small>Fortaleza institucional</small></article>
            <article><span>Respuestas recibidas</span><strong>{scopedResponseCount}</strong><small>Actualización continua</small></article>
            <article><span>Comentarios por revisar</span><strong>{filters.area === "Todas las áreas" ? 14 : 6}</strong><small>{filters.area === "Todas las áreas" ? 3 : 1} requieren atención</small></article>
          </div>
          {filters.cycle === "Comparar ciclos" && <section className="cycle-comparison"><div className="comparison-heading"><div><span>COMPARACIÓN DEMOSTRATIVA</span><h2>Cómo evolucionaron los indicadores</h2></div><p>2025–2026 frente a 2026–2027 · mismo alcance de grado, grupo y área</p></div><div className="comparison-grid">{cycleComparison.map((item) => <article key={item.indicator}><strong>{item.indicator}</strong><div><span>{item.previous}%<small>Anterior</small></span><b>+{item.delta}</b><span>{item.current}%<small>Actual</small></span></div></article>)}</div><small className="prototype-note">Vista de prueba: en producción sólo comparará cohortes con datos reales y muestras equivalentes.</small></section>}
          <div className="decision-strip">
            <div className="decision-heading"><span>Lectura rápida</span><strong>Lo que requiere atención hoy</strong></div>
            <button onClick={() => setDashboardTab("teachers")}><span className="signal yellow-signal">1</span><div><strong>Retroalimentación docente</strong><small>18 comentarios solicitan orientación más clara para mejorar.</small></div><b>Analizar →</b></button>
            <button onClick={() => setDashboardTab("comments")}><span className="signal blue-signal">2</span><div><strong>Escucha estudiantil</strong><small>La percepción de ser escuchado es el indicador comparativamente más bajo.</small></div><b>Ver voces →</b></button>
            <button onClick={() => setDashboardTab("report")}><span className="signal green-signal">3</span><div><strong>Plan recomendado</strong><small>Hay una ruta sugerida de seguimiento a 15, 30 y 60 días.</small></div><b>Revisar →</b></button>
          </div>
          <div className="data-grid">
            <article className="chart-card">
              <div className="card-heading"><div><h2>Experiencia general</h2><p>Percepción agrupada del alumnado</p></div><span>Última aplicación</span></div>
              {[["Me siento respetado/a", 91], ["Me siento seguro/a", 88], ["Sé con quién pedir ayuda", 79], ["Mi opinión es tomada en cuenta", 72]].map(([label, value]) => {
                const adjusted = Number(value) + scopeAdjustment;
                return <div className="bar-row" key={label}><div><span>{label}</span><strong>{adjusted}%</strong></div><div className="bar"><i style={{ width: `${adjusted}%` }} /></div></div>;
              })}
            </article>
            <article className="channel-card">
              <div className="channel-heading"><div><h2>Canalización</h2><p>Clasificación preliminar de hallazgos</p></div><button onClick={exportChannelPdf} disabled={Boolean(exporting)} title="Exportar la canalización del alcance seleccionado">{exporting === "channel-pdf" ? "Generando…" : "↓ PDF"}</button></div>
              {channelData.map((item, index) => <div className={`channel ${["green-channel", "yellow-channel", "orange-channel", "red-channel"][index]}`} key={item.level}><span>{["🟢", "🟡", "🟠", "🔴"][index]}</span><div><strong>{item.label}</strong><small>{item.count} {index === 0 ? "reconocimientos" : index === 1 ? "sugerencias" : index === 2 ? "patrones" : "casos reservados"}</small></div><b>{Math.round(item.percentage * 100)}%</b></div>)}
            </article>
          </div>
          <article className="staff-table">
            <div className="card-heading"><div><h2>Vista rápida del equipo docente</h2><p>Cinco perfiles como referencia. Consulta el comparativo para explorar el resto.</p></div><button onClick={() => setDashboardTab("teachers")}>Ver todos →</button></div>
            <div className="table-head"><span>Persona / área</span><span>Evaluaciones</span><span>Promedio</span><span>Positivas</span><span>Estado</span></div>
            {scopedTeacherAnalysis.slice(0, 5).map((person) => (
              <div className="table-row" key={person.name}>
                <span><strong>{person.name}</strong><small>{person.subject} · {filters.grade} · {filters.group}</small></span>
                <span>{person.responses}</span><span>★ {person.score}</span><span>{person.positive}%</span>
                <span><b className={person.priority === "Fortaleza" ? "status-good" : "status-watch"}>{person.priority}</b></span>
              </div>
            ))}
          </article>
          </>}
          {dashboardTab === "teachers" && (
            <section className="deep-analysis">
              <div className="page-kicker"><span>Vista especializada · Análisis docente</span><strong>{scopeLabel}</strong></div>
              <div className="analysis-intro"><div><p className="eyebrow">ANÁLISIS PRELIMINAR</p><h2>Lectura docente a profundidad</h2><p>Integra indicadores cuantitativos, tendencias y temas recurrentes de los comentarios anónimos para el alcance seleccionado.</p></div><div className="analysis-score"><strong>{(scopedTeacherAnalysis.reduce((total, item) => total + item.score, 0) / scopedTeacherAnalysis.length).toFixed(1)}</strong><span>Promedio docente</span><small>{scopeAdjustment >= 0 ? "↑" : "↓"} evolución del segmento</small></div></div>
              <div className="teacher-analysis-split">
                <div className="analysis-ranking">
                  <div className="ranking-head"><strong>Comparativo docente</strong><span>Selecciona para ver el detalle</span></div>
                  <div className={`analysis-teacher-search ${analysisTeacherOpen ? "open" : ""}`}><span aria-hidden="true">⌕</span><input type="text" role="combobox" aria-label="Buscar profesor" aria-expanded={analysisTeacherOpen} aria-controls="analysis-teacher-options" placeholder="Buscar profesor por nombre…" value={analysisTeacherSearch} onFocus={(event) => { event.currentTarget.select(); setAnalysisTeacherOpen(true); }} onClick={() => setAnalysisTeacherOpen(true)} onChange={(event) => { setAnalysisTeacherSearch(event.target.value); setAnalysisTeacherOpen(true); }} onKeyDown={(event) => { if (event.key === "Escape") { setAnalysisTeacherOpen(false); setAnalysisTeacherSearch(""); } }} onBlur={() => setTimeout(() => setAnalysisTeacherOpen(false), 120)} /><b aria-hidden="true">⌄</b>{analysisTeacherOpen && <div id="analysis-teacher-options" className="analysis-teacher-options" role="listbox" onMouseDown={(event) => event.preventDefault()}>{analysisTeacherMatches.map(({ teacher, index }) => <button type="button" role="option" aria-selected={selectedAnalysisTeacher === index} className={selectedAnalysisTeacher === index ? "selected" : ""} key={teacher.code} onClick={() => { setSelectedAnalysisTeacher(index); setAnalysisTeacherSearch(""); setAnalysisTeacherOpen(false); setCommentsExpanded(false); }}><strong>{teacher.name}</strong><small>{teacher.subject}</small></button>)}{analysisTeacherMatches.length === 0 && <p>No se encontraron profesores.</p>}</div>}</div>
                  <div className="analysis-ranking-preview">
                    {preliminaryAnalysisTeachers.map(({ teacher: item, index }, position) => <button key={item.code} className={selectedAnalysisTeacher === index ? "active" : ""} onClick={() => { setSelectedAnalysisTeacher(index); setCommentsExpanded(false); }}>
                      <span className="rank-number">{position + 1}</span><span className="rank-person"><strong>{item.name}</strong><small>{item.subject}</small></span><span className="rank-score"><strong>{item.score}</strong><small>{item.trend}</small></span><b>›</b>
                    </button>)}
                  </div>
                </div>
                <article className={`teacher-detail teacher-tone-${selectedAnalysisTeacher + 1}`}>
                  <div className="detail-head"><div className="detail-avatar">{focusedTeacher.name.split(" ").slice(-1)[0].slice(0,2).toUpperCase()}</div><div><p>REPORTE INDIVIDUAL</p><h2>{focusedTeacher.name}</h2><span>{focusedTeacher.subject} · {focusedTeacher.responses} evaluaciones válidas</span></div><b className={focusedTeacher.priority === "Fortaleza" ? "status-good" : "status-watch"}>{focusedTeacher.priority}</b></div>
                  <div className="analysis-numbers large"><div><strong>{focusedTeacher.score}</strong><span>Promedio</span></div><div><strong>{focusedTeacher.positive}%</strong><span>Experiencias positivas</span></div><div><strong>{focusedTeacher.trend}</strong><span>Tendencia</span></div></div>
                  <div className="detail-bars">
                    {["Claridad al explicar", "Trato respetuoso", "Evaluación justa", "Confianza para preguntar"].map((label, index) => <div key={label}><span>{label}</span><strong>{focusedTeacher.indicators[index]}%</strong><i><b style={{ width: `${focusedTeacher.indicators[index]}%` }} /></i></div>)}
                  </div>
                  <div className="detail-insights"><div className="insight good"><span>✓</span><div><strong>Fortaleza principal</strong><p>{focusedTeacher.strength}</p></div></div><div className="insight improve"><span>↗</span><div><strong>Oportunidad prioritaria</strong><p>{focusedTeacher.opportunity}</p></div></div></div>
                  <div className="teacher-recommendation"><strong>Recomendación específica</strong><p>{focusedTeacher.recommendation}</p></div>
                  <button type="button" className={`comments-toggle ${commentsExpanded ? "open" : ""}`} onClick={() => setCommentsExpanded((current) => !current)} aria-expanded={commentsExpanded}><span>💬 Comentarios del alumnado</span><strong>{commentsExpanded ? "Ocultar comentarios" : "Desplegar comentarios"}</strong><b>{focusedTeacher.comments.length}</b></button>
                  {commentsExpanded && <div className="teacher-comments" aria-live="polite">{focusedTeacher.comments.map((comment) => <article key={`${focusedTeacher.name}-${comment.category}`} className={`teacher-comment ${comment.category === "Reconocimiento" ? "recognition" : comment.category === "Sugerencia" ? "suggestion" : "experience"}`}><span>{comment.category}</span><p>“{comment.text}”</p></article>)}</div>}
                  <div className="detail-actions"><button className="teacher-pdf-action" onClick={exportTeacherPdf} disabled={Boolean(exporting)} title={`Descargar ficha completa de ${focusedTeacher.name}`}>{exporting === "teacher-pdf" ? "Generando ficha…" : "↓ Descargar ficha PDF"}</button><button onClick={exportExcel} disabled={Boolean(exporting)}>Exportar datos</button></div>
                </article>
              </div>
            </section>
          )}
          {dashboardTab === "matrix" && (
            <section className="evaluation-matrix">
              <div className="page-kicker"><span>Vista especializada · Lineamientos de evaluación docente</span><strong>{scopeLabel}</strong></div>
              <div className="matrix-intro"><div><p className="eyebrow">MATRIZ DE EVALUACIÓN</p><h2>Resultados consolidados por reactivo</h2><p>La matriz conserva la escala original: un promedio menor representa una mejor valoración. El índice transforma el resultado a una lectura de 0 a 100.</p></div><div className="matrix-formula"><strong>Índice = (7 − promedio) ÷ 6</strong><span>1–3 favorables · 5–7 críticas</span></div></div>
              <div className="matrix-toolbar"><div className="matrix-legend"><span><i className="matrix-good" /> 75–100 Fortaleza</span><span><i className="matrix-watch" /> 50–74 Atención</span><span><i className="matrix-priority" /> 0–49 Área prioritaria</span></div><div className="matrix-toolbar-actions"><button type="button" className="matrix-excel-button" onClick={() => setMatrixExportOpen(true)}>⬇ Generar Excel de evaluación</button><button type="button" onClick={() => setMatrixDetailOpen((current) => !current)}>{matrixDetailOpen ? "Ver resumen" : "Ver 15 reactivos"} <b>{matrixDetailOpen ? "↑" : "↓"}</b></button></div></div>
              {!matrixDetailOpen && <div className="dimension-summary-grid">{dimensionMatrix.map((row) => <article key={row.dimension}><div><span>{row.questions} {row.questions === 1 ? "reactivo" : "reactivos"}</span><em className={row.level === "Fortaleza" ? "matrix-level-good" : row.level === "Atención" ? "matrix-level-watch" : "matrix-level-priority"}>{row.level}</em></div><h3>{row.dimension}</h3><div className="dimension-score"><strong>{row.performanceIndex}</strong><span>/100<small>Índice</small></span><b>{row.average}<small>Promedio / 7</small></b></div><i><b style={{ width: `${row.performanceIndex}%` }} /></i></article>)}</div>}
              {matrixDetailOpen && <div className="matrix-scroll">
                <div className="matrix-table matrix-head"><span>ID</span><span>Dimensión / pregunta</span><span>Respuestas</span><span>Promedio</span><span>Índice</span><span>Nivel</span><span>Favorables</span><span>Críticas</span></div>
                {teacherMatrix.map((row) => <div className="matrix-table matrix-row" key={row.id}><span><b>{row.id.toUpperCase()}</b></span><span><strong>{row.dimension}</strong><small>{row.text}</small></span><span>{row.responses}</span><span><b>{row.average}</b><small>/ 7</small></span><span><b>{row.performanceIndex}</b><small>/ 100</small></span><span><em className={row.level === "Fortaleza" ? "matrix-level-good" : row.level === "Atención" ? "matrix-level-watch" : "matrix-level-priority"}>{row.level}</em></span><span>{row.favorable} <small>({Math.round(row.favorable / row.responses * 100)}%)</small></span><span>{row.critical} <small>({Math.round(row.critical / row.responses * 100)}%)</small></span></div>)}
              </div>}
              <p className="matrix-note">Los resultados deben interpretarse junto con participación, comentarios anonimizados y contexto. Una sola medición no debe usarse como decisión automática sobre el docente.</p>
              {matrixExportOpen && <div className="matrix-export-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMatrixExportOpen(false); }}>
                <section className="matrix-export-dialog" role="dialog" aria-modal="true" aria-labelledby="matrix-export-title">
                  <button type="button" className="matrix-dialog-close" onClick={() => setMatrixExportOpen(false)} aria-label="Cerrar">×</button>
                  <div className="matrix-dialog-heading"><span>📊</span><div><p>EXPORTACIÓN ESPECIALIZADA</p><h2 id="matrix-export-title">Generar matriz docente en Excel</h2><small>La plantilla se llenará con las respuestas del alcance seleccionado.</small></div></div>
                  <div className="matrix-export-filters">
                    <div className="matrix-teacher-filter">
                      <label htmlFor="matrix-teacher-search">Resultado a generar</label>
                      <div className={`matrix-teacher-search ${matrixTeacherOpen ? "open" : ""}`}><span aria-hidden="true">⌕</span><input id="matrix-teacher-search" type="text" role="combobox" aria-autocomplete="list" aria-expanded={matrixTeacherOpen} aria-controls="matrix-teacher-options" autoComplete="off" placeholder="Selecciona o escribe el nombre del maestro…" value={matrixTeacherSearch} onFocus={(event) => { event.currentTarget.select(); setMatrixTeacherOpen(true); }} onClick={() => setMatrixTeacherOpen(true)} onChange={(event) => updateMatrixTeacherSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") { setMatrixTeacherOpen(false); setMatrixTeacherSearch(selectedMatrixLabel); } }} onBlur={() => setTimeout(() => { setMatrixTeacherOpen(false); setMatrixTeacherSearch(selectedMatrixLabel); }, 120)} /><b aria-hidden="true">⌄</b>{matrixTeacherOpen && <div id="matrix-teacher-options" className="matrix-teacher-options" role="listbox" onMouseDown={(event) => event.preventDefault()}><button type="button" role="option" aria-selected={matrixExportTeacher === "general"} className={matrixExportTeacher === "general" ? "selected" : ""} onClick={() => chooseMatrixTeacher("general")}><strong>Resultado general</strong><small>Todos los docentes</small></button>{visibleMatrixTeacherNames.map((name) => { const assignments = teacherCatalog.filter((teacher) => teacher.name === name); const subjectCount = new Set(assignments.map((teacher) => teacher.subject)).size; return <button type="button" role="option" aria-selected={matrixExportTeacher === name} className={matrixExportTeacher === name ? "selected" : ""} onClick={() => chooseMatrixTeacher(name)} key={name}><strong>{name}</strong><small>{subjectCount} {subjectCount === 1 ? "materia" : "materias"}</small></button>; })}{visibleMatrixTeacherNames.length === 0 && <p>No se encontraron maestros con ese nombre.</p>}</div>}</div>
                    </div>
                    <label>Ciclo escolar<select value={filters.cycle} onChange={(event) => updateFilter("cycle", event.target.value)}><option>2026–2027</option><option>2025–2026</option></select></label>
                    <label>Grado<select value={filters.grade} onChange={(event) => setFilters((current) => ({ ...current, grade: event.target.value, group: "Todos los grupos" }))}><option value="Todos los grados">Todos los grados que imparte</option>{matrixGradeOptions.map((grade) => <option value={grade} key={grade}>{grade}</option>)}</select></label>
                    <label>Grupo<select value={filters.group} onChange={(event) => updateFilter("group", event.target.value)}><option value="Todos los grupos">Todos los grupos que imparte</option>{matrixGroupOptions.map((group) => <option value={group} key={group}>{group}</option>)}</select></label>
                  </div>
                  {matrixExportTeacher !== "general" && <div className="matrix-teacher-context"><span>{matrixExportTeacher.slice(0, 1)}</span><div><strong>{matrixExportTeacher}</strong><small>{selectedMatrixSubjects.join(" · ")}</small><p>{matrixGradeOptions.length} {matrixGradeOptions.length === 1 ? "grado" : "grados"} · {[...new Set(selectedMatrixAssignments.map((teacher) => teacher.group))].length} grupos registrados</p></div></div>}
                  <div className="matrix-export-summary"><div><span>Alcance</span><strong>{matrixExportTeacher === "general" ? `${new Set(scopedTeacherAnalysis.map((teacher) => teacher.name)).size} docentes` : "1 docente"}</strong></div><div><span>Reactivos</span><strong>15 por evaluación</strong></div><div><span>Libro</span><strong>4 hojas vinculadas</strong></div></div>
                  <div className="matrix-export-notice"><b>✓</b><p>El archivo incluirá Cuestionario, Captura, Matriz evaluación y Dashboard, con un formato limpio y cálculos actualizados al abrirlo.</p></div>
                  <div className="matrix-dialog-actions"><button type="button" className="secondary" onClick={() => setMatrixExportOpen(false)}>Cancelar</button><button type="button" className="primary" disabled={matrixExporting} onClick={exportTeacherEvaluationWorkbook}>{matrixExporting ? "Generando archivo…" : "Descargar Excel lleno →"}</button></div>
                </section>
              </div>}
            </section>
          )}
          {dashboardTab === "support" && (
            <section className="support-results">
              <div className="page-kicker"><span>Vista especializada · Escala de cuatro opciones</span><strong>{scopeLabel}</strong></div>
              <div className="support-results-intro"><div><p className="eyebrow">DIRECCIÓN Y RED DE APOYO</p><h2>Cómo viven los estudiantes cada servicio</h2><p>Los porcentajes agrupan “Sí, totalmente” y “Casi siempre”. Cada área se analiza únicamente con estudiantes que indicaron haber tenido contacto con ella.</p></div><div className="support-scale-key"><span>Favorables</span><strong>😄 + 🙂</strong><small>Las respuestas desfavorables se revisan junto con comentarios y contexto.</small></div></div>
              <div className="support-result-layout">
                <nav className="support-area-list" aria-label="Áreas evaluadas">
                  {visibleSupportAreas.map((area, index) => <button type="button" key={area.area} className={focusedSupportArea.area === area.area ? "active" : ""} onClick={() => setSelectedSupportArea(index)}><span>{area.icon}</span><div><strong>{area.area}</strong><small>{area.questions.length} preguntas · {scopedResponseCount} respuestas</small></div><b>{area.average}%</b></button>)}
                </nav>
                <article className={`support-area-detail support-accent-${focusedSupportArea.accent}`}>
                  <div className="support-detail-head"><span>{focusedSupportArea.icon}</span><div><small>RESULTADO DEL ÁREA</small><h3>{focusedSupportArea.area}</h3><p>{focusedSupportArea.questions.length} indicadores evaluados con la escala habitual del test.</p></div><strong>{focusedSupportArea.average}%<small>positivo</small></strong></div>
                  <div className="support-question-results">{focusedSupportArea.questions.map((question) => <div key={question.label}><div><span><b>{question.label}</b><small>{question.text}</small></span><strong>{question.positive}%</strong></div><i><b style={{ width: `${question.positive}%` }} /></i></div>)}</div>
                  <div className="support-result-note"><strong>Lectura recomendada</strong><p>{focusedSupportArea.average >= 85 ? "El área muestra una experiencia sólida. Conviene conservar las prácticas mejor valoradas y revisar los comentarios para sostenerlas." : "El área presenta fortalezas y oportunidades concretas. Revise primero el indicador más bajo y contraste con los comentarios anónimos."}</p></div>
                </article>
              </div>
            </section>
          )}
          {dashboardTab === "comments" && (
            <section className="comments-analysis">
              <div className="page-kicker"><span>Vista especializada · Voz del alumnado</span><strong>{scopeLabel}</strong></div>
              <div className="analysis-intro voice-intro"><div><p className="eyebrow">VOZ DEL ALUMNADO</p><h2>Temas, emociones y propuestas recurrentes</h2><p>Comentarios revisados, anonimizados y clasificados dentro del alcance seleccionado. Las menciones indican recurrencia, no una calificación ni el número de estudiantes.</p></div><button className="voice-export" onClick={exportStudentVoicePdf} disabled={Boolean(exporting)}>{exporting === "voice-pdf" ? "Generando ficha…" : "↓ Exportar ficha PDF"}</button></div>
              <div className="voice-summary"><article><span>Lectura principal</span><strong>{voiceProfile.focus}</strong><p>Corresponde únicamente a {scopeLabel}.</p></article><article><span>Petición más recurrente</span><strong>{voiceThemes.filter((theme) => theme.reading !== "Fortaleza").sort((a, b) => b.mentions - a.mentions)[0].label}</strong><p>{voiceThemes.filter((theme) => theme.reading !== "Fortaleza").sort((a, b) => b.mentions - a.mentions)[0].action}</p></article><article><span>Decisión sugerida</span><strong>{voiceProfile.action}</strong><p>Mostrar seguimiento fortalece la percepción de escucha.</p></article></div>
              <div className="theme-cloud">{voiceThemes.map((theme) => <span key={theme.label}>{theme.label} <b>{theme.mentions}</b></span>)}</div>
              <button type="button" className="details-toggle" onClick={() => setVoiceDetailOpen((current) => !current)}>{voiceDetailOpen ? "Ocultar comentarios" : "Ver comentarios clasificados"}<b>{voiceDetailOpen ? "↑" : "↓"}</b></button>
              {voiceDetailOpen && <><div className="comment-columns"><article><h3>🌟 Reconocimientos</h3>{voiceComments.filter((comment) => comment.category === "Reconocimiento").map((comment) => <blockquote key={comment.text}>“{comment.text}”</blockquote>)}</article><article><h3>🔧 Sugerencias</h3>{voiceComments.filter((comment) => comment.category === "Sugerencia").map((comment) => <blockquote key={comment.text}>“{comment.text}”</blockquote>)}</article><article><h3>⚠️ Atención</h3><p>{reservedVoiceCount ? `${reservedVoiceCount} comentario${reservedVoiceCount === 1 ? " fue reservado" : "s fueron reservados"} para revisión del equipo responsable. No se muestran aquí para proteger su confidencialidad.` : "No hay comentarios reservados dentro del alcance seleccionado."}</p></article></div><div className="voice-reading"><strong>Cómo interpretar esta vista</strong><p><b>Reconocimientos</b> muestran prácticas que conviene conservar. <b>Sugerencias</b> señalan oportunidades concretas, no inconformidades aisladas. <b>Atención</b> agrupa mensajes que requieren un circuito confidencial. Compare siempre las menciones con participación, filtros y evolución entre periodos.</p></div></>}
            </section>
          )}
          {dashboardTab === "report" && (
            <section className="executive-report">
              <div className="page-kicker"><span>Documento institucional · Reporte ejecutivo</span><strong>{scopeLabel}</strong></div>
              <div className="report-cover"><img src="/imma-logo.png" alt="IMMA"/><div><p>REPORTE EJECUTIVO · {filters.cycle}</p><h2>{institutionalReport.title}</h2><span>{filters.grade} · {filters.group} · {filters.area} · {scopedResponseCount} respuestas válidas</span></div></div>
              <div className="report-grid"><article><span>01</span><h3>Hallazgo principal</h3><p>{institutionalReport.finding}</p></article><article><span>02</span><h3>Área de oportunidad</h3><p>{institutionalReport.opportunity}</p></article><article><span>03</span><h3>Lectura del área</h3><p>{institutionalReport.areaReading}</p></article><article><span>04</span><h3>Acción recomendada</h3><p>{institutionalReport.action}</p></article></div>
              {filters.cycle === "Comparar ciclos" && <div className="report-comparison"><strong>Lectura entre ciclos</strong><p>Los cuatro indicadores muestran avance en esta simulación. Escucha estudiantil presenta la mayor mejora (+4 puntos), aunque continúa como prioridad del segmento.</p></div>}
              <div className="action-plan"><h3>Plan de acción sugerido para {filters.area.toLowerCase()}</h3>{institutionalReport.plan.map((item) => { const actionKey = `${filters.area}-${item.period}`; const status = actionStatuses[actionKey] || "Por iniciar"; return <div key={item.period}><span>{item.period}</span><p><strong>{item.action}</strong><small>{item.owner} · Evidencia: {item.evidence}</small></p><label>Estado<select value={status} onChange={(event) => setActionStatuses((current) => ({ ...current, [actionKey]: event.target.value }))}><option>Por iniciar</option><option>En proceso</option><option>Completada</option></select></label></div>; })}<small className="prototype-note">Los estados se guardan solamente en este dispositivo durante la demostración.</small></div>
            </section>
          )}
          </> : (
            <section className="analysis-waiting">
              <div className="waiting-icon">📥</div><p className="eyebrow">DATOS EN RECOPILACIÓN</p><h2>Los resultados se mantienen protegidos hasta contar con una muestra suficiente</h2><p>El sistema ya está recibiendo y organizando las respuestas, pero no genera promedios, comparaciones, comentarios destacados ni reportes interpretativos antes de superar el 50 % de participación.</p>
              <div className="waiting-progress"><i style={{ width: `${participationRate}%` }} /></div><div className="waiting-stats"><span><strong>{responseCount}</strong> recibidas</span><span><strong>{responsesNeeded}</strong> por recibir</span><span><strong>{studentUniverse}</strong> estudiantes</span></div>
            </section>
          )}
          <div className="privacy-footer"><span>🔒</span><div><strong>Privacidad integrada desde el diseño</strong><p>No se recopilan nombres, matrículas ni correos. Los comentarios se revisan para retirar cualquier dato identificable antes de canalizarlos.</p></div></div>
        </section>
      )}
    </main>
  );
}
