import { NextRequest, NextResponse } from 'next/server'
import { mutateStore } from '@/lib/platform-store-server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ success: false, error: 'JSON inválido' }, { status: 400 })
    }

    // Wompi envía eventos con formato: { event: "transaction.updated", data: { transaction: { ... } } }
    const transaction = body?.data?.transaction

    if (!transaction) {
      return NextResponse.json({ success: true, message: 'Evento recibido sin datos de transacción' })
    }

    const { id, status, reference, customer_email, amount_in_cents } = transaction

    // Verificación criptográfica si WOMPI_EVENT_SECRET está configurado
    const eventSecret = process.env.WOMPI_EVENT_SECRET || process.env.PAYMENT_WEBHOOK_SECRET
    if (eventSecret && body.signature?.checksum && Array.isArray(body.signature?.properties)) {
      const concatValues =
        body.signature.properties
          .map((prop: string) => {
            const parts = prop.split('.')
            let val: any = body.data
            for (const p of parts) val = val?.[p]
            return val
          })
          .join('') +
        body.timestamp +
        eventSecret

      const calculatedChecksum = crypto.createHash('sha256').update(concatValues).digest('hex')
      if (calculatedChecksum.toLowerCase() !== body.signature.checksum.toLowerCase()) {
        return NextResponse.json({ success: false, error: 'Firma de evento inválida' }, { status: 401 })
      }
    }

    if (status === 'APPROVED') {
      const email = customer_email || 'estudiante@maestrotech.co'

      // Registrar y activar directamente en el store de la plataforma
      mutateStore((state) => {
        let user = state.users.find((u) => Boolean(u.email) && u.email!.toLowerCase() === email.toLowerCase())
        if (!user) {
          const newUserId = `usr_${Date.now()}`
          user = {
            id: newUserId,
            email: email,
            full_name: email.split('@')[0],
            first_name: email.split('@')[0],
            last_name: '',
            role: 'student',
            avatar_url: null,
            created_at: new Date().toISOString(),
          }
          state.users.push(user)
        }

        // Matricular en todos los cursos
        for (const c of state.courses) {
          const existing = state.enrollments.find((e) => e.user_id === user!.id && e.course_id === c.id)
          if (existing) {
            existing.status = 'active'
          } else {
            state.enrollments.unshift({
              id: `enr_${Date.now()}_${c.id.slice(0, 4)}`,
              user_id: user!.id,
              course_id: c.id,
              enrolled_at: new Date().toISOString(),
              status: 'active',
              student_name: user.full_name || email,
              student_email: email,
            })
          }
        }
      })

      // Delegar registro a /api/payments/nequi con autenticación interna
      const baseUrl = req.nextUrl.origin
      await fetch(`${baseUrl}/api/payments/nequi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auto_enroll_payment',
          payload: {
            userEmail: email,
            userName: email.split('@')[0],
            reference: id || reference,
            courseId: 'all',
            secretKey: 'internal_webhook_auth',
          },
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ status: 'success', message: 'Evento procesado correctamente' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error procesando webhook'
    return NextResponse.json({ status: 'error', message: msg }, { status: 500 })
  }
}
