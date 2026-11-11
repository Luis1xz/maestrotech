import { NextRequest, NextResponse } from 'next/server'
import {
  getMaTechSettings,
  updateMaTechSettings,
  getMaTechUsageStats,
  getMaTechAuditLogs,
  logMaTechAction,
} from '@/services/matech'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeAudit = searchParams.get('include_audit') === 'true'

    const settings = await getMaTechSettings()
    const stats = await getMaTechUsageStats()
    let auditLogs: any[] = []

    if (includeAudit) {
      auditLogs = await getMaTechAuditLogs(50)
    }

    return NextResponse.json({
      settings,
      stats,
      auditLogs,
    })
  } catch (error: any) {
    console.error('[API /api/matech/settings GET] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al obtener configuración de MaTech' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { actorId = 'admin', actorName = 'Superusuario', ...settingsPayload } = body

    const result = await updateMaTechSettings(settingsPayload)
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    await logMaTechAction({
      actor_id: actorId,
      actor_name: actorName,
      action: 'settings_updated',
      target_type: 'setting',
      target_id: 'global',
      target_title: 'Configuración Global de MaTech',
      details: settingsPayload,
    })

    return NextResponse.json({
      success: true,
      settings: result.data,
      message: 'Límites y configuración de MaTech actualizados correctamente.',
    })
  } catch (error: any) {
    console.error('[API /api/matech/settings PATCH] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar configuración de MaTech' },
      { status: 500 }
    )
  }
}
