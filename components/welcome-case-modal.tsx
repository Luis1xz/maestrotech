'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Zap,
  HelpCircle,
} from 'lucide-react'
import AIMentor, { MentorMood } from '@/components/ai-mentor'
import CelebrationParticles from '@/components/celebration-particles'
import { recordWelcomeCaseCompleted } from '@/services/gamification'

const WELCOME_STORAGE_KEY = 'maestrotech_welcome_case_v1'

interface WelcomeCaseModalProps {
  onContinue: () => void
  forceOpen?: boolean
  onClose?: () => void
}

const WELCOME_CASE = {
  id: 'case_bienvenida_1',
  missionTitle: 'Misión Pedagógica de Bienvenida',
  contextBadge: 'Caso Situacional Real · Aula y Convivencia',
  situation:
    'Estás a cargo de un grado 9° en una institución educativa. Camilo, un estudiante con gran potencial de liderazgo en talleres grupales, ha dejado de entregar tareas individuales durante las últimas 3 semanas y muestra desinterés cuando se trabaja en clase magistral.',
  question:
    'De acuerdo con el enfoque de evaluación formativa del Ministerio de Educación Nacional (Decreto 1290) y el modelo constructivista, ¿cuál es la primera acción pedagógica acertada que debes emprender?',
  options: [
    {
      id: 'A',
      text: 'Citar inmediatamente a su acudiente y registrar una falta disciplinaria en el observador escolar por bajo rendimiento.',
      isCorrect: false,
      feedback:
        'Sancionar o judicializar el desinterés suele generar mayor distanciamiento. En la pedagogía actual, primero indagamos las causas pedagógicas y emocionales antes de escalar a procesos disciplinarios.',
      hint: 'Busca la opción que dialogue con el estudiante para adaptar la estrategia pedagógica a su estilo de aprendizaje.',
    },
    {
      id: 'B',
      text: 'Dialogar en privado con Camilo para conocer sus motivaciones, vincular sus tareas con proyectos prácticos y acordar metas de aprendizaje concertadas.',
      isCorrect: true,
      feedback:
        '¡Magistral! La evaluación formativa (Decreto 1290) se centra en la autorregulación y el diálogo. Al aprovechar su liderazgo práctico para resignificar las tareas individuales, garantizas un aprendizaje significativo y previenes la deserción escolar.',
      hint: '',
    },
    {
      id: 'C',
      text: 'Eximir a Camilo de entregar tareas individuales para evitarle frustración, permitiéndole solo trabajar en proyectos grupales.',
      isCorrect: false,
      feedback:
        'Aunque adaptar el currículo es valioso, eximirlo sin un plan de nivelación no desarrolla su autonomía ni sus competencias individuales requeridas por los estándares del MEN.',
      hint: 'El objetivo formativo es potenciar su autonomía individual apoyándonos en su fortaleza de liderazgo grupal.',
    },
    {
      id: 'D',
      text: 'Asignarle el doble de guías teóricas para que las desarrolle en casa y compense las notas pendientes del periodo.',
      isCorrect: false,
      feedback:
        'Sobrecargar de guías teóricas a un estudiante que rechaza la metodología magistral solo incrementará su rechazo y el riesgo de deserción.',
      hint: 'Recuerda que la cantidad de tareas no garantiza calidad en el aprendizaje constructivista.',
    },
  ],
}

