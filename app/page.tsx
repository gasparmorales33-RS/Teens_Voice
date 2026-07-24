"use client";

import { useEffect, useState } from "react";

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

const teachers = [
  { code: "matematicas", initials: "AM", name: "Mtra. Andrea Martínez", subject: "Matemáticas" },
  { code: "espanol", initials: "CR", name: "Mtro. Carlos Ramírez", subject: "Español" },
  { code: "ciencias", initials: "LG", name: "Mtra. Laura García", subject: "Ciencias" },
  { code: "ingles", initials: "JP", name: "Mtro. Javier Pérez", subject: "Inglés" },
  { code: "historia", initials: "SF", name: "Mtra. Sofía Fernández", subject: "Historia" },
  { code: "tecnologia", initials: "RM", name: "Mtro. Ricardo Morales", subject: "Tecnología" },
  { code: "artes", initials: "DV", name: "Mtra. Diana Vázquez", subject: "Artes" },
];

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
}: {
  id: string;
  text: string;
  answers: Answers;
  setAnswer: (id: string, value: string) => void;
}) {
  return (
    <div className="question-block">
      <h3>{text}</h3>
      <div className="scale-grid">
        {scale.map(([emoji, label]) => (
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
  const [view, setView] = useState<"test" | "data">("test");
  const [darkMode, setDarkMode] = useState(false);
  const [level, setLevel] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [saved, setSaved] = useState(false);
  const [teacherIndex, setTeacherIndex] = useState(0);
  const [authorized, setAuthorized] = useState(false);
  const [login, setLogin] = useState({ user: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [dashboardTab, setDashboardTab] = useState<"overview" | "teachers" | "comments" | "report">("overview");
  const [filters, setFilters] = useState({ cycle: "2026–2027", grade: "Todos los grados", group: "Todos los grupos", area: "Todas las áreas" });
  const [selectedAnalysisTeacher, setSelectedAnalysisTeacher] = useState(0);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [actionStatuses, setActionStatuses] = useState<Record<string, string>>({});
  const [studentUniverse, setStudentUniverse] = useState(96);
  const [responseCount, setResponseCount] = useState(84);
  const [exporting, setExporting] = useState<"excel" | "pdf" | "teacher-pdf" | "voice-pdf" | "channel-pdf" | null>(null);

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

  const progress = Math.round((level / (levels.length - 1)) * 100);
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
  const scopeLabel = [filters.cycle, filters.grade, filters.group, filters.area].join(" · ");
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
  const scopedTeacherAnalysis = teacherAnalysis.map((item) => ({
    ...item,
    score: Math.max(1, Math.min(5, Number((item.score + scopeAdjustment / 20).toFixed(1)))),
    positive: Math.max(0, Math.min(100, item.positive + scopeAdjustment)),
    responses: Math.max(1, Math.min(scopedResponseCount, Math.round(item.responses * gradeFactor * groupFactor))),
    indicators: item.indicators.map((value) => Math.max(0, Math.min(100, value + scopeAdjustment))),
  }));
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
        { section: "Dirección", code: "director_listens", question: "Me escucha cuando necesito hablar.", positive: 78 + scopeAdjustment },
        { section: "Dirección", code: "director_fair", question: "Busca soluciones justas.", positive: 81 + scopeAdjustment },
        { section: "Psicología", code: "psych_listens", question: "Me escuchó sin juzgarme.", positive: 89 + scopeAdjustment },
        { section: "Psicología", code: "psych_useful", question: "Su apoyo me resultó útil.", positive: 84 + scopeAdjustment },
        { section: "Enfermería", code: "nurse_care", question: "Me atendió con amabilidad y tomó en serio lo que sentía.", positive: 91 + scopeAdjustment },
        { section: "Enfermería", code: "nurse_clear", question: "Me explicó claramente qué debía hacer.", positive: 87 + scopeAdjustment },
        { section: "Tutoría", code: "tutor_listens", question: "Me escucha cuando tengo una dificultad.", positive: 86 + scopeAdjustment },
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
        { Campo: "Resultado positivo", Definición: "Proporción estimada de respuestas favorables en una escala de cinco opciones." },
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
              {["1.º de secundaria", "2.º de secundaria", "3.º de secundaria", "1.º de preparatoria"].map((item) => (
                <Choice key={item} label={item} selected={answers.grade === item} onClick={() => setAnswer("grade", item)} />
              ))}
            </div>
          </div>
          <div className="question-block">
            <h3>Selecciona tu grupo</h3>
            <div className="three-grid">
              {["Grupo A", "Grupo B", "Grupo C"].map((item) => (
                <Choice key={item} label={item} selected={answers.group === item} onClick={() => setAnswer("group", item)} />
              ))}
            </div>
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
      const teacher = teachers[teacherIndex];
      const prefix = `teacher_${teacher.code}`;
      const requiredFields = ["explains", "respect", "help", "fair", "confidence"];
      const completedTeachers = teachers.filter((item) =>
        requiredFields.every((field) => Boolean(answers[`teacher_${item.code}_${field}`])),
      ).length;
      const currentCompleted = requiredFields.every((field) => Boolean(answers[`${prefix}_${field}`]));

      return (
        <>
          <div className="section-heading">
            <span className="level-icon">📚</span>
            <div><p>NIVEL 2 · {completedTeachers} DE 7 EVALUADOS</p><h2>Tus clases y docentes</h2></div>
          </div>
          <div className="teacher-workspace">
            <aside className="teacher-checklist" aria-label="Lista de docentes">
              <div className="checklist-heading">
                <div><strong>Checklist de docentes</strong><span>Selecciona una tarjeta para evaluarla</span></div>
                <b>{completedTeachers}/7</b>
              </div>
              <div className="checklist-progress"><i style={{ width: `${(completedTeachers / teachers.length) * 100}%` }} /></div>
              <div className="teacher-list">
                {teachers.map((item, index) => {
                  const itemPrefix = `teacher_${item.code}`;
                  const isComplete = requiredFields.every((field) => Boolean(answers[`${itemPrefix}_${field}`]));
                  const hasStarted = requiredFields.some((field) => Boolean(answers[`${itemPrefix}_${field}`]));
                  return (
                    <button
                      type="button"
                      key={item.code}
                      className={`teacher-list-item ${teacherIndex === index ? "active" : ""} ${isComplete ? "complete" : ""}`}
                      onClick={() => setTeacherIndex(index)}
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
                  <span className="tag">DOCENTE {teacherIndex + 1} DE 7</span>
                  <h2>{teacher.name}</h2>
                  <p>{teacher.subject} · {String(answers.grade || "1.º de secundaria")} · {String(answers.group || "Grupo A")}</p>
                </div>
                <span className={`card-status ${currentCompleted ? "complete-status" : ""}`}>{currentCompleted ? "Evaluado ✓" : "En evaluación"}</span>
              </div>
              <p className="instruction">Evalúa solamente lo que tú hayas vivido en esta clase. Las respuestas se guardan por cada docente.</p>
              <ScaleQuestion id={`${prefix}_explains`} text="Entiendo su manera de explicar." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id={`${prefix}_respect`} text="Me trata con respeto." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id={`${prefix}_help`} text="Me ayuda a mejorar y aprender." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id={`${prefix}_fair`} text="Califica de manera clara y justa." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id={`${prefix}_confidence`} text="Puedo preguntar sin miedo o vergüenza." answers={answers} setAnswer={setAnswer} />
              <div className="question-block">
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
                <button className="secondary" disabled={teacherIndex === 0} onClick={() => setTeacherIndex((current) => current - 1)}>← Docente anterior</button>
                <span>{teacherIndex + 1} de 7</span>
                <button className="primary" disabled={teacherIndex === teachers.length - 1} onClick={() => setTeacherIndex((current) => current + 1)}>Siguiente docente →</button>
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
          <ScaleQuestion id="director_listens" text="Me escucha cuando necesito hablar." answers={answers} setAnswer={setAnswer} />
          <ScaleQuestion id="director_fair" text="Busca soluciones justas." answers={answers} setAnswer={setAnswer} />
          <div className="question-block">
            <h3>💬 ¿Qué debería saber sobre lo que viven los estudiantes?</h3>
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
                  setAnswer("support", selected ? current.filter((x) => x !== item) : [...current, item]);
                }} />;
              })}
            </div>
          </div>
          {selectedSupport.includes("🧠 Psicología") && (
            <div className="support-evaluation">
              <div className="person-card psychology-card">
                <div className="avatar sunflower">EV</div>
                <div className="person-copy"><span className="tag gold-tag">PSICOLOGÍA</span><h2>Lic. Elena Vargas</h2><p>Psicología y orientación IMMA</p></div>
              </div>
              <ScaleQuestion id="psych_listens" text="Me escuchó sin juzgarme." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id="psych_useful" text="Su apoyo me resultó útil." answers={answers} setAnswer={setAnswer} />
            </div>
          )}
          {selectedSupport.includes("🩺 Enfermería") && (
            <div className="support-evaluation">
              <div className="person-card nurse-card">
                <div className="avatar light-blue">AS</div>
                <div className="person-copy"><span className="tag">ENFERMERÍA</span><h2>Enf. Ana Sánchez</h2><p>Servicio de Enfermería IMMA</p></div>
              </div>
              <ScaleQuestion id="nurse_care" text="Me atendió con amabilidad y tomó en serio lo que sentía." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id="nurse_clear" text="Me explicó claramente qué debía hacer." answers={answers} setAnswer={setAnswer} />
            </div>
          )}
          {selectedSupport.includes("🤝 Tutoría") && (
            <div className="support-evaluation">
              <div className="person-card support-card">
                <div className="avatar sunflower">ML</div>
                <div className="person-copy"><span className="tag gold-tag">TUTORÍA</span><h2>Lic. Mariana López</h2><p>Tutora de acompañamiento · Grupo A</p></div>
              </div>
              <ScaleQuestion id="tutor_listens" text="Me escucha cuando tengo una dificultad." answers={answers} setAnswer={setAnswer} />
              <ScaleQuestion id="tutor_cares" text="Se interesa por cómo estamos, no solo por las calificaciones." answers={answers} setAnswer={setAnswer} />
            </div>
          )}
          {selectedSupport.length === 0 && <div className="empty-support">Selecciona un área para ver cómo se presentará su evaluación.</div>}
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
      <header className="topbar">
        <div className="brand">
          <img className="official-logo" src="/imma-logo.png" alt="Logotipo del Instituto Mexicano de Alto Aprendizaje" />
          <div><strong>IMAA Teens Voice</strong><span>Instituto Mexicano de Alto Aprendizaje</span></div>
        </div>
        <div className="header-controls">
          <div className="view-switch">
            <button className={view === "test" ? "active" : ""} onClick={() => setView("test")}>Vista del test</button>
            <button className={view === "data" ? "active" : ""} onClick={() => setView("data")}>🔒 Resultados</button>
          </div>
          <button type="button" className="theme-toggle" onClick={() => setDarkMode((current) => !current)} aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"} title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"} aria-pressed={darkMode}>
            <span aria-hidden="true">{darkMode ? "🌙" : "☀️"}</span>
          </button>
        </div>
      </header>

      {view === "test" ? (
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
                <button className="primary" onClick={next}>Continuar →</button>
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
          <nav className="dashboard-tabs">
            <button className={dashboardTab === "overview" ? "active" : ""} onClick={() => setDashboardTab("overview")}>Resumen</button>
            <button className={dashboardTab === "teachers" ? "active" : ""} onClick={() => setDashboardTab("teachers")}>Análisis docente</button>
            <button className={dashboardTab === "comments" ? "active" : ""} onClick={() => setDashboardTab("comments")}>Voz del alumnado</button>
            <button className={dashboardTab === "report" ? "active" : ""} onClick={() => setDashboardTab("report")}>Reporte ejecutivo</button>
          </nav>
          <div className="filter-panel">
            <div className="filter-title"><div><strong>🔎 Alcance del análisis</strong><span>Combina los filtros para consultar resultados específicos o generales.</span></div><button onClick={() => setFilters({ cycle: "2026–2027", grade: "Todos los grados", group: "Todos los grupos", area: "Todas las áreas" })}>Restablecer</button></div>
            <div className="filters">
              <label>Ciclo escolar<select value={filters.cycle} onChange={(e) => updateFilter("cycle", e.target.value)}><option>2026–2027</option><option>2025–2026</option><option>Comparar ciclos</option></select></label>
              <label>Grado<select value={filters.grade} onChange={(e) => updateFilter("grade", e.target.value)}><option>Todos los grados</option><option>1.º de secundaria</option><option>2.º de secundaria</option><option>3.º de secundaria</option><option>1.º de preparatoria</option></select></label>
              <label>Grupo<select value={filters.group} onChange={(e) => updateFilter("group", e.target.value)}><option>Todos los grupos</option><option>Grupo A</option><option>Grupo B</option><option>Grupo C</option></select></label>
              <label>Área<select value={filters.area} onChange={(e) => updateFilter("area", e.target.value)}><option>Todas las áreas</option><option>Docentes</option><option>Dirección y coordinación</option><option>Psicología</option><option>Enfermería</option><option>Tutoría</option></select></label>
            </div>
            <div className="active-scope"><span>Vista actual</span><strong>{scopeLabel}</strong></div>
          </div>
          <section className={`participation-control ${analysisReady ? "ready" : "collecting"}`}>
            <div className="participation-ring" style={{ "--rate": `${participationRate * 3.6}deg` } as React.CSSProperties}><div><strong>{participationRate}%</strong><span>participación</span></div></div>
            <div className="participation-copy"><p>{analysisReady ? "ANÁLISIS HABILITADO" : "RECOPILANDO RESPUESTAS"}</p><h2>{analysisReady ? "La muestra ya permite comenzar el análisis" : `Faltan ${responsesNeeded} respuestas para superar el 50 %`}</h2><span>Las respuestas se almacenan desde el inicio. Las interpretaciones se actualizan automáticamente después de superar el umbral.</span><div className="sample-rules"><b>✓ Umbral: más de 50 %</b><b>✓ Mínimo de seguridad: 10 respuestas</b><b>{analysisReady ? "● Actualización activa" : "○ Análisis en espera"}</b></div></div>
            <div className="universe-control"><strong>Matrícula externa</strong><label>Total de estudiantes<input type="number" min="1" value={studentUniverse} onChange={(e) => setStudentUniverse(Math.max(1, Number(e.target.value)))} /></label><label>Respuestas recibidas<input type="number" min="0" max={studentUniverse} value={responseCount} onChange={(e) => setResponseCount(Math.min(studentUniverse, Math.max(0, Number(e.target.value))))} /></label><small>En producción estos valores se sincronizarán con el apartado externo.</small></div>
          </section>
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
            <div className="card-heading"><div><h2>Resultados por persona evaluada</h2><p>El análisis individual corresponde al personal, nunca al estudiante.</p></div><button onClick={exportExcel} disabled={Boolean(exporting)}>Exportar reporte</button></div>
            <div className="table-head"><span>Persona / área</span><span>Evaluaciones</span><span>Promedio</span><span>Positivas</span><span>Estado</span></div>
            {scopedTeacherAnalysis.map((person) => (
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
                  {scopedTeacherAnalysis.map((item, index) => <button key={item.name} className={selectedAnalysisTeacher === index ? "active" : ""} onClick={() => { setSelectedAnalysisTeacher(index); setCommentsExpanded(false); }}>
                    <span className="rank-number">{index + 1}</span><span className="rank-person"><strong>{item.name}</strong><small>{item.subject}</small></span><span className="rank-score"><strong>{item.score}</strong><small>{item.trend}</small></span><b>›</b>
                  </button>)}
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
          {dashboardTab === "comments" && (
            <section className="comments-analysis">
              <div className="page-kicker"><span>Vista especializada · Voz del alumnado</span><strong>{scopeLabel}</strong></div>
              <div className="analysis-intro voice-intro"><div><p className="eyebrow">VOZ DEL ALUMNADO</p><h2>Temas, emociones y propuestas recurrentes</h2><p>Comentarios revisados, anonimizados y clasificados dentro del alcance seleccionado. Las menciones indican recurrencia, no una calificación ni el número de estudiantes.</p></div><button className="voice-export" onClick={exportStudentVoicePdf} disabled={Boolean(exporting)}>{exporting === "voice-pdf" ? "Generando ficha…" : "↓ Exportar ficha PDF"}</button></div>
              <div className="voice-summary"><article><span>Lectura principal</span><strong>{voiceProfile.focus}</strong><p>Corresponde únicamente a {scopeLabel}.</p></article><article><span>Petición más recurrente</span><strong>{voiceThemes.filter((theme) => theme.reading !== "Fortaleza").sort((a, b) => b.mentions - a.mentions)[0].label}</strong><p>{voiceThemes.filter((theme) => theme.reading !== "Fortaleza").sort((a, b) => b.mentions - a.mentions)[0].action}</p></article><article><span>Decisión sugerida</span><strong>{voiceProfile.action}</strong><p>Mostrar seguimiento fortalece la percepción de escucha.</p></article></div>
              <div className="theme-cloud">{voiceThemes.map((theme) => <span key={theme.label}>{theme.label} <b>{theme.mentions}</b></span>)}</div>
              <div className="comment-columns"><article><h3>🌟 Reconocimientos</h3>{voiceComments.filter((comment) => comment.category === "Reconocimiento").map((comment) => <blockquote key={comment.text}>“{comment.text}”</blockquote>)}</article><article><h3>🔧 Sugerencias</h3>{voiceComments.filter((comment) => comment.category === "Sugerencia").map((comment) => <blockquote key={comment.text}>“{comment.text}”</blockquote>)}</article><article><h3>⚠️ Atención</h3><p>{reservedVoiceCount ? `${reservedVoiceCount} comentario${reservedVoiceCount === 1 ? " fue reservado" : "s fueron reservados"} para revisión del equipo responsable. No se muestran aquí para proteger su confidencialidad.` : "No hay comentarios reservados dentro del alcance seleccionado."}</p></article></div>
              <div className="voice-reading"><strong>Cómo interpretar esta vista</strong><p><b>Reconocimientos</b> muestran prácticas que conviene conservar. <b>Sugerencias</b> señalan oportunidades concretas, no inconformidades aisladas. <b>Atención</b> agrupa mensajes que requieren un circuito confidencial. Compare siempre las menciones con participación, filtros y evolución entre periodos.</p></div>
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
