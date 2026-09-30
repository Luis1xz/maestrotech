import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Profile } from '@/types/database'

/**
 * Cliente exclusivo de servidor con privilegios administrativos (service_role).
 * ADVERTENCIA DE SEGURIDAD:
 * Este archivo NUNCA debe ser importado en componentes del cliente ("use client").
 * La variable SUPABASE_SERVICE_ROLE_KEY jamás debe llevar el prefijo NEXT_PUBLIC_.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return null
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        apikey: serviceKey,
      },
    },
  })
}

/**
 * Verifica de forma estricta en el servidor que la petición provenga de un usuario
 * autenticado cuyo rol sea 'admin' (Superusuario).
 */
export async function verifyAdminRequest(authHeader: string | null): Promise<{
  authorized: boolean
  userId?: string
  profile?: Profile
  error?: string
}> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Token de autorización ausente o inválido' }
  }

  const token = authHeader.replace('Bearer ', '').trim()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !anonKey) {
    return { authorized: false, error: 'Supabase no está configurado en el servidor' }
  }

  // 1. Validar el token JWT con la API de Supabase Auth
  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        apikey: anonKey,
      },
    },
  })

  const { data: { user }, error: authErr } = await authClient.auth.getUser(token)

  if (authErr || !user) {
    return { authorized: false, error: 'Sesión no válida o expirada' }
  }

  // 2. Verificar el rol en la base de datos (profiles.role = 'admin')
  // Usamos el cliente admin si está disponible, o el cliente auth con el token del usuario
  const adminClient = getSupabaseAdminClient()
  const clientToQuery = adminClient || authClient

  const { data: profile, error: profErr } = await clientToQuery
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profErr || !profile) {
    return { authorized: false, error: 'No se encontró el perfil del usuario' }
  }

  if (profile.role !== 'admin') {
    return {
      authorized: false,
      error: 'Acceso denegado: se requieren permisos de Superusuario (admin)',
    }
  }

  return {
    authorized: true,
    userId: user.id,
    profile: profile as Profile,
  }
}
