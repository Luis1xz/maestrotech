import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Material } from '@/types/database'
import { getMaterialSignedUrl, uploadCourseMaterial } from '@/lib/supabase/storage'
import { fetchPlatformState, mutatePlatformState } from '@/lib/platform-state-client'
import { createModule } from './modules'
import { createLesson } from './lessons'

function mergeMaterials(primary: Material[], secondary: Material[]): Material[] {
  const map = new Map<string, Material>()
  for (const m of secondary) {
    map.set(m.id, m)
  }
  for (const m of primary) {
    const existing = map.get(m.id)
    map.set(m.id, existing ? { ...existing, ...m } : m)
  }
  return Array.from(map.values())
}

export async function getMaterialsByLesson(
  lessonId: string
): Promise<{ data: Material[] | null; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    const stateMats = (state?.materials || []).filter((m) => m.lesson_id === lessonId)

    let dbMats: Material[] = []
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data, error } = await client
          .from('materials')
          .select('*')
          .eq('lesson_id', lessonId)

        if (!error && data) {
          dbMats = data as Material[]
        }
      } catch {
        // Fallback to stateMats
      }
    }

    const merged = mergeMaterials(stateMats, dbMats)
    return { data: merged, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener materiales'
    return { data: [], error: new Error(msg) }
  }
}

/**
 * Obtener todos los materiales asociados a las lecciones de un curso
 */
export async function getMaterialsByCourse(
  courseId: string
): Promise<{ data: Material[] | null; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    const stateModuleIds = new Set(
      (state?.modules || []).filter((m) => m.course_id === courseId).map((m) => m.id)
    )
    const stateLessonIds = new Set(
      (state?.lessons || [])
        .filter((l) => l.course_id === courseId || stateModuleIds.has(l.module_id))
        .map((l) => l.id)
    )
    const stateMats = (state?.materials || []).filter(
      (m) => m.course_id === courseId || stateLessonIds.has(m.lesson_id)
    )

    let dbMats: Material[] = []
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data: modules } = await client
          .from('modules')
          .select('id')
          .eq('course_id', courseId)

        const moduleIds = Array.from(
          new Set([
            ...Array.from(stateModuleIds),
            ...(modules || []).map((m: { id: string }) => m.id),
          ])
        )

        if (moduleIds.length > 0) {
          const { data: lessons } = await client
            .from('lessons')
            .select('id')
            .in('module_id', moduleIds)

          const lessonIds = Array.from(
            new Set([
              ...Array.from(stateLessonIds),
              ...(lessons || []).map((l: { id: string }) => l.id),
            ])
          )

          if (lessonIds.length > 0) {
            const { data: materials } = await client
              .from('materials')
              .select('*')
              .in('lesson_id', lessonIds)

            if (materials) {
              dbMats = materials as Material[]
            }
          }
        }
      } catch {
        // Fallback to stateMats
      }
    }

    const merged = mergeMaterials(stateMats, dbMats)
    return { data: merged, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener materiales del curso'
    return { data: [], error: new Error(msg) }
  }
}

/**
 * Sube un archivo a Supabase Storage (o almacenamiento local del servidor) y
 * crea el registro correspondiente en la tabla 'materials' y platform-state.
 */
