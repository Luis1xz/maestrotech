import { NextRequest, NextResponse } from 'next/server'
import {
  getTeacherPermissions,
  grantTeacherPermission,
  revokeTeacherPermission,
  logMaTechAction,
} from '@/services/matech'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id') || undefined
    const teacherId = searchParams.get('teacher_id') || undefined

    const { data, error } = await getTeacherPermissions(courseId, teacherId)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ permissions: data })
  } catch (error: any) {
    console.error('[API /api/matech/permissions GET] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al obtener permisos de docentes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      teacher_id,
      teacher_name,
      course_id,
      course_title,
      can_upload = true,
      can_publish = false,
      can_delete = false,
      granted_by = 'admin',
      granted_by_name = 'Superusuario',
    } = body

    if (!teacher_id || !course_id) {
      return NextResponse.json(
        { error: 'teacher_id y course_id son obligatorios.' },
        { status: 400 }
      )
    }

    const result = await grantTeacherPermission({
      teacher_id,
      teacher_name,
      course_id,
      course_title,
      can_upload,
      can_publish,
      can_delete,
      granted_by,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    await logMaTechAction({
      actor_id: granted_by,
      actor_name: granted_by_name,
      action: 'permission_granted',
      target_type: 'permission',
      target_id: `${teacher_id}:${course_id}`,
      target_title: `Permisos MaTech para ${teacher_name || teacher_id}`,
      course_id,
      details: {
        teacher_id,
        can_upload,
        can_publish,
        can_delete,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Permiso concedido exitosamente al docente para este curso.',
    })
  } catch (error: any) {
    console.error('[API /api/matech/permissions POST] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al otorgar permisos' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      teacher_id,
      course_id,
      revoked_by = 'admin',
      revoked_by_name = 'Superusuario',
    } = body

    if (!teacher_id || !course_id) {
      return NextResponse.json(
        { error: 'teacher_id y course_id son obligatorios.' },
        { status: 400 }
      )
    }

    const result = await revokeTeacherPermission(teacher_id, course_id)
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    await logMaTechAction({
      actor_id: revoked_by,
      actor_name: revoked_by_name,
      action: 'permission_revoked',
      target_type: 'permission',
      target_id: `${teacher_id}:${course_id}`,
      target_title: `Revocación de permisos MaTech`,
      course_id,
      details: { teacher_id },
    })

    return NextResponse.json({
      success: true,
      message: 'Permiso revocado exitosamente.',
    })
  } catch (error: any) {
    console.error('[API /api/matech/permissions DELETE] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al revocar permisos' },
      { status: 500 }
    )
  }
}
