/**
 * Script para enviar una o todas las plantillas de correo directamente a tu bandeja de entrada vía Resend
 * Uso:
 *   npx tsx emails/test-send.ts <correo_destino> [plantilla_o_todas]
 * Ejemplo:
 *   npx tsx emails/test-send.ts mi_correo@gmail.com all
 *   npx tsx emails/test-send.ts mi_correo@gmail.com welcome
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';

import ConfirmEmail from './confirm-email';
import Welcome from './welcome';
import ResetPassword from './reset-password';
import ChangeEmail from './change-email';
import PaymentApproved from './payment-confirmation';
import EnrollmentSuccess from './enrollment-success';
import CertificateAvailable from './certificate-delivery';
import CourseCompleted from './course-completed';
import NewCourseLaunch from './new-course-launch';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

const templates = [
  { id: 'confirm-email', name: '1. Confirmación de cuenta', component: ConfirmEmail, subject: 'Estás a un paso de dejar huella — Confirma tu cuenta' },
  { id: 'welcome', name: '2. Bienvenida a Legado Docente', component: Welcome, subject: 'Los grandes docentes dejan huella — Bienvenido a Legado Docente' },
  { id: 'reset-password', name: '3. Recuperación de contraseña', component: ResetPassword, subject: 'Tu futuro sigue intacto — Restablece tu contraseña' },
  { id: 'change-email', name: '4. Cambio de correo', component: ChangeEmail, subject: 'Confirma la actualización de tu correo electrónico' },
  { id: 'payment-approved', name: '5. Pago aprobado', component: PaymentApproved, subject: 'Has invertido en tu futuro — Pago confirmado' },
  { id: 'enrollment-success', name: '6. Matrícula exitosa', component: EnrollmentSuccess, subject: 'Tu próximo capítulo comienza hoy — Matrícula exitosa' },
  { id: 'certificate-available', name: '7. Certificado disponible', component: CertificateAvailable, subject: 'Tu huella ha quedado registrada — Descarga tu certificado' },
  { id: 'course-completed', name: '8. Curso finalizado', component: CourseCompleted, subject: '¡Felicidades por finalizar! — Logro académico completado' },
  { id: 'new-course-launch', name: '9. Lanzamiento de nuevo curso', component: NewCourseLaunch, subject: 'Nunca dejes de aprender — Nuevo programa disponible' },
];

function cleanEmailHtml(raw: string): string {
  let clean = raw;
  clean = clean.replace(/<div[^>]*data-skip-in-text="true"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');
  clean = clean.replace(/<!--\/?\$-->/g, '');
  clean = clean.replace(/<!--\/?(html|head|body)-->/g, '');
  clean = clean.replace(/<!--\s*-->/g, '');
  clean = clean.replace(/<\/\s*([a-zA-Z0-9]+)\s*>/g, '</$1>');
  clean = clean.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');
  return clean.trim();
}

async function main() {
  const targetEmail = process.argv[2] || 'luisalfonso1818@gmail.com';
  const filterId = process.argv[3] || 'welcome';

  console.log(`\n🚀 Enviando correos de prueba vía Resend a: ${targetEmail}`);
  console.log(`   Remitente: Legado Docente <onboarding@resend.dev>`);
  console.log(`   Modo: ${filterId === 'all' ? 'TODAS las 9 plantillas' : `Solo plantilla '${filterId}'`}\n`);

  const listToSend = filterId === 'all' 
    ? templates 
    : templates.filter(t => t.id === filterId);

  if (listToSend.length === 0) {
    console.error(`❌ Plantilla no encontrada: ${filterId}. Disponibles: ${templates.map(t => t.id).join(', ')} o 'all'`);
    process.exit(1);
  }

  for (const tpl of listToSend) {
    try {
      const Element = tpl.component;
      const rawHtml = await render(React.createElement(Element), { pretty: false });
      const html = cleanEmailHtml(rawHtml);
      
      const res = await resend.emails.send({
        from: 'Legado Docente <onboarding@resend.dev>',
        to: targetEmail,
        subject: `[PRUEBA] ${tpl.subject}`,
        html,
      });

      if (res.error) {
        console.error(`❌ Error enviando ${tpl.name}:`, res.error.message);
      } else {
        console.log(`✅ Enviado con éxito: ${tpl.name} (ID Resend: ${res.data?.id})`);
      }
      
      // Breve pausa para no saturar rate limit
      if (listToSend.length > 1) {
        await new Promise(r => setTimeout(r, 1200));
      }
    } catch (err) {
      console.error(`❌ Excepción al enviar ${tpl.name}:`, err);
    }
  }

  console.log('\n✨ Proceso de envío finalizado.');
}

main().catch(console.error);
