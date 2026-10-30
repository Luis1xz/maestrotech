'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen,
  Plus,
  FileText,
  Upload,
  Users,
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Shield,
  ChevronRight,
  Layers,
  Download,
  Trash2,
  Loader2,
  FolderDown,
  Video,
  Globe,
  Eye,
  EyeOff,
  Play,
  UserPlus,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { canAccessTeacher, Material, Course, Module, Lesson } from '@/types/database'
import {
  getAllCoursesForTeacher,
  createCourse,
  updateCourse,
  deleteCourse,
} from '@/services/courses'
import { getModulesByCourse, createModule, deleteModule } from '@/services/modules'
import { getLessonsByCourse, createLesson, deleteLesson } from '@/services/lessons'
import {
  uploadLessonMaterial,
  getMaterialsByCourse,
  deleteMaterial,
  getLessonsForCourse,
  ensureDefaultLesson,
} from '@/services/materials'
import {
  getAllEnrollmentsForTeacher,
  enrollInCourse,
  EnrollmentWithStudentAndCourse,
} from '@/services/enrollments'
import { getExamQuestions, createExamQuestion, deleteExamQuestion } from '@/services/exams'
import { getAdminUsersList } from '@/services/admin'
import { getMaterialSignedUrl, uploadLessonVideo } from '@/lib/supabase/storage'
import { ExamQuestionRecord } from '@/lib/platform-store'
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
  const [togglingCourseId, setTogglingCourseId] = useState<string | null>(null)
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)

  // Estados para creación de curso
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Pedagogía')
  const [newLevel, setNewLevel] = useState('Intermedio')
  const [newPrice, setNewPrice] = useState('0')
  const [newDuration, setNewDuration] = useState('24')
  const [newDescription, setNewDescription] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [submittingCourse, setSubmittingCourse] = useState(false)
  const [courseFeedback, setCourseFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Estados para Módulos y Lecciones (content)
  const [selectedCourseIdForContent, setSelectedCourseIdForContent] = useState<string>('')
  const [courseModules, setCourseModules] = useState<Module[]>([])
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([])
  const [loadingContent, setLoadingContent] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [newModuleDesc, setNewModuleDesc] = useState('')
  const [creatingModule, setCreatingModule] = useState(false)

  // Estados para crear Lección + Video
  const [selectedModuleIdForLesson, setSelectedModuleIdForLesson] = useState<string>('')
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [newLessonDesc, setNewLessonDesc] = useState('')
  const [newLessonDurationMin, setNewLessonDurationMin] = useState('20')
  const [newLessonIsPreview, setNewLessonIsPreview] = useState(true)
  const [videoInputMode, setVideoInputMode] = useState<'upload' | 'youtube' | 'url'>('upload')
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [videoUrlOrId, setVideoUrlOrId] = useState('')
  const [creatingLesson, setCreatingLesson] = useState(false)
  const [contentFeedback, setContentFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Estados para materiales y subida de archivos
  const [selectedCourseIdForMaterials, setSelectedCourseIdForMaterials] = useState<string>('')
  const [selectedLessonIdForMaterials, setSelectedLessonIdForMaterials] = useState<string>('auto')
  const [availableLessons, setAvailableLessons] = useState<
    { id: string; title: string; module_title: string }[]
  >([])
  const [courseMaterials, setCourseMaterials] = useState<Material[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false)
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null)
  const [openingMaterialId, setOpeningMaterialId] = useState<string | null>(null)

  // Estados para Exámenes
  const [examQuestions, setExamQuestions] = useState<ExamQuestionRecord[]>([])
  const [loadingExams, setLoadingExams] = useState(false)
  const [qCompetency, setQCompetency] = useState('Competencia Pedagógica')
  const [qDifficulty, setQDifficulty] = useState<'Básico' | 'Intermedio' | 'Avanzado'>('Intermedio')
  const [qCourseId, setQCourseId] = useState<string>('')
  const [qText, setQText] = useState('')
  const [qOptA, setQOptA] = useState('')
  const [qOptB, setQOptB] = useState('')
  const [qOptC, setQOptC] = useState('')
  const [qOptD, setQOptD] = useState('')
  const [qCorrect, setQCorrect] = useState('A')
  const [qExplanation, setQExplanation] = useState('')
  const [creatingQuestion, setCreatingQuestion] = useState(false)
  const [examFeedback, setExamFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Estados para Estudiantes Matriculados
  const [enrollments, setEnrollments] = useState<EnrollmentWithStudentAndCourse[]>([])
  const [platformStudents, setPlatformStudents] = useState<
    { id: string; full_name: string; email: string }[]
  >([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [enrollStudentId, setEnrollStudentId] = useState('b5ccdb90-a6c0-4b99-add5-c93fac47ee84')
  const [enrollCourseId, setEnrollCourseId] = useState('')
  const [submittingEnroll, setSubmittingEnroll] = useState(false)
  const [studentFeedback, setStudentFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const loadAllCourses = useCallback(async () => {
    setLoadingCourses(true)
    const { data } = await getAllCoursesForTeacher()
    const loaded = data || []
    setCourses(loaded)
    if (loaded.length > 0) {
      setSelectedCourseIdForMaterials((prev) => prev || loaded[0].id)
      setSelectedCourseIdForContent((prev) => prev || loaded[0].id)
      setEnrollCourseId((prev) => prev || loaded[0].id)
    }
    setLoadingCourses(false)
  }, [])

  useEffect(() => {
    loadAllCourses()
  }, [loadAllCourses])

  // Cargar Módulos y Lecciones de un curso
  const loadContentForCourse = useCallback(async (courseId: string) => {
    if (!courseId) return
    setLoadingContent(true)
    const [modsRes, lessRes] = await Promise.all([
      getModulesByCourse(courseId),
      getLessonsByCourse(courseId),
    ])
    const mods = modsRes.data || []
    setCourseModules(mods)
    setCourseLessons(lessRes.data || [])
    if (mods.length > 0) {
      setSelectedModuleIdForLesson((prev) =>
        mods.some((m) => m.id === prev) ? prev : mods[0].id
      )
    } else {
      setSelectedModuleIdForLesson('')
    }
    setLoadingContent(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'content' && selectedCourseIdForContent) {
      loadContentForCourse(selectedCourseIdForContent)
    }
  }, [activeTab, selectedCourseIdForContent, loadContentForCourse])

  // Cargar Materiales y Lecciones
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

  // Cargar Preguntas de Exámenes
  const loadExams = useCallback(async () => {
    setLoadingExams(true)
    const { data } = await getExamQuestions()
    setExamQuestions(data || [])
    setLoadingExams(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'exams') {
      loadExams()
    }
  }, [activeTab, loadExams])

  // Cargar Estudiantes Matriculados
  const loadStudentsTab = useCallback(async () => {
    setLoadingStudents(true)
    const [enrollRes, usersRes] = await Promise.all([
      getAllEnrollmentsForTeacher(),
      getAdminUsersList(),
    ])
    setEnrollments(enrollRes.data || [])
    const users = (usersRes.data || []).map((u) => ({
      id: u.id,
      full_name: u.full_name || 'Estudiante',
      email: u.email || 'estudiante@maestrotech.co',
    }))
    setPlatformStudents(users)
    setLoadingStudents(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'students') {
      loadStudentsTab()
    }
  }, [activeTab, loadStudentsTab])

  // Publicar / Despublicar curso
  const handleTogglePublishCourse = async (course: Course) => {
    setTogglingCourseId(course.id)
    const nextState = !course.published
    const { data, error } = await updateCourse(course.id, { published: nextState })
    setTogglingCourseId(null)
    if (!error && data) {
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, published: nextState } : c))
      )
    }
  }

  // Eliminar curso
  const handleDeleteCourse = async (course: Course) => {
    if (!confirm(`¿Estás seguro de eliminar el curso "${course.title}"?`)) return
    setDeletingCourseId(course.id)
    const { success } = await deleteCourse(course.id)
    setDeletingCourseId(null)
    if (success) {
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
    }
  }

  // Crear Módulo
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseIdForContent || !newModuleTitle.trim()) return
    setCreatingModule(true)
    setContentFeedback(null)

    const nextIndex = courseModules.length + 1
    const { data, error } = await createModule({
      course_id: selectedCourseIdForContent,
      title: newModuleTitle.trim(),
      description: newModuleDesc.trim() || null,
      order_index: nextIndex,
    })

    setCreatingModule(false)
    if (error || !data) {
      setContentFeedback({
        type: 'error',
        text: error?.message || 'Error al crear módulo',
      })
      return
    }

    setNewModuleTitle('')
    setNewModuleDesc('')
    setContentFeedback({
      type: 'success',
      text: `Módulo "${data.title}" creado correctamente.`,
    })
    await loadContentForCourse(selectedCourseIdForContent)
  }

  // Eliminar Módulo
  const handleDeleteModule = async (moduleId: string, title: string) => {
    if (!confirm(`¿Eliminar el módulo "${title}" y sus lecciones?`)) return
    await deleteModule(moduleId)
    await loadContentForCourse(selectedCourseIdForContent)
  }

  // Crear Lección con Video (Subida a Supabase Storage o URL/YouTube)
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseIdForContent || !newLessonTitle.trim()) return

    setCreatingLesson(true)
    setContentFeedback(null)

    try {
      let targetModuleId = selectedModuleIdForLesson
      if (!targetModuleId) {
        const modRes = await createModule({
          course_id: selectedCourseIdForContent,
          title: 'Módulo 1: Fundamentos y Clases Magistrales',
          description: 'Módulo principal del curso',
          order_index: 1,
        })
        if (modRes.error || !modRes.data) {
          throw modRes.error || new Error('No se pudo crear el módulo contenedor')
        }
        targetModuleId = modRes.data.id
      }

      let videoProvider: 'supabase' | 'youtube' | 'custom' | null = null
      let videoId: string | null = null

      if (videoInputMode === 'upload' && selectedVideoFile) {
        const uploadRes = await uploadLessonVideo(
          selectedVideoFile,
          selectedCourseIdForContent,
          `lesson-${Date.now()}`
        )
        if (uploadRes.error || !uploadRes.path) {
          throw uploadRes.error || new Error('No se pudo subir el archivo de video')
        }
        videoProvider = 'supabase'
        videoId = uploadRes.path
      } else if (videoInputMode === 'youtube' && videoUrlOrId.trim()) {
        videoProvider = 'youtube'
        videoId = videoUrlOrId.trim()
      } else if (videoInputMode === 'url' && videoUrlOrId.trim()) {
        videoProvider = 'custom'
        videoId = videoUrlOrId.trim()
      }

      const moduleLessons = courseLessons.filter((l) => l.module_id === targetModuleId)
      const nextOrder = moduleLessons.length + 1
      const durationSeconds = Math.max(60, (Number(newLessonDurationMin) || 15) * 60)

      const { data, error } = await createLesson({
        module_id: targetModuleId,
        course_id: selectedCourseIdForContent,
        title: newLessonTitle.trim(),
        description: newLessonDesc.trim() || null,
        order_index: nextOrder,
        duration_seconds: durationSeconds,
        video_provider: videoProvider,
        video_id: videoId,
        is_preview: newLessonIsPreview,
        published: true,
      })

      if (error || !data) {
        throw error || new Error('Error al registrar la lección')
      }

      setNewLessonTitle('')
      setNewLessonDesc('')
      setSelectedVideoFile(null)
      setVideoUrlOrId('')
      setContentFeedback({
        type: 'success',
        text: `¡Lección "${data.title}" creada exitosamente${
          videoProvider ? ' con video integrado' : ''
        }!`,
      })
      await loadContentForCourse(selectedCourseIdForContent)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear la lección'
      setContentFeedback({ type: 'error', text: msg })
    } finally {
      setCreatingLesson(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!confirm(`¿Eliminar la lección "${title}"?`)) return
    await deleteLesson(lessonId)
    await loadContentForCourse(selectedCourseIdForContent)
  }

  // Subir Material
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUploadFile) {
      setUploadFeedback({ type: 'error', text: 'Por favor selecciona un archivo para subir.' })
      return
    }
    if (!selectedCourseIdForMaterials) {
      setUploadFeedback({
        type: 'error',
        text: 'Por favor selecciona un curso para asociar el material.',
      })
      return
    }

    setIsUploadingMaterial(true)
    setUploadFeedback(null)

    try {
      let targetLessonId = selectedLessonIdForMaterials
      if (!targetLessonId || targetLessonId === 'auto') {
        const ensured = await ensureDefaultLesson(selectedCourseIdForMaterials)
        if (ensured.error || !ensured.lessonId) {
          throw (
            ensured.error ||
            new Error('No se pudo inicializar el contenedor de lección para el material')
          )
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
        throw (
          res.error ||
          new Error('Fallo al subir el archivo o registrar el material en la base de datos')
        )
      }

      setUploadFeedback({
        type: 'success',
        text: `¡Archivo "${selectedUploadFile.name}" subido y publicado exitosamente en el curso!`,
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
        alert(res.error?.message || 'No se pudo generar el enlace de descarga')
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

  // Crear Pregunta de Simulacro
  const handleCreateExamQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qText.trim() || !qOptA.trim() || !qOptB.trim() || !qOptC.trim() || !qOptD.trim()) {
      setExamFeedback({ type: 'error', text: 'Completa el enunciado y las 4 opciones.' })
      return
    }

    setCreatingQuestion(true)
    setExamFeedback(null)

    const { data, error } = await createExamQuestion({
      course_id: qCourseId || null,
      competency: qCompetency,
      difficulty: qDifficulty,
      text: qText.trim(),
      options: [
        { id: 'A', text: qOptA.trim() },
        { id: 'B', text: qOptB.trim() },
        { id: 'C', text: qOptC.trim() },
        { id: 'D', text: qOptD.trim() },
      ],
      correctAnswer: qCorrect,
      explanation:
        qExplanation.trim() ||
        'Respuesta fundamentada en los referentes pedagógicos y normativos del MEN.',
    })

    setCreatingQuestion(false)
    if (error || !data) {
      setExamFeedback({ type: 'error', text: error?.message || 'Error al guardar pregunta' })
      return
    }

    setQText('')
    setQOptA('')
    setQOptB('')
    setQOptC('')
    setQOptD('')
    setQExplanation('')
    setExamFeedback({
      type: 'success',
      text: '¡Pregunta agregada al banco del Simulacro Oficial CNSC!',
    })
    await loadExams()
  }

  const handleDeleteQuestion = async (id: string) => {
    await deleteExamQuestion(id)
    setExamQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  // Matricular estudiante en curso
  const handleEnrollStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollStudentId || !enrollCourseId) return
    setSubmittingEnroll(true)
    setStudentFeedback(null)

    const { error } = await enrollInCourse(enrollStudentId, enrollCourseId)
    setSubmittingEnroll(false)

    if (error) {
      setStudentFeedback({ type: 'error', text: error.message })
      return
    }

    setStudentFeedback({
      type: 'success',
      text: '¡Estudiante matriculado exitosamente con acceso total a videos y materiales!',
    })
    await loadStudentsTab()
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '2.4 KB'
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

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#F3F8FD] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-rose-200 text-center shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="font-display font-bold text-xl text-[#142D49] mb-2">
            Acceso Restringido
          </h2>
          <p className="text-xs text-[#536B83] mb-6 leading-relaxed">
            Esta sección es de uso exclusivo para docentes e instructores autorizados de MaestroTech.
            Si eres superusuario o docente, por favor inicia sesión con tu cuenta con permisos.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-semibold shadow-xs transition-colors"
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
      slug: `${slug || 'curso'}-${Date.now().toString().slice(-4)}`,
      category: newCategory,
      level: newLevel,
      price: Number(newPrice) || 0,
      duration_hours: Number(newDuration) || 24,
      description: newDescription,
      short_description: newDescription.slice(0, 140),
      published: isPublished,
      featured: true,
      thumbnail_url: null,
      instructor_id: user?.id || null,
      instructor_name: profile?.full_name || 'Dra. Elena Restrepo',
      instructor_role:
        role === 'admin' ? 'Superusuario / Director Pedagógico' : 'Formadora Senior MEN / CNSC',
    })

    setSubmittingCourse(false)

    if (res.error || !res.data) {
      setCourseFeedback({
        type: 'error',
        text: res.error?.message || 'Error al crear el curso',
      })
    } else {
      const createdCourse = res.data
      // Inicializar módulo y lección por defecto para que el curso esté listo inmediatamente
      await ensureDefaultLesson(createdCourse.id)
      setCourseFeedback({
        type: 'success',
        text: `¡Curso "${createdCourse.title}" creado y ${
          createdCourse.published ? 'publicado en el catálogo' : 'guardado en borrador'
        }!`,
      })
      setNewTitle('')
      setNewDescription('')
      await loadAllCourses()
      setSelectedCourseIdForContent(createdCourse.id)
      setSelectedCourseIdForMaterials(createdCourse.id)
      setTimeout(() => setActiveTab('content'), 1000)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F8FD] text-[#142D49] flex flex-col md:flex-row">
      {/* Sidebar Docente */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#E5EDF5] bg-white shrink-0 p-6 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-[#E5EDF5] shadow-xs group-hover:scale-105 transition-all duration-300 shrink-0 bg-white">
                <img src="/logo.png" alt="Maestro Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold font-display text-[#142D49] text-sm">MaestroTech</span>
            </Link>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Docente
            </span>
          </div>

          <div className="mb-6 pb-4 border-b border-[#E5EDF5]">
            <p className="text-xs font-bold text-[#142D49] truncate">
              {profile?.full_name || 'Docente'}
            </p>
            <p className="text-[11px] text-[#536B83] capitalize">
              {role === 'admin' ? 'Superusuario (Acceso Total)' : 'Instructor Oficial'}
            </p>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'courses', label: 'Mis Cursos', icon: BookOpen },
              { id: 'create-course', label: 'Crear Curso', icon: Plus },
              { id: 'content', label: 'Módulos y Videos', icon: Layers },
              { id: 'materials', label: 'Subir Materiales', icon: Upload },
              { id: 'exams', label: 'Crear Exámenes', icon: Target },
              { id: 'students', label: 'Estudiantes', icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TeacherTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-[#176FC1] text-white shadow-xs'
                    : 'text-[#536B83] hover:bg-[#F3F8FD] hover:text-[#142D49]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#E5EDF5] space-y-2">
          {role === 'admin' && (
            <Link
              href="/admin"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#142D49]/5 border border-[#142D49]/15 text-[#142D49] text-xs font-semibold hover:bg-[#142D49]/10 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#176FC1]" /> Panel Superusuario
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            href="/"
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-[#536B83] hover:text-[#142D49] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a la plataforma
          </Link>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#F3F8FD]">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header de la pestaña */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-[#142D49]">
                {activeTab === 'courses' && 'Gestión de Cursos y Publicación'}
                {activeTab === 'create-course' && 'Crear Nuevo Curso Docente'}
                {activeTab === 'content' && 'Módulos, Lecciones y Videos (Supabase)'}
                {activeTab === 'materials' && 'Repositorio de Materiales y Guías PDF'}
                {activeTab === 'exams' && 'Diseñador de Simulacros CNSC / MEN'}
                {activeTab === 'students' && 'Estudiantes Matriculados y Asignación'}
              </h1>
              <p className="text-xs text-[#536B83] mt-1">
                Herramientas pedagógicas oficiales conectadas en tiempo real con el catálogo y aula virtual.
              </p>
            </div>

            {activeTab !== 'create-course' && (
              <button
                onClick={() => setActiveTab('create-course')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" /> Crear Curso
              </button>
            )}
          </div>

          {/* TAB: Cursos */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              {loadingCourses ? (
                <div className="p-8 text-center text-xs text-[#536B83]">
                  Cargando cursos...
                </div>
              ) : courses.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs text-center">
                  <BookOpen className="w-10 h-10 text-[#536B83] mx-auto mb-3" />
                  <h3 className="font-bold text-[#142D49] text-sm mb-1">
                    Aún no hay cursos creados
                  </h3>
                  <p className="text-xs text-[#536B83] mb-4">
                    Comienza creando tu primer curso formativo.
                  </p>
                  <button
                    onClick={() => setActiveTab('create-course')}
                    className="px-4 py-2 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Crear mi primer curso
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {courses.map((c) => (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs hover:border-[#176FC1]/40 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#176FC1]/10 text-[#176FC1] border border-[#176FC1]/20">
                            {c.category || 'Pedagogía'}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              c.published
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-[#E9A83A]/15 text-[#E9A83A] border border-[#E9A83A]/30'
                            }`}
                          >
                            {c.published ? (
                              <>
                                <Eye className="w-3 h-3" /> Publicado
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" /> Borrador
                              </>
                            )}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-[#142D49] mb-2 line-clamp-2">
                          {c.title}
                        </h4>
                        <p className="text-xs text-[#536B83] line-clamp-2 mb-4">
                          {c.short_description || c.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#E5EDF5]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[#142D49] font-bold">
                            {c.price === 0 ? 'Gratis' : `$${Number(c.price).toLocaleString()} COP`}
                          </span>
                          <span className="text-[11px] text-[#536B83]">
                            {c.duration_hours || 24}h • {c.level || 'Intermedio'}
                          </span>
                        </div>

                        {/* Acciones rápidas del curso */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourseIdForContent(c.id)
                              setActiveTab('content')
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-[#176FC1]/10 hover:bg-[#176FC1]/20 text-[#176FC1] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" /> Módulos / Videos
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourseIdForMaterials(c.id)
                              setActiveTab('materials')
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-[#39BDEB]/15 hover:bg-[#39BDEB]/25 text-[#176FC1] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" /> Subir PDFs
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            type="button"
                            disabled={togglingCourseId === c.id}
                            onClick={() => handleTogglePublishCourse(c)}
                            className={`flex-1 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                              c.published
                                ? 'bg-[#E9A83A]/10 hover:bg-[#E9A83A]/20 text-[#E9A83A] border border-[#E9A83A]/30'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {togglingCourseId === c.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : c.published ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" /> Pasar a Borrador
                              </>
                            ) : (
                              <>
                                <Globe className="w-3.5 h-3.5" /> Publicar Curso Ahora
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={deletingCourseId === c.id}
                            onClick={() => handleDeleteCourse(c)}
                            className="p-1.5 rounded-xl bg-white border border-[#E5EDF5] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-[#536B83] transition-colors"
                            title="Eliminar curso"
                          >
                            {deletingCourseId === c.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Crear Curso */}
          {activeTab === 'create-course' && (
            <div className="max-w-2xl p-8 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs">
              <h3 className="font-display font-bold text-lg text-[#142D49] mb-1">
                Información General del Curso
              </h3>
              <p className="text-xs text-[#536B83] mb-6">
                Define el título, categoría y parámetros pedagógicos del programa.
              </p>

              {courseFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 mb-6 ${
                    courseFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {courseFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{courseFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateCourseSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#142D49] mb-1.5">
                    Título del Curso
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Evaluación de Competencias Docentes — Decreto 1278"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] text-sm text-[#142D49] placeholder-[#536B83] outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#142D49] mb-1.5">
                      Categoría
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-sm text-[#142D49] outline-none"
                    >
                      <option value="Pedagogía">Pedagogía</option>
                      <option value="Legislación">Legislación</option>
                      <option value="Evaluación">Evaluación</option>
                      <option value="Directivos">Directivos Docentes</option>
                      <option value="Matemáticas">Razonamiento Cuantitativo</option>
                      <option value="Lectura Crítica">Lectura Crítica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142D49] mb-1.5">
                      Nivel
                    </label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-sm text-[#142D49] outline-none"
                    >
                      <option value="Inicial">Inicial</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#142D49] mb-1.5">
                      Precio (COP - 0 para Gratis)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-sm text-[#142D49] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142D49] mb-1.5">
                      Duración Estimada (Horas)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-sm text-[#142D49] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142D49] mb-1.5">
                    Descripción Pedagógica
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe los objetivos formativos, contenidos temáticos y metodologías aplicadas..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] text-xs sm:text-sm text-[#142D49] placeholder-[#536B83] outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="publishCheck"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-[#176FC1] focus:ring-[#176FC1]/30 accent-[#176FC1]"
                  />
                  <label
                    htmlFor="publishCheck"
                    className="text-xs text-[#142D49] font-medium cursor-pointer"
                  >
                    Publicar inmediatamente en el catálogo de estudiantes
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={submittingCourse}
                    className="flex-1 py-3 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-bold shadow-md shadow-[#176FC1]/20 disabled:opacity-50 transition-colors"
                  >
                    {submittingCourse ? 'Guardando...' : 'Crear Curso y Configurar Módulos'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('courses')}
                    className="px-5 py-3 rounded-xl bg-white border border-[#E5EDF5] text-xs text-[#536B83] hover:text-[#142D49] font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: Módulos, Lecciones y Videos (content) */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Selector de curso */}
              <div className="p-5 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#142D49] mb-1">
                    Curso en Edición Curricular
                  </label>
                  <p className="text-[11px] text-[#536B83]">
                    Crea módulos, sube clases en video a Supabase Storage o vincula enlaces de YouTube / MP4.
                  </p>
                </div>
                <select
                  value={selectedCourseIdForContent}
                  onChange={(e) => setSelectedCourseIdForContent(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] font-semibold outline-none cursor-pointer max-w-md w-full"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.published ? 'Publicado' : 'Borrador'})
                    </option>
                  ))}
                </select>
              </div>

              {contentFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                    contentFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {contentFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{contentFeedback.text}</span>
                </div>
              )}

              <div className="grid lg:grid-cols-12 gap-6 items-start">
                {/* Columna Izquierda: Crear Módulo + Árbol Curricular */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Crear Módulo */}
                  <div className="p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#E5EDF5]">
                      <div className="w-8 h-8 rounded-xl bg-[#176FC1]/10 text-[#176FC1] flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm text-[#142D49]">
                          1. Agregar Módulo Curricular
                        </h3>
                        <p className="text-[11px] text-[#536B83]">
                          Agrupa las lecciones por unidad temática o competencia.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleCreateModule} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#142D49] mb-1">
                          Título del Módulo
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Módulo 3: Casos Situacionales de Aula"
                          value={newModuleTitle}
                          onChange={(e) => setNewModuleTitle(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#142D49] mb-1">
                          Descripción breve (opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Objetivos de aprendizaje del módulo..."
                          value={newModuleDesc}
                          onChange={(e) => setNewModuleDesc(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={creatingModule || !newModuleTitle.trim()}
                        className="w-full py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        {creatingModule ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Crear Módulo
                      </button>
                    </form>
                  </div>

                  {/* Estructura Actual de Módulos y Lecciones */}
                  <div className="p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5EDF5]">
                      <h3 className="font-display font-bold text-sm text-[#142D49]">
                        Estructura Actual del Curso
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#176FC1]/10 text-[#176FC1] border border-[#176FC1]/20">
                        {courseModules.length} módulos • {courseLessons.length} clases
                      </span>
                    </div>

                    {loadingContent ? (
                      <div className="p-6 text-center text-xs text-[#536B83] flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#176FC1]" />
                        Cargando estructura...
                      </div>
                    ) : courseModules.length === 0 ? (
                      <div className="p-8 rounded-2xl border border-dashed border-[#E5EDF5] text-center bg-[#F3F8FD]">
                        <p className="text-xs text-[#536B83]">
                          Este curso aún no tiene módulos. Crea el primero arriba.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {courseModules.map((mod) => {
                          const modLessons = courseLessons.filter((l) => l.module_id === mod.id)
                          return (
                            <div
                              key={mod.id}
                              className="p-4 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] space-y-2.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <h4 className="text-xs font-bold text-[#142D49]">{mod.title}</h4>
                                  {mod.description && (
                                    <p className="text-[11px] text-[#536B83]">
                                      {mod.description}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteModule(mod.id, mod.title)}
                                  className="p-1.5 rounded-lg text-[#536B83] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Eliminar módulo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {modLessons.length === 0 ? (
                                <p className="text-[11px] text-[#536B83] italic pl-2">
                                  Sin lecciones todavía.
                                </p>
                              ) : (
                                <div className="space-y-1.5 pt-1">
                                  {modLessons.map((les) => (
                                    <div
                                      key={les.id}
                                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-[#E5EDF5] text-xs shadow-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Play className="w-3.5 h-3.5 text-[#176FC1] shrink-0" />
                                        <div className="min-w-0">
                                          <p className="font-semibold text-[#142D49] truncate text-xs">
                                            {les.title}
                                          </p>
                                          <p className="text-[10px] text-[#536B83]">
                                            {Math.round((les.duration_seconds || 600) / 60)} min •{' '}
                                            {les.video_provider === 'supabase'
                                              ? 'Video en Supabase'
                                              : les.video_provider === 'youtube'
                                                ? 'YouTube'
                                                : les.video_id
                                                  ? 'Video Directo'
                                                  : 'Lectura / Guía'}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLesson(les.id, les.title)}
                                        className="p-1 rounded-lg text-[#536B83] hover:text-rose-600"
                                        title="Eliminar lección"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna Derecha: Crear Lección + Subir Video a Supabase */}
                <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-[#E5EDF5]">
                    <div className="w-8 h-8 rounded-xl bg-[#176FC1]/10 text-[#176FC1] flex items-center justify-center">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#142D49]">
                        2. Agregar Clase y Guardar Video en Supabase
                      </h3>
                      <p className="text-[11px] text-[#536B83]">
                        Sube archivos de video (.mp4, .webm) o vincula clases de YouTube.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateLesson} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#142D49] mb-1">
                        Módulo Destino
                      </label>
                      <select
                        value={selectedModuleIdForLesson}
                        onChange={(e) => setSelectedModuleIdForLesson(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                      >
                        {courseModules.length === 0 ? (
                          <option value="">⚡ Se creará Módulo 1 automáticamente</option>
                        ) : (
                          courseModules.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.title}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#142D49] mb-1">
                        Título de la Clase / Lección
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Clase 1: Análisis de Casos Pedagógicos Decreto 1278"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#142D49] mb-1">
                          Duración (minutos)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newLessonDurationMin}
                          onChange={(e) => setNewLessonDurationMin(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 text-xs text-[#142D49] cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={newLessonIsPreview}
                            onChange={(e) => setNewLessonIsPreview(e.target.checked)}
                            className="w-4 h-4 rounded text-[#176FC1] accent-[#176FC1]"
                          />
                          <span>Habilitar vista previa</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#142D49] mb-1">
                        Resumen o Notas de la Clase
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Descripción de los temas explicados en el video..."
                        value={newLessonDesc}
                        onChange={(e) => setNewLessonDesc(e.target.value)}
                        className="w-full p-3 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none resize-none placeholder-[#536B83]"
                      />
                    </div>

                    {/* Selector de Fuente de Video */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#142D49]">
                        Fuente del Video de la Clase
                      </label>
                      <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5]">
                        <button
                          type="button"
                          onClick={() => setVideoInputMode('upload')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                            videoInputMode === 'upload'
                              ? 'bg-white text-[#176FC1] shadow-xs'
                              : 'text-[#536B83] hover:text-[#142D49]'
                          }`}
                        >
                          Subir Video MP4
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoInputMode('youtube')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                            videoInputMode === 'youtube'
                              ? 'bg-white text-[#176FC1] shadow-xs'
                              : 'text-[#536B83] hover:text-[#142D49]'
                          }`}
                        >
                          YouTube URL/ID
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoInputMode('url')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                            videoInputMode === 'url'
                              ? 'bg-white text-[#176FC1] shadow-xs'
                              : 'text-[#536B83] hover:text-[#142D49]'
                          }`}
                        >
                          URL Directa MP4
                        </button>
                      </div>

                      {videoInputMode === 'upload' ? (
                        <FileUploader
                          accept=".mp4,.webm,.mov,video/mp4,video/webm"
                          maxSizeMB={500}
                          helperText="Archivos de video .MP4, .WebM o .MOV (hasta 500 MB) — se guardan en Supabase Storage"
                          onFileSelect={(file) => setSelectedVideoFile(file)}
                          onClear={() => setSelectedVideoFile(null)}
                          selectedFile={selectedVideoFile}
                          uploading={creatingLesson}
                          progressText="Subiendo video a Supabase Storage..."
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={
                            videoInputMode === 'youtube'
                              ? 'Ej. https://www.youtube.com/watch?v=M7lc1UVf-VE o ID M7lc1UVf-VE'
                              : 'Ej. https://.../clase-magistral.mp4'
                          }
                          value={videoUrlOrId}
                          onChange={(e) => setVideoUrlOrId(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                        />
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={creatingLesson || !newLessonTitle.trim()}
                      className="w-full py-3 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-bold shadow-md shadow-[#176FC1]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {creatingLesson ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Guardando clase y video...
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4" />
                          Publicar Lección en el Curso
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Materiales (Subida y Gestión de Archivos) */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              {courses.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs text-center max-w-lg mx-auto">
                  <BookOpen className="w-10 h-10 text-[#536B83] mx-auto mb-3" />
                  <h3 className="font-bold text-[#142D49] text-sm mb-1">
                    Primero crea un curso
                  </h3>
                  <p className="text-xs text-[#536B83] mb-4">
                    Para subir documentos y material de clase necesitas al menos un curso registrado.
                  </p>
                  <button
                    onClick={() => setActiveTab('create-course')}
                    className="px-4 py-2 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Crear mi primer curso
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Selector de curso actual */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#142D49] mb-1">
                        Curso Seleccionado
                      </label>
                      <p className="text-[11px] text-[#536B83]">
                        Los materiales subidos estarán disponibles inmediatamente para los estudiantes matriculados.
                      </p>
                    </div>
                    <select
                      value={selectedCourseIdForMaterials}
                      onChange={(e) => setSelectedCourseIdForMaterials(e.target.value)}
                      className="px-4 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] font-semibold outline-none cursor-pointer max-w-md w-full"
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
                    <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                      <div className="flex items-center gap-2.5 pb-2 border-b border-[#E5EDF5]">
                        <div className="w-8 h-8 rounded-xl bg-[#176FC1]/10 text-[#176FC1] flex items-center justify-center">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-sm text-[#142D49]">
                            Subir Documento, Guía PDF o Recurso
                          </h3>
                          <p className="text-[11px] text-[#536B83]">
                            Almacenamiento sincronizado con Supabase Storage y aula virtual.
                          </p>
                        </div>
                      </div>

                      {uploadFeedback && (
                        <div
                          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                            uploadFeedback.type === 'success'
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                              : 'bg-rose-50 border border-rose-200 text-rose-800'
                          }`}
                        >
                          {uploadFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          )}
                          <span>{uploadFeedback.text}</span>
                        </div>
                      )}

                      <form onSubmit={handleUploadSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#142D49] mb-1">
                            Lección / Contenedor Destino
                          </label>
                          <select
                            value={selectedLessonIdForMaterials}
                            onChange={(e) => setSelectedLessonIdForMaterials(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none cursor-pointer"
                          >
                            <option value="auto">
                              ⚡ Contenedor automático (Primera clase del curso)
                            </option>
                            {availableLessons.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.module_title} — {l.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#142D49] mb-1">
                            Nombre descriptivo del material (opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Cartilla Oficial Decreto 1278 - Estatuto Docente"
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none placeholder-[#536B83]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#142D49] mb-1.5">
                            Archivo a Cargar
                          </label>
                          <FileUploader
                            onFileSelect={(file) => setSelectedUploadFile(file)}
                            onClear={() => setSelectedUploadFile(null)}
                            selectedFile={selectedUploadFile}
                            uploading={isUploadingMaterial}
                            progressText="Subiendo archivo al almacenamiento..."
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={!selectedUploadFile || isUploadingMaterial}
                          className="w-full py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-bold shadow-md shadow-[#176FC1]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
                    <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5EDF5]">
                        <div className="flex items-center gap-2">
                          <FolderDown className="w-4 h-4 text-[#176FC1]" />
                          <h3 className="font-display font-bold text-sm text-[#142D49]">
                            Materiales Registrados en este Curso
                          </h3>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#176FC1]/10 text-[#176FC1] border border-[#176FC1]/20">
                          {courseMaterials.length}{' '}
                          {courseMaterials.length === 1 ? 'archivo' : 'archivos'}
                        </span>
                      </div>

                      {loadingMaterials ? (
                        <div className="p-8 text-center text-xs text-[#536B83] flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#176FC1]" />
                          Consultando materiales del curso...
                        </div>
                      ) : courseMaterials.length === 0 ? (
                        <div className="p-10 rounded-2xl border border-dashed border-[#E5EDF5] text-center bg-[#F3F8FD]">
                          <FileText className="w-8 h-8 text-[#536B83] mx-auto mb-2 opacity-50" />
                          <p className="text-xs font-semibold text-[#142D49] mb-1">
                            Aún no hay materiales en este curso
                          </p>
                          <p className="text-[11px] text-[#536B83]">
                            Arrastra y suelta tus guías, PDFs o presentaciones en el panel de la izquierda para publicarlos.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                          {courseMaterials.map((mat) => (
                            <div
                              key={mat.id}
                              className="p-3.5 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] hover:border-[#176FC1]/40 transition-all flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-[#176FC1]/10 text-[#176FC1] flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-semibold text-[#142D49] truncate">
                                    {mat.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#536B83]">
                                    <span className="uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-white border border-[#E5EDF5]">
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
                                  className="p-2 rounded-xl bg-white border border-[#E5EDF5] hover:border-[#176FC1] hover:text-[#176FC1] text-[#536B83] transition-colors"
                                  title="Descargar o abrir archivo"
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
                                  className="p-2 rounded-xl bg-white border border-[#E5EDF5] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-[#536B83] transition-colors"
                                  title="Eliminar material"
                                >
                                  {deletingMaterialId === mat.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
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

          {/* TAB: Exámenes (Crear Preguntas para el Simulacro CNSC) */}
          {activeTab === 'exams' && (
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Formulario para nueva pregunta */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#E5EDF5]">
                  <div className="w-8 h-8 rounded-xl bg-[#176FC1]/10 text-[#176FC1] flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#142D49]">
                      Agregar Pregunta Tipo CNSC / ICFES
                    </h3>
                    <p className="text-[11px] text-[#536B83]">
                      Se publica en el Simulacro de Examen de los estudiantes.
                    </p>
                  </div>
                </div>

                {examFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      examFeedback.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {examFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{examFeedback.text}</span>
                  </div>
                )}

                <form onSubmit={handleCreateExamQuestion} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#142D49] mb-1">
                        Competencia Evaluada
                      </label>
                      <select
                        value={qCompetency}
                        onChange={(e) => setQCompetency(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                      >
                        <option value="Competencia Pedagógica">Competencia Pedagógica</option>
                        <option value="Legislación Educativa">Legislación Educativa</option>
                        <option value="Lectura Crítica">Lectura Crítica</option>
                        <option value="Razonamiento Cuantitativo">Razonamiento Cuantitativo</option>
                        <option value="Competencia Comportamental">
                          Competencia Comportamental
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#142D49] mb-1">
                        Nivel de Dificultad
                      </label>
                      <select
                        value={qDifficulty}
                        onChange={(e) =>
                          setQDifficulty(e.target.value as 'Básico' | 'Intermedio' | 'Avanzado')
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                      >
                        <option value="Básico">Básico</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142D49] mb-1">
                      Curso Asociado (opcional)
                    </label>
                    <select
                      value={qCourseId}
                      onChange={(e) => setQCourseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                    >
                      <option value="">🌐 Todos los cursos (Banco General CNSC)</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142D49] mb-1">
                      Caso Situacional / Enunciado de la Pregunta
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="En una institución educativa oficial, el docente observa que..."
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none resize-none placeholder-[#536B83]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#142D49]">
                      Opciones de Respuesta
                    </label>
                    {[
                      { id: 'A', val: qOptA, setter: setQOptA },
                      { id: 'B', val: qOptB, setter: setQOptB },
                      { id: 'C', val: qOptC, setter: setQOptC },
                      { id: 'D', val: qOptD, setter: setQOptD },
                    ].map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#176FC1]/10 text-[#176FC1] font-bold text-xs flex items-center justify-center shrink-0">
                          {opt.id}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder={`Opción ${opt.id}...`}
                          value={opt.val}
                          onChange={(e) => opt.setter(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center">
                    <div>
                      <label className="block text-xs font-semibold text-[#142D49] mb-1">
                        Respuesta Correcta
                      </label>
                      <select
                        value={qCorrect}
                        onChange={(e) => setQCorrect(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 outline-none"
                      >
                        <option value="A">Opción A</option>
                        <option value="B">Opción B</option>
                        <option value="C">Opción C</option>
                        <option value="D">Opción D</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-[#142D49] mb-1">
                        Justificación Pedagógica / Normativa
                      </label>
                      <input
                        type="text"
                        placeholder="Por qué es la respuesta correcta según el MEN..."
                        value={qExplanation}
                        onChange={(e) => setQExplanation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingQuestion}
                    className="w-full py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-bold shadow-md shadow-[#176FC1]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {creatingQuestion ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Guardar Pregunta en el Simulacro
                  </button>
                </form>
              </div>

              {/* Banco de Preguntas Activas */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5EDF5]">
                  <h3 className="font-display font-bold text-sm text-[#142D49]">
                    Banco de Preguntas del Simulacro ({examQuestions.length})
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Activo en Simulacro
                  </span>
                </div>

                {loadingExams ? (
                  <div className="p-8 text-center text-xs text-[#536B83]">
                    Cargando banco de preguntas...
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                    {examQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#176FC1]/10 text-[#176FC1] border border-[#176FC1]/20">
                              #{idx + 1} • {q.competency}
                            </span>
                            <span className="text-[10px] text-[#536B83]">
                              {q.difficulty}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1 rounded-lg text-[#536B83] hover:text-rose-600"
                            title="Eliminar pregunta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-[#142D49] leading-relaxed font-medium">{q.text}</p>
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          Respuesta correcta: {q.correctAnswer}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Estudiantes Matriculados */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Formulario para matricular estudiante a un curso */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#E5EDF5]">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#142D49]">
                      Matricular Estudiante en un Curso
                    </h3>
                    <p className="text-[11px] text-[#536B83]">
                      Habilita acceso inmediato a todas las videoclases y guías descargables del curso.
                    </p>
                  </div>
                </div>

                {studentFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      studentFeedback.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {studentFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{studentFeedback.text}</span>
                  </div>
                )}

                <form
                  onSubmit={handleEnrollStudentSubmit}
                  className="grid sm:grid-cols-3 gap-4 items-end"
                >
                  <div>
                    <label className="block text-xs font-semibold text-[#142D49] mb-1">
                      Seleccionar Estudiante
                    </label>
                    <select
                      value={enrollStudentId}
                      onChange={(e) => setEnrollStudentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                    >
                      {platformStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.full_name} ({st.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142D49] mb-1">
                      Curso a Matricular
                    </label>
                    <select
                      value={enrollCourseId}
                      onChange={(e) => setEnrollCourseId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingEnroll}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {submittingEnroll ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <GraduationCap className="w-4 h-4" />
                    )}
                    Matricular Estudiante Ahora
                  </button>
                </form>
              </div>

              {/* Lista de Matrículas Activas */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5EDF5]">
                  <h3 className="font-display font-bold text-sm text-[#142D49]">
                    Estudiantes con Matrícula Activa ({enrollments.length})
                  </h3>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Sincronizado con Aula Virtual
                  </span>
                </div>

                {loadingStudents ? (
                  <div className="p-8 text-center text-xs text-[#536B83]">
                    Consultando matrículas...
                  </div>
                ) : enrollments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#536B83]">
                    No hay matrículas registradas todavía.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {enrollments.map((enr) => (
                      <div
                        key={enr.id}
                        className="p-4 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#142D49] truncate">
                              {enr.student_name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                              Activo
                            </span>
                          </div>
                          <p className="text-[11px] text-[#536B83] truncate">
                            {enr.student_email}
                          </p>
                          <p className="text-[11px] text-[#176FC1] font-semibold mt-1 truncate">
                            📚 {enr.course?.title || 'Curso Oficial MaestroTech'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
