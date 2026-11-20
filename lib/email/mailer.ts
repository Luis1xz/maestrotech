/**
 * Motor de Envío de Correos Electrónicos - LEGADO DOCENTE
 * Soporta Gmail SMTP (usando Contraseña de Aplicación), Outlook o cualquier servidor SMTP estándar.
 */

import nodemailer from 'nodemailer'
import {
  buildAdminNewUserAlertHtml,
  buildStudentWelcomeHtml,
  buildPaymentAlertHtml,
  CandidateNotificationData,
  WelcomeEmailData,
} from './templates'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  fromName?: string
  replyTo?: string
}

export function isMailerConfigured(): boolean {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD
  return Boolean(user && pass)
}

function getTransporter() {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || 'luisalfonso1818@gmail.com').trim()
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '')
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim()
  const port = Number(process.env.SMTP_PORT || 465)
  const secure = process.env.SMTP_SECURE !== 'false' && port === 465

  if (!pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
}

/**
 * Envío genérico de correo electrónico
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  fromName = 'Legado Docente',
  replyTo,
}: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const user = (process.env.SMTP_USER || process.env.GMAIL_USER || 'luisalfonso1818@gmail.com').trim()
    const transporter = getTransporter()

    if (!transporter) {
      console.warn(
        '[mailer] SMTP no configurado: falta SMTP_PASS (Contraseña de aplicación de Google). ' +
        `Simulando envío a ${Array.isArray(to) ? to.join(', ') : to} con asunto: "${subject}"`
      )
      return {
        success: false,
        error: 'SMTP_PASS no está configurado en las variables de entorno.',
      }
    }

    const fromAddress = `"${fromName}" <${user}>`
    const recipients = Array.isArray(to) ? to.join(', ') : to

    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipients,
      replyTo: replyTo || user,
      subject,
      html,
      text: text || subject,
    })

    console.log(`[mailer] Correo enviado exitosamente a: ${recipients} | ID: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido al enviar correo'
    console.error('[mailer] Error al enviar correo:', msg)
    return { success: false, error: msg }
  }
}

/**
 * Notifica al Administrador sobre un nuevo usuario / aspirante registrado
 */
export async function notifyAdminNewUser(candidate: CandidateNotificationData) {
  const adminEmail = (
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.SMTP_USER ||
    'luisalfonso1818@gmail.com'
  ).trim()

  const subject = `✨ [Nuevo Aspirante] ${candidate.fullName} se ha registrado en Legado Docente`
  const html = buildAdminNewUserAlertHtml(candidate)

  return sendEmail({
    to: adminEmail,
    subject,
    html,
    fromName: 'Legado Docente Alertas',
    replyTo: candidate.email,
  })
}

/**
 * Envía el correo de bienvenida de prestigio al estudiante
 */
export async function sendStudentWelcome(student: WelcomeEmailData) {
  const subject = `🎓 ¡Bienvenido(a) a Legado Docente, ${student.firstName}! Tu camino al nombramiento comienza hoy`
  const html = buildStudentWelcomeHtml(student)

  return sendEmail({
    to: student.email,
    subject,
    html,
    fromName: 'Legado Docente Oficial',
  })
}

/**
 * Notifica al Administrador sobre un pago / comprobante registrado
 */
export async function notifyAdminPayment(paymentData: {
  fullName: string
  email: string
  planName: string
  amount: string
  reference: string
  phoneNumber?: string
}) {
  const adminEmail = (
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.SMTP_USER ||
    'luisalfonso1818@gmail.com'
  ).trim()

  const subject = `💳 [Pago Recibido] Comprobante de ${paymentData.fullName} (${paymentData.planName})`
  const html = buildPaymentAlertHtml(paymentData)

  return sendEmail({
    to: adminEmail,
    subject,
    html,
    fromName: 'Legado Docente Pagos',
    replyTo: paymentData.email,
  })
}
