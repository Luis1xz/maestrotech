import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Lesson } from '@/types/database'
import { fetchPlatformState, mutatePlatformState } from '@/lib/platform-state-client'

export async function getLessonById(
  lessonId: string
): Promise<{ data: Lesson | null; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    const storeLesson = (state.lessons || []).find((l) => l.id === lessonId) || null

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data } = await client
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .maybeSingle()
        if (data) {
          return { data: storeLesson ? { ...(data as Lesson), ...storeLesson } : (data as Lesson), error: null }
        }
      } catch {
        // ignore
      }
    }

    return { data: storeLesson, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener clase'
    return { data: null, error: new Error(msg) }
  }
}

export async function getLessonsByModule(
  moduleId: string
): Promise<{ data: Lesson[] | null; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    let dbLessons: Lesson[] = []

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data } = await client
          .from('lessons')
          .select('*')
          .eq('module_id', moduleId)
          .order('order_index', { ascending: true })
        if (data) dbLessons = data as Lesson[]
      } catch {
        // ignore
      }
    }

    const storeLessons = (state.lessons || []).filter((l) => l.module_id === moduleId)
    const map = new Map<string, Lesson>()
    for (const sl of storeLessons) map.set(sl.id, { ...sl })
    for (const dl of dbLessons) {
      const existing = map.get(dl.id)
      map.set(dl.id, existing ? { ...dl, ...existing } : dl)
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0)
    )
    return { data: merged, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener lecciones'
    return { data: null, error: new Error(msg) }
  }
}

export async function getLessonsByCourse(
  courseId: string
): Promise<{ data: Lesson[] | null; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    const stateModuleIds = new Set(
      (state.modules || []).filter((m) => m.course_id === courseId).map((m) => m.id)
    )
    const storeLessons = (state.lessons || []).filter(
      (l) => l.course_id === courseId || stateModuleIds.has(l.module_id)
    )

    let dbLessons: Lesson[] = []
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data: mods } = await client
          .from('modules')
          .select('id')
          .eq('course_id', courseId)
        const modIds = Array.from(
          new Set([
            ...Array.from(stateModuleIds),
            ...(mods || []).map((m: { id: string }) => m.id),
          ])
        )
        if (modIds.length > 0) {
          const { data } = await client
            .from('lessons')
            .select('*')
            .in('module_id', modIds)
            .order('order_index', { ascending: true })
          if (data) dbLessons = data as Lesson[]
        }
      } catch {
        // ignore
      }
    }

    const map = new Map<string, Lesson>()
    for (const sl of storeLessons) map.set(sl.id, { ...sl })
    for (const dl of dbLessons) {
      const existing = map.get(dl.id)
      map.set(dl.id, existing ? { ...dl, ...existing } : dl)
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0)
    )
    return { data: merged, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener lecciones del curso'
    return { data: [], error: new Error(msg) }
  }
}

export async function createLesson(
  lessonData: Omit<Lesson, 'id' | 'created_at'>
): Promise<{ data: Lesson | null; error: Error | null }> {
  try {
    const now = new Date().toISOString()
    let createdId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `less-${Date.now()}`

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        // Enviar solo columnas válidas de la tabla lessons en Supabase
        const payload = {
          module_id: lessonData.module_id,
          title: lessonData.title,
          description: lessonData.description ?? null,
          order_index: lessonData.order_index ?? 1,
          video_provider: lessonData.video_provider || 'custom',
          video_id: lessonData.video_id ?? null,
          duration_seconds: lessonData.duration_seconds ?? 900,
          is_preview: Boolean(lessonData.is_preview),
          published: lessonData.published !== false,
        }
        const { data, error } = await client.from('lessons').insert(payload).select().single()
        if (!error && data) {
          createdId = data.id
        }
      } catch {
        // fallback to store
      }
    }

    const fullLesson: Lesson = {
      id: createdId,
      module_id: lessonData.module_id,
      title: lessonData.title,
      description: lessonData.description ?? null,
      order_index: lessonData.order_index ?? 1,
      video_provider: lessonData.video_provider || 'custom',
      video_id: lessonData.video_id ?? null,
      duration_seconds: lessonData.duration_seconds ?? 900,
      is_preview: Boolean(lessonData.is_preview),
      published: lessonData.published !== false,
      created_at: now,
    }

    await mutatePlatformState('upsert_lesson', fullLesson)
    return { data: fullLesson, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al crear lección'
    return { data: null, error: new Error(msg) }
  }
}

export async function updateLesson(
  lessonId: string,
  updates: Partial<Lesson>
): Promise<{ data: Lesson | null; error: Error | null }> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const allowed = [
          'title',
          'description',
          'order_index',
          'video_provider',
          'video_id',
          'duration_seconds',
          'is_preview',
          'published',
        ] as const
        const payload: Record<string, unknown> = {}
        for (const k of allowed) {
          if (k in updates && updates[k] !== undefined) {
            payload[k] = updates[k]
          }
        }
        await client.from('lessons').update(payload).eq('id', lessonId)
      } catch {
        // ignore
      }
    }

    const state = await fetchPlatformState()
    const existing = state.lessons.find((l) => l.id === lessonId)
    const updated: Lesson = {
      ...(existing || {
        id: lessonId,
        module_id: updates.module_id || '',
        title: updates.title || 'Clase',
        description: null,
        order_index: 1,
        video_provider: 'custom',
        video_id: null,
        duration_seconds: 900,
        is_preview: true,
        published: true,
        created_at: new Date().toISOString(),
      }),
      ...updates,
    }

    await mutatePlatformState('upsert_lesson', updated)
    return { data: updated, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar lección'
    return { data: null, error: new Error(msg) }
  }
}

export async function deleteLesson(
  lessonId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        await client.from('lessons').delete().eq('id', lessonId)
      } catch {
        // ignore
      }
    }
    await mutatePlatformState('delete_lesson', { id: lessonId })
    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar lección'
    return { success: false, error: new Error(msg) }
  }
}
