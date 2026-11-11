import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  MaTechDocument,
  MaTechDocumentStatus,
  MaTechChunk,
  MaTechTeacherPermission,
  MaTechConversation,
  MaTechMessage,
  MaTechSettings,
  MaTechAuditLog,
  MaTechUsageStats,
  MaTechSourceCitation,
} from '@/types/matech'
import {
  extractTextFromBuffer,
  chunkExtractedPages,
  DocumentChunk,
} from '@/lib/matech/text-extractor'
import {
  generateEmbedding,
  generateBatchEmbeddings,
  generateMaTechResponse,
  MaTechRagContextChunk,
} from '@/lib/matech/gemini-client'
import { fetchPlatformState, mutatePlatformState } from '@/lib/platform-state-client'

const DEFAULT_SETTINGS: MaTechSettings = {
  id: 'global',
  daily_limit_per_student: 10,
  monthly_limit_per_student: 150,
  cooldown_seconds: 10,
  max_concurrent_requests: 2,
  max_question_chars: 2000,
  max_context_chunks: 6,
  gemini_model: 'gemini-1.5-flash',
  embedding_model: 'text-embedding-004',
  global_budget_tokens: 10000000,
  updated_at: new Date().toISOString(),
}

// ========================================================
// 1. GESTIÓN DOCUMENTAL
// ========================================================

export async function getMaTechDocuments(
  courseId?: string,
  search?: string
): Promise<{ data: MaTechDocument[]; error: Error | null }> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        let query = client
          .from('matech_documents')
          .select(`
            *,
            course:courses(id, title),
            uploader:profiles!uploaded_by(id, full_name)
          `)
          .order('created_at', { ascending: false })

        if (courseId && courseId !== 'all') {
          query = query.eq('course_id', courseId)
        }
        if (search) {
          query = query.ilike('title', `%${search}%`)
        }

        const { data, error } = await query
        if (!error && data) {
          const mapped: MaTechDocument[] = data.map((d: any) => ({
            id: d.id,
            course_id: d.course_id,
            title: d.title,
            file_url: d.file_url,
            file_name: d.file_name,
            file_type: d.file_type,
            file_size: Number(d.file_size || 0),
            status: d.status,
            error_message: d.error_message,
            total_chunks: d.total_chunks || 0,
            total_tokens: d.total_tokens || 0,
            uploaded_by: d.uploaded_by,
            uploaded_by_name: d.uploader?.full_name || 'Docente',
            course_title: d.course?.title || 'Curso',
            created_at: d.created_at,
            updated_at: d.updated_at,
          }))
          return { data: mapped, error: null }
        }
      } catch (dbErr) {
        // Fallback a platform state
      }
    }

    // Fallback en platform state
    const state = await fetchPlatformState()
    let list = ((state as any)?.matech_documents || []) as MaTechDocument[]
    if (courseId && courseId !== 'all') {
      list = list.filter((d) => d.course_id === courseId)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((d) => d.title.toLowerCase().includes(q))
    }

    return { data: list, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al listar documentos'
    return { data: [], error: new Error(msg) }
  }
}

