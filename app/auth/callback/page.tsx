'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/client'
import { ensureProfile } from '@/services/profiles'
import { getCandidateProfile } from '@/services/candidate'
import { Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let processed = false

    async function handleAuthCallback() {
      // 1. Obtener parámetros desde searchParams y también directamente de window.location
      const winSearch = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      let code = searchParams.get('code') || winSearch?.get('code') || null
      let errorParam = searchParams.get('error') || winSearch?.get('error') || null
      let errorDesc = searchParams.get('error_description') || winSearch?.get('error_description') || null
      const nextView = searchParams.get('next') || winSearch?.get('next') || 'dashboard'

      // Revisar fragmento hash (#access_token=... o #code=...) típico de OAuth o flujos directos
      let hashAccessToken: string | null = null
      let hashRefreshToken: string | null = null

      if (typeof window !== 'undefined' && window.location.hash) {
        const hashStr = window.location.hash.replace(/^#/, '')
        const hashParams = new URLSearchParams(hashStr)
        if (!code && hashParams.get('code')) code = hashParams.get('code')
        if (!errorParam && hashParams.get('error')) errorParam = hashParams.get('error')
        if (!errorDesc && hashParams.get('error_description')) errorDesc = hashParams.get('error_description')
        hashAccessToken = hashParams.get('access_token')
        hashRefreshToken = hashParams.get('refresh_token')
      }

      // 2. Manejo de error devuelto por Google o Supabase
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

      // 3. Suscripción a eventos onAuthStateChange (captura sesión cuando detectSessionInUrl procesa el hash)
      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (!processed && session?.user && isMounted) {
          processed = true
          await processLoggedInUser(session.user, nextView)
        }
      })

      try {
        // 4. Si vienen tokens directos en el hash (flujo implicit)
        if (hashAccessToken) {
          const { data: setSessionData, error: setSessionErr } = await client.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken || '',
          })
          if (!setSessionErr && setSessionData?.user && !processed && isMounted) {
            processed = true
            authListener.subscription.unsubscribe()
            await processLoggedInUser(setSessionData.user, nextView)
            return
          }
        }

        // 5. Si viene el código de autorización PKCE de Google
        if (code) {
          const { data, error: exchangeError } = await client.auth.exchangeCodeForSession(code)

          if (!exchangeError && data?.session?.user && !processed && isMounted) {
            processed = true
            authListener.subscription.unsubscribe()
            await processLoggedInUser(data.session.user, nextView)
            return
          }

          if (exchangeError) {
            console.warn('[auth/callback] exchangeCodeForSession falló o ya fue consumido:', exchangeError.message)
            // Verificar si la sesión ya quedó activa en el cliente
            const { data: sessionData } = await client.auth.getSession()
            if (sessionData?.session?.user && !processed && isMounted) {
              processed = true
              authListener.subscription.unsubscribe()
              await processLoggedInUser(sessionData.session.user, nextView)
              return
            }
          }
        }

        // 6. Polling de sesión resiliente: esperar hasta 3.5 segundos a que detectSessionInUrl o cookies sincronicen
        for (let attempt = 0; attempt < 7; attempt++) {
          if (processed) return
          const { data: currentSessionData } = await client.auth.getSession()
          if (currentSessionData?.session?.user && !processed && isMounted) {
            processed = true
            authListener.subscription.unsubscribe()
            await processLoggedInUser(currentSessionData.session.user, nextView)
            return
          }
          await new Promise((r) => setTimeout(r, 500))
        }

        authListener.subscription.unsubscribe()

        // 7. Si después de los reintentos no hay código ni sesión activa
        if (!processed && isMounted) {
          setStatus('error')
          setErrorMessage('No se encontró una sesión o token de autenticación válido.')
        }
      } catch (err: unknown) {
        authListener.subscription.unsubscribe()
        const msg = err instanceof Error ? err.message : 'Error inesperado durante la autenticación'
        console.error('[auth/callback] Excepción:', err)
        if (isMounted && !processed) {
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

        // Identificar rol: superusuarios conocidos conservan admin
        const isAdmin = email === 'luisalfonso1818@gmail.com' || email === 'patriciajhon@gmail.com'
        const targetRole = isAdmin ? 'admin' : 'student'

        await ensureProfile(user.id, {
          email,
          full_name: fullName,
          first_name: (meta.first_name as string) || '',
          last_name: (meta.last_name as string) || '',
          avatar_url: ((meta.avatar_url || meta.picture) as string) || undefined,
          role: targetRole,
        })

        // Determinar destino:
        let destinationView = nextView || 'dashboard'
        if (isAdmin) {
          destinationView = 'dashboard'
        } else if (targetRole === 'student') {
          try {
            const candidate = await getCandidateProfile(user.id)
            if (!candidate || !candidate.profile_completed) {
              destinationView = 'onboarding'
            }
          } catch {
            // Continuar con destinationView
          }
        }

        setStatus('success')

        setTimeout(() => {
          if (isMounted) {
            window.location.href = `/?view=${encodeURIComponent(destinationView)}`
          }
        }, 500)
      } catch (e) {
        console.error('[auth/callback] Error creando perfil de usuario:', e)
        // Redirigir de todos modos ya que la sesión en Auth existe
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
