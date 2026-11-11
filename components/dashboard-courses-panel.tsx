'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  BookOpen,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Play,
  FileText,
  Shield,
  Layers,
  ChevronRight,
  GraduationCap,
  Download,
  Filter,
  Flame,
  Check,
  AlertCircle,
  Lock,
} from 'lucide-react'
import { Course } from '@/types/database'
import { EnrollmentWithCourse } from '@/services/enrollments'
import { getThumbnailUrl } from '@/lib/supabase/storage'

export interface OfficialModuleItem {
  id: string
  moduleNumber: string
  title: string
  hours: number
  nucleus: 'Aptitudes Básicas' | 'Conocimientos Pedagógicos' | 'Conocimientos Disciplinares' | 'Simulacros'
  description: string
  topics: string[]
  materialsCount: number
  hasSimulacro?: boolean
}

export const OFFICIAL_140H_MODULES: OfficialModuleItem[] = [
  // 1. APTITUDES Y COMPETENCIAS BÁSICAS
  {
    id: 'mod-0',
    moduleNumber: 'Módulo 0',
    title: 'Inducción, generalidades del concurso docente',
    hours: 4,
    nucleus: 'Aptitudes Básicas',
    description:
      'Generalidades y marco del concurso docente CNSC. Etapas eliminatorias y clasificatorias, plataforma SIMO, acuerdos de convocatoria y verificación de requisitos mínimos.',
    topics: ['Convocatoria CNSC', 'Plataforma SIMO', 'Requisitos Mínimos', 'Valoración Antecedentes'],
    materialsCount: 2,
  },
  {
    id: 'mod-1',
    moduleNumber: 'Módulo 1',
    title: 'La educación en Colombia: marco normativo y política educativa',
    hours: 8,
    nucleus: 'Aptitudes Básicas',
    description:
      'Ley General de Educación 115 de 1994, Decreto Ley 1278 de 2002 (Estatuto Docente), fines del sistema educativo, derechos, deberes, prohibiciones y escalafón nacional.',
    topics: ['Ley 115 de 1994', 'Decreto Ley 1278', 'Escalafón Docente', 'Políticas MEN'],
    materialsCount: 3,
  },

  // 2. CONOCIMIENTOS PEDAGÓGICOS
  {
    id: 'mod-2',
    moduleNumber: 'Módulo 2',
    title: 'Institución educativa y gestión escolar',
    hours: 8,
    nucleus: 'Conocimientos Pedagógicos',
    description:
      'El Proyecto Educativo Institucional (PEI), Guía 34 del MEN, áreas de gestión escolar (directiva, académica, comunitaria y administrativa), y Gobierno Escolar.',
    topics: ['Guía 34 MEN', 'PEI Institucional', 'Gobierno Escolar', 'Planes de Mejoramiento'],
    materialsCount: 2,
  },
  {
    id: 'mod-3',
    moduleNumber: 'Módulo 3',
    title: 'Desarrollo y aprendizaje',
    hours: 10,
    nucleus: 'Conocimientos Pedagógicos',
    description:
      'Psicología del desarrollo infantil y juvenil. Teorías cognitivas y sociales: Jean Piaget, Lev Vygotsky (ZDP), Jerome Bruner, David Ausubel y aprendizaje significativo.',
    topics: ['Piaget vs Vygotsky', 'Zona Desarrollo Próximo', 'Ausubel Significativo', 'Neuroeducación'],
    materialsCount: 3,
  },
  {
    id: 'mod-4',
    moduleNumber: 'Módulo 4',
    title: 'Pedagogía y didáctica',
    hours: 10,
    nucleus: 'Conocimientos Pedagógicos',
    description:
      'Modelos pedagógicos contemporáneos: tradicionales, constructivistas, activos y sociocríticos (Paulo Freire). Transposición didáctica y secuencias en el aula colombiana.',
    topics: ['Modelos Pedagógicos', 'Pedagogía Crítica', 'Transposición Didáctica', 'Secuencias de Aprendizaje'],
    materialsCount: 2,
  },
  {
    id: 'mod-5',
    moduleNumber: 'Módulo 5',
    title: 'Currículo',
    hours: 10,
    nucleus: 'Conocimientos Pedagógicos',
    description:
      'Lineamientos Curriculares del MEN, Estándares Básicos de Competencias (EBC), Derechos Básicos de Aprendizaje (DBA), mallas curriculares y matrices de referencia ICFES.',
    topics: ['EBC y DBA', 'Lineamientos MEN', 'Mallas Curriculares', 'Matrices ICFES'],
    materialsCount: 3,
  },
  {
    id: 'mod-6',
    moduleNumber: 'Módulo 6',
    title: 'Evaluación formativa y SIEE',
    hours: 10,
    nucleus: 'Conocimientos Pedagógicos',
    description:
      'Evaluación formativa, continua e integral. Decreto 1290 de 2009, Sistema Institucional de Evaluación de los Estudiantes (SIEE), diseño de rúbricas y planes de nivelación.',
    topics: ['Decreto 1290 de 2009', 'Evaluación Formativa', 'SIEE', 'Rúbricas de Desempeño'],
    materialsCount: 3,
  },
  {
    id: 'mod-7',
    moduleNumber: 'Módulo 7',
    title: 'Inclusión y diversidad',
    hours: 10,
    nucleus: 'Conocimientos Pedagógicos',
    description:
      'Educación inclusiva y atención a la diversidad. Decreto 1421 de 2017, Diseño Universal para el Aprendizaje (DUA) y Plan Individual de Ajustes Razonables (PIAR).',
    topics: ['Decreto 1421 de 2017', 'Enfoque DUA', 'Formato PIAR', 'Barreras para el Aprendizaje'],
    materialsCount: 2,
  },
  {
    id: 'mod-8',
    moduleNumber: 'Módulo 8',
    title: 'Convivencia y ciudadanía',
    hours: 10,
    nucleus: 'Conocimientos Pedagógicos',
    description:
      'Ley 1620 de 2013 (Convivencia Escolar), Decreto 1965, comités de convivencia, clasificación de situaciones (Tipo I, II y III) y protocolos de atención integral.',
    topics: ['Ley 1620 de 2013', 'Situaciones I, II y III', 'Comité de Convivencia', 'Derechos Humanos'],
    materialsCount: 2,
  },
  {
    id: 'mod-9',
    moduleNumber: 'Módulo 9',
    title: 'Lectura crítica',
    hours: 10,
    nucleus: 'Conocimientos Pedagógicos',
    description:
      'Niveles de comprensión textual: literal, inferencial y crítico-intertextual. Estrategias de lectura analítica para responder las preguntas de juicio situacional.',
    topics: ['Comprensión Inferencial', 'Lectura Crítica Intertextual', 'Juicio Situacional', 'Análisis de Premisas'],
    materialsCount: 3,
  },
  {
    id: 'mod-10',
    moduleNumber: 'Módulo 10',
    title: 'Razonamiento cuantitativo',
    hours: 10,
    nucleus: 'Conocimientos Pedagógicos',
    description:
      'Competencia matemática para docentes: interpretación de datos estadísticos, formulación y ejecución de modelos, y argumentación en situaciones de contexto escolar.',
    topics: ['Estadística Escolar', 'Interpretación de Datos', 'Modelación de Problemas', 'Lógica Cuantitativa'],
    materialsCount: 2,
  },
  {
    id: 'mod-11',
    moduleNumber: 'Módulo 11',
    title: 'Competencias blandas y liderazgo',
    hours: 10,
    nucleus: 'Conocimientos Pedagógicos',
    description:
      'Competencias comportamentales evaluadas en el concurso: liderazgo formativo, resolución asertiva de conflictos, trabajo en equipo, inteligencia emocional y ética profesional.',
    topics: ['Liderazgo Pedagógico', 'Resolución de Conflictos', 'Trabajo en Equipo', 'Ética Profesional'],
    materialsCount: 2,
  },
  {
    id: 'mod-simulacros',
    moduleNumber: 'Simulacros',
    title: 'Simulacros oficiales con casos de juicio situacional',
    hours: 8,
    nucleus: 'Simulacros',
    description:
      'Entrenamiento en condiciones reales de examen: 8 horas de bancos de preguntas cronometradas con retroalimentación pedagógica y justificación basada en la norma colombiana.',
    topics: ['Simulacros Cronometrados', 'Casos de Juicio Situacional', 'Baremo de Calificación', 'Feedback Explicado'],
    materialsCount: 4,
    hasSimulacro: true,
  },

  // 3. CONOCIMIENTOS DISCIPLINARES
  {
    id: 'mod-12',
    moduleNumber: 'Módulo 12',
    title: 'Conocimientos disciplinares específicos',
    hours: 22,
    nucleus: 'Conocimientos Disciplinares',
    description:
      'Componente disciplinar avanzado según el área de postulación: Básica Primaria, Matemáticas, Ciencias Naturales, Humanidades, Ciencias Sociales, Inglés y Orientación Escolar.',
    topics: ['Didáctica del Área', 'Dominio Epistemológico', 'Estándares Disciplinares', 'Preguntas Específicas'],
    materialsCount: 4,
  },
]

