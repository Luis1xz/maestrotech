'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Smartphone,
  Monitor,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { TemplateMetadata, EmailLogEntry, EmailTemplateId } from '@/lib/email/transactional';

export default function EmailAdminSection() {
  const { session, user } = useAuth();
  const [templates, setTemplates] = useState<TemplateMetadata[]>([]);
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [hasResend, setHasResend] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'templates' | 'logs' | 'config'>('templates');

  // Preview state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Test email state
  const [testEmail, setTestEmail] = useState(user?.email || 'luisalfonso1818@gmail.com');
  const [sendingTest, setSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Retrying log
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);

  const fetchEmailData = async () => {
    try {
      setLoading(true);
      const token = session?.access_token || '';
      const res = await fetch('/api/admin/emails', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        setLogs(data.logs || []);
        setHasResend(data.hasResendConfigured);
        if (data.templates?.length && !selectedTemplate) {
          setSelectedTemplate(data.templates[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching email data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailData();
  }, [session]);

  const handleSendTest = async (templateId: EmailTemplateId) => {
    if (!testEmail.trim()) return;
    setSendingTest(true);
    setTestFeedback(null);

    try {
      const token = session?.access_token || '';
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'send_test',
          templateId,
          to: testEmail.trim(),
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        const isSimulated = result.status === 'simulated';
        setTestFeedback({
          type: 'success',
          text: isSimulated
            ? `Prueba simulada registrada exitosamente para ${result.recipient}. (Para entrega real por bandeja de entrada, añade RESEND_API_KEY en Vercel/.env.local).`
            : `Correo de prueba enviado exitosamente a ${result.recipient}.`,
        });
        fetchEmailData();
      } else {
        setTestFeedback({
          type: 'error',
          text: result.error || 'Error al enviar correo de prueba.',
        });
      }
    } catch (err: unknown) {
      setTestFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error inesperado.',
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleRetry = async (logId: string) => {
    setRetryingLogId(logId);
    try {
      const token = session?.access_token || '';
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'retry', logId }),
      });
      if (res.ok) {
        fetchEmailData();
      }
    } catch (err) {
      console.error('Error retrying email:', err);
    } finally {
      setRetryingLogId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0038DF]/10 text-[#0038DF] flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#0038DF] font-display flex items-center gap-2">
              Centro de Comunicaciones
              <span className="text-xs bg-[#C99E32]/15 text-[#9C7316] px-2.5 py-0.5 rounded-full font-bold">
                9 Plantillas Oficiales
              </span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Gestión centralizada de correos transaccionales premium de Legado Docente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEmailData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#1E293B] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-[#E2E8F0] gap-4">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'border-[#0038DF] text-[#0038DF]'
              : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Plantillas Oficiales ({templates.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-[#0038DF] text-[#0038DF]'
              : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Historial de Envíos ({logs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'config'
              ? 'border-[#0038DF] text-[#0038DF]'
              : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Eventos & Configuración</span>
        </button>
      </div>

      {/* TAB 1: TEMPLATES & PREVIEW */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Templates list (col-span-5) */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Selecciona una plantilla para previsualizar
            </p>
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {templates.map((tpl) => {
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-[#0038DF] bg-[#0038DF]/5 shadow-sm ring-1 ring-[#0038DF]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#C99E32]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-bold text-[#0F172A] font-display">
                        {tpl.name}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          tpl.handler === 'supabase'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-[#0038DF] border border-blue-200'
                        }`}
                      >
                        {tpl.handler === 'supabase' ? 'Supabase Auth' : 'Backend Resend'}
                      </span>
                    </div>

                    <p className="text-xs text-[#64748B] line-clamp-1 mb-2">
                      {tpl.triggerEvent}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                      <span>Banner: «{tpl.bannerTitle}»</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#0038DF]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Preview Panel (col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedTemplate && (
              <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
                {/* Preview controls bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0F172A] font-display">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Asunto sugerido: «{selectedTemplate.defaultSubject}»
                    </p>
                  </div>

                  {/* Device toggle */}
                  <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        previewDevice === 'desktop'
                          ? 'bg-white text-[#0038DF] shadow-xs'
                          : 'text-[#64748B] hover:text-[#1E293B]'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Escritorio (600px)</span>
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        previewDevice === 'mobile'
                          ? 'bg-white text-[#0038DF] shadow-xs'
                          : 'text-[#64748B] hover:text-[#1E293B]'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Móvil (390px)</span>
                    </button>
                  </div>
                </div>

                {/* Send Test Email Box */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E293B]">
                      Enviar correo de prueba autorizado
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      Marcado como [PRUEBA] · No altera bases de datos
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:outline-none focus:border-[#0038DF]"
                    />
                    <button
                      onClick={() => handleSendTest(selectedTemplate.id)}
                      disabled={sendingTest}
                      className="px-4 py-2 rounded-lg bg-[#0038DF] hover:bg-[#002299] text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingTest ? 'Enviando...' : 'Enviar Prueba'}</span>
                    </button>
                  </div>

                  {testFeedback && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                        testFeedback.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {testFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{testFeedback.text}</span>
                    </div>
                  )}
                </div>

                {/* Iframe Viewport Container */}
                <div className="bg-[#EEF3F9] p-4 rounded-xl flex justify-center items-center overflow-x-auto min-h-[560px]">
                  <div
                    className="transition-all duration-300 bg-white rounded-2xl shadow-xl overflow-hidden border border-[#CBD5E1]"
                    style={{
                      width: previewDevice === 'desktop' ? '600px' : '390px',
                      height: '620px',
                    }}
                  >
                    <iframe
                      src={`/api/admin/emails?action=preview&templateId=${selectedTemplate.id}`}
                      title={selectedTemplate.name}
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SEND LOGS */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] font-display">
                Historial de Comunicaciones
              </h3>
              <p className="text-xs text-[#64748B]">
                Registro de correos enviados, simulados y eventos de reintento.
              </p>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#94A3B8]">
              No hay envíos registrados recientemente. Realiza una prueba para generar un registro.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                    <th className="py-3 px-3 font-bold">Estado</th>
                    <th className="py-3 px-3 font-bold">Plantilla</th>
                    <th className="py-3 px-3 font-bold">Destinatario</th>
                    <th className="py-3 px-3 font-bold">Asunto</th>
                    <th className="py-3 px-3 font-bold">Fecha</th>
                    <th className="py-3 px-3 font-bold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            log.status === 'sent'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.status === 'simulated'
                              ? 'bg-blue-50 text-[#0038DF] border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {log.status === 'sent' && <CheckCircle2 className="w-3 h-3" />}
                          {log.status === 'simulated' && <Info className="w-3 h-3" />}
                          {log.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#1E293B]">
                        {log.templateId}
                        {log.isTest && (
                          <span className="ml-1 text-[10px] text-[#C99E32] font-semibold">
                            (test)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[#334155]">{log.recipient}</td>
                      <td className="py-3 px-3 text-[#64748B] max-w-[220px] truncate">
                        {log.subject}
                      </td>
                      <td className="py-3 px-3 text-[#94A3B8]">
                        {new Date(log.createdAt).toLocaleString('es-CO', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {log.status === 'failed' ? (
                          <button
                            onClick={() => handleRetry(log.id)}
                            disabled={retryingLogId === log.id}
                            className="px-2.5 py-1 rounded-lg bg-[#0038DF] text-white font-bold text-[11px] hover:bg-[#002299] transition-colors cursor-pointer"
                          >
                            {retryingLogId === log.id ? 'Reintentando...' : 'Reintentar'}
                          </button>
                        ) : (
                          <span className="text-[#94A3B8] text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONFIG & TRIGGER MATRIX */}
      {activeTab === 'config' && (
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] font-display">
              Matriz de Activación de Correos Transaccionales
            </h3>
            <p className="text-xs text-[#64748B]">
              Relación entre los eventos del sistema y cada una de las 9 plantillas oficiales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
              <h4 className="text-xs font-bold text-[#0038DF] uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Supabase Auth (3 plantillas)</span>
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Gestionadas nativamente por Supabase Go Templates. Las plantillas HTML se encuentran en{' '}
                <code className="text-[#0038DF] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                  docs/supabase-templates/
                </code>
                .
              </p>
              <ul className="text-xs text-[#1E293B] space-y-1 list-disc list-inside">
                <li>Confirmación de cuenta (Confirm signup)</li>
                <li>Recuperación de contraseña (Reset password)</li>
                <li>Cambio de correo electrónico (Change Email Address)</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
              <h4 className="text-xs font-bold text-[#0038DF] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Backend Transaccional / Resend (6 plantillas)</span>
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Gestionadas por la capa centralizada en{' '}
                <code className="text-[#0038DF] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                  lib/email/transactional.ts
                </code>
                . Validadas con idempotencia y listas para producción.
              </p>
              <ul className="text-xs text-[#1E293B] space-y-1 list-disc list-inside">
                <li>Bienvenida a Legado Docente</li>
                <li>Pago aprobado (integrable con Wompi/Nequi)</li>
                <li>Matrícula exitosa</li>
                <li>Certificado disponible</li>
                <li>Curso finalizado</li>
                <li>Lanzamiento de nuevo curso</li>
              </ul>
            </div>
          </div>

          {/* Social Media & Footer Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold">Política oficial de enlaces institucionales en el pie de página:</p>
            <p className="leading-relaxed">
              Actualmente Legado Docente <strong>no cuenta con redes sociales</strong> oficiales. Por esa razón,
              los iconos de redes sociales están desactivados por diseño en todas las plantillas. El pie de
              página muestra exclusivamente enlaces verificados a <em>Inicio</em>, <em>Aula virtual</em> y{' '}
              <em>Soporte WhatsApp</em>, junto al año dinámico y el distintivo de Colombia.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
