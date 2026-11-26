/**
 * Export official email templates for Supabase Auth and generate static preview HTML
 * Usage: npx tsx emails/export-supabase.tsx
 */

import { render } from '@react-email/render';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import ConfirmEmail from './confirm-email';
import ResetPassword from './reset-password';
import PasswordChanged from './password-changed';
import ChangeEmail from './change-email';
import Welcome from './welcome';
import PaymentApproved from './payment-confirmation';
import EnrollmentSuccess from './enrollment-success';
import CertificateAvailable from './certificate-delivery';
import CourseCompleted from './course-completed';
import NewCourseLaunch from './new-course-launch';

const SUPABASE_DIR = join(__dirname, '..', 'docs', 'supabase-templates');
const PREVIEWS_DIR = join(__dirname, '..', 'docs', 'email-previews');

function sanitizeForSupabase(rawHtml: string): string {
  let clean = rawHtml;
  // 1. Remove preview container with zero-width spaces that break Go template parser / Supabase iframe
  clean = clean.replace(/<div[^>]*data-skip-in-text="true"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');
  // 2. Remove React Suspense & hydration comments
  clean = clean.replace(/<!--\/?\$-->/g, '');
  clean = clean.replace(/<!--\/?(html|head|body)-->/g, '');
  clean = clean.replace(/<!--\s*-->/g, '');
  // 3. Deduplicate meta
  clean = clean.replace(/<meta name="x-apple-disable-message-reformatting" \/>\s*<meta name="x-apple-disable-message-reformatting" \/>/g, '<meta name="x-apple-disable-message-reformatting" />');
  return clean.trim();
}

const supabaseAuthTemplates = [
  { name: 'confirm-email', component: ConfirmEmail, label: 'Confirmación de cuenta (Auth)' },
  { name: 'reset-password', component: ResetPassword, label: 'Recuperación de contraseña (Auth)' },
  { name: 'password-changed', component: PasswordChanged, label: 'Contraseña cambiada (Seguridad)' },
  { name: 'change-email', component: ChangeEmail, label: 'Cambio de correo electrónico (Auth)' },
] as const;

const allOfficialTemplates = [
  { name: 'confirm-email', component: ConfirmEmail, label: '1. Confirmación de cuenta' },
  { name: 'welcome', component: Welcome, label: '2. Bienvenida a Legado Docente' },
  { name: 'reset-password', component: ResetPassword, label: '3. Recuperación de contraseña' },
  { name: 'password-changed', component: PasswordChanged, label: '3b. Contraseña cambiada' },
  { name: 'change-email', component: ChangeEmail, label: '4. Cambio de correo electrónico' },
  { name: 'payment-approved', component: PaymentApproved, label: '5. Pago aprobado' },
  { name: 'enrollment-success', component: EnrollmentSuccess, label: '6. Matrícula exitosa' },
  { name: 'certificate-available', component: CertificateAvailable, label: '7. Certificado disponible' },
  { name: 'course-completed', component: CourseCompleted, label: '8. Curso finalizado' },
  { name: 'new-course-launch', component: NewCourseLaunch, label: '9. Lanzamiento de nuevo curso' },
] as const;

async function main() {
  mkdirSync(SUPABASE_DIR, { recursive: true });
  mkdirSync(PREVIEWS_DIR, { recursive: true });

  console.log('\n🎨 LEGADO DOCENTE — Exportando Plantillas Oficiales de Correo\n');

  // 1. Export Supabase Auth templates (preserving Go template tags {{ .ConfirmationURL }})
  console.log('📌 1. Plantillas de autenticación para Supabase:');
  for (const tpl of supabaseAuthTemplates) {
    const Element = tpl.component;
    const rawHtml = await render(<Element />, { pretty: false });
    const cleanHtml = sanitizeForSupabase(rawHtml);
    const outPath = join(SUPABASE_DIR, `${tpl.name}.html`);
    writeFileSync(outPath, cleanHtml, 'utf-8');
    console.log(`   ✅ ${tpl.label} -> ${outPath}`);
  }

  // 2. Export all 9 official templates for preview and Resend
  console.log('\n📌 2. Vistas previas HTML de las 9 plantillas oficiales:');
  for (const tpl of allOfficialTemplates) {
    const Element = tpl.component;
    const rawHtml = await render(<Element />, { pretty: false });
    const cleanHtml = sanitizeForSupabase(rawHtml);
    const outPath = join(PREVIEWS_DIR, `${tpl.name}.html`);
    writeFileSync(outPath, cleanHtml, 'utf-8');
    console.log(`   📄 ${tpl.label} -> ${outPath}`);
  }

  console.log('\n✨ Exportación completada con éxito.');
}

main().catch(console.error);
