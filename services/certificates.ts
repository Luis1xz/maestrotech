import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Certificate } from '@/types/database'

export async function getUserCertificates(
  userId: string
): Promise<{ data: Certificate[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('certificates')
      .select('*, course:courses(title, thumbnail_url)')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })

    if (error) throw error
    return { data: (data as Certificate[]) || [], error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener certificados'
    return { data: null, error: new Error(msg) }
  }
}

export async function getCertificateByNumber(
  certNumber: string
): Promise<{ data: Certificate | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('certificates')
      .select('*, course:courses(title)')
      .eq('certificate_number', certNumber)
      .maybeSingle()

    if (error) throw error
    return { data: (data as Certificate) || null, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al validar certificado'
    return { data: null, error: new Error(msg) }
  }
}
