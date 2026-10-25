import { NextRequest, NextResponse } from 'next/server'
import { readStore, mutateStore } from '@/lib/platform-store-server'

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

// In-memory / server cache fallback
let memoryNequiPayments: NequiPaymentRecord[] = [
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
    notes: 'Pago realizado vía enlace Nequi Negocio',
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

export async function GET() {
  return NextResponse.json({
    success: true,
    data: memoryNequiPayments,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, payload } = body

    if (action === 'create') {
      const newPayment: NequiPaymentRecord = {
        id: `neq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: payload.userId || 'guest_user',
        userEmail: payload.userEmail || 'usuario@maestrotech.co',
        userName: payload.userName || 'Docente Aspirante',
        courseId: payload.courseId || 'plan_pro',
        courseTitle: payload.courseTitle || 'Plan Docente Pro MaestroTech',
        planName: payload.planName || 'Docente Pro',
        amount: payload.amount || 39900,
        currency: 'COP',
        nequiPhone: payload.nequiPhone || '',
        nequiReference: payload.nequiReference || `NQ${Math.floor(100000 + Math.random() * 900000)}`,
        provider: 'nequi',
        status: payload.status || 'pending',
        createdAt: new Date().toISOString(),
        notes: payload.notes || 'Registrado por usuario vía Nequi Negocio',
      }

      memoryNequiPayments.unshift(newPayment)

      return NextResponse.json({
        success: true,
        data: newPayment,
      })
    }

    if (action === 'confirm') {
      const { paymentId, confirmedBy } = payload
      const idx = memoryNequiPayments.findIndex((p) => p.id === paymentId)

      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Pago no encontrado' }, { status: 404 })
      }

      memoryNequiPayments[idx].status = 'completed'
      memoryNequiPayments[idx].confirmedAt = new Date().toISOString()
      memoryNequiPayments[idx].confirmedBy = confirmedBy || 'Superusuario MaestroTech'

      // Also activate enrollment in platform store
      const payment = memoryNequiPayments[idx]
      mutateStore((state) => {
        const existingEnroll = state.enrollments.find(
          (e) => e.user_id === payment.userId && e.course_id === payment.courseId
        )
        if (existingEnroll) {
          existingEnroll.status = 'active'
        } else {
          state.enrollments.unshift({
            id: `enr_neq_${Date.now()}`,
            user_id: payment.userId,
            course_id: payment.courseId,
            enrolled_at: new Date().toISOString(),
            status: 'active',
            student_name: payment.userName,
            student_email: payment.userEmail,
          })
        }
      })

      return NextResponse.json({
        success: true,
        data: memoryNequiPayments[idx],
        message: 'Pago confirmado y estudiante matriculado con éxito',
      })
    }

    if (action === 'auto_enroll_payment') {
      const { userEmail, userId, userName, reference, courseId, secretKey } = payload

      // SEGURIDAD: Solo se auto-activa instantáneamente si proviene de un Webhook autenticado con SECRET_KEY
      // De lo contrario, se registra como 'pending' para que el Administrador en /admin confirme el pago real en Nequi
      const isVerifiedByGateway =
        Boolean(secretKey && process.env.PAYMENT_WEBHOOK_SECRET && secretKey === process.env.PAYMENT_WEBHOOK_SECRET)

      mutateStore((state) => {
        let targetUserId = userId
        if (!targetUserId && userEmail) {
          const found = state.users.find(
            (u) => Boolean(u.email) && u.email!.toLowerCase() === userEmail.toLowerCase()
          )
          if (found) {
            targetUserId = found.id
          } else {
            targetUserId = `usr_${Date.now()}`
            state.users.push({
              id: targetUserId,
              email: userEmail,
              full_name: userName || userEmail.split('@')[0],
              first_name: (userName || userEmail).split(' ')[0],
              last_name: '',
              role: 'student',
              avatar_url: null,
              created_at: new Date().toISOString(),
            })
          }
        }

        if (!targetUserId) targetUserId = 'guest_user'

        // Solo matricular si está verificado por pasarela/administrador
        if (isVerifiedByGateway) {
          const coursesToEnroll =
            courseId && courseId !== 'all' && courseId !== 'plan_pro'
              ? state.courses.filter((c) => c.id === courseId)
              : state.courses

          for (const c of coursesToEnroll) {
            const existing = state.enrollments.find(
              (e) => e.user_id === targetUserId && e.course_id === c.id
            )
            if (existing) {
              existing.status = 'active'
            } else {
              state.enrollments.unshift({
                id: `enr_${Date.now()}_${c.id.slice(0, 4)}`,
                user_id: targetUserId,
                course_id: c.id,
                enrolled_at: new Date().toISOString(),
                status: 'active',
                student_name: userName || userEmail || 'Estudiante Matriculado',
                student_email: userEmail,
              })
            }
          }
        }

        // Registrar el pago en la lista de pagos para el Superusuario
        const paymentRecord: NequiPaymentRecord = {
          id: `neq_ret_${Date.now()}`,
          userId: targetUserId,
          userEmail: userEmail || 'estudiante@maestrotech.co',
          userName: userName || 'Docente Aspirante',
          courseId: courseId || 'plan_pro',
          courseTitle: 'Plan Docente Pro (Redirección Nequi)',
          planName: 'Docente Pro',
          amount: 39900,
          currency: 'COP',
          nequiPhone: 'Nequi Retorno',
          nequiReference: reference || `NQ${Math.floor(100000 + Math.random() * 900000)}`,
          provider: 'nequi',
          status: isVerifiedByGateway ? 'completed' : 'pending',
          createdAt: new Date().toISOString(),
          confirmedAt: isVerifiedByGateway ? new Date().toISOString() : undefined,
          confirmedBy: isVerifiedByGateway ? 'Webhook Pasarela Nequi' : undefined,
          notes: isVerifiedByGateway
            ? 'Confirmado por Webhook Criptográfico de Nequi'
            : 'Comprobante reportado vía redirección. Requiere confirmación del Superusuario.',
        }
        memoryNequiPayments.unshift(paymentRecord)
      })

      return NextResponse.json({
        success: true,
        verified: isVerifiedByGateway,
        message: isVerifiedByGateway
          ? 'Pago verificado y matrícula activada automáticamente'
          : 'Comprobante registrado. Queda en cola de verificación del Administrador.',
      })
    }

    return NextResponse.json({ success: false, error: 'Acción no soportada' }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al procesar pago Nequi'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
