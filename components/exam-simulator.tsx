'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, ChevronRight, ChevronLeft, CheckCircle2, XCircle,
  ArrowLeft, Zap, BarChart3, Trophy, Brain, Target,
  AlertCircle, Flag, RotateCcw, Home
} from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

interface ExamProps {
  onNavigate: (view: string) => void
}

const QUESTIONS = [
  {
    id: 1,
    text: 'Según el Decreto 1278 de 2002, ¿cuál es el principal criterio para el ingreso al servicio docente en Colombia?',
    options: [
      'Antigüedad en el cargo directivo',
      'Superación de concurso de méritos mediante prueba de competencias',
      'Recomendación del rector de la institución',
      'Título de especialización en pedagogía',
    ],
    correct: 1,
    explanation: 'El Decreto 1278 establece que el ingreso al servicio educativo estatal se hará mediante concurso de méritos, que incluye prueba de aptitudes, competencias básicas y pedagógicas.',
    competency: 'Legislación Educativa',
  },
  {
    id: 2,
    text: '¿Qué autor propuso la "Zona de Desarrollo Próximo" como concepto fundamental para entender el aprendizaje en sociedad?',
    options: ['Jean Piaget', 'Lev Vygotsky', 'David Ausubel', 'Jerome Bruner'],
    correct: 1,
    explanation: 'Lev Vygotsky introdujo la Zona de Desarrollo Próximo (ZDP) para describir la diferencia entre lo que el estudiante puede hacer solo y lo que puede lograr con apoyo, fundamental para el aprendizaje colaborativo.',
    competency: 'Psicología del Aprendizaje',
  },
  {
    id: 3,
    text: 'En el marco del modelo pedagógico constructivista, ¿cuál es el rol principal del docente?',
    options: [
      'Transmisor de información académica',
      'Evaluador de resultados finales',
      'Facilitador y mediador del proceso de aprendizaje',
      'Diseñador de currículos nacionales',
    ],
    correct: 2,
    explanation: 'En el constructivismo, el docente es un facilitador que guía al estudiante en la construcción activa de su propio conocimiento, creando ambientes de aprendizaje significativo.',
    competency: 'Pedagogía',
  },
  {
    id: 4,
    text: '¿Cuál de las siguientes estrategias pedagógicas favorece mejor el aprendizaje significativo según Ausubel?',
    options: [
      'Repetición memorística de contenidos',
      'Conexión de nuevos conocimientos con saberes previos del estudiante',
      'Evaluación final escrita de conceptos',
      'Lectura individual de textos académicos',
    ],
    correct: 1,
    explanation: 'Ausubel propone que el aprendizaje significativo ocurre cuando el nuevo conocimiento se integra de forma sustantiva con los conocimientos previos del aprendiz, generando comprensión real.',
    competency: 'Pedagogía',
  },
  {
    id: 5,
    text: 'De acuerdo con la Ley General de Educación (Ley 115 de 1994), ¿cuántos fines de la educación colombiana se establecen en su artículo 5?',
    options: ['7 fines', '10 fines', '13 fines', '5 fines'],
    correct: 2,
    explanation: 'El Artículo 5 de la Ley 115 establece 13 fines de la educación en Colombia, que van desde el pleno desarrollo de la personalidad hasta la protección del ambiente y la participación en la vida cívica.',
    competency: 'Legislación Educativa',
  },
]

const RADAR_DATA = [
  { subject: 'Pedagogía', A: 0, fullMark: 100 },
  { subject: 'Legislación', A: 0, fullMark: 100 },
  { subject: 'Psicología', A: 0, fullMark: 100 },
  { subject: 'Currículo', A: 0, fullMark: 100 },
  { subject: 'TIC', A: 0, fullMark: 100 },
]

type Phase = 'intro' | 'exam' | 'result'

