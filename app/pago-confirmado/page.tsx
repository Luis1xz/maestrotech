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
import { PAYMENT_CONFIG } from '@/services/payments'
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
      <div className="min-h-screen bg-[#F3F8FD] flex items-center justify-center p-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl rounded-3xl bg-white border border-[#E5EDF5] shadow-xl p-8 sm:p-10 text-center relative z-10 space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#E9A83A]/15 border border-[#E9A83A]/30 text-[#E9A83A] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9A83A]/15 text-[#E9A83A] text-xs font-bold uppercase tracking-wider border border-[#E9A83A]/30">
              <AlertCircle className="w-4 h-4" /> Verificación de Seguridad Requerida
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142D49]">
              No se detectó transacción activa
            </h1>
            <p className="text-[#536B83] text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Para proteger la seguridad de la plataforma, el acceso a los cursos oficiales no se activa ingresando directamente a este enlace. Si acabas de realizar tu pago en línea, ingresa tu número de comprobante a continuación:
            </p>
          </div>

          <form onSubmit={handleManualReport} className="p-5 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] text-left space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#142D49] mb-1">
                Número de Referencia o Comprobante de Pago <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={manualInputRef}
                onChange={(e) => setManualInputRef(e.target.value)}
                placeholder="Ej. REF-184920 o Código de transacción"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5EDF5] text-xs text-[#142D49] font-mono outline-none focus:border-[#176FC1] focus:ring-1 focus:ring-[#176FC1]"
              />
            </div>

            {!user?.email && (
              <div>
                <label className="block text-xs font-bold text-[#142D49] mb-1">
                  Tu Correo Electrónico Registrado <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="tu.correo@ejemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#176FC1] focus:ring-1 focus:ring-[#176FC1]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isReporting}
              className="w-full py-3 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-bold shadow-lg shadow-[#176FC1]/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isReporting ? 'Verificando transacción...' : 'Registrar Comprobante para Activación'}
            </button>
          </form>

          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/#pricing"
              className="text-xs text-[#176FC1] font-semibold hover:underline flex items-center gap-1"
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
    <div className="min-h-screen bg-[#F3F8FD] flex items-center justify-center p-6 relative overflow-hidden">
      {isVerified && <CelebrationParticles count={36} />}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl rounded-3xl bg-white border border-[#E5EDF5] shadow-xl p-8 sm:p-10 text-center relative z-10 space-y-6"
      >
        {isVerified ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pago Verificado & Matrícula Activa
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E9A83A]/15 border border-[#E9A83A]/30 text-[#E9A83A] text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4 animate-spin text-[#E9A83A]" /> Comprobante Recibido · Verificación en Curso
          </div>
        )}

        {/* AI Mentor Companion */}
        <AIMentor
          mood={isVerified ? 'celebrating' : 'empathic'}
          variant="card"
          message={
            isVerified
              ? `¡Extraordinaria noticia, colega docente! Tu pago en línea ha sido verificado satisfactoriamente. Todos tus cursos, videoclases y simulacros CNSC están desbloqueados.`
              : `¡Hemos recibido el registro de tu pago con referencia ${reference}! Por seguridad contra fraudes, el Administrador confirma la transacción con la entidad bancaria para activar tu acceso definitivo.`
          }
          hint={
            isVerified
              ? 'Puedes ingresar de inmediato a tu Aula Virtual desde el Dashboard.'
              : 'Para activación inmediata en menos de 2 minutos, también puedes enviar la captura de tu comprobante a nuestro canal de soporte.'
          }
        />

        <div className="space-y-2">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142D49]">
            {isVerified ? '¡Tu Matrícula ha Sido Activada!' : 'Comprobante Registrado con Éxito'}
          </h1>
          <p className="text-[#536B83] text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            {isVerified
              ? 'Hemos validado tu pago seguro. Tu cuenta ahora cuenta con acceso completo a los programas oficiales de MaestroTech.'
              : 'Tu referencia se encuentra en cola de aprobación. Puedes notificar al Administrador para habilitar tus cursos sin esperas.'}
          </p>
        </div>

        {/* Detalles de la transacción */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] text-left space-y-2.5">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="text-[#536B83]">Comprobante de Pago:</span>
            <span className="font-mono font-bold text-[#176FC1] bg-[#176FC1]/10 px-2.5 py-0.5 rounded border border-[#176FC1]/20">
              {reference}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="text-[#536B83]">Estado de Verificación:</span>
            {isVerified ? (
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Aprobado y Matriculado
              </span>
            ) : (
              <span className="font-semibold text-[#E9A83A] flex items-center gap-1">
                <Clock className="w-4 h-4" /> Pendiente de Aprobación en /admin
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="text-[#536B83]">Cuenta del Docente:</span>
            <span className="font-medium text-[#142D49]">
              {user?.email || (emailInput ? emailInput : 'Tu cuenta registrada')}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          {!isVerified && (
            <a
              href={`${PAYMENT_CONFIG.supportWhatsapp}%20Comprobante:%20${reference}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Notificar Pago en WhatsApp
            </a>
          )}

          <Link
            href="/?view=dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#176FC1]/20 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Ir a mi Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-white border border-[#E5EDF5] text-[#142D49] text-xs sm:text-sm font-semibold hover:bg-[#F3F8FD] transition-colors"
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
