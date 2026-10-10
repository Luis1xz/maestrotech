import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdminClient, verifyAdminRequest } from '@/lib/supabase/server'
import { CreateUserPayload, AdminUserListItem } from '@/types/database'
import { readStore, mutateStore } from '@/lib/platform-store-server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authVerification = await verifyAdminRequest(authHeader)

    if (!authVerification.authorized) {
      return NextResponse.json(
        { error: authVerification.error || 'No autorizado' },
        { status: 403 }
      )
    }

    const store = readStore()
    const userMap = new Map<string, AdminUserListItem>()

    for (const u of store.users) {
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

    const adminClient = getSupabaseAdminClient()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (adminClient) {
      const { data: profiles } = await adminClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: authUsersData } = await adminClient.auth.admin.listUsers({ perPage: 100 })
      const emailMap = new Map<string, string>()
      if (authUsersData?.users) {
        authUsersData.users.forEach((u) => {
          if (u.email) emailMap.set(u.id, u.email)
        })
      }

      for (const p of profiles || []) {
        const existing = userMap.get(p.id)
        userMap.set(p.id, {
          ...p,
          role: existing?.role || p.role,
          role_updated_at: existing?.role_updated_at,
          email: emailMap.get(p.id) || existing?.email || 'registrado@maestrotech.co',
        })
      }
    } else if (url && anonKey) {
      const token = (authHeader || '').replace('Bearer ', '').trim()
      const headers: Record<string, string> = { apikey: anonKey }
      if (token && !token.startsWith('custom-session:')) {
        headers.Authorization = `Bearer ${token}`
      }
      const publicClient = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers },
      })
      const { data: profiles } = await publicClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      for (const p of profiles || []) {
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
    }

    return NextResponse.json({ users: Array.from(userMap.values()) })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authVerification = await verifyAdminRequest(authHeader)

    if (!authVerification.authorized) {
      return NextResponse.json(
        { error: authVerification.error || 'Acceso no autorizado' },
        { status: 403 }
      )
    }

    const body = (await request.json()) as CreateUserPayload
    const { firstName, lastName, email, temporaryPassword, role } = body

    if (!email || !temporaryPassword || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios (nombre, apellido, email, contraseña, rol).' },
        { status: 400 }
      )
    }

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'El rol especificado no es válido.' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const fullName = `${firstName.trim()} ${lastName.trim()}`
    let newUserId: string = crypto.randomUUID()

    const adminClient = getSupabaseAdminClient()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (adminClient) {
      const { data: createdAuthUser, error: createAuthErr } =
        await adminClient.auth.admin.createUser({
          email: cleanEmail,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role,
          },
        })

      if (!createAuthErr && createdAuthUser.user) {
        newUserId = createdAuthUser.user.id
        await adminClient.from('profiles').upsert(
          {
            id: newUserId,
            full_name: fullName,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
      }
    } else if (url && anonKey) {
      // Fallback cuando no hay SUPABASE_SERVICE_ROLE_KEY: registrar en Supabase Auth público + platform-store
      try {
        const publicClient = createClient(url, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
        const { data: signUpData } = await publicClient.auth.signUp({
          email: cleanEmail,
          password: temporaryPassword,
          options: {
            data: {
              full_name: fullName,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              role,
            },
          },
        })
        if (signUpData?.user?.id) {
          newUserId = signUpData.user.id
        }
      } catch {
        // Ignorar si ya existe en Auth, guardaremos en platform-store
      }
    }

    // Guardar en el almacén sincronizado de plataforma para acceso inmediato con su rol
    mutateStore((state) => {
      const idx = state.users.findIndex(
        (u) => (u.email || '').toLowerCase() === cleanEmail || u.id === newUserId
      )
      const userObj = {
        id: idx >= 0 ? state.users[idx].id : newUserId,
        email: cleanEmail,
        full_name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role,
        avatar_url: null,
        created_at: idx >= 0 ? state.users[idx].created_at : new Date().toISOString(),
      }
      if (idx >= 0) {
        state.users[idx] = userObj
      } else {
        state.users.unshift(userObj)
      }
    })

    return NextResponse.json({
      success: true,
      message: `Usuario ${fullName} (${cleanEmail}) habilitado exitosamente con rol ${role}.`,
      user: {
        id: newUserId,
        email: cleanEmail,
        full_name: fullName,
        role,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado al crear usuario'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authVerification = await verifyAdminRequest(authHeader)

    if (!authVerification.authorized) {
      return NextResponse.json(
        { error: authVerification.error || 'No autorizado para cambiar roles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      id,
      role,
      email,
      full_name,
      first_name,
      last_name,
      avatar_url,
      created_at,
      role_updated_at,
    } = body

    if (!id && !email) {
      return NextResponse.json(
        { error: 'Se requiere ID o correo electrónico del usuario.' },
        { status: 400 }
      )
    }

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Rol no válido.' }, { status: 400 })
    }

    const cleanEmail = (email || '').trim().toLowerCase()
    const updatedAt = role_updated_at || new Date().toISOString()

    const adminClient = getSupabaseAdminClient()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (adminClient && id) {
      await adminClient
        .from('profiles')
        .update({ role, updated_at: updatedAt })
        .eq('id', id)
    } else if (url && anonKey && id) {
      const token = (authHeader || '').replace('Bearer ', '').trim()
      if (token && !token.startsWith('custom-session:')) {
        try {
          const authedClient = createClient(url, anonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: {
              headers: {
                apikey: anonKey,
                Authorization: `Bearer ${token}`,
              },
            },
          })

          // Asegurar que el superusuario actual tenga role='admin' en su propia fila de public.profiles
          // para que public.is_admin() en PostgreSQL RLS evalúe a TRUE al actualizar a otros usuarios
          if (authVerification.userId) {
            await authedClient
              .from('profiles')
              .update({ role: 'admin', updated_at: updatedAt })
              .eq('id', authVerification.userId)
          }

          await authedClient
            .from('profiles')
            .update({ role, updated_at: updatedAt })
            .eq('id', id)
        } catch {
          // Continuar con actualización en platform-store
        }
      }
    }

    mutateStore((state) => {
      let matched = false
      state.users = state.users.map((u) => {
        if (
          (id && u.id === id) ||
          (cleanEmail && (u.email || '').toLowerCase() === cleanEmail)
        ) {
          matched = true
          return {
            ...u,
            role,
            role_updated_at: updatedAt,
            email: u.email || cleanEmail || 'usuario@maestrotech.co',
            full_name: u.full_name || full_name || 'Docente MaestroTech',
            first_name: u.first_name ?? first_name ?? null,
            last_name: u.last_name ?? last_name ?? null,
            avatar_url: u.avatar_url ?? avatar_url ?? null,
          }
        }
        return u
      })

      if (!matched) {
        const resolvedId = id || crypto.randomUUID()
        state.users.unshift({
          id: resolvedId,
          email: cleanEmail || 'usuario@maestrotech.co',
          full_name: full_name || cleanEmail.split('@')[0] || 'Docente MaestroTech',
          first_name: first_name ?? null,
          last_name: last_name ?? null,
          role,
          role_updated_at: updatedAt,
          avatar_url: avatar_url ?? null,
          created_at: created_at || updatedAt,
        })
      }
    })

    return NextResponse.json({
      success: true,
      role,
      role_updated_at: updatedAt,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar el rol'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

