'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Plus, FileText, Upload, Users, Award, Target,
  Sparkles, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight,
  Clock, Shield, BarChart3, ChevronRight, Layers, HelpCircle,
  Download, Trash2, ExternalLink, Loader2, FolderDown
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { canAccessTeacher, Material, Course } from '@/types/database'
import { getCourses, createCourse } from '@/services/courses'
import {
  uploadLessonMaterial,
  getMaterialsByCourse,
  deleteMaterial,
  getLessonsForCourse,
  ensureDefaultLesson,
} from '@/services/materials'
import { getMaterialSignedUrl } from '@/lib/supabase/storage'
import FileUploader from '@/components/file-uploader'
import Link from 'next/link'

type TeacherTab =
  | 'courses'
  | 'create-course'
  | 'content'
  | 'materials'
  | 'exams'
  | 'students'

export default function TeacherPanel() {
  const { user, profile, role, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<TeacherTab>('courses')
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  // Estados para creación de curso
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Pedagogía')
  const [newLevel, setNewLevel] = useState('Intermedio')
  const [newPrice, setNewPrice] = useState('0')
  const [newDuration, setNewDuration] = useState('6')
  const [newDescription, setNewDescription] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [submittingCourse, setSubmittingCourse] = useState(false)
  const [courseFeedback, setCourseFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Estados para materiales y subida de archivos
  const [selectedCourseIdForMaterials, setSelectedCourseIdForMaterials] = useState<string>('')
  const [selectedLessonIdForMaterials, setSelectedLessonIdForMaterials] = useState<string>('auto')
  const [availableLessons, setAvailableLessons] = useState<{ id: string; title: string; module_title: string }[]>([])
  const [courseMaterials, setCourseMaterials] = useState<Material[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false)
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null)
  const [openingMaterialId, setOpeningMaterialId] = useState<string | null>(null)

  // Cargar cursos
  useEffect(() => {
    async function load() {
      setLoadingCourses(true)
      const { data } = await getCourses()
      const loaded = data || []
      setCourses(loaded)
      if (loaded.length > 0) {
        setSelectedCourseIdForMaterials((prev) => prev || loaded[0].id)
      }
      setLoadingCourses(false)
    }
    load()
  }, [])

  const loadMaterialsAndLessons = useCallback(async (courseId: string) => {
    if (!courseId) return
    setLoadingMaterials(true)
    const [matsRes, lessonsRes] = await Promise.all([
      getMaterialsByCourse(courseId),
      getLessonsForCourse(courseId),
    ])
    setCourseMaterials(matsRes.data || [])
    setAvailableLessons(lessonsRes.data || [])
    setLoadingMaterials(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'materials' && selectedCourseIdForMaterials) {
      loadMaterialsAndLessons(selectedCourseIdForMaterials)
    }
  }, [activeTab, selectedCourseIdForMaterials, loadMaterialsAndLessons])

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUploadFile) {
      setUploadFeedback({ type: 'error', text: 'Por favor selecciona un archivo para subir.' })
      return
    }
    if (!selectedCourseIdForMaterials) {
      setUploadFeedback({ type: 'error', text: 'Por favor selecciona un curso para asociar el material.' })
      return
    }

    setIsUploadingMaterial(true)
    setUploadFeedback(null)

    try {
      let targetLessonId = selectedLessonIdForMaterials
      if (!targetLessonId || targetLessonId === 'auto') {
        const ensured = await ensureDefaultLesson(selectedCourseIdForMaterials)
        if (ensured.error || !ensured.lessonId) {
          throw ensured.error || new Error('No se pudo inicializar el contenedor de lección para el material')
        }
        targetLessonId = ensured.lessonId
      }

      const res = await uploadLessonMaterial({
        file: selectedUploadFile,
        courseId: selectedCourseIdForMaterials,
        lessonId: targetLessonId,
        title: uploadTitle.trim() || undefined,
      })

      if (res.error || !res.data) {
        throw res.error || new Error('Fallo al subir el archivo o registrar el material en la base de datos')
      }

      setUploadFeedback({
        type: 'success',
        text: `¡Archivo "${selectedUploadFile.name}" subido exitosamente al bucket seguro de MaestroTech!`,
      })
      setSelectedUploadFile(null)
      setUploadTitle('')
      await loadMaterialsAndLessons(selectedCourseIdForMaterials)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al subir el archivo'
      setUploadFeedback({ type: 'error', text: msg })
    } finally {
      setIsUploadingMaterial(false)
    }
  }

  const handleDownloadMaterial = async (material: Material) => {
    setOpeningMaterialId(material.id)
    try {
      const res = await getMaterialSignedUrl(material.file_url)
      if (res.error || !res.url) {
        alert(res.error?.message || 'No se pudo generar el enlace firmado de descarga')
        return
      }
      window.open(res.url, '_blank', 'noopener,noreferrer')
    } finally {
      setOpeningMaterialId(null)
    }
  }

  const handleDeleteMaterial = async (material: Material) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${material.title}"?`)) return
    setDeletingMaterialId(material.id)
    try {
      const res = await deleteMaterial(material.id, material.file_url)
      if (res.error) {
        alert(`Error al eliminar: ${res.error.message}`)
        return
      }
      setCourseMaterials((prev) => prev.filter((m) => m.id !== material.id))
    } finally {
      setDeletingMaterialId(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const hasAccess = canAccessTeacher(role)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Protección: Bloquear estudiantes
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background aurora-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl glass border border-rose-500/20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="font-display font-bold text-xl text-foreground mb-2">Acceso Restringido</h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Esta sección es de uso exclusivo para docentes e instructores autorizados de MaestroTech. Si eres superusuario o docente, por favor inicia sesión con tu cuenta con permisos.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>
      </div>
    )
  }

  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCourseFeedback(null)
    setSubmittingCourse(true)

    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const res = await createCourse({
      title: newTitle,
      slug: slug || `curso-${Date.now()}`,
      category: newCategory,
      level: newLevel,
      price: Number(newPrice) || 0,
      duration_hours: Number(newDuration) || 4,
      description: newDescription,
      short_description: newDescription.slice(0, 120),
      published: isPublished,
      featured: false,
      thumbnail_url: null,
      instructor_id: user?.id || null,
      instructor_name: profile?.full_name || 'Docente MaestroTech',
      instructor_role: role === 'admin' ? 'Superusuario / Director Pedagógico' : 'Docente Formador',
    })

    setSubmittingCourse(false)

    if (res.error) {
      setCourseFeedback({ type: 'error', text: res.error.message })
    } else {
      setCourseFeedback({ type: 'success', text: '¡Curso creado exitosamente en la plataforma!' })
      setNewTitle('')
      setNewDescription('')
      // Recargar catálogo
      const { data } = await getCourses()
      setCourses(data || [])
      setTimeout(() => setActiveTab('courses'), 1200)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar Docente */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/60 bg-card/60 backdrop-blur-md shrink-0 p-6 flex flex-col justify-between">
        <div>
          {/* Logo & Volver */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border/60 shadow-md group-hover:scale-105 transition-all duration-300 shrink-0 bg-neutral-900">
                <img src="/logo.jpg" alt="Maestro Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold font-display text-foreground text-sm">Maestro</span>
            </Link>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Docente
            </span>
          </div>

          <div className="mb-6 pb-4 border-b border-border/50">
            <p className="text-xs font-semibold text-foreground truncate">{profile?.full_name || 'Docente'}</p>
            <p className="text-[11px] text-muted-foreground capitalize">
              {role === 'admin' ? 'Superusuario (Acceso Total)' : 'Instructor'}
            </p>
          </div>

          {/* Menú de navegación */}
          <nav className="space-y-1">
            {[
              { id: 'courses', label: 'Mis Cursos', icon: BookOpen },
              { id: 'create-course', label: 'Crear Curso', icon: Plus },
              { id: 'content', label: 'Módulos y Lecciones', icon: Layers },
              { id: 'materials', label: 'Subir Materiales', icon: Upload },
              { id: 'exams', label: 'Crear Exámenes', icon: Target },
              { id: 'students', label: 'Estudiantes', icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TeacherTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Enlace al panel de administración si es admin */}
        <div className="pt-6 border-t border-border/50 space-y-2">
          {role === 'admin' && (
            <Link
              href="/admin"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold hover:bg-violet-500/20 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" /> Panel Superusuario
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            href="/"
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a la plataforma
          </Link>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 aurora-bg">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header de la pestaña */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                {activeTab === 'courses' && 'Gestión de Cursos y Contenido'}
                {activeTab === 'create-course' && 'Crear Nuevo Curso Docente'}
                {activeTab === 'content' && 'Estructuración Curricular'}
                {activeTab === 'materials' && 'Repositorio de Materiales Educativos'}
                {activeTab === 'exams' && 'Diseñador de Evaluaciones y Preguntas'}
                {activeTab === 'students' && 'Seguimiento de Estudiantes'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Herramientas pedagógicas oficiales para la formación del magisterio colombiano.
              </p>
            </div>

            {activeTab !== 'create-course' && (
              <button
                onClick={() => setActiveTab('create-course')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" /> Crear Curso
              </button>
            )}
          </div>

          {/* TAB: Cursos */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              {loadingCourses ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Cargando cursos...</div>
              ) : courses.length === 0 ? (
                <div className="p-12 rounded-3xl glass border border-border/60 text-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground text-sm mb-1">Aún no hay cursos creados</h3>
                  <p className="text-xs text-muted-foreground mb-4">Comienza creando tu primer curso formativo.</p>
                  <button
                    onClick={() => setActiveTab('create-course')}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    Crear mi primer curso
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((c) => (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl glass border border-border/60 flex flex-col justify-between card-lift"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                            {c.category || 'Pedagogía'}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              c.published
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {c.published ? 'Publicado' : 'Borrador'}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-foreground mb-2 line-clamp-2">
                          {c.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                          {c.short_description || c.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                        <span className="font-mono text-muted-foreground">
                          {c.price === 0 ? 'Gratis' : `$${Number(c.price).toLocaleString()} COP`}
                        </span>
                        <Link
                          href={`/`}
                          className="text-primary hover:underline text-[11px] font-semibold"
                        >
                          Ver vista pública →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Crear Curso */}
          {activeTab === 'create-course' && (
            <div className="max-w-2xl p-8 rounded-3xl glass border border-border/70 bg-card/90">
              <h3 className="font-display font-bold text-lg text-foreground mb-1">Información General del Curso</h3>
              <p className="text-xs text-muted-foreground mb-6">
                Define el título, categoría y parámetros pedagógicos del programa.
              </p>

              {courseFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 mb-6 ${
                    courseFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                  }`}
                >
                  {courseFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{courseFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateCourseSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Título del Curso</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Evaluación de Competencias Docentes — Decreto 1278"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/60 border border-border/80 focus:border-primary/50 text-sm text-foreground placeholder-muted-foreground outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Categoría</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border/80 text-sm text-foreground outline-none"
                    >
                      <option value="Pedagogía">Pedagogía</option>
                      <option value="Legislación">Legislación</option>
                      <option value="Evaluación">Evaluación</option>
                      <option value="Directivos">Directivos Docentes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Nivel</label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border/80 text-sm text-foreground outline-none"
                    >
                      <option value="Inicial">Inicial</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Precio (COP - 0 para Gratis)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-muted/60 border border-border/80 text-sm text-foreground outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Duración Estimada (Horas)</label>
                    <input
                      type="number"
                      min="1"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-muted/60 border border-border/80 text-sm text-foreground outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Descripción Pedagógica</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe los objetivos formativos, contenidos temáticos y metodologías aplicadas..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-4 rounded-xl bg-muted/60 border border-border/80 focus:border-primary/50 text-xs sm:text-sm text-foreground placeholder-muted-foreground outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="publishCheck"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/30"
                  />
                  <label htmlFor="publishCheck" className="text-xs text-foreground font-medium cursor-pointer">
                    Publicar inmediatamente en el catálogo de estudiantes
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={submittingCourse}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-blue-600/25 disabled:opacity-50"
                  >
                    {submittingCourse ? 'Guardando...' : 'Crear y Continuar a Contenido'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('courses')}
                    className="px-5 py-3 rounded-xl glass border border-border/60 text-xs text-foreground font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: Materiales (Subida y Gestión de Archivos) */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              {courses.length === 0 ? (
                <div className="p-12 rounded-3xl glass border border-border/60 text-center max-w-lg mx-auto">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground text-sm mb-1">Primero crea un curso</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Para subir documentos y material de clase necesitas al menos un curso registrado.
                  </p>
                  <button
                    onClick={() => setActiveTab('create-course')}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    Crear mi primer curso
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Selector de curso actual */}
                  <div className="p-5 rounded-2xl glass border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Curso Seleccionado
                      </label>
                      <p className="text-[11px] text-muted-foreground">
                        Los materiales se asociarán a la estructura pedagógica de este programa.
                      </p>
                    </div>
                    <select
                      value={selectedCourseIdForMaterials}
                      onChange={(e) => setSelectedCourseIdForMaterials(e.target.value)}
                      className="px-4 py-2 rounded-xl bg-muted/70 border border-border text-xs text-foreground font-semibold outline-none cursor-pointer max-w-xs w-full"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-6 items-start">
                    {/* Formulario de subida de archivos */}
                    <div className="lg:col-span-6 p-6 rounded-3xl glass border border-border/70 bg-card/90 space-y-4">
                      <div className="flex items-center gap-2.5 pb-2 border-b border-border/50">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-sm text-foreground">
                            Subir Documento o Recurso
                          </h3>
                          <p className="text-[11px] text-muted-foreground">
                            Almacenamiento seguro en Supabase Storage (bucket privado).
                          </p>
                        </div>
                      </div>

                      {uploadFeedback && (
                        <div
                          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                            uploadFeedback.type === 'success'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                          }`}
                        >
                          {uploadFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0" />
                          )}
                          <span>{uploadFeedback.text}</span>
                        </div>
                      )}

                      <form onSubmit={handleUploadSubmit} className="space-y-4">
                        {/* Selector de Lección Destino */}
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">
                            Lección / Contenedor Destino
                          </label>
                          <select
                            value={selectedLessonIdForMaterials}
                            onChange={(e) => setSelectedLessonIdForMaterials(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border/80 text-xs text-foreground outline-none cursor-pointer"
                          >
                            <option value="auto">⚡ Contenedor automático (Recursos generales)</option>
                            {availableLessons.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.module_title} — {l.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Título opcional */}
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">
                            Nombre descriptivo del material (opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Guía Pedagógica del Magisterio - Decreto 1278"
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-muted/60 border border-border/80 text-xs text-foreground outline-none"
                          />
                        </div>

                        {/* Drag and Drop File Uploader */}
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1.5">
                            Archivo a Cargar
                          </label>
                          <FileUploader
                            onFileSelect={(file) => setSelectedUploadFile(file)}
                            onClear={() => setSelectedUploadFile(null)}
                            selectedFile={selectedUploadFile}
                            uploading={isUploadingMaterial}
                            progressText="Subiendo archivo seguro al almacenamiento..."
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={!selectedUploadFile || isUploadingMaterial}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                          {isUploadingMaterial ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Subiendo al servidor...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Guardar Material en el Curso
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Lista de materiales existentes */}
                    <div className="lg:col-span-6 p-6 rounded-3xl glass border border-border/70 bg-card/90 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <FolderDown className="w-4 h-4 text-primary" />
                          <h3 className="font-display font-bold text-sm text-foreground">
                            Materiales Registrados
                          </h3>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {courseMaterials.length} {courseMaterials.length === 1 ? 'archivo' : 'archivos'}
                        </span>
                      </div>

                      {loadingMaterials ? (
                        <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          Consultando materiales del curso...
                        </div>
                      ) : courseMaterials.length === 0 ? (
                        <div className="p-10 rounded-2xl border border-dashed border-border/70 text-center">
                          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-xs font-medium text-foreground mb-1">
                            Aún no hay materiales en este curso
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Arrastra y suelta tus guías, PDFs o presentaciones en el panel de la izquierda para publicarlos.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                          {courseMaterials.map((mat) => (
                            <div
                              key={mat.id}
                              className="p-3.5 rounded-2xl glass border border-border/50 hover:border-border transition-all flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-semibold text-foreground truncate">
                                    {mat.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                    <span className="uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-muted">
                                      {mat.file_type || 'PDF'}
                                    </span>
                                    <span>•</span>
                                    <span>{formatFileSize(mat.file_size)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadMaterial(mat)}
                                  disabled={openingMaterialId === mat.id}
                                  className="p-2 rounded-xl glass border border-border/60 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                                  title="Descargar o ver archivo con enlace firmado"
                                >
                                  {openingMaterialId === mat.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Download className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMaterial(mat)}
                                  disabled={deletingMaterialId === mat.id}
                                  className="p-2 rounded-xl glass border border-border/60 hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground transition-colors"
                                  title="Eliminar material"
                                >
                                  {deletingMaterialId === mat.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Módulos Curriculares, Evaluaciones y Estudiantes */}
          {(activeTab === 'content' || activeTab === 'exams' || activeTab === 'students') && (
            <div className="p-8 rounded-3xl glass border border-border/60 text-center max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground mb-1">
                {activeTab === 'content' && 'Gestor Curricular de Módulos y Lecciones'}
                {activeTab === 'exams' && 'Banco de Preguntas para Pruebas del MEN'}
                {activeTab === 'students' && 'Progreso y Métricas de tus Estudiantes'}
              </h3>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Selecciona uno de tus cursos creados en la pestaña &ldquo;Mis Cursos&rdquo; para estructurar módulos y vincular identificadores de video (Cloudflare Stream).
              </p>
              <button
                onClick={() => setActiveTab('courses')}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow"
              >
                Ir a Mis Cursos
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
