'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowRight, Play, ChevronDown, Zap, Shield, TrendingUp, LayoutDashboard, BookOpen, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { UserRole, canAccessAdmin, canAccessTeacher } from '@/types/database'

const STATS = [
  { value: '48,000+', label: 'Docentes preparados' },
  { value: '94%', label: 'Tasa de aprobación' },
  { value: '32', label: 'Departamentos' },
  { value: '4.9★', label: 'Valoración promedio' },
]

const BADGES = [
  { icon: Zap, label: 'IA Adaptativa', color: 'from-blue-600 to-violet-600' },
  { icon: Shield, label: 'Aval MEN', color: 'from-emerald-600 to-cyan-600' },
  { icon: TrendingUp, label: 'Resultados probados', color: 'from-orange-500 to-rose-500' },
]

interface HeroProps {
  onNavigate: (view: string) => void
  isAuthenticated?: boolean
  role?: UserRole | null
  userName?: string
}

export default function HeroSection({ onNavigate, isAuthenticated, role, userName }: HeroProps) {
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden aurora-bg"
    >
      {/* Ambient orbs */}
      <motion.div
        animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
        transition={{ type: 'spring', damping: 30, stiffness: 80 }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-blue-600/20 to-violet-600/10 blur-3xl pointer-events-none animate-morph-blob"
      />
      <motion.div
        animate={{ x: mousePos.x * -0.3, y: mousePos.y * -0.3 }}
        transition={{ type: 'spring', damping: 30, stiffness: 60 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/15 to-cyan-500/10 blur-3xl pointer-events-none animate-morph-blob"
        style={{ animationDelay: '3s' }}
      />
      <motion.div
        animate={{ x: mousePos.x * 0.2, y: mousePos.y * 0.4 }}
        transition={{ type: 'spring', damping: 40, stiffness: 70 }}
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-gradient-to-br from-orange-500/10 to-rose-500/8 blur-3xl pointer-events-none"
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border/60 text-sm font-medium text-muted-foreground mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {isAuthenticated
            ? `Sesión Activa · ${
                role === 'admin'
                  ? 'Superusuario'
                  : role === 'instructor'
                  ? 'Docente Formador'
                  : 'Estudiante'
              }`
            : 'Nueva era del aprendizaje docente en Colombia'}
          <span className="text-muted-foreground/50">→</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-balance mb-6"
        >
          {isAuthenticated ? (
            <>
              <span className="text-foreground">Bienvenido de nuevo,</span>
              <br />
              <span className="gradient-text">{userName || 'Docente'}</span>
            </>
          ) : (
            <>
              <span className="text-foreground">El futuro del</span>
              <br />
              <span className="gradient-text">desarrollo docente</span>
              <br />
              <span className="text-foreground">empieza aquí.</span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance mb-10"
        >
          {isAuthenticated
            ? 'Tu centro integral de formación pedagógica. Gestiona tus cursos, practica con simulacros de concurso docente y continúa con tu progreso profesional.'
            : 'La plataforma más avanzada para prepararte en concursos de méritos, ascensos salariales y traslados. Tecnología de IA que aprende contigo.'}
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
                className="group relative px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-300 btn-magnetic overflow-hidden flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Ir a mi Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {canAccessTeacher(role) && (
                <Link
                  href="/teacher"
                  className="px-5 py-3.5 rounded-2xl glass border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-sm font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Panel Docente</span>
                </Link>
              )}

              {canAccessAdmin(role) && (
                <Link
                  href="/admin"
                  className="px-5 py-3.5 rounded-2xl glass border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 text-sm font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Panel Superusuario</span>
                </Link>
              )}

              <button
                onClick={() => onNavigate('courses')}
                className="px-5 py-3.5 rounded-2xl glass border border-border hover:border-primary/30 text-foreground text-sm font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Explorar Cursos</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-base font-semibold shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-300 btn-magnetic overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Comenzar ahora — gratis
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <button
                onClick={() => onNavigate('exam')}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl glass border border-border hover:border-primary/30 text-foreground text-base font-semibold transition-all duration-300 btn-magnetic"
              >
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 flex items-center justify-center group-hover:from-blue-600/30 group-hover:to-violet-600/30 transition-all duration-300">
                  <Play className="w-4 h-4 text-primary" fill="currentColor" />
                </span>
                Ver simulador de examen
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
          {BADGES.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass border border-border/60 text-sm font-medium text-foreground"
            >
              <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-3 h-3 text-white" strokeWidth={2.5} />
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
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-2xl p-4 border border-border/60 hover:border-primary/20 transition-colors duration-300"
            >
              <div className="text-2xl font-bold font-display gradient-text">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
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
