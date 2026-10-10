import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Profile, UserRole } from '@/types/database'
import { DEMO_PROFILE } from './demo-data'
import { fetchPlatformState, mutatePlatformState } from '@/lib/platform-state-client'

const SUPERADMIN_EMAILS = new Set([
  'luisalfonso1818@gmail.com',
  'luisalfonso@maestrotech.edu.co',
  'patriciajhon@maestrotech.edu.co',
  'admin@maestrotech.co',
])

export async function getProfile(
  userId: string,
  emailHint?: string
): Promise<{ data: Profile | null; error: Error | null; isDemo?: boolean }> {
  try {
    const state = await fetchPlatformState()
    const cleanEmail = (emailHint || '').trim().toLowerCase()
    const stateUser = (state?.users || []).find(
      (u) => u.id === userId || (cleanEmail && (u.email || '').toLowerCase() === cleanEmail)
    )

    let dbProfile: Profile | null = null
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (!error && data) {
          dbProfile = data as Profile
        }
      } catch {
        // Fallback to stateUser
      }
    }

    if (stateUser || dbProfile) {
      let resolvedRole: UserRole = stateUser?.role || dbProfile?.role || 'student'
      if (cleanEmail && SUPERADMIN_EMAILS.has(cleanEmail)) {
        resolvedRole = 'admin'
      }

      const merged: Profile = {
        id: userId,
        full_name: stateUser?.full_name || dbProfile?.full_name || 'Docente MaestroTech',
        first_name: stateUser?.first_name || dbProfile?.first_name || null,
        last_name: stateUser?.last_name || dbProfile?.last_name || null,
        role: resolvedRole,
        avatar_url: stateUser?.avatar_url || dbProfile?.avatar_url || null,
        created_at: dbProfile?.created_at || stateUser?.created_at || new Date().toISOString(),
      }
      return { data: merged, error: null, isDemo: false }
    }

    if (!isSupabaseConfigured()) {
      return { data: { ...DEMO_PROFILE, id: userId }, error: null, isDemo: true }
    }

    return { data: null, error: null, isDemo: false }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener perfil'
    return { data: null, error: new Error(msg) }
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<{ data: Profile | null; error: Error | null }> {
  try {
    let dbUpdated: Profile | null = null
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data } = await client
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select()
          .single()
        if (data) dbUpdated = data as Profile
      } catch {
        // Continue to platform-state
      }
    }

    const state = await fetchPlatformState()
    const existing = (state?.users || []).find((u) => u.id === userId)

    const updatedUser = {
      id: userId,
      email: existing?.email || 'usuario@maestrotech.co',
      full_name: updates.full_name || existing?.full_name || dbUpdated?.full_name || 'Usuario',
      first_name: updates.first_name ?? existing?.first_name ?? null,
      last_name: updates.last_name ?? existing?.last_name ?? null,
      role: (updates.role || existing?.role || dbUpdated?.role || 'student') as UserRole,
      avatar_url: updates.avatar_url ?? existing?.avatar_url ?? null,
      created_at: existing?.created_at || new Date().toISOString(),
    }

    await mutatePlatformState('upsert_user', updatedUser)

    return {
      data: {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        role: updatedUser.role,
        avatar_url: updatedUser.avatar_url,
        created_at: updatedUser.created_at,
      },
      error: null,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar perfil'
    return { data: null, error: new Error(msg) }
  }
}

export async function ensureProfile(
  userId: string,
  initialData: {
    email?: string
    full_name?: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    role?: 'student' | 'instructor' | 'admin'
  }
): Promise<{ data: Profile | null; error: Error | null }> {
  try {
    const cleanEmail = (initialData.email || '').trim().toLowerCase()
    const state = await fetchPlatformState()
    const stateUser = (state?.users || []).find(
      (u) => u.id === userId || (cleanEmail && (u.email || '').toLowerCase() === cleanEmail)
    )

    let resolvedRole: UserRole = stateUser?.role || initialData.role || 'student'
    if (cleanEmail && SUPERADMIN_EMAILS.has(cleanEmail)) {
      resolvedRole = 'admin'
    }

    const fullName =
      stateUser?.full_name ||
      initialData.full_name ||
      `${initialData.first_name || ''} ${initialData.last_name || ''}`.trim() ||
      'Docente MaestroTech'

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data: existing } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (existing) {
          if (existing.role === 'admin' || existing.role === 'instructor') {
            resolvedRole = existing.role
          }
          if (cleanEmail && SUPERADMIN_EMAILS.has(cleanEmail)) {
            resolvedRole = 'admin'
          }
        } else {
          await client.from('profiles').insert({
            id: userId,
            full_name: fullName,
            first_name: initialData.first_name || null,
            last_name: initialData.last_name || null,
            avatar_url: initialData.avatar_url || null,
            role: resolvedRole,
          })
        }
      } catch {
        // Fallback to platform-state
      }
    }

    const userRecord = {
      id: userId,
      email: cleanEmail || stateUser?.email || 'usuario@maestrotech.co',
      full_name: fullName,
      first_name: initialData.first_name || stateUser?.first_name || null,
      last_name: initialData.last_name || stateUser?.last_name || null,
      role: resolvedRole,
      avatar_url: initialData.avatar_url || stateUser?.avatar_url || null,
      created_at: stateUser?.created_at || new Date().toISOString(),
    }

    await mutatePlatformState('upsert_user', userRecord)

    return {
      data: {
        id: userRecord.id,
        full_name: userRecord.full_name,
        first_name: userRecord.first_name,
        last_name: userRecord.last_name,
        role: userRecord.role,
        avatar_url: userRecord.avatar_url,
        created_at: userRecord.created_at,
      },
      error: null,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al asegurar perfil'
    return { data: null, error: new Error(msg) }
  }
}