interface DashboardCoursesPanelProps {
  enrollments: EnrollmentWithCourse[]
  availableCourses: Course[]
  userId?: string
  userEmail?: string
  userName?: string
  onSelectCourse: (slug: string) => void
  onNavigateToExam: () => void
  onNavigateToPricing?: () => void
  onRefreshEnrollments?: () => void
}

export default function DashboardCoursesPanel({
  enrollments,
  availableCourses,
  userId,
  userEmail,
  userName,
  onSelectCourse,
  onNavigateToExam,
  onNavigateToPricing,
  onRefreshEnrollments,
}: DashboardCoursesPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNucleus, setSelectedNucleus] = useState<string>('Todos')
  const [activeTab, setActiveTab] = useState<'curriculum' | 'enrolled'>('curriculum')

  // Curso insignia
  const flagshipCourse = availableCourses.find(
    (c) =>
      c.slug === 'curso-preparacion-ingreso-carrera-docente-140h' ||
      c.id === '2aac8ece-e71b-4c7c-99be-9b4fe37879da'
  ) || availableCourses[0]

  // Comprobar si el usuario está matriculado en el curso principal
  const isEnrolledInFlagship = Boolean(
    enrollments.some(
      (e) =>
        e.course_id === flagshipCourse?.id ||
        e.course?.slug === flagshipCourse?.slug ||
        e.course?.slug === 'curso-preparacion-ingreso-carrera-docente-140h'
    )
  )

  // Filtrado de módulos
  const filteredModules = useMemo(() => {
    return OFFICIAL_140H_MODULES.filter((mod) => {
      const matchesSearch =
        !searchTerm.trim() ||
        mod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.moduleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesNucleus =
        selectedNucleus === 'Todos' ||
        mod.nucleus === selectedNucleus ||
        (selectedNucleus === 'Aptitudes' && mod.nucleus === 'Aptitudes Básicas') ||
        (selectedNucleus === 'Pedagógicos' && mod.nucleus === 'Conocimientos Pedagógicos') ||
        (selectedNucleus === 'Disciplinares' && mod.nucleus === 'Conocimientos Disciplinares')

      return matchesSearch && matchesNucleus
    })
  }, [searchTerm, selectedNucleus])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ========================================================
          HERO BANNER INSIGNIA (CURSO OFICIAL 140 HORAS)
          ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-royal-depth p-8 md:p-10 text-white shadow-2xl border-2 border-[#C99E32]"
      >
        {/* Anillos decorativos dorados en esquina */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ border: '10px solid #C99E32', opacity: 0.25 }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ border: '8px solid #E6C565', opacity: 0.15 }}
        />

        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow-blue bg-white/10 px-3.5 py-1 rounded-full border border-[#E6C565]/40 inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#E6C565]" />
                PROGRAMA DE FORMACIÓN OFICIAL
              </span>
              <span className="px-3 py-1 rounded-full bg-white/15 text-[#E6C565] text-xs font-bold font-mono">
                140 HORAS CERTIFICADAS
              </span>
              {isEnrolledInFlagship ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs font-bold inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  Matrícula Activa
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/25 border border-amber-400/40 text-amber-200 text-xs font-bold inline-flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                  No Matriculado
                </span>
              )}
            </div>

            <h1 className="title-h1 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Curso de Preparación Ingreso a la Carrera Docente
            </h1>

            <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-2xl">
              Legado Docente «Aprende, comparte, deja huella» — Formación estructurada en{' '}
              <strong className="text-[#E6C565] font-bold">3 núcleos fundamentales</strong>: Aptitudes y Competencias Básicas, Conocimientos Pedagógicos y Componente Disciplinar conforme al Decreto 1278 y la CNSC.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {isEnrolledInFlagship ? (
                <button
                  onClick={() => {
                    if (flagshipCourse) onSelectCourse(flagshipCourse.slug)
                  }}
                  className="btn-gold-cta btn-gold-pill px-8 py-3.5 text-sm font-extrabold flex items-center gap-3 group cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current text-[#1A1A1A] group-hover:scale-110 transition-transform" />
                  <span>Continuar Mi Formación (140h)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (onNavigateToPricing) onNavigateToPricing()
                    else window.location.href = '/?view=pricing'
                  }}
                  className="btn-gold-cta btn-gold-pill px-8 py-3.5 text-sm font-extrabold flex items-center gap-3 group cursor-pointer shadow-lg"
                >
                  <Lock className="w-4 h-4 text-[#1A1A1A]" />
                  <span>Matricularme en el Curso de 140h</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button
                onClick={onNavigateToExam}
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Practicar Simulacro CNSC</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tarjeta de métricas rápida en la columna derecha */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E6C565]">
              Estructura Curricular Verificada
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/15">
                <span className="text-white/80">1. Aptitudes y Básicas</span>
                <span className="font-extrabold text-white">12 Horas</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/15">
                <span className="text-white/80">2. Conocimientos Pedagógicos</span>
                <span className="font-extrabold text-[#E6C565]">98 Horas</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/15">
                <span className="text-white/80">Simulacros Oficiales</span>
                <span className="font-extrabold text-white">8 Horas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">3. Conocimientos Disciplinares</span>
                <span className="font-extrabold text-white">22 Horas</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-[11px] text-white/70 font-semibold mb-1.5">
                <span>Total Horas Formativas</span>
                <span className="text-[#E6C565] font-bold">140 / 140 h</span>
              </div>
              <div className="h-2 rounded-full bg-black/30 overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[#C99E32] to-[#E6C565]"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================
          BARRA DE NAVEGACIÓN Y FILTRADO INTERACTIVO
          ======================================================== */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs principales */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] w-fit">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'curriculum'
                  ? 'bg-[#0038DF] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#0038DF]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Plan de 140 Horas (13 Módulos)</span>
            </button>

            <button
              onClick={() => setActiveTab('enrolled')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'enrolled'
                  ? 'bg-[#0038DF] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#0038DF]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Mis Cursos Activos ({enrollments.length})</span>
            </button>
          </div>

          {/* Barra de búsqueda interactiva */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por módulo, 1278, Piaget..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0038DF] focus:bg-white focus:outline-none text-xs text-[#1E293B] placeholder-[#94A3B8] transition-all"
            />
          </div>
        </div>

        {/* Filtros por Núcleo Formativo */}
        {activeTab === 'curriculum' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F1F5F9]">
            <span className="text-xs font-bold text-[#64748B] mr-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#0038DF]" />
              Filtrar Núcleo:
            </span>

            {[
              { id: 'Todos', label: 'Todos (140h)' },
              { id: 'Aptitudes', label: '1. Aptitudes Básicas (12h)' },
              { id: 'Pedagógicos', label: '2. Conocimientos Pedagógicos (98h)' },
              { id: 'Simulacros', label: 'Simulacros Oficiales (8h)' },
              { id: 'Disciplinares', label: '3. Disciplinares (22h)' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedNucleus(id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedNucleus === id
                    ? 'bg-[#0038DF] text-white shadow-xs'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] hover:border-[#C99E32] hover:text-[#0038DF]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          VISTA 1: EXPLORADOR DE MÓDULOS DEL PLAN DE 140H
          ======================================================== */}
      {activeTab === 'curriculum' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredModules.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group rounded-3xl bg-white border-2 border-[#E2E8F0] hover:border-[#C99E32] p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header del Módulo */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0038DF]/10 border border-[#0038DF]/25 text-[#0038DF] text-xs font-extrabold uppercase tracking-wide">
                      {item.moduleNumber}
                    </span>
                    {!isEnrolledInFlagship && !item.hasSimulacro && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Lock className="w-3 h-3 text-amber-600" />
                        Bloqueado
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#9C7316] bg-[#C99E32]/10 px-2.5 py-1 rounded-full border border-[#C99E32]/30 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {item.hours} horas
                  </span>
                </div>

                {/* Título */}
                <h3 className="font-extrabold text-lg text-[#0038DF] group-hover:text-[#002299] transition-colors leading-snug mb-2">
                  {item.title}
                </h3>

                {/* Núcleo Formatívo */}
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    {item.nucleus}
                  </span>
                </div>

                {/* Descripción */}
                <p className="text-xs text-[#1E293B] leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Topics Chips */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {item.topics.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#1E293B] text-[10px] font-semibold border border-[#E2E8F0]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botón de Entrada */}
              <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#0038DF]" />
                  {item.materialsCount} recursos PDF
                </span>

                <button
                  onClick={() => {
                    if (item.hasSimulacro) {
                      onNavigateToExam()
                    } else if (isEnrolledInFlagship) {
                      if (flagshipCourse) onSelectCourse(flagshipCourse.slug)
                    } else {
                      if (onNavigateToPricing) onNavigateToPricing()
                      else window.location.href = '/?view=pricing'
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    item.hasSimulacro || isEnrolledInFlagship
                      ? 'bg-[#0038DF] hover:bg-[#002299] text-white group-hover:scale-105'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                >
                  {item.hasSimulacro ? (
                    <>
                      <span>Abrir Simulacro</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  ) : isEnrolledInFlagship ? (
                    <>
                      <span>Iniciar Módulo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-800" />
                      <span>Requiere Matrícula</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ========================================================
          VISTA 2: MIS CURSOS MATRICULADOS
          ======================================================== */}
      {activeTab === 'enrolled' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {enrollments.length === 0 ? (
            <div className="text-center py-12 px-6 rounded-3xl bg-white border-2 border-dashed border-amber-300 space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-8 h-8 text-amber-700" />
              </div>
              <div className="space-y-1">
                <h3 className="title-h1 text-xl font-extrabold text-[#0038DF]">
                  Matrícula Pendiente de Pago
                </h3>
                <p className="text-xs sm:text-sm text-[#1E293B] max-w-lg mx-auto leading-relaxed">
                  Aún no tienes cursos matriculados. El acceso completo a las 140 horas de clases grabadas, materiales pedagógicos y simulacros CNSC se activa automáticamente una vez tu comprobante de pago es confirmado por el área administrativa.
                </p>
              </div>
              <button
                onClick={() => {
                  if (onNavigateToPricing) onNavigateToPricing()
                  else window.location.href = '/?view=pricing'
                }}
                className="btn-gold-cta btn-gold-pill px-8 py-3.5 text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ver Planes y Realizar Matrícula</span>
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {enrollments.map((enr) => {
                const c = enr.course
                if (!c) return null
                return (
                  <div
                    key={enr.id}
                    className="group rounded-3xl bg-white border-2 border-[#C99E32] p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Matrícula Activa
                        </span>
                        <span className="text-xs font-mono font-bold text-[#9C7316]">
                          {c.duration_hours || 140} Horas
                        </span>
                      </div>

                      <h3 className="font-extrabold text-xl text-[#0038DF] mb-2 leading-snug">
                        {c.title}
                      </h3>

                      <p className="text-xs text-[#1E293B] line-clamp-2 mb-4 leading-relaxed">
                        {c.short_description || c.description}
                      </p>

                      <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 mb-4">
                        <div className="flex justify-between text-xs font-bold text-[#1E293B]">
                          <span>Progreso del Curso</span>
                          <span className="text-[#0038DF]">100% de Contenidos Disponibles</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#0038DF] to-[#C99E32] rounded-full w-2/5" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                      <span className="text-xs text-[#64748B] font-medium">
                        Instructor: {c.instructor_name || 'Equipo Legado Docente'}
                      </span>
                      <button
                        onClick={() => onSelectCourse(c.slug)}
                        className="btn-gold-cta btn-gold-pill px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 cursor-pointer"
                      >
                        <span>Continuar Estudio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
