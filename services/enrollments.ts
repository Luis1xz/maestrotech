import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Enrollment, Course } from '@/types/database'
import { fetchPlatformState, mutatePlatformState } from '@/lib/platform-state-client'

export interface EnrollmentWithCourse extends Enrollment {
  course?: Course
}

export interface EnrollmentWithStudentAndCourse extends Enrollment {
  course?: Course
  student_name?: string
  student_email?: string
}

/**
 * Obtener las matrículas de un estudiante con los datos del curso
 */
export async function getUserEnrollments(
  userId: string
): Promise<{ data: EnrollmentWithCourse[] | null; error: Error | null; isDemo?: boolean }> {
  try {
    const state = await fetchPlatformState()
    const courseMap = new Map<string, Course>((state?.courses || []).map((c) => [c.id, c]))

    const stateEnrollments = (state?.enrollments || []).filter(
      (e) => e.user_id === userId && (e.status === 'active' || e.status === 'completed')
    )

    let dbEnrollments: EnrollmentWithCourse[] = []
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data: enrollmentsData, error: enrollError } = await client
          .from('enrollments')
          .select('*, course:courses(*)')
          .eq('user_id', userId)
          .in('status', ['active', 'completed'])
          .order('enrolled_at', { ascending: false })

        if (!enrollError && enrollmentsData) {
          dbEnrollments = enrollmentsData.map((item: any) => {
            const dbCourse = item.course as Course | undefined
            const stateCourse = courseMap.get(item.course_id)
            return {
              ...item,
              course: stateCourse ? { ...dbCourse, ...stateCourse } : dbCourse,
            }
          })
        }
      } catch {
        // Fallback to stateEnrollments
      }
    }

    const mergedMap = new Map<string, EnrollmentWithCourse>()
    for (const e of dbEnrollments) {
      mergedMap.set(e.course_id, e)
    }
    for (const e of stateEnrollments) {
      const existing = mergedMap.get(e.course_id)
      const course = courseMap.get(e.course_id) || existing?.course
      mergedMap.set(e.course_id, {
        ...(existing || {}),
        ...e,
        course,
      })
    }

    const result = Array.from(mergedMap.values()).filter((e) => Boolean(e.course))
    return { data: result, error: null, isDemo: false }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener matrículas'
    return { data: [], error: new Error(msg) }
  }
}

/**
 * Verificar si un usuario está matriculado activamente en un curso
 */
export async function checkEnrollment(
  userId: string,
  courseId: string
): Promise<{ isEnrolled: boolean; enrollment: Enrollment | null; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    const stateMatch = (state?.enrollments || []).find(
      (e) =>
        e.user_id === userId &&
        e.course_id === courseId &&
        (e.status === 'active' || e.status === 'completed')
    )

    if (stateMatch) {
      return {
        isEnrolled: true,
        enrollment: stateMatch,
        error: null,
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data, error } = await client
          .from('enrollments')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .in('status', ['active', 'completed'])
          .maybeSingle()

        if (!error && data) {
          return {
            isEnrolled: true,
            enrollment: data as Enrollment,
            error: null,
          }
        }
      } catch {
        // Fallback
      }
    }

    return {
      isEnrolled: false,
      enrollment: null,
      error: null,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al verificar matrícula'
    return { isEnrolled: false, enrollment: null, error: new Error(msg) }
  }
}

/**
 * Matricular usuario en un curso (ej. cursos gratuitos o asignación docente/admin)
 */
export async function enrollInCourse(
  userId: string,
  courseId: string
): Promise<{ data: Enrollment | null; error: Error | null }> {
  try {
    let dbEnroll: Enrollment | null = null

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data: existing } = await client
          .from('enrollments')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle()

        if (existing) {
          if (existing.status === 'active') {
            dbEnroll = existing as Enrollment
          } else {
            const { data: updated } = await client
              .from('enrollments')
              .update({ status: 'active', enrolled_at: new Date().toISOString() })
              .eq('id', existing.id)
              .select()
              .single()
            if (updated) dbEnroll = updated as Enrollment
          }
        } else {
          const { data } = await client
            .from('enrollments')
            .insert({
              user_id: userId,
              course_id: courseId,
              status: 'active',
            })
            .select()
            .single()
          if (data) dbEnroll = data as Enrollment
        }
      } catch {
        // Continue to platform-state
      }
    }

    const finalEnrollment: Enrollment = {
      id: dbEnroll?.id || `enroll-${Date.now()}`,
      user_id: userId,
      course_id: courseId,
      enrolled_at: dbEnroll?.enrolled_at || new Date().toISOString(),
      status: 'active',
    }

    await mutatePlatformState('upsert_enrollment', finalEnrollment)
    return { data: finalEnrollment, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al matricular en el curso'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Obtener todas las matrículas con datos de estudiante y curso para el Panel Docente / Admin
 */
export async function getAllEnrollmentsForTeacher(
  courseId?: string
): Promise<{ data: EnrollmentWithStudentAndCourse[]; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    const courses = state?.courses || []
    const users = state?.users || []
    const courseMap = new Map(courses.map((c) => [c.id, c]))
    const userMap = new Map(users.map((u) => [u.id, u]))

    let enrollments = state?.enrollments || []
    if (courseId) {
      enrollments = enrollments.filter((e) => e.course_id === courseId)
    }

    const enriched: EnrollmentWithStudentAndCourse[] = enrollments.map((e) => {
      const u = userMap.get(e.user_id)
      const c = courseMap.get(e.course_id)
      return {
        ...e,
        course: c,
        student_name: u?.full_name || 'Estudiante Matriculado',
        student_email: u?.email || 'estudiante@maestrotech.co',
      }
    })

    return { data: enriched, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener matrículas del curso'
    return { data: [], error: new Error(msg) }
  }
}
