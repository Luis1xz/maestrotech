'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, BookOpen, Target, BarChart3, Settings,
  Plus, CheckCircle2, AlertCircle, Search, Filter,
  ArrowLeft, ArrowRight, UserPlus, Sparkles, RefreshCw,
  Lock, Mail, User, Layers, FileText, ChevronRight, Check, Trash2, CreditCard, ExternalLink, CheckCircle,
  UserCheck, GraduationCap, Compass, Briefcase, MapPin, Phone, Eye
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { canAccessAdmin, UserRole, AdminUserListItem } from '@/types/database'
import { CandidateProfile } from '@/types/candidate'
import { getAllCandidates } from '@/services/candidate'
import { COLOMBIA_DEPARTMENTS } from '@/lib/colombia-data'
import { getAdminUsersList, updateUserRole, createAdminUser, deleteAdminUser, getPlatformOverview, PlatformOverviewStats } from '@/services/admin'
import { getAllCoursesForTeacher, updateCourse } from '@/services/courses'
import {
  enrollInCourse,
  getAllEnrollmentsForTeacher,
  EnrollmentWithStudentAndCourse,
} from '@/services/enrollments'
import { getAllNequiPayments, confirmNequiPayment, NequiPaymentRecord } from '@/services/payments'
import { Course } from '@/types/database'
import Link from 'next/link'

type AdminSection =
  | 'overview'
  | 'candidates'
  | 'users'
  | 'teachers'
  | 'students'
  | 'roles'
  | 'courses'
  | 'modules'
  | 'exams'
  | 'payments'

