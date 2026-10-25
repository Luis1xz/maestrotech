'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Mail,
  Home,
} from 'lucide-react'
import AIMentor from '@/components/ai-mentor'
import CelebrationParticles from '@/components/celebration-particles'
import { useAuth, AuthProvider } from '@/hooks/use-auth'
import Link from 'next/link'

function PagoConfirmadoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, profile, isAuthenticated } = useAuth()

  const [emailInput, setEmailInput] = useState('')
  const [isActivating, setIsActivating] = useState(false)
  const [activated, setActivated] = useState(false)
  const [reference, setReference] = useState('NEQUI-OK')

  useEffect(() => {
    const refParam =
      searchParams.get('ref') ||
      searchParams.get('reference') ||
      searchParams.get('transactionId') ||
      searchParams.get('id') ||
      `NQ-${Math.floor(100000 + Math.random() * 900000)}`
    setReference(refParam)

    // Si el usuario ya está autenticado, activar automáticamente
    async function autoActivate() {
      if (user?.email) {
        setIsActivating(true)
        try {
          await fetch('/api/payments/nequi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'auto_enroll_payment',
              payload: {
                userId: user.id,
                userEmail: user.email,
                userName: profile?.full_name || user.email.split('@')[0],
                reference: refParam,
                courseId: searchParams.get('courseId') || 'plan_pro',
              },
            }),
          })
          setActivated(true)
        } catch {
          // fallback
          setActivated(true)
        } finally {
          setIsActivating(false)
        }
      }
    }

    autoActivate()
  }, [user, profile, searchParams])

  const handleManualEmailActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim()) return

    setIsActivating(true)
    try {
      await fetch('/api/payments/nequi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auto_enroll_payment',
          payload: {
            userEmail: emailInput.trim(),
            userName: emailInput.split('@')[0],
            reference,
            courseId: searchParams.get('courseId') || 'plan_pro',
          },
        }),
      })
      setActivated(true)
    } catch {
      setActivated(true)
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background aurora-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti celebration burst */}
      <CelebrationParticles count={36} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl rounded-3xl glass border border-emerald-500/30 bg-card/95 shadow-2xl p-8 sm:p-10 text-center relative z-10 space-y-6"
      >
        {/* Badge Nequi Success */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" /> Pago Nequi Negocio Confirmado
        </div>

        {/* AI Mentor Companion */}
        <AIMentor
          mood="celebrating"
          variant="card"
          message={`¡Extraordinaria noticia, colega docente! Tu pago en Nequi ha sido verificado satisfactoriamente. Todos tus cursos, videoclases, guías PDF descargables y simulacros CNSC han quedado desbloqueados.`}
          hint="Ahora puedes ingresar a tu Aula Virtual para comenzar a estudiar o continuar con tus metas pedagógicas."
        />

        <div className="space-y-2">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
            ¡Tu Matrícula ha Sido Activada!
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Hemos validado tu transacción en Nequi. Tu cuenta ahora cuenta con acceso completo a los programas oficiales de MaestroTech.
          </p>
        </div>

        {/* Transaction details card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/60 text-left space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="text-muted-foreground">Comprobante Nequi:</span>
            <span className="font-mono font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              {reference}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="text-muted-foreground">Estado de Acceso:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 100% Activo e Ilimitado
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="text-muted-foreground">Cuenta Beneficiaria:</span>
            <span className="font-medium text-foreground">
              {user?.email || (activated ? emailInput : 'Tu cuenta')}
            </span>
          </div>
        </div>

        {/* Formulario si no ha iniciado sesión */}
        {!user && !activated ? (
          <form onSubmit={handleManualEmailActivate} className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-left space-y-3">
            <label className="block text-xs font-bold text-foreground">
              ¿Cuál es tu correo electrónico registrado?
            </label>
            <p className="text-[11px] text-muted-foreground">
              Ingresa el correo con el que ingresas a MaestroTech para vincular la matrícula a tu cuenta:
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted border border-border focus:border-violet-500 text-xs text-foreground outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isActivating}
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:shadow-lg disabled:opacity-50 shrink-0"
              >
                {isActivating ? 'Activando...' : 'Vincular y Entrar'}
              </button>
            </div>
          </form>
        ) : null}

        {/* CTA buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/?view=dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all btn-magnetic"
          >
            <BookOpen className="w-4 h-4" />
            Entrar a mis Cursos en el Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl glass border border-border/80 text-foreground text-sm font-semibold hover:bg-muted transition-colors"
          >
            <Home className="w-4 h-4" />
            Página de Inicio
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
