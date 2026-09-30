import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Lesson } from '@/types/database'

export async function getLessonById(
  lessonId: string
): Promise<{ data: Lesson | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .maybeSingle()

    if (error) throw error
    return { data: (data as Lesson) || null, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener clase'
    return { data: null, error: new Error(msg) }
  }
}

export async function getLessonsByModule(
  moduleId: string
): Promise<{ data: Lesson[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .eq('published', true)
      .order('order_index', { ascending: true })

    if (error) throw error
    return { data: (data as Lesson[]) || [], error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener lecciones'
    return { data: null, error: new Error(msg) }
  }
}

// Operaciones admin
export async function createLesson(
  lessonData: Omit<Lesson, 'id' | 'created_at'>
): Promise<{ data: Lesson | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase no está configurado') }
  }
  try {
    const client = getSupabase()
    const { data, error } = await client.from('lessons').insert(lessonData).select().single()
    if (error) throw error
    return { data: data as Lesson, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al crear lección'
    return { data: null, error: new Error(msg) }
  }
}