export async function uploadLessonMaterial(params: {
  file: File
  courseId: string
  lessonId: string
  title?: string
  isFree?: boolean
}): Promise<{ data: Material | null; error: Error | null }> {
  const { file, courseId, lessonId, title, isFree = true } = params

  try {
    // 1. Subir al Storage (Supabase o fallback local /api/storage/upload)
    const uploadRes = await uploadCourseMaterial(file, courseId, lessonId)
    if (uploadRes.error || !uploadRes.path) {
      return {
        data: null,
        error: uploadRes.error || new Error('Fallo al subir el archivo al almacenamiento'),
      }
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
    const materialTitle = (title && title.trim()) || file.name.replace(/\.[^/.]+$/, '')

    let dbMat: Material | null = null
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
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

        if (!error && data) {
          dbMat = data as Material
        }
      } catch {
        // Fallback to platform-state
      }
    }

    const finalMaterial = {
      id: dbMat?.id || crypto.randomUUID(),
      lesson_id: lessonId,
      course_id: courseId,
      title: materialTitle,
      file_url: uploadRes.path,
      file_type: ext,
      file_size: file.size,
      is_free: isFree,
      created_at: dbMat?.created_at || new Date().toISOString(),
    }

    await mutatePlatformState('upsert_material', finalMaterial)
    return { data: finalMaterial, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al procesar la subida del material'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Obtener URL de acceso seguro a un material
 */
export async function getMaterialAccess(
  material: Material,
  isEnrolled: boolean
): Promise<{ url: string | null; error: Error | null }> {
  // Si explícitamente is_free === false y no está matriculado, bloquear acceso
  if (material.is_free === false && !isEnrolled) {
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
  try {
    const state = await fetchPlatformState()
    const stateModules = (state?.modules || [])
      .filter((m) => m.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index)
    const stateModuleMap = new Map(stateModules.map((m) => [m.id, m.title]))
    const stateLessons = (state?.lessons || [])
      .filter((l) => l.course_id === courseId || stateModuleMap.has(l.module_id))
      .sort((a, b) => a.order_index - b.order_index)

    const resultMap = new Map<string, { id: string; title: string; module_title: string }>()
    for (const l of stateLessons) {
      resultMap.set(l.id, {
        id: l.id,
        title: l.title,
        module_title: stateModuleMap.get(l.module_id) || 'Módulo del Curso',
      })
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data: modules } = await client
          .from('modules')
          .select('id, title, order_index')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true })

        if (modules && modules.length > 0) {
          const moduleIds = modules.map((m: { id: string }) => m.id)
          const moduleMap = new Map(
            modules.map((m: { id: string; title: string }) => [m.id, m.title])
          )

          const { data: lessons } = await client
            .from('lessons')
            .select('id, title, module_id, order_index')
            .in('module_id', moduleIds)
            .order('order_index', { ascending: true })

          for (const l of lessons || []) {
            if (!resultMap.has(l.id)) {
              resultMap.set(l.id, {
                id: l.id,
                title: l.title,
                module_title: moduleMap.get(l.module_id) || 'Módulo',
              })
            }
          }
        }
      } catch {
        // Ignore DB error, use state
      }
    }

    return { data: Array.from(resultMap.values()), error: null }
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
  try {
    const existing = await getLessonsForCourse(courseId)
    if (existing.data && existing.data.length > 0) {
      return { lessonId: existing.data[0].id, error: null }
    }

    // Crear módulo por defecto
    const { data: mod, error: modErr } = await createModule({
      course_id: courseId,
      title: 'Módulo 1: Recursos y Guías Pedagógicas',
      description: 'Contenedor principal de clases y recursos descargables del curso.',
      order_index: 1,
    })

    if (modErr || !mod) {
      throw modErr || new Error('No se pudo crear el módulo por defecto')
    }

    // Crear lección por defecto con is_preview: true para que sea accesible
    const { data: lesson, error: lessErr } = await createLesson({
      module_id: mod.id,
      course_id: courseId,
      title: 'Clase 1: Material y Documentación General',
      description: 'Recursos oficiales y guías de estudio descargables del curso.',
      order_index: 1,
      duration_seconds: 900,
      video_provider: 'youtube',
      video_id: 'M7lc1UVf-VE',
      is_preview: true,
      published: true,
    })

    if (lessErr || !lesson) {
      throw lessErr || new Error('No se pudo crear la lección por defecto')
    }

    return { lessonId: lesson.id, error: null }
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
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        if (filePath && !filePath.startsWith('/uploads/') && !filePath.startsWith('http')) {
          await client.storage.from('course-materials').remove([filePath])
        }
        await client.from('materials').delete().eq('id', materialId)
      } catch {
        // Continue to delete from platform-state
      }
    }

    await mutatePlatformState('delete_material', { id: materialId })
    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar material'
    return { success: false, error: new Error(msg) }
  }
}
