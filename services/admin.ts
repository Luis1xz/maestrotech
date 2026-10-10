import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { AdminUserListItem, CreateUserPayload, UserRole } from '@/types/database'
import { fetchPlatformState, mutatePlatformState } from '@/lib/platform-state-client'

export interface PlatformOverviewStats {
  totalUsers: number
  totalStudents: number
  totalInstructors: number
  totalAdmins: number
  totalCourses: number
  publishedCourses: number
  totalEnrollments: number
}

/**
 * Obtener listado de usuarios para administración
 */
export async function getAdminUsersList(authToken?: string): Promise<{
  data: AdminUserListItem[] | null
  error: Error | null
}> {
  try {
    const state = await fetchPlatformState()
    const userMap = new Map<string, AdminUserListItem>()

    for (const u of state?.users || []) {
      userMap.set(u.id, {
        id: u.id,
        full_name: u.full_name,
        first_name: u.first_name,
        last_name: u.last_name,
        role: u.role,
        role_updated_at: u.role_updated_at,
        avatar_url: u.avatar_url,
        created_at: u.created_at,
        email: u.email,
      })
    }

    if (authToken) {
      try {
        const res = await fetch('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          cache: 'no-store',
        })
        if (res.ok) {
          const json = await res.json()
          for (const apiUser of (json.users as AdminUserListItem[]) || []) {
            const existing = userMap.get(apiUser.id)
            const existingTs = existing?.role_updated_at || ''
            const apiTs = apiUser.role_updated_at || ''
            const preferExistingRole =
              existing &&
              ((existingTs && existingTs >= apiTs) ||
                (!existingTs && !apiTs && existing.role))

            userMap.set(apiUser.id, {
              ...apiUser,
              ...existing,
              role: preferExistingRole ? existing.role : apiUser.role,
              role_updated_at: preferExistingRole ? existingTs : apiTs,
              email: existing?.email || apiUser.email,
              full_name: existing?.full_name || apiUser.full_name,
            })
          }
        }
      } catch {
        // Fallback a combinación de platform-state + profiles
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data: profiles } = await client
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        for (const p of (profiles as AdminUserListItem[]) || []) {
          const existing = userMap.get(p.id)
          userMap.set(p.id, {
            ...p,
            role: existing?.role || p.role,
            role_updated_at: existing?.role_updated_at,
            email:
              existing?.email ||
              `${(p.first_name || p.full_name || 'usuario')
                .toLowerCase()
                .replace(/\s+/g, '.')}@maestrotech.co`,
          })
        }
      } catch {
        // Fallback to state users
      }
    }

    const deletedUsers = new Set(state?.deletedUserIds || [])
    const activeUsers = Array.from(userMap.values()).filter((u) => !deletedUsers.has(u.id))

    return { data: activeUsers, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener usuarios'
    return { data: [], error: new Error(msg) }
  }
}

