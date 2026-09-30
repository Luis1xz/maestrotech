import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Module } from '@/types/database'

export async function getModulesByCourse(
  courseId: string
): Promise<{ data: Module[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return { data: (data as Module[]) || [], error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener módulos'
    return { data: null, error: new Error(msg) }
  }
}

// Operaciones admin
export async function createModule(
  moduleData: Omit<Module, 'id' | 'created_at'>
): Promise<{ data: Module | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase no está configurado') }
  }
  try {
    const client = getSupabase()
    const { data, error } = await client.from('modules').insert(moduleData).select().single()
    if (error) throw error
    return { data: data as Module, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al crear módulo'
    return { data: null, error: new Error(msg) }
  }
}
