'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trophy,
  Brain,
  Target,
  Flag,
  RotateCcw,
  Home,
  Sparkles,
  Lightbulb,
  Zap,
  Award,
  BookOpen,
} from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { getExamQuestions } from '@/services/exams'
import AIMentor, { MentorMood } from '@/components/ai-mentor'
import CelebrationParticles from '@/components/celebration-particles'
import {
  recordQuestionAnswer,
  getUserGamification,
} from '@/services/gamification'
import {
  UserGamificationState,
  Badge,
  TopicPerformance,
} from '@/types/gamification'

interface ExamProps {
  onNavigate: (view: string) => void
}

interface SimulatorQuestion {
  id: string
  text: string
  options: string[]
  correct: number
  explanation: string
  competency: string
}

const DEFAULT_QUESTIONS: SimulatorQuestion[] = [
  {
    id: 'q1',
    text: 'Según el Decreto 1278 de 2002, ¿cuál es el principal criterio para el ingreso al servicio docente en Colombia?',
    options: [
      'Antigüedad en el cargo directivo',
      'Superación de concurso de méritos mediante prueba de competencias',
      'Recomendación del rector de la institución',
      'Título de especialización en pedagogía',
    ],
    correct: 1,
    explanation:
      'El Decreto 1278 establece que el ingreso al servicio educativo estatal se hará mediante concurso de méritos, que incluye prueba de aptitudes, competencias básicas y pedagógicas.',
    competency: 'Legislación Educativa',
  },
  {
    id: 'q2',
    text: '¿Qué autor propuso la "Zona de Desarrollo Próximo" como concepto fundamental para entender el aprendizaje en sociedad?',
    options: ['Jean Piaget', 'Lev Vygotsky', 'David Ausubel', 'Jerome Bruner'],
    correct: 1,
    explanation:
      'Lev Vygotsky introdujo la Zona de Desarrollo Próximo (ZDP) para describir la diferencia entre lo que el estudiante puede hacer solo y lo que puede lograr con apoyo, fundamental para el aprendizaje colaborativo.',
    competency: 'Psicología del Aprendizaje',
  },
  {
    id: 'q3',
    text: 'En el marco del modelo pedagógico constructivista, ¿cuál es el rol principal del docente?',
    options: [
      'Transmisor de información académica',
      'Evaluador de resultados finales',
      'Facilitador y mediador del proceso de aprendizaje',
      'Diseñador de currículos nacionales',
    ],
    correct: 2,
    explanation:
      'En el constructivismo, el docente es un facilitador que guía al estudiante en la construcción activa de su propio conocimiento, creando ambientes de aprendizaje significativo.',
    competency: 'Pedagogía',
  },
]

const RADAR_DATA = [
  { subject: 'Pedagogía', A: 0, fullMark: 100 },
  { subject: 'Legislación', A: 0, fullMark: 100 },
  { subject: 'Lectura Crítica', A: 0, fullMark: 100 },
  { subject: 'Razonamiento', A: 0, fullMark: 100 },
  { subject: 'Comportamental', A: 0, fullMark: 100 },
]

type Phase = 'intro' | 'exam' | 'result'

