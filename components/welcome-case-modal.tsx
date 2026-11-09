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
  missionTitle: 'Pon a prueba lo que sabes',
  contextBadge: '¿Cuánto sabes del concurso docente? · Pregunta 1 de 10',
  situation:
    'El Concurso de Méritos Docente en Colombia se rige por normas estrictas de publicidad, mérito e igualdad establecidas en el Decreto Ley 1278 de 2002 y la Ley 909 de 2004.',
  question:
    '¿Por dónde se publican oficialmente las citaciones a pruebas y los resultados definitivos del concurso docente en Colombia?',
  options: [
    {
      id: 'A',
      text: 'Grupos de WhatsApp de docentes y sindicatos.',
      isCorrect: false,
      feedback:
        'Aunque en redes y grupos circula información rápida, no constituyen canales legales ni oficiales de notificación del Estado.',
      hint: 'Recuerda que la CNSC tiene una plataforma digital obligatoria para todos los procesos de mérito.',
    },
    {
      id: 'B',
      text: 'SIMO (Sistema de Apoyo para la Igualdad, el Mérito y la Oportunidad) y www.cnsc.gov.co',
      isCorrect: true,
      feedback:
        '¡Felicidades! 🎉 Tu respuesta es 100% correcta. El portal oficial de la Comisión Nacional del Servicio Civil (CNSC) y el aplicativo SIMO son los únicos medios legales donde se publican las citaciones y listas de elegibles oficiales.',
      hint: '',
    },
    {
      id: 'C',
      text: 'Las redes sociales no oficiales de la CNSC.',
      isCorrect: false,
      feedback:
        'Las redes sociales son informativas pero no tienen validez jurídica para fijar términos de reclamaciones o citaciones a exámenes.',
      hint: 'Busca el aplicativo web oficial donde inscribes tu hoja de vida.',
    },
    {
      id: 'D',
      text: 'El correo personal de la secretaría de educación de tu municipio.',
      isCorrect: false,
      feedback:
        'Las secretarías certifican vacantes, pero la administración del concurso de ingreso la realiza directamente la CNSC a nivel nacional.',
      hint: 'La entidad rectora del concurso es la CNSC a través de su plataforma nacional.',
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

          <div className="flex flex-col items-center sm:items-end w-full sm:w-auto gap-1">
            <button
              onClick={handleFinish}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer ${
                answered
                  ? 'bg-gradient-to-r from-[#E5A83B] to-[#D4AF37] hover:from-[#D49E30] hover:to-[#C49126] text-[#142D49]'
                  : 'bg-[#0045E6] hover:bg-[#142D49] text-white'
              }`}
            >
              {answered ? (
                <>
                  <span>Toca el enlace y continúa aprendiendo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                'Explorar Legado Docente'
              )}
            </button>
            <span className="text-[10px] text-[#536B83] italic tracking-tight">
              Aprende, comparte, deja huella
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
