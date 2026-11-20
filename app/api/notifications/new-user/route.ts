import { NextRequest, NextResponse } from 'next/server'
import { notifyAdminNewUser, sendStudentWelcome, isMailerConfigured } from '@/lib/email/mailer'
import { CandidateNotificationData } from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fullName,
      firstName,
      lastName,
      email,
      phoneNumber,
      department,
      targetRole,
      educationLevel,
      academicTitle,
      workExperience,
    } = body

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido.' },
        { status: 400 }
      )
    }

    const computedFullName =
      fullName || [firstName, lastName].filter(Boolean).join(' ') || 'Docente Aspirante'
    const computedFirstName = firstName || computedFullName.split(' ')[0] || 'Colega'

    const candidateData: CandidateNotificationData = {
      fullName: computedFullName,
      firstName: computedFirstName,
      lastName,
      email: email.trim().toLowerCase(),
      phoneNumber,
      department,
      targetRole,
      educationLevel,
      academicTitle,
      workExperience,
      registeredAt: new Date().toISOString(),
    }

    const isConfigured = isMailerConfigured()

    // Enviar en paralelo la alerta al administrador y la bienvenida al estudiante
    const [adminResult, studentResult] = await Promise.allSettled([
      notifyAdminNewUser(candidateData),
      sendStudentWelcome({
        firstName: computedFirstName,
        email: email.trim().toLowerCase(),
      }),
    ])

    const adminOk = adminResult.status === 'fulfilled' && adminResult.value.success
    const studentOk = studentResult.status === 'fulfilled' && studentResult.value.success

    return NextResponse.json({
      success: true,
      isConfigured,
      adminNotified: adminOk,
      studentNotified: studentOk,
      details: {
        admin: adminResult.status === 'fulfilled' ? adminResult.value : null,
        student: studentResult.status === 'fulfilled' ? studentResult.value : null,
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al procesar la notificación'
    console.error('[api/notifications/new-user] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
