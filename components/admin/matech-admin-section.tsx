'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  Search,
  Filter,
  UserCheck,
  Shield,
  BarChart3,
  Sliders,
  History,
  AlertTriangle,
  ChevronDown,
  X,
  FileUp,
  Cpu,
  Layers,
  HelpCircle,
  Database,
  Calendar,
  User as UserIcon,
} from 'lucide-react'
import { Course } from '@/types/database'
import { AdminUserListItem } from '@/types/database'
import {
  MaTechDocument,
  MaTechTeacherPermission,
  MaTechSettings,
  MaTechUsageStats,
  MaTechAuditLog,
} from '@/types/matech'

interface MaTechAdminSectionProps {
  courses: Course[]
  users: AdminUserListItem[]
}

type SubTab = 'documents' | 'teachers' | 'limits' | 'audit'

export default function MaTechAdminSection({ courses, users }: MaTechAdminSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('documents')
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Documentos
  const [documents, setDocuments] = useState<MaTechDocument[]>([])
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all')
  const [searchDocQuery, setSearchDocQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Modal subir documento
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadCourseId, setUploadCourseId] = useState<string>('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadAutoPublish, setUploadAutoPublish] = useState(true)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Permisos Docentes
  const [permissions, setPermissions] = useState<MaTechTeacherPermission[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')
  const [selectedPermissionCourseId, setSelectedPermissionCourseId] = useState<string>('')
  const [canUpload, setCanUpload] = useState(true)
  const [canPublish, setCanPublish] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [isSavingPermission, setIsSavingPermission] = useState(false)

  // Límites y configuración
  const [settings, setSettings] = useState<MaTechSettings | null>(null)
  const [stats, setStats] = useState<MaTechUsageStats | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Auditoría
  const [auditLogs, setAuditLogs] = useState<MaTechAuditLog[]>([])

  // Modal de error de procesamiento
  const [errorModalDoc, setErrorModalDoc] = useState<MaTechDocument | null>(null)

  // Carga inicial
  const loadAllData = async () => {
    setIsLoading(true)
    try {
      // 1. Cargar documentos
      const docsRes = await fetch('/api/matech/documents')
      if (docsRes.ok) {
        const docsData = await docsRes.json()
        setDocuments(docsData.documents || [])
      }

      // 2. Cargar permisos
      const permRes = await fetch('/api/matech/permissions')
      if (permRes.ok) {
        const permData = await permRes.json()
        setPermissions(permData.permissions || [])
      }

      // 3. Cargar configuración, estadísticas y auditoría
      const setRes = await fetch('/api/matech/settings?include_audit=true')
      if (setRes.ok) {
        const setData = await setRes.json()
        setSettings(setData.settings)
        setStats(setData.stats)
        setAuditLogs(setData.auditLogs || [])
      }
    } catch (err: any) {
      console.error('Error cargando datos de MaTech:', err)
      setFeedback({ type: 'error', message: 'No se pudieron cargar todos los datos de MaTech.' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const teachers = users.filter((u) => u.role === 'instructor' || u.role === 'admin')

  // Auto-clear feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // ========================================================
  // ACCIONES DE DOCUMENTOS
  // ========================================================
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) {
      setFeedback({ type: 'error', message: 'Selecciona un archivo PDF, DOCX, TXT, PPTX o XLSX.' })
      return
    }
    if (!uploadCourseId) {
      setFeedback({ type: 'error', message: 'Selecciona el curso al que pertenece el documento.' })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('course_id', uploadCourseId)
    formData.append('title', uploadTitle || uploadFile.name.replace(/\.[^/.]+$/, ''))
    formData.append('auto_publish', uploadAutoPublish ? 'true' : 'false')
    const targetCourse = courses.find((c) => c.id === uploadCourseId)
    if (targetCourse) formData.append('course_title', targetCourse.title)

    try {
      const res = await fetch('/api/matech/documents', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar el archivo')

      setFeedback({ type: 'success', message: data.message || 'Documento procesado exitosamente.' })
      setIsUploadModalOpen(false)
      setUploadFile(null)
      setUploadTitle('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadAllData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error en la subida' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleTogglePublish = async (doc: MaTechDocument) => {
    const newAction = doc.status === 'published' ? 'unpublish' : 'publish'
    try {
      const res = await fetch(`/api/matech/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newAction }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cambiar estado')

      setFeedback({
        type: 'success',
        message: newAction === 'publish' ? 'Documento publicado en MaTech.' : 'Documento despublicado.',
      })
      loadAllData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  const handleReprocess = async (doc: MaTechDocument) => {
    try {
      const res = await fetch(`/api/matech/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reprocess' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al reprocesar')

      setFeedback({ type: 'success', message: 'Documento en cola para reprocesamiento.' })
      loadAllData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  const handleDeleteDoc = async (doc: MaTechDocument) => {
    if (!confirm(`¿Eliminar definitivamente "${doc.title}" y todos sus fragmentos vectoriales?`)) {
      return
    }
    try {
      const res = await fetch(`/api/matech/documents/${doc.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar')

      setFeedback({ type: 'success', message: 'Documento y fragmentos eliminados.' })
      loadAllData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  // ========================================================
  // ACCIONES DE PERMISOS DOCENTES
  // ========================================================
  const handleSavePermission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeacherId || !selectedPermissionCourseId) {
      setFeedback({ type: 'error', message: 'Selecciona un docente y un curso.' })
      return
    }

    setIsSavingPermission(true)
    const teacherObj = users.find((u) => u.id === selectedTeacherId)
    const courseObj = courses.find((c) => c.id === selectedPermissionCourseId)

    try {
      const res = await fetch('/api/matech/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: selectedTeacherId,
          teacher_name: teacherObj?.full_name || teacherObj?.email || 'Docente',
          course_id: selectedPermissionCourseId,
          course_title: courseObj?.title || 'Curso',
          can_upload: canUpload,
          can_publish: canPublish,
          can_delete: canDelete,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar permiso')

      setFeedback({ type: 'success', message: 'Permiso asignado exitosamente.' })
      setSelectedTeacherId('')
      setSelectedPermissionCourseId('')
      setCanUpload(true)
      setCanPublish(false)
      setCanDelete(false)
      loadAllData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setIsSavingPermission(false)
    }
  }

  const handleRevokePermission = async (perm: MaTechTeacherPermission) => {
    if (!confirm(`¿Revocar permisos de MaTech para este docente en este curso?`)) return
    try {
      const res = await fetch('/api/matech/permissions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: perm.teacher_id,
          course_id: perm.course_id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al revocar')

      setFeedback({ type: 'success', message: 'Permiso revocado exitosamente.' })
      loadAllData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  // ========================================================
  // GUARDAR CONFIGURACIÓN DE LÍMITES
  // ========================================================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setIsSavingSettings(true)
    try {
      const res = await fetch('/api/matech/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daily_limit_per_student: Number(settings.daily_limit_per_student),
          monthly_limit_per_student: Number(settings.monthly_limit_per_student),
          cooldown_seconds: Number(settings.cooldown_seconds),
          max_concurrent_requests: Number(settings.max_concurrent_requests),
          max_question_chars: Number(settings.max_question_chars),
          max_context_chunks: Number(settings.max_context_chunks),
          global_budget_tokens: Number(settings.global_budget_tokens),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar límites')

      setFeedback({ type: 'success', message: 'Límites de MaTech actualizados.' })
      loadAllData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Filtrado de documentos
  const filteredDocuments = documents.filter((doc) => {
    if (selectedCourseFilter !== 'all' && doc.course_id !== selectedCourseFilter) return false
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false
    if (searchDocQuery.trim()) {
      const q = searchDocQuery.toLowerCase()
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.file_name.toLowerCase().includes(q) ||
        (doc.uploaded_by_name && doc.uploaded_by_name.toLowerCase().includes(q))
      )
    }
    return true
  })

  // Cálculos de consumo de tokens y alerta
  const budget = settings?.global_budget_tokens || 10000000
  const usedTokens = stats?.totalTokens || 0
  const usagePercent = Math.min(100, Math.round((usedTokens / budget) * 100))

  return (
    <div className="space-y-6">
      {/* Cabecera MaTech */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#142D49] via-[#0D1F33] to-[#142D49] p-6 lg:p-8 text-white shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E78B24]/20 border border-[#E78B24]/40 text-[#F5B563] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#E78B24]" />
              <span>Mentor Pedagógico Inteligente • RAG Vectorial</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Cerebro de MaTech <span className="text-[#E78B24] font-normal">| Administración</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Control central del conocimiento académico, asignación de permisos a docentes,
              límites de consumo y auditoría. Cada curso cuenta con una base vectorial 100% aislada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E78B24] to-[#F59E0B] text-white text-xs font-bold hover:shadow-lg hover:shadow-[#E78B24]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Cargar Documento</span>
            </button>
            <button
              onClick={loadAllData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Resumen rápido superior */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[11px] text-slate-400 font-medium">Documentos Totales</p>
            <p className="text-xl font-bold text-white mt-0.5">{documents.length}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[11px] text-slate-400 font-medium">Docentes con Acceso</p>
            <p className="text-xl font-bold text-[#F5B563] mt-0.5">{permissions.length}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[11px] text-slate-400 font-medium">Preguntas Hoy</p>
            <p className="text-xl font-bold text-[#34D399] mt-0.5">{stats?.dailyQuestions || 0}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[11px] text-slate-400 font-medium">Presupuesto Tokens</p>
            <p className="text-xl font-bold text-sky-300 mt-0.5">{usagePercent}%</p>
          </div>
        </div>
      </div>

      {/* Alertas de Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </motion.div>
      )}

      {/* Selector de Sub-pestañas */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs">
        {[
          { id: 'documents', label: 'Gestión de Documentos', icon: FileText, count: documents.length },
          { id: 'teachers', label: 'Docentes Autorizados', icon: UserCheck, count: permissions.length },
          { id: 'limits', label: 'Límites y Consumo', icon: Sliders },
          { id: 'audit', label: 'Auditoría del Cerebro', icon: History, count: auditLogs.length },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id as SubTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === id
                ? 'bg-[#176FC1] text-white shadow-xs'
                : 'text-[#536B83] hover:text-[#142D49] hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
            {count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full ${
                  activeSubTab === id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 1. SUB-PESTAÑA: GESTIÓN DE DOCUMENTOS */}
      {/* ======================================================== */}
      {activeSubTab === 'documents' && (
        <div className="space-y-4">
          {/* Barra de filtros */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título, archivo o autor..."
                value={searchDocQuery}
                onChange={(e) => setSearchDocQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
              >
                <option value="all">Todos los Cursos</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
              >
                <option value="all">Todos los Estados</option>
                <option value="published">Publicados (Activos)</option>
                <option value="pending">Pendientes / Inactivos</option>
                <option value="processing">Procesando</option>
                <option value="error">Con Error</option>
                <option value="archived">Archivados</option>
              </select>
            </div>
          </div>

          {/* Tabla de documentos */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[#536B83] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Documento</th>
                    <th className="py-3 px-4">Curso Asignado</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Fragmentos / Tokens</th>
                    <th className="py-3 px-4">Subido Por</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-medium">No se encontraron documentos en este filtro.</p>
                        <p className="text-[11px] mt-1">Haz clic en "Cargar Documento" para alimentar a MaTech.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map((doc) => {
                      const courseName =
                        courses.find((c) => c.id === doc.course_id)?.title ||
                        doc.course_title ||
                        'Curso Oficial'

                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-[#142D49]">
                            <div className="flex items-center gap-2">
                              <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {doc.file_type}
                              </span>
                              <div>
                                <p className="font-bold text-slate-800">{doc.title}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{doc.file_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            <span className="inline-block max-w-[180px] truncate" title={courseName}>
                              {courseName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {doc.status === 'published' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Publicado
                              </span>
                            )}
                            {doc.status === 'pending' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Inactivo
                              </span>
                            )}
                            {doc.status === 'processing' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 animate-pulse">
                                <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" />
                                Procesando
                              </span>
                            )}
                            {doc.status === 'error' && (
                              <button
                                onClick={() => setErrorModalDoc(doc)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Error (Ver)
                              </button>
                            )}
                            {doc.status === 'archived' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                Archivado
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="text-xs">
                              <span className="font-bold text-slate-800">{doc.total_chunks}</span> chunks
                              <span className="text-slate-400 mx-1">•</span>
                              <span className="text-[11px] text-slate-500 font-mono">{doc.total_tokens} tok</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {doc.uploaded_by_name || 'Superusuario'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {new Date(doc.created_at).toLocaleDateString('es-CO')}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Publicar / Retirar */}
                              <button
                                onClick={() => handleTogglePublish(doc)}
                                title={doc.status === 'published' ? 'Despublicar de MaTech' : 'Publicar en MaTech'}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  doc.status === 'published'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {doc.status === 'published' ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Reprocesar */}
                              <button
                                onClick={() => handleReprocess(doc)}
                                title="Reprocesar documento"
                                className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>

                              {/* Eliminar */}
                              <button
                                onClick={() => handleDeleteDoc(doc)}
                                title="Eliminar documento y embeddings"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SUB-PESTAÑA: DOCENTES AUTORIZADOS */}
      {/* ======================================================== */}
      {activeSubTab === 'teachers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de Asignación de Permisos */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-[#142D49] border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-[#E78B24]" />
              <h3 className="font-bold text-sm">Conceder Permisos a Docente</h3>
            </div>

            <form onSubmit={handleSavePermission} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Docente de Legado Docente *
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
                  required
                >
                  <option value="">Selecciona un docente...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name || t.email} ({t.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Curso donde gestionará MaTech *
                </label>
                <select
                  value={selectedPermissionCourseId}
                  onChange={(e) => setSelectedPermissionCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
                  required
                >
                  <option value="">Selecciona un curso...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-semibold text-slate-700">Privilegios Concedidos:</p>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canUpload}
                    onChange={(e) => setCanUpload(e.target.checked)}
                    className="rounded text-[#176FC1] focus:ring-[#176FC1]"
                  />
                  <span className="text-slate-700">Puede cargar documentos (Upload)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canPublish}
                    onChange={(e) => setCanPublish(e.target.checked)}
                    className="rounded text-[#176FC1] focus:ring-[#176FC1]"
                  />
                  <span className="text-slate-700">Puede publicar documentos (Activar RAG)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canDelete}
                    onChange={(e) => setCanDelete(e.target.checked)}
                    className="rounded text-[#176FC1] focus:ring-[#176FC1]"
                  />
                  <span className="text-slate-700">Puede eliminar documentos y fragmentos</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSavingPermission}
                className="w-full py-2.5 px-4 rounded-xl bg-[#176FC1] hover:bg-[#135ca2] text-white font-bold transition-all disabled:opacity-50"
              >
                {isSavingPermission ? 'Guardando...' : 'Asignar Permiso'}
              </button>
            </form>
          </div>

          {/* Lista de Permisos Existentes */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-xs border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#142D49]">
                <UserCheck className="w-4 h-4 text-[#176FC1]" />
                <h3 className="font-bold text-sm">Docentes Autorizados Activos</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {permissions.length} autorizaciones
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[#536B83] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Docente</th>
                    <th className="py-2.5 px-3">Curso Autorizado</th>
                    <th className="py-2.5 px-3">Privilegios</th>
                    <th className="py-2.5 px-3 text-right">Revocar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400">
                        Ningún docente tiene permisos asignados aún. Solo los superusuarios pueden alimentar MaTech.
                      </td>
                    </tr>
                  ) : (
                    permissions.map((p) => {
                      const teacher = users.find((u) => u.id === p.teacher_id)
                      const course = courses.find((c) => c.id === p.course_id)
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {p.teacher_name || teacher?.full_name || p.teacher_id}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {p.course_title || course?.title || 'Curso'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {p.can_upload && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                                  Subir
                                </span>
                              )}
                              {p.can_publish && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                                  Publicar
                                </span>
                              )}
                              {p.can_delete && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">
                                  Eliminar
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleRevokePermission(p)}
                              title="Revocar permisos"
                              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SUB-PESTAÑA: LÍMITES Y CONSUMO */}
      {/* ======================================================== */}
      {activeSubTab === 'limits' && settings && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Métricas y Alertas en Vivo */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 space-y-4">
              <h3 className="font-bold text-sm text-[#142D49] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#176FC1]" />
                Monitoreo de Consumo
              </h3>

              {/* Indicador de presupuesto de tokens */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Presupuesto Mensual</span>
                  <span className="font-bold text-slate-800">
                    {usedTokens.toLocaleString()} / {budget.toLocaleString()} tokens
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      usagePercent >= 95
                        ? 'bg-rose-600'
                        : usagePercent >= 85
                        ? 'bg-amber-500'
                        : usagePercent >= 70
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0%</span>
                  <span>Alerta: 70%</span>
                  <span>Crítico: 95%</span>
                </div>
              </div>

              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Preguntas Hoy</p>
                  <p className="text-lg font-extrabold text-[#142D49]">
                    {stats?.dailyQuestions || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Preguntas Mes</p>
                  <p className="text-lg font-extrabold text-[#142D49]">
                    {stats?.monthlyQuestions || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Estudiantes Activos</p>
                  <p className="text-lg font-extrabold text-[#176FC1]">
                    {stats?.activeUsers || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Total Errores</p>
                  <p className="text-lg font-extrabold text-slate-700">
                    {stats?.errorCount || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Avisos automáticos de cuota */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5 text-amber-800">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Control Anti-Abusos Activo</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                MaTech limita a los estudiantes a un cooldown de {settings.cooldown_seconds} segundos entre
                preguntas y un máximo de {settings.max_question_chars} caracteres por consulta para
                evitar sobrecargas y costos imprevistos.
              </p>
            </div>
          </div>

          {/* Formulario de Configuración de Cuotas */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-xs border border-slate-100 space-y-4">
            <h3 className="font-bold text-sm text-[#142D49] flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-[#E78B24]" />
              Parámetros de Uso y Cuotas por Estudiante
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Límite de preguntas diarias por estudiante:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.daily_limit_per_student}
                    onChange={(e) =>
                      setSettings({ ...settings, daily_limit_per_student: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Recomendado: 10 preguntas/día</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Límite mensual por estudiante:
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    value={settings.monthly_limit_per_student}
                    onChange={(e) =>
                      setSettings({ ...settings, monthly_limit_per_student: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Recomendado: 150 preguntas/mes</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Cooldown entre preguntas (segundos):
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={settings.cooldown_seconds}
                    onChange={(e) =>
                      setSettings({ ...settings, cooldown_seconds: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Pausa obligatoria anti-spam (ej: 10s)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Máx. caracteres por pregunta:
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="5000"
                    value={settings.max_question_chars}
                    onChange={(e) =>
                      setSettings({ ...settings, max_question_chars: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Límite de longitud (ej: 2000 chars)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Presupuesto mensual global (Tokens):
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="500000"
                    value={settings.global_budget_tokens}
                    onChange={(e) =>
                      setSettings({ ...settings, global_budget_tokens: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Límite para disparar alertas de consumo</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Fragmentos RAG por respuesta:
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={settings.max_context_chunks}
                    onChange={(e) =>
                      setSettings({ ...settings, max_context_chunks: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Documentos más similares a inyectar (ej: 6)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-5 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#135ca2] text-white font-bold transition-all disabled:opacity-50"
                >
                  {isSavingSettings ? 'Guardando Límites...' : 'Actualizar Límites'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SUB-PESTAÑA: AUDITORÍA DEL CEREBRO */}
      {/* ======================================================== */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-[#142D49]">
              <History className="w-4 h-4 text-[#176FC1]" />
              <h3 className="font-bold text-sm">Registro Cronológico de Actividades</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Últimos {auditLogs.length} eventos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[#536B83] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Responsable (Actor)</th>
                  <th className="py-2.5 px-3">Acción Realizada</th>
                  <th className="py-2.5 px-3">Elemento Afectado</th>
                  <th className="py-2.5 px-3">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      No hay registros de auditoría aún.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-slate-400 text-[11px] font-mono">
                        {new Date(log.created_at).toLocaleString('es-CO')}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {log.actor_name || 'Superusuario'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {log.target_title || log.target_id || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px] font-mono">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SUBIR DOCUMENTO */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-4 bg-[#142D49] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-[#E78B24]" />
                  <h3 className="font-bold text-sm">Cargar Documento al Cerebro de MaTech</h3>
                </div>
                <button
                  onClick={() => !isUploading && setIsUploadModalOpen(false)}
                  disabled={isUploading}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Curso al que pertenece el documento *
                  </label>
                  <select
                    value={uploadCourseId}
                    onChange={(e) => setUploadCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
                    required
                  >
                    <option value="">Selecciona el curso...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400">
                    MaTech jamás mezclará este documento con otros cursos.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Título descriptivo (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Guía de Competencias Pedagógicas MEN 2026"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Archivo académico (PDF, DOCX, TXT, PPTX, XLSX) *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.pptx,.xlsx"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#176FC1] hover:file:bg-blue-100 cursor-pointer"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Máximo 35 MB por archivo.</span>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadAutoPublish}
                      onChange={(e) => setUploadAutoPublish(e.target.checked)}
                      className="rounded text-[#176FC1] focus:ring-[#176FC1]"
                    />
                    <span className="text-slate-700 font-medium">
                      Publicar inmediatamente tras la extracción e indexación
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#176FC1] hover:bg-[#135ca2] text-white font-bold transition-all disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Procesando RAG...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Cargar y Procesar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: VER DETALLE DE ERROR DE PROCESAMIENTO */}
      {/* ======================================================== */}
      <AnimatePresence>
        {errorModalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
            >
              <div className="px-5 py-3.5 bg-rose-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-sm">Detalle de Error en Documento</h3>
                </div>
                <button
                  onClick={() => setErrorModalDoc(null)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <p className="font-bold text-slate-800">{errorModalDoc.title}</p>
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-mono text-[11px] whitespace-pre-wrap">
                  {errorModalDoc.error_message || 'Error desconocido durante la extracción de texto.'}
                </div>
                <p className="text-slate-500 text-[11px]">
                  Puedes corregir el archivo y volver a intentar con el botón "Reprocesar" o eliminar el documento.
                </p>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setErrorModalDoc(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