export default function AdminPanel() {
  const { user, profile, role, session, isLoading } = useAuth()
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')

  // Datos
  const [stats, setStats] = useState<PlatformOverviewStats | null>(null)
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<EnrollmentWithStudentAndCourse[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')

  // Matrícula manual de estudiante por el Administrador
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [enrollingStudent, setEnrollingStudent] = useState(false)
  const [enrollFeedback, setEnrollFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Modal de Creación de Usuario
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState<UserRole>('student')
  const [creatingUser, setCreatingUser] = useState(false)
  const [createFeedback, setCreateFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Feedback de cambio de rol y eliminación
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [roleFeedback, setRoleFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Pagos Nequi Negocio
  const [nequiPayments, setNequiPayments] = useState<NequiPaymentRecord[]>([])
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null)
  const [paymentFeedback, setPaymentFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Caracterización y Diagnóstico de Aspirantes (Legado Docente)
  const [candidates, setCandidates] = useState<CandidateProfile[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null)
  const [candidateRoleFilter, setCandidateRoleFilter] = useState<string>('all')
  const [candidateEduFilter, setCandidateEduFilter] = useState<string>('all')
  const [candidateDeptFilter, setCandidateDeptFilter] = useState<string>('all')
  const [candidateExpTeachingFilter, setCandidateExpTeachingFilter] = useState<string>('all')
  const [candidateExpMgmtFilter, setCandidateExpMgmtFilter] = useState<string>('all')
  const [candidatePedagogyFilter, setCandidatePedagogyFilter] = useState<string>('all')
  const [candidateSearchQuery, setCandidateSearchQuery] = useState<string>('')

  const token = session?.access_token

  const loadAll = useCallback(async () => {
    setLoadingData(true)
    const [statsRes, usersRes, coursesRes, enrollsRes, paymentsRes, candidatesRes] = await Promise.all([
      getPlatformOverview(),
      getAdminUsersList(token),
      getAllCoursesForTeacher(),
      getAllEnrollmentsForTeacher(),
      getAllNequiPayments(),
      getAllCandidates(),
    ])

    if (statsRes.data) setStats(statsRes.data)
    if (usersRes.data) {
      setUsers(usersRes.data)
      setSelectedStudentId((prev) => prev || usersRes.data?.[0]?.id || '')
    }
    if (coursesRes.data) {
      setCourses(coursesRes.data)
      setSelectedCourseId((prev) => prev || coursesRes.data?.[0]?.id || '')
    }
    if (enrollsRes.data) setEnrollments(enrollsRes.data)
    if (paymentsRes) setNequiPayments(paymentsRes)
    if (candidatesRes) setCandidates(candidatesRes)
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
      <div className="min-h-screen bg-[#F3F8FD] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-rose-200 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-2xl text-[#142D49] mb-2">
            Panel Exclusivo de Superusuarios
          </h2>
          <p className="text-xs text-[#536B83] mb-6 leading-relaxed">
            Se requieren privilegios de Administrador Supremo de Legado Docente para acceder a la gestión global de usuarios, roles y configuración de plataforma.
          </p>
          <div className="space-y-2">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Manejar cambio de rol interactivo
  const handleRoleChange = async (targetUser: AdminUserListItem, newRole: UserRole) => {
    setRoleUpdatingId(targetUser.id)
    setRoleFeedback(null)
    const { success, error } = await updateUserRole(targetUser.id, newRole, targetUser, token)
    setRoleUpdatingId(null)

    if (success) {
      const updatedAt = new Date().toISOString()
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, role: newRole, role_updated_at: updatedAt } : u
        )
      )
      const roleLabel =
        newRole === 'admin'
          ? 'Superusuario (Administrador)'
          : newRole === 'instructor'
          ? 'Docente (Instructor)'
          : 'Estudiante'
      setRoleFeedback({
        type: 'success',
        text: `Rol de "${targetUser.full_name || targetUser.email}" actualizado a ${roleLabel}.`,
      })
    } else {
      setRoleFeedback({
        type: 'error',
        text: error?.message || 'Error al actualizar el rol del usuario.',
      })
    }
  }

  // Manejar eliminación de usuario
  const handleDeleteUser = async (targetUser: AdminUserListItem) => {
    if (user?.id === targetUser.id) {
      alert('No puedes eliminar tu propia cuenta de superusuario en sesión activa.')
      return
    }
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente al usuario "${targetUser.full_name || targetUser.email}"?\n\nEsta acción revocará su acceso a la plataforma y removerá sus matrículas activas.`
    )
    if (!confirmDelete) return

    setDeletingUserId(targetUser.id)
    setRoleFeedback(null)
    const { success, error } = await deleteAdminUser(targetUser.id, targetUser.email, token)
    setDeletingUserId(null)

    if (success) {
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id))
      setRoleFeedback({
        type: 'success',
        text: `Usuario "${targetUser.full_name || targetUser.email}" eliminado exitosamente del sistema.`,
      })
    } else {
      setRoleFeedback({
        type: 'error',
        text: error?.message || 'Error al eliminar usuario.',
      })
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

  // Matricular manualmente a un estudiante en un curso (exclusivo Admin)
  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnrollFeedback(null)
    if (!selectedStudentId || !selectedCourseId) {
      setEnrollFeedback({
        type: 'error',
        text: 'Selecciona el estudiante y el curso para activar la matrícula.',
      })
      return
    }

    setEnrollingStudent(true)
    const { error } = await enrollInCourse(selectedStudentId, selectedCourseId)
    setEnrollingStudent(false)

    if (error) {
      setEnrollFeedback({ type: 'error', text: error.message })
    } else {
      const st = users.find((u) => u.id === selectedStudentId)
      const cr = courses.find((c) => c.id === selectedCourseId)
      setEnrollFeedback({
        type: 'success',
        text: `Matrícula activada exitosamente para ${st?.full_name || st?.email || 'el estudiante'} en «${cr?.title || 'el curso'}».`,
      })
      await loadAll()
    }
  }

  // Confirmar pago Nequi y activar matrícula instantánea
  const handleConfirmNequiPayment = async (paymentId: string) => {
    setPaymentFeedback(null)
    setConfirmingPaymentId(paymentId)
    const adminName = profile?.full_name || 'Superusuario Legado Docente'
    const res = await confirmNequiPayment(paymentId, adminName)
    setConfirmingPaymentId(null)

    if (res.success) {
      setPaymentFeedback({
        type: 'success',
        text: `¡Pago confirmado exitosamente! El estudiante ha sido matriculado de inmediato.`,
      })
      await loadAll()
    } else {
      setPaymentFeedback({
        type: 'error',
        text: res.error || 'No se pudo confirmar el pago.',
      })
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
    if (activeSection === 'teachers') {
      return matchSearch && (u.role === 'instructor' || u.role === 'admin')
    }
    if (activeSection === 'students') {
      return matchSearch && u.role === 'student'
    }
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="min-h-screen bg-[#F3F8FD] text-[#142D49] flex flex-col md:flex-row">
      {/* Sidebar Superusuario */}
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-[#E5EDF5] bg-white shrink-0 p-6 flex flex-col justify-between shadow-xs">
        <div>
          {/* Header Marca */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-[#E5EDF5] shadow-xs group-hover:scale-105 transition-all duration-300 shrink-0 bg-white">
                <img src="/logo-icon.png" alt="Legado Docente" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-bold font-display text-[#142D49] text-sm block">Legado Docente</span>
                <span className="text-[10px] text-[#536B83] uppercase tracking-widest font-semibold">
                  Panel de Control
                </span>
              </div>
            </Link>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#142D49] text-white">
              Admin
            </span>
          </div>

          {/* Superusuario activo */}
          <div className="mb-6 p-3 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#142D49] flex items-center justify-center text-white text-xs font-bold">
                {(profile?.full_name || 'Admin')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#142D49] truncate">{profile?.full_name || 'Superusuario'}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Control Total del Sistema</p>
              </div>
            </div>
          </div>

          {/* Menú de Secciones */}
          <nav className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-[#536B83] uppercase tracking-widest px-3 mb-2">
                ADMINISTRACIÓN
              </p>
              <div className="space-y-1">
                {[
                  { id: 'overview', label: 'Resumen Global', icon: BarChart3 },
                  { id: 'candidates', label: 'Aspirantes & Diagnóstico', icon: UserCheck },
                  { id: 'payments', label: 'Pagos en Línea', icon: CreditCard },
                  { id: 'users', label: 'Todos los Usuarios', icon: Users },
                  { id: 'teachers', label: 'Cuerpo Docente', icon: Sparkles },
                  { id: 'students', label: 'Estudiantes Inscritos', icon: Users },
                  { id: 'roles', label: 'Roles y Permisos', icon: Shield },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id as AdminSection)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeSection === id
                        ? 'bg-[#176FC1] text-white shadow-xs'
                        : 'text-[#536B83] hover:bg-[#F3F8FD] hover:text-[#142D49]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-[#536B83] uppercase tracking-widest px-3 mb-2">
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
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeSection === id
                        ? 'bg-[#176FC1] text-white shadow-xs'
                        : 'text-[#536B83] hover:bg-[#F3F8FD] hover:text-[#142D49]'
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
        <div className="pt-6 border-t border-[#E5EDF5] space-y-2">
          <Link
            href="/teacher"
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Ir a Panel Docente
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-[#536B83] hover:text-[#142D49] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Legado Docente
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#F3F8FD]">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Bar de la sección */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0045E6]/10 text-[#0045E6] text-xs font-semibold mb-2 border border-[#0045E6]/20">
                <Shield className="w-3.5 h-3.5" />
                Superusuario Legado Docente
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-[#142D49]">
                {activeSection === 'overview' && 'Resumen Ejecutivo y Métricas'}
                {activeSection === 'candidates' && 'Caracterización Inteligente de Aspirantes Docentes'}
                {activeSection === 'payments' && 'Gestión y Confirmación de Pagos en Línea'}
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
                className="p-2.5 rounded-xl bg-white border border-[#E5EDF5] hover:bg-[#F3F8FD] text-[#536B83] hover:text-[#142D49] transition-colors shadow-xs"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setCreateFeedback(null)
                  setIsCreateModalOpen(true)
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-bold shadow-md shadow-[#176FC1]/20 transition-all"
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
                    color: 'text-[#176FC1] bg-[#176FC1]/10',
                    icon: Users,
                  },
                  {
                    title: 'Cuerpo Docente',
                    value: stats?.totalInstructors || 0,
                    sub: 'Instructores verificados',
                    color: 'text-[#142D49] bg-[#142D49]/10',
                    icon: Sparkles,
                  },
                  {
                    title: 'Estudiantes',
                    value: stats?.totalStudents || 0,
                    sub: 'Docentes en formación',
                    color: 'text-emerald-600 bg-emerald-50',
                    icon: Users,
                  },
                  {
                    title: 'Cursos Activos',
                    value: stats?.publishedCourses || 0,
                    sub: `De ${stats?.totalCourses || courses.length} creados`,
                    color: 'text-[#E9A83A] bg-[#E9A83A]/15',
                    icon: BookOpen,
                  },
                ].map((kpi, idx) => (
                  <motion.div
                    key={kpi.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-5 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs"
                  >
                    <div className={`w-9 h-9 rounded-xl ${kpi.color} flex items-center justify-center mb-3`}>
                      <kpi.icon className="w-4.5 h-4.5" />
                    </div>
                    <p className="text-xs text-[#536B83] mb-1 font-medium">{kpi.title}</p>
                    <p className="font-display font-bold text-2xl text-[#142D49]">{kpi.value}</p>
                    <p className="text-[11px] text-[#536B83] mt-1">{kpi.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Accesos rápidos */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-base text-[#142D49]">Acceso Directo a Docencia</h3>
                  <p className="text-xs text-[#536B83] leading-relaxed">
                    Como superusuario, tienes permisos plenos para ingresar a la vista de instructores y crear o actualizar programas pedagógicos sin restricciones.
                  </p>
                  <Link
                    href="/teacher"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Abrir Panel Docente <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-base text-[#142D49]">Superusuarios Registrados</h3>
                  <p className="text-xs text-[#536B83] leading-relaxed">
                    Las cuentas designadas con <code className="text-[#176FC1] font-mono">role = &apos;admin&apos;</code> gozan de inmunidad jerárquica y facultades de administración global.
                  </p>
                  <button
                    onClick={() => {
                      setRoleFilter('admin')
                      setActiveSection('users')
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5EDF5] hover:bg-[#F3F8FD] text-xs font-semibold text-[#142D49] shadow-xs transition-colors"
                  >
                    Ver Superusuarios ({users.filter((u) => u.role === 'admin').length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN: CARACTERIZACIÓN INTELIGENTE DE ASPIRANTES (LEGADO DOCENTE) */}
          {activeSection === 'candidates' && (
            <div className="space-y-6">
              {/* Métricas Principales de Aspirantes */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                <div className="p-4 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs">
                  <p className="text-[11px] text-[#536B83] font-medium mb-1">Aspirantes Caracterizados</p>
                  <p className="font-display font-bold text-2xl text-[#142D49]">{candidates.length}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">Expedientes completos</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs">
                  <p className="text-[11px] text-[#536B83] font-medium mb-1">Docentes de Aula</p>
                  <p className="font-display font-bold text-2xl text-[#0045E6]">
                    {candidates.filter((c) => c.target_role === 'docente_aula').length}
                  </p>
                  <p className="text-[10px] text-[#536B83] mt-1">
                    {candidates.length > 0
                      ? `${Math.round(
                          (candidates.filter((c) => c.target_role === 'docente_aula').length /
                            candidates.length) *
                            100
                        )}% del total`
                      : '0%'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs">
                  <p className="text-[11px] text-[#536B83] font-medium mb-1">Docentes Orientadores</p>
                  <p className="font-display font-bold text-2xl text-[#142D49]">
                    {candidates.filter((c) => c.target_role === 'docente_orientador').length}
                  </p>
                  <p className="text-[10px] text-[#536B83] mt-1">Psicosocial y orientación</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs">
                  <p className="text-[11px] text-[#536B83] font-medium mb-1">Cargos Directivos</p>
                  <p className="font-display font-bold text-2xl text-[#142D49]">
                    {
                      candidates.filter((c) =>
                        ['coordinador', 'rector', 'director_rural'].includes(c.target_role)
                      ).length
                    }
                  </p>
                  <p className="text-[10px] text-[#536B83] mt-1">Coordinador / Rector / Dir.</p>
                </div>

                <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#E5A83B]/10 border border-[#E5A83B]/30 shadow-xs">
                  <p className="text-[11px] text-[#C89228] font-bold mb-1">Sin Formación Pedagógica</p>
                  <p className="font-display font-bold text-2xl text-[#142D49]">
                    {
                      candidates.filter(
                        (c) =>
                          c.pedagogical_training === 'no' &&
                          c.education_level_highest !== 'licenciado' &&
                          c.education_level_highest !== 'normalista_superior'
                      ).length
                    }
                  </p>
                  <p className="text-[10px] text-[#C89228] font-semibold mt-1">Requieren nivelación</p>
                </div>
              </div>

              {/* Barra de Filtros Inteligentes */}
              <div className="p-5 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-3.5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536B83]" />
                    <input
                      type="text"
                      placeholder="Buscar por aspirante, correo, título o municipio..."
                      value={candidateSearchQuery}
                      onChange={(e) => setCandidateSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] focus:border-[#0045E6] text-xs text-[#142D49] outline-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setCandidateRoleFilter('all')
                      setCandidateEduFilter('all')
                      setCandidateDeptFilter('all')
                      setCandidateExpTeachingFilter('all')
                      setCandidateExpMgmtFilter('all')
                      setCandidatePedagogyFilter('all')
                      setCandidateSearchQuery('')
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#E5EDF5] hover:bg-[#F3F8FD] text-xs font-semibold text-[#536B83] hover:text-[#142D49] transition-colors"
                  >
                    Restablecer filtros
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-xs">
                  {/* Filtro Cargo */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#536B83] uppercase mb-1">Cargo</label>
                    <select
                      value={candidateRoleFilter}
                      onChange={(e) => setCandidateRoleFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                    >
                      <option value="all">Todos los cargos</option>
                      <option value="docente_aula">Docente de Aula</option>
                      <option value="docente_orientador">Docente Orientador</option>
                      <option value="coordinador">Coordinador</option>
                      <option value="rector">Rector</option>
                      <option value="director_rural">Director Rural</option>
                      <option value="orientacion_requerida">Por Definir</option>
                    </select>
                  </div>

                  {/* Filtro Formación */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#536B83] uppercase mb-1">Formación</label>
                    <select
                      value={candidateEduFilter}
                      onChange={(e) => setCandidateEduFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                    >
                      <option value="all">Toda formación</option>
                      <option value="licenciado">Licenciado</option>
                      <option value="profesional_no_licenciado">No Licenciado</option>
                      <option value="normalista_superior">Normalista</option>
                      <option value="posgrado">Posgrado (Esp/Mg/Dr)</option>
                    </select>
                  </div>

                  {/* Filtro Departamento */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#536B83] uppercase mb-1">Departamento</label>
                    <select
                      value={candidateDeptFilter}
                      onChange={(e) => setCandidateDeptFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                    >
                      <option value="all">Todos (32 Deptos)</option>
                      {Object.keys(COLOMBIA_DEPARTMENTS).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro Experiencia Docente */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#536B83] uppercase mb-1">Exp. Docente</label>
                    <select
                      value={candidateExpTeachingFilter}
                      onChange={(e) => setCandidateExpTeachingFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                    >
                      <option value="all">Indiferente</option>
                      <option value="con_exp">Con experiencia</option>
                      <option value="sin_exp">Sin experiencia</option>
                    </select>
                  </div>

                  {/* Filtro Experiencia Directiva */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#536B83] uppercase mb-1">Exp. Directiva</label>
                    <select
                      value={candidateExpMgmtFilter}
                      onChange={(e) => setCandidateExpMgmtFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                    >
                      <option value="all">Indiferente</option>
                      <option value="con_exp">Con exp directiva</option>
                      <option value="sin_exp">Sin exp directiva</option>
                    </select>
                  </div>

                  {/* Filtro Formación Pedagógica */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#536B83] uppercase mb-1">Pedagogía</label>
                    <select
                      value={candidatePedagogyFilter}
                      onChange={(e) => setCandidatePedagogyFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                    >
                      <option value="all">Indiferente</option>
                      <option value="con_pedagogia">Con pedagogía</option>
                      <option value="sin_pedagogia">Sin pedagogía</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabla de Aspirantes Caracterizados */}
              <div className="rounded-3xl border border-[#E5EDF5] bg-white overflow-hidden shadow-xs">
                <div className="p-4 border-b border-[#E5EDF5] flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-[#142D49]">
                    Aspirantes Filtrados ({
                      candidates.filter((c) => {
                        if (candidateRoleFilter !== 'all' && c.target_role !== candidateRoleFilter) return false
                        if (candidateEduFilter !== 'all') {
                          if (candidateEduFilter === 'posgrado') {
                            if (!['especialista', 'magister', 'doctor'].includes(c.education_level_highest))
                              return false
                          } else if (c.education_level_highest !== candidateEduFilter) {
                            return false
                          }
                        }
                        if (candidateDeptFilter !== 'all' && c.department !== candidateDeptFilter) return false
                        if (candidateExpTeachingFilter === 'con_exp' && !c.has_teaching_experience) return false
                        if (candidateExpTeachingFilter === 'sin_exp' && c.has_teaching_experience) return false
                        if (
                          candidateExpMgmtFilter === 'con_exp' &&
                          !c.has_directorship_experience &&
                          !c.has_management_experience
                        )
                          return false
                        if (
                          candidateExpMgmtFilter === 'sin_exp' &&
                          (c.has_directorship_experience || c.has_management_experience)
                        )
                          return false
                        if (
                          candidatePedagogyFilter === 'con_pedagogia' &&
                          c.pedagogical_training !== 'si' &&
                          c.education_level_highest !== 'licenciado'
                        )
                          return false
                        if (
                          candidatePedagogyFilter === 'sin_pedagogia' &&
                          (c.pedagogical_training === 'si' || c.education_level_highest === 'licenciado')
                        )
                          return false
                        if (candidateSearchQuery.trim()) {
                          const q = candidateSearchQuery.toLowerCase()
                          const name = `${c.first_name} ${c.last_name}`.toLowerCase()
                          const em = (c.email || '').toLowerCase()
                          const muni = (c.municipality || '').toLowerCase()
                          const title = (c.professional_title || '').toLowerCase()
                          if (!name.includes(q) && !em.includes(q) && !muni.includes(q) && !title.includes(q))
                            return false
                        }
                        return true
                      }).length
                    })
                  </h4>
                  <button
                    onClick={() => loadAll()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5EDF5] hover:bg-[#F3F8FD] text-xs text-[#536B83] hover:text-[#142D49] transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                    Actualizar
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E5EDF5] text-[#536B83] uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="p-3.5">Aspirante</th>
                        <th className="p-3.5">Ubicación & Teléfono</th>
                        <th className="p-3.5">Cargo Concurso</th>
                        <th className="p-3.5">Formación Académica</th>
                        <th className="p-3.5">Exp. Docente</th>
                        <th className="p-3.5">Pedagogía</th>
                        <th className="p-3.5">Clasificación</th>
                        <th className="p-3.5 text-right">Ficha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EDF5]">
                      {candidates
                        .filter((c) => {
                          if (candidateRoleFilter !== 'all' && c.target_role !== candidateRoleFilter) return false
                          if (candidateEduFilter !== 'all') {
                            if (candidateEduFilter === 'posgrado') {
                              if (!['especialista', 'magister', 'doctor'].includes(c.education_level_highest))
                                return false
                            } else if (c.education_level_highest !== candidateEduFilter) {
                              return false
                            }
                          }
                          if (candidateDeptFilter !== 'all' && c.department !== candidateDeptFilter) return false
                          if (candidateExpTeachingFilter === 'con_exp' && !c.has_teaching_experience) return false
                          if (candidateExpTeachingFilter === 'sin_exp' && c.has_teaching_experience) return false
                          if (
                            candidateExpMgmtFilter === 'con_exp' &&
                            !c.has_directorship_experience &&
                            !c.has_management_experience
                          )
                            return false
                          if (
                            candidateExpMgmtFilter === 'sin_exp' &&
                            (c.has_directorship_experience || c.has_management_experience)
                          )
                            return false
                          if (
                            candidatePedagogyFilter === 'con_pedagogia' &&
                            c.pedagogical_training !== 'si' &&
                            c.education_level_highest !== 'licenciado'
                          )
                            return false
                          if (
                            candidatePedagogyFilter === 'sin_pedagogia' &&
                            (c.pedagogical_training === 'si' || c.education_level_highest === 'licenciado')
                          )
                            return false
                          if (candidateSearchQuery.trim()) {
                            const q = candidateSearchQuery.toLowerCase()
                            const name = `${c.first_name} ${c.last_name}`.toLowerCase()
                            const em = (c.email || '').toLowerCase()
                            const muni = (c.municipality || '').toLowerCase()
                            const title = (c.professional_title || '').toLowerCase()
                            if (!name.includes(q) && !em.includes(q) && !muni.includes(q) && !title.includes(q))
                              return false
                          }
                          return true
                        })
                        .map((cand) => {
                          const hasPedagogy =
                            cand.pedagogical_training === 'si' ||
                            cand.education_level_highest === 'licenciado' ||
                            cand.education_level_highest === 'normalista_superior'

                          return (
                            <tr key={cand.id} className="hover:bg-[#F8FAFC] transition-colors">
                              <td className="p-3.5">
                                <p className="font-bold text-[#142D49]">
                                  {cand.first_name} {cand.last_name}
                                </p>
                                <p className="text-[11px] text-[#536B83] font-mono">{cand.email}</p>
                              </td>

                              <td className="p-3.5 text-[#536B83]">
                                <p className="font-medium text-[#142D49]">
                                  {cand.municipality}, {cand.department}
                                </p>
                                <p className="text-[11px] text-[#536B83]">{cand.phone_number || 'Sin celular'}</p>
                              </td>

                              <td className="p-3.5">
                                <span className="font-bold text-[#0045E6] capitalize block">
                                  {cand.target_role.replace('_', ' ')}
                                </span>
                                {cand.subject_area && (
                                  <span className="text-[11px] text-[#536B83] capitalize">
                                    Área: {cand.subject_area.replace('_', ' ')}
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5">
                                <p className="font-medium text-[#142D49] max-w-[160px] truncate">
                                  {cand.professional_title || 'No especificado'}
                                </p>
                                <p className="text-[10px] text-[#536B83] uppercase tracking-wider font-semibold">
                                  {cand.education_level_highest.replace('_', ' ')}
                                </p>
                              </td>

                              <td className="p-3.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    cand.has_teaching_experience
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-gray-100 text-[#536B83]'
                                  }`}
                                >
                                  {cand.has_teaching_experience ? 'Con experiencia' : 'Sin experiencia'}
                                </span>
                              </td>

                              <td className="p-3.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    hasPedagogy
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-[#E5A83B]/15 text-[#C89228] border border-[#E5A83B]/30'
                                  }`}
                                >
                                  {hasPedagogy ? 'Formación Sí' : 'Sin Pedagogía'}
                                </span>
                              </td>

                              <td className="p-3.5">
                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                  {(cand.tags || []).slice(0, 2).map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[9px] px-1.5 py-0.2 rounded bg-[#F3F8FD] text-[#0045E6] font-mono border border-[#E5EDF5]"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => setSelectedCandidate(cand)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0045E6] hover:bg-[#142D49] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Ficha</span>
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MODAL / DRAWER DE FICHA TÉCNICA DEL ASPIRANTE */}
              <AnimatePresence>
                {selectedCandidate && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2545]/70 backdrop-blur-md overflow-y-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative w-full max-w-2xl rounded-3xl bg-white border border-[#E5EDF5] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#142D49] space-y-5"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-[#E5EDF5]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#0045E6]/10 text-[#0045E6] flex items-center justify-center font-bold">
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-base text-[#142D49]">
                              Expediente y Diagnóstico del Aspirante
                            </h3>
                            <p className="text-xs text-[#536B83]">
                              {selectedCandidate.first_name} {selectedCandidate.last_name} · {selectedCandidate.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedCandidate(null)}
                          className="p-1.5 rounded-lg text-[#536B83] hover:text-[#142D49] hover:bg-[#F3F8FD]"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Etiquetas del Aspirante */}
                      <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EDF5] space-y-1.5">
                        <span className="text-[10px] font-bold text-[#536B83] uppercase tracking-wider block">
                          Clasificación de Normativa Docente
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCandidate.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2.5 py-0.5 rounded-full bg-white border border-[#E5EDF5] text-xs font-bold text-[#0045E6]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Etapas 1 & 2 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EDF5] space-y-1.5">
                          <span className="font-bold text-[#0045E6] uppercase text-[10px] tracking-wider block">
                            1. Contacto y Ubicación
                          </span>
                          <p><strong className="text-[#536B83]">Residencia:</strong> {selectedCandidate.municipality}, {selectedCandidate.department}</p>
                          <p><strong className="text-[#536B83]">Celular:</strong> {selectedCandidate.phone_number || 'No registrado'}</p>
                          <p><strong className="text-[#536B83]">Consentimiento Ley 1581:</strong> Aceptado</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EDF5] space-y-1.5">
                          <span className="font-bold text-[#0045E6] uppercase text-[10px] tracking-wider block">
                            2. Aspiración al Concurso
                          </span>
                          <p><strong className="text-[#536B83]">Cargo Objetivo:</strong> <span className="capitalize font-bold text-[#0045E6]">{selectedCandidate.target_role.replace('_', ' ')}</span></p>
                          {selectedCandidate.education_level && (
                            <p><strong className="text-[#536B83]">Nivel:</strong> {selectedCandidate.education_level}</p>
                          )}
                          {selectedCandidate.subject_area && (
                            <p><strong className="text-[#536B83]">Área:</strong> {selectedCandidate.subject_area}</p>
                          )}
                          <p><strong className="text-[#536B83]">Proceso:</strong> {selectedCandidate.process_type}</p>
                        </div>
                      </div>

                      {/* Etapa 3: Formación */}
                      <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs space-y-2">
                        <span className="font-bold text-[#0045E6] uppercase text-[10px] tracking-wider block">
                          3. Formación Académica y Pedagógica
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <p><strong className="text-[#536B83]">Nivel Más Alto:</strong> {selectedCandidate.education_level_highest}</p>
                          <p><strong className="text-[#536B83]">Título:</strong> {selectedCandidate.professional_title}</p>
                          <p><strong className="text-[#536B83]">Institución:</strong> {selectedCandidate.institution_name}</p>
                          <p><strong className="text-[#536B83]">Año:</strong> {selectedCandidate.graduation_year}</p>
                        </div>
                        <div className="pt-2 border-t border-[#E5EDF5]">
                          <p>
                            <strong className="text-[#536B83]">Formación Pedagógica:</strong>{' '}
                            <span className="font-bold text-[#142D49]">{selectedCandidate.pedagogical_training}</span>
                          </p>
                          {selectedCandidate.pedagogical_training_details?.type && (
                            <p className="text-[11px] text-[#536B83] mt-0.5">
                              {selectedCandidate.pedagogical_training_details.type} · {selectedCandidate.pedagogical_training_details.institution}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Etapas 4 & 5 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EDF5] space-y-1.5">
                          <span className="font-bold text-[#0045E6] uppercase text-[10px] tracking-wider block">
                            4. Experiencia
                          </span>
                          <p><strong className="text-[#536B83]">Laboral Total:</strong> {selectedCandidate.total_work_experience || 'No'}</p>
                          <p><strong className="text-[#536B83]">Docente:</strong> {selectedCandidate.has_teaching_experience ? `${selectedCandidate.teaching_experience_years || ''} (${selectedCandidate.teaching_institution_type || ''})` : 'Sin experiencia'}</p>
                          <p><strong className="text-[#536B83]">Directiva:</strong> {selectedCandidate.has_directorship_experience ? 'Sí cuenta con experiencia' : 'No'}</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EDF5] space-y-1.5">
                          <span className="font-bold text-[#0045E6] uppercase text-[10px] tracking-wider block">
                            5. Diagnóstico & Hábitos
                          </span>
                          <p><strong className="text-[#536B83]">Historial Examen:</strong> {selectedCandidate.previous_exam_experience}</p>
                          <p><strong className="text-[#536B83]">Conocimiento:</strong> {selectedCandidate.knowledge_level}</p>
                          <p><strong className="text-[#536B83]">Dedicación:</strong> {selectedCandidate.study_time}</p>
                          <p><strong className="text-[#536B83]">Objetivo:</strong> {selectedCandidate.preparation_goal}</p>
                        </div>
                      </div>

                      {/* Dificultades / Temas de interés */}
                      {selectedCandidate.difficulty_topics?.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-[#E5A83B]/10 border border-[#E5A83B]/30 text-xs space-y-1.5">
                          <span className="text-[10px] font-bold text-[#C89228] uppercase tracking-wider block">
                            Temas prioritarios a reforzar por el aspirante
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCandidate.difficulty_topics.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded-lg bg-white text-[#142D49] border border-[#E5EDF5] text-[11px] font-semibold"
                              >
                                ✓ {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* SECCIÓN: PAGOS EN LÍNEA & MATRÍCULAS */}
          {activeSection === 'payments' && (
            <div className="space-y-6">
              {/* Feedback de confirmación */}
              {paymentFeedback && (
                <div
                  className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
                    paymentFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {paymentFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  )}
                  <span className="font-medium">{paymentFeedback.text}</span>
                </div>
              )}

              {/* Métricas de Pagos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs">
                  <p className="text-xs text-[#536B83] mb-1 font-medium">Total Recaudado en Línea</p>
                  <p className="font-display font-bold text-2xl text-[#142D49] font-mono">
                    ${nequiPayments
                      .filter((p) => p.status === 'completed')
                      .reduce((acc, p) => acc + (p.amount || 0), 0)
                      .toLocaleString('es-CO')}{' '}
                    COP
                  </p>
                  <p className="text-[11px] text-[#536B83] mt-1">Transacciones verificadas</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E9A83A]/30 shadow-xs">
                  <p className="text-xs text-[#E9A83A] font-bold mb-1">Pagos Pendientes por Validar</p>
                  <p className="font-display font-bold text-2xl text-[#142D49]">
                    {nequiPayments.filter((p) => p.status === 'pending').length}
                  </p>
                  <p className="text-[11px] text-[#536B83] mt-1">Requieren confirmación de 1 clic</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs">
                  <p className="text-xs text-emerald-600 font-bold mb-1">Matrículas Activas Verificadas</p>
                  <p className="font-display font-bold text-2xl text-[#142D49]">
                    {nequiPayments.filter((p) => p.status === 'completed').length}
                  </p>
                  <p className="text-[11px] text-[#536B83] mt-1">Estudiantes con acceso Pro</p>
                </div>
              </div>

              {/* Tabla de pagos */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#142D49]">
                      Registro de Órdenes de Pago
                    </h3>
                    <p className="text-xs text-[#536B83]">
                      Revisa los comprobantes reportados y confirma para activar la matrícula de inmediato.
                    </p>
                  </div>
                  <button
                    onClick={() => loadAll()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5EDF5] hover:bg-[#F3F8FD] text-xs text-[#536B83] hover:text-[#142D49] transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                    Actualizar pagos
                  </button>
                </div>

                {nequiPayments.length === 0 ? (
                  <div className="text-center py-12 text-xs text-[#536B83]">
                    No hay transacciones registradas aún.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E5EDF5] text-[#536B83]">
                          <th className="pb-3 font-semibold">Estudiante</th>
                          <th className="pb-3 font-semibold">Curso / Plan</th>
                          <th className="pb-3 font-semibold">Valor</th>
                          <th className="pb-3 font-semibold">Comprobante / Referencia</th>
                          <th className="pb-3 font-semibold">Fecha</th>
                          <th className="pb-3 font-semibold">Estado</th>
                          <th className="pb-3 font-semibold text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5EDF5]">
                        {nequiPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-[#F3F8FD] transition-colors">
                            <td className="py-4 pr-3">
                              <p className="font-bold text-[#142D49]">{p.userName}</p>
                              <p className="text-[11px] text-[#536B83] font-mono">{p.userEmail}</p>
                            </td>
                            <td className="py-4 pr-3">
                              <p className="font-semibold text-[#142D49] truncate max-w-[200px]">
                                {p.courseTitle}
                              </p>
                              <p className="text-[10px] text-[#176FC1] font-semibold">{p.planName || 'Docente Pro'}</p>
                            </td>
                            <td className="py-4 pr-3 font-mono font-bold text-[#142D49]">
                              ${p.amount?.toLocaleString('es-CO')} COP
                            </td>
                            <td className="py-4 pr-3">
                              <div className="space-y-0.5">
                                <span className="inline-block px-2 py-0.5 rounded bg-[#176FC1]/10 text-[#176FC1] font-mono font-bold text-[11px]">
                                  {p.nequiReference}
                                </span>
                                {p.nequiPhone && (
                                  <p className="text-[10px] text-[#536B83]">Contacto: {p.nequiPhone}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 pr-3 text-[#536B83] text-[11px]">
                              {new Date(p.createdAt).toLocaleDateString('es-CO', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-4 pr-3">
                              {p.status === 'completed' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                  <Check className="w-3 h-3" /> Matriculado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E9A83A]/15 text-[#E9A83A] text-[10px] font-bold border border-[#E9A83A]/30">
                                  Pendiente
                                </span>
                              )}
                            </td>
                            <td className="py-4 text-right">
                              {p.status === 'pending' ? (
                                <button
                                  onClick={() => handleConfirmNequiPayment(p.id)}
                                  disabled={confirmingPaymentId === p.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-colors"
                                >
                                  {confirmingPaymentId === p.id ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      Activando...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Confirmar y Matricular
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-semibold">
                                  Verificado ✓
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN: USUARIOS / DOCENTES / ESTUDIANTES */}
          {(activeSection === 'users' || activeSection === 'teachers' || activeSection === 'students') && (
            <div className="space-y-6">
              {/* Panel de Matrícula Manual de Estudiantes (Exclusivo Administrador) */}
              {(activeSection === 'students' || activeSection === 'users') && (
                <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Control Exclusivo de Matrículas
                      </span>
                      <h3 className="font-display font-bold text-base text-[#142D49] mt-1.5">
                        Matricular Estudiante Manualmente en un Curso
                      </h3>
                      <p className="text-xs text-[#536B83]">
                        Los estudiantes nuevos no pueden auto-matricularse. Selecciona aquí al estudiante y el programa para habilitar su acceso a videoclases y recursos PDF.
                      </p>
                    </div>
                  </div>

                  {enrollFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        enrollFeedback.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-800'
                      }`}
                    >
                      {enrollFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      )}
                      <span>{enrollFeedback.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleManualEnroll} className="grid md:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#536B83] mb-1">
                        1. Seleccionar Estudiante / Usuario
                      </label>
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name || 'Estudiante'} ({u.email || u.id.slice(0, 8)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#536B83] mb-1">
                        2. Seleccionar Curso a Habilitar
                      </label>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} {c.published ? '(Publicado)' : '(Borrador)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={enrollingStudent}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      {enrollingStudent ? 'Activando matrícula...' : 'Activar Matrícula Manualmente'}
                    </button>
                  </form>

                  {/* Resumen de Matrículas Activas */}
                  {enrollments.length > 0 && (
                    <div className="pt-3 border-t border-[#E5EDF5]">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#536B83] mb-2">
                        Matrículas Activas Actuales ({enrollments.length})
                      </p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {enrollments.map((enr) => (
                          <div
                            key={enr.id}
                            className="p-3 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-[#142D49] truncate">
                                {enr.student_name}
                              </p>
                              <p className="text-[10px] text-[#536B83] font-mono truncate">
                                {enr.student_email}
                              </p>
                              <p className="text-[11px] text-emerald-700 font-semibold truncate mt-0.5">
                                ✓ {enr.course?.title || 'Curso matriculado'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Barra de filtros y búsqueda */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536B83]" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5EDF5] focus:border-[#176FC1] text-xs sm:text-sm text-[#142D49] placeholder-[#536B83] outline-none shadow-xs"
                  />
                </div>

                {activeSection === 'users' && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#536B83]" />
                    {(['all', 'admin', 'instructor', 'student'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRoleFilter(r)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                          roleFilter === r
                            ? 'bg-[#176FC1] text-white shadow-xs'
                            : 'bg-white border border-[#E5EDF5] text-[#536B83] hover:text-[#142D49] hover:bg-[#F3F8FD]'
                        }`}
                      >
                        {r === 'all' ? 'Todos' : r === 'admin' ? 'Admins' : r === 'instructor' ? 'Docentes' : 'Alumnos'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {roleFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                    roleFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {roleFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{roleFeedback.text}</span>
                </div>
              )}

              {/* Tabla de Usuarios */}
              <div className="rounded-2xl border border-[#E5EDF5] bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F3F8FD] border-b border-[#E5EDF5] text-[#536B83] uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Correo Electrónico</th>
                        <th className="p-4">Rol en Plataforma</th>
                        <th className="p-4">Fecha de Registro</th>
                        <th className="p-4 text-right">Asignar Rol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EDF5]">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#536B83]">
                            No se encontraron usuarios coincidentes.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-[#F3F8FD] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#176FC1] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {(u.full_name || 'U')[0].toUpperCase()}
                                </div>
                                <span className="font-semibold text-[#142D49]">{u.full_name || 'Sin nombre'}</span>
                              </div>
                            </td>
                            <td className="p-4 text-[#536B83] font-mono text-[11px]">{u.email || '—'}</td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  u.role === 'admin'
                                    ? 'bg-[#142D49] text-white'
                                    : u.role === 'instructor'
                                    ? 'bg-[#176FC1]/10 text-[#176FC1] border border-[#176FC1]/20'
                                    : 'bg-[#39BDEB]/15 text-[#176FC1] border border-[#39BDEB]/30'
                                }`}
                              >
                                {u.role === 'admin' ? 'Superusuario' : u.role === 'instructor' ? 'Docente' : 'Estudiante'}
                              </span>
                            </td>
                            <td className="p-4 text-[#536B83]">
                              {new Date(u.created_at).toLocaleDateString('es-CO')}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  disabled={roleUpdatingId === u.id || deletingUserId === u.id}
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#F3F8FD] border border-[#E5EDF5] text-xs font-medium text-[#142D49] outline-none cursor-pointer focus:border-[#176FC1]"
                                >
                                  <option value="student">Estudiante</option>
                                  <option value="instructor">Docente</option>
                                  <option value="admin">Administrador / Superusuario</option>
                                </select>
                                <button
                                  type="button"
                                  disabled={deletingUserId === u.id || user?.id === u.id}
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 rounded-lg text-[#536B83] hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                  title={user?.id === u.id ? 'No puedes auto-eliminar tu cuenta activa' : 'Eliminar usuario del sistema'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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
              <div className="p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs">
                <h3 className="font-display font-bold text-lg text-[#142D49] mb-2">
                  Jerarquía de Permisos: Admin $\ge$ Instructor $\ge$ Student
                </h3>
                <p className="text-xs text-[#536B83] leading-relaxed mb-6">
                  La plataforma opera bajo el principio de herencia inclusiva de privilegios. Los superusuarios administran el ecosistema y cuentan con plenas facultades pedagógicas docentes sin intermediaciones.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-[#142D49]/30 bg-[#F3F8FD] space-y-3">
                    <div className="flex items-center gap-2 text-[#142D49] font-bold text-sm">
                      <Shield className="w-4 h-4 text-[#176FC1]" /> Superusuario (admin)
                    </div>
                    <ul className="text-xs text-[#536B83] space-y-2">
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Crear y administrar usuarios
                      </li>
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Asignar y revocar roles
                      </li>
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Acceso simultáneo a /admin y /teacher
                      </li>
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Crear, publicar y eliminar cursos
                      </li>
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Ver métricas financieras y de uso
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl border border-[#176FC1]/30 bg-[#F3F8FD] space-y-3">
                    <div className="flex items-center gap-2 text-[#176FC1] font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-[#39BDEB]" /> Docente (instructor)
                    </div>
                    <ul className="text-xs text-[#536B83] space-y-2">
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Acceso al panel /teacher
                      </li>
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Crear cursos, módulos y lecciones
                      </li>
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Subir materiales (PDF, PPTX)
                      </li>
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Crear exámenes y preguntas
                      </li>
                      <li className="flex items-center gap-2 text-[#536B83]/60">
                        <Lock className="w-3.5 h-3.5" /> Sin acceso a /admin ni roles
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl border border-emerald-200 bg-[#F3F8FD] space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                      <Users className="w-4 h-4 text-emerald-600" /> Estudiante (student)
                    </div>
                    <ul className="text-xs text-[#536B83] space-y-2">
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Acceso a cursos matriculados
                      </li>
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Descarga de materiales permitidos
                      </li>
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Registro de progreso individual
                      </li>
                      <li className="flex items-center gap-2 text-[#142D49]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Presentación de simulacros
                      </li>
                      <li className="flex items-center gap-2 text-[#536B83]/60">
                        <Lock className="w-3.5 h-3.5" /> Sin acceso a paneles privados
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {roleFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                    roleFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {roleFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{roleFeedback.text}</span>
                </div>
              )}

              <div className="rounded-2xl border border-[#E5EDF5] bg-white overflow-hidden shadow-xs">
                <div className="p-4 border-b border-[#E5EDF5] flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-[#142D49]">
                    Asignación Directa de Roles ({users.length} usuarios)
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F3F8FD] border-b border-[#E5EDF5] text-[#536B83] uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Correo Electrónico</th>
                        <th className="p-4">Rol Actual</th>
                        <th className="p-4 text-right">Cambiar Rol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EDF5]">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#F3F8FD] transition-colors">
                          <td className="p-4 font-semibold text-[#142D49]">{u.full_name || 'Sin nombre'}</td>
                          <td className="p-4 text-[#536B83] font-mono text-[11px]">{u.email || '—'}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-[#142D49] text-white'
                                  : u.role === 'instructor'
                                  ? 'bg-[#176FC1]/10 text-[#176FC1] border border-[#176FC1]/20'
                                  : 'bg-[#39BDEB]/15 text-[#176FC1] border border-[#39BDEB]/30'
                              }`}
                            >
                              {u.role === 'admin' ? 'Superusuario' : u.role === 'instructor' ? 'Docente' : 'Estudiante'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <select
                                disabled={roleUpdatingId === u.id || deletingUserId === u.id}
                                value={u.role}
                                onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#F3F8FD] border border-[#E5EDF5] text-xs font-medium text-[#142D49] outline-none cursor-pointer focus:border-[#176FC1]"
                              >
                                <option value="student">Estudiante</option>
                                <option value="instructor">Docente</option>
                                <option value="admin">Administrador / Superusuario</option>
                              </select>
                              <button
                                type="button"
                                disabled={deletingUserId === u.id || user?.id === u.id}
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg text-[#536B83] hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                title={user?.id === u.id ? 'No puedes auto-eliminar tu cuenta activa' : 'Eliminar usuario del sistema'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN: CURSOS (PUBLICACIÓN / GESTIÓN GLOBAL) */}
          {activeSection === 'courses' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#E5EDF5] bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3F8FD] border-b border-[#E5EDF5] text-[#536B83] uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">Título del Programa</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4">Precio</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EDF5]">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F3F8FD] transition-colors">
                        <td className="p-4 font-semibold text-[#142D49]">{c.title}</td>
                        <td className="p-4 text-[#536B83]">{c.category || 'General'}</td>
                        <td className="p-4 font-mono text-[#142D49]">
                          {c.price === 0 ? 'Gratis' : `$${Number(c.price).toLocaleString()} COP`}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              c.published
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-[#E9A83A]/15 text-[#E9A83A] border border-[#E9A83A]/30'
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
                                ? 'bg-[#E9A83A]/10 hover:bg-[#E9A83A]/20 text-[#E9A83A]'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
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
            <div className="p-10 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs text-center max-w-xl mx-auto space-y-4">
              <Sparkles className="w-10 h-10 text-[#176FC1] mx-auto" />
              <h3 className="font-display font-bold text-base text-[#142D49]">
                Gestión Centralizada de {activeSection === 'modules' ? 'Módulos' : 'Evaluaciones'}
              </h3>
              <p className="text-xs text-[#536B83] leading-relaxed">
                Puedes diseñar y añadir contenidos directamente desde el Panel Docente o utilizar las funciones de administración masiva.
              </p>
              <Link
                href="/teacher"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-semibold shadow-xs transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#142D49]/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-[#E5EDF5] shadow-2xl p-7 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#176FC1]/10 text-[#176FC1] flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#142D49]">Crear Usuario en el Sistema</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#536B83] hover:text-[#142D49] hover:bg-[#F3F8FD] transition-colors"
                >
                  ✕
                </button>
              </div>

              {createFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-4 ${
                    createFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {createFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{createFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#536B83] mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      placeholder="Luis"
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] text-xs text-[#142D49] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#536B83] mb-1">Apellido</label>
                    <input
                      type="text"
                      required
                      placeholder="Alfonso"
                      value={formLastName}
                      onChange={(e) => setFormLastName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] text-xs text-[#142D49] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#536B83] mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@ejemplo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] text-xs text-[#142D49] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#536B83] mb-1">Contraseña Temporal</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] text-xs text-[#142D49] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#536B83] mb-1">Rol a Asignar</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] text-xs text-[#142D49] outline-none cursor-pointer"
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
                    className="flex-1 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {creatingUser ? 'Creando en servidor...' : 'Crear Usuario'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#E5EDF5] text-xs font-semibold text-[#536B83] hover:text-[#142D49] hover:bg-[#F3F8FD] transition-colors"
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
