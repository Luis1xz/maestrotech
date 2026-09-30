import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Payment } from '@/types/database'

export async function getUserPayments(
  userId: string
): Promise<{ data: Payment[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('payments')
      .select('*, course:courses(title, thumbnail_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: (data as Payment[]) || [], error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener pagos'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Estructura preparada para pasarelas de pago (Wompi, Stripe, Mercado Pago)
 * Nota: La validación final y confirmación de matrícula debe ocurrir
 * mediante Webhook seguro en backend/edge functions.
 */
export async function createPaymentOrder(params: {
  userId: string
  courseId: string
  amount: number
  currency?: string
  provider: 'wompi' | 'stripe' | 'mercadopago' | 'manual'
  providerPaymentId?: string
}): Promise<{ data: Payment | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase no está configurado') }
  }

  try {
    const client = getSupabase()
    const { data, error } = await client
      .from('payments')
      .insert({
        user_id: params.userId,
        course_id: params.courseId,
        amount: params.amount,
        currency: params.currency || 'COP',
        provider: params.provider,
        provider_payment_id: params.providerPaymentId || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as Payment, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al registrar orden de pago'
    return { data: null, error: new Error(msg) }
  }
}
