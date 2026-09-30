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
  if (!path) return '/placeholder.jpg'
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path
  }
  if (!isSupabaseConfigured()) return '/placeholder.jpg'

  const client = getSupabase()
  const { data } = client.storage.from(BUCKETS.THUMBNAILS).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get public URL for user avatar
 */
export function getAvatarUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path
  }
  if (!isSupabaseConfigured()) return null

  const client = getSupabase()
  const { data } = client.storage.from(BUCKETS.AVATARS).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Securely generate a signed URL for private course materials.
 * Prevents unauthorized public access to course downloads (PDF, docx, etc.).
 */
export async function getMaterialSignedUrl(
  path: string,
  expiresInSeconds: number = 3600
): Promise<{ url: string | null; error: Error | null }> {
  if (!path) return { url: null, error: new Error('Ruta de archivo no válida') }

  // If already full HTTP URL (e.g. external resource or mock)
  if (path.startsWith('http://') || path.startsWith('https://')) {
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

    if (error) {
      console.error('Error al generar signed URL de material:', error.message)
      return { url: null, error: new Error(error.message) }
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
  if (path.startsWith('http://') || path.startsWith('https://')) {
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
 * Upload avatar image for authenticated user
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ path: string | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { path: null, error: new Error('Supabase no está configurado') }
  }

  try {
    const client = getSupabase()
    const ext = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${ext}`

    const { error } = await client.storage
      .from(BUCKETS.AVATARS)
      .upload(filePath, file, { upsert: true })

    if (error) throw error

    return { path: filePath, error: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al subir avatar'
    return { path: null, error: new Error(message) }
  }
}

/**
 * Upload educational course material (PDF, docx, etc.) to the private 'course-materials' bucket.
 * Accessible only by instructors and admins for upload, and accessed via signed URLs.
 */
export async function uploadCourseMaterial(
  file: File,
  courseId: string,
  lessonId?: string
): Promise<{ path: string | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { path: `demo/${courseId}/${file.name}`, error: null }
  }

  // Validate size (max 50MB)
  const MAX_SIZE = 50 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return { path: null, error: new Error('El archivo excede el tamaño máximo permitido (50 MB).') }
  }

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
        upsert: false,
      })

    if (error) {
      console.error('[uploadCourseMaterial] Error en Supabase Storage:', error)
      return { path: null, error: new Error(`Error en Storage: ${error.message}`) }
    }

    return { path: data.path, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error inesperado al subir archivo'
    return { path: null, error: new Error(msg) }
  }
}

