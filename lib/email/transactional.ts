import { render } from '@react-email/render';
import React from 'react';
import { Resend } from 'resend';
import path from 'path';
import fs from 'fs';
import os from 'os';

import ConfirmEmail from '@/emails/confirm-email';
import Welcome from '@/emails/welcome';
import ResetPassword from '@/emails/reset-password';
import PasswordChanged from '@/emails/password-changed';
import ChangeEmail from '@/emails/change-email';
import PaymentApproved from '@/emails/payment-confirmation';
import EnrollmentSuccess from '@/emails/enrollment-success';
import CertificateAvailable from '@/emails/certificate-delivery';
import CourseCompleted from '@/emails/course-completed';
import NewCourseLaunch from '@/emails/new-course-launch';

export type EmailTemplateId =
  | 'confirm-email'
  | 'welcome'
  | 'reset-password'
  | 'password-changed'
  | 'change-email'
  | 'payment-approved'
  | 'enrollment-success'
  | 'certificate-available'
  | 'course-completed'
  | 'new-course-launch';

export interface EmailLogEntry {
  id: string;
  templateId: EmailTemplateId;
  recipient: string;
  subject: string;
  status: 'sent' | 'simulated' | 'failed';
  isTest?: boolean;
  error?: string | null;
  idempotencyKey?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface TemplateMetadata {
  id: EmailTemplateId;
  name: string;
  triggerEvent: string;
  bannerTitle: string;
  buttonLabel: string;
  handler: 'supabase' | 'resend';
  defaultSubject: string;
  sampleData: Record<string, unknown>;
}

export const OFFICIAL_TEMPLATES: Record<EmailTemplateId, TemplateMetadata> = {
  'reset-password': {
    id: 'reset-password',
    name: 'Recuperación de contraseña',
    triggerEvent: 'Solicitud de restablecimiento de contraseña en el login',
    bannerTitle: 'Tu futuro sigue intacto',
    buttonLabel: 'Crear nueva contraseña',
    handler: 'supabase',
    defaultSubject: 'Restablece tu contraseña de Legado Docente',
    sampleData: {},
  },
  'password-changed': {
    id: 'password-changed',
    name: 'Contraseña cambiada',
    triggerEvent: 'Contraseña actualizada exitosamente',
    bannerTitle: 'Tu contraseña ha sido cambiada',
    buttonLabel: 'Iniciar sesión en mi cuenta',
    handler: 'resend',
    defaultSubject: 'Tu contraseña ha sido cambiada — Legado Docente',
    sampleData: {
      studentName: 'Docente Carlos Mendoza',
    },
  },
  'confirm-email': {
    id: 'confirm-email',
    name: 'Confirmación de cuenta',
    triggerEvent: 'Registro de nuevo usuario mediante correo y contraseña',
    bannerTitle: 'Estás a un paso de dejar huella',
    buttonLabel: 'Confirmar mi cuenta',
    handler: 'supabase',
    defaultSubject: 'Confirma tu cuenta en Legado Docente',
    sampleData: {},
  },
  'welcome': {
    id: 'welcome',
    name: 'Bienvenida a Legado Docente',
    triggerEvent: 'Cuenta activada correctamente tras confirmar correo o primer acceso',
    bannerTitle: 'Los grandes docentes dejan huella',
    buttonLabel: 'Explorar mi aula virtual',
    handler: 'resend',
    defaultSubject: '¡Bienvenido a Legado Docente!',
    sampleData: { userName: 'Docente Carlos Mendoza' },
  },
  'payment-approved': {
    id: 'payment-approved',
    name: 'Pago aprobado',
    triggerEvent: 'Transacción verificada y aprobada por pasarela (Wompi / Nequi)',
    bannerTitle: 'Has invertido en tu futuro',
    buttonLabel: 'Ver mi compra',
    handler: 'resend',
    defaultSubject: 'Tu pago ha sido confirmado — Legado Docente',
    sampleData: {
      userName: 'Docente Carlos Mendoza',
      courseName: 'Curso Integral Concurso Docente 140h',
      amount: '$297.000',
      currency: 'COP',
      paymentDate: '25 de noviembre de 2026',
      reference: 'LD-TX-2026-9812',
    },
  },
  'enrollment-success': {
    id: 'enrollment-success',
    name: 'Matrícula exitosa',
    triggerEvent: 'Matrícula creada exitosamente en base de datos (automática o admin)',
    bannerTitle: 'Tu próximo capítulo comienza hoy',
    buttonLabel: 'Comenzar mi formación',
    handler: 'resend',
    defaultSubject: '¡Matrícula activa! Ya puedes acceder a tu curso',
    sampleData: {
      userName: 'Docente Carlos Mendoza',
      courseName: 'Curso Integral Concurso Docente 140h',
      enrollmentDate: '25 de noviembre de 2026',
    },
  },
  'certificate-available': {
    id: 'certificate-available',
    name: 'Certificado disponible',
    triggerEvent: 'Aprobación y emisión de certificado oficial de finalización',
    bannerTitle: 'Tu esfuerzo merece ser reconocido',
    buttonLabel: 'Ver mi certificado',
    handler: 'resend',
    defaultSubject: 'Tu certificado oficial está listo para descargar',
    sampleData: {
      userName: 'Docente Carlos Mendoza',
      courseName: 'Curso Integral Concurso Docente 140h',
      duration: '140 horas académicas',
      certificateCode: 'CERT-LD-2026-00456',
      certificateUrl: 'https://legadodocente.com/?view=dashboard',
    },
  },
  'course-completed': {
    id: 'course-completed',
    name: 'Curso finalizado',
    triggerEvent: 'Estudiante completa el 100% de los módulos y evaluaciones del curso',
    bannerTitle: 'Tu esfuerzo se convierte en legado',
    buttonLabel: 'Ver mis logros',
    handler: 'resend',
    defaultSubject: '¡Felicitaciones por finalizar tu curso en Legado Docente!',
    sampleData: {
      userName: 'Docente Carlos Mendoza',
      courseName: 'Curso Integral Concurso Docente 140h',
      completionDate: '25 de noviembre de 2026',
    },
  },
  'change-email': {
    id: 'change-email',
    name: 'Cambio de correo electrónico',
    triggerEvent: 'Solicitud de actualización de dirección de correo en perfil',
    bannerTitle: 'Tu identidad, siempre protegida',
    buttonLabel: 'Confirmar nuevo correo',
    handler: 'supabase',
    defaultSubject: 'Confirma tu nueva dirección de correo en Legado Docente',
    sampleData: {},
  },
  'new-course-launch': {
    id: 'new-course-launch',
    name: 'Lanzamiento de nuevo curso',
    triggerEvent: 'Campaña o notificación de apertura de nuevo programa formativo',
    bannerTitle: 'Nunca dejes de aprender',
    buttonLabel: 'Descubrir el programa',
    handler: 'resend',
    defaultSubject: 'Nuevo programa formativo en Legado Docente',
    sampleData: {
      userName: 'Docente Carlos Mendoza',
      courseName: 'Simulacro Especial de Prueba Pedagógica 2026',
      description: 'Entrenamiento intensivo en resolución de casos y competencias pedagógicas.',
      duration: '40 horas prácticas',
      price: '$149.000 COP',
      courseUrl: 'https://legadodocente.com/?view=courses',
    },
  },
};

// Logs persistence file
const LOGS_FILE = path.join(os.tmpdir(), 'legadodocente-email-logs.json');

export function getEmailLogs(): EmailLogEntry[] {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const raw = fs.readFileSync(LOGS_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[getEmailLogs] Error reading logs:', err);
  }
  return [];
}

export function saveEmailLog(entry: EmailLogEntry) {
  try {
    const logs = getEmailLogs();
    logs.unshift(entry);
    // Keep last 150 logs
    const trimmed = logs.slice(0, 150);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(trimmed, null, 2), 'utf8');
  } catch (err) {
    console.error('[saveEmailLog] Error saving log:', err);
  }
}

