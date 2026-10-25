import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Payment } from '@/types/database'
import { enrollInCourse } from '@/services/enrollments'

export interface NequiPaymentRecord {
  id: string
  userId: string
  userEmail: string
  userName: string
  courseId: string
  courseTitle: string
  planName?: string
  amount: number
  currency: string
  nequiPhone: string
  nequiReference: string
  provider: 'nequi'
  status: 'pending' | 'completed' | 'rejected'
  createdAt: string
  confirmedAt?: string
  confirmedBy?: string
  notes?: string
}

const NEQUI_STORAGE_KEY = 'maestrotech_nequi_payments_v2'

export const PAYMENT_CONFIG = {
  merchantName: 'MaestroTech Colombia',
  merchantPhone: '310 892 4512',
  paymentUrl: process.env.NEXT_PUBLIC_PAYMENT_URL || 'https://recarga.nequi.com.co/',
  nequiPaymentUrl: process.env.NEXT_PUBLIC_PAYMENT_URL || 'https://recarga.nequi.com.co/',
  defaultAmountProMonthly: 49900,
  defaultAmountProAnnual: 39900,
  supportWhatsapp: 'https://wa.me/573108924512?text=Hola,%20acabo%20de%20realizar%20mi%20pago%20para%20MaestroTech',
}

export const NEQUI_CONFIG = PAYMENT_CONFIG

function getStoredPayments(): NequiPaymentRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(NEQUI_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return [
    {
      id: 'neq_demo_001',
      userId: 'b5ccdb90-a6c0-4b99-add5-c93fac47ee84',
      userEmail: 'estudiante@maestrotech.co',
      userName: 'Carlos Andrés Gómez',
      courseId: '2aac8ece-e71b-4c7c-99be-9b4fe37879da',
      courseTitle: 'Preparación Integral Concurso Docente CNSC y Decreto 1278',
      planName: 'Docente Pro (Anual)',
      amount: 39900,
      currency: 'COP',
      nequiPhone: '315 489 2011',
      nequiReference: 'M839201',
      provider: 'nequi',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      notes: 'Pago registrado por enlace Nequi Negocio',
    },
    {
      id: 'neq_demo_002',
      userId: 'a1b2c3d4-0000-4000-8000-000000000001',
      userEmail: 'docente.aspirante@correo.com',
      userName: 'María Fernanda Ruiz',
      courseId: 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e',
      courseTitle: 'Pedagogía Crítica, Constructivismo y Modelos Pedagógicos',
      planName: 'Docente Pro (Mensual)',
      amount: 49900,
      currency: 'COP',
      nequiPhone: '320 918 3400',
      nequiReference: 'M710924',
      provider: 'nequi',
      status: 'completed',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      confirmedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      confirmedBy: 'Superusuario MaestroTech',
      notes: 'Confirmado y matriculado automáticamente',
    },
  ]
}

function saveStoredPayments(list: NequiPaymentRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(NEQUI_STORAGE_KEY, JSON.stringify(list))
  } catch {
    // ignore
  }
}

export async function getAllNequiPayments(): Promise<NequiPaymentRecord[]> {
  try {
    const res = await fetch('/api/payments/nequi', { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        // Merge with local storage
        const local = getStoredPayments()
        const map = new Map<string, NequiPaymentRecord>()
        for (const p of json.data) map.set(p.id, p)
        for (const p of local) map.set(p.id, p)
        return Array.from(map.values())
      }
    }
  } catch {
    // ignore network
  }
  return getStoredPayments()
}

export async function createNequiPayment(params: {
  userId: string
  userEmail: string
  userName: string
  courseId: string
  courseTitle: string
  planName?: string
  amount: number
  nequiPhone: string
  nequiReference: string
  notes?: string
}): Promise<{ data: NequiPaymentRecord | null; error: Error | null }> {
  const newRecord: NequiPaymentRecord = {
    id: `neq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    courseId: params.courseId,
    courseTitle: params.courseTitle,
    planName: params.planName || 'Docente Pro',
    amount: params.amount,
    currency: 'COP',
    nequiPhone: params.nequiPhone,
    nequiReference: params.nequiReference,
    provider: 'nequi',
    status: 'pending',
    createdAt: new Date().toISOString(),
    notes: params.notes,
  }

  // Save locally
  const current = getStoredPayments()
  saveStoredPayments([newRecord, ...current])

  // Try API route
  try {
    await fetch('/api/payments/nequi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', payload: newRecord }),
    })
  } catch {
    // offline fallback works via local storage
  }

  // Also try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabase()
      await client.from('payments').insert({
        user_id: params.userId,
        course_id: params.courseId,
        amount: params.amount,
        currency: 'COP',
        provider: 'nequi',
        provider_payment_id: params.nequiReference,
        status: 'pending',
      })
    } catch {
      // ignore
    }
  }

  return { data: newRecord, error: null }
}

export async function confirmNequiPayment(
  paymentId: string,
  confirmedBy: string = 'Superusuario MaestroTech'
): Promise<{ success: boolean; error?: string; payment?: NequiPaymentRecord }> {
  const current = getStoredPayments()
  const idx = current.findIndex((p) => p.id === paymentId)

  let payment = idx >= 0 ? current[idx] : null

  if (payment) {
    payment.status = 'completed'
    payment.confirmedAt = new Date().toISOString()
    payment.confirmedBy = confirmedBy
    current[idx] = payment
    saveStoredPayments(current)
  }

  // Sync to API
  try {
    const res = await fetch('/api/payments/nequi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'confirm',
        payload: { paymentId, confirmedBy },
      }),
    })
    if (res.ok) {
      const json = await res.json()
      if (json.data) payment = json.data
    }
  } catch {
    // local fallback
  }

  if (payment) {
    // Automatically enroll the student into the course or courses!
    if (payment.courseId === 'plan_pro' || payment.courseId === 'all') {
      // Enroll in the main default courses
      await enrollInCourse(payment.userId, '2aac8ece-e71b-4c7c-99be-9b4fe37879da')
      await enrollInCourse(payment.userId, 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e')
    } else {
      await enrollInCourse(payment.userId, payment.courseId)
    }
    return { success: true, payment }
  }

  return { success: false, error: 'Pago no encontrado para confirmar' }
}

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
