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
  Lightbulb,
  Sparkles,
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
import AIMentor from '@/components/ai-mentor'
import { getUserGamification } from '@/services/gamification'
import { Badge, TopicPerformance, UserGamificationState } from '@/types/gamification'
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
  const [gamification, setGamification] = useState<UserGamificationState>(() => getUserGamification())

  useEffect(() => {
    setGamification(getUserGamification(user?.id))
  }, [user?.id])

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
    <div className="flex h-screen bg-[#F3F8FD] text-[#142D49] overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x:
            sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)
              ? 0
              : -280,
        }}
        className={`fixed lg:relative z-40 flex flex-col w-72 h-full bg-white border-r border-[#E5EDF5] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5EDF5]">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-[#E5EDF5] shadow-2xs group-hover:scale-105 transition-all duration-300 shrink-0 bg-white p-0.5">
              <img src="/logo.png" alt="Maestro Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold font-display text-[#142D49]">MaestroTech</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#F3F8FD] text-[#536B83] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-6 py-5 border-b border-[#E5EDF5]">
          {isAuthenticated || isDemo ? (
            <>
              <div className="flex items-center gap-3">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-10 h-10 rounded-2xl object-cover border border-[#E5EDF5]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-[#176FC1] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {userInitials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#142D49] truncate">{displayName}</p>
                  <p className="text-[11px] font-semibold truncate">
                    {role === 'admin' ? (
                      <span className="text-[#142D49]">Superusuario Admin</span>
                    ) : role === 'instructor' ? (
                      <span className="text-[#176FC1]">Docente Formador</span>
                    ) : (
                      <span className="text-[#176FC1]">Estudiante Matriculado</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#E5EDF5]">
                <span className="text-[#536B83]">Cursos matriculados</span>
                <span className="font-bold text-[#176FC1]">{enrollments.length} activos</span>
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-[#536B83] mb-3">
                Inicia sesión para ver tus cursos matriculados
              </p>
              <button
                onClick={onOpenAuth}
                className="w-full py-2 rounded-xl bg-[#176FC1] text-white text-xs font-semibold shadow-xs"
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
                  ? 'bg-[#F3F8FD] text-[#176FC1] font-bold border-r-2 border-[#176FC1]'
                  : 'text-[#536B83] hover:bg-[#F3F8FD] hover:text-[#142D49]'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={activeView === view ? 2.2 : 1.8} />
              {label}
            </button>
          ))}

          {(role === 'instructor' || role === 'admin') && (
            <div className="pt-4 mt-4 border-t border-[#E5EDF5] space-y-1.5">
              <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-[#536B83]">
                Gestión Académica
              </p>
              <Link
                href="/teacher"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#176FC1]/10 text-[#176FC1] text-xs font-semibold hover:bg-[#176FC1]/15 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Panel Docente
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#142D49]/10 text-[#142D49] text-xs font-semibold hover:bg-[#142D49]/15 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#176FC1]" /> Panel Superusuario
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* Bottom items */}
        <div className="px-3 py-4 border-t border-[#E5EDF5] space-y-1">
          {isAuthenticated && (
            <button
              onClick={async () => {
                await signOut()
                onNavigate('home')
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
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
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#E5EDF5] bg-white/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#F3F8FD] text-[#142D49] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536B83]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar mis cursos matriculados..."
                className="pl-9 pr-4 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] focus:bg-white focus:outline-none text-xs text-[#142D49] placeholder-[#536B83] w-72 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#142D49] hidden sm:inline">
                  {displayName}
                </span>
                <div className="w-9 h-9 rounded-2xl bg-[#176FC1] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  {userInitials}
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-[#176FC1] text-white text-xs font-semibold shadow-xs"
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
                <h1 className="font-display font-bold text-2xl md:text-3xl text-[#142D49]">
                  Bienvenido(a), {displayName} 👋
                </h1>
                <p className="text-[#536B83] mt-1 text-xs sm:text-sm font-medium">
                  Tienes {enrollments.length} cursos activos con acceso completo a videoclases y guías pedagógicas descargables.
                </p>
              </div>
              <button
                onClick={() => onNavigate('exam')}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-sm font-semibold shadow-md transition-all btn-magnetic"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Simulacro CNSC
              </button>
            </motion.div>

            {/* AI Mentor Companion Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AIMentor
                mood="happy"
                variant="card"
                message={`¡Hola de nuevo, ${displayName}! Tu evolución docente avanza con gran compromiso. Hoy tienes activa tu racha de estudio de ${gamification.streakDays} días consecutivos.`}
                hint="Consejo del día: En las pruebas de juicio situacional docente, prioriza siempre el diálogo reflexivo, la mediación formativa y los derechos fundamentales de los estudiantes."
              />
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
                  color: 'text-[#176FC1] bg-[#176FC1]/10',
                },
                {
                  icon: CheckCircle2,
                  label: 'Clases completadas',
                  value: `${stats?.completedLessonsCount || 0}`,
                  sub: 'Avance verificado',
                  color: 'text-[#39BDEB] bg-[#39BDEB]/15',
                },
                {
                  icon: Clock,
                  label: 'Horas de estudio',
                  value: `${stats?.totalStudyHours || 1.5}h`,
                  sub: 'Tiempo registrado',
                  color: 'text-[#142D49] bg-[#142D49]/10',
                },
                {
                  icon: Award,
                  label: 'Certificados emitidos',
                  value: `${certificates.length}`,
                  sub: 'Verificables con código',
                  color: 'text-[#E9A83A] bg-[#E9A83A]/15',
                },
              ].map(({ icon: Icon, label, value, sub, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="p-5 rounded-2xl bg-white border border-[#E5EDF5] hover:border-[#176FC1]/30 transition-all card-lift shadow-xs hover:shadow-md"
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}
                  >
                    <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>
                  <p className="text-xs text-[#536B83] mb-1 font-medium">{label}</p>
                  <p className="font-display font-bold text-xl text-[#142D49]">{value}</p>
                  <p className="text-xs mt-1 text-[#536B83]">{sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Gamificación & Seguimiento del Progreso */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Nivel y XP */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#176FC1]">
                      Ruta de Maestría Pedagógica
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#E9A83A] bg-[#E9A83A]/10 px-2.5 py-0.5 rounded-full border border-[#E9A83A]/25">
                      <Flame className="w-3.5 h-3.5 fill-[#E9A83A]" /> {gamification.streakDays} días
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#176FC1] flex items-center justify-center text-white shadow-xs">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-[#142D49]">
                        Nivel {gamification.level}: {gamification.levelTitle}
                      </h3>
                      <p className="text-xs text-[#536B83] font-medium">
                        {gamification.xp} XP acumulados
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[11px] text-[#536B83] font-semibold">
                      <span>Progreso hacia Nivel {Math.min(5, gamification.level + 1)}</span>
                      <span>{gamification.xp} / {gamification.nextLevelXp} XP</span>
                    </div>
                    <div className="h-2.5 bg-[#F3F8FD] border border-[#E5EDF5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#176FC1] to-[#39BDEB] rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, Math.round((gamification.xp / gamification.nextLevelXp) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#142D49] mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#E9A83A]" /> Insignias Obtenidas ({gamification.unlockedBadges.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {gamification.unlockedBadges.map((badge: Badge) => (
                      <span
                        key={badge.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs font-medium text-[#142D49]"
                        title={badge.description}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Fortalezas y Recomendaciones (Seguimiento del Progreso) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display font-bold text-[#142D49]">
                        Seguimiento y Recomendaciones Pedagógicas
                      </h3>
                      <p className="text-xs text-[#536B83]">
                        Análisis cognitivo de tus respuestas en simulacros y lecciones
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('exam')}
                      className="text-xs text-[#176FC1] font-bold hover:underline"
                    >
                      Nuevo Simulacro →
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Fortalezas */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#176FC1] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tus Mayores Fortalezas
                      </span>
                      {gamification.strengths.map((str: TopicPerformance) => (
                        <div key={str.topic} className="p-3 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5]">
                          <p className="text-xs font-bold text-[#142D49]">{str.topic}</p>
                          <p className="text-[11px] text-[#536B83] mt-0.5">{str.suggestion}</p>
                        </div>
                      ))}
                    </div>

                    {/* Ejes por Reforzar */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#E9A83A] flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" /> Ejes Clave por Reforzar
                      </span>
                      {gamification.improvementAreas.map((imp: TopicPerformance) => (
                        <div key={imp.topic} className="p-3 rounded-xl bg-[#E9A83A]/8 border border-[#E9A83A]/25">
                          <p className="text-xs font-bold text-[#142D49]">{imp.topic}</p>
                          <p className="text-[11px] text-[#536B83] mt-0.5">{imp.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#E5EDF5] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-[#536B83] font-medium">
                    💡 Recomendación activa: Módulo Decreto 1278 y Evaluación Formativa Decreto 1290
                  </span>
                  <button
                    onClick={() => onNavigate('courses')}
                    className="px-4 py-2 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-bold shadow-xs transition-all"
                  >
                    Estudiar temas recomendados
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Courses + AI */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Mis Cursos Matriculados */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-display font-bold text-[#142D49]">
                        Mis Cursos Matriculados
                      </h3>
                      <p className="text-xs text-[#536B83]">
                        Haz clic en cualquier curso para ver sus videoclases y descargar todo el material PDF
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('courses')}
                      className="text-xs text-[#176FC1] font-bold hover:underline shrink-0"
                    >
                      Catálogo →
                    </button>
                  </div>

                  {loading ? (
                    <div className="py-8 text-center text-xs text-[#536B83]">
                      Cargando tus cursos...
                    </div>
                  ) : filteredEnrollments.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-xl bg-[#F3F8FD] border border-dashed border-[#E5EDF5] space-y-2">
                      <BookOpen className="w-8 h-8 text-[#E9A83A] mx-auto mb-1" />
                      <p className="text-xs font-bold text-[#142D49]">
                        Aún no tienes cursos matriculados
                      </p>
                      <p className="text-[11px] text-[#536B83] max-w-md mx-auto leading-relaxed">
                        La inscripción a los programas de MaestroTech es activada por pasarela de pago o manualmente por un Administrador (<span className="text-[#142D49] font-mono">{user?.email}</span>).
                      </p>
                      <button
                        onClick={() => onNavigate('courses')}
                        className="mt-2 px-4 py-2 rounded-xl bg-white border border-[#E5EDF5] hover:border-[#176FC1] text-[#142D49] text-xs font-bold shadow-xs"
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
                            className="group flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-[#F3F8FD] border border-[#E5EDF5] hover:border-[#176FC1]/50 transition-all cursor-pointer shadow-2xs"
                          >
                            <div className="w-11 h-11 rounded-xl bg-[#176FC1] text-white flex items-center justify-center shrink-0 shadow-xs">
                              <BookOpen className="w-5 h-5 text-white" strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase text-[#176FC1]">
                                  {c.category || 'Pedagogía'}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#39BDEB]/15 text-[#142D49] font-bold border border-[#39BDEB]/30">
                                  Matriculado
                                </span>
                              </div>
                              <p className="text-sm font-bold text-[#142D49] truncate mt-0.5">
                                {c.title}
                              </p>
                              <p className="text-[11px] text-[#536B83] mt-0.5">
                                {c.duration_hours || 48} horas · Videos + Guías PDF descargables
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs font-bold text-[#176FC1]">Entrar al Aula</span>
                              <ChevronRight className="w-4 h-4 text-[#176FC1] group-hover:translate-x-0.5 transition-transform" />
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
                className="flex flex-col p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[#142D49] text-white flex items-center justify-center shadow-xs">
                    <Brain className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[#142D49]">
                      Asistente Pedagógico IA
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#176FC1] animate-pulse" />
                      <span className="text-xs text-[#176FC1] font-semibold">
                        Alineado al Estatuto Docente 1278
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
                            ? 'bg-[#176FC1] text-white rounded-br-sm'
                            : 'bg-[#F3F8FD] text-[#142D49] border border-[#E5EDF5] rounded-bl-sm font-medium'
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
                    className="flex-1 px-4 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] focus:bg-white focus:outline-none text-xs text-[#142D49] placeholder-[#536B83] transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white shadow-xs"
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
                className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-display font-bold text-[#142D49]">
                      Evolución de rendimiento
                    </h3>
                    <p className="text-xs text-[#536B83] mt-0.5 font-medium">
                      Puntuaciones de estudio y práctica CNSC
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#176FC1] font-bold bg-[#176FC1]/10 px-2.5 py-1 rounded-full border border-[#176FC1]/20">
                    <TrendingUp className="w-4 h-4 text-[#176FC1]" />
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
                          <stop offset="5%" stopColor="#176FC1" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#39BDEB" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: '#536B83' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#FFFFFF',
                          border: '1px solid #E5EDF5',
                          borderRadius: '12px',
                          fontSize: 12,
                          color: '#142D49',
                          boxShadow: '0 4px 12px rgba(20,45,73,0.08)',
                        }}
                        labelStyle={{ color: '#142D49', fontWeight: 600 }}
                        itemStyle={{ color: '#176FC1' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#176FC1"
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
                className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs"
              >
                <h3 className="font-display font-bold text-[#142D49] mb-1">
                  Radar de competencias
                </h3>
                <p className="text-xs text-[#536B83] mb-4 font-medium">Alineación con el Decreto 1278</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={RADAR_DATA}>
                      <PolarGrid stroke="#E5EDF5" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 10, fill: '#536B83' }}
                      />
                      <Radar
                        dataKey="A"
                        stroke="#176FC1"
                        fill="#176FC1"
                        fillOpacity={0.2}
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
              className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-[#142D49]">
                  Certificados Oficiales y Logros Académicos
                </h3>
              </div>

              {certificates.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] hover:border-[#E9A83A]/50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#E9A83A]/15 text-[#E9A83A] flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#142D49] truncate">
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
