import { getSupabase, isSupabaseConfigured } from './client'

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
    path.startsWith('data:')
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
    path.startsWith('data:')
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
 * Also handles local /uploads/ and external URLs seamlessly.
 */
export async function getMaterialSignedUrl(
  path: string,
  expiresInSeconds: number = 3600
): Promise<{ url: string | null; error: Error | null }> {
  if (!path) return { url: null, error: new Error('Ruta de archivo no válida') }

  // If already a full HTTP URL, local public path (/uploads/...), or data URL
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('/') ||
    path.startsWith('data:')
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
      // Fallback: check if stored in public bucket course-thumbnails
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
    path.startsWith('data:')
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
 * Helper to upload via server endpoint /api/storage/upload as fallback when client Storage RLS blocks direct upload
 */
async function uploadViaServerFallback(
  file: File,
  courseId: string,
  lessonId?: string,
  category: 'materials' | 'videos' | 'thumbnails' = 'materials'
): Promise<{ path: string | null; error: Error | null }> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('courseId', courseId)
    if (lessonId) formData.append('lessonId', lessonId)
    formData.append('category', category)

    const res = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    })

    const json = await res.json()
    if (!res.ok || !json.path) {
      return { path: null, error: new Error(json.error || 'Error al subir archivo al servidor') }
    }
    return { path: json.path as string, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al subir archivo mediante el servidor'
    return { path: null, error: new Error(msg) }
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
 * First tries Supabase Storage bucket 'course-materials', then falls back to '/api/storage/upload'.
 */
export async function uploadCourseMaterial(
  file: File,
  courseId: string,
  lessonId?: string
): Promise<{ path: string | null; error: Error | null }> {
  // Validate size (max 500MB to support both documents and video files)
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
        return { path: data.path, error: null }
      }
    } catch {
      // Fallback to server upload below
    }
  }

  return await uploadViaServerFallback(file, courseId, lessonId, 'materials')
}

/**
 * Upload a lesson video file (.mp4, .webm, .mov) to Supabase Storage ('course-materials' under videos/)
 * with automatic fallback to '/api/storage/upload'.
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
        return { path: data.path, provider: 'supabase', error: null }
      }
    } catch {
      // Fallback to server upload below
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