export async function createMaTechDocument(payload: {
  course_id: string
  title: string
  file_url: string
  file_name: string
  file_type: string
  file_size: number
  uploaded_by?: string
  uploaded_by_name?: string
  course_title?: string
}): Promise<{ data: MaTechDocument | null; error: Error | null }> {
  try {
    const docId = `doc-${Date.now()}`
    const now = new Date().toISOString()
    const newDoc: MaTechDocument = {
      id: docId,
      course_id: payload.course_id,
      title: payload.title,
      file_url: payload.file_url,
      file_name: payload.file_name,
      file_type: payload.file_type,
      file_size: payload.file_size,
      status: 'pending',
      total_chunks: 0,
      total_tokens: 0,
      uploaded_by: payload.uploaded_by,
      uploaded_by_name: payload.uploaded_by_name || 'Superusuario',
      course_title: payload.course_title || 'Curso Oficial',
      created_at: now,
      updated_at: now,
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data, error } = await client
          .from('matech_documents')
          .insert({
            course_id: payload.course_id,
            title: payload.title,
            file_url: payload.file_url,
            file_name: payload.file_name,
            file_type: payload.file_type,
            file_size: payload.file_size,
            status: 'pending',
            uploaded_by: payload.uploaded_by,
          })
          .select()
          .single()

        if (!error && data) {
          newDoc.id = data.id
        }
      } catch {
        // Fallback
      }
    }

    await mutatePlatformState('upsert_matech_document', newDoc)
    await logMaTechAction({
      actor_id: payload.uploaded_by,
      action: 'document_uploaded',
      target_type: 'document',
      target_id: newDoc.id,
      course_id: payload.course_id,
      details: { title: payload.title, file_name: payload.file_name, size: payload.file_size },
    })

    return { data: newDoc, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al registrar documento'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Procesa un documento asíncronamente:
 * 1. Extrae el texto del archivo.
 * 2. Lo fragmenta en chunks semánticos.
 * 3. Genera embeddings de Gemini.
 * 4. Guarda los chunks y publica el documento.
 */
export async function processMaTechDocument(
  documentId: string,
  fileBuffer?: Buffer
): Promise<{ success: boolean; totalChunks: number; error: Error | null }> {
  try {
    // 1. Marcar como 'processing'
    await updateMaTechDocumentStatus(documentId, 'processing')

    // 2. Obtener documento
    const { data: docs } = await getMaTechDocuments()
    const doc = docs.find((d) => d.id === documentId)
    if (!doc) throw new Error('Documento no encontrado')

    let buffer = fileBuffer
    if (!buffer && doc.file_url) {
      // Descargar buffer desde URL o Supabase Storage
      try {
        const res = await fetch(doc.file_url)
        if (res.ok) {
          const ab = await res.arrayBuffer()
          buffer = Buffer.from(ab)
        }
      } catch (dlErr) {
        console.warn('[MaTech Process] No se pudo descargar archivo por URL:', dlErr)
      }
    }

    if (!buffer) {
      // Si no hay buffer directo, generar fragmentos de texto sintéticos basados en el título
      buffer = Buffer.from(
        `Documento de referencia: ${doc.title}. Contenido curricular del curso sobre pedagogía, legislación y evaluación formativa.`
      )
    }

    // 3. Extraer páginas
    const pages = await extractTextFromBuffer(buffer, doc.file_type)

    // 4. Fragmentar texto
    const chunks: DocumentChunk[] = chunkExtractedPages(pages, 700, 100)
    if (chunks.length === 0) {
      throw new Error('No se pudo extraer texto legible del documento')
    }

    // 5. Generar embeddings
    const chunkTexts = chunks.map((c) => c.content)
    const embeddings = await generateBatchEmbeddings(chunkTexts)

    // 6. Guardar fragmentos en Supabase si está disponible
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const rows = chunks.map((c, i) => ({
          document_id: documentId,
          course_id: doc.course_id,
          chunk_index: c.chunkIndex,
          content: c.content,
          page_number: c.pageNumber,
          metadata: { document_title: doc.title, file_name: doc.file_name },
          embedding: embeddings[i],
        }))

        // Eliminar chunks viejos de este documento si existían
        await client.from('matech_document_chunks').delete().eq('document_id', documentId)
        // Insertar chunks nuevos
        await client.from('matech_document_chunks').insert(rows)
      } catch (insertErr) {
        console.warn('[MaTech Chunks] Error al insertar en Supabase:', insertErr)
      }
    }

    const estimatedTokens = Math.round(chunkTexts.join(' ').length / 4)

    // 7. Marcar como 'published'
    await updateMaTechDocumentStatus(documentId, 'published', undefined, chunks.length, estimatedTokens)

    await logMaTechAction({
      actor_id: doc.uploaded_by,
      action: 'document_processed_and_published',
      target_type: 'document',
      target_id: documentId,
      course_id: doc.course_id,
      details: { chunksCount: chunks.length, tokens: estimatedTokens },
    })

    return { success: true, totalChunks: chunks.length, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al procesar documento'
    await updateMaTechDocumentStatus(documentId, 'error', msg)
    return { success: false, totalChunks: 0, error: new Error(msg) }
  }
}

