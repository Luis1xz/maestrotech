'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowRight, Play, ChevronDown, Zap, Shield, TrendingUp, LayoutDashboard, BookOpen, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { UserRole, canAccessAdmin, canAccessTeacher } from '@/types/database'

const STATS = [
  { value: '48,000+', label: 'Docentes preparados', color: 'text-[#176FC1]' },
  { value: '94%', label: 'Tasa de aprobación', color: 'text-[#176FC1]' },
  { value: '32', label: 'Departamentos', color: 'text-[#142D49]' },
  { value: '4.9★', label: 'Valoración promedio', color: 'text-[#E9A83A]' },
]

const BADGES = [
  { icon: Zap, label: 'IA Adaptativa', bg: 'bg-[#176FC1]', text: 'text-white' },
  { icon: Shield, label: 'Normativa MEN', bg: 'bg-[#142D49]', text: 'text-white' },
  { icon: TrendingUp, label: 'Resultados probados', bg: 'bg-[#E9A83A]', text: 'text-white' },
]

interface HeroProps {
  onNavigate: (view: string) => void
  onOpenAuth?: (mode?: 'signin' | 'signup') => void
  isAuthenticated?: boolean
  role?: UserRole | null
  userName?: string
}

export default function HeroSection({ onNavigate, onOpenAuth, isAuthenticated, role, userName }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 160])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.94])
  const smoothY = useSpring(y, { damping: 20, stiffness: 100 })

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F3F8FD] pt-20 pb-16"
    >
      {/* Ambient orbs */}
      <motion.div
        animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
        transition={{ type: 'spring', damping: 30, stiffness: 80 }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#176FC1]/10 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: mousePos.x * -0.3, y: mousePos.y * -0.3 }}
        transition={{ type: 'spring', damping: 30, stiffness: 60 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#39BDEB]/15 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: mousePos.x * 0.2, y: mousePos.y * 0.4 }}
        transition={{ type: 'spring', damping: 40, stiffness: 70 }}
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-[#E9A83A]/8 blur-3xl pointer-events-none"
      />

      {/* Main content */}
      <motion.div
        style={{ y: smoothY, opacity, scale }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5EDF5] text-xs sm:text-sm font-semibold text-[#536B83] shadow-xs mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#0045E6] animate-pulse" />
          {isAuthenticated
            ? `Sesión Activa · Legado Docente · ${
                role === 'admin'
                  ? 'Superusuario'
                  : role === 'instructor'
                  ? 'Docente Formador'
                  : 'Aspirante'
              }`
            : 'CONCURSO DOCENTE 2917–3006 · CONVOCATORIA OFICIAL'}
          <span className="text-[#E5A83B] font-bold">★</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.98] tracking-tight text-balance mb-6"
        >
          {isAuthenticated ? (
            <>
              <span className="text-[#142D49]">Bienvenido a</span>
              <br />
              <span className="text-[#0045E6]">LEGADO DOCENTE</span>
            </>
          ) : (
            <>
              <span className="text-[#142D49]">El concurso tiene reglas.</span>
              <br />
              <span className="text-[#0045E6]">¿Las conoces?</span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg md:text-xl text-[#536B83] max-w-2xl mx-auto leading-relaxed text-balance mb-10"
        >
          {isAuthenticated
            ? 'Tu centro integral de formación pedagógica. Gestiona tus 140 horas de curso, practica con simulacros de concurso docente y deja huella en la educación.'
            : 'Prepárate con método, fuentes oficiales y una comunidad de colegas. LEGADO DOCENTE «Aprende, comparte, deja huella». Curso integral de 140 horas y caracterización inteligente.'}
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-3.5 mb-16"
        >
          {isAuthenticated ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className="group relative px-6 py-3.5 rounded-2xl bg-[#0045E6] hover:bg-[#142D49] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 btn-magnetic flex items-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Ir a mi Aula Virtual</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate('courses')}
                className="group px-6 py-3.5 rounded-2xl bg-white hover:bg-[#F3F8FD] text-[#142D49] border border-[#E5EDF5] hover:border-[#0045E6]/40 text-sm font-semibold shadow-xs transition-all duration-300 btn-magnetic flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#0045E6]" />
                <span>Ver Curso 140 Horas</span>
              </button>

              {canAccessTeacher(role) && (
                <Link
                  href="/teacher"
                  className="px-5 py-3.5 rounded-2xl bg-white border border-[#E5EDF5] hover:border-[#176FC1] text-[#176FC1] text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Panel Docente</span>
                </Link>
              )}

              {canAccessAdmin(role) && (
                <Link
                  href="/admin"
                  className="px-5 py-3.5 rounded-2xl bg-white border border-[#E5EDF5] hover:border-[#142D49] text-[#142D49] text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-xs"
                >
                  <Shield className="w-4 h-4 text-[#176FC1]" />
                  <span>Panel Superusuario</span>
                </Link>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('courses')}
                className="group relative px-7 py-4 rounded-2xl bg-[#0045E6] hover:bg-[#142D49] text-white text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 btn-magnetic flex items-center gap-2.5 cursor-pointer"
              >
                <span>Curso 140 Horas · Matrícula Abierta</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onOpenAuth?.('signup')}
                className="group px-7 py-4 rounded-2xl bg-white hover:bg-[#F3F8FD] text-[#142D49] border border-[#E5EDF5] hover:border-[#0045E6]/40 text-base font-bold shadow-xs hover:shadow-md transition-all duration-300 btn-magnetic flex items-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#E5A83B]" />
                <span>Diagnóstico Gratis (5 Etapas)</span>
              </button>
            </>
          )}
        </motion.div>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 mb-20"
        >
          {BADGES.map(({ icon: Icon, label, bg, text }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E5EDF5] text-xs sm:text-sm font-medium text-[#142D49] shadow-xs"
            >
              <div className={`w-5 h-5 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-3 h-3 ${text}`} strokeWidth={2.5} />
              </div>
              {label}
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {STATS.map(({ value, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl p-5 border border-[#E5EDF5] hover:border-[#176FC1]/30 transition-all duration-300 shadow-xs hover:shadow-md"
            >
              <div className={`text-2xl sm:text-3xl font-bold font-display ${color}`}>{value}</div>
              <div className="text-xs text-[#536B83] mt-1 font-medium">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-muted-foreground/60 font-medium tracking-widest uppercase">
          Explorar
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  )
}
