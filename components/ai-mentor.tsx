'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Trophy, Lightbulb, MessageCircle, Volume2, X } from 'lucide-react'

export type MentorMood = 'greeting' | 'happy' | 'celebrating' | 'empathic' | 'thinking' | 'encouraging'

interface AIMentorProps {
  mood?: MentorMood
  message?: string
  speechTitle?: string
  hintText?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'card' | 'inline' | 'floating' | 'bubble-only'
  showVoiceButton?: boolean
  onActionClick?: () => void
  actionLabel?: string
  onClose?: () => void
}

const MOOD_DATA: Record<
  MentorMood,
  {
    badgeText: string
    badgeBg: string
    badgeColor: string
    defaultMessage: string
    eyeAnimation: string
    avatarGlow: string
  }
> = {
  greeting: {
    badgeText: 'Mentor Pedagógico IA',
    badgeBg: 'bg-[#176FC1]/10 border-[#176FC1]/20',
    badgeColor: 'text-[#176FC1]',
    defaultMessage: '¡Hola, colega docente! Estoy aquí para acompañarte paso a paso hacia tu nombramiento o ascenso.',
    eyeAnimation: 'scaleY(1)',
    avatarGlow: 'from-[#176FC1]/20 to-[#39BDEB]/20',
  },
  happy: {
    badgeText: '¡Gran Trabajo!',
    badgeBg: 'bg-[#176FC1]/10 border-[#176FC1]/25',
    badgeColor: 'text-[#176FC1]',
    defaultMessage: '¡Excelente razonamiento! Has aplicado el enfoque de competencias tal como lo evalúa el MEN.',
    eyeAnimation: 'scaleY(0.9)',
    avatarGlow: 'from-[#176FC1]/20 to-[#39BDEB]/20',
  },
  celebrating: {
    badgeText: '¡Acierto Magistral! 🎉',
    badgeBg: 'bg-[#E9A83A]/15 border-[#E9A83A]/30',
    badgeColor: 'text-[#142D49]',
    defaultMessage: '¡Brillante! Tu respuesta demuestra alta madurez pedagógica. ¡Vamos sumando confianza para la prueba real!',
    eyeAnimation: 'scaleY(0.7)',
    avatarGlow: 'from-[#E9A83A]/30 to-[#176FC1]/30',
  },
  empathic: {
    badgeText: 'Aprendizaje en Progreso 💡',
    badgeBg: 'bg-[#39BDEB]/15 border-[#39BDEB]/30',
    badgeColor: 'text-[#142D49]',
    defaultMessage: '¡Tranquilo profe, no pasa nada! Cada equivocación en la práctica es un acierto asegurado el día del examen. ¿Analizamos la pista juntos?',
    eyeAnimation: 'scaleY(0.95)',
    avatarGlow: 'from-[#39BDEB]/20 to-[#176FC1]/20',
  },
  thinking: {
    badgeText: 'Analizando Caso...',
    badgeBg: 'bg-[#F3F8FD] border-[#E5EDF5]',
    badgeColor: 'text-[#176FC1]',
    defaultMessage: 'Observa bien las opciones. En el concurso docente, siempre priorizamos la mediación dialógica sobre la sanción.',
    eyeAnimation: 'scaleY(1.05)',
    avatarGlow: 'from-[#39BDEB]/20 to-[#176FC1]/20',
  },
  encouraging: {
    badgeText: '¡Tú Puedes!',
    badgeBg: 'bg-[#176FC1]/10 border-[#176FC1]/25',
    badgeColor: 'text-[#176FC1]',
    defaultMessage: 'Tu vocación y persistencia son tu mayor fortaleza. ¡Sigue adelante, cada intento te acerca a tu meta!',
    eyeAnimation: 'scaleY(1)',
    avatarGlow: 'from-[#176FC1]/20 to-[#39BDEB]/20',
  },
}