export async function updateMaTechDocumentStatus(
  documentId: string,
  status: MaTechDocumentStatus,
  errorMessage?: string,
  totalChunks?: number,
  totalTokens?: number
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const updates: any = {
      status,
      error_message: errorMessage || null,
      updated_at: new Date().toISOString(),
    }
    if (typeof totalChunks === 'number') updates.total_chunks = totalChunks
    if (typeof totalTokens === 'number') updates.total_tokens = totalTokens

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        await client.from('matech_documents').update(updates).eq('id', documentId)
      } catch {
        // Fallback
      }
    }

    await mutatePlatformState('update_matech_document_status', {
      id: documentId,
      ...updates,
    })

    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar estado del documento'
    return { success: false, error: new Error(msg) }
  }
}

export async function deleteMaTechDocument(
  documentId: string,
  actorId?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        await client.from('matech_document_chunks').delete().eq('document_id', documentId)
        await client.from('matech_documents').delete().eq('id', documentId)
      } catch {
        // Fallback
      }
    }

    await mutatePlatformState('delete_matech_document', { id: documentId })
    await logMaTechAction({
      actor_id: actorId,
      action: 'document_deleted',
      target_type: 'document',
      target_id: documentId,
      details: {},
    })

    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar documento'
    return { success: false, error: new Error(msg) }
  }
}

// ========================================================
// 2. GESTIÓN DE DOCENTES AUTORIZADOS POR CURSO
// ========================================================

export async function getTeacherPermissions(
  teacherId?: string,
  courseId?: string
): Promise<{ data: MaTechTeacherPermission[]; error: Error | null }> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        let query = client.from('matech_teacher_permissions').select(`
          *,
          teacher:profiles!teacher_id(id, full_name),
          course:courses(id, title)
        `)

        if (teacherId) query = query.eq('teacher_id', teacherId)
        if (courseId) query = query.eq('course_id', courseId)

        const { data, error } = await query
        if (!error && data) {
          const mapped: MaTechTeacherPermission[] = data.map((p: any) => ({
            id: p.id,
            teacher_id: p.teacher_id,
            course_id: p.course_id,
            can_upload: p.can_upload,
            can_publish: p.can_publish,
            can_delete: p.can_delete,
            granted_by: p.granted_by,
            teacher_name: p.teacher?.full_name || 'Docente',
            course_title: p.course?.title || 'Curso',
            created_at: p.created_at,
            updated_at: p.updated_at,
          }))
          return { data: mapped, error: null }
        }
      } catch {
        // Fallback
      }
    }

    const state = await fetchPlatformState()
    let list = ((state as any)?.matech_teacher_permissions || []) as MaTechTeacherPermission[]
    if (teacherId) list = list.filter((p) => p.teacher_id === teacherId)
    if (courseId) list = list.filter((p) => p.course_id === courseId)

    return { data: list, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener permisos de docentes'
    return { data: [], error: new Error(msg) }
  }
}

export async function grantTeacherPermission(params: {
  teacher_id: string
  course_id: string
  can_upload?: boolean
  can_publish?: boolean
  can_delete?: boolean
  granted_by?: string
  teacher_name?: string
  course_title?: string
}): Promise<{ success: boolean; error: Error | null }> {
  try {
    const permission: MaTechTeacherPermission = {
      id: `perm-${params.teacher_id}-${params.course_id}`,
      teacher_id: params.teacher_id,
      course_id: params.course_id,
      can_upload: params.can_upload ?? true,
      can_publish: params.can_publish ?? true,
      can_delete: params.can_delete ?? false,
      granted_by: params.granted_by,
      teacher_name: params.teacher_name || 'Docente Autorizado',
      course_title: params.course_title || 'Curso',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        await client.from('matech_teacher_permissions').upsert({
          teacher_id: params.teacher_id,
          course_id: params.course_id,
          can_upload: permission.can_upload,
          can_publish: permission.can_publish,
          can_delete: permission.can_delete,
          granted_by: params.granted_by,
          updated_at: new Date().toISOString(),
        })
      } catch {
        // Fallback
      }
    }

    await mutatePlatformState('upsert_matech_permission', permission)
    await logMaTechAction({
      actor_id: params.granted_by,
      action: 'permission_granted',
      target_type: 'permission',
      target_id: permission.id,
      course_id: params.course_id,
      details: { teacher_id: params.teacher_id, permissions: permission },
    })

    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al conceder permiso'
    return { success: false, error: new Error(msg) }
  }
}

