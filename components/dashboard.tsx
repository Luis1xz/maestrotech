'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  Lock,
  User,
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
import { useCourses } from '@/hooks/use-courses'
import { getUserEnrollments, EnrollmentWithCourse } from '@/services/enrollments'
import { getUserGlobalProgress, UserGlobalProgress } from '@/services/progress'
import { getUserCertificates, CertificateWithCourse } from '@/services/certificates'
import { getAvatarUrl } from '@/lib/supabase/storage'
import AIMentor from '@/components/ai-mentor'
import MaTechChat from '@/components/matech-chat'
import DashboardCoursesPanel from '@/components/dashboard-courses-panel'
import ProfileModal from '@/components/profile-modal'
import {
  getUserGamification,
  getCompetencyRadarData,
  getUserProgressCurve,
} from '@/services/gamification'
import { Badge, TopicPerformance, UserGamificationState } from '@/types/gamification'
import Link from 'next/link'

interface DashboardProps {
  onNavigate: (view: string) => void
  onOpenAuth?: () => void
  onSelectCourse?: (slug: string) => void
  initialTab?: string
}

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Mi Aula Virtual', view: 'dashboard' },
  { icon: BookOpen, label: 'Mis Cursos y Módulos', view: 'courses' },
  { icon: Target, label: 'Simulador CNSC', view: 'exam' },
  { icon: Brain, label: 'Mentor Pedagógico IA', view: 'ai' },
  { icon: Award, label: 'Mis Certificados', view: 'achievements' },
  { icon: BarChart3, label: 'Analíticas', view: 'analytics' },
]

const ACHIEVEMENTS = [
  { icon: Flame, label: 'Racha de estudio activa', color: 'text-orange-500 bg-orange-500/10' },
  { icon: Star, label: 'Ruta de ascenso docente 1278', color: 'text-amber-500 bg-amber-500/10' },
  { icon: Trophy, label: 'Especialista en Evaluación MEN', color: 'text-violet-500 bg-violet-500/10' },
]