export default function ExamSimulator({ onNavigate }: ExamProps) {
  const [questions, setQuestions] = useState<SimulatorQuestion[]>(DEFAULT_QUESTIONS)
  const [phase, setPhase] = useState<Phase>('intro')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<(number | null)[]>(
    Array(DEFAULT_QUESTIONS.length).fill(null)
  )
  const [flagged, setFlagged] = useState<boolean[]>(Array(DEFAULT_QUESTIONS.length).fill(false))
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [answered, setAnswered] = useState(false)

  // Estados Pedagógicos & Gamificación
  const [gamification, setGamification] = useState<UserGamificationState>(() => getUserGamification())
  const [mentorMood, setMentorMood] = useState<MentorMood>('thinking')
  const [showParticles, setShowParticles] = useState(false)
  const [retriedQuestions, setRetriedQuestions] = useState<Record<number, boolean>>({})
  const [showHintForQuestion, setShowHintForQuestion] = useState<Record<number, boolean>>({})
  const [sessionXp, setSessionXp] = useState(0)

  useEffect(() => {
    setGamification(getUserGamification())
  }, [])

  useEffect(() => {
    async function loadBank() {
      const { data } = await getExamQuestions()
      if (data && data.length > 0) {
        const mapped: SimulatorQuestion[] = data.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correct: typeof q.correct === 'number' ? q.correct : 0,
          explanation: q.explanation,
          competency: q.competency,
        }))
        setQuestions(mapped)
        setSelected(Array(mapped.length).fill(null))
        setFlagged(Array(mapped.length).fill(false))
      }
    }
    loadBank()
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const isRed = timeLeft < 300

  useEffect(() => {
    if (phase !== 'exam') return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          setPhase('result')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  const selectAnswer = (idx: number) => {
    if (answered) return
    const newSelected = [...selected]
    newSelected[current] = idx
    setSelected(newSelected)
    setAnswered(true)

    const isCorrect = idx === questions[current]?.correct
    const isRetry = Boolean(retriedQuestions[current])

    const res = recordQuestionAnswer({
      competency: questions[current]?.competency || 'Pedagogía',
      isCorrect,
      isRetry,
    })

    setGamification(res.state)
    setSessionXp((prev) => prev + res.xpGained)

    if (isCorrect) {
      setShowParticles(true)
      setMentorMood(isRetry ? 'encouraging' : 'celebrating')
    } else {
      setMentorMood('empathic')
    }
  }

  const handleRetryQuestion = () => {
    setRetriedQuestions((prev) => ({ ...prev, [current]: true }))
    setShowHintForQuestion((prev) => ({ ...prev, [current]: true }))
    const newSelected = [...selected]
    newSelected[current] = null
    setSelected(newSelected)
    setAnswered(false)
    setMentorMood('thinking')
  }

  const goNext = () => {
    setShowParticles(false)
    if (current < questions.length - 1) {
      setCurrent(current + 1)
      const nextAnswered = selected[current + 1] !== null
      setAnswered(nextAnswered)
      if (!nextAnswered) {
        setMentorMood('thinking')
      } else {
        const wasCorrect = selected[current + 1] === questions[current + 1]?.correct
        setMentorMood(wasCorrect ? 'happy' : 'empathic')
      }
    } else {
      setPhase('result')
    }
  }

  const goPrev = () => {
    setShowParticles(false)
    if (current > 0) {
      setCurrent(current - 1)
      const prevAnswered = selected[current - 1] !== null
      setAnswered(prevAnswered)
      if (!prevAnswered) {
        setMentorMood('thinking')
      } else {
        const wasCorrect = selected[current - 1] === questions[current - 1]?.correct
        setMentorMood(wasCorrect ? 'happy' : 'empathic')
      }
    }
  }

  const score = selected.filter((s, i) => s === questions[i]?.correct).length
  const pct = Math.round((score / Math.max(1, questions.length)) * 100)
  const passed = pct >= 60

  const radarData = RADAR_DATA.map((d) => {
    const keyword = d.subject.split(' ')[0].toLowerCase()
    const matching = questions.filter(
      (q, i) => q.competency.toLowerCase().includes(keyword) && selected[i] === q.correct
    )
    const total = questions.filter((q) => q.competency.toLowerCase().includes(keyword)).length
    return {
      ...d,
      A: total > 0 ? Math.round((matching.length / total) * 100) : Math.max(65, pct),
    }
  })

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background aurora-bg flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </button>

          <div className="p-10 rounded-3xl glass border border-border/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
              <Target className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Simulacro Oficial Sincronizado
            </div>

            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Concurso de Méritos Docente CNSC
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Simulacro de práctica con {questions.length} preguntas situacionales. Tiempo límite: 60 minutos. Basado en el banco oficial del MEN y los docentes de la plataforma.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: 'Preguntas', value: `${questions.length}`, icon: Brain },
                { label: 'Duración', value: '60 min', icon: Clock },
                { label: 'Aprobación', value: '60%', icon: CheckCircle2 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="p-4 rounded-2xl bg-muted/50 border border-border/60">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-lg font-bold font-display text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPhase('exam')}
              className="group w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-lg shadow-xl shadow-blue-600/25 hover:shadow-blue-600/50 transition-all btn-magnetic"
            >
              <span className="flex items-center justify-center gap-2">
                Comenzar simulacro
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="min-h-screen bg-background aurora-bg px-6 py-16 flex items-center justify-center">
        <CelebrationParticles trigger={passed} />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl space-y-6"
        >
          {/* Main Score Card */}
          <div className="p-8 sm:p-10 rounded-3xl glass border border-border/60 text-center">
            <div
              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${
                passed ? 'from-emerald-500 to-cyan-500' : 'from-orange-500 to-rose-500'
              } flex items-center justify-center mx-auto mb-5 shadow-xl`}
            >
              {passed ? (
                <Trophy className="w-10 h-10 text-white" strokeWidth={1.5} />
              ) : (
                <Target className="w-10 h-10 text-white" strokeWidth={1.5} />
              )}
            </div>

            <p
              className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${
                passed ? 'text-emerald-500' : 'text-orange-500'
              }`}
            >
              {passed ? '¡Simulacro Superado con Éxito!' : '¡Buen Esfuerzo! Cada Intento Suma'}
            </p>
            <h2 className="font-display font-bold text-5xl md:text-6xl text-foreground mb-2">
              {pct}%
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mb-6">
              {score} de {questions.length} respuestas acertadas · {sessionXp} XP obtenidos en esta sesión
            </p>

            <div className="h-2.5 bg-muted rounded-full overflow-hidden max-w-sm mx-auto mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full ${
                  passed
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                    : 'bg-gradient-to-r from-orange-500 to-rose-500'
                }`}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {[
                { label: 'Correctas', value: score, color: 'text-emerald-500' },
                { label: 'Incorrectas', value: questions.length - score, color: 'text-rose-500' },
                {
                  label: 'Sin responder',
                  value: selected.filter((s) => s === null).length,
                  color: 'text-amber-500',
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded-2xl bg-muted/40 border border-border/40">
                  <p className={`text-xl font-bold font-display ${color}`}>{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Mentor Pedagogical Summary */}
          <AIMentor
            mood={passed ? 'celebrating' : 'encouraging'}
            variant="card"
            message={
              passed
                ? `¡Extraordinario desempeño, colega! Obtuviste un ${pct}%. Tu criterio para abordar situaciones de aula, evaluación y convivencia refleja un sólido dominio del marco pedagógico y normativo del MEN.`
                : `¡Muy buen esfuerzo! Lograste un ${pct}%. Recuerda que en pedagogía no hay respuestas fallidas, sino hipótesis de aprendizaje. Revisa los ejes recomendados para afianzar tus competencias.`
            }
            hint={
              passed
                ? 'Consejo pedagógico: Profundiza ahora en los modelos de gestión directiva y liderazgo comunitario.'
                : 'Pista pedagógica: Recuerda que el Decreto 1290 prioriza la autorregulación formativa y la flexibilización curricular.'
            }
          />

          {/* Gamification & Badges Card */}
          <div className="p-6 rounded-3xl glass border border-violet-500/30 bg-violet-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">
                    Nivel de Dominio Docente: {gamification.levelTitle}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Nivel {gamification.level} · {gamification.xp} XP totales acumulados
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-violet-500/15 text-violet-400 font-bold text-xs border border-violet-500/30">
                +{sessionXp} XP ganados
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Progreso hacia el siguiente nivel</span>
                <span>{gamification.xp} / {gamification.nextLevelXp} XP</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((gamification.xp / gamification.nextLevelXp) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Badges unlocked */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Insignias Obtenidas ({gamification.unlockedBadges.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {gamification.unlockedBadges.map((badge: Badge) => (
                  <span
                    key={badge.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/60 border border-border/80 text-xs font-medium text-foreground"
                    title={badge.description}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.title}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Seguimiento de Progreso: Fortalezas y Ejes a Fortalecer */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Fortalezas */}
            <div className="p-6 rounded-3xl glass border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h4 className="font-display font-bold text-sm text-foreground">
                  Fortalezas Detectadas
                </h4>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tus respuestas evidencian gran solvencia y comprensión pedagógica en:
              </p>
              <div className="space-y-2">
                {gamification.strengths.map((str: TopicPerformance) => (
                  <div key={str.topic} className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                    <p className="text-xs font-bold text-emerald-400">{str.topic}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{str.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ejes a Fortalecer y Recomendaciones */}
            <div className="p-6 rounded-3xl glass border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h4 className="font-display font-bold text-sm text-foreground">
                  Ejes por Reforzar
                </h4>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Recomendaciones personalizadas para elevar tu puntaje en el concurso:
              </p>
              <div className="space-y-2">
                {gamification.improvementAreas.map((imp: TopicPerformance) => (
                  <div key={imp.topic} className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                    <p className="text-xs font-bold text-amber-400">{imp.topic}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{imp.suggestion}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('courses')}
                className="w-full mt-2 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Ver Cursos y Guías de Apoyo
              </button>
            </div>
          </div>

          {/* Competency Radar Chart */}
          <div className="p-6 sm:p-8 rounded-3xl glass border border-border/60">
            <h3 className="font-display font-semibold text-foreground mb-1 text-sm sm:text-base">
              Radar de Competencias CNSC
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Alineación y dominio por cada eje evaluado por el Ministerio de Educación Nacional
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  />
                  <Radar
                    dataKey="A"
                    stroke="#1a56db"
                    fill="#1a56db"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setPhase('intro')
                setCurrent(0)
                setSelected(Array(questions.length).fill(null))
                setFlagged(Array(questions.length).fill(false))
                setTimeLeft(3600)
                setAnswered(false)
                setSessionXp(0)
                setRetriedQuestions({})
                setShowHintForQuestion({})
                setMentorMood('thinking')
              }}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl glass border border-border hover:border-primary/30 text-foreground font-semibold text-sm transition-all btn-magnetic"
            >
              <RotateCcw className="w-4 h-4" />
              Repetir simulacro
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-sm shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all btn-magnetic"
            >
              <Home className="w-4 h-4" />
              Volver al Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const q = questions[current] || questions[0]
  const sel = selected[current]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Exam header */}
      <header className="sticky top-0 z-20 glass border-b border-border/60">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Salir</span>
          </button>

          <div className="flex-1 max-w-sm">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full progress-bar rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              {current + 1} / {questions.length}
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm transition-all ${
              isRed
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                : 'border-border/60 bg-muted text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Celebration burst */}
      <CelebrationParticles trigger={showParticles} onComplete={() => setShowParticles(false)} />

      {/* Question Container */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 py-8">
        {/* AI Mentor Companion Bar */}
        <div className="mb-6">
          <AIMentor
            mood={mentorMood}
            variant="inline"
            message={
              !answered
                ? retriedQuestions[current]
                  ? '¡Gran actitud! Revisa las opciones con calma teniendo presente la pista pedagógica.'
                  : 'Analiza la situación contextual. ¿Cuál opción prioriza el aprendizaje activo y la convivencia armónica?'
                : sel === q.correct
                  ? retriedQuestions[current]
                    ? '¡Bravo! Lograste la respuesta correcta en tu segundo intento. ¡Eso demuestra tu capacidad reflexiva y resiliencia pedagógica!'
                    : '¡Magistral! Tu análisis es acertado y se alinea plenamente con los lineamientos del MEN.'
                  : '¡Tranquilo(a), no pasa nada! Equivocarse es el punto de partida del aprendizaje significativo. Lee la retroalimentación y reintenta.'
            }
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                {q.competency}
              </span>
              <button
                onClick={() => {
                  const f = [...flagged]
                  f[current] = !f[current]
                  setFlagged(f)
                }}
                className={`p-2 rounded-lg transition-colors ${
                  flagged[current]
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            <div className="p-7 sm:p-8 rounded-3xl glass border border-border/60 mb-6">
              <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
                {q.text}
              </p>
            </div>

            {/* Hint if retrying */}
            {showHintForQuestion[current] && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-300"
              >
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold block text-amber-400">Pista Pedagógica Orientadora:</span>
                  <span>
                    En el marco del Decreto 1278 y 1290, se privilegian las acciones formativas, concertadas y dialógicas por encima de sanciones punitivas o enfoques meramente memorísticos.
                  </span>
                </div>
              </motion.div>
            )}

            <div className="space-y-3 mb-6">
              {q.options.map((opt, i) => {
                const isSelected = sel === i
                const isCorrect = i === q.correct

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => selectAnswer(i)}
                    disabled={answered}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-300 ${
                      !answered
                        ? 'border-border/60 bg-card/80 hover:border-primary/40 hover:bg-primary/8 cursor-pointer text-foreground'
                        : isCorrect
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-foreground'
                          : isSelected && !isCorrect
                            ? 'border-rose-500/50 bg-rose-500/10 text-foreground'
                            : 'border-border/30 bg-card/40 text-muted-foreground opacity-70'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                        !answered
                          ? 'bg-muted text-muted-foreground'
                          : isCorrect
                            ? 'bg-emerald-500 text-white'
                            : isSelected
                              ? 'bg-rose-500 text-white'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {answered ? (
                        isCorrect ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + i)
                        )
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Retroalimentación Pedagógica Personalizada */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  {sel === q.correct ? (
                    /* Acierto */
                    <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-400">
                            ¡Respuesta Correcta! {retriedQuestions[current] ? '🏆 Superado al Reintentar' : '🎉'}
                          </span>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          +{retriedQuestions[current] ? 15 : 25} XP
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed pt-1">
                        {q.explanation}
                      </p>
                    </div>
                  ) : (
                    /* Error pedagógico constructivo y reintento */
                    <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-500/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                          <Brain className="w-5 h-5 text-violet-400" />
                          <span>Oportunidad de Aprendizaje Reflexivo</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                          +5 XP por perseverancia
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        ¡Tranquilo(a), no pasa nada! No hay respuestas fallidas sino momentos formativos.
                        <br />
                        <span className="text-foreground font-medium">{q.explanation}</span>
                      </p>

                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                        <button
                          onClick={handleRetryQuestion}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Ver pista y reintentar pregunta
                        </button>
                        <span className="text-[11px] text-muted-foreground">
                          Aprender de los errores fortalece tu memoria a largo plazo.
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-auto">
              <button
                onClick={goPrev}
                disabled={current === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl glass border border-border/60 hover:border-primary/30 text-foreground text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-magnetic"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="hidden sm:flex items-center gap-2">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrent(i)
                      setAnswered(selected[i] !== null)
                    }}
                    className={`transition-all ${
                      i === current
                        ? 'w-6 h-2.5 rounded-full bg-primary'
                        : selected[i] !== null
                          ? 'w-2.5 h-2.5 rounded-full bg-primary/40'
                          : 'w-2.5 h-2.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all btn-magnetic"
              >
                {current === questions.length - 1 ? 'Ver resultados' : 'Siguiente'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
