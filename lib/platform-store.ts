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
}

export const STUDENT_TEST_USER_ID = 'b5ccdb90-a6c0-4b99-add5-c93fac47ee84'
export const INSTRUCTOR_TEST_USER_ID = 'c7ddfa12-b8d1-4c88-bee6-d04fbd58ff95'
export const ADMIN_TEST_USER_ID = 'a1b2c3d4-0000-4000-8000-000000000001'

export const INITIAL_PLATFORM_STATE: PlatformStateData = {
  users: [
    {
      id: ADMIN_TEST_USER_ID,
      full_name: 'Luis Alfonso Herrera',
      first_name: 'Luis Alfonso',
      last_name: 'Herrera',
      email: 'luisalfonso1818@gmail.com',
      role: 'admin',
      avatar_url: null,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'a1b2c3d4-0000-4000-8000-000000000002',
      full_name: 'Patricia Jhon',
      first_name: 'Patricia',
      last_name: 'Jhon',
      email: 'patriciajhon@maestrotech.edu.co',
      role: 'admin',
      avatar_url: null,
      created_at: '2026-01-02T00:00:00Z',
    },
    {
      id: '849d7cc6-4d5e-4cae-88e0-abb134051cae',
      full_name: 'Patricia',
      first_name: 'Patricia',
      last_name: null,
      email: 'patricia@maestrotech.co',
      role: 'admin',
      avatar_url: null,
      created_at: '2026-10-10T12:53:42.435Z',
    },
    {
      id: INSTRUCTOR_TEST_USER_ID,
      full_name: 'Dra. Elena Restrepo',
      first_name: 'Elena',
      last_name: 'Restrepo',
      email: 'docente@maestrotech.co',
      role: 'instructor',
      avatar_url: null,
      created_at: '2026-01-05T00:00:00Z',
    },
    {
      id: STUDENT_TEST_USER_ID,
      full_name: 'Carlos Andrés Gómez',
      first_name: 'Carlos Andrés',
      last_name: 'Gómez',
      email: 'estudiante@maestrotech.co',
      role: 'student',
      avatar_url: null,
      created_at: '2026-01-10T00:00:00Z',
    },
  ],
  deletedCourseIds: [],
  deletedUserIds: [],
  courses: [
    {
      id: '2aac8ece-e71b-4c7c-99be-9b4fe37879da',
      title: 'Preparación Integral Concurso Docente CNSC y Decreto 1278',
      slug: 'fdhdfhg666',
      description:
        'Programa intensivo y práctico para superar con éxito el Concurso de Méritos Docente y la Evaluación de Ascenso (Decreto Ley 1278 de 2002). Incluye clases en video, análisis de casos reales de aula, legislación educativa (Ley 115, Decreto 1290, Ley 1620) y guías descargables en PDF.',
      short_description:
        'Ruta completa con video-clases, análisis de casos y guías oficiales en PDF para el Concurso Docente.',
      thumbnail_url:
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
      price: 0,
      published: true,
      featured: true,
      level: 'Intermedio',
      category: 'Legislación',
      instructor_id: INSTRUCTOR_TEST_USER_ID,
      instructor_name: 'Dra. Elena Restrepo & Abg. Carlos Medina',
      instructor_role: 'Especialistas en Concurso Docente CNSC y Decreto 1278',
      duration_hours: 12,
      created_at: '2026-09-30T07:04:26.251085+00:00',
      updated_at: '2026-09-30T07:04:26.251085+00:00',
    },
    {
      id: 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e',
      title: 'Pedagogía Crítica, Constructivismo y Modelos Pedagógicos',
      slug: 'pedagogia-critica-y-constructivismo',
      description:
        'Domina los fundamentos epistemológicos y metodológicos de la pedagogía crítica y el constructivismo aplicados al aula colombiana y a las pruebas del MEN. Estudia a profundidad a Piaget, Vygotsky, Ausubel, Bruner y Paulo Freire con casos contextualizados.',
      short_description:
        'Epistemología genética, Zona de Desarrollo Próximo, aprendizaje significativo y pedagogía dialógica.',
      thumbnail_url:
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      price: 0,
      published: true,
      featured: true,
      level: 'Intermedio',
      category: 'Pedagogía',
      instructor_id: INSTRUCTOR_TEST_USER_ID,
      instructor_name: 'Dra. Elena Restrepo',
      instructor_role: 'Ph.D en Ciencias de la Educación',
      duration_hours: 8,
      created_at: '2026-09-25T10:00:00.000Z',
      updated_at: '2026-09-25T10:00:00.000Z',
    },
    {
      id: 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2f',
      title: 'Evaluación por Competencias y Diseño de Ítems ICFES / MEN',
      slug: 'evaluacion-aprendizaje-diseno-items',
      description:
        'Aprende la metodología del Modelo Basado en Evidencias (MBE) para analizar y construir preguntas por competencias (interpretativa, argumentativa y propositiva). Incluye estrategias de descarte de distractores y aplicación del Decreto 1290.',
      short_description:
        'Modelo Basado en Evidencias (MBE), análisis de distractores y evaluación formativa Decreto 1290.',
      thumbnail_url:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
      price: 0,
      published: true,
      featured: true,
      level: 'Avanzado',
      category: 'Evaluación',
      instructor_id: INSTRUCTOR_TEST_USER_ID,
      instructor_name: 'Mg. Martha Lucía Gómez',
      instructor_role: 'Asesora en Evaluación Educativa',
      duration_hours: 6,
      created_at: '2026-09-26T10:00:00.000Z',
      updated_at: '2026-09-26T10:00:00.000Z',
    },
  ],
  modules: [
    // Módulos del Curso 1 (2aac8ece-e71b-4c7c-99be-9b4fe37879da)
    {
      id: 'f3c024ce-6bb3-4abd-87b3-332d2cd4e75d',
      course_id: '2aac8ece-e71b-4c7c-99be-9b4fe37879da',
      title: 'Módulo 1: Estatuto Docente Decreto 1278 y Marco Legal MEN',
      description: 'Estructura del escalafón docente, ingreso por mérito, período de prueba y evaluación de desempeño.',
      order_index: 1,
      created_at: '2026-09-30T07:31:35.701659+00:00',
    },
    {
      id: 'f3c024ce-6bb3-4abd-87b3-332d2cd4e75e',
      course_id: '2aac8ece-e71b-4c7c-99be-9b4fe37879da',
      title: 'Módulo 2: Casos Pedagógicos de Aula, Inclusión (PIAR/DUA) y Convivencia',
      description: 'Resolución de situaciones reales de aula bajo el Decreto 1290, Decreto 1421 y Ley 1620.',
      order_index: 2,
      created_at: '2026-09-30T07:35:00.000Z',
    },
    // Módulos del Curso 2 (e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e)
    {
      id: 'a1b2c3d4-1111-4000-8000-000000000001',
      course_id: 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e',
      title: 'Módulo 1: Epistemología y Constructivismo (Piaget, Vygotsky y Ausubel)',
      description: 'Fundamentos del desarrollo cognitivo, mediación sociocultural y aprendizaje significativo.',
      order_index: 1,
      created_at: '2026-09-25T10:00:00.000Z',
    },
    {
      id: 'a1b2c3d4-2222-4000-8000-000000000002',
      course_id: 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e',
      title: 'Módulo 2: Pedagogía Crítica y Práctica Dialógica en el Aula',
      description: 'Paulo Freire, educación problematizadora y transformación social desde la escuela.',
      order_index: 2,
      created_at: '2026-09-25T10:05:00.000Z',
    },
    // Módulos del Curso 3 (e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2f)
    {
      id: 'a1b2c3d4-3333-4000-8000-000000000003',
      course_id: 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2f',
      title: 'Módulo 1: Modelo Basado en Evidencias (MBE) y Decreto 1290',
      description: 'Diseño de rúbricas, estructura del ítem ICFES/MEN y evaluación formativa.',
      order_index: 1,
      created_at: '2026-09-26T10:00:00.000Z',
    },
  ],
  lessons: [
    // Lecciones Curso 1 - Módulo 1
    {
      id: '11111111-1001-4000-8000-000000000001',
      module_id: 'f3c024ce-6bb3-4abd-87b3-332d2cd4e75d',
      title: 'Clase 1: Estructura del Decreto 1278 y Etapas del Concurso CNSC',
      description:
        'Análisis detallado de los artículos clave del Decreto Ley 1278 de 2002: requisitos de ingreso, etapas del concurso de méritos, período de prueba y estructura del escalafón (Grados 1, 2 y 3).',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 900,
      is_preview: true,
      published: true,
      created_at: '2026-09-30T07:32:00.000Z',
    },
    {
      id: '11111111-1002-4000-8000-000000000002',
      module_id: 'f3c024ce-6bb3-4abd-87b3-332d2cd4e75d',
      title: 'Clase 2: Evaluación de Desempeño Anual y Ascenso Docente (ECDF)',
      description:
        'Diferencias entre la evaluación de período de prueba, la evaluación anual ordinaria (competencias funcionales 70% y comportamentales 30%) y la evaluación para ascenso y reubicación salarial.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 1200,
      is_preview: true,
      published: true,
      created_at: '2026-09-30T07:33:00.000Z',
    },
    // Lecciones Curso 1 - Módulo 2
    {
      id: '11111111-2001-4000-8000-000000000003',
      module_id: 'f3c024ce-6bb3-4abd-87b3-332d2cd4e75e',
      title: 'Clase 3: Resolución de Casos — Decreto 1290 (SIEE) y Decreto 1421 (PIAR/DUA)',
      description:
        'Cómo responder preguntas situacionales de aula sobre evaluación formativa, promoción escolar y ajustes razonables para estudiantes con discapacidad.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      duration_seconds: 1500,
      is_preview: false,
      published: true,
      created_at: '2026-09-30T07:36:00.000Z',
    },
    {
      id: '11111111-2002-4000-8000-000000000004',
      module_id: 'f3c024ce-6bb3-4abd-87b3-332d2cd4e75e',
      title: 'Clase 4: Ruta de Atención Integral y Convivencia Escolar (Ley 1620)',
      description:
        'Clasificación de situaciones Tipo I, II y III en convivencia escolar, protocolos de actuación docente y debido proceso disciplinario.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4',
      duration_seconds: 1350,
      is_preview: false,
      published: true,
      created_at: '2026-09-30T07:37:00.000Z',
    },
    // Lecciones Curso 2 - Módulo 1
    {
      id: 'b1c2d3e4-1001-4000-8000-000000000001',
      module_id: 'a1b2c3d4-1111-4000-8000-000000000001',
      title: 'Clase 1: Piaget y Vygotsky — Asimilación, Acomodación y Zona de Desarrollo Próximo',
      description:
        'Comparativa profunda entre la epistemología genética de Jean Piaget y la teoría sociocultural de Lev Vygotsky aplicada a preguntas de examen docente.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 1800,
      is_preview: true,
      published: true,
      created_at: '2026-09-25T10:10:00.000Z',
    },
    {
      id: 'b1c2d3e4-1002-4000-8000-000000000002',
      module_id: 'a1b2c3d4-1111-4000-8000-000000000001',
      title: 'Clase 2: David Ausubel y el Aprendizaje Significativo en el Aula',
      description:
        'Condiciones del aprendizaje significativo, organizadores previos, subsumidores y diferenciación progresiva.',
      order_index: 2,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration_seconds: 1620,
      is_preview: true,
      published: true,
      created_at: '2026-09-25T10:15:00.000Z',
    },
    // Lecciones Curso 2 - Módulo 2
    {
      id: 'b1c2d3e4-2001-4000-8000-000000000003',
      module_id: 'a1b2c3d4-2222-4000-8000-000000000002',
      title: 'Clase 3: Paulo Freire — Educación Problematizadora vs. Educación Bancaria',
      description:
        'Principios de la pedagogía crítica, diálogo de saberes, lectura crítica del contexto y praxis transformadora.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      duration_seconds: 1980,
      is_preview: false,
      published: true,
      created_at: '2026-09-25T10:20:00.000Z',
    },
    // Lecciones Curso 3 - Módulo 1
    {
      id: 'b1c2d3e4-3001-4000-8000-000000000005',
      module_id: 'a1b2c3d4-3333-4000-8000-000000000003',
      title: 'Clase 1: Estructura del Ítem Basado en Evidencias (Afirmación, Evidencia y Tarea)',
      description:
        'Desglose práctico de cómo el ICFES y la CNSC diseñan cada pregunta del concurso docente y cómo identificar la clave.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 1500,
      is_preview: true,
      published: true,
      created_at: '2026-09-26T10:10:00.000Z',
    },
  ],
  materials: [
    // Materiales del Curso 1
    {
      id: 'mat-1001-decreto-1278',
      lesson_id: '11111111-1001-4000-8000-000000000001',
      title: 'Guía Oficial Decreto Ley 1278 — Estatuto de Profesionalización Docente',
      file_url: '/uploads/materials/guia-decreto-1278-estatuto-docente.pdf',
      file_type: 'pdf',
      file_size: 2840,
      is_free: true,
      created_at: '2026-09-30T07:40:00.000Z',
    },
    {
      id: 'mat-1002-matriz-men',
      lesson_id: '11111111-1002-4000-8000-000000000002',
      title: 'Matriz de Evaluación por Competencias Funcionales y Comportamentales (MEN)',
      file_url: '/uploads/materials/matriz-evaluacion-competencias-icfes-men.pdf',
      file_type: 'pdf',
      file_size: 2130,
      is_free: true,
      created_at: '2026-09-30T07:41:00.000Z',
    },
    {
      id: 'mat-1003-simulacro-cnsc',
      lesson_id: '11111111-2001-4000-8000-000000000003',
      title: 'Cuadernillo de Casos Resueltos: Decreto 1290, PIAR/DUA y Ley 1620',
      file_url: '/uploads/materials/cuadernillo-simulacro-resuelto-cnsc.pdf',
      file_type: 'pdf',
      file_size: 2188,
      is_free: false,
      created_at: '2026-09-30T07:42:00.000Z',
    },
    {
      id: 'mat-1004-epistemologia',
      lesson_id: '11111111-2002-4000-8000-000000000004',
      title: 'Síntesis Comparativa: Piaget, Vygotsky, Ausubel y Paulo Freire',
      file_url: '/uploads/materials/resumen-epistemologico-piaget-vygotsky-freire.pdf',
      file_type: 'pdf',
      file_size: 2589,
      is_free: false,
      created_at: '2026-09-30T07:43:00.000Z',
    },
    // Materiales del Curso 2
    {
      id: 'mat-2001-epistemologia',
      lesson_id: 'b1c2d3e4-1001-4000-8000-000000000001',
      title: 'Resumen Epistemológico: Piaget, Vygotsky, Ausubel y Freire',
      file_url: '/uploads/materials/resumen-epistemologico-piaget-vygotsky-freire.pdf',
      file_type: 'pdf',
      file_size: 2589,
      is_free: true,
      created_at: '2026-09-25T10:30:00.000Z',
    },
    {
      id: 'mat-2002-decreto-1278',
      lesson_id: 'b1c2d3e4-1002-4000-8000-000000000002',
      title: 'Guía Aplicada: Constructivismo en las Pruebas de la CNSC',
      file_url: '/uploads/materials/guia-decreto-1278-estatuto-docente.pdf',
      file_type: 'pdf',
      file_size: 2840,
      is_free: true,
      created_at: '2026-09-25T10:35:00.000Z',
    },
    {
      id: 'mat-2003-casos',
      lesson_id: 'b1c2d3e4-2001-4000-8000-000000000003',
      title: 'Casos Prácticos de Pedagogía Crítica y Convivencia Escolar',
      file_url: '/uploads/materials/cuadernillo-simulacro-resuelto-cnsc.pdf',
      file_type: 'pdf',
      file_size: 2188,
      is_free: false,
      created_at: '2026-09-25T10:40:00.000Z',
    },
    // Materiales del Curso 3
    {
      id: 'mat-3001-mbe',
      lesson_id: 'b1c2d3e4-3001-4000-8000-000000000005',
      title: 'Matriz Oficial de Diseño de Ítems por Competencias (ICFES / MEN)',
      file_url: '/uploads/materials/matriz-evaluacion-competencias-icfes-men.pdf',
      file_type: 'pdf',
      file_size: 2130,
      is_free: true,
      created_at: '2026-09-26T10:20:00.000Z',
    },
  ],
  enrollments: [
    {
      id: 'enr-student-course-1',
      user_id: STUDENT_TEST_USER_ID,
      course_id: '2aac8ece-e71b-4c7c-99be-9b4fe37879da',
      enrolled_at: '2026-09-30T08:00:00.000Z',
      status: 'active',
      student_name: 'Carlos Andrés Gómez',
      student_email: 'estudiante@maestrotech.co',
    },
    {
      id: 'enr-student-course-2',
      user_id: STUDENT_TEST_USER_ID,
      course_id: 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e',
      enrolled_at: '2026-09-30T08:05:00.000Z',
      status: 'active',
      student_name: 'Carlos Andrés Gómez',
      student_email: 'estudiante@maestrotech.co',
    },
  ],
  lesson_progress: [
    {
      id: 'prog-student-1',
      user_id: STUDENT_TEST_USER_ID,
      lesson_id: '11111111-1001-4000-8000-000000000001',
      completed: true,
      watched_seconds: 900,
      last_position_seconds: 900,
      updated_at: '2026-09-30T09:00:00.000Z',
    },
    {
      id: 'prog-student-2',
      user_id: STUDENT_TEST_USER_ID,
      lesson_id: '11111111-1002-4000-8000-000000000002',
      completed: true,
      watched_seconds: 1200,
      last_position_seconds: 1200,
      updated_at: '2026-09-30T09:30:00.000Z',
    },
    {
      id: 'prog-student-3',
      user_id: STUDENT_TEST_USER_ID,
      lesson_id: 'b1c2d3e4-1001-4000-8000-000000000001',
      completed: true,
      watched_seconds: 1800,
      last_position_seconds: 1800,
      updated_at: '2026-09-30T10:00:00.000Z',
    },
  ],
  certificates: [
    {
      id: 'cert-student-1',
      user_id: STUDENT_TEST_USER_ID,
      course_id: 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e',
      certificate_number: 'MT-2026-CNSC-8841',
      issued_at: '2026-09-30T12:00:00.000Z',
      certificate_url: '/uploads/materials/resumen-epistemologico-piaget-vygotsky-freire.pdf',
    },
  ],
  exam_questions: [
    {
      id: 'q-1',
      course_id: '2aac8ece-e71b-4c7c-99be-9b4fe37879da',
      text: 'Según el Decreto 1278 de 2002, ¿cuál es el principal criterio para el ingreso al servicio educativo estatal en Colombia?',
      options: [
        'Antigüedad acumulada en cargos provisionales',
        'Superación de concurso público de méritos mediante prueba de aptitudes y competencias',
        'Designación directa por parte de la Secretaría de Educación',
        'Acreditar título de posgrado sin requisito de prueba escrita',
      ],
      correct: 1,
      explanation:
        'El artículo 8 del Decreto Ley 1278 de 2002 establece que el ingreso al servicio educativo estatal se hará exclusivamente mediante concurso público de méritos que evalúa aptitudes, competencias básicas, funcionales y comportamentales.',
      competency: 'Legislación Educativa',
      created_at: '2026-09-25T00:00:00Z',
    },
    {
      id: 'q-2',
      course_id: 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e',
      text: '¿Qué autor propuso la "Zona de Desarrollo Próximo (ZDP)" como concepto central para explicar cómo la interacción social impulsa el aprendizaje?',
      options: ['Jean Piaget', 'Lev Vygotsky', 'David Ausubel', 'Paulo Freire'],
      correct: 1,
      explanation:
        'Lev Vygotsky formuló la Zona de Desarrollo Próximo (ZDP) como la distancia entre el nivel de desarrollo real (resolución independiente) y el nivel de desarrollo potencial (bajo la guía de un adulto o en colaboración con un par más capaz).',
      competency: 'Psicología del Aprendizaje',
      created_at: '2026-09-25T00:00:00Z',
    },
    {
      id: 'q-3',
      course_id: 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e',
      text: 'En el marco del modelo pedagógico constructivista, ¿cuál es el rol fundamental del docente en el aula?',
      options: [
        'Transmisor unidireccional de contenidos curriculares oficiales',
        'Calificador sumativo de pruebas estandarizadas al cierre del período',
        'Mediador y diseñador de experiencias que articulan saberes previos con nuevos retos cognitivos',
        'Ejecutor estricto de textos guía sin adaptación contextual',
      ],
      correct: 2,
      explanation:
        'En el constructivismo, el docente actúa como mediador y facilitador que estructura ambientes de aprendizaje significativo, partiendo de los saberes previos del estudiante.',
      competency: 'Pedagogía',
      created_at: '2026-09-25T00:00:00Z',
    },
    {
      id: 'q-4',
      course_id: 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e',
      text: 'De acuerdo con David Ausubel, ¿cuál es la condición primordial para que ocurra el aprendizaje significativo?',
      options: [
        'La repetición literal de definiciones científicas',
        'La conexión sustantiva y no arbitraria del nuevo material con los conocimientos previos (subsumidores) del estudiante',
        'La aplicación de refuerzos conductuales inmediatos',
        'El aprendizaje por descubrimiento autónomo sin guía docente',
      ],
      correct: 1,
      explanation:
        'Para Ausubel, el aprendizaje significativo ocurre cuando la nueva información se relaciona de manera no arbitraria y sustancial con las ideas de anclaje o subsumidores presentes en la estructura cognitiva del estudiante.',
      competency: 'Pedagogía',
      created_at: '2026-09-25T00:00:00Z',
    },
    {
      id: 'q-5',
      course_id: '2aac8ece-e71b-4c7c-99be-9b4fe37879da',
      text: 'Un docente identifica que varios estudiantes presentan dificultades persistentes en comprensión lectora tras la primera evaluación del período. Según el Decreto 1290 de 2009, ¿qué acción pedagógica corresponde?',
      options: [
        'Mantener la calificación reprobatoria sin modificaciones hasta finalizar el año escolar',
        'Diseñar e implementar estrategias de apoyo y nivelación pedagógica en el marco del SIEE institucional',
        'Remitir a los estudiantes al Comité de Convivencia Escolar por bajo rendimiento',
        'Reducir el nivel de exigencia eliminando los estándares básicos de competencias',
      ],
      correct: 1,
      explanation:
        'El Decreto 1290 de 2009 concibe la evaluación como un proceso formativo continuo e integral, exigiendo que las instituciones y docentes implementen actividades de superación y apoyo pedagógico durante todo el año lectivo.',
      competency: 'Currículo y Evaluación',
      created_at: '2026-09-25T00:00:00Z',
    },
    {
      id: 'q-6',
      course_id: '2aac8ece-e71b-4c7c-99be-9b4fe37879da',
      text: 'Conforme al Decreto 1421 de 2017 sobre educación inclusiva, ¿qué herramienta debe construir el docente de aula en articulación con el docente de apoyo y la familia para garantizar la participación de un estudiante con discapacidad?',
      options: [
        'Un currículo paralelo aislado del grupo',
        'El Plan Individual de Ajustes Razonables (PIAR) basado en el Diseño Universal para el Aprendizaje (DUA)',
        'Una exoneración total de evaluaciones académicas',
        'Un traslado inmediato a una institución de educación especial',
      ],
      correct: 1,
      explanation:
        'El Decreto 1421 de 2017 establece el Diseño Universal para el Aprendizaje (DUA) y el Plan Individual de Ajustes Razonables (PIAR) como instrumentos obligatorios para garantizar la permanencia y promoción en condiciones de equidad.',
      competency: 'Legislación Educativa',
      created_at: '2026-09-25T00:00:00Z',
    },
  ],
}
