import {
  Course,
  Module,
  Lesson,
  Material,
  Enrollment,
  LessonProgress,
  Certificate,
  AdminUserListItem,
} from '@/types/database'
import { CandidateProfile } from '@/types/candidate'

export interface ExamQuestionItem {
  id: string
  course_id?: string | null
  text: string
  options: string[]
  correct: number
  correctAnswer?: string
  explanation: string
  competency: string
  difficulty?: 'Básico' | 'Intermedio' | 'Avanzado'
  created_at: string
}

export type ExamQuestionRecord = ExamQuestionItem

export interface PlatformStateData {
  users: (AdminUserListItem & { password?: string })[]
  courses: Course[]
  deletedCourseIds: string[]
  deletedUserIds?: string[]
  modules: Module[]
  lessons: Lesson[]
  materials: Material[]
  enrollments: (Enrollment & { student_name?: string; student_email?: string })[]
  lesson_progress: LessonProgress[]
  certificates: Certificate[]
  exam_questions: ExamQuestionItem[]
  candidate_profiles?: CandidateProfile[]
}

export const STUDENT_TEST_USER_ID = 'b5ccdb90-a6c0-4b99-add5-c93fac47ee84'
export const INSTRUCTOR_TEST_USER_ID = 'c7ddfa12-b8d1-4c88-bee6-d04fbd58ff95'
export const ADMIN_TEST_USER_ID = 'a1b2c3d4-0000-4000-8000-000000000001'

export const FLAGSHIP_COURSE_ID = '2aac8ece-e71b-4c7c-99be-9b4fe37879da'
export const FLAGSHIP_COURSE_SLUG = 'curso-preparacion-ingreso-carrera-docente-140h'

