'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  ShieldCheck,
} from 'lucide-react'
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

  const { signIn, signUp, signInWithGoogle, quickSignInAs } = useAuth()

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

  const handleQuickRoleAccess = async (targetEmail: string, label: string) => {
    setErrorMsg(null)
    setSuccessMsg(`Ingresando como ${label}...`)
    setLoading(true)
    const res = await quickSignInAs(targetEmail)
    setLoading(false)
    if (res.error) {
      setSuccessMsg(null)
      setErrorMsg(res.error.message)
      return
    }
    onSuccess?.()
    onClose()
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
      }, 800)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-3xl bg-white border border-[#E5EDF5] shadow-2xl p-7 overflow-hidden max-h-[92vh] overflow-y-auto text-[#142D49]"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#176FC1]/5 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#536B83] hover:text-[#142D49] hover:bg-[#F3F8FD] transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Header */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-[#E5EDF5] shadow-xs shrink-0 bg-white p-0.5">
              <img src="/logo.png" alt="Maestro Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg font-display text-[#142D49]">MaestroTech</span>
          </div>

          <h2 className="font-display font-bold text-2xl text-[#142D49] mb-1">
            {mode === 'signin' ? 'Bienvenido a MaestroTech' : 'Comienza tu preparación'}
          </h2>
          <p className="text-xs text-[#536B83] mb-4">
            {mode === 'signin'
              ? 'Ingresa tus credenciales para acceder a tus cursos y simulacros.'
              : 'Únete a la comunidad de docentes líderes de Colombia.'}
          </p>

          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMsg(null)
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-white text-[#176FC1] shadow-xs'
                  : 'text-[#536B83] hover:text-[#142D49]'
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
                  ? 'bg-white text-[#176FC1] shadow-xs'
                  : 'text-[#536B83] hover:text-[#142D49]'
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
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#E5EDF5] hover:border-[#176FC1]/50 text-[#142D49] font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-50"
          >
            {loadingGoogle ? (
              <div className="w-4 h-4 border-2 border-[#176FC1]/40 border-t-[#176FC1] rounded-full animate-spin" />
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[#142D49] mb-1">
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536B83]" />
                    <input
                      type="text"
                      required
                      placeholder="María"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] focus:bg-white focus:outline-none text-sm text-[#142D49] placeholder-[#536B83]/60 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#142D49] mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="López"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] focus:bg-white focus:outline-none text-sm text-[#142D49] placeholder-[#536B83]/60 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#142D49] mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536B83]" />
                <input
                  type="email"
                  required
                  placeholder="estudiante@maestrotech.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] focus:bg-white focus:outline-none text-sm text-[#142D49] placeholder-[#536B83]/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D49] mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536B83]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] focus:border-[#176FC1] focus:bg-white focus:outline-none text-sm text-[#142D49] placeholder-[#536B83]/60 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 btn-magnetic"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin' ? 'Ingresar a MaestroTech' : 'Crear mi cuenta gratis'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Acceso Rápido para Pruebas de Roles */}
          <div className="mt-4 pt-3.5 border-t border-[#E5EDF5]">
            <p className="text-[11px] font-bold text-[#536B83] uppercase tracking-wider mb-2 text-center">
              Acceso directo a cuentas activas (1 clic)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleQuickRoleAccess(
                    'estudiante@maestrotech.co',
                    'Estudiante Matriculado (Carolina)'
                  )
                }
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-[#39BDEB]/10 hover:bg-[#39BDEB]/20 border border-[#39BDEB]/30 text-[#142D49] transition-all text-center"
                title="estudiante@maestrotech.co (Clave: Maestro2026!)"
              >
                <GraduationCap className="w-4 h-4 text-[#176FC1]" />
                <span className="text-[10px] font-bold leading-tight">Estudiante</span>
                <span className="text-[9px] text-[#536B83]">Matriculado</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleQuickRoleAccess('docente@maestrotech.co', 'Docente Instructor (Elena)')
                }
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-[#176FC1]/10 hover:bg-[#176FC1]/20 border border-[#176FC1]/30 text-[#176FC1] transition-all text-center"
                title="docente@maestrotech.co (Clave: Maestro2026!)"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-[10px] font-bold leading-tight">Docente</span>
                <span className="text-[9px] text-[#536B83]">Subir Cursos</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleQuickRoleAccess('luisalfonso1818@gmail.com', 'Superusuario Admin')
                }
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-[#142D49]/10 hover:bg-[#142D49]/20 border border-[#142D49]/30 text-[#142D49] transition-all text-center"
                title="luisalfonso1818@gmail.com"
              >
                <ShieldCheck className="w-4 h-4 text-[#176FC1]" />
                <span className="text-[10px] font-bold leading-tight">Superusuario</span>
                <span className="text-[9px] text-[#536B83]">Panel Admin</span>
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#536B83] mt-3.5">
            Al continuar aceptas los términos de servicio y política de privacidad de MaestroTech.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
