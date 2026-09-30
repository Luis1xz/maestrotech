'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Play, BookOpen, Brain, FileText, Bookmark,
  CheckCircle2, Lock, Clock, ChevronRight, Star,
  Download, Zap, AlertCircle, ChevronDown, Sparkles
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useCourse } from '@/hooks/use-course'
import { updateLessonProgress, markLessonCompleted } from '@/services/progress'
import { getMaterialAccess } from '@/services/materials'
import VideoPlayer from '@/components/video-player'
import { Material } from '@/types/database'

interface LearningProps {
  onNavigate: (view: string) => void
  courseSlug?: string
  onOpenAuth?: () => void
}

const AI_SUGGESTIONS = [
  'Explícame la diferencia entre Piaget y Vygotsky',
  '¿Cómo aplico la pedagogía crítica en mi clase?',
  'Crea un quiz sobre constructivismo',
  'Resume los conceptos clave de esta lección',
]

export default function LearningView({
  onNavigate,
  courseSlug = 'pedagogia-critica-y-constructivismo',
  onOpenAuth,
}: LearningProps) {
  const { user, isAuthenticated } = useAuth()
  const { course, loading, error, isEnrolled, enroll, enrolling, refetch } = useCourse(
    courseSlug,
    user?.id
  )

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiChat, setAiChat] = useState([
    { role: 'ai', text: 'Estoy analizando este curso. ¿Qué duda pedagógica o conceptual tienes sobre esta lección?' },
  ])
  const [notesOpen, setNotesOpen] = useState(false)
  const [note, setNote] = useState('')
  const [downloadingMatId, setDownloadingMatId] = useState<string | null>(null)
  const [materialError, setMaterialError] = useState<string | null>(null)

  // Seleccionar primer módulo y primera lección disponible
  useEffect(() => {
    if (course && course.modules.length > 0) {
      if (!activeModuleId) {
        const firstMod = course.modules[0]
        setActiveModuleId(firstMod.id)
        if (firstMod.lessons.length > 0 && !activeLessonId) {
          setActiveLessonId(firstMod.lessons[0].id)
        }
      }
    }
  }, [course, activeModuleId, activeLessonId])

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

  // Determinar si la lección actual está bloqueada
  const isCurrentLessonLocked = !isEnrolled && !activeLesson?.is_preview

  // Manejar guardado de progreso de video
  const handleVideoProgress = async (watchedSeconds: number, totalSeconds: number) => {
    if (!user || !activeLesson || isCurrentLessonLocked) return
    const isFinished = watchedSeconds >= totalSeconds * 0.9

    await updateLessonProgress(user.id, activeLesson.id, {
      watched_seconds: watchedSeconds,
      last_position_seconds: watchedSeconds,
      completed: isFinished,
    })
  }

  // Marcar manualmente como completada
  const handleMarkComplete = async () => {
    if (!user || !activeLesson) {
      if (!isAuthenticated) onOpenAuth?.()
      return
    }
    await markLessonCompleted(user.id, activeLesson.id)
    await refetch()
  }

  // Descarga segura de material
  const handleDownloadMaterial = async (mat: Material) => {
    setMaterialError(null)
    setDownloadingMatId(mat.id)

    const { url, error: err } = await getMaterialAccess(mat, isEnrolled)
    setDownloadingMatId(null)

    if (err || !url) {
      setMaterialError(err?.message || 'No tienes permisos para descargar este archivo')
      return
    }

    // Abrir descarga en pestaña nueva o disparar enlace
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const sendAI = () => {
    if (!aiInput.trim()) return
    setAiChat([
      ...aiChat,
      { role: 'user', text: aiInput },
      {
        role: 'ai',
        text: 'Excelente planteamiento. En el marco pedagógico de este módulo, la propuesta dialógica exige partir de la realidad del estudiante para transformar el aprendizaje en una experiencia significativa y contextualizada.',
      },
    ])
    setAiInput('')
  }

  // Estado de carga elegante
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4 animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="font-display font-medium text-foreground text-sm">Cargando contenido del curso...</p>
        </div>
      </div>
    )
  }

  // Estado de error elegante
  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl glass border border-rose-500/20 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
          <h2 className="font-display font-bold text-lg text-foreground mb-2">Error al cargar el curso</h2>
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

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar — Course outline */}
      <aside className="w-full lg:w-80 xl:w-96 lg:border-r border-border/60 bg-card/60 backdrop-blur-sm lg:overflow-y-auto no-scrollbar shrink-0">
        <div className="p-6 border-b border-border/60">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <h2 className="font-display font-bold text-foreground mb-1 line-clamp-2">{course.title}</h2>
          <p className="text-xs text-muted-foreground mb-4">
            {course.modules.length} módulos · {totalLessons} clases
          </p>

          {/* Barra de progreso real */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full progress-bar rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completedLessons} de {totalLessons} clases completadas · {percentComplete}%
          </p>
        </div>

        {/* Módulos y Clases reales */}
        <div className="p-4 space-y-4">
          {course.modules.map((mod, modIdx) => (
            <div key={mod.id} className="rounded-2xl border border-border/50 bg-background/40 overflow-hidden">
              <div className="p-3.5 bg-muted/30 border-b border-border/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Módulo {mod.order_index || modIdx + 1}
                  </span>
                  <p className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                    {mod.title}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {mod.lessons.length} lecciones
                </span>
              </div>

              <div className="p-1.5 space-y-1">
                {mod.lessons.map((lesson) => {
                  const isCurrent = lesson.id === activeLesson?.id
                  const isLocked = !isEnrolled && !lesson.is_preview
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
                          ? 'bg-primary/10 border border-primary/25 text-primary'
                          : isLocked
                          ? 'opacity-60 hover:opacity-80'
                          : 'hover:bg-muted/60 text-foreground'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : isCurrent
                            ? 'bg-primary/20 text-primary'
                            : isLocked
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-muted text-muted-foreground'
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
                        <p className={`text-xs font-medium truncate ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {Math.round((lesson.duration_seconds || 1800) / 60)} min
                          </span>
                          {lesson.is_preview && !isEnrolled && (
                            <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                              Vista previa
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
        {/* Banner de matrícula si el curso es privado o el usuario no está matriculado */}
        {!isEnrolled && (
          <div className="bg-gradient-to-r from-blue-600/15 via-violet-600/15 to-transparent border-b border-primary/20 px-6 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Estás viendo la vista previa pública. Matricúlate para desbloquear todas las clases y materiales.</span>
            </div>
            <button
              onClick={async () => {
                if (!isAuthenticated) {
                  onOpenAuth?.()
                } else {
                  await enroll()
                }
              }}
              disabled={enrolling}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:shadow transition-all shrink-0"
            >
              {enrolling ? 'Matriculando...' : course.price === 0 ? 'Matricularme Gratis' : 'Inscribirme al Curso'}
            </button>
          </div>
        )}

        {/* Video Player Area */}
        <div className="p-4 sm:p-6 pb-0">
          {isCurrentLessonLocked ? (
            <div className="relative bg-neutral-950 aspect-video w-full rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-border/50">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                Clase bloqueada
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mb-6 leading-relaxed">
                Esta clase pertenece al contenido exclusivo de {course.title}. Matricúlate para acceder al video, materiales y seguimiento de tu progreso.
              </p>
              <button
                onClick={async () => {
                  if (!isAuthenticated) onOpenAuth?.()
                  else await enroll()
                }}
                disabled={enrolling}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-xs shadow-lg shadow-blue-600/25"
              >
                {enrolling ? 'Procesando...' : 'Desbloquear acceso ahora'}
              </button>
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {activeModule?.title || 'Contenido'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-primary font-medium">Clase {activeLesson?.order_index || 1}</span>
                </div>
                <h1 className="font-display font-bold text-2xl text-foreground">
                  {activeLesson?.title || course.title}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {Math.round((activeLesson?.duration_seconds || 1800) / 60)} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    4.9 calificación
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowAI(!showAI)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    showAI
                      ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-600/20'
                      : 'glass border border-border/60 hover:border-primary/30 text-foreground'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Tutor IA</span>
                </button>
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
                  <div className="p-6 rounded-2xl glass border border-violet-500/20 bg-violet-500/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Tutor IA Maestro</p>
                        <p className="text-[10px] text-emerald-500">Analizando lección en tiempo real</p>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-40 overflow-y-auto no-scrollbar mb-4">
                      {aiChat.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                              m.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-sm'
                                : 'bg-muted text-foreground rounded-bl-sm'
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
                          onClick={() => setAiInput(s)}
                          className="text-[11px] px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
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
                        placeholder="Pregunta sobre esta lección..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border/60 focus:border-primary/40 focus:outline-none text-xs text-foreground placeholder-muted-foreground"
                      />
                      <button
                        onClick={sendAI}
                        className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Materiales de la lección */}
            <div className="p-6 rounded-2xl glass border border-border/60">
              <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Materiales de estudio y descargas
              </h3>

              {materialError && (
                <div className="p-3 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                  {materialError}
                </div>
              )}

              {activeLesson?.materials && activeLesson.materials.length > 0 ? (
                <div className="space-y-2">
                  {activeLesson.materials.map((mat) => {
                    const isLocked = !mat.is_free && !isEnrolled
                    return (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{mat.title}</p>
                            <span className="text-[10px] text-muted-foreground uppercase">
                              {mat.file_type} · {(mat.file_size / 1024 / 1024).toFixed(1)} MB
                            </span>
                          </div>
                        </div>

                        {isLocked ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-3 py-1.5 rounded-lg bg-muted">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Bloqueado</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDownloadMaterial(mat)}
                            disabled={downloadingMatId === mat.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{downloadingMatId === mat.id ? 'Generando...' : 'Descargar'}</span>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Esta clase no tiene materiales adjuntos para descargar.
                </p>
              )}
            </div>

            {/* Descripción de la lección */}
            <div className="p-6 rounded-2xl glass border border-border/60">
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">
                Descripción de la clase
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {activeLesson?.description ||
                  course.description ||
                  'En esta sesión profundizarás en los conceptos pedagógicos esenciales para tu labor docente.'}
              </p>
            </div>

            {/* Botón de marcar completado */}
            <div className="flex gap-4">
              <button
                onClick={handleMarkComplete}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs sm:text-sm font-semibold shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all btn-magnetic flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar lección como completada</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
