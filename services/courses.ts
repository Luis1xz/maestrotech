import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Course, CourseWithHierarchy, Module, Lesson, Material, LessonProgress, Enrollment } from '@/types/database'
import { DEMO_COURSES } from './demo-data'

export interface GetCoursesResult {
  data: Course[] | null
  error: Error | null
  isDemo?: boolean
}

export interface GetCourseHierarchyResult {
  data: CourseWithHierarchy | null
  error: Error | null
  isDemo?: boolean
}

/**
 * Obtener todos los cursos publicados
 */
export async function getCourses(options?: {
  featuredOnly?: boolean
  category?: string
}): Promise<GetCoursesResult> {
  if (!isSupabaseConfigured()) {
    let result = DEMO_COURSES
    if (options?.featuredOnly) {
      result = result.filter(c => c.featured)
    }
    if (options?.category) {
      result = result.filter(c => c.category?.toLowerCase() === options.category?.toLowerCase())
    }
    return { data: result, error: null, isDemo: true }
  }

  try {
    const client = getSupabase()
    let query = client
      .from('courses')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (options?.featuredOnly) {
      query = query.eq('featured', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('[coursesService.getCourses] Error en Supabase:', error)
      return { data: null, error: new Error(`Error al cargar cursos: ${error.message}`) }
    }

    let result = (data as Course[]) || []
    if (options?.category) {
      result = result.filter(
        c => c.category?.toLowerCase() === options.category?.toLowerCase()
      )
    }

    return { data: result, error: null, isDemo: false }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error inesperado al consultar cursos'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Obtener un curso por su slug con su jerarquía completa (módulos, lecciones, materiales y progreso)
 */
export async function getCourseBySlug(
  slug: string,
  userId?: string
): Promise<GetCourseHierarchyResult> {
  if (!isSupabaseConfigured()) {
    const demo = DEMO_COURSES.find(c => c.slug === slug) || DEMO_COURSES[0]
    return { data: demo, error: null, isDemo: true }
  }

  try {
    const client = getSupabase()

    // 1. Obtener curso
    const { data: courseData, error: courseError } = await client
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (courseError) {
      return { data: null, error: new Error(`Error al consultar curso: ${courseError.message}`) }
    }

    if (!courseData) {
      return { data: null, error: new Error('Curso no encontrado') }
    }

    const course = courseData as Course
    return await getCourseHierarchy(course.id, userId, course)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener curso'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Obtener la jerarquía completa de un curso dado su ID
 */
export async function getCourseHierarchy(
  courseId: string,
  userId?: string,
  preloadedCourse?: Course
): Promise<GetCourseHierarchyResult> {
  if (!isSupabaseConfigured()) {
    const demo = DEMO_COURSES.find(c => c.id === courseId) || DEMO_COURSES[0]
    return { data: demo, error: null, isDemo: true }
  }

  try {
    const client = getSupabase()

    // 1. Si no viene precargado, obtener el curso
    let course = preloadedCourse
    if (!course) {
      const { data, error } = await client
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle()

      if (error) throw error
      if (!data) return { data: null, error: new Error('Curso no encontrado') }
      course = data as Course
    }

    // 2. Obtener módulos del curso
    const { data: modulesData, error: modulesError } = await client
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (modulesError) throw modulesError

    const modules = (modulesData || []) as Module[]
    const moduleIds = modules.map(m => m.id)

    // 3. Obtener lecciones de todos los módulos
    let lessons: Lesson[] = []
    if (moduleIds.length > 0) {
      const { data: lessonsData, error: lessonsError } = await client
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .eq('published', true)
        .order('order_index', { ascending: true })

      if (lessonsError) throw lessonsError
      lessons = (lessonsData || []) as Lesson[]
    }

    const lessonIds = lessons.map(l => l.id)

    // 4. Obtener materiales de las lecciones
    let materials: Material[] = []
    if (lessonIds.length > 0) {
      const { data: materialsData, error: materialsError } = await client
        .from('materials')
        .select('*')
        .in('lesson_id', lessonIds)

      if (materialsError) throw materialsError
      materials = (materialsData || []) as Material[]
    }

    // 5. Si hay usuario autenticado, obtener matrícula y progreso
    let enrollment: Enrollment | null = null
    let progressMap = new Map<string, LessonProgress>()

    if (userId) {
      const { data: enrollData } = await client
        .from('enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle()

      if (enrollData) {
        enrollment = enrollData as Enrollment
      }

      if (lessonIds.length > 0) {
        const { data: progressData } = await client
          .from('lesson_progress')
          .select('*')
          .eq('user_id', userId)
          .in('lesson_id', lessonIds)

        if (progressData) {
          ;(progressData as LessonProgress[]).forEach(p => {
            progressMap.set(p.lesson_id, p)
          })
        }
      }
    }

    // 6. Ensamblar jerarquía
    let totalLessons = 0
    let completedLessons = 0
    let totalDurationSeconds = 0

    const hierarchyModules = modules.map(mod => {
      const moduleLessons = lessons
        .filter(l => l.module_id === mod.id)
        .map(lesson => {
          totalLessons++
          totalDurationSeconds += lesson.duration_seconds || 0

          const lessonMaterials = materials.filter(m => m.lesson_id === lesson.id)
          const prog = progressMap.get(lesson.id) || null
          if (prog?.completed) {
            completedLessons++
          }

          return {
            ...lesson,
            materials: lessonMaterials,
            progress: prog,
          }
        })

      return {
        ...mod,
        lessons: moduleLessons,
        lessons_count: moduleLessons.length,
        completed_lessons_count: moduleLessons.filter(l => l.progress?.completed).length,
      }
    })

    const percentComplete =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    const fullCourse: CourseWithHierarchy = {
      ...course,
      modules: hierarchyModules,
      enrollment,
      stats: {
        totalLessons,
        completedLessons,
        percentComplete,
        totalDurationSeconds,
      },
    }

    return { data: fullCourse, error: null, isDemo: false }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener jerarquía del curso'
    return { data: null, error: new Error(msg) }
  }
}

// ==========================================
// OPERACIONES DE GESTIÓN (ADMIN) PREPARADAS
// ==========================================

export async function createCourse(
  courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Course | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase no está configurado') }
  }

  try {
    const client = getSupabase()
    // Solo enviar columnas existentes en la tabla courses de Supabase
    const payload: Record<string, unknown> = {
      title: courseData.title,
      slug: courseData.slug,
      description: courseData.description ?? null,
      short_description: courseData.short_description ?? null,
      thumbnail_url: courseData.thumbnail_url ?? null,
      price: courseData.price ?? 0,
      published: Boolean(courseData.published),
      featured: Boolean(courseData.featured),
    }

    const { data, error } = await client
      .from('courses')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return { data: data as Course, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al crear curso'
    return { data: null, error: new Error(msg) }
  }
}

export async function updateCourse(
  id: string,
  courseData: Partial<Course>
): Promise<{ data: Course | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase no está configurado') }
  }

  try {
    const client = getSupabase()
    const allowedKeys: (keyof Course)[] = [
      'title',
      'slug',
      'description',
      'short_description',
      'thumbnail_url',
      'price',
      'published',
      'featured',
    ]

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    for (const key of allowedKeys) {
      if (key in courseData && courseData[key] !== undefined) {
        payload[key] = courseData[key]
      }
    }

    const { data, error } = await client
      .from('courses')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data: data as Course, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar curso'
    return { data: null, error: new Error(msg) }
  }
}
