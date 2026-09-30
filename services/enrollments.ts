import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Enrollment, Course } from '@/types/database'
import { DEMO_COURSES } from './demo-data'

export interface EnrollmentWithCourse extends Enrollment {
  course?: Course
}

/**
 * Obtener las matrículas de un estudiante con los datos del curso
 */
export async function getUserEnrollments(
  userId: string
): Promise<{ data: EnrollmentWithCourse[] | null; error: Error | null; isDemo?: boolean }> {
  if (!isSupabaseConfigured()) {
    const demoEnrollments: EnrollmentWithCourse[] = [
      {
        id: 'demo-enroll-1',
        user_id: userId,
        course_id: DEMO_COURSES[0].id,
        enrolled_at: '2025-01-10T00:00:00Z',
        status: 'active',
        course: DEMO_COURSES[0],
      },
    ]
    return { data: demoEnrollments, error: null, isDemo: true }
  }

  try {
    const client = getSupabase()

    const { data: enrollmentsData, error: enrollError } = await client
      .from('enrollments')
      .select('*, course:courses(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false })

    if (enrollError) throw enrollError

    const result = (enrollmentsData || []).map((item: any) => ({
      ...item,
      course: item.course as Course,
    }))

    return { data: result, error: null, isDemo: false }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener matrículas'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Verificar si un usuario está matriculado activamente en un curso
 */
export async function checkEnrollment(
  userId: string,
  courseId: string
): Promise<{ isEnrolled: boolean; enrollment: Enrollment | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    // En modo demo, consideramos matriculado en el curso 1
    const isFirstCourse = courseId === DEMO_COURSES[0].id
    return {
      isEnrolled: isFirstCourse,
      enrollment: isFirstCourse
        ? {
            id: 'demo-enroll-1',
            user_id: userId,
            course_id: courseId,
            enrolled_at: new Date().toISOString(),
            status: 'active',
          }
        : null,
      error: null,
    }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .maybeSingle()

    if (error) throw error

    return {
      isEnrolled: Boolean(data),
      enrollment: (data as Enrollment) || null,
      error: null,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al verificar matrícula'
    return { isEnrolled: false, enrollment: null, error: new Error(msg) }
  }
}

/**
 * Matricular usuario en un curso (ej. cursos gratuitos o tras pago validado)
 */
export async function enrollInCourse(
  userId: string,
  courseId: string
): Promise<{ data: Enrollment | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return {
      data: {
        id: `enroll-${Date.now()}`,
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        status: 'active',
      },
      error: null,
    }
  }

  try {
    const client = getSupabase()

    // Comprobar si ya existe
    const { data: existing } = await client
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle()

    if (existing) {
      if (existing.status === 'active') {
        return { data: existing as Enrollment, error: null }
      }
      // Reactivar si estaba cancelado
      const { data: updated, error: updateErr } = await client
        .from('enrollments')
        .update({ status: 'active', enrolled_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateErr) throw updateErr
      return { data: updated as Enrollment, error: null }
    }

    const { data, error } = await client
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as Enrollment, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al matricular en el curso'
    return { data: null, error: new Error(msg) }
  }
}
