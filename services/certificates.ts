import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Certificate, Course } from '@/types/database'
import { fetchPlatformState, mutatePlatformState } from '@/lib/platform-state-client'

export interface CertificateWithCourse extends Certificate {
  course?: Partial<Course>
}

export async function getUserCertificates(
  userId: string
): Promise<{ data: CertificateWithCourse[] | null; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    const courseMap = new Map((state?.courses || []).map((c) => [c.id, c]))
    const stateCerts = (state?.certificates || [])
      .filter((c) => c.user_id === userId)
      .map((c) => ({
        ...c,
        course: courseMap.get(c.course_id),
      }))

    const map = new Map<string, CertificateWithCourse>()
    for (const c of stateCerts) {
      map.set(c.course_id, c)
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data, error } = await client
          .from('certificates')
          .select('*, course:courses(title, thumbnail_url, category, duration_hours)')
          .eq('user_id', userId)
          .order('issued_at', { ascending: false })

        if (!error && data) {
          for (const item of data as CertificateWithCourse[]) {
            if (!map.has(item.course_id)) {
              map.set(item.course_id, {
                ...item,
                course: courseMap.get(item.course_id) || item.course,
              })
            }
          }
        }
      } catch {
        // Fallback to stateCerts
      }
    }

    return { data: Array.from(map.values()), error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener certificados'
    return { data: [], error: new Error(msg) }
  }
}

export async function getCertificateByNumber(
  certNumber: string
): Promise<{ data: CertificateWithCourse | null; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    const courseMap = new Map((state?.courses || []).map((c) => [c.id, c]))
    const match = (state?.certificates || []).find(
      (c) => c.certificate_number.toLowerCase() === certNumber.trim().toLowerCase()
    )

    if (match) {
      return {
        data: {
          ...match,
          course: courseMap.get(match.course_id),
        },
        error: null,
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data, error } = await client
          .from('certificates')
          .select('*, course:courses(title, thumbnail_url)')
          .eq('certificate_number', certNumber)
          .maybeSingle()

        if (!error && data) {
          return { data: data as CertificateWithCourse, error: null }
        }
      } catch {
        // Fallback
      }
    }

    return { data: null, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al validar certificado'
    return { data: null, error: new Error(msg) }
  }
}

export async function issueCourseCertificate(
  userId: string,
  courseId: string
): Promise<{ data: CertificateWithCourse | null; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    const courseMap = new Map((state?.courses || []).map((c) => [c.id, c]))
    const existing = (state?.certificates || []).find(
      (c) => c.user_id === userId && c.course_id === courseId
    )

    if (existing) {
      return {
        data: {
          ...existing,
          course: courseMap.get(courseId),
        },
        error: null,
      }
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000)
    const certNumber = `MT-2026-CNSC-${randomCode}`
    const now = new Date().toISOString()

    let dbCert: Certificate | null = null
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data } = await client
          .from('certificates')
          .insert({
            user_id: userId,
            course_id: courseId,
            certificate_number: certNumber,
            issued_at: now,
            pdf_url: '/uploads/materials/guia-decreto-1278-estatuto-docente.pdf',
          })
          .select()
          .single()

        if (data) dbCert = data as Certificate
      } catch {
        // Continue to platform-state
      }
    }

    const finalCert: Certificate = {
      id: dbCert?.id || `cert-${Date.now()}`,
      user_id: userId,
      course_id: courseId,
      certificate_number: dbCert?.certificate_number || certNumber,
      issued_at: dbCert?.issued_at || now,
      pdf_url: dbCert?.pdf_url || '/uploads/materials/guia-decreto-1278-estatuto-docente.pdf',
    }

    await mutatePlatformState('upsert_certificate', finalCert)
    return {
      data: {
        ...finalCert,
        course: courseMap.get(courseId),
      },
      error: null,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al emitir certificado'
    return { data: null, error: new Error(msg) }
  }
}
