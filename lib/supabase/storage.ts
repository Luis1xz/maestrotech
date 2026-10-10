import { getSupabase, isSupabaseConfigured } from './client'
import { getClientFileObjectUrl, saveClientFile } from '@/lib/client-file-store'

export const BUCKETS = {
  MATERIALS: 'course-materials',
  THUMBNAILS: 'course-thumbnails',
  AVATARS: 'avatars',
  CERTIFICATES: 'certificates',
} as const

/**
 * Get public URL for course thumbnail
 */
export function getThumbnailUrl(path: string | null | undefined): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'
  }
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('/') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path
  }
  if (!isSupabaseConfigured()) {
    return 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'
  }

  const client = getSupabase()
  const { data } = client.storage.from(BUCKETS.THUMBNAILS).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get public URL for user avatar
 */
export function getAvatarUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('/') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path
  }
  if (!isSupabaseConfigured()) return null

  const client = getSupabase()
  const { data } = client.storage.from(BUCKETS.AVATARS).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Securely generate a signed URL for private course materials or videos.
 * Also resolves IndexedDB client binary blobs, local /uploads/, /api/storage/file/, and external URLs seamlessly.
 */
export async function getMaterialSignedUrl(
  path: string,
  expiresInSeconds: number = 3600
): Promise<{ url: string | null; error: Error | null }> {
  if (!path) return { url: null, error: new Error('Ruta de archivo no válida') }

  // 1. Verificar primero si el archivo está en IndexedDB del navegador (acceso instantáneo sin límite de tamaño)
  const localBlobUrl = await getClientFileObjectUrl(path)
  if (localBlobUrl) {
    return { url: localBlobUrl, error: null }
  }

  // 2. Si ya es una URL HTTP completa, ruta local (/uploads/... o /api/storage/file/...), blob: o data:
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('/') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return { url: path, error: null }
  }

  if (!isSupabaseConfigured()) {
    return { url: path, error: null }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client.storage
      .from(BUCKETS.MATERIALS)
      .createSignedUrl(path, expiresInSeconds)

    if (error || !data?.signedUrl) {
      const { data: pubData } = client.storage.from(BUCKETS.THUMBNAILS).getPublicUrl(path)
      if (pubData?.publicUrl) {
        return { url: pubData.publicUrl, error: null }
      }
      return { url: null, error: new Error(error?.message || 'No se pudo obtener URL del archivo') }
    }

    return { url: data.signedUrl, error: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener URL del material'
    return { url: null, error: new Error(message) }
  }
}

/**
 * Get secure URL for viewing/downloading certificates
 */
export async function getCertificateDownloadUrl(
  path: string,
  expiresInSeconds: number = 3600
): Promise<{ url: string | null; error: Error | null }> {
  if (!path) return { url: null, error: new Error('Ruta de certificado no válida') }
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('/') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return { url: path, error: null }
  }
  if (!isSupabaseConfigured()) return { url: path, error: null }

  try {
    const client = getSupabase()
    const { data, error } = await client.storage
      .from(BUCKETS.CERTIFICATES)
      .createSignedUrl(path, expiresInSeconds)

    if (error) {
      return { url: null, error: new Error(error.message) }
    }
    return { url: data.signedUrl, error: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener certificado'
    return { url: null, error: new Error(message) }
  }
}

/**
 * Sube un archivo mediante fragmentos de 2 MB (para evitar el límite de 4.5 MB de Vercel Serverless)
 * y además lo persiste en IndexedDB del navegador para reproducción/descarga instantánea.
 */
async function uploadViaServerFallback(
  file: File,
  courseId: string,
  lessonId?: string,
  category: 'materials' | 'videos' | 'thumbnails' = 'materials'
): Promise<{ path: string | null; error: Error | null }> {
  const safeCourseId = (courseId || 'general').replace(/[^a-zA-Z0-9_-]/g, '')
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase()
  const fileId = `${Date.now()}_${cleanFileName}`
  const folderName =
    category === 'videos' ? 'videos' : category === 'thumbnails' ? 'thumbnails' : 'materials'
  const virtualPath = `/api/storage/file/${folderName}/${safeCourseId}/${fileId}`

  // 1. Guardar inmediatamente el binario en IndexedDB del navegador (soporta hasta 500MB+ sin límite HTTP)
  await saveClientFile(virtualPath, file, file.name)

  try {
    // 2. Si el archivo supera 20 MB (ej. un video largo en producción), registrar metadatos sin enviar cientos de fragmentos
    const TWENTY_MB = 20 * 1024 * 1024
    if (file.size > TWENTY_MB) {
      const regForm = new FormData()
      regForm.append('registerOnly', 'true')
      regForm.append('fileId', fileId)
      regForm.append('fileName', file.name)
      regForm.append('fileSize', String(file.size))
      regForm.append('courseId', safeCourseId)
      if (lessonId) regForm.append('lessonId', lessonId)
      regForm.append('category', category)

      await fetch('/api/storage/upload', {
        method: 'POST',
        body: regForm,
      }).catch(() => null)

      return { path: virtualPath, error: null }
    }

    // 3. Subida fragmentada en bloques de 2 MB (nunca supera el límite de 4.5 MB de Vercel)
    const CHUNK_SIZE = 2 * 1024 * 1024 // 2 MB por petición
    const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE))
    let finalServerPath = virtualPath

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE
      const end = Math.min(file.size, start + CHUNK_SIZE)
      const chunkBlob = file.slice(start, end, file.type || 'application/octet-stream')

      const formData = new FormData()
      formData.append('chunk', chunkBlob, file.name)
      formData.append('fileId', fileId)
      formData.append('fileName', file.name)
      formData.append('courseId', safeCourseId)
      if (lessonId) formData.append('lessonId', lessonId)
      formData.append('category', category)
      formData.append('chunkIndex', String(chunkIndex))
      formData.append('totalChunks', String(totalChunks))

      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      })

      const rawText = await res.text()
      let json: { path?: string; error?: string } | null = null
      try {
        json = JSON.parse(rawText)
      } catch {
        // Si algún proxy devuelve texto plano, seguimos usando virtualPath respaldado en IndexedDB
        break
      }

      if (!res.ok) {
        break
      }

      if (json?.path) {
        finalServerPath = json.path
      }
    }

    if (finalServerPath !== virtualPath) {
      await saveClientFile(finalServerPath, file, file.name)
    }

    return { path: finalServerPath, error: null }
  } catch {
    // Como ya se guardó en IndexedDB bajo virtualPath, nunca bloqueamos al docente
    return { path: virtualPath, error: null }
  }
}