export const INITIAL_PLATFORM_STATE: PlatformStateData = {
  users: [],
  deletedCourseIds: [
    'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e',
    'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2f',
    'c1-pedagogia-critica',
  ],
  deletedUserIds: [],
  courses: [
    {
      id: FLAGSHIP_COURSE_ID,
      title: 'CURSO DE PREPARACIÓN INGRESO A LA CARRERA DOCENTE - 140 horas',
      slug: FLAGSHIP_COURSE_SLUG,
      description:
        'LEGADO DOCENTE «Aprende, comparte, deja huella» — Programa oficial de formación integral de 140 horas para superar el Concurso de Méritos Docente en Colombia. Estructurado rigurosamente en tres núcleos formativos: 1. Aptitudes y Competencias Básicas, 2. Conocimientos Pedagógicos y 3. Conocimientos Disciplinares.',
      short_description:
        '140 horas de formación oficial: Aptitudes básicas, conocimientos pedagógicos, simulacros y componentes disciplinares.',
      thumbnail_url:
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
      price: 0,
      published: true,
      featured: true,
      level: 'Avanzado',
      category: 'Concurso Docente CNSC',
      instructor_id: INSTRUCTOR_TEST_USER_ID,
      instructor_name: 'Equipo Pedagógico Legado Docente',
      instructor_role: 'Especialistas en Méritos Docentes CNSC y Decreto Ley 1278',
      duration_hours: 140,
      created_at: '2026-11-09T00:00:00.000Z',
      updated_at: '2026-11-09T00:00:00.000Z',
    },
  ],
  modules: [
    // 1. APTITUDES Y COMPETENCIAS BÁSICAS
    {
      id: 'mod-0-induccion',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 0: Inducción, generalidades del concurso docente (4 horas)',
      description:
        'Aptitudes y Competencias Básicas — Estructura general de las convocatorias CNSC, etapas clasificatorias y eliminatorias, plataforma SIMO y acuerdos oficiales.',
      order_index: 0,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mod-1-marco-normativo',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 1: La educación en Colombia: marco normativo y política educativa (8 horas)',
      description:
        'Aptitudes y Competencias Básicas — Ley 115 de 1994, Decreto Ley 1278 de 2002, fines del sistema educativo y estatuto de profesionalización docente.',
      order_index: 1,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // 2. CONOCIMIENTOS PEDAGÓGICOS
    {
      id: 'mod-2-institucion-gestion',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 2: Institución educativa y gestión escolar (8 horas)',
      description:
        'Conocimientos Pedagógicos — El PEI, áreas de gestión escolar (directiva, académica, comunitaria y administrativa) y gobierno escolar.',
      order_index: 2,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mod-3-desarrollo-aprendizaje',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 3: Desarrollo y aprendizaje (10 horas)',
      description:
        'Conocimientos Pedagógicos — Psicología del desarrollo infantil y juvenil, teorías de Piaget, Vygotsky, Bruner, Ausubel y aprendizaje significativo.',
      order_index: 3,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mod-4-pedagogia-didactica',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 4: Pedagogía y didáctica (10 horas)',
      description:
        'Conocimientos Pedagógicos — Modelos pedagógicos tradicionales, activos, constructivistas y críticos. Transposición didáctica en el aula colombiana.',
      order_index: 4,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mod-5-curriculo',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 5: Currículo (10 horas)',
      description:
        'Conocimientos Pedagógicos — Lineamientos Curriculares del MEN, Estándares Básicos de Competencias (EBC), Derechos Básicos de Aprendizaje (DBA) y mallas curriculares.',
      order_index: 5,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mod-6-evaluacion',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 6: Evaluación (10 horas)',
      description:
        'Conocimientos Pedagógicos — Decreto 1290 de 2009, Sistema Institucional de Evaluación de Estudiantes (SIEE), evaluación formativa, diagnóstica y sumativa.',
      order_index: 6,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mod-7-inclusion-diversidad',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 7: Inclusión y diversidad (10 horas)',
      description:
        'Conocimientos Pedagógicos — Decreto 1421 de 2017, Diseño Universal para el Aprendizaje (DUA), ajustes razonables y Plan Individual de Ajustes Razonables (PIAR).',
      order_index: 7,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mod-8-convivencia-ciudadania',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 8: Convivencia y ciudadanía (10 horas)',
      description:
        'Conocimientos Pedagógicos — Ley 1620 de 2013 y Decreto 1965, manuales de convivencia, rutas de atención integral para situaciones Tipo I, II y III.',
      order_index: 8,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mod-9-lectura-critica',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 9: Lectura crítica (10 horas)',
      description:
        'Conocimientos Pedagógicos — Niveles de comprensión literal, inferencial y crítico. Análisis de textos continuos, argumentativos, narrativos y discontinuos.',
      order_index: 9,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mod-10-razonamiento-cuantitativo',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 10: Razonamiento cuantitativo (10 horas)',
      description:
        'Conocimientos Pedagógicos — Competencias de interpretación y representación, formulación y ejecución, y argumentación matemática aplicada.',
      order_index: 10,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mod-11-competencias-blandas-simulacros',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 11: Competencias blandas y simulacros (18 horas)',
      description:
        'Conocimientos Pedagógicos — Competencias comportamentales (10 horas) + Batería de Simulacros situacionales oficiales (8 horas).',
      order_index: 11,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // 3. CONOCIMIENTOS DISCIPLINARES
    {
      id: 'mod-12-conocimientos-disciplinares',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Módulo 12: CONOCIMIENTOS DISCIPLINARES (22 horas)',
      description:
        'Conocimientos Disciplinares — Fundamentos específicos por área de concurso (Preescolar, Primaria, Matemáticas, Ciencias, Humanidades, Orientación, Directivos).',
      order_index: 12,
      created_at: '2026-11-09T00:00:00.000Z',
    },
  ],
  lessons: [
    // Módulo 0
    {
      id: 'les-0-1',
      module_id: 'mod-0-induccion',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 0.1: Etapas del Concurso de Méritos CNSC y Reglas de Juego',
      description:
        'Análisis de acuerdos de convocatoria, publicación de vacantes, ponderación de pruebas eliminatorias y clasificatorias.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 7200,
      is_preview: true,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-0-2',
      module_id: 'mod-0-induccion',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 0.2: Navegación en SIMO y Verificación de Requisitos Mínimos (VRM)',
      description:
        'Cómo cargar certificaciones laborales, títulos académicos y evitar la exclusión por causales técnicas en la plataforma SIMO.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 7200,
      is_preview: true,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 1
    {
      id: 'les-1-1',
      module_id: 'mod-1-marco-normativo',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 1.1: Ley General de Educación (Ley 115) y Decretos Reglamentarios',
      description:
        'Estructura del servicio educativo estatal, fines constitucionales del artículo 67 y principios rectores de la escuela colombiana.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 14400,
      is_preview: true,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-1-2',
      module_id: 'mod-1-marco-normativo',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 1.2: Estatuto Docente 1278: Período de Prueba y Escalafón Nacional',
      description:
        'Deberes, prohibiciones, derechos de carrera, evaluación ordinaria anual de desempeño y ascenso escalafonario.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 14400,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 2
    {
      id: 'les-2-1',
      module_id: 'mod-2-institucion-gestion',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 2.1: Gestión Escolar, Guía 34 y Organización Institucional',
      description:
        'Gestión directiva, académica, de comunidad y administrativa. Procesos de autoevaluación institucional y planes de mejoramiento (PMI).',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 14400,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-2-2',
      module_id: 'mod-2-institucion-gestion',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 2.2: Gobierno Escolar y Participación de la Comunidad Educativa',
      description:
        'Consejo Directivo, Consejo Académico, Comité de Convivencia, Personero Estudiantil y rol de los estamentos escolares.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 14400,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 3
    {
      id: 'les-3-1',
      module_id: 'mod-3-desarrollo-aprendizaje',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 3.1: Psicología del Desarrollo y Teorías del Aprendizaje',
      description:
        'Estadios del desarrollo cognitivo de Piaget, mediación sociocultural y ZDP de Vygotsky, y aprendizaje significativo de Ausubel.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-3-2',
      module_id: 'mod-3-desarrollo-aprendizaje',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 3.2: Neuroeducación y Factores Socioemocionales en el Aprendizaje',
      description:
        'Atención, memoria de trabajo, motivación intrínseca y entornos favorecedores del aprendizaje escolar.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 4
    {
      id: 'les-4-1',
      module_id: 'mod-4-pedagogia-didactica',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 4.1: Corrientes Pedagógicas y Didáctica General',
      description:
        'De la pedagogía tradicional a la pedagogía crítica de Freire y el enfoque por competencias.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-4-2',
      module_id: 'mod-4-pedagogia-didactica',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 4.2: Secuencias Didácticas y Metodologías Activas (ABP, STEAM)',
      description:
        'Estructura de la clase: inicio, desarrollo y cierre. Aprendizaje Basado en Problemas y trabajo colaborativo.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 5
    {
      id: 'les-5-1',
      module_id: 'mod-5-curriculo',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 5.1: Referentes de Calidad del MEN: EBC, DBA y Mallas de Aprendizaje',
      description:
        'Articulación de los estándares básicos de competencias y derechos básicos de aprendizaje en el plan de estudios.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-5-2',
      module_id: 'mod-5-curriculo',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 5.2: Diseño Curricular, Transversalidad y Proyectos Pedagógicos',
      description:
        'PRAE, PESCC y proyectos obligatorios de ley (Constitución, democracia, educación vial y estilos de vida saludable).',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 6
    {
      id: 'les-6-1',
      module_id: 'mod-6-evaluacion',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 6.1: Decreto 1290 de 2009 y Sistema Institucional de Evaluación (SIEE)',
      description:
        'Criterios de evaluación y promoción escolar, escala de valoración nacional y comisiones de evaluación y promoción.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-6-2',
      module_id: 'mod-6-evaluacion',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 6.2: Evaluación Formativa, Rúbricas y Modelo Basado en Evidencias (MBE)',
      description:
        'Construcción de preguntas por competencias, afirmaciones, evidencias e ítems de selección múltiple con única respuesta.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 7
    {
      id: 'les-7-1',
      module_id: 'mod-7-inclusion-diversidad',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 7.1: Educación Inclusiva y Diseño Universal para el Aprendizaje (DUA)',
      description:
        'Decreto 1421 de 2017: principios del DUA (múltiples formas de compromiso, representación y acción/expresión).',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-7-2',
      module_id: 'mod-7-inclusion-diversidad',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 7.2: Elaboración y Aplicación del PIAR en el Aula Ordinaria',
      description:
        'Resolución de casos situacionales sobre ajustes razonables para estudiantes con discapacidad o talentos excepcionales.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 8
    {
      id: 'les-8-1',
      module_id: 'mod-8-convivencia-ciudadania',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 8.1: Ley 1620 de Convivencia Escolar y Deberes Legales del Docente',
      description:
        'Clasificación de situaciones escolares Tipo I, II y III: activación de rutas de atención y debido proceso escolar.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-8-2',
      module_id: 'mod-8-convivencia-ciudadania',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 8.2: Justicia Restaurativa, Manejo de Conflictos y Clima de Aula',
      description:
        'Estrategias pedagógicas de mediación escolar, círculos de paz y prevención de la violencia escolar y ciberacoso.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 9
    {
      id: 'les-9-1',
      module_id: 'mod-9-lectura-critica',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 9.1: Niveles de Comprensión y Lectura Crítica Intertextual',
      description:
        'Lectura literal vs inferencial. Identificación de tesis, argumentos de apoyo y contraargumentos en textos reflexivos.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-9-2',
      module_id: 'mod-9-lectura-critica',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 9.2: Descarte Estratégico en Textos Filosóficos y Discontinuos',
      description:
        'Análisis de infografías, viñetas, tablas estadísticas y ensayos pedagógicos tipo prueba de méritos CNSC.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 10
    {
      id: 'les-10-1',
      module_id: 'mod-10-razonamiento-cuantitativo',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 10.1: Análisis de Información Numérica, Gráfica y Estadística',
      description:
        'Interpretación de porcentajes, razones, proporciones, medidas de tendencia central y dispersión aplicadas.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-10-2',
      module_id: 'mod-10-razonamiento-cuantitativo',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 10.2: Formulación y Resolución de Problemas en Escenarios Reales',
      description:
        'Modelación matemática rápida, cálculo estimativo y estrategias para optimizar el tiempo de respuesta.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 18000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 11 (Blandas + Simulacros)
    {
      id: 'les-11-1',
      module_id: 'mod-11-competencias-blandas-simulacros',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 11.1: Competencias Comportamentales y Juicio Situacional (10h)',
      description:
        'Liderazgo docente, comunicación asertiva, resolución de conflictos, trabajo en equipo y ética profesional según CNSC.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 36000,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-11-2',
      module_id: 'mod-11-competencias-blandas-simulacros',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 11.2: Batería de Simulacros Situacionales Reales (8h)',
      description:
        'Simulación cronometrada de 100 ítems con retroalimentación inmediata, justificación pedagógica y diagnóstico de fortalezas.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 28800,
      is_preview: true,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },

    // Módulo 12 (Conocimientos Disciplinares)
    {
      id: 'les-12-1',
      module_id: 'mod-12-conocimientos-disciplinares',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 12.1: Enfoques Epistémicos y Didáctica Específica por Área (11h)',
      description:
        'Contenidos nucleares y preguntas tipo para Docentes de Aula (Primaria, Matemáticas, Ciencias, Humanidades) y Orientadores.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 39600,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'les-12-2',
      module_id: 'mod-12-conocimientos-disciplinares',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Sesión 12.2: Casuística Disciplinar y Gestión para Directivos Docentes (11h)',
      description:
        'Legislación de contratación escolar, administración de planta docente, presupuesto de fondos de servicios educativos y régimen disciplinario.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 39600,
      is_preview: false,
      published: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
  ],
  materials: [
    {
      id: 'mat-1',
      lesson_id: 'les-0-1',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Guía Oficial CNSC: Estructura del Concurso de Méritos Docente (PDF)',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_type: 'pdf',
      file_size: 2048000,
      is_free: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mat-2',
      lesson_id: 'les-1-1',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Compendio Legal: Ley 115 de 1994 y Decreto Ley 1278 Comentado (PDF)',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_type: 'pdf',
      file_size: 3145728,
      is_free: true,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mat-3',
      lesson_id: 'les-6-1',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Guía de Evaluación Formativa y Decreto 1290 en el SIEE (PDF)',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_type: 'pdf',
      file_size: 1572864,
      is_free: false,
      created_at: '2026-11-09T00:00:00.000Z',
    },
    {
      id: 'mat-4',
      lesson_id: 'les-7-1',
      course_id: FLAGSHIP_COURSE_ID,
      title: 'Protocolos de Inclusión: Guía DUA y Formato PIAR Oficial MEN (PDF)',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_type: 'pdf',
      file_size: 2097152,
      is_free: false,
      created_at: '2026-11-09T00:00:00.000Z',
    },
  ],
  enrollments: [],
  lesson_progress: [],
  certificates: [],
  exam_questions: [
    {
      id: 'q-demo-1',
      course_id: FLAGSHIP_COURSE_ID,
      text: '¿Por dónde se publican oficialmente las citaciones y resultados definitivos del concurso docente en Colombia?',
      options: [
        'Grupos de WhatsApp de docentes',
        'SIMO y www.cnsc.gov.co',
        'Las redes sociales no oficiales de la CNSC',
        'El correo personal de la secretaría de educación',
      ],
      correct: 1,
      correctAnswer: 'SIMO y www.cnsc.gov.co',
      explanation:
        'Conforme al principio de mérito y los acuerdos de convocatoria, el Sistema de Apoyo para la Igualdad, el Mérito y la Oportunidad (SIMO) y el portal oficial de la CNSC son los únicos canales legalmente válidos para notificaciones oficiales.',
      competency: 'Legislación y Normativa Educativa',
      difficulty: 'Básico',
      created_at: '2026-11-09T00:00:00.000Z',
    },
  ],
  candidate_profiles: [],
}
