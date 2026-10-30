'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Play,
  BookOpen,
  Brain,
  FileText,
  CheckCircle2,
  Lock,
  Clock,
  ChevronRight,
  Star,
  Download,
  Zap,
  AlertCircle,
  Sparkles,
  Award,
  PenTool,
  Save,
  X,
  Printer,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useCourse } from '@/hooks/use-course'
import { updateLessonProgress, markLessonCompleted } from '@/services/progress'
import { getMaterialAccess } from '@/services/materials'
import { issueCourseCertificate, CertificateWithCourse } from '@/services/certificates'
import VideoPlayer from '@/components/video-player'
import { Material } from '@/types/database'

interface LearningProps {
  onNavigate: (view: string) => void
  courseSlug?: string
  onOpenAuth?: () => void
}

const AI_SUGGESTIONS = [
  'Explícame la diferencia entre Piaget y Vygotsky',
  '¿Cómo se evalúa el Decreto 1278 en la prueba CNSC?',
  '¿Cómo aplico la pedagogía crítica en mi clase?',
  'Crea un quiz rápido sobre esta lección',
]

function buildContextualAIResponse(question: string, lessonTitle?: string, courseTitle?: string): string {
  const q = question.toLowerCase()
  if (q.includes('piaget') || q.includes('vygotsky')) {
    return 'En las pruebas CNSC/ICFES, la diferencia clave radica en el origen del aprendizaje: para Jean Piaget (Constructivismo Psicogenético), el desarrollo cognitivo ocurre de adentro hacia afuera por etapas evolutivas mediante asimilación y acomodación. En cambio, para Lev Vygotsky (Constructivismo Social), el aprendizaje precede al desarrollo a través de la interacción social y el andamiaje en la Zona de Desarrollo Próximo (ZDP).'
  }
  if (q.includes('1278') || q.includes('decreto') || q.includes('escalafón') || q.includes('cnsc')) {
    return 'El Decreto Ley 1278 de 2002 rige el Estatuto de Profesionalización Docente. En el concurso CNSC se evalúa mediante casos situacionales donde debes priorizar: 1) El debido proceso pedagógico (Ley 115 y Decreto 1290), 2) La evaluación formativa continua, y 3) La articulación con el PEI y el Gobierno Escolar.'
  }
  if (q.includes('crítica') || q.includes('freire') || q.includes('clase')) {
    return 'Desde la Pedagogía Crítica de Paulo Freire, aplicar este enfoque en el aula implica reemplazar la "educación bancaria" (memorística y unidireccional) por una educación problematizadora y dialógica, vinculando los contenidos curriculares con las problemáticas reales de la comunidad educativa.'
  }
  if (q.includes('quiz') || q.includes('pregunta')) {
    return `¡Claro! Pregunta de entrenamiento sobre "${lessonTitle || 'esta unidad'}": Si un estudiante presenta dificultades persistentes para alcanzar un desempeño básico, según el Decreto 1290 la acción pedagógica correcta del docente es: A) Reprobarlo inmediatamente, B) Diseñar e implementar planes de apoyo y superación continua durante el periodo, C) Reducir la exigencia curricular. Respuesta correcta: B (evaluación formativa y continua).`
  }
  return `Sobre "${lessonTitle || courseTitle || 'esta sesión'}": En el marco de competencias del Ministerio de Educación Nacional (MEN), recuerda analizar siempre el contexto institucional (PEI), privilegiar la mediación pedagógica dialógica y garantizar el enfoque inclusivo (DUA - Decreto 1421). ¿Deseas profundizar en algún caso situacional o descargar la guía PDF de apoyo?`
}