export default function AIMentor({
  mood = 'greeting',
  message,
  speechTitle,
  hintText,
  hint,
  size = 'md',
  variant = 'card',
  onActionClick,
  actionLabel,
  onClose,
}: AIMentorProps) {
  const [minimized, setMinimized] = useState(false)
  const currentMood = MOOD_DATA[mood] || MOOD_DATA.greeting
  const displayText = message || currentMood.defaultMessage
  const activeHint = hintText || hint

  const avatarSize = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'

  // Dynamic Avatar SVG with facial expressions
  const renderAvatarGraphic = () => (
    <div className={`relative ${avatarSize} shrink-0`}>
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: mood === 'celebrating' ? [0, -5, 5, 0] : [0, 0, 0],
        }}
        transition={{
          duration: mood === 'celebrating' ? 0.8 : 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`w-full h-full rounded-2xl bg-gradient-to-br from-[#176FC1] via-[#39BDEB] to-[#142D49] p-0.5 shadow-lg shadow-[#176FC1]/20 flex items-center justify-center`}
      >
        <div className="w-full h-full bg-[#142D49] rounded-[14px] flex flex-col items-center justify-center p-1 relative overflow-hidden">
          {/* Subtle glow inside head */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#176FC1]/30 to-transparent pointer-events-none" />

          {/* Teacher glasses / Academic accessory */}
          <div className="flex items-center gap-1.5 mb-1 z-10">
            <div className="w-2.5 h-2 rounded-full border border-[#39BDEB] bg-[#39BDEB]/20" />
            <div className="w-1.5 h-0.5 bg-[#39BDEB]" />
            <div className="w-2.5 h-2 rounded-full border border-[#39BDEB] bg-[#39BDEB]/20" />
          </div>

          {/* Eyes with emotion */}
          <div className="flex items-center gap-2 z-10">
            <motion.div
              animate={{
                scaleY: mood === 'celebrating' ? [0.3, 1, 0.3] : mood === 'empathic' ? [0.8, 1, 0.8] : [1, 0.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className={`w-1.5 h-2 rounded-full ${
                mood === 'celebrating'
                  ? 'bg-[#E9A83A]'
                  : mood === 'empathic'
                  ? 'bg-[#39BDEB]'
                  : 'bg-white'
              }`}
            />
            <motion.div
              animate={{
                scaleY: mood === 'celebrating' ? [0.3, 1, 0.3] : mood === 'empathic' ? [0.8, 1, 0.8] : [1, 0.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className={`w-1.5 h-2 rounded-full ${
                mood === 'celebrating'
                  ? 'bg-[#E9A83A]'
                  : mood === 'empathic'
                  ? 'bg-[#39BDEB]'
                  : 'bg-white'
              }`}
            />
          </div>

          {/* Smile / Mouth expression */}
          <div className="mt-1 z-10">
            {mood === 'celebrating' ? (
              <div className="w-3 h-1.5 rounded-b-full bg-[#E9A83A]" />
            ) : mood === 'happy' ? (
              <div className="w-2.5 h-1 rounded-b-full border-b-2 border-[#39BDEB]" />
            ) : mood === 'empathic' ? (
              <div className="w-2 h-1 rounded-b-full border-b border-violet-400" />
            ) : (
              <div className="w-2 h-0.5 bg-cyan-400/80 rounded-full" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Pulsing indicator icon */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-[9px] text-white shadow-sm">
        {mood === 'celebrating' ? (
          <Trophy className="w-2.5 h-2.5" />
        ) : mood === 'empathic' ? (
          <Heart className="w-2.5 h-2.5" />
        ) : (
          <Sparkles className="w-2.5 h-2.5" />
        )}
      </div>
    </div>
  )

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {!minimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="mb-3 max-w-sm w-80 p-4 rounded-2xl bg-white border border-[#E5EDF5] shadow-2xl relative text-[#142D49]"
            >
              <button
                onClick={() => setMinimized(true)}
                className="absolute top-2.5 right-2.5 text-[#536B83] hover:text-[#142D49] p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start gap-3">
                {renderAvatarGraphic()}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-bold text-[#142D49]">Mentor Pedagógico</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${currentMood.badgeBg} ${currentMood.badgeColor}`}>
                      {currentMood.badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-[#142D49] leading-relaxed">{displayText}</p>
                  {activeHint && (
                    <div className="mt-2 p-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-[11px] text-[#176FC1] flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#E9A83A]" />
                      <span>{activeHint}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setMinimized(!minimized)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#176FC1] hover:bg-[#142D49] text-white shadow-xl hover:scale-105 transition-all"
        >
          {renderAvatarGraphic()}
          <span className="text-xs font-bold">Mentor IA</span>
        </button>
      </div>
    )
  }

  // Variant: Card or Inline
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border ${
        mood === 'celebrating'
          ? 'border-[#E9A83A]/40 bg-gradient-to-br from-[#E9A83A]/8 via-white to-white'
          : mood === 'empathic'
          ? 'border-[#39BDEB]/40 bg-gradient-to-br from-[#39BDEB]/8 via-white to-white'
          : mood === 'happy'
          ? 'border-[#176FC1]/30 bg-gradient-to-br from-[#176FC1]/5 via-white to-white'
          : 'border-[#E5EDF5] bg-white'
      } p-4 sm:p-5 shadow-xs text-[#142D49]`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#536B83] hover:text-[#142D49] p-1 rounded-lg transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-3.5">
        {renderAvatarGraphic()}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-display font-bold text-xs sm:text-sm text-foreground">
              {speechTitle || 'Maestro Leo · Mentor con IA'}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${currentMood.badgeBg} ${currentMood.badgeColor}`}
            >
              {currentMood.badgeText}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-foreground leading-relaxed font-normal">
            {displayText}
          </p>

          {activeHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] flex items-start gap-2 text-xs text-[#142D49]"
            >
              <Lightbulb className="w-4 h-4 text-[#E9A83A] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#176FC1]">Pista Pedagógica: </span>
                <span className="text-[#536B83]">{activeHint}</span>
              </div>
            </motion.div>
          )}

          {actionLabel && onActionClick && (
            <div className="mt-3">
              <button
                onClick={onActionClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow hover:opacity-95 transition-opacity"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {actionLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