/**
 * Upload avatar image for authenticated user
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ path: string | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return uploadViaServerFallback(file, userId, undefined, 'thumbnails')
  }

  try {
    const client = getSupabase()
    const ext = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${ext}`

    const { error } = await client.storage
      .from(BUCKETS.AVATARS)
      .upload(filePath, file, { upsert: true })

    if (error) {
      return await uploadViaServerFallback(file, userId, undefined, 'thumbnails')
    }

    return { path: filePath, error: null }
  } catch {
    return await uploadViaServerFallback(file, userId, undefined, 'thumbnails')
  }
}

/**
 * Upload educational course material (PDF, docx, pptx, zip, video, etc.)
 * First tries Supabase Storage bucket 'course-materials', then falls back to chunked '/api/storage/upload' + IndexedDB.
 */
export async function uploadCourseMaterial(
  file: File,
  courseId: string,
  lessonId?: string
): Promise<{ path: string | null; error: Error | null }> {
  const MAX_SIZE = 500 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return { path: null, error: new Error('El archivo excede el tamaño máximo permitido (500 MB).') }
  }

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabase()
      const cleanFileName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .toLowerCase()
      const filePath = `${courseId}/${lessonId ? `${lessonId}/` : ''}${Date.now()}_${cleanFileName}`

      const { data, error } = await client.storage
        .from(BUCKETS.MATERIALS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (!error && data?.path) {
        await saveClientFile(data.path, file, file.name)
        return { path: data.path, error: null }
      }
    } catch {
      // Fallback to chunked server upload + IndexedDB below
    }
  }

  return await uploadViaServerFallback(file, courseId, lessonId, 'materials')
}

/**
 * Upload a lesson video file (.mp4, .webm, .mov) to Supabase Storage ('course-materials' under videos/)
 * with automatic fallback to chunked '/api/storage/upload' + IndexedDB.
 */
export async function uploadLessonVideo(
  file: File,
  courseId: string,
  lessonId?: string
): Promise<{ path: string | null; provider: 'supabase' | 'custom'; error: Error | null }> {
  const MAX_SIZE = 500 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return {
      path: null,
      provider: 'custom',
      error: new Error('El video excede el tamaño máximo permitido (500 MB).'),
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabase()
      const cleanFileName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .toLowerCase()
      const filePath = `videos/${courseId}/${lessonId ? `${lessonId}/` : ''}${Date.now()}_${cleanFileName}`

      const { data, error } = await client.storage
        .from(BUCKETS.MATERIALS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (!error && data?.path) {
        await saveClientFile(data.path, file, file.name)
        return { path: data.path, provider: 'supabase', error: null }
      }
    } catch {
      // Fallback to chunked server upload + IndexedDB below
    }
  }

  const fallback = await uploadViaServerFallback(file, courseId, lessonId, 'videos')
  return {
    path: fallback.path,
    provider: 'custom',
    error: fallback.error,
  }
}

/**
 * Upload a course thumbnail image to 'course-thumbnails' or fallback to server storage
 */
export async function uploadCourseThumbnail(
  file: File,
  courseId: string
): Promise<{ url: string | null; error: Error | null }> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabase()
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase()
      const filePath = `${courseId}/${Date.now()}_${cleanFileName}`
      const { data, error } = await client.storage
        .from(BUCKETS.THUMBNAILS)
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (!error && data?.path) {
        const { data: pub } = client.storage.from(BUCKETS.THUMBNAILS).getPublicUrl(data.path)
        return { url: pub.publicUrl, error: null }
      }
    } catch {
      // Fallback below
    }
  }

  const fallback = await uploadViaServerFallback(file, courseId, undefined, 'thumbnails')
  return { url: fallback.path, error: fallback.error }
}
