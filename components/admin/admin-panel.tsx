'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, BookOpen, Target, BarChart3, Settings,
  Plus, CheckCircle2, AlertCircle, Search, Filter,
  ArrowLeft, ArrowRight, UserPlus, Sparkles, RefreshCw,
  Lock, Mail, User, Layers, FileText, ChevronRight, Check
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { canAccessAdmin, UserRole, AdminUserListItem } from '@/types/database'
import { getAdminUsersList, updateUserRole, createAdminUser, getPlatformOverview, PlatformOverviewStats } from '@/services/admin'
import { getCourses, updateCourse } from '@/services/courses'
import { Course } from '@/types/database'
import Link from 'next/link'

type AdminSection =
  | 'overview'
  | 'users'
  | 'teachers'
  | 'students'
  | 'roles'
  | 'courses'
  | 'modules'
  | 'exams'

export default function AdminPanel() {
  const { user, profile, role, session, isLoading } = useAuth()
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')

  // Datos
  const [stats, setStats] = useState<PlatformOverviewStats | null>(null)
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')

  // Modal de Creación de Usuario
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState<UserRole>('student')
  const [creatingUser, setCreatingUser] = useState(false)
  const [createFeedback, setCreateFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Feedback de cambio de rol
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null)

  const token = session?.access_token

  const loadAll = useCallback(async () => {
    setLoadingData(true)
    const [statsRes, usersRes, coursesRes] = await Promise.all([
      getPlatformOverview(),
      getAdminUsersList(token),
      getCourses(),
    ])

    if (statsRes.data) setStats(statsRes.data)
    if (usersRes.data) setUsers(usersRes.data)
    if (coursesRes.data) setCourses(coursesRes.data)
    setLoadingData(false)
  }, [token])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const hasAccess = canAccessAdmin(role)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Protección estricta: Solo Superusuarios (admin)
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background aurora-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl glass border border-rose-500/30 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Panel Exclusivo de Superusuarios
          </h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Se requieren privilegios de Administrador Supremo de MaestroTech para acceder a la gestión global de usuarios, roles y configuración de plataforma.
          </p>
          <div className="space-y-2">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Manejar cambio de rol interactivo
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setRoleUpdatingId(userId)
    const { success, error } = await updateUserRole(userId, newRole)
    setRoleUpdatingId(null)

    if (success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
    } else {
      alert(error?.message || 'Error al actualizar rol')
    }
  }

  // Manejar cambio de estado de publicación de curso
  const handleTogglePublish = async (courseId: string, currentPublished: boolean) => {
    const res = await updateCourse(courseId, { published: !currentPublished })
    if (res.data) {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, published: !currentPublished } : c))
      )
    }
  }

  // Manejar creación segura de usuario vía API Route
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateFeedback(null)
    setCreatingUser(true)

    const res = await createAdminUser(
      {
        firstName: formFirstName,
        lastName: formLastName,
        email: formEmail,
        temporaryPassword: formPassword,
        role: formRole,
      },
      token || ''
    )

    setCreatingUser(false)

    if (res.error) {
      setCreateFeedback({ type: 'error', text: res.error.message })
    } else {
      setCreateFeedback({
        type: 'success',
        text: res.message || 'Usuario creado exitosamente con credenciales y rol asignado.',
      })
      setFormFirstName('')
      setFormLastName('')
      setFormEmail('')
      setFormPassword('')
      await loadAll()
      setTimeout(() => {
        setIsCreateModalOpen(false)
        setCreateFeedback(null)
      }, 1500)
    }
  }

  // Filtrado de usuarios
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar Superusuario */}
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border/60 bg-card/70 backdrop-blur-md shrink-0 p-6 flex flex-col justify-between">
        <div>
          {/* Header Marca */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-border/60 shadow-md group-hover:scale-105 transition-all duration-300 shrink-0 bg-neutral-900">
                <img src="/logo.jpg" alt="Maestro Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-bold font-display text-foreground text-sm block">Maestro</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  Panel de Control
                </span>
              </div>
            </Link>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30">
              Admin
            </span>
          </div>

          {/* Superusuario activo */}
          <div className="mb-6 p-3 rounded-2xl bg-muted/40 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {(profile?.full_name || 'Admin')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{profile?.full_name || 'Superusuario'}</p>
                <p className="text-[10px] text-emerald-400 font-medium">Control Total del Sistema</p>
              </div>
            </div>
          </div>

          {/* Menú de Secciones */}
          <nav className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                ADMINISTRACIÓN
              </p>
              <div className="space-y-1">
                {[
                  { id: 'overview', label: 'Resumen Global', icon: BarChart3 },
                  { id: 'users', label: 'Todos los Usuarios', icon: Users },
                  { id: 'teachers', label: 'Cuerpo Docente', icon: Sparkles },
                  { id: 'students', label: 'Estudiantes Inscritos', icon: Users },
                  { id: 'roles', label: 'Roles y Permisos', icon: Shield },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id as AdminSection)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      activeSection === id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                CONTENIDO & EVALUACIÓN
              </p>
              <div className="space-y-1">
                {[
                  { id: 'courses', label: 'Gestión de Cursos', icon: BookOpen },
                  { id: 'modules', label: 'Módulos y Lecciones', icon: Layers },
                  { id: 'exams', label: 'Exámenes y Preguntas', icon: Target },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id as AdminSection)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      activeSection === id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Accesos rápidos inferiores */}
        <div className="pt-6 border-t border-border/50 space-y-2">
          <Link
            href="/teacher"
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Ir a Panel Docente
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a MaestroTech
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 aurora-bg">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Bar de la sección */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium mb-2 border border-violet-500/20">
                <Shield className="w-3.5 h-3.5" />
                Superusuario MaestroTech
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                {activeSection === 'overview' && 'Resumen Ejecutivo y Métricas'}
                {activeSection === 'users' && 'Directorio Global de Usuarios'}
                {activeSection === 'teachers' && 'Gestión de Docentes y Formadores'}
                {activeSection === 'students' && 'Estudiantes y Matrículas Activas'}
                {activeSection === 'roles' && 'Matriz de Permisos del Sistema'}
                {activeSection === 'courses' && 'Catálogo y Publicación de Cursos'}
                {activeSection === 'modules' && 'Módulos Curriculares y Clases'}
                {activeSection === 'exams' && 'Banco Oficial de Preguntas y Simulacros'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadAll()}
                className="p-2.5 rounded-xl glass border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setCreateFeedback(null)
                  setIsCreateModalOpen(true)
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all btn-magnetic"
              >
                <UserPlus className="w-4 h-4" /> Crear Usuario
              </button>
            </div>
          </div>

          {/* SECCIÓN: RESUMEN GLOBAL */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* KPIs de usuarios y contenido */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: 'Total Usuarios',
                    value: stats?.totalUsers || users.length,
                    sub: `${stats?.totalAdmins || 0} Superusuarios`,
                    color: 'text-blue-500 bg-blue-500/10',
                    icon: Users,
                  },
                  {
                    title: 'Cuerpo Docente',
                    value: stats?.totalInstructors || 0,
                    sub: 'Instructores verificados',
                    color: 'text-violet-500 bg-violet-500/10',
                    icon: Sparkles,
                  },
                  {
                    title: 'Estudiantes',
                    value: stats?.totalStudents || 0,
                    sub: 'Docentes en formación',
                    color: 'text-emerald-500 bg-emerald-500/10',
                    icon: Users,
                  },
                  {
                    title: 'Cursos Activos',
                    value: stats?.publishedCourses || 0,
                    sub: `De ${stats?.totalCourses || courses.length} creados`,
                    color: 'text-orange-500 bg-orange-500/10',
                    icon: BookOpen,
                  },
                ].map((kpi, idx) => (
                  <motion.div
                    key={kpi.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-5 rounded-2xl glass border border-border/60"
                  >
                    <div className={`w-9 h-9 rounded-xl ${kpi.color} flex items-center justify-center mb-3`}>
                      <kpi.icon className="w-4.5 h-4.5" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{kpi.title}</p>
                    <p className="font-display font-bold text-2xl text-foreground">{kpi.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{kpi.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Accesos rápidos */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl glass border border-border/60 space-y-4">
                  <h3 className="font-display font-bold text-base text-foreground">Acceso Directo a Docencia</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Como superusuario, tienes permisos plenos para ingresar a la vista de instructores y crear o actualizar programas pedagógicos sin restricciones.
                  </p>
                  <Link
                    href="/teacher"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow"
                  >
                    Abrir Panel Docente <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="p-6 rounded-3xl glass border border-border/60 space-y-4">
                  <h3 className="font-display font-bold text-base text-foreground">Superusuarios Registrados</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Las cuentas designadas con <code className="text-violet-400 font-mono">role = &apos;admin&apos;</code> gozan de inmunidad jerárquica y facultades de administración global.
                  </p>
                  <button
                    onClick={() => {
                      setRoleFilter('admin')
                      setActiveSection('users')
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-border/70 hover:bg-muted text-xs font-semibold text-foreground"
                  >
                    Ver Superusuarios ({users.filter((u) => u.role === 'admin').length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN: USUARIOS / DOCENTES / ESTUDIANTES */}
          {(activeSection === 'users' || activeSection === 'teachers' || activeSection === 'students') && (
            <div className="space-y-4">
              {/* Barra de filtros y búsqueda */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/70 focus:border-primary/50 text-xs sm:text-sm text-foreground placeholder-muted-foreground outline-none"
                  />
                </div>

                {activeSection === 'users' && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    {(['all', 'admin', 'instructor', 'student'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRoleFilter(r)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                          roleFilter === r
                            ? 'bg-primary text-primary-foreground'
                            : 'glass border border-border/60 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {r === 'all' ? 'Todos' : r === 'admin' ? 'Admins' : r === 'instructor' ? 'Docentes' : 'Alumnos'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabla de Usuarios */}
              <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Correo Electrónico</th>
                        <th className="p-4">Rol en Plataforma</th>
                        <th className="p-4">Fecha de Registro</th>
                        <th className="p-4 text-right">Asignar Rol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No se encontraron usuarios coincidentes.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {(u.full_name || 'U')[0].toUpperCase()}
                                </div>
                                <span className="font-semibold text-foreground">{u.full_name || 'Sin nombre'}</span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground font-mono text-[11px]">{u.email || '—'}</td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  u.role === 'admin'
                                    ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                                    : u.role === 'instructor'
                                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                }`}
                              >
                                {u.role === 'admin' ? 'Superusuario' : u.role === 'instructor' ? 'Docente' : 'Estudiante'}
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString('es-CO')}
                            </td>
                            <td className="p-4 text-right">
                              <select
                                disabled={roleUpdatingId === u.id}
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                className="px-2.5 py-1.5 rounded-lg bg-muted/80 border border-border/80 text-xs font-medium text-foreground outline-none cursor-pointer focus:border-primary"
                              >
                                <option value="student">Estudiante</option>
                                <option value="instructor">Docente</option>
                                <option value="admin">Administrador / Superusuario</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN: ROLES Y PERMISOS (MATRIZ) */}
          {activeSection === 'roles' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl glass border border-border/60">
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  Jerarquía de Permisos: Admin $\ge$ Instructor $\ge$ Student
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  La plataforma opera bajo el principio de herencia inclusiva de privilegios. Los superusuarios administran el ecosistema y cuentan con plenas facultades pedagógicas docentes sin intermediaciones.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-violet-500/30 bg-violet-500/5 space-y-3">
                    <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                      <Shield className="w-4 h-4" /> Superusuario (admin)
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Crear y administrar usuarios
                      </li>
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Asignar y revocar roles
                      </li>
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Acceso simultáneo a /admin y /teacher
                      </li>
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Crear, publicar y eliminar cursos
                      </li>
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Ver métricas financieras y de uso
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <Sparkles className="w-4 h-4" /> Docente (instructor)
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Acceso al panel /teacher
                      </li>
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Crear cursos, módulos y lecciones
                      </li>
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Subir materiales (PDF, PPTX)
                      </li>
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Crear exámenes y preguntas
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground/60">
                        <Lock className="w-3.5 h-3.5" /> Sin acceso a /admin ni roles
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Users className="w-4 h-4" /> Estudiante (student)
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Acceso a cursos matriculados
                      </li>
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Descarga de materiales permitidos
                      </li>
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Registro de progreso individual
                      </li>
                      <li className="flex items-center gap-2 text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Presentación de simulacros
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground/60">
                        <Lock className="w-3.5 h-3.5" /> Sin acceso a paneles privados
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN: CURSOS (PUBLICACIÓN / GESTIÓN GLOBAL) */}
          {activeSection === 'courses' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">Título del Programa</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4">Precio</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-semibold text-foreground">{c.title}</td>
                        <td className="p-4 text-muted-foreground">{c.category || 'General'}</td>
                        <td className="p-4 font-mono text-muted-foreground">
                          {c.price === 0 ? 'Gratis' : `$${Number(c.price).toLocaleString()} COP`}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              c.published
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {c.published ? 'Público' : 'Borrador'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleTogglePublish(c.id, c.published)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              c.published
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {c.published ? 'Despublicar' : 'Publicar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECCIONES COMPLEMENTARIAS */}
          {(activeSection === 'modules' || activeSection === 'exams') && (
            <div className="p-10 rounded-3xl glass border border-border/60 text-center max-w-xl mx-auto space-y-4">
              <Sparkles className="w-10 h-10 text-primary mx-auto" />
              <h3 className="font-display font-bold text-base text-foreground">
                Gestión Centralizada de {activeSection === 'modules' ? 'Módulos' : 'Evaluaciones'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Puedes diseñar y añadir contenidos directamente desde el Panel Docente o utilizar las funciones de administración masiva.
              </p>
              <Link
                href="/teacher"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow"
              >
                Abrir herramientas en Panel Docente
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* MODAL CREAR USUARIO (OPERACIÓN SEGURA DE SERVIDOR) */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl glass border border-border/80 bg-card/95 shadow-2xl p-7 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground">Crear Usuario en el Sistema</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  ✕
                </button>
              </div>

              {createFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-4 ${
                    createFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}
                >
                  {createFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{createFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      placeholder="Luis"
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border/80 text-xs text-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Apellido</label>
                    <input
                      type="text"
                      required
                      placeholder="Alfonso"
                      value={formLastName}
                      onChange={(e) => setFormLastName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border/80 text-xs text-foreground outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@ejemplo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border/80 text-xs text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Contraseña Temporal</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border/80 text-xs text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Rol a Asignar</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border/80 text-xs text-foreground outline-none cursor-pointer"
                  >
                    <option value="student">Estudiante</option>
                    <option value="instructor">Docente (Instructor)</option>
                    <option value="admin">Administrador / Superusuario</option>
                  </select>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:shadow-lg disabled:opacity-50"
                  >
                    {creatingUser ? 'Creando en servidor...' : 'Crear Usuario'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl glass border border-border text-xs text-foreground"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