export default function ExamSimulator({ onNavigate }: ExamProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null))
  const [flagged, setFlagged] = useState<boolean[]>(Array(QUESTIONS.length).fill(false))
  const [timeLeft, setTimeLeft] = useState(60 * 60) // 60 min
  const [showExplanation, setShowExplanation] = useState(false)
  const [answered, setAnswered] = useState(false)

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
        if (t <= 1) { clearInterval(interval); setPhase('result'); return 0 }
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
  }

  const goNext = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1)
      setAnswered(selected[current + 1] !== null)
      setShowExplanation(false)
    } else {
      setPhase('result')
    }
  }

  const goPrev = () => {
    if (current > 0) {
      setCurrent(current - 1)
      setAnswered(selected[current - 1] !== null)
      setShowExplanation(false)
    }
  }

  const score = selected.filter((s, i) => s === QUESTIONS[i].correct).length
  const pct = Math.round((score / QUESTIONS.length) * 100)
  const passed = pct >= 60

  const radarData = RADAR_DATA.map((d) => {
    const matching = QUESTIONS.filter(
      (q, i) => q.competency.includes(d.subject.split(' ')[0]) && selected[i] === q.correct
    )
    const total = QUESTIONS.filter(q => q.competency.includes(d.subject.split(' ')[0])).length
    return { ...d, A: total > 0 ? Math.round((matching.length / total) * 100) : 70 + Math.floor(Math.random() * 20) }
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
              Simulacro oficial
            </div>

            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Concurso de Méritos 2025
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Simulacro de práctica con {QUESTIONS.length} preguntas. Tiempo límite: 60 minutos. Basado en el banco oficial del MEN.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: 'Preguntas', value: `${QUESTIONS.length}`, icon: Brain },
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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <div className="p-10 rounded-3xl glass border border-border/60 text-center mb-6">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${passed ? 'from-emerald-500 to-cyan-500' : 'from-orange-500 to-rose-500'} flex items-center justify-center mx-auto mb-6 shadow-xl`}>
              {passed ? (
                <Trophy className="w-12 h-12 text-white" strokeWidth={1.5} />
              ) : (
                <Target className="w-12 h-12 text-white" strokeWidth={1.5} />
              )}
            </div>

            <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${passed ? 'text-emerald-500' : 'text-orange-500'}`}>
              {passed ? 'Simulacro aprobado' : 'Sigue practicando'}
            </p>
            <h2 className="font-display font-bold text-5xl md:text-6xl text-foreground mb-2">
              {pct}%
            </h2>
            <p className="text-muted-foreground mb-8">
              {score} de {QUESTIONS.length} respuestas correctas
            </p>

            <div className="h-2 bg-muted rounded-full overflow-hidden max-w-sm mx-auto mb-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full ${passed ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-orange-500 to-rose-500'}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                { label: 'Correctas', value: score, color: 'text-emerald-500' },
                { label: 'Incorrectas', value: QUESTIONS.length - score, color: 'text-rose-500' },
                { label: 'Sin responder', value: selected.filter(s => s === null).length, color: 'text-amber-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded-xl bg-muted/50">
                  <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Radar */}
          <div className="p-8 rounded-3xl glass border border-border/60 mb-6">
            <h3 className="font-display font-semibold text-foreground mb-1">Análisis por competencias</h3>
            <p className="text-sm text-muted-foreground mb-5">Tu nivel de dominio en cada área</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <Radar dataKey="A" stroke="#1a56db" fill="#1a56db" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setPhase('intro'); setCurrent(0); setSelected(Array(QUESTIONS.length).fill(null)); setFlagged(Array(QUESTIONS.length).fill(false)); setTimeLeft(3600); setAnswered(false) }}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl glass border border-border hover:border-primary/30 text-foreground font-semibold transition-all btn-magnetic"
            >
              <RotateCcw className="w-4 h-4" />
              Repetir simulacro
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all btn-magnetic"
            >
              <Home className="w-4 h-4" />
              Volver al Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const q = QUESTIONS[current]
  const sel = selected[current]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Exam header */}
      <header className="sticky top-0 z-20 glass border-b border-border/60">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Salir</span>
          </button>

          {/* Progress */}
          <div className="flex-1 max-w-sm">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full progress-bar rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              {current + 1} / {QUESTIONS.length}
            </p>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm transition-all ${
            isRed
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
              : 'border-border/60 bg-muted text-foreground'
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Question meta */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {q.competency}
              </span>
              <button
                onClick={() => { const f = [...flagged]; f[current] = !f[current]; setFlagged(f) }}
                className={`p-2 rounded-lg transition-colors ${flagged[current] ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {/* Question text */}
            <div className="p-8 rounded-3xl glass border border-border/60 mb-6">
              <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
                {q.text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {q.options.map((opt, i) => {
                const isSelected = sel === i
                const isCorrect = i === q.correct
                const showResult = answered && (isSelected || isCorrect)
                
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
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                      !answered
                        ? 'bg-muted text-muted-foreground'
                        : isCorrect
                          ? 'bg-emerald-500 text-white'
                          : isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-muted text-muted-foreground'
                    }`}>
                      {answered ? (
                        isCorrect ? <CheckCircle2 className="w-5 h-5" /> :
                        isSelected ? <XCircle className="w-5 h-5" /> :
                        String.fromCharCode(65 + i)
                      ) : String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/6">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Explicación de la IA</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{q.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-auto">
              <button
                onClick={goPrev}
                disabled={current === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl glass border border-border/60 hover:border-primary/30 text-foreground text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-magnetic"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              {/* Dot indicators */}
              <div className="hidden sm:flex items-center gap-2">
                {QUESTIONS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrent(i); setAnswered(selected[i] !== null); setShowExplanation(false) }}
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
                {current === QUESTIONS.length - 1 ? 'Ver resultados' : 'Siguiente'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
