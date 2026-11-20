import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, isMailerConfigured } from '@/lib/email/mailer'
import { buildAdminNewUserAlertHtml, buildStudentWelcomeHtml } from '@/lib/email/templates'

export async function GET(req: NextRequest) {
  try {
    const isConfigured = isMailerConfigured()
    const targetEmail = (
      req.nextUrl.searchParams.get('to') ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.SMTP_USER ||
      'luisalfonso1818@gmail.com'
    ).trim()

    const type = req.nextUrl.searchParams.get('type') || 'admin'

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        isConfigured: false,
        message:
          'El envío de correos reales requiere configurar SMTP_PASS en .env.local (Contraseña de aplicación de Google de 16 letras).',
        instruction:
          '1. Ve a tu cuenta de Google > Seguridad > Contraseñas de aplicaciones. 2. Crea una con nombre "Legado Docente". 3. Añade SMTP_PASS=tu_clave_16_caracteres en .env.local y en Vercel.',
      })
    }

    let html: string
    let subject: string

    if (type === 'welcome') {
      subject = '🧪 [Prueba] ¡Bienvenido a Legado Docente!'
      html = buildStudentWelcomeHtml({
        firstName: 'Profesor de Prueba',
        email: targetEmail,
      })
    } else {
      subject = '🧪 [Prueba de Sistema] Alerta de Nuevo Aspirante en Legado Docente'
      html = buildAdminNewUserAlertHtml({
        fullName: 'Profesor de Prueba CNSC',
        firstName: 'Profesor',
        lastName: 'de Prueba',
        email: targetEmail,
        phoneNumber: '3101234567',
        department: 'Cundinamarca (Bogotá D.C.)',
        targetRole: 'docente_aula',
        educationLevel: 'Licenciatura en Educación',
        academicTitle: 'Licenciado en Ciencias Naturales',
        workExperience: '3 a 5 años',
        registeredAt: new Date().toISOString(),
      })
    }

    const res = await sendEmail({
      to: targetEmail,
      subject,
      html,
      fromName: 'Legado Docente (Prueba de Sistema)',
    })

    return NextResponse.json({
      success: res.success,
      isConfigured: true,
      deliveredTo: targetEmail,
      messageId: res.messageId,
      error: res.error,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido al probar el correo'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