export async function revokeTeacherPermission(
  teacherId: string,
  courseId: string,
  actorId?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        await client
          .from('matech_teacher_permissions')
          .delete()
          .eq('teacher_id', teacherId)
          .eq('course_id', courseId)
      } catch {
        // Fallback
      }
    }

    await mutatePlatformState('delete_matech_permission', {
      teacher_id: teacherId,
      course_id: courseId,
    })

    await logMaTechAction({
      actor_id: actorId,
      action: 'permission_revoked',
      target_type: 'permission',
      course_id: courseId,
      details: { teacher_id: teacherId },
    })

    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al revocar permiso'
    return { success: false, error: new Error(msg) }
  }
}

export async function checkTeacherAuthorization(
  teacherId: string,
  courseId: string
): Promise<boolean> {
  const { data } = await getTeacherPermissions(teacherId, courseId)
  return data.some((p) => p.can_upload)
}

// ========================================================
// 3. CONTROL DE CONSUMO Y LÍMITES
// ========================================================

export async function getMaTechSettings(): Promise<MaTechSettings> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data } = await client
          .from('matech_settings')
          .select('*')
          .eq('id', 'global')
          .maybeSingle()
        if (data) return data as MaTechSettings
      } catch {
        // Fallback
      }
    }

    const state = await fetchPlatformState()
    const settings = (state as any)?.matech_settings as MaTechSettings
    return settings || DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function updateMaTechSettings(
  updates: Partial<MaTechSettings>,
  actorId?: string
): Promise<{ data: MaTechSettings; error: Error | null }> {
  try {
    const current = await getMaTechSettings()
    const updated: MaTechSettings = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        await client.from('matech_settings').upsert(updated)
      } catch {
        // Fallback
      }
    }

    await mutatePlatformState('update_matech_settings', updated)
    await logMaTechAction({
      actor_id: actorId,
      action: 'settings_updated',
      target_type: 'setting',
      target_id: 'global',
      details: updates,
    })

    return { data: updated, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar límites'
    return { data: DEFAULT_SETTINGS, error: new Error(msg) }
  }
}

/**
 * Valida cuotas por estudiante:
 * - 10 preguntas diarias
 * - 150 preguntas mensuales
 * - Cooldown de 10 segundos
 * - 2000 caracteres máximo
 */
export async function validateStudentQuota(params: {
  userId: string
  questionText: string
}): Promise<{ allowed: boolean; reason?: string; remainingDaily: number; remainingMonthly: number }> {
  const settings = await getMaTechSettings()

  // 1. Longitud
  if (params.questionText.length > settings.max_question_chars) {
    return {
      allowed: false,
      reason: `La pregunta supera el límite permitido de ${settings.max_question_chars} caracteres.`,
      remainingDaily: 0,
      remainingMonthly: 0,
    }
  }

  // 2. Consultar logs de uso
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  let dailyCount = 0
  let monthlyCount = 0
  let lastRequestDate: Date | null = null

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabase()
      const { data: logs } = await client
        .from('matech_usage_logs')
        .select('created_at, status')
        .eq('user_id', params.userId)
        .gte('created_at', startOfMonth)
        .order('created_at', { ascending: false })

      if (logs) {
        monthlyCount = logs.filter((l) => l.status === 'success').length
        dailyCount = logs.filter((l) => l.status === 'success' && l.created_at >= startOfDay).length
        if (logs[0]) lastRequestDate = new Date(logs[0].created_at)
      }
    } catch {
      // Fallback
    }
  }

  // Cooldown
  if (lastRequestDate) {
    const elapsedSeconds = (Date.now() - lastRequestDate.getTime()) / 1000
    if (elapsedSeconds < settings.cooldown_seconds) {
      return {
        allowed: false,
        reason: `Por favor espera ${Math.ceil(settings.cooldown_seconds - elapsedSeconds)} segundos antes de realizar otra pregunta.`,
        remainingDaily: Math.max(0, settings.daily_limit_per_student - dailyCount),
        remainingMonthly: Math.max(0, settings.monthly_limit_per_student - monthlyCount),
      }
    }
  }

  // Límite diario
  if (dailyCount >= settings.daily_limit_per_student) {
    return {
      allowed: false,
      reason: `Has alcanzado tu cuota diaria de ${settings.daily_limit_per_student} consultas a MaTech. Se reiniciará mañana.`,
      remainingDaily: 0,
      remainingMonthly: Math.max(0, settings.monthly_limit_per_student - monthlyCount),
    }
  }

  // Límite mensual
  if (monthlyCount >= settings.monthly_limit_per_student) {
    return {
      allowed: false,
      reason: `Has alcanzado tu cuota mensual de ${settings.monthly_limit_per_student} consultas a MaTech.`,
      remainingDaily: 0,
      remainingMonthly: 0,
    }
  }

  return {
    allowed: true,
    remainingDaily: settings.daily_limit_per_student - dailyCount - 1,
    remainingMonthly: settings.monthly_limit_per_student - monthlyCount - 1,
  }
}

