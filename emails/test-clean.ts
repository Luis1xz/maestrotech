import { render } from '@react-email/render';
import React from 'react';
import { Resend } from 'resend';
import Welcome from './welcome';

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

async function main() {
  const resend = new Resend(process.env.RESEND_API_KEY || '');
  
  // Render without pretty true to avoid broken multiline closing tags
  const rawHtml = await render(React.createElement(Welcome), { pretty: false });
  const cleanHtml = cleanEmailHtml(rawHtml);
  
  console.log('Original length:', rawHtml.length, 'Clean length:', cleanHtml.length);
  console.log('Snippet of first 200 chars:');
  console.log(cleanHtml.slice(0, 200));

  const res = await resend.emails.send({
    from: 'Legado Docente <onboarding@resend.dev>',
    to: 'luisalfonso1818@gmail.com',
    subject: '🌟 Prueba limpia definitiva — Bienvenido a Legado Docente',
    html: cleanHtml,
  });

  console.log('Send result:', res);
}

main().catch(console.error);
