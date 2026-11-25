/**
 * Export Supabase Auth email templates to static HTML
 *
 * Renders the 3 auth-related templates (confirm-email, reset-password, change-email)
 * and writes them as standalone HTML files ready to paste into Supabase Dashboard.
 *
 * Usage:  npx tsx emails/export-supabase.ts
 * Output: docs/supabase-templates/*.html
 */

import { render } from '@react-email/render';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import ConfirmEmail from './confirm-email';
import ResetPassword from './reset-password';
import ChangeEmail from './change-email';

const OUTPUT_DIR = join(__dirname, '..', 'docs', 'supabase-templates');

const templates = [
  { name: 'confirm-email', component: ConfirmEmail, label: 'Confirmación de correo' },
  { name: 'reset-password', component: ResetPassword, label: 'Recuperación de contraseña' },
  { name: 'change-email', component: ChangeEmail, label: 'Cambio de correo' },
] as const;

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('\n🎨 Legado Docente — Exportando plantillas para Supabase Auth\n');

  for (const tpl of templates) {
    const Element = tpl.component;
    const html = await render(<Element />, { pretty: true });

    const outPath = join(OUTPUT_DIR, `${tpl.name}.html`);
    writeFileSync(outPath, html, 'utf-8');
    console.log(`  ✅ ${tpl.label} → ${outPath}`);
  }

  console.log('\n✨ ¡Listo! Copia el contenido de cada archivo HTML en Supabase Dashboard:');
  console.log('   Auth → Email Templates → (Confirm signup / Reset password / Change Email Address)\n');
}

main().catch(console.error);