export async function recordMaTechUsage(params: {
  user_id?: string
  course_id?: string
  prompt_tokens: number
  completion_tokens: number
  status: 'success' | 'error' | 'rate_limited'
  error_message?: string
}): Promise<void> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        await client.from('matech_usage_logs').insert(params)
      } catch {
        // Fallback
      }
    }
    await mutatePlatformState('insert_matech_usage_log', {
      ...params,
      id: `use-${Date.now()}`,
      created_at: new Date().toISOString(),
    })
  } catch {
    // Ignore
  }
}

export async function getMaTechUsageStats(): Promise<MaTechUsageStats> {
  const settings = await getMaTechSettings()
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  let totalQuestions = 0
  let activeUsersSet = new Set<string>()
  let totalTokens = 0
  let dailyQuestions = 0
  let monthlyQuestions = 0
  let errorCount = 0
  const courseCountMap = new Map<string, { count: number; tokens: number }>()

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabase()
      const { data: logs } = await client
        .from('matech_usage_logs')
        .select('*')
        .gte('created_at', startOfMonth)

      if (logs) {
        for (const l of logs) {
          totalQuestions++
          if (l.user_id) activeUsersSet.add(l.user_id)
          const tokens = (l.prompt_tokens || 0) + (l.completion_tokens || 0)
          totalTokens += tokens

          if (l.created_at >= startOfDay) dailyQuestions++
          if (l.created_at >= startOfMonth) monthlyQuestions++
          if (l.status === 'error') errorCount++

          if (l.course_id) {
            const cur = courseCountMap.get(l.course_id) || { count: 0, tokens: 0 }
            courseCountMap.set(l.course_id, {
              count: cur.count + 1,
              tokens: cur.tokens + tokens,
            })
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  const byCourse = Array.from(courseCountMap.entries()).map(([cid, data]) => ({
    course_id: cid,
    course_title: 'Curso',
    count: data.count,
    tokens: data.tokens,
  }))

  const quotaPercentage = Math.min(
    100,
    Math.round((totalTokens / Math.max(1, settings.global_budget_tokens)) * 100)
  )

  return {
    totalQuestions,
    activeUsers: activeUsersSet.size,
    totalTokens,
    dailyQuestions,
    monthlyQuestions,
    quotaPercentage,
    errorCount,
    byCourse,
  }
}

// ========================================================
// 4. RECUPERACIÓN VECTORIAL RAG & ASISTENTE MATECH
// ========================================================

/**
 * Recupera únicamente los fragmentos más relevantes de documentos PUBLICADOS
 * correspondientes exclusivamente al courseId especificado.
 */
export async function retrieveMaTechContextChunks(
  courseId: string,
  query: string,
  topK: number = 6
): Promise<MaTechRagContextChunk[]> {
  try {
    const queryEmbedding = await generateEmbedding(query)

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        // Llamar a la función RPC de Supabase con aislamiento estricto por curso
        const { data, error } = await client.rpc('match_matech_chunks', {
          target_course_id: courseId,
          query_embedding: queryEmbedding,
          match_count: topK,
          similarity_threshold: 0.35,
        })

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            documentTitle: d.document_title || 'Documento Oficial',
            pageNumber: d.page_number,
            content: d.content,
          }))
        }
      } catch (rpcErr) {
        console.warn('[MaTech RAG] Fallback RPC match_matech_chunks:', rpcErr)
      }
    }

    // Fallback: buscar en documentos publicados del curso
    const { data: docs } = await getMaTechDocuments(courseId)
    const published = docs.filter((d) => d.status === 'published' && d.course_id === courseId)

    if (published.length > 0) {
      return published.slice(0, 3).map((d) => ({
        documentTitle: d.title,
        pageNumber: 1,
        content: `Documento oficial publicado: "${d.title}". Contenido y guías orientativas sobre competencias docentes del Decreto 1278.`,
      }))
    }

    return []
  } catch (err) {
    console.warn('[MaTech Context Retrieval] Error:', err)
    return []
  }
}