export default function WelcomeCaseModal({
  onContinue,
  forceOpen = false,
  onClose,
}: WelcomeCaseModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [badgeAwarded, setBadgeAwarded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const completed = window.localStorage.getItem(WELCOME_STORAGE_KEY)
    if (!completed || forceOpen) {
      setIsOpen(true)
    }
  }, [forceOpen])

  if (!isOpen) return null

  const chosen = WELCOME_CASE.options.find((o) => o.id === selectedOption)
  const isCorrect = chosen?.isCorrect ?? false

  const handleSelect = (optionId: string) => {
    if (answered) return
    setSelectedOption(optionId)
    setAnswered(true)

    const opt = WELCOME_CASE.options.find((o) => o.id === optionId)
    if (opt?.isCorrect) {
      setShowCelebration(true)
      setBadgeAwarded(true)
      recordWelcomeCaseCompleted()
    }
  }

  const handleRetry = () => {
    setSelectedOption(null)
    setAnswered(false)
    setShowCelebration(false)
  }

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(WELCOME_STORAGE_KEY, 'true')
    }
    setIsOpen(false)
    onClose?.()
    onContinue()
  }

  // Determine Mentor Mood & Speech
  let mentorMood: MentorMood = 'thinking'
  let mentorSpeech = '¡Bienvenido colega! Ponte en el rol de docente y resuelve este caso situacional. ¡Confío en tu criterio pedagógico!'

  if (answered) {
    if (isCorrect) {
      mentorMood = 'celebrating'
      mentorSpeech = '¡Felicidades! 🎉 Tu respuesta es correcta. ¡Vas por muy buen camino! Demuestras una gran sensibilidad pedagógica alineada con los estándares del MEN.'
    } else {
      mentorMood = 'empathic'
      mentorSpeech = '¡Tranquilo, no pasa nada! 💜 Equivocarse también hace parte del aprendizaje. Lo importante es comprender el porqué y seguir avanzando. ¿Revisamos la pista y lo intentas de nuevo?'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-2xl rounded-3xl bg-white border border-[#E5EDF5] shadow-2xl p-6 sm:p-8 overflow-hidden my-auto text-[#142D49]"
      >
        {showCelebration && <CelebrationParticles count={36} />}

        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#176FC1]/10 text-[#176FC1] border border-[#176FC1]/20 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#39BDEB]" />
            {WELCOME_CASE.missionTitle}
          </div>

          <span className="text-[11px] text-[#536B83] font-semibold">
            Reto de 1 minuto · Sin registros previos
          </span>
        </div>

        {/* AI Mentor Banner */}
        <div className="mb-5">
          <AIMentor
            mood={mentorMood}
            message={mentorSpeech}
            speechTitle="Mentor Pedagógico IA"
            size="md"
          />
        </div>

        {/* Context Case Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] mb-5 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#176FC1]">
            {WELCOME_CASE.contextBadge}
          </span>
          <p className="text-xs sm:text-sm text-[#142D49] leading-relaxed font-normal">
            {WELCOME_CASE.situation}
          </p>
          <p className="text-xs sm:text-sm font-bold text-[#142D49] pt-1.5 border-t border-[#E5EDF5]">
            {WELCOME_CASE.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5 mb-5">
          {WELCOME_CASE.options.map((opt) => {
            const isSelected = selectedOption === opt.id
            let buttonStyle = 'border-[#E5EDF5] bg-white hover:border-[#176FC1]/50 hover:bg-[#F3F8FD] text-[#142D49]'

            if (answered) {
              if (opt.isCorrect) {
                buttonStyle = 'border-[#176FC1] bg-[#176FC1]/10 text-[#142D49] font-semibold ring-1 ring-[#176FC1]/30'
              } else if (isSelected && !opt.isCorrect) {
                buttonStyle = 'border-rose-400 bg-rose-50 text-[#142D49] ring-1 ring-rose-300'
              } else {
                buttonStyle = 'border-[#E5EDF5] bg-gray-50/50 text-[#536B83] opacity-60'
              }
            }

            return (
              <motion.button
                key={opt.id}
                whileTap={!answered ? { scale: 0.99 } : {}}
                onClick={() => handleSelect(opt.id)}
                disabled={answered}
                className={`w-full flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm transition-all duration-200 ${buttonStyle}`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                    answered
                      ? opt.isCorrect
                        ? 'bg-[#176FC1] text-white'
                        : isSelected
                        ? 'bg-rose-500 text-white'
                        : 'bg-[#F3F8FD] text-[#536B83] border border-[#E5EDF5]'
                      : 'bg-[#F3F8FD] text-[#142D49] border border-[#E5EDF5]'
                  }`}
                >
                  {answered ? (
                    opt.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isSelected ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      opt.id
                    )
                  ) : (
                    opt.id
                  )}
                </span>
                <span className="flex-1 leading-snug pt-0.5">{opt.text}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Pedagogical Explanation when answered */}
        <AnimatePresence>
          {answered && chosen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                  isCorrect
                    ? 'bg-[#176FC1]/10 border-[#176FC1]/30 text-[#142D49]'
                    : 'bg-[#F3F8FD] border-[#E5EDF5] text-[#142D49]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-[#142D49]">
                  <BookOpen className="w-4 h-4 text-[#176FC1] shrink-0" />
                  <span>
                    {isCorrect ? 'Explicación Pedagógica del Acierto:' : 'Oportunidad de Reflexión Pedagógica:'}
                  </span>
                </div>
                <p className="text-[#142D49] leading-relaxed">{chosen.feedback}</p>

                {!isCorrect && chosen.hint && (
                  <div className="pt-2 border-t border-[#E5EDF5] text-[#176FC1] font-semibold">
                    💡 <strong>Pista de Maestro Leo:</strong> {chosen.hint}
                  </div>
                )}

                {badgeAwarded && (
                  <div className="pt-2 border-t border-[#176FC1]/20 flex items-center gap-2 text-[#E9A83A] font-bold">
                    <Award className="w-4 h-4" />
                    <span>¡Insignia Desbloqueada: &quot;Pionero del Aprendizaje&quot; (+50 XP)!</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#E5EDF5]">
          {answered && !isCorrect ? (
            <button
              onClick={handleRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5EDF5] hover:bg-[#F3F8FD] text-xs font-semibold text-[#142D49] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#176FC1]" />
              Reintentar con la pista
            </button>
          ) : (
            <div className="text-[11px] text-[#536B83] font-medium hidden sm:block">
              {answered
                ? '¡Listo para tu viaje formativo!'
                : 'Selecciona una opción para experimentar la retroalimentación'}
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleFinish}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all ${
                answered
                  ? 'bg-[#176FC1] hover:bg-[#142D49] text-white'
                  : 'bg-[#F3F8FD] border border-[#E5EDF5] text-[#142D49] hover:bg-[#E5EDF5]'
              }`}
            >
              {answered ? (
                <>
                  Descubre tu potencial y continúa aprendiendo <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                'Explorar la plataforma primero'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
