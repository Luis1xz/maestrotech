'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Brain, Target, Calendar, Award,
  BarChart3, MessageSquare, Settings, Bell, Search, ChevronRight,
  Flame, Clock, Play, TrendingUp, CheckCircle2, Zap,
  Users, Star, ArrowRight, Menu, X, Sparkles, Trophy,
  FileText, LogOut, AlertCircle, RefreshCw
} from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts'
import { useAuth } from '@/hooks/use-auth'
import { getUserEnrollments, EnrollmentWithCourse } from '@/services/enrollments'
import { getUserGlobalProgress, UserGlobalProgress } from '@/services/progress'
import { getAvatarUrl, getThumbnailUrl } from '@/lib/supabase/storage'

interface DashboardProps {
  onNavigate: (view: string) => void
  onOpenAuth?: () => void
  onSelectCourse?: (slug: string) => void
}

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
  { icon: BookOpen, label: 'Mis Cursos', view: 'courses' },
  { icon: Target, label: 'Simulador', view: 'exam' },
  { icon: Brain, label: 'Asistente IA', view: 'ai' },
  { icon: Calendar, label: 'Calendario', view: 'calendar' },
  { icon: Award, label: 'Logros', view: 'achievements' },
  { icon: BarChart3, label: 'Analíticas', view: 'analytics' },
  { icon: Users, label: 'Comunidad', view: 'community' },
  { icon: MessageSquare, label: 'Mensajes', view: 'messages' },
]

const RADAR_DATA = [
  { subject: 'Pedagogía', A: 82 },
  { subject: 'Legislación', A: 67 },
  { subject: 'Psicología', A: 74 },
  { subject: 'Currículo', A: 58 },
  { subject: 'Evaluación', A: 71 },
  { subject: 'TIC', A: 88 },
]

const PROGRESS_DATA = [
  { day: 'L', score: 62 },
  { day: 'M', score: 71 },
  { day: 'X', score: 68 },
  { day: 'J', score: 79 },
  { day: 'V', score: 84 },
  { day: 'S', score: 77 },
  { day: 'D', score: 89 },
]

const ACHIEVEMENTS = [
  { icon: Flame, label: 'Racha de estudio activa', color: 'text-orange-500 bg-orange-500/10' },
  { icon: Star, label: 'Ruta de ascenso docente', color: 'text-amber-500 bg-amber-500/10' },
  { icon: Trophy, label: 'Especialista en Evaluación', color: 'text-violet-500 bg-violet-500/10' },
]

