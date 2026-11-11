'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  Mail,
  Shield,
  BookOpen,
  Camera,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Save,
  Loader2,
  GraduationCap,
  Sparkles,
  Award,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { updateProfile } from '@/services/profiles'
import { getCandidateProfile, saveCandidateProfile } from '@/services/candidate'
import { COLOMBIA_DEPARTMENTS } from '@/lib/colombia-data'
import { TargetRole } from '@/types/candidate'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  enrolledCoursesCount?: number
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
]

export default function ProfileModal({
  isOpen,
  onClose,
  enrolledCoursesCount = 0,
}: ProfileModalProps) {
  const { user, profile, role, refreshProfile, resetPasswordForEmail } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [department, setDepartment] = useState('')
  const [phone, setPhone] = useState('')
  const [targetRole, setTargetRole] = useState<TargetRole>('docente_aula')

  const [saving, setSaving] = useState(false)
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      setAvatarUrl(profile.avatar_url || '')
    }
    if (user?.id) {
      getCandidateProfile(user.id).then((data) => {
        if (data) {
          setDepartment(data.department || '')
          setPhone(data.phone_number || '')
          if (data.target_role) setTargetRole(data.target_role)
        }
      })
    }
  }, [profile, user?.id, isOpen])

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setSaving(true)
    setFeedback(null)

    try {
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || profile?.full_name || 'Docente'
      const { error: profileErr } = await updateProfile(user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: fullName,
        avatar_url: avatarUrl.trim() || null,
      })

      if (profileErr) throw profileErr

      // Actualizar también la caracterización si existe previamente
      const existingCandidate = await getCandidateProfile(user.id)
      if (existingCandidate) {
        await saveCandidateProfile({
          ...existingCandidate,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          department: department.trim(),
          phone_number: phone.trim(),
          target_role: targetRole,
          updated_at: new Date().toISOString(),
        })
      }

      await refreshProfile()
      setFeedback({ type: 'success', text: '¡Perfil actualizado exitosamente!' })
      setTimeout(() => setFeedback(null), 3500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los cambios'
      setFeedback({ type: 'error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    setSendingPasswordReset(true)
    setFeedback(null)
    try {
      const { error } = await resetPasswordForEmail(user.email)
      if (error) throw error
      setFeedback({
        type: 'success',
        text: `Enlace de restablecimiento enviado a ${user.email}. Revisa tu bandeja de entrada.`,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo enviar el correo de recuperación'
      setFeedback({ type: 'error', text: msg })
    } finally {
      setSendingPasswordReset(false)
    }
  }

  const roleLabel =
    role === 'admin'
      ? 'Superusuario Administrador'
      : role === 'instructor'
      ? 'Docente Formador'
      : enrolledCoursesCount > 0
      ? 'Estudiante Matriculado'
      : 'Aspirante Registrado'

  const userInitials =
    ((profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '')) ||
    (profile?.full_name?.slice(0, 2) || 'LD').toUpperCase()

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white rounded-3xl border-2 border-[#C99E32] shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0] bg-gradient-to-r from-white via-[#F8FAFC] to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0038DF] text-white flex items-center justify-center shadow-md">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-[#0038DF]">
                  Mi Perfil Docente
                </h3>
                <p className="text-xs text-[#64748B]">
                  Visualiza y gestiona tu información personal en Legado Docente
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#0038DF] hover:bg-[#F1F5F9] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`px-6 py-3 text-xs font-bold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-b border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* Top overview card */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#C99E32] shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-[#0038DF] text-white font-display font-extrabold text-xl flex items-center justify-center shadow-md">
                    {userInitials}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-extrabold text-base text-[#1E293B]">
                    {profile?.full_name || 'Docente'}
                  </h4>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      role === 'admin'
                        ? 'bg-[#0038DF]/10 text-[#0038DF] border-[#0038DF]/25'
                        : enrolledCoursesCount > 0
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}
                  >
                    {roleLabel}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#0038DF]" />
                  {user?.email}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-[11px] text-[#64748B] pt-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#C99E32]" />
                    {enrolledCoursesCount} {enrolledCoursesCount === 1 ? 'curso activo' : 'cursos activos'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#0038DF]" />
                    Cuenta verificada
                  </span>
                </div>
              </div>
            </div>

            {/* Selector de Avatares Rápidos */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#0038DF]" />
                Foto de Perfil (Elige un avatar o pega una URL)
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      avatarUrl === url
                        ? 'border-[#0038DF] scale-105 shadow-md'
                        : 'border-[#E2E8F0] hover:border-[#C99E32] opacity-80'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className={`px-3 h-10 rounded-xl border text-[11px] font-bold text-[#64748B] hover:text-[#0038DF] hover:border-[#0038DF] transition-all cursor-pointer ${
                    !avatarUrl ? 'bg-[#0038DF]/10 border-[#0038DF] text-[#0038DF]' : 'border-[#E2E8F0]'
                  }`}
                >
                  Iniciales
                </button>
              </div>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://ejemplo.com/tu-foto.jpg"
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0038DF] focus:bg-white focus:outline-none text-xs text-[#1E293B] transition-all"
              />
            </div>

            {/* Campos de Nombre y Apellido */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E293B]">Nombres</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Luis Alfonso"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0038DF] focus:bg-white focus:outline-none text-xs font-semibold text-[#1E293B] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E293B]">Apellidos</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Herrera"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0038DF] focus:bg-white focus:outline-none text-xs font-semibold text-[#1E293B] transition-all"
                />
              </div>
            </div>

            {/* Campos de Caracterización Opcional */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E293B]">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="300 123 4567"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0038DF] focus:bg-white focus:outline-none text-xs text-[#1E293B] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E293B]">Departamento</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0038DF] focus:bg-white focus:outline-none text-xs text-[#1E293B] transition-all"
                >
                  <option value="">Seleccionar departamento...</option>
                  {Object.keys(COLOMBIA_DEPARTMENTS).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E293B]">Cargo de Interés</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as TargetRole)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0038DF] focus:bg-white focus:outline-none text-xs text-[#1E293B] transition-all"
                >
                  <option value="docente_aula">Docente de Aula</option>
                  <option value="docente_orientador">Docente Orientador</option>
                  <option value="coordinador">Coordinador</option>
                  <option value="rector">Rector</option>
                  <option value="director_rural">Director Rural</option>
                </select>
              </div>
            </div>

            {/* Seguridad / Contraseña */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-xs font-bold text-[#1E293B] flex items-center justify-center sm:justify-start gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#0038DF]" />
                  Seguridad y Contraseña
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Envía un enlace seguro a tu correo para cambiar tu clave de acceso
                </p>
              </div>
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={sendingPasswordReset}
                className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0038DF] text-[#0038DF] text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
              >
                {sendingPasswordReset ? 'Enviando enlace...' : 'Cambiar contraseña'}
              </button>
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-gold-cta btn-gold-pill px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
