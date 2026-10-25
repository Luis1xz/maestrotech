'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { createNequiPayment, NEQUI_CONFIG } from '@/services/payments'
import AIMentor from '@/components/ai-mentor'

interface NequiCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  productTitle?: string
  productPlan?: string
  courseId?: string
  amount?: number
  user?: { id?: string; email?: string; name?: string } | null
  onPaymentSubmitted?: () => void
}

export default function NequiCheckoutModal({
  isOpen,
  onClose,
  productTitle = 'Suscripción Docente Pro',
  productPlan = 'Acceso Ilimitado a Cursos y Simulacros CNSC',
  courseId = 'plan_pro',
  amount = 39900,
  user,
  onPaymentSubmitted,
}: NequiCheckoutModalProps) {
  const [nequiPhone, setNequiPhone] = useState('')
  const [reference, setReference] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [copiedNumber, setCopiedNumber] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const formattedAmount = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(NEQUI_CONFIG.merchantPhone.replace(/\s+/g, ''))
    setCopiedNumber(true)
    setTimeout(() => setCopiedNumber(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!reference.trim()) {
      setErrorMsg('Por favor ingresa el número de referencia o comprobante de tu pago en Nequi.')
      return
    }

    setIsSubmitting(true)

    try {
      await createNequiPayment({
        userId: user?.id || 'guest_user',
        userEmail: user?.email || 'aspirante@maestrotech.co',
        userName: user?.name || (user?.email ? user.email.split('@')[0] : 'Docente Aspirante'),
        courseId: courseId,
        courseTitle: productTitle,
        planName: productPlan,
        amount: amount,
        nequiPhone: nequiPhone.trim() || NEQUI_CONFIG.merchantPhone,
        nequiReference: reference.trim().toUpperCase(),
        notes: 'Pago registrado desde modal web Nequi Negocio',
      })

      setIsSubmitting(false)
      setIsSuccess(true)
      if (onPaymentSubmitted) onPaymentSubmitted()
    } catch {
      setIsSubmitting(false)
      setErrorMsg('Hubo un problema al registrar tu pago. Por favor intenta de nuevo.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-xl rounded-3xl bg-card border border-violet-500/30 shadow-2xl overflow-hidden"
      >
        {/* Decorative header */}
        <div className="relative bg-gradient-to-r from-[#20002c] via-[#481269] to-[#c71585] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
              Nequi Negocio Oficial
            </span>
            <span className="flex items-center gap-1 text-[11px] text-pink-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Pago 100% Seguro
            </span>
          </div>

          <h2 className="font-display font-bold text-2xl text-white">{productTitle}</h2>
          <p className="text-xs text-white/80 mt-0.5">{productPlan}</p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{formattedAmount}</span>
            <span className="text-xs text-pink-200 uppercase font-semibold">COP · Sin cobros ocultos</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {!isSuccess ? (
            <>
              {/* Nequi payment instructions & link */}
              <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#e8006f]" /> Número Nequi Oficial:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-xs font-semibold text-violet-300 transition-colors"
                  >
                    {copiedNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> {NEQUI_CONFIG.merchantPhone}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Puedes abrir tu App Nequi y transferir al número anterior o ingresar directamente al enlace de recarga y pago oficial de Nequi:
                </p>

                <a
                  href={NEQUI_CONFIG.nequiPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#e8006f] to-[#7928ca] text-white text-xs font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all"
                >
                  <span>Abrir Portal de Pago Nequi Negocio</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Form to report transaction reference */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Número de Referencia o Comprobante Nequi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ej. M184920 o Código de transacción"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border/80 focus:border-violet-500 focus:outline-none text-xs text-foreground placeholder-muted-foreground font-mono transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Aparece en la pantalla final de tu comprobante Nequi (letras y números).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Tu Celular Nequi (Opcional para confirmar tu cuenta)
                  </label>
                  <input
                    type="tel"
                    value={nequiPhone}
                    onChange={(e) => setNequiPhone(e.target.value)}
                    placeholder="Ej. 312 345 6789"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border/80 focus:border-violet-500 focus:outline-none text-xs text-foreground placeholder-muted-foreground transition-all"
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl glass border border-border/80 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 disabled:opacity-50 transition-all btn-magnetic"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Registrando pago...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmar y Enviar Comprobante
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Success confirmation screen with AI Mentor */
            <div className="text-center space-y-6 py-2">
              <AIMentor
                mood="celebrating"
                variant="card"
                message={`¡Excelente! Tu pago con referencia ${reference} quedó registrado exitosamente en el sistema de MaestroTech.`}
                hint="Nuestro Superusuario o el sistema confirmará la transacción y matriculará de inmediato tu acceso Pro completo."
              />

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  Estado: Recibido en cola de verificación
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Referencia Nequi: <span className="font-mono text-foreground font-bold">{reference}</span>
                  <br />
                  Si deseas activación prioritaria inmediata, también puedes enviarnos captura a WhatsApp con 1 clic:
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`${NEQUI_CONFIG.supportWhatsapp}%20Ref:%20${reference}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Notificar por WhatsApp
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl glass border border-border/80 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Entendido, cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