/**
 * Clean HTML output for maximum compatibility with Gmail, Outlook, Apple Mail and Supabase
 */
export function cleanEmailHtml(raw: string): string {
  let clean = raw;
  // 1. Remove preview container with zero-width characters that break Gmail / Go parser
  clean = clean.replace(/<div[^>]*data-skip-in-text="true"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');
  // 2. Remove React Suspense & hydration comments
  clean = clean.replace(/<!--\/?\$-->/g, '');
  clean = clean.replace(/<!--\/?(html|head|body)-->/g, '');
  clean = clean.replace(/<!--\s*-->/g, '');
  // 3. Fix any multiline closing tags like </a \n > or </span \n >
  clean = clean.replace(/<\/\s*([a-zA-Z0-9]+)\s*>/g, '</$1>');
  // 4. Clean zero-width control chars if any remain
  clean = clean.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');
  return clean.trim();
}

/**
 * Render any of the 9 templates to static HTML string
 */
export async function renderEmailTemplate(
  templateId: EmailTemplateId,
  data?: Record<string, unknown>
): Promise<string> {
  const mergedData = { ...(OFFICIAL_TEMPLATES[templateId]?.sampleData || {}), ...(data || {}) };

  let rawHtml: string;
  switch (templateId) {
    case 'confirm-email':
      rawHtml = await render(React.createElement(ConfirmEmail), { pretty: false });
      break;
    case 'welcome':
      rawHtml = await render(React.createElement(Welcome, mergedData), { pretty: false });
      break;
    case 'reset-password':
      rawHtml = await render(React.createElement(ResetPassword), { pretty: false });
      break;
    case 'password-changed':
      rawHtml = await render(React.createElement(PasswordChanged, mergedData), { pretty: false });
      break;
    case 'change-email':
      rawHtml = await render(React.createElement(ChangeEmail), { pretty: false });
      break;
    case 'payment-approved':
      rawHtml = await render(React.createElement(PaymentApproved, mergedData), { pretty: false });
      break;
    case 'enrollment-success':
      rawHtml = await render(React.createElement(EnrollmentSuccess, mergedData), { pretty: false });
      break;
    case 'certificate-available':
      rawHtml = await render(React.createElement(CertificateAvailable, mergedData), { pretty: false });
      break;
    case 'course-completed':
      rawHtml = await render(React.createElement(CourseCompleted, mergedData), { pretty: false });
      break;
    case 'new-course-launch':
      rawHtml = await render(React.createElement(NewCourseLaunch, mergedData), { pretty: false });
      break;
    default:
      throw new Error(`Plantilla desconocida: ${templateId}`);
  }

  return cleanEmailHtml(rawHtml);
}

export interface SendEmailOptions {
  templateId: EmailTemplateId;
  to: string;
  subject?: string;
  data?: Record<string, unknown>;
  idempotencyKey?: string;
  isTest?: boolean;
}

/**
 * Central transactional email sender
 * - Validates email
 * - Enforces idempotency (no duplicate sends within recent window)
 * - Renders official React Email template
 * - Sends via Resend if RESEND_API_KEY is configured, or simulates safely
 * - Records log entry
 */
export async function sendTransactionalEmail(opts: SendEmailOptions): Promise<{
  success: boolean;
  status: 'sent' | 'simulated' | 'failed';
  logId: string;
  error?: string;
}> {
  const { templateId, to, data = {}, idempotencyKey, isTest = false } = opts;
  const tpl = OFFICIAL_TEMPLATES[templateId];

  // 1. Email validation
  const cleanEmail = to.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      success: false,
      status: 'failed',
      logId: 'invalid-email',
      error: `Dirección de correo inválida: ${to}`,
    };
  }

  // 2. Idempotency / duplicate check (avoid duplicate sends within last 5 minutes)
  if (idempotencyKey) {
    const existingLogs = getEmailLogs();
    const alreadySent = existingLogs.find(
      (l) => l.idempotencyKey === idempotencyKey && l.status === 'sent'
    );
    if (alreadySent) {
      console.log(`[sendTransactionalEmail] Envío duplicado evitado por idempotencyKey: ${idempotencyKey}`);
      return {
        success: true,
        status: alreadySent.status,
        logId: alreadySent.id,
      };
    }
  }

  const logId = `eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const subject = opts.subject || tpl?.defaultSubject || 'Comunicado Legado Docente';

  try {
    const html = await renderEmailTemplate(templateId, data);
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && !resendApiKey.startsWith('placeholder')) {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Legado Docente <soporte@legadodocente.com>';

      const sendResult = await resend.emails.send({
        from: fromEmail,
        to: cleanEmail,
        subject: isTest ? `[PRUEBA] ${subject}` : subject,
        html,
      });

      if (sendResult.error) {
        throw new Error(sendResult.error.message || 'Error desconocido de Resend');
      }

      saveEmailLog({
        id: logId,
        templateId,
        recipient: cleanEmail,
        subject: isTest ? `[PRUEBA] ${subject}` : subject,
        status: 'sent',
        isTest,
        idempotencyKey,
        data,
        createdAt: new Date().toISOString(),
      });

      return { success: true, status: 'sent', logId };
    } else {
      // Development / test simulation mode (Resend key not yet added to .env)
      console.log(
        `[SIMULACIÓN ENVÍO CORREO] ${isTest ? '[TEST]' : ''} A: ${cleanEmail} | Plantilla: ${templateId} | Asunto: ${subject}`
      );

      saveEmailLog({
        id: logId,
        templateId,
        recipient: cleanEmail,
        subject: isTest ? `[SIMULACIÓN PRUEBA] ${subject}` : `[SIMULACIÓN] ${subject}`,
        status: 'simulated',
        isTest,
        idempotencyKey,
        data,
        createdAt: new Date().toISOString(),
      });

      return { success: true, status: 'simulated', logId };
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Error inesperado';
    console.error(`[sendTransactionalEmail] Error:`, errMsg);

    saveEmailLog({
      id: logId,
      templateId,
      recipient: cleanEmail,
      subject,
      status: 'failed',
      isTest,
      error: errMsg,
      idempotencyKey,
      data,
      createdAt: new Date().toISOString(),
    });

    return {
      success: false,
      status: 'failed',
      logId,
      error: errMsg,
    };
  }
}