export default function Dashboard({ onNavigate, onOpenAuth, onSelectCourse }: DashboardProps) {
  const { user, profile, isAuthenticated, isDemo, role, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')

  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [stats, setStats] = useState<UserGlobalProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [aiMessage, setAiMessage] = useState('')
  const [aiHistory, setAiHistory] = useState([
    {
      role: 'ai',
      text: '¡Hola! Hoy es un buen día para repasar Legislación Educativa y Pedagogía. ¿En qué tema quieres profundizar?',
    },
  ])

  // Cargar datos reales del usuario
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
        const userId = user?.id || 'demo-user-id'
        const [enrollRes, statsRes] = await Promise.all([
          getUserEnrollments(userId),
          getUserGlobalProgress(userId),
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
  }, [user, isDemo])

  const navigate = (view: string) => {
    setActiveView(view)
    if (view === 'courses' || view === 'exam' || view === 'learning') {
      onNavigate(view)
    }
  }

  const sendMessage = () => {
    if (!aiMessage.trim()) return
    const newHistory = [
      ...aiHistory,
      { role: 'user', text: aiMessage },
      {
        role: 'ai',
        text: 'Excelente pregunta. El Decreto 1278 evalúa cuatro ejes: competencias funcionales, comportamentales, aportes pedagógicos y autoevaluación. ¿Quieres repasar preguntas de ejemplo?',
      },
    ]
    setAiHistory(newHistory)
    setAiMessage('')
  }

  // Nombre y datos del usuario real
  const displayName = profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Docente')
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'MT'
  const userAvatar = getAvatarUrl(profile?.avatar_url)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -280 }}
        className={`fixed lg:relative z-40 flex flex-col w-72 h-full bg-card border-r border-border/60 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border/60 shadow-md group-hover:scale-105 transition-all duration-300 shrink-0 bg-neutral-900">
              <img src="/logo.jpg" alt="Maestro Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold font-display text-foreground">Maestro</span>
          </button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors">
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
                  <p className="text-[11px] text-muted-foreground truncate capitalize">
                    {role === 'admin' ? 'Administrador' : role === 'instructor' ? 'Instructor' : 'Docente'}
                    {isDemo && ' · Modo Demo'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Cursos inscritos</span>
                  <span className="text-xs font-semibold text-foreground">{enrollments.length}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-muted-foreground mb-3">Inicia sesión para ver tu progreso</p>
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
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          {SIDEBAR_ITEMS.map(({ icon: Icon, label, view }) => (
            <button
              key={view}
              onClick={() => navigate(view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-all duration-200 ${
                activeView === view
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.8} />
              {label}
            </button>
          ))}
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
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card/60 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar en tus cursos..."
                className="pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-transparent focus:border-primary/30 focus:outline-none text-sm text-foreground placeholder-muted-foreground w-72 transition-all"
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
                  Buenos días, {displayName} 👋
                </h1>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  {isAuthenticated
                    ? 'Bienvenido a tu panel de preparación y crecimiento profesional.'
                    : 'Inicia sesión para guardar tus avances y resultados.'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('exam')}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all btn-magnetic"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Simulacro rápido
              </button>
            </motion.div>

            {/* Error banner si falla Supabase */}
            {error && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Error al cargar tus datos de Supabase: {error}</span>
                </div>
              </div>
            )}

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: BookOpen,
                  label: 'Cursos inscritos',
                  value: `${enrollments.length} cursos`,
                  sub: enrollments.length > 0 ? 'Activos en plataforma' : 'Sin cursos aún',
                  color: 'text-blue-500 bg-blue-500/10',
                },
                {
                  icon: CheckCircle2,
                  label: 'Lecciones completadas',
                  value: `${stats?.completedLessonsCount || 0}`,
                  sub: 'Avance verificado',
                  color: 'text-emerald-500 bg-emerald-500/10',
                },
                {
                  icon: Clock,
                  label: 'Horas de estudio',
                  value: `${stats?.totalStudyHours || 0}h`,
                  sub: 'Tiempo registrado',
                  color: 'text-violet-500 bg-violet-500/10',
                },
                {
                  icon: Target,
                  label: 'Promedio simulacros',
                  value: '84.2%',
                  sub: 'Competencias MEN',
                  color: 'text-orange-500 bg-orange-500/10',
                },
              ].map(({ icon: Icon, label, value, sub, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="p-5 rounded-2xl glass border border-border/60 hover:border-primary/20 transition-colors card-lift"
                >
                  <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
                    <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="font-display font-bold text-xl text-foreground">{value}</p>
                  <p className="text-xs mt-1 text-muted-foreground">{sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Main grid */}
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
                    <h3 className="font-display font-semibold text-foreground">Evolución de rendimiento</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Puntuaciones de estudio y práctica</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    +27 pts
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PROGRESS_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1a56db" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: 12 }}
                        labelStyle={{ color: 'var(--foreground)' }}
                        itemStyle={{ color: '#1a56db' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#1a56db" strokeWidth={2.5} fill="url(#scoreGrad)" dot={false} />
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
                <h3 className="font-display font-semibold text-foreground mb-1">Radar de competencias</h3>
                <p className="text-xs text-muted-foreground mb-4">Alineación con el Decreto 1278</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={RADAR_DATA}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                      <Radar dataKey="A" stroke="#1a56db" fill="#1a56db" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Courses + AI */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Mis Cursos reales */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl glass border border-border/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display font-semibold text-foreground">Mis Cursos</h3>
                    <button onClick={() => onNavigate('courses')} className="text-xs text-primary font-semibold hover:underline">
                      Explorar catálogo →
                    </button>
                  </div>

                  {/* Empty state si no tiene cursos */}
                  {enrollments.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-xl bg-muted/20 border border-dashed border-border">
                      <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs font-semibold text-foreground mb-1">
                        No tienes cursos inscritos todavía
                      </p>
                      <p className="text-[11px] text-muted-foreground mb-4">
                        Explora los cursos de pedagogía, legislación y evaluación disponibles.
                      </p>
                      <button
                        onClick={() => onNavigate('courses')}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow"
                      >
                        Ver catálogo de cursos
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enrollments.map((enr) => {
                        const c = enr.course
                        if (!c) return null
                        return (
                          <div
                            key={enr.id}
                            onClick={() => {
                              if (onSelectCourse) onSelectCourse(c.slug)
                              else onNavigate('learning')
                            }}
                            className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-muted/50 border border-border/40 transition-colors cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5 text-white" strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {c.category || 'Formación general'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-primary">Continuar</span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
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
                transition={{ delay: 0.45 }}
                className="flex flex-col p-6 rounded-2xl glass border border-border/60"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
                    <Brain className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">Asistente IA</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-500 font-medium">Activo ahora</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar max-h-44 mb-4">
                  {aiHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                    placeholder="Pregunta algo sobre tu preparación..."
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

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl glass border border-border/60"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-semibold text-foreground">Logros e hitos</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {ACHIEVEMENTS.map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2.5 px-4 py-3 rounded-2xl glass border border-border/60">
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
    </div>
  )
}
