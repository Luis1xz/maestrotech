'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

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
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const { signIn, signUp, signInWithGoogle } = useAuth()

  if (!isOpen) return null

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

    if (mode === 'signin') {
      const res = await signIn({ email, password })
      if (res.error) {
        setErrorMsg(res.error.message || 'Error al iniciar sesión. Revisa tus credenciales.')
        setLoading(false)
        return
      }
      setLoading(false)
      onSuccess?.()
      onClose()
    } else {
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMsg('Por favor completa tu nombre y apellido')
        setLoading(false)
        return
      }

      const res = await signUp({ email, password, firstName, lastName })
      if (res.error) {
        setErrorMsg(res.error.message || 'Error al crear tu cuenta.')
        setLoading(false)
        return
      }

      setSuccessMsg('¡Cuenta creada exitosamente!')
      setLoading(false)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1000)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-3xl glass border border-border/80 bg-card/95 shadow-2xl p-8 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-600/15 to-violet-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Header */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-border/60 shadow-md shrink-0 bg-neutral-900">
              <img src="/logo.jpg" alt="Maestro Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg font-display text-foreground">Maestro</span>
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground mb-1">
            {mode === 'signin' ? 'Bienvenido de nuevo' : 'Comienza tu preparación'}
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            {mode === 'signin'
              ? 'Ingresa tus credenciales para acceder a tus cursos y simulacros.'
              : 'Únete a la comunidad de docentes líderes de Colombia.'}
          </p>

          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted border border-border/50 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMsg(null)
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setErrorMsg(null)
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {/* Error / Success Alerts */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs mb-4"
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
            className="w-full py-2.5 px-4 rounded-xl glass border border-border/80 hover:border-primary/50 bg-background/50 hover:bg-muted/60 text-foreground font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
          >
            {loadingGoogle ? (
              <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
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
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-card px-3 text-muted-foreground font-semibold">o con correo</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="María"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/60 border border-border/70 focus:border-primary/40 focus:outline-none text-sm text-foreground placeholder-muted-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Apellido</label>
                  <input
                    type="text"
                    required
                    placeholder="López"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border/70 focus:border-primary/40 focus:outline-none text-sm text-foreground placeholder-muted-foreground"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="docente@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/60 border border-border/70 focus:border-primary/40 focus:outline-none text-sm text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/60 border border-border/70 focus:border-primary/40 focus:outline-none text-sm text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 btn-magnetic"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Ingresar a Maestro' : 'Crear mi cuenta gratis'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-muted-foreground mt-5">
            Al continuar aceptas los términos de servicio y política de privacidad de MaestroTech.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
