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
  X,
} from 'lucide-react'
import CelebrationParticles from '@/components/celebration-particles'
import { recordWelcomeCaseCompleted } from '@/services/gamification'

const WELCOME_STORAGE_KEY = 'legadodocente_welcome_case_v2'

interface WelcomeCaseModalProps {
  onContinue: () => void
  forceOpen?: boolean
  onClose?: () => void
}

const WELCOME_CASE = {
  id: 'case_bienvenida_1',
  eyebrow: 'PON A PRUEBA LO QUE SABES',
  title: '¿Cuánto sabes del concurso docente?',
  cardEyebrow: 'PREGUNTA 1 DE 10',
  question: '¿Por dónde se publican oficialmente las citaciones y resultados del concurso?',
  options: [
    {
      id: 'A',
      text: 'Grupos de WhatsApp de docentes',
      isCorrect: false,
      feedback: 'Los grupos de WhatsApp no constituyen un canal oficial ni tienen validez jurídica de notificación estatal.',
    },
    {
      id: 'B',
      text: 'SIMO y www.cnsc.gov.co',
      isCorrect: true,
      feedback: '¡Exacto! El portal de la CNSC y el Sistema de Apoyo para la Igualdad, el Mérito y la Oportunidad (SIMO) son los únicos medios legales donde se publican las citaciones y resultados oficiales.',
    },
    {
      id: 'C',
      text: 'Las redes sociales de la CNSC',
      isCorrect: false,
      feedback: 'Las redes sociales son solo de divulgación general pero no son canales formales para fijar términos de citación o listas de elegibles.',
    },
    {
      id: 'D',
      text: 'El correo de la secretaría de educación',
      isCorrect: false,
      feedback: 'Las secretarías certifican vacantes pero el concurso de mérito es administrado centralmente por la CNSC.',
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
      recordWelcomeCaseCompleted()
    }
  }

  const handleRetry = () => {
    setSelectedOption(null)
    setAnswered(false)
    setShowCelebration(false)
  }

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(WELCOME_STORAGE_KEY, 'true')
    }
    setIsOpen(false)
    onClose?.()
  }

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(WELCOME_STORAGE_KEY, 'true')
    }
    setIsOpen(false)
    onClose?.()
    onContinue()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
      {/* Modal Container con fondo Azul Rey (#0038DF) y degradado radial hacia #002299 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="relative w-full max-w-lg rounded-3xl bg-royal-depth text-white shadow-2xl overflow-hidden my-auto border border-[#0038DF]"
      >
        {/* Barra superior de acento oro metálico */}
        <div className="w-full h-2 bg-gradient-to-r from-[#9C7316] via-[#E6C565] to-[#8F6812]" />

        {/* Botón de cerrar discreto */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Aros geométricos dorados grandes de fondo (border: 12px solid #C99E32) */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ border: '12px solid #C99E32', opacity: 0.85 }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ border: '12px solid #C99E32', opacity: 0.75 }}
        />

        {showCelebration && <CelebrationParticles count={40} />}

        <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center text-center">
          
          {/* Logo Legado Docente */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 shrink-0">
              <img src="/logo-icon.png" alt="Legado Docente" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-sm tracking-wider uppercase text-white font-display">
              LEGADO DOCENTE
            </span>
          </div>

          {/* Eyebrow en Dorado Claro (#E6C565) en mayúsculas con espaciado amplio */}
          <span className="eyebrow-blue mb-2">
            {WELCOME_CASE.eyebrow}
          </span>

          {/* Título Principal en Blanco Puro (#FFFFFF) Extra-Bold 800 */}
          <h2 className="title-h1 text-3xl sm:text-4xl font-extrabold text-white mb-6">
            {WELCOME_CASE.title}
          </h2>

          {/* Tarjeta Contenedora Blanca con Borde Fino Dorado de 2px (Card Style Quiz) */}
          <div className="card-gold-on-blue w-full p-5 sm:p-6 text-left mb-6 relative">
            
            {/* Subtítulo interior en dorado ocre (#9C7316) */}
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#9C7316] mb-2">
              {WELCOME_CASE.cardEyebrow}
            </span>

            {/* Pregunta en Azul Rey (#0038DF) */}
            <h3 className="text-base sm:text-lg font-bold text-[#0038DF] leading-snug mb-4">
              {WELCOME_CASE.question}
            </h3>

            {/* Lista de Botones de Selección Estilo Quiz */}
            <div className="space-y-2.5">
              {WELCOME_CASE.options.map((opt) => {
                const isSelected = selectedOption === opt.id

                let stateClasses = 'quiz-option-btn'
                let letterClasses = 'bg-[#F1F5F9] text-[#0038DF]'

                if (answered) {
                  if (opt.isCorrect) {
                    stateClasses = 'bg-[#ECFDF5] border-2 border-emerald-500 shadow-sm'
                    letterClasses = 'bg-emerald-600 text-white'
                  } else if (isSelected && !opt.isCorrect) {
                    stateClasses = 'bg-rose-50 border-2 border-rose-400'
                    letterClasses = 'bg-rose-600 text-white'
                  } else {
                    stateClasses = 'bg-gray-50 border border-gray-200 opacity-60'
                    letterClasses = 'bg-gray-200 text-gray-500'
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    disabled={answered}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-xl text-left transition-all ${stateClasses} cursor-pointer`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${letterClasses}`}>
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
                    <span className="text-xs sm:text-sm font-semibold text-[#1E293B] leading-tight">
                      {opt.text}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Retroalimentación formativa si respondió */}
            <AnimatePresence>
              {answered && chosen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-[#E2E8F0] overflow-hidden"
                >
                  <div className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                    isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isCorrect ? '¡Respuesta Correcta!' : 'Ten en cuenta:'}</span>
                    </div>
                    <p>{chosen.feedback}</p>
                    {!isCorrect && (
                      <button
                        onClick={handleRetry}
                        className="mt-2 inline-flex items-center gap-1 font-bold text-[#0038DF] hover:underline"
                      >
                        <RotateCcw className="w-3 h-3" /> Intentar de nuevo
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Subtítulo bajo la tarjeta en blanco */}
          <p className="text-sm font-medium text-white/95 mb-4">
            Responde las 10 en nuestro diagnóstico gratuito
          </p>

          {/* Botón CTA Oro Metálico en Píldora (border-radius: 9999px) */}
          <button
            onClick={handleFinish}
            className="btn-gold-cta btn-gold-pill px-8 py-3.5 text-sm sm:text-base font-bold text-[#1A1A1A] cursor-pointer inline-flex items-center justify-center gap-2 mb-4"
          >
            <span>Toca el enlace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Slogan institucional en cursiva dorada */}
          <p className="text-xs italic text-[#E6C565] font-medium tracking-wide">
            Aprende, comparte, deja huella
          </p>

        </div>
      </motion.div>
    </div>
  )
}
