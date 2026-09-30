import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Material } from '@/types/database'
import { getMaterialSignedUrl, uploadCourseMaterial } from '@/lib/supabase/storage'

export async function getMaterialsByLesson(
  lessonId: string
): Promise<{ data: Material[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('materials')
      .select('*')
      .eq('lesson_id', lessonId)

    if (error) throw error
    return { data: (data as Material[]) || [], error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener materiales'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Obtener todos los materiales asociados a las lecciones de un curso
 */
export async function getMaterialsByCourse(
  courseId: string
): Promise<{ data: Material[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null }
  }

  try {
    const client = getSupabase()
    // 1. Obtener IDs de módulos del curso
    const { data: modules, error: modErr } = await client
      .from('modules')
      .select('id')
      .eq('course_id', courseId)

    if (modErr) throw modErr
    const moduleIds = (modules || []).map((m: { id: string }) => m.id)
    if (moduleIds.length === 0) return { data: [], error: null }

    // 2. Obtener IDs de lecciones
    const { data: lessons, error: lessErr } = await client
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds)

    if (lessErr) throw lessErr
    const lessonIds = (lessons || []).map((l: { id: string }) => l.id)
    if (lessonIds.length === 0) return { data: [], error: null }

    // 3. Obtener materiales
    const { data: materials, error: matErr } = await client
      .from('materials')
      .select('*')
      .in('lesson_id', lessonIds)

    if (matErr) throw matErr
    return { data: (materials as Material[]) || [], error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener materiales del curso'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Sube un archivo a Supabase Storage (bucket privado 'course-materials') y
 * crea el registro correspondiente en la tabla 'materials'.
 */
export async function uploadLessonMaterial(params: {
  file: File
  courseId: string
  lessonId: string
  title?: string
}): Promise<{ data: Material | null; error: Error | null }> {
  const { file, courseId, lessonId, title } = params

  if (!isSupabaseConfigured()) {
    return {
      data: {
        id: `mat-${Date.now()}`,
        lesson_id: lessonId,
        title: title || file.name,
        file_url: `demo/${courseId}/${file.name}`,
        file_type: file.name.split('.').pop() || 'pdf',
        file_size: file.size,
        created_at: new Date().toISOString(),
      },
      error: null,
    }
  }

  try {
    // 1. Subir al Storage bucket privado
    const uploadRes = await uploadCourseMaterial(file, courseId, lessonId)
    if (uploadRes.error || !uploadRes.path) {
      return { data: null, error: uploadRes.error || new Error('Fallo al subir el archivo al almacenamiento') }
    }

    // 2. Insertar en la tabla 'materials' (utilizando solo columnas existentes en BD)
    const client = getSupabase()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const materialTitle = (title && title.trim()) || file.name.replace(/\.[^/.]+$/, '')

    const payload = {
      lesson_id: lessonId,
      title: materialTitle,
      file_url: uploadRes.path,
      file_type: ext,
    }

    const { data, error } = await client
      .from('materials')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('[uploadLessonMaterial] Error al registrar en tabla materials:', error)
      return { data: null, error: new Error(`Error en base de datos: ${error.message}`) }
    }

    return { data: data as Material, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al procesar la subida del material'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Obtener URL de acceso seguro a un material
 * Si es de pago y el usuario no está matriculado, deniega el acceso
 */
export async function getMaterialAccess(
  material: Material,
  isEnrolled: boolean
): Promise<{ url: string | null; error: Error | null }> {
  // Si no es gratuito y no está matriculado, bloquear acceso
  if (!material.is_free && !isEnrolled) {
    return {
      url: null,
      error: new Error('Material exclusivo para estudiantes matriculados en este curso.'),
    }
  }

  return await getMaterialSignedUrl(material.file_url)
}

/**
 * Obtiene todas las lecciones de un curso organizadas para asignación de materiales.
 */
export async function getLessonsForCourse(
  courseId: string
): Promise<{ data: { id: string; title: string; module_title: string }[]; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null }
  }

  try {
    const client = getSupabase()
    const { data: modules, error: modErr } = await client
      .from('modules')
      .select('id, title, order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (modErr) throw modErr
    if (!modules || modules.length === 0) return { data: [], error: null }

    const moduleIds = modules.map((m: { id: string }) => m.id)
    const { data: lessons, error: lessErr } = await client
      .from('lessons')
      .select('id, title, module_id, order_index')
      .in('module_id', moduleIds)
      .order('order_index', { ascending: true })

    if (lessErr) throw lessErr

    const moduleMap = new Map(modules.map((m: { id: string; title: string }) => [m.id, m.title]))
    const formatted = (lessons || []).map((l: { id: string; title: string; module_id: string }) => ({
      id: l.id,
      title: l.title,
      module_title: moduleMap.get(l.module_id) || 'Módulo',
    }))

    return { data: formatted, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener lecciones del curso'
    return { data: [], error: new Error(msg) }
  }
}

/**
 * Asegura que exista al menos un módulo y lección para poder asociar archivos a un curso.
 */
export async function ensureDefaultLesson(
  courseId: string
): Promise<{ lessonId: string | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { lessonId: 'demo-lesson', error: null }
  }

  try {
    const client = getSupabase()

    // 1. Verificar si ya hay módulos
    const { data: existingModules, error: modErr } = await client
      .from('modules')
      .select('id')
      .eq('course_id', courseId)
      .limit(1)

    if (modErr) throw modErr

    let moduleId: string
    if (existingModules && existingModules.length > 0) {
      moduleId = existingModules[0].id
    } else {
      // Crear módulo por defecto
      const { data: newMod, error: createModErr } = await client
        .from('modules')
        .insert({
          course_id: courseId,
          title: 'Módulo 1: Recursos y Guías Pedagógicas',
          order_index: 0,
        })
        .select('id')
        .single()

      if (createModErr) throw createModErr
      moduleId = newMod.id
    }

    // 2. Verificar si ya hay lecciones en ese módulo
    const { data: existingLessons, error: lessErr } = await client
      .from('lessons')
      .select('id')
      .eq('module_id', moduleId)
      .limit(1)

    if (lessErr) throw lessErr

    if (existingLessons && existingLessons.length > 0) {
      return { lessonId: existingLessons[0].id, error: null }
    }

    // Crear lección por defecto
    const { data: newLesson, error: createLessErr } = await client
      .from('lessons')
      .insert({
        module_id: moduleId,
        title: 'Material y Documentación General',
        order_index: 0,
        duration_seconds: 0,
        is_preview: false,
        published: true,
      })
      .select('id')
      .single()

    if (createLessErr) throw createLessErr
    return { lessonId: newLesson.id, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al inicializar contenedor del curso'
    return { lessonId: null, error: new Error(msg) }
  }
}

/**
 * Elimina un material de la base de datos y opcionalmente del bucket de Storage
 */
export async function deleteMaterial(
  materialId: string,
  filePath?: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { success: true, error: null }
  }

  try {
    const client = getSupabase()

    if (filePath) {
      await client.storage.from('course-materials').remove([filePath])
    }

    const { error } = await client.from('materials').delete().eq('id', materialId)
    if (error) throw error

    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar material'
    return { success: false, error: new Error(msg) }
  }
}

