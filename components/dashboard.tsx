'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Target,
  Award,
  BarChart3,
  Search,
  ChevronRight,
  Flame,
  Clock,
  Play,
  TrendingUp,
  CheckCircle2,
  Zap,
  Star,
  Menu,
  X,
  Trophy,
  LogOut,
  AlertCircle,
  Shield,
  Printer,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from 'recharts'
import { useAuth } from '@/hooks/use-auth'
import { getUserEnrollments, EnrollmentWithCourse } from '@/services/enrollments'
import { getUserGlobalProgress, UserGlobalProgress } from '@/services/progress'
import { getUserCertificates, CertificateWithCourse } from '@/services/certificates'
import { getAvatarUrl } from '@/lib/supabase/storage'
import Link from 'next/link'

interface DashboardProps {
  onNavigate: (view: string) => void
  onOpenAuth?: () => void
  onSelectCourse?: (slug: string) => void
}

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
  { icon: BookOpen, label: 'Explorar Catálogo', view: 'courses' },
  { icon: Target, label: 'Simulacro CNSC', view: 'exam' },
  { icon: Brain, label: 'Asistente IA', view: 'ai' },
  { icon: Award, label: 'Mis Certificados', view: 'achievements' },
  { icon: BarChart3, label: 'Analíticas', view: 'analytics' },
]

const RADAR_DATA = [
  { subject: 'Pedagogía', A: 86 },
  { subject: 'Legislación', A: 78 },
  { subject: 'Psicología', A: 82 },
  { subject: 'Currículo', A: 74 },
  { subject: 'Evaluación', A: 85 },
  { subject: 'Lectura Crítica', A: 90 },
]

const PROGRESS_DATA = [
  { day: 'L', score: 65 },
  { day: 'M', score: 72 },
  { day: 'X', score: 75 },
  { day: 'J', score: 81 },
  { day: 'V', score: 85 },
  { day: 'S', score: 88 },
  { day: 'D', score: 92 },
]

const ACHIEVEMENTS = [
  { icon: Flame, label: 'Racha de estudio activa', color: 'text-orange-500 bg-orange-500/10' },
  { icon: Star, label: 'Ruta de ascenso docente 1278', color: 'text-amber-500 bg-amber-500/10' },
  { icon: Trophy, label: 'Especialista en Evaluación MEN', color: 'text-violet-500 bg-violet-500/10' },
]

