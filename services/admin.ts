import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { AdminUserListItem, CreateUserPayload, UserRole } from '@/types/database'

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
  if (!isSupabaseConfigured()) {
    return {
      data: [
        {
          id: 'demo-admin-1',
          full_name: 'Luis Alfonso',
          first_name: 'Luis',
          last_name: 'Alfonso',
          role: 'admin',
          avatar_url: null,
          created_at: '2025-01-01T00:00:00Z',
          email: 'luisalfonso@maestrotech.edu.co',
        },
        {
          id: 'demo-admin-2',
          full_name: 'Patricia Jhon',
          first_name: 'Patricia',
          last_name: 'Jhon',
          role: 'admin',
          avatar_url: null,
          created_at: '2025-01-01T00:00:00Z',
          email: 'patriciajhon@maestrotech.edu.co',
        },
        {
          id: 'demo-docente-1',
          full_name: 'Elena Restrepo',
          first_name: 'Elena',
          last_name: 'Restrepo',
          role: 'instructor',
          avatar_url: null,
          created_at: '2025-01-10T00:00:00Z',
          email: 'elena.restrepo@maestrotech.edu.co',
        },
      ],
      error: null,
    }
  }

  // Si tenemos token de autenticación, intentar consultar endpoint de servidor para traer emails
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
      // Fallback a consulta directa de profiles con RLS si falla la API
    }
  }

  try {
    const client = getSupabase()
    const { data: profiles, error } = await client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: (profiles as AdminUserListItem[]) || [], error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener usuarios'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Cambiar el rol de un usuario existente (solo permitido para superusuarios)
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { success: true, error: null }
  }

  try {
    const client = getSupabase()
    const { error } = await client
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
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
        Authorization: `Bearer ${authToken}`,
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
  if (!isSupabaseConfigured()) {
    return {
      data: {
        totalUsers: 1420,
        totalStudents: 1380,
        totalInstructors: 38,
        totalAdmins: 2,
        totalCourses: 12,
        publishedCourses: 10,
        totalEnrollments: 2840,
      },
      error: null,
    }
  }

  try {
    const client = getSupabase()

    const [profilesRes, coursesRes, enrollmentsRes] = await Promise.all([
      client.from('profiles').select('role'),
      client.from('courses').select('published'),
      client.from('enrollments').select('id', { count: 'exact', head: true }),
    ])

    const profiles = profilesRes.data || []
    const courses = coursesRes.data || []

    const totalUsers = profiles.length
    const totalStudents = profiles.filter((p) => p.role === 'student').length
    const totalInstructors = profiles.filter((p) => p.role === 'instructor').length
    const totalAdmins = profiles.filter((p) => p.role === 'admin').length

    const totalCourses = courses.length
    const publishedCourses = courses.filter((c) => c.published).length
    const totalEnrollments = enrollmentsRes.count || 0

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
