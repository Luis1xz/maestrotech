import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/supabase/server';
import {
  OFFICIAL_TEMPLATES,
  EmailTemplateId,
  getEmailLogs,
  sendTransactionalEmail,
  renderEmailTemplate,
} from '@/lib/email/transactional';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authVerification = await verifyAdminRequest(authHeader);

    if (!authVerification.authorized) {
      return NextResponse.json(
        { error: authVerification.error || 'No autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const templateId = searchParams.get('templateId') as EmailTemplateId | null;

    // Preview action: return rendered HTML
    if (action === 'preview' && templateId && OFFICIAL_TEMPLATES[templateId]) {
      const html = await renderEmailTemplate(templateId);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // Default: return templates metadata and recent send logs
    const templates = Object.values(OFFICIAL_TEMPLATES);
    const logs = getEmailLogs();
    const hasResend = Boolean(
      process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('placeholder')
    );

    return NextResponse.json({
      success: true,
      hasResendConfigured: hasResend,
      templates,
      logs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authVerification = await verifyAdminRequest(authHeader);

    if (!authVerification.authorized) {
      return NextResponse.json(
        { error: authVerification.error || 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, templateId, to, data } = body;

    // Send Test Email
    if (action === 'send_test') {
      if (!templateId || !OFFICIAL_TEMPLATES[templateId as EmailTemplateId]) {
        return NextResponse.json(
          { error: 'Plantilla de correo inválida.' },
          { status: 400 }
        );
      }

      const targetEmail = (to || authVerification.user?.email || 'luisalfonso1818@gmail.com').trim();
      const res = await sendTransactionalEmail({
        templateId: templateId as EmailTemplateId,
        to: targetEmail,
        isTest: true,
        data: data || undefined,
      });

      return NextResponse.json({
        success: res.success,
        status: res.status,
        logId: res.logId,
        error: res.error,
        recipient: targetEmail,
      });
    }

    // Retry Failed Email
    if (action === 'retry') {
      const { logId } = body;
      const logs = getEmailLogs();
      const targetLog = logs.find((l) => l.id === logId);

      if (!targetLog) {
        return NextResponse.json({ error: 'Registro de correo no encontrado.' }, { status: 404 });
      }

      const res = await sendTransactionalEmail({
        templateId: targetLog.templateId,
        to: targetLog.recipient,
        subject: targetLog.subject,
        data: targetLog.data,
        isTest: targetLog.isTest,
      });

      return NextResponse.json({
        success: res.success,
        status: res.status,
        logId: res.logId,
        error: res.error,
      });
    }

    return NextResponse.json({ error: 'Acción no soportada.' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
