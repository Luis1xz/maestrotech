import { NextRequest, NextResponse } from 'next/server';
import { sendTransactionalEmail } from '@/lib/email/transactional';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, name } = body || {};

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email requerido' }, { status: 400 });
    }

    const studentName = name || email.split('@')[0] || 'Docente';

    // Enviar correo de bienvenida con clave de idempotencia única por usuario
    const result = await sendTransactionalEmail({
      templateId: 'welcome',
      recipient: email,
      data: {
        studentName,
        dashboardUrl: `${req.nextUrl.origin}/?view=dashboard`,
      },
      idempotencyKey: `welcome_${userId || email}`,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.warn('[api/auth/welcome] Error enviando bienvenida:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error enviando bienvenida' },
      { status: 500 }
    );
  }
}
