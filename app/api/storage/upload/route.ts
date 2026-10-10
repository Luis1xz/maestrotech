import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const courseId = ((formData.get('courseId') as string) || 'general').replace(/[^a-zA-Z0-9_-]/g, '')
    const lessonId = ((formData.get('lessonId') as string) || '').replace(/[^a-zA-Z0-9_-]/g, '')
    const category = ((formData.get('category') as string) || 'materials').replace(/[^a-zA-Z0-9_-]/g, '')

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo para subir.' }, { status: 400 })
    }

    const cleanFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase()
    const fileNameWithTime = `${Date.now()}_${cleanFileName}`
    const subPath = lessonId ? `${courseId}/${lessonId}/${fileNameWithTime}` : `${courseId}/${fileNameWithTime}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 1. Si existe SUPABASE_SERVICE_ROLE_KEY en el servidor, subir directamente a Supabase Storage
    const adminClient = getSupabaseAdminClient()
    if (adminClient) {
      const bucket = category === 'thumbnails' ? 'course-thumbnails' : 'course-materials'
      const storageKey = category === 'videos' ? `videos/${subPath}` : subPath

      const { data: upData, error: upErr } = await adminClient.storage
        .from(bucket)
        .upload(storageKey, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        })

      if (!upErr && upData?.path) {
        if (bucket === 'course-thumbnails') {
          const { data: pub } = adminClient.storage.from(bucket).getPublicUrl(upData.path)
          return NextResponse.json({
            path: pub.publicUrl,
            url: pub.publicUrl,
            size: file.size,
            storage: 'supabase',
          })
        }
        return NextResponse.json({
          path: upData.path,
          url: upData.path,
          size: file.size,
          storage: 'supabase',
        })
      }
    }

    // 2. Almacenamiento persistente en public/uploads/<category>/...
    const folderName = category === 'videos' ? 'videos' : category === 'thumbnails' ? 'thumbnails' : 'materials'
    const relativeDir = path.join('uploads', folderName, courseId)
    const targetDir = path.join(process.cwd(), 'public', relativeDir)

    try {
      await fs.mkdir(targetDir, { recursive: true })
      const fullFilePath = path.join(targetDir, fileNameWithTime)
      await fs.writeFile(fullFilePath, buffer)

      const publicUrlPath = `/uploads/${folderName}/${courseId}/${fileNameWithTime}`
      return NextResponse.json({
        path: publicUrlPath,
        url: publicUrlPath,
        size: file.size,
        storage: 'local-public',
      })
    } catch {
      // 3. Fallback Data URL para entornos serverless de solo lectura (si el archivo es <= 15MB)
      if (file.size <= 15 * 1024 * 1024) {
        const mime = file.type || 'application/octet-stream'
        const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`
        return NextResponse.json({
          path: dataUrl,
          url: dataUrl,
          size: file.size,
          storage: 'inline',
        })
      }
      return NextResponse.json(
        { error: 'No fue posible escribir el archivo en el servidor. Ejecuta supabase/storage_policies.sql en Supabase.' },
        { status: 500 }
      )
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno al procesar la subida'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