export default function Dashboard({
  onNavigate,
  onOpenAuth,
  onSelectCourse,
  initialTab = 'dashboard',
}: DashboardProps) {
  const { user, profile, isAuthenticated, role, signOut } = useAuth()
  const { courses: availableCourses } = useCourses()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState(initialTab)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (initialTab) {
      setActiveView(initialTab)
    }
  }, [initialTab])

  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [stats, setStats] = useState<UserGlobalProgress | null>(null)
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([])
  const [selectedCert, setSelectedCert] = useState<CertificateWithCourse | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [selectedAiCourseId, setSelectedAiCourseId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gamification, setGamification] = useState<UserGamificationState>(() => getUserGamification())

  useEffect(() => {
    setGamification(getUserGamification(user?.id))
  }, [user?.id, activeView])

  const isEnrolled = enrollments.length > 0 || role === 'admin' || role === 'instructor'

  const { hasDiagnosticData, radarData } = useMemo(
    () => getCompetencyRadarData(gamification),
    [gamification]
  )

  const { hasProgressData, progressData } = useMemo(
    () => getUserProgressCurve(gamification, stats?.totalStudyHours || 0),
    [gamification, stats?.totalStudyHours]
  )

  const [aiMessage, setAiMessage] = useState('')
  const [aiHistory, setAiHistory] = useState([
    {
      role: 'ai',
      text: '¡Hola! Hoy es un excelente día para repasar el Decreto 1278, Evaluación por Competencias y Pedagogía Crítica. ¿En qué tema quieres profundizar?',
    },
  ])

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) {
      setEnrollments([])
      setStats(null)
      setCertificates([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userId = user.id
      const [enrollRes, statsRes, certsRes] = await Promise.all([
        getUserEnrollments(userId),
        getUserGlobalProgress(userId),
        getUserCertificates(userId),
      ])

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
      const msg = err instanceof Error ? err.message : 'Error al cargar dashboard'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const navigate = (view: string) => {
    setActiveView(view)
    setSidebarOpen(false)
    if (view === 'exam') {
      onNavigate('exam')
    } else if (view === 'learning') {
      onNavigate('learning')
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
    profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Docente Legado Docente')
  const userInitials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || 'LD'
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
    <div className="flex h-screen bg-[#F8FAFC] text-[#1E293B] overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x:
            sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)
              ? 0
              : -280,
        }}
        className={`fixed lg:relative z-40 flex flex-col w-72 h-full bg-white border-r border-[#E2E8F0] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img src="/logo-icon.png" alt="Legado Docente" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold font-display text-[#0038DF]">Legado Docente</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-6 py-5 border-b border-[#E2E8F0]">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-10 h-10 rounded-2xl object-cover border border-[#E2E8F0]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-[#0038DF] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {userInitials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1E293B] truncate">{displayName}</p>
                  <div className="text-[11px] font-semibold truncate mt-0.5">
                    {role === 'admin' ? (
                      <span className="text-[#0038DF] font-bold">Superusuario Admin</span>
                    ) : role === 'instructor' ? (
                      <span className="text-[#9C7316] font-bold">Docente Formador</span>
                    ) : enrollments.length > 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        Estudiante Matriculado
                      </span>
                    ) : (
                      <span className="text-[#64748B] font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        Aspirante Registrado
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#E2E8F0]">
                <span className="text-[#64748B]">Cursos matriculados</span>
                <span className={`font-bold ${enrollments.length > 0 ? 'text-emerald-700' : 'text-[#64748B]'}`}>
                  {enrollments.length} activos
                </span>
              </div>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#0038DF] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <User className="w-3 h-3 text-[#C99E32]" />
                <span>Ver y Editar Mi Perfil</span>
              </button>
              {enrollments.length === 0 && (
                <button
                  onClick={() => onNavigate('pricing')}
                  className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>Activar Matrícula Oficial</span>
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-[#64748B] mb-3">
                Inicia sesión para ver tus cursos matriculados
              </p>
              <button
                onClick={onOpenAuth}
                className="w-full py-2 btn-gold-cta btn-gold-pill text-xs font-bold text-[#1A1A1A] cursor-pointer"
              >
                Iniciar sesión
              </button>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-1.5">
          {SIDEBAR_ITEMS.map(({ icon: Icon, label, view }) => {
            const isAi = view === 'ai'
            const isActive = activeView === view
            return (
              <button
                key={view}
                onClick={() => navigate(view)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? isAi
                      ? 'bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 text-[#7C3AED] border-r-4 border-[#7C3AED] shadow-sm'
                      : 'bg-[#F1F5F9] text-[#0038DF] border-r-4 border-[#C99E32] shadow-2xs'
                    : isAi
                    ? 'text-[#7C3AED] hover:bg-purple-50/70 hover:shadow-2xs'
                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0038DF]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 ${
                      isAi
                        ? 'text-[#7C3AED] animate-sparkle'
                        : isActive
                        ? 'text-[#0038DF]'
                        : 'text-[#64748B]'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className="truncate">{label}</span>
                </div>
                {isAi && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs animate-sparkle">
                    ✨ IA
                  </span>
                )}
              </button>
            )
          })}

          {(role === 'instructor' || role === 'admin') && (
            <div className="pt-4 mt-4 border-t border-[#E2E8F0] space-y-1.5">
              <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Gestión Académica
              </p>
              <Link
                href="/teacher"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0038DF]/10 text-[#0038DF] text-xs font-bold hover:bg-[#0038DF]/15 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Panel Docente
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#002299]/10 text-[#002299] text-xs font-bold hover:bg-[#002299]/15 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#0038DF]" /> Panel Superusuario
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* Bottom items */}
        <div className="px-3 py-4 border-t border-[#E2E8F0] space-y-1">
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
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#F8FAFC] text-[#1E293B] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[#0038DF]/10 border border-[#0038DF]/20 text-[#0038DF] text-xs font-bold uppercase tracking-wider hidden sm:inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C99E32]" />
                {activeView === 'courses'
                  ? 'Catálogo y Módulos Oficiales (140 Horas)'
                  : activeView === 'ai'
                  ? 'Mentor Pedagógico IA (Decreto 1278)'
                  : activeView === 'achievements'
                  ? 'Mis Certificados Verificables'
                  : activeView === 'analytics'
                  ? 'Analíticas de Competencias'
                  : 'Mi Aula Virtual • Resumen General'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeView !== 'courses' && (
              <button
                onClick={() => setActiveView('courses')}
                className="px-3.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#C99E32] text-[#0038DF] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#C99E32]" />
                <span className="hidden md:inline">Ver Plan de 140h</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('exam')}
              className="px-3.5 py-1.5 rounded-xl bg-[#0038DF] hover:bg-[#002299] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulador CNSC</span>
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => setProfileModalOpen(true)}
                title="Ver y editar mi perfil"
                className="flex items-center gap-3 pl-2 border-l border-[#E2E8F0] hover:opacity-85 transition-opacity cursor-pointer text-left"
              >
                <div className="hidden md:block">
                  <span className="text-xs font-bold text-[#1E293B] block leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-[#0038DF] font-semibold block">
                    Ver perfil
                  </span>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-[#0038DF] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {userInitials}
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-gold-cta btn-gold-pill px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              {activeView === 'courses' ? (
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <DashboardCoursesPanel
                    enrollments={enrollments}
                    availableCourses={availableCourses}
                    userId={user?.id}
                    userEmail={user?.email || undefined}
                    userName={displayName}
                    onSelectCourse={(slug) => {
                      if (onSelectCourse) onSelectCourse(slug)
                      else onNavigate('learning')
                    }}
                    onNavigateToExam={() => onNavigate('exam')}
                    onNavigateToPricing={() => onNavigate('pricing')}
                    onRefreshEnrollments={loadDashboardData}
                  />
                </motion.div>
              ) : activeView === 'ai' ? (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {!isEnrolled ? (
                    <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#C99E32] shadow-2xl text-center max-w-3xl mx-auto space-y-6 relative overflow-hidden card-gold">
                      {/* Ambient background glow */}
                      <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#C99E32]/10 rounded-full blur-3xl pointer-events-none" />

                      <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#4F46E5] to-[#0038DF] text-white flex items-center justify-center mx-auto shadow-2xl shadow-purple-600/30 glow-ring-purple">
                        <Brain className="w-10 h-10 text-[#E6C565] animate-sparkle" />
                        <Sparkles className="w-5 h-5 text-[#E6C565] absolute -top-1 -right-1 animate-sparkle" />
                      </div>

                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-50 via-amber-50/60 to-purple-50 border border-purple-200 text-[#7C3AED] text-xs font-extrabold uppercase tracking-wider shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-[#C99E32] animate-sparkle" />
                        Herramienta Exclusiva para Estudiantes Matriculados
                      </div>

                      <div>
                        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0038DF] mb-2">
                          Mentor Pedagógico con Inteligencia Artificial
                        </h2>
                        <p className="text-sm text-[#1E293B] max-w-xl mx-auto leading-relaxed">
                          El tutor inteligente entrenado en el marco normativo colombiano (Ley 115 de 1994, Decreto Ley 1278 de 2002, Decreto 1290 de 2009 y casos situacionales de la CNSC) está reservado exclusivamente para los estudiantes del <strong>Curso de Preparación Ingreso a la Carrera Docente (140 Horas)</strong>.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#7C3AED]/40 hover:shadow-md transition-all duration-300">
                          <Sparkles className="w-5 h-5 text-[#7C3AED] mb-2 animate-sparkle" />
                          <h4 className="text-xs font-bold text-[#0038DF]">Dudas Normativas 24/7</h4>
                          <p className="text-[11px] text-[#64748B] mt-1">
                            Aclaraciones sobre estatutos, escalafón docente y gobierno escolar al instante.
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0038DF]/40 hover:shadow-md transition-all duration-300">
                          <Target className="w-5 h-5 text-[#0038DF] mb-2" />
                          <h4 className="text-xs font-bold text-[#0038DF]">Casos Situacionales</h4>
                          <p className="text-[11px] text-[#64748B] mt-1">
                            Entrenamiento guiado para responder casos de convivencia escolar (Ley 1620).
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#C99E32]/40 hover:shadow-md transition-all duration-300">
                          <Award className="w-5 h-5 text-[#9C7316] mb-2" />
                          <h4 className="text-xs font-bold text-[#0038DF]">Estrategias de Descarte</h4>
                          <p className="text-[11px] text-[#64748B] mt-1">
                            Técnicas para identificar opciones distractoras en las pruebas oficiales.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          onClick={() => onNavigate('pricing')}
                          className="btn-gold-cta btn-gold-pill px-8 py-3.5 text-sm font-extrabold cursor-pointer shadow-lg flex items-center gap-2"
                        >
                          <span>Ver Planes y Realizar Matrícula</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate('exam')}
                          className="px-6 py-3 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0038DF] hover:bg-white text-[#0038DF] text-xs font-bold cursor-pointer transition-all shadow-2xs hover:shadow-sm"
                        >
                          Presentar Prueba Diagnóstica Gratuita
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enrollments.length > 1 && (
                        <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#0038DF]" />
                            <span className="text-xs font-bold text-[#1E293B]">
                              Base de Conocimiento del Curso:
                            </span>
                          </div>
                          <select
                            value={
                              selectedAiCourseId ||
                              enrollments[0]?.course_id ||
                              'preparacion-ingreso-carrera-docente'
                            }
                            onChange={(e) => setSelectedAiCourseId(e.target.value)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0038DF]"
                          >
                            {enrollments.map((enr) => (
                              <option key={enr.course_id} value={enr.course_id}>
                                {enr.course?.title || enr.course_id}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <MaTechChat
                        courseId={
                          selectedAiCourseId ||
                          enrollments[0]?.course_id ||
                          'preparacion-ingreso-carrera-docente'
                        }
                        courseTitle={
                          (
                            enrollments.find(
                              (e) =>
                                e.course_id ===
                                (selectedAiCourseId || enrollments[0]?.course_id)
                            )?.course?.title ||
                            'Curso de Preparación Ingreso a la Carrera Docente'
                          )
                        }
                        studentName={
                          profile?.first_name || profile?.full_name || 'Estudiante'
                        }
                      />
                    </div>
                  )}
                </motion.div>
              ) : activeView === 'achievements' ? (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="p-8 rounded-3xl bg-white border-2 border-[#C99E32] shadow-xl space-y-6">
                    <div className="flex items-center justify-between pb-6 border-b border-[#E2E8F0]">
                      <div>
                        <span className="eyebrow-white-pill mb-2">RECONOCIMIENTO OFICIAL</span>
                        <h2 className="title-h1 text-2xl font-extrabold text-[#0038DF]">
                          Tus Certificados y Reconocimientos
                        </h2>
                        <p className="text-xs text-[#64748B] font-medium">
                          Certificaciones verificables emitidas con código de registro único de Legado Docente
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-gold-metallic text-[#1A1A1A] flex items-center justify-center font-bold shadow-md">
                        <Award className="w-6 h-6" />
                      </div>
                    </div>

                    {certificates.length === 0 ? (
                      <div className="text-center py-12 px-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] space-y-3">
                        <Award className="w-12 h-12 text-[#C99E32] mx-auto" />
                        <h4 className="font-extrabold text-[#0038DF] text-base">
                          Aún no has emitido certificados
                        </h4>
                        <p className="text-xs text-[#1E293B] max-w-md mx-auto">
                          Completa el 100% de las lecciones del curso de 140 horas o supera un simulacro oficial para generar tu diploma oficial verificable.
                        </p>
                        <button
                          onClick={() => setActiveView('courses')}
                          className="btn-gold-cta btn-gold-pill px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer mt-2"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Ir al Plan de 140 Horas</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="p-5 rounded-2xl bg-[#F8FAFC] border-2 border-[#C99E32] hover:shadow-lg flex items-center justify-between gap-4 transition-all"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-gold-metallic text-[#1A1A1A] flex items-center justify-center shrink-0 shadow-sm">
                                <Award className="w-6 h-6" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-extrabold text-[#0038DF] truncate">
                                  {cert.course?.title || 'Certificación de Formación Docente'}
                                </p>
                                <p className="text-xs font-mono font-bold text-[#9C7316] mt-0.5">
                                  Código: {cert.certificate_number}
                                </p>
                                <p className="text-[11px] text-[#64748B]">
                                  Emitido: {new Date(cert.issued_at).toLocaleDateString('es-CO')}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedCert(cert)}
                              className="px-4 py-2 rounded-xl bg-[#0038DF] hover:bg-[#002299] text-white text-xs font-bold shrink-0 shadow-xs cursor-pointer"
                            >
                              Ver Diploma
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-6 border-t border-[#E2E8F0]">
                      <h3 className="font-extrabold text-sm text-[#0038DF] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#C99E32]" />
                        Insignias de Maestría Docente ({gamification.unlockedBadges.length})
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {gamification.unlockedBadges.map((badge: Badge) => (
                          <div
                            key={badge.id}
                            className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3"
                          >
                            <span className="text-2xl p-2 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                              {badge.icon}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-[#1E293B]">{badge.title}</p>
                              <p className="text-[11px] text-[#64748B] line-clamp-1">{badge.description}</p>
                              <span className="text-[10px] font-mono text-[#0038DF] font-bold">+{badge.xpReward} XP</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : activeView === 'analytics' ? (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 rounded-3xl bg-white border-2 border-[#C99E32] shadow-xl">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <span className="eyebrow-white-pill mb-1">MÉTRICAS COGNITIVAS</span>
                          <h3 className="font-extrabold text-xl text-[#0038DF]">
                            Evolución de Rendimiento
                          </h3>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            Puntuaciones estimadas en respuestas y simulacros CNSC
                          </p>
                        </div>
                        {hasProgressData && (
                          <div className="flex items-center gap-1.5 text-xs text-[#0038DF] font-extrabold bg-[#0038DF]/10 px-3 py-1.5 rounded-full border border-[#0038DF]/20">
                            <TrendingUp className="w-4 h-4 text-[#0038DF]" />
                            {gamification.xp} XP acumulados
                          </div>
                        )}
                      </div>
                      {!hasProgressData ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0]">
                          <div className="w-12 h-12 rounded-2xl bg-[#0038DF]/10 text-[#0038DF] flex items-center justify-center mb-3">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-extrabold text-[#0038DF]">Sin actividad de estudio registrada</p>
                          <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
                            Tus horas de estudio y puntajes en simulacros se registrarán automáticamente a medida que completes lecciones o presentes tu prueba diagnóstica.
                          </p>
                          <button
                            onClick={() => onNavigate('exam')}
                            className="btn-gold-cta btn-gold-pill px-5 py-2 text-xs font-bold cursor-pointer mt-3 shadow-xs"
                          >
                            Presentar Prueba Diagnóstica Gratuita
                          </button>
                        </div>
                      ) : (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={progressData}
                              margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                            >
                              <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0038DF" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#C99E32" stopOpacity={0.02} />
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="day"
                                tick={{ fontSize: 12, fill: '#64748B' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: '#FFFFFF',
                                  border: '1.5px solid #C99E32',
                                  borderRadius: '14px',
                                  fontSize: 12,
                                  color: '#1E293B',
                                  boxShadow: '0 8px 24px rgba(0, 56, 223, 0.12)',
                                }}
                                labelStyle={{ color: '#0038DF', fontWeight: 700 }}
                                itemStyle={{ color: '#0038DF' }}
                              />
                              <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#0038DF"
                                strokeWidth={3}
                                fill="url(#scoreGrad)"
                                dot={{ stroke: '#C99E32', strokeWidth: 2, r: 4, fill: '#FFFFFF' }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm">
                      <h3 className="font-extrabold text-lg text-[#0038DF] mb-1">
                        Radar de Competencias
                      </h3>
                      <p className="text-xs text-[#64748B] mb-4">Alineación con el Decreto 1278</p>
                      {!hasDiagnosticData ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0]">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#9C7316] flex items-center justify-center mb-3">
                            <Target className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-extrabold text-[#0038DF]">Diagnóstico Pedagógico Pendiente</p>
                          <p className="text-xs text-[#64748B] max-w-xs mt-1 leading-relaxed">
                            Presenta la prueba de 5 preguntas del Decreto 1278 para calcular tu radar de competencias en tiempo real.
                          </p>
                          <button
                            onClick={() => onNavigate('exam')}
                            className="btn-gold-cta btn-gold-pill px-5 py-2 text-xs font-bold cursor-pointer mt-3 shadow-xs"
                          >
                            Presentar Prueba Diagnóstica Gratuita
                          </button>
                        </div>
                      ) : (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                              <PolarGrid stroke="#E2E8F0" />
                              <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
                              />
                              <Radar
                                dataKey="A"
                                stroke="#0038DF"
                                fill="#0038DF"
                                fillOpacity={0.25}
                                strokeWidth={2.5}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* VISTA DEFAULT: OVERVIEW */
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Welcome banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm">
                    <div>
                      <div className="inline-flex items-center gap-2 mb-2">
                        <span className="eyebrow-white-pill">
                          <Sparkles className="w-3 h-3 text-[#C99E32]" />
                          {isEnrolled ? 'ESTUDIANTE MATRICULADO • 140 HORAS' : 'ASPIRANTE REGISTRADO • MODO DIAGNÓSTICO'}
                        </span>
                      </div>
                      <h1 className="font-display font-extrabold text-2xl md:text-3xl text-[#0038DF]">
                        Bienvenido(a), {displayName} 👋
                      </h1>
                      <p className="text-[#1E293B] mt-1 text-xs sm:text-sm font-medium">
                        {isEnrolled ? (
                          <>
                            Tienes acceso completo al <strong className="text-[#0038DF]">Curso Oficial de 140 Horas</strong>, simulacros cronometrados y guías pedagógicas descargables.
                          </>
                        ) : (
                          <>
                            Comienza tu preparación presentando la <strong className="text-[#0038DF]">Prueba Diagnóstica Gratuita</strong> para medir tus competencias. Para desbloquear los 13 módulos del Curso de 140 Horas, simulacros cronometrados y el Mentor IA, matricúlate ahora.
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {isEnrolled ? (
                        <button
                          onClick={() => setActiveView('courses')}
                          className="btn-gold-cta btn-gold-pill px-6 py-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Ver Mis Módulos (140h)</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onNavigate('pricing')}
                            className="btn-gold-cta btn-gold-pill px-5 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-sm cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Ver Planes y Realizar Matrícula</span>
                          </button>
                          <button
                            onClick={() => onNavigate('exam')}
                            className="px-4 py-2.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0038DF] text-[#0038DF] text-xs font-bold transition-all cursor-pointer"
                          >
                            Presentar Diagnóstico
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* AI Mentor Companion Card */}
                  <AIMentor
                    mood={gamification.streakDays > 0 ? 'happy' : 'thinking'}
                    variant="card"
                    message={
                      gamification.streakDays > 0
                        ? `¡Hola de nuevo, ${displayName}! Tu preparación para el concurso docente avanza con gran rigor. Hoy tienes activa tu racha de estudio de ${gamification.streakDays} días consecutivos.`
                        : `¡Te damos la bienvenida a tu Aula Virtual de Legado Docente, ${displayName}! Comienza presentando la Prueba Diagnóstica Gratuita para evaluar tu nivel en las competencias del Decreto 1278.`
                    }
                    hint={
                      gamification.streakDays > 0
                        ? 'Consejo clave: En las preguntas de juicio situacional docente, prioriza siempre el debido proceso formativo (Decreto 1290), el diálogo reflexivo y la corresponsabilidad con el PEI.'
                        : 'Pista pedagógica: La prueba oficial de la CNSC evalúa tu capacidad para resolver dilemas pedagógicos y de convivencia con apego a la norma y a los derechos de los estudiantes.'
                    }
                  />

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
                        label: 'Programa Oficial',
                        value: '140 Horas',
                        sub: '13 módulos certificados',
                        color: 'text-[#0038DF] bg-[#0038DF]/10',
                      },
                      {
                        icon: CheckCircle2,
                        label: 'Clases completadas',
                        value: `${stats?.completedLessonsCount || 0}`,
                        sub: 'Avance verificado',
                        color: 'text-[#0038DF] bg-[#0038DF]/10',
                      },
                      {
                        icon: Clock,
                        label: 'Horas registradas',
                        value: `${stats?.totalStudyHours || 0}h`,
                        sub: 'Tiempo en plataforma',
                        color: 'text-[#1E293B] bg-[#F1F5F9]',
                      },
                      {
                        icon: Award,
                        label: 'Certificados emitidos',
                        value: `${certificates.length}`,
                        sub: 'Verificables con código',
                        color: 'text-[#9C7316] bg-[#C99E32]/15',
                      },
                    ].map(({ icon: Icon, label, value, sub, color }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#C99E32] transition-all shadow-xs hover:shadow-md"
                      >
                        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <p className="text-xs text-[#64748B] mb-1 font-semibold">{label}</p>
                        <p className="font-extrabold text-xl text-[#0038DF]">{value}</p>
                        <p className="text-[11px] mt-1 text-[#64748B]">{sub}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Gamificación & Seguimiento del Progreso */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Nivel y XP */}
                    <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0038DF]">
                            Ruta de Maestría Pedagógica
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-[#9C7316] bg-[#C99E32]/10 px-2.5 py-0.5 rounded-full border border-[#C99E32]/25">
                            <Flame className="w-3.5 h-3.5 fill-[#C99E32]" /> {gamification.streakDays} días
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#0038DF] flex items-center justify-center text-white shadow-xs">
                            <Zap className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-lg text-[#0038DF]">
                              Nivel {gamification.level}: {gamification.levelTitle}
                            </h3>
                            <p className="text-xs text-[#64748B] font-medium">
                              {gamification.xp} XP acumulados
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5 mb-4">
                          <div className="flex justify-between text-[11px] text-[#64748B] font-semibold">
                            <span>Progreso hacia Nivel {Math.min(5, gamification.level + 1)}</span>
                            <span>{gamification.xp} / {gamification.nextLevelXp} XP</span>
                          </div>
                          <div className="h-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#0038DF] to-[#C99E32] rounded-full transition-all duration-1000"
                              style={{
                                width: `${Math.min(100, Math.round((gamification.xp / gamification.nextLevelXp) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-[#1E293B] mb-2 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#C99E32]" /> Insignias Obtenidas ({gamification.unlockedBadges.length})
                        </p>
                        {gamification.unlockedBadges.length === 0 ? (
                          <p className="text-[11px] text-[#64748B] italic">
                            Presenta la prueba diagnóstica o completa clases para desbloquear insignias.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {gamification.unlockedBadges.map((badge: Badge) => (
                              <span
                                key={badge.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#1E293B]"
                                title={badge.description}
                              >
                                <span>{badge.icon}</span>
                                <span>{badge.title}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fortalezas y Recomendaciones */}
                    <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-extrabold text-lg text-[#0038DF]">
                              Diagnóstico Cognitivo y Recomendaciones
                            </h3>
                            <p className="text-xs text-[#64748B]">
                              Análisis de tus respuestas según los ejes del Estatuto Docente 1278
                            </p>
                          </div>
                          <button
                            onClick={() => onNavigate('exam')}
                            className="text-xs text-[#0038DF] font-bold hover:underline cursor-pointer"
                          >
                            Nuevo Simulacro →
                          </button>
                        </div>

                        {!hasDiagnosticData ? (
                          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center space-y-2">
                            <Sparkles className="w-8 h-8 text-[#C99E32] mx-auto mb-1" />
                            <h4 className="font-extrabold text-[#0038DF] text-sm">
                              Aún no has presentado tu Prueba Diagnóstica
                            </h4>
                            <p className="text-xs text-[#64748B] max-w-md mx-auto">
                              Responde las 5 preguntas del examen diagnóstico para identificar automáticamente tus fortalezas y las normas educativas (Decreto 1278, Ley 1620, Decreto 1290) que debes reforzar.
                            </p>
                            <button
                              onClick={() => onNavigate('exam')}
                              className="btn-gold-cta btn-gold-pill px-5 py-2 text-xs font-bold cursor-pointer shadow-xs inline-flex items-center gap-1.5 mt-2"
                            >
                              <Target className="w-3.5 h-3.5" />
                              <span>Presentar Prueba Diagnóstica Gratuita</span>
                            </button>
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-4">
                            {/* Fortalezas */}
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0038DF] flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tus Mayores Fortalezas
                              </span>
                              {gamification.strengths.length === 0 ? (
                                <p className="text-xs text-[#64748B] italic p-3 rounded-xl bg-[#F8FAFC]">
                                  Continúa practicando para consolidar tus temas fuertes.
                                </p>
                              ) : (
                                gamification.strengths.map((str: TopicPerformance) => (
                                  <div key={str.topic} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                                    <p className="text-xs font-bold text-[#1E293B]">{str.topic}</p>
                                    <p className="text-[11px] text-[#64748B] mt-0.5">{str.suggestion}</p>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Ejes por Reforzar */}
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C7316] flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-[#C99E32]" /> Ejes Clave por Reforzar
                              </span>
                              {gamification.improvementAreas.length === 0 ? (
                                <p className="text-xs text-[#64748B] italic p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-800">
                                  ¡Excelente! Por el momento no tienes ejes críticos detectados.
                                </p>
                              ) : (
                                gamification.improvementAreas.map((imp: TopicPerformance) => (
                                  <div key={imp.topic} className="p-3 rounded-xl bg-[#C99E32]/8 border border-[#C99E32]/25">
                                    <p className="text-xs font-bold text-[#1E293B]">{imp.topic}</p>
                                    <p className="text-[11px] text-[#64748B] mt-0.5">{imp.suggestion}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-xs text-[#64748B] font-medium">
                          💡 Módulo clave sugerido hoy: Módulo 1 (Decreto Ley 1278) y Módulo 6 (Decreto 1290)
                        </span>
                        <button
                          onClick={() => setActiveView('courses')}
                          className="px-4 py-2 rounded-xl bg-[#0038DF] hover:bg-[#002299] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          Ir al Plan de 140 Horas
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cursos Matriculados + Mini Asistente IA */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Mis Cursos Matriculados */}
                    <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <h3 className="font-extrabold text-lg text-[#0038DF]">
                              Mis Cursos y Acceso a Clases
                            </h3>
                            <p className="text-xs text-[#64748B]">
                              Accede al contenido, lecciones en video y material complementario
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveView('courses')}
                            className="text-xs text-[#0038DF] font-bold hover:underline shrink-0"
                          >
                            Ver Todo el Plan →
                          </button>
                        </div>

                        {loading ? (
                          <div className="py-8 text-center text-xs text-[#64748B]">
                            Cargando tus cursos...
                          </div>
                        ) : filteredEnrollments.length === 0 ? (
                          <div className="text-center py-8 px-4 rounded-2xl bg-amber-50/60 border-2 border-dashed border-amber-300/80 space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto shadow-xs">
                              <Lock className="w-6 h-6 text-amber-700" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-extrabold text-[#1E293B]">
                                Sin matrícula activa actualmente
                              </p>
                              <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                                Tu cuenta está registrada como <strong>Aspirante</strong>. El acceso a las 140 horas de clases, grabaciones y bancos oficiales se habilita tras confirmar tu pago.
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                              <button
                                onClick={() => onNavigate('pricing')}
                                className="btn-gold-cta btn-gold-pill px-5 py-2 text-xs font-extrabold cursor-pointer shadow-xs"
                              >
                                Ver Planes y Realizar Matrícula
                              </button>
                              <button
                                onClick={() => setActiveView('courses')}
                                className="px-4 py-2 rounded-full bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0038DF] text-xs font-bold cursor-pointer"
                              >
                                Ver Módulos de 140h
                              </button>
                            </div>
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
                                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#C99E32] transition-all cursor-pointer shadow-xs"
                                >
                                  <div className="w-12 h-12 rounded-xl bg-[#0038DF] text-white flex items-center justify-center shrink-0 shadow-sm">
                                    <BookOpen className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-extrabold uppercase text-[#0038DF]">
                                        {c.category || 'Concurso Docente'}
                                      </span>
                                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                        Activo
                                      </span>
                                    </div>
                                    <p className="text-sm font-extrabold text-[#1E293B] truncate mt-0.5">
                                      {c.title}
                                    </p>
                                    <p className="text-[11px] text-[#64748B] mt-0.5">
                                      {c.duration_hours || 140} horas · 13 Módulos + Guías PDF
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-xs font-bold text-[#0038DF]">Entrar</span>
                                    <ChevronRight className="w-4 h-4 text-[#0038DF] group-hover:translate-x-1 transition-transform" />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mini Asistente IA */}
                    <div className="flex flex-col p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#0038DF] text-white flex items-center justify-center shadow-xs">
                          <Brain className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-lg text-[#0038DF]">
                            Asistente Pedagógico IA
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isEnrolled ? 'bg-emerald-500 animate-pulse' : 'bg-[#C99E32]'}`} />
                            <span className={`text-xs ${isEnrolled ? 'text-emerald-600' : 'text-[#9C7316]'} font-semibold`}>
                              {isEnrolled ? 'Alineado al Estatuto Docente 1278' : 'Exclusivo para Matriculados (140h)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!isEnrolled ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-center p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#9C7316] flex items-center justify-center mx-auto">
                            <Brain className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-[#0038DF]">
                              Mentor IA Exclusivo del Plan de 140 Horas
                            </p>
                            <p className="text-[11px] text-[#64748B] max-w-xs mx-auto mt-1">
                              Resuelve dudas sobre leyes educativas, decretos 1278 y 1290, y análisis de casos las 24 horas del día.
                            </p>
                          </div>
                          <button
                            onClick={() => onNavigate('pricing')}
                            className="btn-gold-cta btn-gold-pill px-5 py-2 text-xs font-extrabold cursor-pointer shadow-xs mt-1"
                          >
                            Ver Planes y Realizar Matrícula
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 space-y-2.5 overflow-y-auto no-scrollbar max-h-48 mb-4">
                            {aiHistory.slice(-3).map((msg, i) => (
                              <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[85%] px-4 py-2 rounded-2xl text-xs leading-relaxed ${
                                    msg.role === 'user'
                                      ? 'bg-[#0038DF] text-white rounded-br-sm'
                                      : 'bg-[#F8FAFC] text-[#1E293B] border border-[#E2E8F0] rounded-bl-sm font-medium'
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
                              placeholder="Pregunta sobre Piaget, Decreto 1278 o 1290..."
                              className="flex-1 px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0038DF] focus:bg-white focus:outline-none text-xs text-[#1E293B] placeholder-[#94A3B8] transition-all"
                            />
                            <button
                              onClick={sendMessage}
                              className="p-2.5 rounded-xl bg-[#0038DF] hover:bg-[#002299] text-white shadow-xs cursor-pointer"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Certificados y Analíticas Overview */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="font-extrabold text-lg text-[#0038DF]">
                            Evolución de Rendimiento
                          </h3>
                          <p className="text-xs text-[#64748B]">
                            Puntaje acumulado en casos situacionales
                          </p>
                        </div>
                        {hasProgressData && (
                          <div className="flex items-center gap-1.5 text-xs text-[#0038DF] font-bold bg-[#0038DF]/10 px-2.5 py-1 rounded-full border border-[#0038DF]/20">
                            <TrendingUp className="w-4 h-4" />
                            {gamification.xp} XP
                          </div>
                        )}
                      </div>
                      {!hasProgressData ? (
                        <div className="h-48 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0]">
                          <div className="w-10 h-10 rounded-xl bg-[#0038DF]/10 text-[#0038DF] flex items-center justify-center mb-2">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-[#0038DF]">Sin actividad de estudio aún</p>
                          <p className="text-[11px] text-[#64748B] max-w-xs mt-0.5">
                            Tus horas y puntajes se registrarán al avanzar lecciones o presentar tu prueba diagnóstica.
                          </p>
                        </div>
                      ) : (
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={progressData}
                              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                            >
                              <defs>
                                <linearGradient id="scoreGradOverview" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0038DF" stopOpacity={0.25} />
                                  <stop offset="95%" stopColor="#C99E32" stopOpacity={0.02} />
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="day"
                                tick={{ fontSize: 12, fill: '#64748B' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: '#FFFFFF',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '12px',
                                  fontSize: 12,
                                  color: '#1E293B',
                                }}
                                labelStyle={{ color: '#0038DF', fontWeight: 700 }}
                                itemStyle={{ color: '#0038DF' }}
                              />
                              <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#0038DF"
                                strokeWidth={2.5}
                                fill="url(#scoreGradOverview)"
                                dot={false}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
                      <h3 className="font-extrabold text-lg text-[#0038DF] mb-1">
                        Radar de Competencias
                      </h3>
                      <p className="text-xs text-[#64748B] mb-4">Alineación con el Decreto 1278</p>
                      {!hasDiagnosticData ? (
                        <div className="h-48 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0]">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#9C7316] flex items-center justify-center mb-2">
                            <Target className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-[#0038DF]">Diagnóstico Pendiente</p>
                          <p className="text-[11px] text-[#64748B] max-w-xs mt-0.5">
                            Presenta la prueba de 5 preguntas para calcular tus puntajes reales por competencia.
                          </p>
                          <button
                            onClick={() => onNavigate('exam')}
                            className="btn-gold-cta btn-gold-pill px-4 py-1.5 text-[11px] font-bold cursor-pointer mt-2 shadow-xs"
                          >
                            Presentar Diagnóstico
                          </button>
                        </div>
                      ) : (
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                              <PolarGrid stroke="#E2E8F0" />
                              <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fontSize: 10, fill: '#64748B' }}
                              />
                              <Radar
                                dataKey="A"
                                stroke="#0038DF"
                                fill="#0038DF"
                                fillOpacity={0.2}
                                strokeWidth={2}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                  Certificación Académica Verificada • Legado Docente Colombia
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
                  {selectedCert.course?.title || 'Programa Oficial Legado Docente'}
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

      {/* Modal de Perfil del Estudiante */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        enrolledCoursesCount={enrollments.length}
      />
    </div>
  )
}