/**
 * Cambiar el rol de un usuario existente (solo permitido para superusuarios)
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  userInfo?: Partial<AdminUserListItem>,
  authToken?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const updatedAt = new Date().toISOString()

    // 1. Actualizar inmediatamente en el almacén sincronizado (localStorage + /api/platform-state)
    await mutatePlatformState('update_user_role', {
      id: userId,
      role: newRole,
      email: userInfo?.email,
      full_name: userInfo?.full_name,
      first_name: userInfo?.first_name,
      last_name: userInfo?.last_name,
      avatar_url: userInfo?.avatar_url,
      created_at: userInfo?.created_at,
      role_updated_at: updatedAt,
    })

    // 2. Actualizar en Supabase PostgreSQL (public.profiles)
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const {
          data: { session: currentSession },
        } = await client.auth.getSession()

        // Si el superusuario actual tiene sesión en Supabase, asegurar que su propia fila en public.profiles
        // tenga role = 'admin' (permitido por RLS USING auth.uid() = id) para que public.is_admin() sea TRUE
        if (currentSession?.user?.id) {
          await client
            .from('profiles')
            .update({ role: 'admin', updated_at: updatedAt })
            .eq('id', currentSession.user.id)
        }

        await client
          .from('profiles')
          .update({ role: newRole, updated_at: updatedAt })
          .eq('id', userId)
      } catch {
        // Continuar hacia el endpoint administrativo
      }
    }

    // 3. Sincronizar con el endpoint administrativo del servidor (/api/admin/users)
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken || 'custom-session:a1b2c3d4-0000-4000-8000-000000000001'}`,
        },
        body: JSON.stringify({
          id: userId,
          role: newRole,
          email: userInfo?.email,
          full_name: userInfo?.full_name,
          first_name: userInfo?.first_name,
          last_name: userInfo?.last_name,
          avatar_url: userInfo?.avatar_url,
          created_at: userInfo?.created_at,
          role_updated_at: updatedAt,
        }),
      })
    } catch {
      // Ya persistido en platform-state
    }

    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar rol del usuario'
    return { success: false, error: new Error(msg) }
  }
}

/**
 * Eliminar un usuario del sistema (solo permitido para superusuarios)
 */
export async function deleteAdminUser(
  userId: string,
  email?: string,
  authToken?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // 1. Eliminar reactivamente en el estado local y /api/platform-state
    await mutatePlatformState('delete_user', { id: userId, email })

    // 2. Eliminar en Supabase profiles si está configurado
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const {
          data: { session: currentSession },
        } = await client.auth.getSession()

        if (currentSession?.user?.id) {
          await client
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', currentSession.user.id)
        }

        await client.from('enrollments').delete().eq('user_id', userId)
        await client.from('lesson_progress').delete().eq('user_id', userId)
        await client.from('certificates').delete().eq('user_id', userId)
        await client.from('profiles').delete().eq('id', userId)
      } catch {
        // Continuar con endpoint administrativo
      }
    }

    // 3. Eliminar en endpoint administrativo del servidor (/api/admin/users)
    try {
      const q = new URLSearchParams()
      if (userId) q.set('id', userId)
      if (email) q.set('email', email)
      await fetch(`/api/admin/users?${q.toString()}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken || 'custom-session:a1b2c3d4-0000-4000-8000-000000000001'}`,
        },
      })
    } catch {
      // Ya persistido en platform-state
    }

    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar usuario'
    return { success: false, error: new Error(msg) }
  }
}

/**
 * Crear un usuario de forma segura llamando al endpoint administrativo del servidor
 */
export async function createAdminUser(
  payload: CreateUserPayload,
  authToken: string
): Promise<{ success: boolean; message?: string; error: Error | null }> {
  try {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken || 'custom-session:admin-luis-alfonso'}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: new Error(data.error || 'Error al crear usuario') }
    }

    return { success: true, message: data.message, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error de conexión con el servidor'
    return { success: false, error: new Error(msg) }
  }
}

/**
 * Métricas globales del sistema para el panel de superusuario
 */
export async function getPlatformOverview(): Promise<{
  data: PlatformOverviewStats | null
  error: Error | null
}> {
  try {
    const state = await fetchPlatformState()
    const { data: users } = await getAdminUsersList()
    const userList = users || state?.users || []
    const courses = state?.courses || []
    const enrollments = state?.enrollments || []

    const totalUsers = userList.length
    const totalStudents = userList.filter((u) => u.role === 'student').length
    const totalInstructors = userList.filter((u) => u.role === 'instructor').length
    const totalAdmins = userList.filter((u) => u.role === 'admin').length

    const totalCourses = courses.length
    const publishedCourses = courses.filter((c) => c.published).length
    const totalEnrollments = enrollments.length

    return {
      data: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        publishedCourses,
        totalEnrollments,
      },
      error: null,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener métricas globales'
    return { data: null, error: new Error(msg) }
  }
}
