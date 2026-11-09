'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import CandidateOnboardingModal from './candidate-onboarding-modal'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
  onSuccess?: () => void
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const { signIn, signInWithGoogle } = useAuth()

  if (!isOpen) return null

  // Si el usuario quiere registrarse, abrimos el onboarding completo de 5 etapas
  if (mode === 'signup') {
    return (
      <CandidateOnboardingModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
        onSwitchToLogin={() => setMode('signin')}
      />
    )
  }

  const handleGoogleSignIn = async () => {
    setErrorMsg(null)
    setLoadingGoogle(true)
    try {
      const res = await signInWithGoogle()
      if (res.error) {
        setErrorMsg(res.error.message || 'Error al conectar con Google.')
        setLoadingGoogle(false)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con Google'
      setErrorMsg(msg)
      setLoadingGoogle(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setLoading(true)

    const res = await signIn({ email, password })
    if (res.error) {
      setErrorMsg(res.error.message || 'Error al iniciar sesión. Revisa tus credenciales.')
      setLoading(false)
      return
    }
    setLoading(false)
    onSuccess?.()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2545]/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-3xl bg-white border-2 border-[#C99E32] shadow-2xl p-7 overflow-hidden max-h-[92vh] overflow-y-auto text-[#1E293B]"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#0038DF]/5 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Header */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-[#C99E32] shadow-xs shrink-0 bg-white p-0.5">
              <img src="/logo-icon.png" alt="Legado Docente Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-lg font-display text-[#0038DF]">LEGADO DOCENTE</span>
              <p className="text-[10px] text-[#9C7316] italic font-medium">«Aprende, comparte, deja huella»</p>
            </div>
          </div>

          <h2 className="title-h1 font-extrabold text-2xl text-[#0038DF] mb-1">
            Bienvenido a tu Aula Virtual
          </h2>
          <p className="text-xs text-[#1E293B]/80 mb-4">
            Ingresa tus credenciales para acceder a tus cursos y simulacros de concurso.
          </p>

          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMsg(null)
              }}
              className="py-2 text-xs font-bold rounded-xl bg-white text-[#0038DF] shadow-xs cursor-pointer"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setErrorMsg(null)
              }}
              className="py-2 text-xs font-bold rounded-xl text-[#64748B] hover:text-[#0038DF] flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Registrarme</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C99E32]" />
            </button>
          </div>

          {/* Error / Success Alerts */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs mb-3.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs mb-3.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Botón Continuar con Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#E5EDF5] hover:border-[#0045E6]/50 text-[#142D49] font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-50"
          >
            {loadingGoogle ? (
              <div className="w-4 h-4 border-2 border-[#0045E6]/40 border-t-[#0045E6] rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{loadingGoogle ? 'Conectando con Google...' : 'Continuar con Google'}</span>
          </button>

          {/* Separador */}
          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5EDF5]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-white px-3 text-[#536B83] font-semibold">o con correo</span>
            </div>
          </div>

          {/* Formulario Login */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D49] mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#536B83]" />
                <input
                  type="email"
                  required
                  placeholder="docente@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] focus:border-[#0045E6] focus:ring-1 focus:ring-[#0045E6] text-xs text-[#142D49] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D49] mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#536B83]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] focus:border-[#0045E6] focus:ring-1 focus:ring-[#0045E6] text-xs text-[#142D49] outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 btn-gold-cta btn-gold-pill text-xs font-bold text-[#1A1A1A] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#1A1A1A]/40 border-t-[#1A1A1A] rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar a Legado Docente</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Banner para nuevo aspirante */}
          <div className="mt-4 p-3 rounded-2xl bg-[#E5A83B]/10 border border-[#E5A83B]/30 text-center space-y-1">
            <p className="text-[11px] font-bold text-[#142D49]">¿Aún no te has registrado?</p>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-xs font-bold text-[#0045E6] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#E5A83B]" />
              Iniciar caracterización inteligente (5 etapas)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
