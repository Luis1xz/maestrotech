'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Mail,
  Home,
  Lock,
} from 'lucide-react'
import AIMentor from '@/components/ai-mentor'
import CelebrationParticles from '@/components/celebration-particles'
import { useAuth, AuthProvider } from '@/hooks/use-auth'
import { NEQUI_CONFIG } from '@/services/payments'
import Link from 'next/link'

function PagoConfirmadoContent() {
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()

  const rawRef =
    searchParams.get('ref') ||
    searchParams.get('reference') ||
    searchParams.get('transactionId') ||
    searchParams.get('id')

  const [reference, setReference] = useState(rawRef || '')
  const [manualInputRef, setManualInputRef] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [isReporting, setIsReporting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(Boolean(rawRef))
  const [isVerified, setIsVerified] = useState(false)

  // Reportar comprobante de forma segura en estado PENDING para revisión
  useEffect(() => {
    async function reportPendingPayment() {
      if (!rawRef) return

      setIsReporting(true)
      try {
        const res = await fetch('/api/payments/nequi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'auto_enroll_payment',
            payload: {
              userId: user?.id,
              userEmail: user?.email,
              userName: profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Docente Aspirante'),
              reference: rawRef,
              courseId: searchParams.get('courseId') || 'plan_pro',
            },
          }),
        })
        const json = await res.json()
        if (json.verified) {
          setIsVerified(true)
        }
        setReportSuccess(true)
      } catch {
        setReportSuccess(true)
      } finally {
        setIsReporting(false)
      }
    }

    reportPendingPayment()
  }, [rawRef, user?.id, user?.email, profile?.full_name, searchParams])

  const handleManualReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInputRef.trim()) return

    setIsReporting(true)
    const cleanRef = manualInputRef.trim().toUpperCase()
    setReference(cleanRef)

    try {
      const res = await fetch('/api/payments/nequi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auto_enroll_payment',
          payload: {
            userId: user?.id,
            userEmail: user?.email || emailInput.trim(),
            userName: profile?.full_name || emailInput.split('@')[0] || 'Docente Aspirante',
            reference: cleanRef,
            courseId: searchParams.get('courseId') || 'plan_pro',
          },
        }),
      })
      const json = await res.json()
      if (json.verified) {
        setIsVerified(true)
      }
      setReportSuccess(true)
    } catch {
      setReportSuccess(true)
    } finally {
      setIsReporting(false)
    }
  }

  // CASO 1: Acceso directo al link sin comprobante ni parámetros (intento de entrada manual)
  if (!rawRef && !reportSuccess) {
    return (
      <div className="min-h-screen bg-background aurora-bg flex items-center justify-center p-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl rounded-3xl glass border border-amber-500/30 bg-card/95 shadow-2xl p-8 sm:p-10 text-center relative z-10 space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" /> Verificación de Seguridad Requerida
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              No se detectó transacción activa
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Para proteger la seguridad de la plataforma, el acceso a los cursos oficiales no se activa ingresando directamente a este enlace. Si acabas de transferir por Nequi, ingresa tu comprobante a continuación:
            </p>
          </div>

          <form onSubmit={handleManualReport} className="p-5 rounded-2xl bg-muted/40 border border-border/80 text-left space-y-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Número de Referencia o Comprobante Nequi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={manualInputRef}
                onChange={(e) => setManualInputRef(e.target.value)}
                placeholder="Ej. M184920 o Código de transacción"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-mono outline-none focus:border-violet-500"
              />
            </div>

            {!user?.email && (
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Tu Correo Electrónico Registrado <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="tu.correo@ejemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-violet-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isReporting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
            >
              {isReporting ? 'Verificando con Nequi...' : 'Registrar Comprobante para Activación'}
            </button>
          </form>

          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/#pricing"
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              Ver Planes y Adquirir Acceso Pro <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // CASO 2: Redirección con comprobante recibido (queda en verificación o completado si tiene Webhook)
  return (
    <div className="min-h-screen bg-background aurora-bg flex items-center justify-center p-6 relative overflow-hidden">
      {isVerified && <CelebrationParticles count={36} />}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl rounded-3xl glass border border-violet-500/30 bg-card/95 shadow-2xl p-8 sm:p-10 text-center relative z-10 space-y-6"
      >
        {isVerified ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Pago Verificado & Matrícula Activa
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4 animate-spin" /> Comprobante Recibido · Verificación en Curso
          </div>
        )}

        {/* AI Mentor Companion */}
        <AIMentor
          mood={isVerified ? 'celebrating' : 'empathic'}
          variant="card"
          message={
            isVerified
              ? `¡Extraordinaria noticia, colega docente! Tu pago en Nequi ha sido verificado satisfactoriamente. Todos tus cursos, videoclases y simulacros CNSC están desbloqueados.`
              : `¡Hemos recibido el registro de tu pago Nequi con referencia ${reference}! Por seguridad contra fraudes, el Administrador confirma la transacción con el banco para activar tu acceso definitivo.`
          }
          hint={
            isVerified
              ? 'Puedes ingresar de inmediato a tu Aula Virtual desde el Dashboard.'
              : 'Para activación inmediata en menos de 2 minutos, también puedes enviar la captura de tu comprobante a nuestro canal directo de WhatsApp.'
          }
        />

        <div className="space-y-2">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
            {isVerified ? '¡Tu Matrícula ha Sido Activada!' : 'Comprobante Registrado con Éxito'}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            {isVerified
              ? 'Hemos validado tu transacción en Nequi. Tu cuenta ahora cuenta con acceso completo a los programas oficiales de MaestroTech.'
              : 'Tu referencia se encuentra en cola de aprobación. Puedes notificar al Administrador para habilitar tus cursos sin esperas.'}
          </p>
        </div>

        {/* Detalles de la transacción */}
        <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/60 text-left space-y-2.5">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="text-muted-foreground">Comprobante Nequi:</span>
            <span className="font-mono font-bold text-foreground bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
              {reference}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="text-muted-foreground">Estado de Verificación:</span>
            {isVerified ? (
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Aprobado y Matriculado
              </span>
            ) : (
              <span className="font-semibold text-amber-400 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Pendiente de Aprobación en /admin
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="text-muted-foreground">Cuenta del Docente:</span>
            <span className="font-medium text-foreground">
              {user?.email || (emailInput ? emailInput : 'Tu cuenta registrada')}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          {!isVerified && (
            <a
              href={`${NEQUI_CONFIG.supportWhatsapp}%20Comprobante:%20${reference}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-emerald-600/25 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Notificar Pago en WhatsApp
            </a>
          )}

          <Link
            href="/?view=dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs sm:text-sm font-bold shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all btn-magnetic"
          >
            <BookOpen className="w-4 h-4" />
            Ir a mi Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl glass border border-border/80 text-foreground text-xs sm:text-sm font-semibold hover:bg-muted transition-colors"
          >
            <Home className="w-4 h-4" />
            Inicio
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function PagoConfirmadoPage() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <PagoConfirmadoContent />
      </Suspense>
    </AuthProvider>
  )
}
