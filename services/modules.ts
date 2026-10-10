import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Module } from '@/types/database'
import { fetchPlatformState, mutatePlatformState } from '@/lib/platform-state-client'

export async function getModulesByCourse(
  courseId: string
): Promise<{ data: Module[] | null; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    let dbModules: Module[] = []

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data } = await client
          .from('modules')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true })
        if (data) dbModules = data as Module[]
      } catch {
        // ignore
      }
    }

    const storeModules = (state.modules || []).filter((m) => m.course_id === courseId)
    const map = new Map<string, Module>()
    for (const sm of storeModules) map.set(sm.id, { ...sm })
    for (const dm of dbModules) {
      const existing = map.get(dm.id)
      map.set(dm.id, existing ? { ...dm, ...existing } : dm)
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0)
    )
    return { data: merged, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener módulos'
    return { data: null, error: new Error(msg) }
  }
}

export async function createModule(
  moduleData: Omit<Module, 'id' | 'created_at'>
): Promise<{ data: Module | null; error: Error | null }> {
  try {
    const now = new Date().toISOString()
    let createdId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `mod-${Date.now()}`

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const payload = {
          course_id: moduleData.course_id,
          title: moduleData.title,
          description: moduleData.description ?? null,
          order_index: moduleData.order_index ?? 1,
        }
        const { data, error } = await client.from('modules').insert(payload).select().single()
        if (!error && data) {
          createdId = data.id
        }
      } catch {
        // fallback to store
      }
    }

    const fullModule: Module = {
      id: createdId,
      course_id: moduleData.course_id,
      title: moduleData.title,
      description: moduleData.description ?? null,
      order_index: moduleData.order_index ?? 1,
      created_at: now,
    }

    await mutatePlatformState('upsert_module', fullModule)
    return { data: fullModule, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al crear módulo'
    return { data: null, error: new Error(msg) }
  }
}

export async function deleteModule(
  moduleId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        await client.from('modules').delete().eq('id', moduleId)
      } catch {
        // ignore
      }
    }
    await mutatePlatformState('delete_module', { id: moduleId })
    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar módulo'
    return { success: false, error: new Error(msg) }
  }
}
