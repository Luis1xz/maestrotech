'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  FileText,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  X,
  FileUp,
  Lock,
  Layers,
  HelpCircle,
} from 'lucide-react'
import { Course } from '@/types/database'
import { MaTechDocument, MaTechTeacherPermission } from '@/types/matech'
import { useAuth } from '@/hooks/use-auth'

interface TeacherMaTechSectionProps {
  courses: Course[]
}

export default function TeacherMaTechSection({ courses }: TeacherMaTechSectionProps) {
  const { user, profile, role } = useAuth()
  const [permissions, setPermissions] = useState<MaTechTeacherPermission[]>([])
  const [documents, setDocuments] = useState<MaTechDocument[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Subir documento
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Ver detalle de error
  const [errorModalDoc, setErrorModalDoc] = useState<MaTechDocument | null>(null)

  const isSuperAdmin = role === 'admin'

  const loadData = async () => {
    setIsLoading(true)
    try {
      // 1. Obtener permisos del docente
      const permRes = await fetch(`/api/matech/permissions?teacher_id=${user?.id || ''}`)
      let teacherPerms: MaTechTeacherPermission[] = []
      if (permRes.ok) {
        const pData = await permRes.json()
        teacherPerms = pData.permissions || []
        setPermissions(teacherPerms)
      }

      // Si es superadmin, tiene acceso a todos los cursos; si no, solo a los permitidos
      const accessibleCourses = isSuperAdmin
        ? courses
        : courses.filter((c) => teacherPerms.some((p) => p.course_id === c.id))

      const defaultCourse = selectedCourseId || accessibleCourses[0]?.id || ''
      if (!selectedCourseId && defaultCourse) {
        setSelectedCourseId(defaultCourse)
      }

      // 2. Obtener documentos del curso
      const docsRes = await fetch(`/api/matech/documents${defaultCourse ? `?course_id=${defaultCourse}` : ''}`)
      if (docsRes.ok) {
        const dData = await docsRes.json()
        setDocuments(dData.documents || [])
      }
    } catch (err: any) {
      console.error('Error cargando datos de MaTech:', err)
      setFeedback({ type: 'error', message: 'No se pudieron sincronizar los documentos de MaTech.' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user?.id, selectedCourseId])

  // Cursos disponibles para este docente
  const authorizedCourses = isSuperAdmin
    ? courses
    : courses.filter((c) => permissions.some((p) => p.course_id === c.id))

  // Permiso activo para el curso seleccionado
  const activePermission = isSuperAdmin
    ? { can_upload: true, can_publish: true, can_delete: true }
    : permissions.find((p) => p.course_id === selectedCourseId) || {
        can_upload: false,
        can_publish: false,
        can_delete: false,
      }

  // Filtrar documentos del curso seleccionado
  const currentCourseDocs = documents.filter((d) => d.course_id === selectedCourseId)

  // Manejar subida de archivo
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) {
      setFeedback({ type: 'error', message: 'Selecciona un archivo académico.' })
      return
    }
    if (!selectedCourseId) {
      setFeedback({ type: 'error', message: 'Selecciona un curso autorizado.' })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('course_id', selectedCourseId)
    formData.append('title', uploadTitle || uploadFile.name.replace(/\.[^/.]+$/, ''))
    formData.append('auto_publish', activePermission.can_publish ? 'true' : 'false')
    formData.append('uploaded_by', user?.id || 'teacher')
    formData.append('uploaded_by_name', profile?.full_name || 'Docente Autorizado')

    const courseObj = courses.find((c) => c.id === selectedCourseId)
    if (courseObj) formData.append('course_title', courseObj.title)

    try {
      const res = await fetch('/api/matech/documents', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar el archivo')

      setFeedback({ type: 'success', message: data.message || 'Documento procesado e indexado en MaTech.' })
      setIsUploadModalOpen(false)
      setUploadFile(null)
      setUploadTitle('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setIsUploading(false)
    }
  }

  // Cambiar publicación
  const handleTogglePublish = async (doc: MaTechDocument) => {
    if (!activePermission.can_publish) {
      setFeedback({ type: 'error', message: 'No tienes privilegios para publicar documentos en este curso.' })
      return
    }

    const newAction = doc.status === 'published' ? 'unpublish' : 'publish'
    try {
      const res = await fetch(`/api/matech/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: newAction,
          actorId: user?.id,
          actorName: profile?.full_name || 'Docente',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cambiar estado')

      setFeedback({
        type: 'success',
        message: newAction === 'publish' ? 'Documento activado para MaTech.' : 'Documento retirado del asistente.',
      })
      loadData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  // Eliminar
  const handleDeleteDoc = async (doc: MaTechDocument) => {
    if (!activePermission.can_delete) {
      setFeedback({ type: 'error', message: 'No tienes privilegios para eliminar documentos en este curso.' })
      return
    }

    if (!confirm(`¿Eliminar definitivamente el documento "${doc.title}"?`)) return

    try {
      const res = await fetch(`/api/matech/documents/${doc.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar')

      setFeedback({ type: 'success', message: 'Documento eliminado de MaTech.' })
      loadData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  // Si no tiene cursos autorizados
  if (!isLoading && authorizedCourses.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-lg text-[#142D49]">
          Alimentar Conocimiento de MaTech
        </h3>
        <p className="text-xs text-[#536B83] leading-relaxed">
          Actualmente no tienes cursos autorizados para alimentar el cerebro del asistente inteligente MaTech.
          Los Superusuarios de Legado Docente pueden habilitarte permisos específicos para los cursos que impartes.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
          <p className="font-semibold">¿Eres formador del programa?</p>
          <p className="mt-0.5">Contacta a la administración para habilitar la carga de guías, decretos y material pedagógico.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Banner Superior */}
      <div className="rounded-2xl bg-gradient-to-r from-[#142D49] via-[#0D1F33] to-[#142D49] p-6 text-white shadow-xl border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#E78B24]/20 border border-[#E78B24]/40 text-[#F5B563] text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#E78B24]" />
              <span>Gestión de Contenido Académico RAG</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight">
              Alimentar el Cerebro de MaTech
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Sube guías, normativas, lecturas y talleres para que MaTech responda con precisión pedagógica
              a tus estudiantes en este curso.
            </p>
          </div>

          {activePermission.can_upload && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E78B24] to-[#F59E0B] text-white text-xs font-bold hover:shadow-lg hover:shadow-[#E78B24]/30 transition-all self-start md:self-auto"
            >
              <Upload className="w-4 h-4" />
              <span>Subir Documento</span>
            </button>
          )}
        </div>
      </div>

      {/* Alertas */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
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

      {/* Selector de Curso */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Curso Académico:
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176FC1]"
          >
            {authorizedCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Privilegios en el curso */}
        <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
          <span>Tus permisos:</span>
          <span
            className={`px-2 py-0.5 rounded-full font-bold ${
              activePermission.can_upload ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'
            }`}
          >
            Subir
          </span>
          <span
            className={`px-2 py-0.5 rounded-full font-bold ${
              activePermission.can_publish ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
            }`}
          >
            Publicar
          </span>
          <span
            className={`px-2 py-0.5 rounded-full font-bold ${
              activePermission.can_delete ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-400'
            }`}
          >
            Eliminar
          </span>
        </div>
      </div>

      {/* Tabla de Documentos del Curso */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#142D49]">
            <FileText className="w-4 h-4 text-[#176FC1]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Documentos Disponibles en MaTech ({currentCourseDocs.length})
            </h3>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            title="Refrescar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[#536B83] uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Fragmentos</th>
                <th className="py-3 px-4">Subido el</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentCourseDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No hay documentos en este curso.</p>
                    <p className="text-[11px] mt-1">
                      {activePermission.can_upload
                        ? 'Haz clic en "Subir Documento" para enriquecer las respuestas de MaTech.'
                        : 'No tienes permiso para subir documentos a este curso.'}
                    </p>
                  </td>
                </tr>
              ) : (
                currentCourseDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-[#142D49]">
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {doc.file_type}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">{doc.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{doc.file_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {doc.status === 'published' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Publicado (Activo)
                        </span>
                      )}
                      {doc.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pendiente / Inactivo
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
                          Ver Error
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {doc.total_chunks} fragmentos
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(doc.created_at).toLocaleDateString('es-CO')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {activePermission.can_publish && (
                          <button
                            onClick={() => handleTogglePublish(doc)}
                            title={doc.status === 'published' ? 'Despublicar' : 'Publicar'}
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
                        )}
                        {activePermission.can_delete && (
                          <button
                            onClick={() => handleDeleteDoc(doc)}
                            title="Eliminar documento"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Subir Documento */}
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
                  <h3 className="font-bold text-sm">Cargar Documento para MaTech</h3>
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
                    Título del Documento (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Decreto 1278 - Estatuto de Profesionalización Docente"
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
                  <span className="text-[10px] text-slate-400">
                    Extracción inteligente de texto y generación vectorial con Gemini.
                  </span>
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
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Cargar Documento</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Error */}
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
                  <h3 className="font-bold text-sm">Detalle de Error</h3>
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
                  {errorModalDoc.error_message || 'Error durante el procesamiento del archivo.'}
                </div>
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
