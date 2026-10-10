import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = (formData.get('chunk') || formData.get('file')) as File | null
    const courseId = ((formData.get('courseId') as string) || 'general').replace(/[^a-zA-Z0-9_-]/g, '')
    const lessonId = ((formData.get('lessonId') as string) || '').replace(/[^a-zA-Z0-9_-]/g, '')
    const category = ((formData.get('category') as string) || 'materials').replace(/[^a-zA-Z0-9_-]/g, '')
    const registerOnly = formData.get('registerOnly') === 'true'
    const providedFileName = (formData.get('fileName') as string) || file?.name || 'archivo.pdf'
    const chunkIndexRaw = formData.get('chunkIndex')
    const totalChunksRaw = formData.get('totalChunks')
    const fileIdParam = (formData.get('fileId') as string) || ''

    const chunkIndex = chunkIndexRaw !== null ? Number(chunkIndexRaw) : 0
    const totalChunks = totalChunksRaw !== null ? Number(totalChunksRaw) : 1

    const cleanFileName = providedFileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase()
    const fileNameWithTime = fileIdParam
      ? fileIdParam.replace(/[^a-zA-Z0-9._-]/g, '_')
      : `${Date.now()}_${cleanFileName}`

    const folderName =
      category === 'videos' ? 'videos' : category === 'thumbnails' ? 'thumbnails' : 'materials'
    const apiFileUrl = `/api/storage/file/${folderName}/${courseId}/${fileNameWithTime}`

    // Modo registro rápido para archivos grandes (> 25MB) ya persistidos en IndexedDB del cliente
    if (registerOnly) {
      return NextResponse.json({
        path: apiFileUrl,
        url: apiFileUrl,
        size: Number(formData.get('fileSize') || 0),
        storage: 'client-idb-plus-api',
      })
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo o fragmento para subir.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 1. Escribir fragmento o archivo completo en os.tmpdir() (siempre escribible en Vercel y local, sin disparar hot-reload)
    const tmpTargetDir = path.join(os.tmpdir(), 'maestrotech-uploads', folderName, courseId)
    const tmpFullFilePath = path.join(tmpTargetDir, fileNameWithTime)
    await fs.mkdir(tmpTargetDir, { recursive: true })

    if (chunkIndex === 0) {
      await fs.writeFile(tmpFullFilePath, buffer)
    } else {
      await fs.appendFile(tmpFullFilePath, buffer)
    }

    // Si aún faltan fragmentos por subir, confirmar recepción de este fragmento
    if (chunkIndex < totalChunks - 1) {
      return NextResponse.json({
        chunkReceived: chunkIndex,
        totalChunks,
        path: apiFileUrl,
        url: apiFileUrl,
      })
    }

    // 3. Al recibir el último fragmento, si existe SUPABASE_SERVICE_ROLE_KEY subir a Supabase Storage
    const adminClient = getSupabaseAdminClient()
    if (adminClient) {
      try {
        const finalBuffer = await fs.readFile(tmpFullFilePath)
        const bucket = category === 'thumbnails' ? 'course-thumbnails' : 'course-materials'
        const subPath = lessonId
          ? `${courseId}/${lessonId}/${fileNameWithTime}`
          : `${courseId}/${fileNameWithTime}`
        const storageKey = category === 'videos' ? `videos/${subPath}` : subPath

        const { data: upData, error: upErr } = await adminClient.storage
          .from(bucket)
          .upload(storageKey, finalBuffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true,
          })

        if (!upErr && upData?.path) {
          if (bucket === 'course-thumbnails') {
            const { data: pub } = adminClient.storage.from(bucket).getPublicUrl(upData.path)
            return NextResponse.json({
              path: pub.publicUrl,
              url: pub.publicUrl,
              size: finalBuffer.length,
              storage: 'supabase',
            })
          }
          return NextResponse.json({
            path: upData.path,
            url: upData.path,
            size: finalBuffer.length,
            storage: 'supabase',
          })
        }
      } catch {
        // Fallback a apiFileUrl
      }
    }

    return NextResponse.json({
      path: apiFileUrl,
      url: apiFileUrl,
      size: buffer.length,
      storage: 'server-stream',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno al procesar la subida'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
