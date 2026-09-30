import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient, verifyAdminRequest } from '@/lib/supabase/server'
import { CreateUserPayload } from '@/types/database'

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

    const adminClient = getSupabaseAdminClient()
    if (!adminClient) {
      return NextResponse.json(
        {
          error:
            'SUPABASE_SERVICE_ROLE_KEY no está configurada en .env.local del servidor. Para listar y gestionar usuarios desde el backend, agrega la clave de servicio.',
        },
        { status: 503 }
      )
    }

    // Consultar todos los perfiles de usuario
    const { data: profiles, error: profErr } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profErr) {
      return NextResponse.json({ error: 'Error al consultar usuarios' }, { status: 500 })
    }

    // Obtener emails de auth.users si es posible
    const { data: authUsersData } = await adminClient.auth.admin.listUsers({ perPage: 100 })
    const emailMap = new Map<string, string>()
    if (authUsersData?.users) {
      authUsersData.users.forEach((u) => {
        if (u.email) emailMap.set(u.id, u.email)
      })
    }

    const enrichedUsers = (profiles || []).map((p) => ({
      ...p,
      email: emailMap.get(p.id) || 'Email privado',
    }))

    return NextResponse.json({ users: enrichedUsers })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autorización del superusuario
    const authHeader = request.headers.get('authorization')
    const authVerification = await verifyAdminRequest(authHeader)

    if (!authVerification.authorized) {
      return NextResponse.json(
        { error: authVerification.error || 'Acceso no autorizado' },
        { status: 403 }
      )
    }

    // 2. Obtener cliente administrativo con service_role en el servidor
    const adminClient = getSupabaseAdminClient()
    if (!adminClient) {
      return NextResponse.json(
        {
          error:
            'Configuración incompleta: agrega SUPABASE_SERVICE_ROLE_KEY en el archivo .env.local del servidor para habilitar la creación administrativa de cuentas.',
        },
        { status: 503 }
      )
    }

    // 3. Procesar payload de creación
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

    const fullName = `${firstName.trim()} ${lastName.trim()}`

    // 4. Crear usuario seguro en Supabase Auth mediante Admin API
    const { data: createdAuthUser, error: createAuthErr } =
      await adminClient.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password: temporaryPassword,
        email_confirm: true, // Confirmar email automáticamente para que pueda ingresar
        user_metadata: {
          full_name: fullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role,
        },
      })

    if (createAuthErr) {
      return NextResponse.json(
        { error: `Error al crear usuario en autenticación: ${createAuthErr.message}` },
        { status: 400 }
      )
    }

    if (!createdAuthUser.user) {
      return NextResponse.json({ error: 'No se pudo generar la cuenta.' }, { status: 500 })
    }

    const newUserId = createdAuthUser.user.id

    // 5. Asegurar perfil con el rol asignado en la tabla profiles
    const { data: profileData, error: profileErr } = await adminClient
      .from('profiles')
      .upsert(
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
      .select()
      .single()

    if (profileErr) {
      console.error('Error al actualizar rol en profiles:', profileErr)
    }

    return NextResponse.json({
      success: true,
      message: `Usuario ${fullName} creado exitosamente con rol ${role}.`,
      user: {
        id: newUserId,
        email: createdAuthUser.user.email,
        full_name: fullName,
        role: profileData?.role || role,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado al crear usuario'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