export default function Dashboard({ onNavigate, onOpenAuth, onSelectCourse }: DashboardProps) {
  const { user, profile, isAuthenticated, isDemo, role, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')

  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [stats, setStats] = useState<UserGlobalProgress | null>(null)
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([])
  const [selectedCert, setSelectedCert] = useState<CertificateWithCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [aiMessage, setAiMessage] = useState('')
  const [aiHistory, setAiHistory] = useState([
    {
      role: 'ai',
      text: '¡Hola! Hoy es un excelente día para repasar el Decreto 1278, Evaluación por Competencias y Pedagogía Crítica. ¿En qué tema quieres profundizar?',
    },
  ])

  useEffect(() => {
    let isMounted = true

    async function loadDashboardData() {
      if (!user && !isDemo) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const userId = user?.id || 'b5ccdb90-a6c0-4b99-add5-c93fac47ee84'
        const [enrollRes, statsRes, certsRes] = await Promise.all([
          getUserEnrollments(userId),
          getUserGlobalProgress(userId),
          getUserCertificates(userId),
        ])

        if (!isMounted) return

        if (enrollRes.error) {
          setError(enrollRes.error.message)
        } else {
          setEnrollments(enrollRes.data || [])
        }

        if (statsRes.data) {
          setStats(statsRes.data)
        }
        if (certsRes.data) {
          setCertificates(certsRes.data)
        }
      } catch (err: unknown) {
        if (!isMounted) return
        const msg = err instanceof Error ? err.message : 'Error al cargar dashboard'
        setError(msg)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [user?.id, isDemo])

  const navigate = (view: string) => {
    setActiveView(view)
    setSidebarOpen(false)
    if (view === 'courses' || view === 'exam' || view === 'learning') {
      onNavigate(view)
    }
  }

  const sendMessage = () => {
    if (!aiMessage.trim()) return
    const q = aiMessage.toLowerCase()
    let reply =
      'Excelente planteamiento. El Decreto 1278 evalúa cuatro ejes fundamentales: competencias pedagógicas, disciplinares, comportamentales y psicotécnicas. ¿Deseas abrir un simulacro cronometrado?'
    if (q.includes('piaget') || q.includes('vygotsky')) {
      reply =
        'Recuerda: Piaget enfatiza las etapas del desarrollo cognitivo individual (asimilación/acomodación), mientras que Vygotsky destaca la mediación sociocultural y la Zona de Desarrollo Próximo (ZDP).'
    } else if (q.includes('1290') || q.includes('evaluación')) {
      reply =
        'El Decreto 1290 de 2009 reglamenta el Sistema Institucional de Evaluación de Estudiantes (SIEE), exigiendo que la evaluación sea formativa, integral, continua y con planes de apoyo oportunos.'
    }

    setAiHistory([...aiHistory, { role: 'user', text: aiMessage }, { role: 'ai', text: reply }])
    setAiMessage('')
  }

  const displayName =
    profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Estudiante MaestroTech')
  const userInitials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || 'MT'
  const userAvatar = getAvatarUrl(profile?.avatar_url)

  const filteredEnrollments = enrollments.filter((enr) => {
    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return (
      (enr.course?.title || '').toLowerCase().includes(q) ||
      (enr.course?.category || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x:
            sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)
              ? 0
              : -280,
        }}
        className={`fixed lg:relative z-40 flex flex-col w-72 h-full bg-card border-r border-border/60 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-border/60 shadow-md group-hover:scale-105 transition-all duration-300 shrink-0 bg-black">
              <img src="/logo.png" alt="Maestro Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold font-display text-foreground">MaestroTech</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-6 py-5 border-b border-border/60">
          {isAuthenticated || isDemo ? (
            <>
              <div className="flex items-center gap-3">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-10 h-10 rounded-2xl object-cover border border-border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {userInitials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-[11px] text-emerald-500 font-medium truncate">
                    {role === 'admin'
                      ? 'Superusuario Admin'
                      : role === 'instructor'
                        ? 'Docente Formador'
                        : 'Estudiante Matriculado'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Cursos matriculados</span>
                <span className="font-bold text-primary">{enrollments.length} activos</span>
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-muted-foreground mb-3">
                Inicia sesión para ver tus cursos matriculados
              </p>
              <button
                onClick={onOpenAuth}
                className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow"
              >
                Iniciar sesión
              </button>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-1">
          {SIDEBAR_ITEMS.map(({ icon: Icon, label, view }) => (
            <button
              key={view}
              onClick={() => navigate(view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeView === view
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.8} />
              {label}
            </button>
          ))}

          {(role === 'instructor' || role === 'admin') && (
            <div className="pt-4 mt-4 border-t border-border/50 space-y-1.5">
              <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Gestión Académica
              </p>
              <Link
                href="/teacher"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Panel Docente
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-violet-500/10 text-violet-400 text-xs font-semibold hover:bg-violet-500/20 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Panel Superusuario
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* Bottom items */}
        <div className="px-3 py-4 border-t border-border/60 space-y-1">
          {isAuthenticated && (
            <button
              onClick={async () => {
                await signOut()
                onNavigate('home')
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" strokeWidth={1.8} />
              Cerrar sesión
            </button>
          )}
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card/60 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar mis cursos matriculados..."
                className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-transparent focus:border-primary/30 focus:outline-none text-xs text-foreground placeholder-muted-foreground w-72 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                  {displayName}
                </span>
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {userInitials}
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Welcome banner */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-start justify-between"
            >
              <div>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                  Bienvenido(a), {displayName} 👋
                </h1>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  Tienes {enrollments.length} cursos activos con acceso completo a videoclases y guías PDF descargables.
                </p>
              </div>
              <button
                onClick={() => onNavigate('exam')}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all btn-magnetic"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Simulacro CNSC
              </button>
            </motion.div>

            {error && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: BookOpen,
                  label: 'Cursos matriculados',
                  value: `${enrollments.length} cursos`,
                  sub: enrollments.length > 0 ? 'Con acceso completo' : 'Sin cursos aún',
                  color: 'text-blue-500 bg-blue-500/10',
                },
                {
                  icon: CheckCircle2,
                  label: 'Clases completadas',
                  value: `${stats?.completedLessonsCount || 0}`,
                  sub: 'Avance verificado',
                  color: 'text-emerald-500 bg-emerald-500/10',
                },
                {
                  icon: Clock,
                  label: 'Horas de estudio',
                  value: `${stats?.totalStudyHours || 1.5}h`,
                  sub: 'Tiempo registrado',
                  color: 'text-violet-500 bg-violet-500/10',
                },
                {
                  icon: Award,
                  label: 'Certificados emitidos',
                  value: `${certificates.length}`,
                  sub: 'Verificables con código',
                  color: 'text-amber-500 bg-amber-500/10',
                },
              ].map(({ icon: Icon, label, value, sub, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="p-5 rounded-2xl glass border border-border/60 hover:border-primary/20 transition-colors card-lift"
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}
                  >
                    <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="font-display font-bold text-xl text-foreground">{value}</p>
                  <p className="text-xs mt-1 text-muted-foreground">{sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Courses + AI */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Mis Cursos Matriculados */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl glass border border-border/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-display font-semibold text-foreground">
                        Mis Cursos Matriculados
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Haz clic en cualquier curso para ver sus videoclases y descargar todo el material PDF
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('courses')}
                      className="text-xs text-primary font-semibold hover:underline shrink-0"
                    >
                      Catálogo →
                    </button>
                  </div>

                  {loading ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      Cargando tus cursos...
                    </div>
                  ) : filteredEnrollments.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-xl bg-muted/20 border border-dashed border-border space-y-2">
                      <BookOpen className="w-8 h-8 text-amber-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-foreground">
                        Aún no tienes cursos matriculados
                      </p>
                      <p className="text-[11px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                        La inscripción a los programas de MaestroTech es activada únicamente de forma manual por un Administrador. Solicita al Administrador que matricule tu cuenta (<span className="text-foreground font-mono">{user?.email}</span>).
                      </p>
                      <button
                        onClick={() => onNavigate('courses')}
                        className="mt-2 px-4 py-2 rounded-xl glass border border-border/70 hover:border-primary/40 text-foreground text-xs font-semibold"
                      >
                        Ver catálogo informativo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredEnrollments.map((enr) => {
                        const c = enr.course
                        if (!c) return null
                        return (
                          <div
                            key={enr.id}
                            onClick={() => {
                              if (onSelectCourse) onSelectCourse(c.slug)
                              else onNavigate('learning')
                            }}
                            className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 border border-border/60 hover:border-primary/40 transition-all cursor-pointer"
                          >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0 shadow-md">
                              <BookOpen className="w-5 h-5 text-white" strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase text-primary">
                                  {c.category || 'Pedagogía'}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
                                  Matriculado
                                </span>
                              </div>
                              <p className="text-sm font-bold text-foreground truncate mt-0.5">
                                {c.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {c.duration_hours || 48} horas · Videos + Guías PDF descargables
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs font-bold text-primary">Entrar al Aula</span>
                              <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Asistente IA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-col p-6 rounded-2xl glass border border-border/60"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
                    <Brain className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      Asistente Pedagógico IA
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-500 font-medium">
                        Conectado al Estatuto Docente 1278
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar max-h-48 mb-4">
                  {aiHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendMessage()
                    }}
                    placeholder="Pregunta sobre Piaget, Vygotsky, Decreto 1278 o 1290..."
                    className="flex-1 px-4 py-2 rounded-xl bg-muted border border-transparent focus:border-primary/30 focus:outline-none text-xs text-foreground placeholder-muted-foreground transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Certificados y Analíticas */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Progress chart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 p-6 rounded-2xl glass border border-border/60"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      Evolución de rendimiento
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Puntuaciones de estudio y práctica CNSC
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    +27 pts
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={PROGRESS_DATA}
                      margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                    >
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1a56db" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          fontSize: 12,
                        }}
                        labelStyle={{ color: 'var(--foreground)' }}
                        itemStyle={{ color: '#1a56db' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#1a56db"
                        strokeWidth={2.5}
                        fill="url(#scoreGrad)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Radar */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="p-6 rounded-2xl glass border border-border/60"
              >
                <h3 className="font-display font-semibold text-foreground mb-1">
                  Radar de competencias
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Alineación con el Decreto 1278</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={RADAR_DATA}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                      />
                      <Radar
                        dataKey="A"
                        stroke="#1a56db"
                        fill="#1a56db"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Certificados y Logros */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl glass border border-border/60 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">
                  Certificados Oficiales y Logros Académicos
                </h3>
              </div>

              {certificates.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/25 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {cert.course?.title || 'Certificación Docente MaestroTech'}
                          </p>
                          <p className="text-[10px] font-mono text-amber-500">
                            Código: {cert.certificate_number}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 text-xs font-bold shrink-0 transition-colors"
                      >
                        Ver Certificado
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {ACHIEVEMENTS.map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl glass border border-border/60"
                  >
                    <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modal de Certificado */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-3xl bg-card border-2 border-amber-500/40 shadow-2xl p-8 text-center space-y-6"
            >
              <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto">
                <Award className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500">
                  Certificación Académica Verificada • MaestroTech Colombia
                </p>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                  Certificado de Formación Docente
                </h2>
              </div>

              <div className="p-6 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
                <p className="text-xs text-muted-foreground">Se otorga el presente certificado a:</p>
                <p className="font-display font-bold text-xl text-primary">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  Por haber cursado el programa de cualificación docente:
                </p>
                <p className="font-display font-bold text-base text-foreground">
                  {selectedCert.course?.title || 'Programa Oficial MaestroTech'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[11px] text-muted-foreground font-mono">
                  <span>Código: {selectedCert.certificate_number}</span>
                  <span>•</span>
                  <span>
                    Fecha: {new Date(selectedCert.issued_at).toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-6 py-2.5 rounded-xl glass border border-border/70 text-xs font-semibold text-foreground"
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
