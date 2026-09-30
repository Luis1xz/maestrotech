import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { LessonProgress } from '@/types/database'

export interface CourseProgressSummary {
  courseId: string
  totalLessons: number
  completedLessons: number
  percentComplete: number
  lastLessonId?: string
  lastPositionSeconds?: number
}

export interface UserGlobalProgress {
  enrolledCoursesCount: number
  completedCoursesCount: number
  completedLessonsCount: number
  totalStudyHours: number
  averageScore?: number
}

/**
 * Actualizar o crear registro de progreso de una lección (Upsert)
 */
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  data: {
    watched_seconds?: number
    last_position_seconds?: number
    completed?: boolean
  }
): Promise<{ data: LessonProgress | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return {
      data: {
        id: `prog-${Date.now()}`,
        user_id: userId,
        lesson_id: lessonId,
        completed: data.completed ?? false,
        watched_seconds: data.watched_seconds ?? 0,
        last_position_seconds: data.last_position_seconds ?? 0,
        updated_at: new Date().toISOString(),
      },
      error: null,
    }
  }

  try {
    const client = getSupabase()

    // Comprobar si ya existe
    const { data: existing } = await client
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle()

    const now = new Date().toISOString()

    if (existing) {
      const updatePayload: Partial<LessonProgress> = {
        updated_at: now,
      }
      if (data.watched_seconds !== undefined) {
        updatePayload.watched_seconds = Math.max(
          existing.watched_seconds || 0,
          data.watched_seconds
        )
      }
      if (data.last_position_seconds !== undefined) {
        updatePayload.last_position_seconds = data.last_position_seconds
      }
      if (data.completed !== undefined) {
        updatePayload.completed = data.completed
      }

      const { data: updated, error } = await client
        .from('lesson_progress')
        .update(updatePayload)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return { data: updated as LessonProgress, error: null }
    } else {
      const { data: inserted, error } = await client
        .from('lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          completed: data.completed ?? false,
          watched_seconds: data.watched_seconds ?? 0,
          last_position_seconds: data.last_position_seconds ?? 0,
          updated_at: now,
        })
        .select()
        .single()

      if (error) throw error
      return { data: inserted as LessonProgress, error: null }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al guardar progreso'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Marcar una clase como completada
 */
export async function markLessonCompleted(
  userId: string,
  lessonId: string
): Promise<{ data: LessonProgress | null; error: Error | null }> {
  return updateLessonProgress(userId, lessonId, { completed: true })
}

/**
 * Calcular el progreso general de un estudiante para el Dashboard
 */
export async function getUserGlobalProgress(
  userId: string
): Promise<{ data: UserGlobalProgress | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return {
      data: {
        enrolledCoursesCount: 3,
        completedCoursesCount: 1,
        completedLessonsCount: 14,
        totalStudyHours: 12.5,
        averageScore: 84.2,
      },
      error: null,
    }
  }

  try {
    const client = getSupabase()

    // 1. Obtener matrículas
    const { data: enrollments, error: enrollErr } = await client
      .from('enrollments')
      .select('id, status, course_id')
      .eq('user_id', userId)

    if (enrollErr) throw enrollErr

    const enrolledCoursesCount = enrollments?.length || 0
    const completedCoursesCount =
      enrollments?.filter(e => e.status === 'completed').length || 0

    // 2. Obtener lecciones completadas y tiempo visto
    const { data: progressList, error: progErr } = await client
      .from('lesson_progress')
      .select('completed, watched_seconds')
      .eq('user_id', userId)

    if (progErr) throw progErr

    const completedLessonsCount =
      progressList?.filter(p => p.completed).length || 0

    const totalSeconds =
      progressList?.reduce((acc, curr) => acc + (curr.watched_seconds || 0), 0) || 0
    const totalStudyHours = Math.round((totalSeconds / 3600) * 10) / 10

    return {
      data: {
        enrolledCoursesCount,
        completedCoursesCount,
        completedLessonsCount,
        totalStudyHours,
      },
      error: null,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener progreso general'
    return { data: null, error: new Error(msg) }
  }
}
