import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Profile } from '@/types/database'
import { readStore, mutateStore } from '@/lib/platform-store-server'

/**
 * Correos de superusuarios del sistema con privilegios administrativos garantizados
 */
const KNOWN_SUPERUSER_EMAILS = [
  'luisalfonso1818@gmail.com',
  'patriciajhon@gmail.com',
]

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
 * 
 * Es altamente resiliente: si el perfil aún no ha sido insertado en `public.profiles`
 * pero la cuenta corresponde a un administrador confirmado (por email, metadata o store),
 * autogenera y sincroniza el perfil con rol 'admin' de inmediato.
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
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // 1. Manejo de sesiones de desarrollo o locales
  if (token.startsWith('custom-session:')) {
    const store = readStore()
    const customUser = store.users.find((u) => u.role === 'admin')
    if (customUser) {
      return {
        authorized: true,
        userId: customUser.id,
        profile: {
          id: customUser.id,
          full_name: customUser.full_name,
          first_name: customUser.first_name || null,
          last_name: customUser.last_name || null,
          avatar_url: customUser.avatar_url || null,
          role: 'admin',
          created_at: customUser.created_at,
        },
      }
    }
  }

  if (!url || !anonKey) {
    return { authorized: false, error: 'Supabase no está configurado en el servidor' }
  }

  // 2. Validar el token JWT con la API de Supabase Auth
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

  const userEmail = (user.email || '').trim().toLowerCase()
  const isKnownAdminEmail = KNOWN_SUPERUSER_EMAILS.includes(userEmail)
  const isMetadataAdmin =
    user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin'

  const store = readStore()
  const storeUser = store.users.find(
    (u) =>
      u.id === user.id ||
      (userEmail && (u.email || '').toLowerCase() === userEmail)
  )
  const isStoreAdmin = storeUser?.role === 'admin'

  const isConfirmedAdmin = isKnownAdminEmail || isMetadataAdmin || isStoreAdmin

  // 3. Consultar perfil en Supabase
  const adminClient = getSupabaseAdminClient()
  const authedClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
      },
    },
  })

  const clientToQuery = adminClient || authedClient

  let profile: Profile | null = null
  try {
    const { data: dbProfile } = await clientToQuery
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (dbProfile) {
      profile = dbProfile as Profile
    }
  } catch (err) {
    console.warn('[verifyAdminRequest] Error consultando perfil en Supabase:', err)
  }

  // Si no se encontró el perfil en la base de datos pero el usuario es un administrador confirmado:
  if (!profile && isConfirmedAdmin) {
    profile = {
      id: user.id,
      full_name:
        storeUser?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        userEmail.split('@')[0] ||
        'Superusuario Legado Docente',
      first_name:
        storeUser?.first_name ||
        user.user_metadata?.first_name ||
        'Administrador',
      last_name:
        storeUser?.last_name ||
        user.user_metadata?.last_name ||
        'Legado Docente',
      avatar_url:
        storeUser?.avatar_url ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null,
      role: 'admin',
      created_at: new Date().toISOString(),
    }

    // Insertar o actualizar en Supabase profiles para que siempre exista en la base de datos
    try {
      await clientToQuery.from('profiles').upsert(profile, { onConflict: 'id' })
    } catch (insertErr) {
      console.warn('[verifyAdminRequest] Advertencia al auto-insertar perfil admin:', insertErr)
    }

    // Sincronizar en el almacén de plataforma
    mutateStore((s) => {
      const idx = s.users.findIndex(
        (u) =>
          u.id === user.id ||
          (userEmail && (u.email || '').toLowerCase() === userEmail)
      )
      if (idx >= 0) {
        s.users[idx] = {
          ...s.users[idx],
          id: user.id,
          email: userEmail || s.users[idx].email,
          role: 'admin',
        }
      } else {
        s.users.unshift({
          ...profile!,
          email: userEmail,
        })
      }
    })

    return {
      authorized: true,
      userId: user.id,
      profile,
    }
  }

  if (!profile) {
    return { authorized: false, error: 'No se encontró el perfil del usuario en la base de datos' }
  }

  // Si existe perfil pero no tiene rol admin, pero es un superusuario confirmado, actualizarlo
  if (profile.role !== 'admin') {
    if (isConfirmedAdmin) {
      profile.role = 'admin'
      try {
        await clientToQuery
          .from('profiles')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('id', user.id)
      } catch {
        // Continuar
      }
    } else {
      return {
        authorized: false,
        error: 'Acceso denegado: se requieren permisos de Superusuario (admin)',
      }
    }
  }

  return {
    authorized: true,
    userId: user.id,
    profile: profile as Profile,
  }
}
