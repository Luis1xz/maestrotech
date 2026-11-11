import { NextRequest, NextResponse } from 'next/server'
import {
  updateMaTechDocumentStatus,
  deleteMaTechDocument,
  getMaTechDocuments,
  logMaTechAction,
} from '@/services/matech'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, actorId = 'admin', actorName = 'Superusuario' } = body

    if (!['publish', 'unpublish', 'archive', 'reprocess'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Opciones: publish, unpublish, archive, reprocess' },
        { status: 400 }
      )
    }

    const { data: allDocs } = await getMaTechDocuments()
    const targetDoc = allDocs.find((d) => d.id === id)

    if (action === 'publish' || action === 'unpublish' || action === 'archive') {
      const targetStatus =
        action === 'publish' ? 'published' : action === 'unpublish' ? 'pending' : 'archived'

      const result = await updateMaTechDocumentStatus(id, targetStatus)
      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 })
      }

      await logMaTechAction({
        actor_id: actorId,
        actor_name: actorName,
        action: action === 'publish' ? 'document_published' : 'document_unpublished',
        target_type: 'document',
        target_id: id,
        target_title: targetDoc?.title || id,
        course_id: targetDoc?.course_id,
        details: { new_status: targetStatus },
      })

      return NextResponse.json({
        success: true,
        status: targetStatus,
        message: `Estado del documento actualizado a ${targetStatus}.`,
      })
    }

    // Reprocesar
    if (action === 'reprocess') {
      // Marcamos como pending para reprocesamiento
      await updateMaTechDocumentStatus(id, 'pending')
      await logMaTechAction({
        actor_id: actorId,
        actor_name: actorName,
        action: 'document_reprocessed',
        target_type: 'document',
        target_id: id,
        target_title: targetDoc?.title || id,
        course_id: targetDoc?.course_id,
      })

      return NextResponse.json({
        success: true,
        message: 'Solicitud de reprocesamiento iniciada.',
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API /api/matech/documents/[id] PATCH] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar documento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const actorId = searchParams.get('actor_id') || 'admin'
    const actorName = searchParams.get('actor_name') || 'Superusuario'

    const { data: allDocs } = await getMaTechDocuments()
    const targetDoc = allDocs.find((d) => d.id === id)

    const result = await deleteMaTechDocument(id)
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    await logMaTechAction({
      actor_id: actorId,
      actor_name: actorName,
      action: 'document_deleted',
      target_type: 'document',
      target_id: id,
      target_title: targetDoc?.title || id,
      course_id: targetDoc?.course_id,
      details: {
        file_name: targetDoc?.file_name,
        total_chunks: targetDoc?.total_chunks,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Documento y fragmentos vectoriales eliminados exitosamente.',
    })
  } catch (error: any) {
    console.error('[API /api/matech/documents/[id] DELETE] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al eliminar documento' },
      { status: 500 }
    )
  }
}