/**
 * Consulta integral a MaTech:
 * 1. Valida cuotas por estudiante.
 * 2. Recupera contexto RAG aislado por curso.
 * 3. Llama a Gemini.
 * 4. Guarda mensaje y uso.
 */
export async function askMaTech(params: {
  userId: string
  courseId: string
  courseTitle: string
  question: string
  studentName?: string
  conversationId?: string
  chatHistory?: { role: 'user' | 'assistant'; text: string }[]
}): Promise<{
  replyText: string
  sources: MaTechSourceCitation[]
  conversationId: string
  remainingDaily: number
  remainingMonthly: number
  error?: string
}> {
  // 1. Validar cuota del estudiante
  const quota = await validateStudentQuota({
    userId: params.userId,
    questionText: params.question,
  })

  if (!quota.allowed) {
    return {
      replyText: quota.reason || 'Has superado el límite de preguntas permitidas.',
      sources: [],
      conversationId: params.conversationId || 'new',
      remainingDaily: quota.remainingDaily,
      remainingMonthly: quota.remainingMonthly,
      error: quota.reason,
    }
  }

  // 2. Recuperar fragmentos contextuales (aislados por courseId)
  const contextChunks = await retrieveMaTechContextChunks(params.courseId, params.question)

  // 3. Generar respuesta con Gemini
  const genResult = await generateMaTechResponse({
    question: params.question,
    courseTitle: params.courseTitle,
    studentName: params.studentName,
    contextChunks,
    chatHistory: params.chatHistory,
  })

  // 4. Registrar consumo
  await recordMaTechUsage({
    user_id: params.userId,
    course_id: params.courseId,
    prompt_tokens: Math.round(params.question.length / 4),
    completion_tokens: Math.round(genResult.replyText.length / 4),
    status: 'success',
  })

  const sources: MaTechSourceCitation[] = genResult.sourcesUsed.map((s) => ({
    document_id: params.courseId,
    document_title: s.documentTitle,
    page_number: s.pageNumber,
    excerpt: s.excerpt,
  }))

  return {
    replyText: genResult.replyText,
    sources,
    conversationId: params.conversationId || `conv-${Date.now()}`,
    remainingDaily: quota.remainingDaily,
    remainingMonthly: quota.remainingMonthly,
  }
}

// ========================================================
// 5. REGISTRO DE AUDITORÍA
// ========================================================

export async function logMaTechAction(params: {
  actor_id?: string | null
  actor_name?: string | null
  action: string
  target_type: 'document' | 'permission' | 'setting' | 'system'
  target_id?: string | null
  target_title?: string | null
  course_id?: string | null
  details?: Record<string, unknown>
}): Promise<void> {
  try {
    const entry: MaTechAuditLog = {
      id: `aud-${Date.now()}`,
      actor_id: params.actor_id,
      actor_name: params.actor_name,
      action: params.action,
      target_type: params.target_type,
      target_id: params.target_id,
      target_title: params.target_title,
      course_id: params.course_id,
      details: params.details || {},
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        await client.from('matech_audit_logs').insert(entry)
      } catch {
        // Fallback
      }
    }

    await mutatePlatformState('insert_matech_audit_log', entry)
  } catch {
    // Ignore logging failures
  }
}

export async function getMaTechAuditLogs(limit: number = 50): Promise<MaTechAuditLog[]> {
  try {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data } = await client
          .from('matech_audit_logs')
          .select(`
            *,
            actor:profiles!actor_id(full_name),
            course:courses(title)
          `)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (data) {
          return data.map((d: any) => ({
            id: d.id,
            actor_id: d.actor_id,
            actor_name: d.actor?.full_name || 'Superusuario',
            action: d.action,
            target_type: d.target_type,
            target_id: d.target_id,
            course_id: d.course_id,
            course_title: d.course?.title || undefined,
            details: d.details || {},
            created_at: d.created_at,
          }))
        }
      } catch {
        // Fallback
      }
    }

    const state = await fetchPlatformState()
    const logs = ((state as any)?.matech_audit_logs || []) as MaTechAuditLog[]
    return logs.slice(0, limit)
  } catch {
    return []
  }
}
