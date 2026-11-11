import { NextRequest, NextResponse } from 'next/server'
import {
  getMaTechDocuments,
  createMaTechDocument,
  processMaTechDocument,
  logMaTechAction,
} from '@/services/matech'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id') || undefined
    const search = searchParams.get('search') || undefined

    const { data, error } = await getMaTechDocuments(courseId, search)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ documents: data })
  } catch (error: any) {
    console.error('[API /api/matech/documents GET] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al obtener documentos de MaTech' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const courseId = (formData.get('course_id') as string) || ''
    const courseTitle = (formData.get('course_title') as string) || 'Curso Oficial'
    const customTitle = (formData.get('title') as string) || ''
    const autoPublish = formData.get('auto_publish') !== 'false'
    const uploadedBy = (formData.get('uploaded_by') as string) || 'admin'
    const uploadedByName = (formData.get('uploaded_by_name') as string) || 'Superusuario'

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha adjuntado ningún archivo.' },
        { status: 400 }
      )
    }

    if (!courseId) {
      return NextResponse.json(
        { error: 'El ID del curso es obligatorio.' },
        { status: 400 }
      )
    }

    const fileName = file.name
    const ext = path.extname(fileName).toLowerCase().replace('.', '')
    const allowedExtensions = ['pdf', 'docx', 'txt', 'pptx', 'xlsx']

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        {
          error: `Formato de archivo no soportado (.${ext}). Los formatos permitidos son: PDF, DOCX, TXT, PPTX y XLSX.`,
        },
        { status: 400 }
      )
    }

    const fileSize = file.size
    const maxSizeBytes = 35 * 1024 * 1024 // 35MB
    if (fileSize > maxSizeBytes) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo permitido de 35 MB.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Título descriptivo
    const title =
      customTitle.trim() ||
      path.basename(fileName, path.extname(fileName)).replace(/[_-]/g, ' ')

    // 1. Crear registro inicial en BD
    const createResult = await createMaTechDocument({
      course_id: courseId,
      course_title: courseTitle,
      title,
      file_url: `/api/storage/file/materials/${courseId}/${fileName}`,
      file_name: fileName,
      file_type: ext,
      file_size: fileSize,
      uploaded_by: uploadedBy,
      uploaded_by_name: uploadedByName,
    })

    if (createResult.error || !createResult.data) {
      return NextResponse.json(
        { error: createResult.error?.message || 'Error al registrar el documento.' },
        { status: 500 }
      )
    }

    const docId = createResult.data.id

    // 2. Procesamiento asíncrono e inteligente de extracción y embeddings
    const processResult = await processMaTechDocument(docId, buffer)

    const finalStatus = !processResult.success
      ? 'error'
      : autoPublish
      ? 'published'
      : 'pending'

    const errorMsg = processResult.error?.message || null

    // 3. Registrar auditoría
    await logMaTechAction({
      actor_id: uploadedBy,
      actor_name: uploadedByName,
      action: 'document_uploaded',
      target_type: 'document',
      target_id: docId,
      target_title: title,
      course_id: courseId,
      details: {
        file_name: fileName,
        file_size: fileSize,
        file_type: ext,
        total_chunks: processResult.totalChunks,
        status: finalStatus,
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        ...createResult.data,
        status: finalStatus,
        total_chunks: processResult.totalChunks,
        error_message: errorMsg,
      },
      message:
        finalStatus === 'published'
          ? `Documento procesado e indexado con éxito (${processResult.totalChunks} fragmentos). MaTech ya puede consultar esta fuente.`
          : finalStatus === 'error'
          ? `Documento registrado con advertencia: ${errorMsg}`
          : 'Documento procesado y guardado como borrador.',
    })
  } catch (error: any) {
    console.error('[API /api/matech/documents POST] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error interno al subir el documento a MaTech' },
      { status: 500 }
    )
  }
}
