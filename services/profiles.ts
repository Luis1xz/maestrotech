import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Profile } from '@/types/database'
import { DEMO_PROFILE } from './demo-data'

export async function getProfile(
  userId: string
): Promise<{ data: Profile | null; error: Error | null; isDemo?: boolean }> {
  if (!isSupabaseConfigured()) {
    return { data: { ...DEMO_PROFILE, id: userId }, error: null, isDemo: true }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error

    return { data: (data as Profile) || null, error: null, isDemo: false }
  } catch (err: unknown) {
    const msg = (err && typeof err === 'object' && 'message' in err)
      ? String((err as { message: unknown }).message)
      : err instanceof Error ? err.message : 'Error al obtener perfil'
    return { data: null, error: new Error(msg) }
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<{ data: Profile | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return {
      data: { ...DEMO_PROFILE, ...updates, id: userId },
      error: null,
    }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { data: data as Profile, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar perfil'
    return { data: null, error: new Error(msg) }
  }
}

export async function ensureProfile(
  userId: string,
  initialData: {
    full_name?: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    role?: 'student' | 'instructor' | 'admin'
  }
): Promise<{ data: Profile | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: { ...DEMO_PROFILE, ...initialData, id: userId }, error: null }
  }

  try {
    const client = getSupabase()

    // Comprobar si existe
    const { data: existing } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (existing) {
      // Si ya existe el perfil, JAMÁS modificar su rol (ej. admin o instructor se preservan)
      // Opcionalmente actualizar avatar si estaba vacío y Google proporciona uno
      if (!existing.avatar_url && initialData.avatar_url) {
        try {
          await client
            .from('profiles')
            .update({ avatar_url: initialData.avatar_url })
            .eq('id', userId)
          existing.avatar_url = initialData.avatar_url
        } catch {
          // No bloquear si la actualización de avatar falla
        }
      }
      return { data: existing as Profile, error: null }
    }

    const { data: created, error } = await client
      .from('profiles')
      .insert({
        id: userId,
        full_name: initialData.full_name || `${initialData.first_name || ''} ${initialData.last_name || ''}`.trim() || 'Docente',
        avatar_url: initialData.avatar_url || null,
        role: initialData.role || 'student',
      })
      .select()
      .single()

    if (error) throw error
    return { data: created as Profile, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al asegurar perfil'
    return { data: null, error: new Error(msg) }
  }
}
