import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  Course,
  CourseWithHierarchy,
  Module,
  Lesson,
  Material,
  LessonProgress,
  Enrollment,
} from '@/types/database'
import { fetchPlatformState, mutatePlatformState } from '@/lib/platform-state-client'

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
 * Combina cursos de Supabase con el estado enriquecido del servidor
 */
function mergeCourses(dbCourses: Course[], storeCourses: Course[], deletedIds: string[] = []): Course[] {
  const map = new Map<string, Course>()

  for (const sc of storeCourses) {
    if (!deletedIds.includes(sc.id)) {
      map.set(sc.id, { ...sc })
    }
  }

  for (const dbc of dbCourses) {
    if (deletedIds.includes(dbc.id)) continue
    const existing = map.get(dbc.id) || Array.from(map.values()).find((c) => c.slug === dbc.slug)
    if (existing) {
      // Si en BD el curso tiene un título de prueba como 'fdhdfhg666', usar el título enriquecido del store
      const useStoreTitle = dbc.title === 'fdhdfhg666' && existing.title !== 'fdhdfhg666'
      map.set(dbc.id, {
        ...existing,
        ...dbc,
        title: useStoreTitle ? existing.title : dbc.title || existing.title,
        description:
          dbc.description === 'rrtsth' && existing.description !== 'rrtsth'
            ? existing.description
            : dbc.description || existing.description,
        short_description:
          dbc.short_description === 'rrtsth' && existing.short_description !== 'rrtsth'
            ? existing.short_description
            : dbc.short_description || existing.short_description,
        thumbnail_url: dbc.thumbnail_url || existing.thumbnail_url,
        category: dbc.category || existing.category || 'Pedagogía',
        level: dbc.level || existing.level || 'Intermedio',
        instructor_id: dbc.instructor_id || existing.instructor_id,
        instructor_name: dbc.instructor_name || existing.instructor_name || 'Docente MaestroTech',
        instructor_role: dbc.instructor_role || existing.instructor_role || 'Especialista Pedagógico',
        duration_hours: dbc.duration_hours ?? existing.duration_hours ?? 8,
        published: existing.published !== undefined ? existing.published : dbc.published,
      })
    } else {
      map.set(dbc.id, {
        ...dbc,
        category: dbc.category || 'Pedagogía',
        level: dbc.level || 'Intermedio',
        instructor_name: dbc.instructor_name || 'Docente MaestroTech',
        duration_hours: dbc.duration_hours ?? 6,
      })
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

/**
 * Obtener todos los cursos publicados (o todos incluyendo borradores para docentes/admins)
 */
export async function getCourses(options?: {
  featuredOnly?: boolean
  category?: string
  includeDrafts?: boolean
}): Promise<GetCoursesResult> {
  try {
    const state = await fetchPlatformState()
    let dbCourses: Course[] = []

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        let query = client.from('courses').select('*').order('created_at', { ascending: false })
        if (!options?.includeDrafts) {
          query = query.eq('published', true)
        }
        const { data, error } = await query
        if (!error && data) {
          dbCourses = data as Course[]
        }
      } catch {
        // Fallback silencioso a state.courses si falla red temporalmente
      }
    }

    let result = mergeCourses(dbCourses, state.courses || [], state.deletedCourseIds || [])

    if (!options?.includeDrafts) {
      result = result.filter((c) => c.published)
    }
    if (options?.featuredOnly) {
      result = result.filter((c) => c.featured)
    }
    if (options?.category && options.category !== 'Todos') {
      result = result.filter(
        (c) => c.category?.toLowerCase() === options.category?.toLowerCase()
      )
    }

    return { data: result, error: null, isDemo: false }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error inesperado al consultar cursos'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Obtener TODOS los cursos (publicados y borradores) para el Panel Docente y Panel Superusuario
 */
export async function getAllCoursesForTeacher(): Promise<GetCoursesResult> {
  return getCourses({ includeDrafts: true })
}

/**
 * Obtener un curso por su slug o ID con su jerarquía completa (módulos, lecciones, materiales y progreso)
 */
export async function getCourseBySlug(
  slug: string,
  userId?: string
): Promise<GetCourseHierarchyResult> {
  try {
    const state = await fetchPlatformState()
    let dbCourse: Course | null = null

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data } = await client
          .from('courses')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()
        if (data) dbCourse = data as Course
      } catch {
        // Continuar con store
      }
    }

    const storeCourse =
      state.courses.find((c) => c.slug === slug || c.id === slug) || null

    const mergedList = mergeCourses(
      dbCourse ? [dbCourse] : [],
      storeCourse ? [storeCourse] : [],
      state.deletedCourseIds || []
    )

    const course = mergedList[0] || state.courses[0]
    if (!course) {
      return { data: null, error: new Error('Curso no encontrado') }
    }

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
  try {
    const state = await fetchPlatformState()
    const client = isSupabaseConfigured() ? getSupabase() : null

    // 1. Resolver curso
    let course = preloadedCourse
    if (!course) {
      const storeCourse = state.courses.find((c) => c.id === courseId || c.slug === courseId)
      if (client) {
        try {
          const { data } = await client
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .maybeSingle()
          if (data) {
            course = mergeCourses([data as Course], storeCourse ? [storeCourse] : [])[0]
          }
        } catch {
          // ignore
        }
      }
      if (!course && storeCourse) course = storeCourse
    }

    if (!course) {
      return { data: null, error: new Error('Curso no encontrado') }
    }

    // 2. Obtener módulos (combinar Supabase + Store)
    let dbModules: Module[] = []
    if (client) {
      try {
        const { data } = await client
          .from('modules')
          .select('*')
          .eq('course_id', course.id)
          .order('order_index', { ascending: true })
        if (data) dbModules = data as Module[]
      } catch {
        // ignore
      }
    }

    const storeModules = (state.modules || []).filter((m) => m.course_id === course!.id)
    const moduleMap = new Map<string, Module>()
    for (const sm of storeModules) moduleMap.set(sm.id, { ...sm })
    for (const dm of dbModules) {
      const existing = moduleMap.get(dm.id)
      moduleMap.set(dm.id, existing ? { ...dm, ...existing } : dm)
    }

    const modules = Array.from(moduleMap.values()).sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0)
    )
    const moduleIds = modules.map((m) => m.id)

    // 3. Obtener lecciones (combinar Supabase + Store)
    let dbLessons: Lesson[] = []
    if (client && moduleIds.length > 0) {
      try {
        const { data } = await client
          .from('lessons')
          .select('*')
          .in('module_id', moduleIds)
          .order('order_index', { ascending: true })
        if (data) dbLessons = data as Lesson[]
      } catch {
        // ignore
      }
    }

    const storeLessons = (state.lessons || []).filter((l) => moduleIds.includes(l.module_id))
    const lessonMap = new Map<string, Lesson>()
    for (const sl of storeLessons) lessonMap.set(sl.id, { ...sl })
    for (const dl of dbLessons) {
      const existing = lessonMap.get(dl.id)
      lessonMap.set(dl.id, existing ? { ...dl, ...existing } : dl)
    }

    const lessons = Array.from(lessonMap.values())
      .filter((l) => l.published !== false)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    const lessonIds = lessons.map((l) => l.id)

    // 4. Obtener materiales (combinar Supabase + Store)
    let dbMaterials: Material[] = []
    if (client && lessonIds.length > 0) {
      try {
        const { data } = await client
          .from('materials')
          .select('*')
          .in('lesson_id', lessonIds)
        if (data) dbMaterials = data as Material[]
      } catch {
        // ignore
      }
    }

    const storeMaterials = (state.materials || []).filter((m) => lessonIds.includes(m.lesson_id))
    const materialMap = new Map<string, Material>()
    for (const sm of storeMaterials) materialMap.set(sm.id, { ...sm })
    for (const dm of dbMaterials) {
      const existing = materialMap.get(dm.id)
      materialMap.set(dm.id, existing ? { ...dm, ...existing } : dm)
    }
    const materials = Array.from(materialMap.values())

    // 5. Matrícula y progreso del usuario
    let enrollment: Enrollment | null = null
    const progressMap = new Map<string, LessonProgress>()

    if (userId) {
      const storeEnroll = (state.enrollments || []).find(
        (e) => e.user_id === userId && e.course_id === course!.id && e.status === 'active'
      )
      if (storeEnroll) {
        enrollment = storeEnroll
      }

      if (client) {
        try {
          const { data: enrollData } = await client
            .from('enrollments')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', course.id)
            .maybeSingle()
          if (enrollData) enrollment = enrollData as Enrollment
        } catch {
          // ignore
        }
      }

      const storeProgress = (state.lesson_progress || []).filter(
        (p) => p.user_id === userId && lessonIds.includes(p.lesson_id)
      )
      for (const sp of storeProgress) {
        progressMap.set(sp.lesson_id, sp)
      }

      if (client && lessonIds.length > 0) {
        try {
          const { data: progressData } = await client
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .in('lesson_id', lessonIds)
          if (progressData) {
            ;(progressData as LessonProgress[]).forEach((p) => {
              progressMap.set(p.lesson_id, p)
            })
          }
        } catch {
          // ignore
        }
      }
    }

    // 6. Ensamblar jerarquía
    let totalLessons = 0
    let completedLessons = 0
    let totalDurationSeconds = 0

    const hierarchyModules = modules.map((mod) => {
      const moduleLessons = lessons
        .filter((l) => l.module_id === mod.id)
        .map((lesson) => {
          totalLessons++
          totalDurationSeconds += lesson.duration_seconds || 0

          const lessonMaterials = materials.filter((m) => m.lesson_id === lesson.id)
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
        completed_lessons_count: moduleLessons.filter((l) => l.progress?.completed).length,
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
// OPERACIONES DE GESTIÓN (DOCENTE Y ADMIN)
// ==========================================

export async function createCourse(
  courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Course | null; error: Error | null }> {
  try {
    const now = new Date().toISOString()
    let createdId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `course-${Date.now()}`

    // 1. Intentar insertar en Supabase PostgreSQL
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
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

        if (!error && data) {
          createdId = data.id
        }
      } catch {
        // Persistir de todas formas en el store sincronizado
      }
    }

    const fullCourse: Course = {
      id: createdId,
      title: courseData.title,
      slug: courseData.slug,
      description: courseData.description ?? null,
      short_description: courseData.short_description ?? null,
      thumbnail_url:
        courseData.thumbnail_url ||
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
      price: courseData.price ?? 0,
      published: Boolean(courseData.published),
      featured: Boolean(courseData.featured),
      level: courseData.level || 'Intermedio',
      category: courseData.category || 'Pedagogía',
      instructor_id: courseData.instructor_id || null,
      instructor_name: courseData.instructor_name || 'Docente MaestroTech',
      instructor_role: courseData.instructor_role || 'Docente Formador',
      duration_hours: courseData.duration_hours || 6,
      created_at: now,
      updated_at: now,
    }

    // 2. Guardar en estado sincronizado del servidor
    await mutatePlatformState('upsert_course', fullCourse)

    // 3. Crear módulo 1 y clase 1 inicial para que el curso esté listo inmediatamente
    const modId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `mod-${Date.now()}`
    const lessonId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `less-${Date.now()}`

    await mutatePlatformState('upsert_module', {
      id: modId,
      course_id: fullCourse.id,
      title: 'Módulo 1: Fundamentos y Recursos del Programa',
      description: 'Introducción temática y material de estudio del curso.',
      order_index: 1,
      created_at: now,
    })

    await mutatePlatformState('upsert_lesson', {
      id: lessonId,
      module_id: modId,
      title: 'Clase 1: Sesión Inaugural y Guía de Estudio',
      description: fullCourse.description || 'Sesión introductoria del programa.',
      order_index: 1,
      video_provider: 'custom',
      video_id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration_seconds: 900,
      is_preview: true,
      published: true,
      created_at: now,
    })

    return { data: fullCourse, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al crear curso'
    return { data: null, error: new Error(msg) }
  }
}

export async function updateCourse(
  id: string,
  courseData: Partial<Course>
): Promise<{ data: Course | null; error: Error | null }> {
  try {
    const now = new Date().toISOString()

    // 1. Intentar actualizar en Supabase
    if (isSupabaseConfigured()) {
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
        const payload: Record<string, unknown> = { updated_at: now }
        for (const key of allowedKeys) {
          if (key in courseData && courseData[key] !== undefined) {
            payload[key] = courseData[key]
          }
        }
        await client.from('courses').update(payload).eq('id', id)
      } catch {
        // Continuar con actualización en store
      }
    }

    // 2. Actualizar en estado sincronizado
    const state = await fetchPlatformState()
    const existing = state.courses.find((c) => c.id === id)
    const updated: Course = {
      ...(existing || {
        id,
        title: courseData.title || 'Curso',
        slug: courseData.slug || id,
        description: null,
        short_description: null,
        thumbnail_url: null,
        price: 0,
        published: true,
        featured: false,
        created_at: now,
      }),
      ...courseData,
      updated_at: now,
    }

    await mutatePlatformState('upsert_course', updated)
    return { data: updated, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar curso'
    return { data: null, error: new Error(msg) }
  }
}

export async function deleteCourse(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        await client.from('courses').delete().eq('id', id)
      } catch {
        // ignore
      }
    }
    await mutatePlatformState('delete_course', { id })
    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar curso'
    return { success: false, error: new Error(msg) }
  }
}