export default function LearningView({
  onNavigate,
  courseSlug = 'pedagogia-critica-y-constructivismo',
  onOpenAuth,
}: LearningProps) {
  const { user, profile, isAuthenticated, role } = useAuth()
  const { course, loading, error, isEnrolled, refetch } = useCourse(
    courseSlug,
    user?.id
  )

  const hasCourseAccess = isEnrolled || role === 'admin' || role === 'instructor'

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [showAI, setShowAI] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiChat, setAiChat] = useState([
    {
      role: 'ai',
      text: '¡Hola profe! Soy tu Tutor IA Maestro. Estoy conectado al contenido de esta lección y a las guías oficiales del curso. ¿Qué duda pedagógica o normativa deseas resolver?',
    },
  ])
  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const [downloadingMatId, setDownloadingMatId] = useState<string | null>(null)
  const [materialError, setMaterialError] = useState<string | null>(null)

  // Certificado modal
  const [certModalOpen, setCertModalOpen] = useState(false)
  const [issuedCert, setIssuedCert] = useState<CertificateWithCourse | null>(null)
  const [issuingCert, setIssuingCert] = useState(false)

  // Seleccionar primer módulo y primera lección disponible al cambiar de curso
  useEffect(() => {
    if (course && course.modules.length > 0) {
      const firstMod = course.modules[0]
      setActiveModuleId((prev) =>
        course.modules.some((m) => m.id === prev) ? prev : firstMod.id
      )
      if (firstMod.lessons.length > 0) {
        setActiveLessonId((prev) => {
          const allLessons = course.modules.flatMap((m) => m.lessons)
          return allLessons.some((l) => l.id === prev) ? prev : firstMod.lessons[0].id
        })
      }
    }
  }, [course])

  // Obtener módulo y lección activos
  const activeModule = useMemo(() => {
    if (!course) return null
    return course.modules.find((m) => m.id === activeModuleId) || course.modules[0] || null
  }, [course, activeModuleId])

  const activeLesson = useMemo(() => {
    if (!activeModule) return null
    return (
      activeModule.lessons.find((l) => l.id === activeLessonId) ||
      activeModule.lessons[0] ||
      null
    )
  }, [activeModule, activeLessonId])

  // Todos los materiales del curso (combinando la lección activa + el resto del curso para acceso total)
  const allCourseMaterials = useMemo(() => {
    if (!course) return []
    const map = new Map<string, Material & { lessonTitle?: string }>()
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        for (const mat of les.materials || []) {
          if (!map.has(mat.id)) {
            map.set(mat.id, { ...mat, lessonTitle: les.title })
          }
        }
      }
    }
    return Array.from(map.values())
  }, [course])

  // Cargar notas guardadas para la lección activa
  useEffect(() => {
    if (!activeLesson?.id || typeof window === 'undefined') return
    const saved = window.localStorage.getItem(`maestro_note_${activeLesson.id}`)
    setNote(saved || '')
    setNoteSaved(false)
  }, [activeLesson?.id])

  const handleSaveNote = () => {
    if (!activeLesson?.id || typeof window === 'undefined') return
    window.localStorage.setItem(`maestro_note_${activeLesson.id}`, note)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  // Solo estudiantes matriculados manualmente por un Administrador (o docentes/admins) pueden ver el contenido
  const isCurrentLessonLocked = !hasCourseAccess

  // Manejar guardado silencioso de progreso de video (sin recargar la vista)
  const handleVideoProgress = async (watchedSeconds: number, totalSeconds: number) => {
    if (!user || !activeLesson || isCurrentLessonLocked) return
    const isFinished = watchedSeconds >= totalSeconds * 0.9

    await updateLessonProgress(user.id, activeLesson.id, {
      watched_seconds: watchedSeconds,
      last_position_seconds: watchedSeconds,
      completed: isFinished,
    })

    if (isFinished && !activeLesson.progress?.completed) {
      await refetch()
    }
  }

  // Marcar manualmente como completada
  const handleMarkComplete = async () => {
    if (!user || !activeLesson) {
      if (!isAuthenticated) onOpenAuth?.()
      return
    }
    if (!hasCourseAccess) return
    await markLessonCompleted(user.id, activeLesson.id)
    await refetch()
  }

  // Emitir o abrir certificado del curso
  const handleOpenCertificate = async () => {
    if (!user || !course || !hasCourseAccess) {
      if (!isAuthenticated) onOpenAuth?.()
      return
    }
    setIssuingCert(true)
    const { data } = await issueCourseCertificate(user.id, course.id)
    setIssuingCert(false)
    if (data) {
      setIssuedCert(data)
      setCertModalOpen(true)
    }
  }

  // Descarga segura de material (requiere matrícula activa o rol docente/admin)
  const handleDownloadMaterial = async (mat: Material) => {
    setMaterialError(null)
    if (!hasCourseAccess) {
      setMaterialError(
        'Acceso restringido: Un administrador debe activar tu matrícula manualmente para descargar los recursos de este curso.'
      )
      return
    }
    setDownloadingMatId(mat.id)

    const { url, error: err } = await getMaterialAccess(mat, true)
    setDownloadingMatId(null)

    if (err || !url) {
      setMaterialError(err?.message || 'No tienes permisos para descargar este archivo')
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const sendAI = (customPrompt?: string) => {
    const textToSend = (customPrompt ?? aiInput).trim()
    if (!textToSend) return
    const reply = buildContextualAIResponse(textToSend, activeLesson?.title, course?.title)
    setAiChat((prev) => [
      ...prev,
      { role: 'user', text: textToSend },
      { role: 'ai', text: reply },
    ])
    setAiInput('')
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '2.5 KB'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4 animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="font-display font-medium text-foreground text-sm">
            Cargando contenido del curso...
          </p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl glass border border-rose-500/20 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
          <h2 className="font-display font-bold text-lg text-foreground mb-2">
            Error al cargar el curso
          </h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            {error || 'No fue posible encontrar el curso seleccionado.'}
          </p>
          <button
            onClick={() => onNavigate('courses')}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    )
  }

  const totalLessons = course.stats?.totalLessons || 0
  const completedLessons = course.stats?.completedLessons || 0
  const percentComplete = course.stats?.percentComplete || 0
  const lessonMaterials = activeLesson?.materials || []

  return (
    <div className="min-h-screen bg-[#F3F8FD] flex flex-col lg:flex-row">
      {/* Sidebar — Course outline */}
      <aside className="w-full lg:w-80 xl:w-96 lg:border-r border-[#E5EDF5] bg-white lg:overflow-y-auto no-scrollbar shrink-0 shadow-xs">
        <div className="p-6 border-b border-[#E5EDF5]">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-sm text-[#536B83] hover:text-[#142D49] mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Mi Panel de Estudio
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#176FC1]/10 text-[#176FC1] border border-[#176FC1]/20">
              {course.category || 'Pedagogía'}
            </span>
            {isEnrolled && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                ✓ Estudiante Matriculado
              </span>
            )}
          </div>

          <h2 className="font-display font-bold text-[#142D49] mb-1 line-clamp-2">
            {course.title}
          </h2>
          <p className="text-xs text-[#536B83] mb-4">
            {course.modules.length} módulos · {totalLessons} clases · {allCourseMaterials.length}{' '}
            recursos PDF
          </p>

          {/* Barra de progreso real */}
          <div className="h-2 bg-[#E5EDF5] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#176FC1] to-[#39BDEB] rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[#536B83] font-medium">
              {completedLessons} de {totalLessons} clases · {percentComplete}%
            </p>
            {isEnrolled && (
              <button
                type="button"
                onClick={handleOpenCertificate}
                disabled={issuingCert}
                className="text-[11px] font-semibold text-[#E9A83A] hover:underline flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5" />
                {issuingCert ? 'Generando...' : 'Ver Certificado'}
              </button>
            )}
          </div>
        </div>

        {/* Módulos y Clases reales */}
        <div className="p-4 space-y-4">
          {course.modules.map((mod, modIdx) => (
            <div
              key={mod.id}
              className="rounded-2xl border border-[#E5EDF5] bg-white overflow-hidden shadow-xs"
            >
              <div className="p-3.5 bg-[#F3F8FD] border-b border-[#E5EDF5] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#176FC1] uppercase tracking-wider">
                    Módulo {mod.order_index || modIdx + 1}
                  </span>
                  <p className="text-xs font-semibold text-[#142D49] truncate max-w-[210px]">
                    {mod.title}
                  </p>
                </div>
                <span className="text-[10px] text-[#536B83] font-mono">
                  {mod.lessons.length} clases
                </span>
              </div>

              <div className="p-1.5 space-y-1">
                {mod.lessons.map((lesson) => {
                  const isCurrent = lesson.id === activeLesson?.id
                  const isLocked = !hasCourseAccess
                  const isCompleted = lesson.progress?.completed

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveModuleId(mod.id)
                        setActiveLessonId(lesson.id)
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        isCurrent
                          ? 'bg-[#F3F8FD] border border-[#176FC1] text-[#176FC1] font-semibold shadow-xs'
                          : isLocked
                            ? 'opacity-60 hover:opacity-80'
                            : 'hover:bg-[#F3F8FD] text-[#142D49]'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-600'
                            : isCurrent
                              ? 'bg-[#176FC1] text-white'
                              : 'bg-[#F3F8FD] text-[#536B83]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                        ) : isLocked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3 h-3 fill-current" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium truncate ${
                            isCurrent ? 'text-[#176FC1] font-bold' : 'text-[#142D49]'
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#536B83]">
                            {Math.round((lesson.duration_seconds || 1800) / 60)} min
                          </span>
                          {lesson.materials && lesson.materials.length > 0 && (
                            <span className="text-[9px] font-semibold text-[#176FC1] bg-[#176FC1]/10 px-1.5 py-0.2 rounded">
                              {lesson.materials.length} PDF
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Banner de matrícula si el usuario no está matriculado */}
        {!hasCourseAccess && (
          <div className="bg-gradient-to-r from-[#E9A83A]/10 via-[#176FC1]/5 to-transparent border-b border-[#E9A83A]/30 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#142D49] font-medium">
              <Lock className="w-4 h-4 text-[#E9A83A] shrink-0" />
              <span>
                Acceso exclusivo para estudiantes matriculados. La inscripción a este curso es activada únicamente de forma manual por un Administrador.
              </span>
            </div>
            {!isAuthenticated ? (
              <button
                onClick={() => onOpenAuth?.()}
                className="px-4 py-1.5 rounded-lg bg-[#176FC1] hover:bg-[#142D49] text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
              >
                Iniciar Sesión
              </button>
            ) : (
              <span className="px-3 py-1 rounded-full bg-[#E9A83A]/15 text-[#E9A83A] border border-[#E9A83A]/30 font-semibold text-[11px] shrink-0">
                Requiere activación del Administrador
              </span>
            )}
          </div>
        )}

        {/* Video Player Area */}
        <div className="p-4 sm:p-6 pb-0">
          {isCurrentLessonLocked ? (
            <div className="relative bg-white aspect-video w-full rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-[#E5EDF5] shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#E9A83A]/10 text-[#E9A83A] border border-[#E9A83A]/25 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#142D49] mb-2">
                Curso exclusivo para estudiantes matriculados
              </h3>
              <p className="text-xs text-[#536B83] max-w-md mb-5 leading-relaxed">
                Para acceder a las videoclases, guías PDF descargables, simulacros y certificado de{' '}
                <strong className="text-[#142D49]">{course.title}</strong>, un Administrador de MaestroTech debe activar tu matrícula manualmente en el sistema.
              </p>
              {!isAuthenticated ? (
                <button
                  onClick={() => onOpenAuth?.()}
                  className="px-6 py-3 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white font-semibold text-xs shadow-md shadow-[#176FC1]/20 transition-all"
                >
                  Iniciar Sesión con mi Cuenta
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="px-4 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#536B83]">
                    Cuenta activa: <strong className="text-[#142D49]">{user?.email}</strong> · Sin matrícula en este curso
                  </div>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="px-5 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    Ir a Mis Cursos Matriculados
                  </button>
                </div>
              )}
            </div>
          ) : (
            <VideoPlayer
              videoProvider={activeLesson?.video_provider}
              videoId={activeLesson?.video_id}
              title={activeLesson?.title}
              thumbnailUrl={course.thumbnail_url}
              durationSeconds={activeLesson?.duration_seconds || 2400}
              initialPositionSeconds={activeLesson?.progress?.last_position_seconds || 0}
              onProgress={handleVideoProgress}
              onEnded={handleMarkComplete}
            />
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#536B83]">
                    {activeModule?.title || 'Contenido'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[#536B83]" />
                  <span className="text-xs text-[#176FC1] font-semibold">
                    Clase {activeLesson?.order_index || 1}
                  </span>
                </div>
                <h1 className="font-display font-bold text-2xl text-[#142D49]">
                  {activeLesson?.title || course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#536B83]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#39BDEB]" />
                    {Math.round((activeLesson?.duration_seconds || 1800) / 60)} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-[#E9A83A] fill-[#E9A83A]" />
                    4.9 calificación
                  </span>
                  <span className="text-[#142D49] font-medium">
                    Docente: {course.instructor_name || 'Dra. Elena Restrepo'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowAI(!showAI)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    showAI
                      ? 'bg-[#176FC1] text-white shadow-sm'
                      : 'bg-white border border-[#E5EDF5] hover:border-[#176FC1]/50 text-[#142D49] shadow-xs'
                  }`}
                >
                  <Brain className="w-4 h-4 text-[#39BDEB]" />
                  <span>Tutor IA Pedagógico</span>
                </button>

                {isEnrolled && (
                  <button
                    onClick={handleOpenCertificate}
                    disabled={issuingCert}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E9A83A]/10 hover:bg-[#E9A83A]/20 border border-[#E9A83A]/30 text-[#E9A83A] text-xs font-semibold transition-all shadow-xs"
                  >
                    <Award className="w-4 h-4" />
                    <span>Certificado</span>
                  </button>
                )}
              </div>
            </div>

            {/* AI Assistant */}
            <AnimatePresence>
              {showAI && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-[#176FC1] flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#142D49]">Tutor IA Maestro</p>
                        <p className="text-[10px] text-[#176FC1] font-medium">
                          Especialista en Concurso Docente CNSC y Decreto 1278
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar mb-4">
                      {aiChat.map((m, i) => (
                        <div
                          key={i}
                          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                              m.role === 'user'
                                ? 'bg-[#176FC1] text-white rounded-br-sm shadow-xs'
                                : 'bg-[#F3F8FD] border border-[#E5EDF5] text-[#142D49] rounded-bl-sm'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sugerencias */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {AI_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendAI(s)}
                          className="text-[11px] px-3 py-1 rounded-lg bg-[#F3F8FD] hover:bg-[#176FC1]/10 text-[#536B83] hover:text-[#176FC1] border border-[#E5EDF5] hover:border-[#176FC1]/30 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') sendAI()
                        }}
                        placeholder="Pregunta sobre esta lección o el Decreto 1278..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] focus:outline-none text-xs text-[#142D49] placeholder-[#536B83]"
                      />
                      <button
                        onClick={() => sendAI()}
                        className="p-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white transition-colors"
                      >
                        <Zap className="w-4 h-4 text-[#39BDEB]" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Materiales de estudio y descargas */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#142D49] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#176FC1]" />
                  Materiales de Estudio y Guías Descargables del Curso
                </h3>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#176FC1]/10 text-[#176FC1] border border-[#176FC1]/20">
                  {allCourseMaterials.length} recursos disponibles
                </span>
              </div>

              {materialError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
                  {materialError}
                </div>
              )}

              {allCourseMaterials.length > 0 ? (
                <div className="space-y-2.5">
                  {allCourseMaterials.map((mat) => {
                    const isLocked = !hasCourseAccess
                    const isFromCurrentLesson = lessonMaterials.some((m) => m.id === mat.id)
                    return (
                      <div
                        key={mat.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-all ${
                          isFromCurrentLesson
                            ? 'bg-[#F3F8FD] border-[#176FC1]/40'
                            : 'bg-white border-[#E5EDF5] hover:border-[#176FC1]/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[#176FC1]/10 text-[#176FC1] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-[#142D49] truncate">{mat.title}</p>
                              {isFromCurrentLesson && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#176FC1]/15 text-[#176FC1] shrink-0">
                                  Esta clase
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#536B83] uppercase">
                              {mat.file_type || 'PDF'} · {formatFileSize(mat.file_size)}
                              {mat.lessonTitle ? ` · ${mat.lessonTitle}` : ''}
                            </span>
                          </div>
                        </div>

                        {isLocked ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#E9A83A] px-3 py-1.5 rounded-lg bg-[#E9A83A]/10 border border-[#E9A83A]/25">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Solo matriculados</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDownloadMaterial(mat)}
                            disabled={downloadingMatId === mat.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-semibold transition-colors shrink-0 shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>
                              {downloadingMatId === mat.id ? 'Abriendo...' : 'Descargar PDF'}
                            </span>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#536B83]">
                  Aún no hay materiales adjuntos en este curso.
                </p>
              )}
            </div>

            {/* Descripción de la lección */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs">
              <h3 className="font-display font-bold text-sm text-[#142D49] mb-3">
                Síntesis Pedagógica de la Clase
              </h3>
              <p className="text-xs sm:text-sm text-[#536B83] leading-relaxed">
                {activeLesson?.description ||
                  course.description ||
                  'En esta sesión profundizarás en los conceptos pedagógicos esenciales para tu labor docente.'}
              </p>
            </div>

            {/* Mis Apuntes de Clase */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#142D49] flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#176FC1]" />
                  Mis Apuntes Personales de esta Clase
                </h3>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#176FC1]/10 hover:bg-[#176FC1]/20 text-[#176FC1] text-xs font-semibold transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{noteSaved ? '¡Apuntes guardados!' : 'Guardar apuntes'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escribe aquí tus ideas clave, artículos normativos o recordatorios para el examen..."
                className="w-full p-3.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] text-xs text-[#142D49] outline-none resize-none leading-relaxed placeholder-[#536B83]"
              />
            </div>

            {/* Botones de acción inferior */}
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={handleMarkComplete}
                className="w-full py-3.5 rounded-2xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#176FC1]/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {activeLesson?.progress?.completed
                    ? '✓ Lección Completada'
                    : 'Marcar lección como completada'}
                </span>
              </button>

              <button
                onClick={() => onNavigate('exam')}
                className="w-full py-3.5 rounded-2xl bg-white border border-[#E5EDF5] hover:border-[#176FC1] text-[#142D49] hover:text-[#176FC1] text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#176FC1]" />
                <span>Practicar en Simulacro CNSC</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Certificado Oficial */}
      <AnimatePresence>
        {certModalOpen && issuedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#142D49]/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white border-2 border-[#E9A83A] shadow-2xl p-8 text-center space-y-6"
            >
              <button
                onClick={() => setCertModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-[#536B83] hover:text-[#142D49] hover:bg-[#F3F8FD] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-[#E9A83A]/15 text-[#E9A83A] border border-[#E9A83A]/30 flex items-center justify-center mx-auto">
                <Award className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#E9A83A]">
                  Certificación Académica Verificada • MaestroTech Colombia
                </p>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#142D49]">
                  Certificado de Formación Docente
                </h2>
              </div>

              <div className="p-6 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] space-y-3">
                <p className="text-xs text-[#536B83]">Se otorga el presente certificado a:</p>
                <p className="font-display font-bold text-xl text-[#176FC1]">
                  {profile?.full_name || user?.email || 'Estudiante MaestroTech'}
                </p>
                <p className="text-xs text-[#536B83]">
                  Por cursar y aprobar satisfactoriamente el programa de actualización pedagógica:
                </p>
                <p className="font-display font-bold text-base text-[#142D49]">{course.title}</p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[11px] text-[#536B83] font-mono">
                  <span>Intensidad: {course.duration_hours || 48} horas</span>
                  <span>•</span>
                  <span>Código: {issuedCert.certificate_number}</span>
                  <span>•</span>
                  <span>
                    Fecha: {new Date(issuedCert.issued_at).toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-xl bg-[#E9A83A] hover:bg-[#d49428] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" /> Imprimir / Guardar como PDF
                </button>
                <button
                  onClick={() => setCertModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-white border border-[#E5EDF5] text-xs font-semibold text-[#142D49] hover:bg-[#F3F8FD] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
