import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Profile } from '@/types/database'
import { readStore } from '@/lib/platform-store-server'

const SUPERADMIN_EMAILS = new Set([
  'luisalfonso1818@gmail.com',
  'luisalfonso@maestrotech.edu.co',
  'patriciajhon@maestrotech.edu.co',
  'admin@maestrotech.co',
])

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
 * Verifica en el servidor que la petición provenga de un usuario
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
  const store = readStore()

  // 0. Soportar sesión rápida de plataforma (custom-session:<userId>)
  if (token.startsWith('custom-session:')) {
    const customUserId = token.replace('custom-session:', '').trim()
    const storeUser = store.users.find((u) => u.id === customUserId)
    if (
      storeUser &&
      (storeUser.role === 'admin' || SUPERADMIN_EMAILS.has((storeUser.email || '').toLowerCase()))
    ) {
      return {
        authorized: true,
        userId: storeUser.id,
        profile: {
          id: storeUser.id,
          full_name: storeUser.full_name,
          first_name: storeUser.first_name,
          last_name: storeUser.last_name,
          role: 'admin',
          avatar_url: storeUser.avatar_url,
          created_at: storeUser.created_at,
        },
      }
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

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

  const {
    data: { user },
    error: authErr,
  } = await authClient.auth.getUser(token)

  if (authErr || !user) {
    return { authorized: false, error: 'Sesión no válida o expirada' }
  }

  // 2. Verificar si es superadmin por email o en platform-store
  const emailLower = (user.email || '').toLowerCase()
  const storeUser = store.users.find(
    (u) => u.id === user.id || (u.email || '').toLowerCase() === emailLower
  )

  if (SUPERADMIN_EMAILS.has(emailLower) || storeUser?.role === 'admin') {
    return {
      authorized: true,
      userId: user.id,
      profile: {
        id: user.id,
        full_name:
          storeUser?.full_name ||
          (user.user_metadata?.full_name as string) ||
          emailLower.split('@')[0],
        first_name: storeUser?.first_name || (user.user_metadata?.first_name as string) || null,
        last_name: storeUser?.last_name || (user.user_metadata?.last_name as string) || null,
        role: 'admin',
        avatar_url: storeUser?.avatar_url || null,
        created_at: user.created_at || new Date().toISOString(),
      },
    }
  }

  // 3. Verificar el rol en la base de datos (profiles.role = 'admin')
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
