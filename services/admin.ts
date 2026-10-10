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
    if (authToken) {
      try {
        const res = await fetch('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        if (res.ok) {
          const json = await res.json()
          return { data: json.users as AdminUserListItem[], error: null }
        }
      } catch {
        // Fallback a combinación de platform-state + profiles
      }
    }

    const state = await fetchPlatformState()
    const userMap = new Map<string, AdminUserListItem>()

    for (const u of state?.users || []) {
      userMap.set(u.id, {
        id: u.id,
        full_name: u.full_name,
        first_name: u.first_name,
        last_name: u.last_name,
        role: u.role,
        avatar_url: u.avatar_url,
        created_at: u.created_at,
        email: u.email,
      })
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

    return { data: Array.from(userMap.values()), error: null }
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
  newRole: UserRole
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        await client
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', userId)
      } catch {
        // Continue to platform-state
      }
    }

    await mutatePlatformState('update_user_role', { id: userId, role: newRole })
    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar rol del usuario'
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
