'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/client'
import { ensureProfile } from '@/services/profiles'
import { Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function handleAuthCallback() {
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')
      const errorDesc = searchParams.get('error_description')
      const nextView = searchParams.get('next') || 'dashboard'

      // 1. Manejo de error devuelto por Google o Supabase
      if (errorParam) {
        const fullMsg = errorDesc || errorParam
        console.warn('[auth/callback] Error retornado por OAuth:', fullMsg)
        if (isMounted) {
          setStatus('error')
          setErrorMessage(decodeURIComponent(fullMsg))
        }
        return
      }

      const client = getSupabase()

      try {
        // 2. Si viene el código de autorización PKCE de Google
        if (code) {
          const { data, error: exchangeError } = await client.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('[auth/callback] Error al intercambiar código PKCE:', exchangeError)
            // Si el código ya fue consumido por onAuthStateChange en paralelo, comprobar si hay sesión activa
            const { data: sessionData } = await client.auth.getSession()
            if (sessionData?.session?.user) {
              await processLoggedInUser(sessionData.session.user, nextView)
              return
            }
            if (isMounted) {
              setStatus('error')
              setErrorMessage(exchangeError.message || 'Error al validar la sesión con Google.')
            }
            return
          }

          if (data?.session?.user) {
            await processLoggedInUser(data.session.user, nextView)
            return
          }
        }

        // 3. Fallback: verificar si la sesión ya existe en cookies o storage (ej. hash implicit o detectSession)
        const { data: currentSessionData } = await client.auth.getSession()
        if (currentSessionData?.session?.user) {
          await processLoggedInUser(currentSessionData.session.user, nextView)
          return
        }

        // Si no hay código ni sesión activa
        if (isMounted) {
          setStatus('error')
          setErrorMessage('No se encontró una sesión o token de autenticación válido.')
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error inesperado durante la autenticación'
        console.error('[auth/callback] Excepción:', err)
        if (isMounted) {
          setStatus('error')
          setErrorMessage(msg)
        }
      }
    }

    async function processLoggedInUser(
      user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
      nextView: string
    ) {
      if (!isMounted) return

      try {
        const email = (user.email || '').trim().toLowerCase()
        const meta = user.user_metadata || {}
        const fullName =
          (meta.full_name as string) ||
          (meta.name as string) ||
          (meta.first_name
            ? `${meta.first_name} ${(meta.last_name as string) || ''}`.trim()
            : '') ||
          email.split('@')[0] ||
          'Docente'

        // Todos los nuevos registros mediante Google ingresan como aspirantes ('student')
        // Los roles de docente o administrador son asignados por los administradores en la base de datos
        const targetRole = 'student'

        await ensureProfile(user.id, {
          email,
          full_name: fullName,
          first_name: (meta.first_name as string) || '',
          last_name: (meta.last_name as string) || '',
          avatar_url: ((meta.avatar_url || meta.picture) as string) || undefined,
          role: targetRole,
        })

        setStatus('success')

        setTimeout(() => {
          if (isMounted) {
            window.location.href = `/?view=${encodeURIComponent(nextView)}`
          }
        }, 500)
      } catch (e) {
        console.error('[auth/callback] Error creando perfil de usuario:', e)
        // Redirigir de todos modos al dashboard ya que la sesión en Auth existe
        window.location.href = `/?view=${encodeURIComponent(nextView)}`
      }
    }

    handleAuthCallback()

    return () => {
      isMounted = false
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      {/* Contenedor central con diseño Legado Docente */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white border-2 border-[#C99E32] shadow-2xl space-y-6">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 shrink-0">
            <img src="/logo-icon.png" alt="Legado Docente" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#0038DF] font-display">
            LEGADO DOCENTE
          </span>
        </div>

        {status === 'loading' && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 border-3 border-[#0038DF] border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="title-h1 text-xl font-extrabold text-[#0038DF]">
              Autenticando con Google
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Validando tus credenciales oficiales de acceso a la plataforma...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="title-h1 text-xl font-extrabold text-[#0038DF]">
              ¡Inicio de Sesión Exitoso!
            </h2>
            <p className="text-xs text-[#1E293B] font-semibold">
              Ingresando a tu Aula Virtual de Legado Docente...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4 text-left">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="title-h1 text-xl font-extrabold text-[#0038DF] text-center">
              No se pudo completar el acceso con Google
            </h2>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
              {errorMessage || 'Ocurrió un error al procesar el retorno de la autenticación.'}
            </div>
            <p className="text-[11px] text-[#64748B] text-center">
              Puedes intentar ingresar nuevamente o iniciar sesión con tu correo y contraseña.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  window.location.href = '/'
                }}
                className="w-full py-3 btn-gold-cta btn-gold-pill text-xs font-bold text-[#1A1A1A] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Volver al Inicio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#0038DF] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
