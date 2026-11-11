'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Profile, UserRole } from '@/types/database'
import { getProfile, ensureProfile } from '@/services/profiles'
import { DEMO_PROFILE } from '@/services/demo-data'

const LEGACY_STORAGE_KEYS = [
  'legadodocente_custom_session_v2',
  'legadodocente_custom_session',
  'maestrotech_custom_session',
]

export interface SignUpParams {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface SignInParams {
  email: string
  password: string
}

export interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  isDemo: boolean
  role: UserRole | null
  signIn: (params: SignInParams) => Promise<{ error: Error | null }>
  signUp: (params: SignUpParams) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getSiteOrigin(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://legadodocente.com'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isConfigured = isSupabaseConfigured()

  const userRef = useRef<User | null>(null)
  userRef.current = user

  const loadedUserIdRef = useRef<string | null>(null)
  const isFetchingProfileRef = useRef<boolean>(false)

  const loadUserProfile = useCallback(
    async (userId: string, currentUser?: User | null) => {
      if (!isConfigured) {
        setProfile(DEMO_PROFILE)
        return
      }

      if (loadedUserIdRef.current === userId && profile) {
        return
      }

      if (isFetchingProfileRef.current) return
      isFetchingProfileRef.current = true

      try {
        const u = currentUser || userRef.current
        const emailHint = u?.email || ''
        const { data, error } = await getProfile(userId, emailHint)

        if (data) {
          setProfile(data)
          loadedUserIdRef.current = userId
        } else if (!error) {
          const googleFullName =
            u?.user_metadata?.full_name ||
            u?.user_metadata?.name ||
            (u?.user_metadata?.first_name
              ? `${u.user_metadata.first_name} ${u.user_metadata.last_name || ''}`.trim()
              : '') ||
            u?.email?.split('@')[0] ||
            'Docente'
          const googleAvatar =
            u?.user_metadata?.avatar_url || u?.user_metadata?.picture || null

          const targetRole: UserRole = (u?.user_metadata?.role || u?.app_metadata?.role || 'student') as UserRole

          const { data: created } = await ensureProfile(userId, {
            email: emailHint,
            full_name: googleFullName,
            first_name: u?.user_metadata?.first_name || '',
            last_name: u?.user_metadata?.last_name || '',
            avatar_url: googleAvatar,
            role: targetRole,
          })
          if (created) {
            setProfile(created)
            loadedUserIdRef.current = userId
          }
        } else {
          const metaRole = (u?.user_metadata?.role || u?.app_metadata?.role || 'student') as UserRole
          setProfile((prev) =>
            prev || {
              id: userId,
              full_name:
                u?.user_metadata?.full_name ||
                u?.user_metadata?.name ||
                u?.email?.split('@')[0] ||
                'Docente',
              first_name: u?.user_metadata?.first_name || '',
              last_name: u?.user_metadata?.last_name || '',
              avatar_url: u?.user_metadata?.avatar_url || u?.user_metadata?.picture || null,
              role: metaRole,
              created_at: new Date().toISOString(),
            }
          )
        }
      } catch (err) {
        console.error('[auth-context] Excepción al cargar perfil:', err)
      } finally {
        isFetchingProfileRef.current = false
      }
    },
    [isConfigured, profile]
  )

  useEffect(() => {
    let isMounted = true

    // Limpiar rigurosamente cualquier sesión antigua o simulada de localStorage
    if (typeof window !== 'undefined') {
      for (const k of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(k)
      }
    }

    if (!isConfigured) {
      setIsLoading(false)
      return
    }

    const client = getSupabase()

    const syncSession = async (currentSession: Session | null) => {
      if (!isMounted) return
      if (currentSession?.user) {
        setSession((prev) =>
          prev?.access_token === currentSession.access_token ? prev : currentSession
        )
        if (!userRef.current || userRef.current.id !== currentSession.user.id) {
          setUser(currentSession.user)
          userRef.current = currentSession.user
        }
        if (loadedUserIdRef.current !== currentSession.user.id) {
          await loadUserProfile(currentSession.user.id, currentSession.user)
        }
      } else {
        setSession(null)
        setUser(null)
        setProfile(null)
        userRef.current = null
        loadedUserIdRef.current = null
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    // 1. Obtener la sesión real persistida en Supabase
    client.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        syncSession(initialSession)
      })
      .catch(() => {
        if (isMounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setIsLoading(false)
        }
      })

    // 2. Suscribirse a cambios reales de Supabase Auth
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return

      if (event === 'SIGNED_OUT') {
        if (typeof window !== 'undefined') {
          for (const k of LEGACY_STORAGE_KEYS) {
            window.localStorage.removeItem(k)
          }
        }
        setSession(null)
        setUser(null)
        setProfile(null)
        userRef.current = null
        loadedUserIdRef.current = null
        setIsLoading(false)
        return
      }

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (
          event === 'USER_UPDATED' ||
          (newSession?.user && loadedUserIdRef.current !== newSession.user.id)
        ) {
          loadedUserIdRef.current = null
        }
        await syncSession(newSession)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [isConfigured, loadUserProfile])

  const refreshProfile = useCallback(async () => {
    if (userRef.current) {
      loadedUserIdRef.current = null
      await loadUserProfile(userRef.current.id, userRef.current)
    }
  }, [loadUserProfile])

  // Inicio de sesión 100% auténtico contra Supabase Auth (verifica contraseña real)
  const signIn = async ({ email, password }: SignInParams): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase()

    try {
      if (!isConfigured) {
        return { error: new Error('La conexión a la base de datos no está configurada.') }
      }

      const client = getSupabase()
      const { data, error } = await client.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        return { error: new Error(error.message) }
      }

      if (data.user && data.session) {
        setUser(data.user)
        userRef.current = data.user
        setSession(data.session)
        loadedUserIdRef.current = null
        await loadUserProfile(data.user.id, data.user)
        return { error: null }
      }

      return { error: new Error('No se pudo iniciar sesión. Verifica tu usuario y contraseña.') }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      return { error: new Error(msg) }
    }
  }

  // Registro 100% auténtico en Supabase Auth
  const signUp = async ({
    email,
    password,
    firstName,
    lastName,
  }: SignUpParams): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase()
    const fullName = `${firstName} ${lastName}`.trim()

    try {
      if (!isConfigured) {
        return { error: new Error('La conexión a la base de datos no está configurada.') }
      }

      const client = getSupabase()
      const origin = getSiteOrigin()
      const emailRedirectTo = `${origin}/auth/callback`

      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (error) {
        return { error: new Error(error.message) }
      }

      if (!data?.user?.id) {
        return { error: new Error('No fue posible crear la cuenta en la base de datos.') }
      }

      const userId = data.user.id

      // Asegurar perfil en public.profiles con rol inicial de aspirante ('student')
      await ensureProfile(userId, {
        email: cleanEmail,
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        role: 'student',
      })

      // Si Supabase devuelve sesión de inmediato (Confirm email apagado)
      if (data.session && data.user) {
        setUser(data.user)
        userRef.current = data.user
        setSession(data.session)
        await loadUserProfile(userId, data.user)
      } else {
        // Intentar inicio de sesión directo
        const { data: loginData } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })
        if (loginData?.session && loginData?.user) {
          setUser(loginData.user)
          userRef.current = loginData.user
          setSession(loginData.session)
          await loadUserProfile(loginData.user.id, loginData.user)
        }
      }

      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar usuario'
      return { error: new Error(msg) }
    }
  }

  // Conexión OAuth con Google
  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    if (!isConfigured) {
      return { error: new Error('Supabase no está configurado.') }
    }

    try {
      const client = getSupabase()
      const origin = getSiteOrigin()
      const redirectTo = `${origin}/auth/callback`

      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        return { error: new Error(error.message) }
      }

      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con Google'
      return { error: new Error(msg) }
    }
  }

  // Restablecimiento de contraseña institucional por correo
  const resetPasswordForEmail = async (email: string): Promise<{ error: Error | null }> => {
    if (!isConfigured) {
      return { error: new Error('La conexión a la base de datos no está configurada.') }
    }

    try {
      const client = getSupabase()
      const origin = getSiteOrigin()
      const redirectTo = `${origin}/auth/callback?type=recovery`

      const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo,
      })

      if (error) {
        return { error: new Error(error.message) }
      }

      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar correo de recuperación'
      return { error: new Error(msg) }
    }
  }

  // Cierre de sesión definitivo
  const signOut = async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      for (const k of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(k)
      }
    }

    if (isConfigured) {
      try {
        const client = getSupabase()
        await client.auth.signOut()
      } catch (err) {
        console.error('Error al cerrar sesión en Supabase:', err)
      }
    }

    setUser(null)
    userRef.current = null
    setProfile(null)
    setSession(null)
    loadedUserIdRef.current = null
  }

  const isAuthenticated = Boolean(user) || Boolean(profile)
  const role: UserRole | null =
    profile?.role ||
    ((user?.user_metadata?.role || user?.app_metadata?.role) as UserRole | undefined) ||
    (profile ? 'student' : isLoading ? null : isAuthenticated ? 'student' : null)

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated,
        isDemo: false,
        role,
        signIn,
        signUp,
        signInWithGoogle,
        resetPasswordForEmail,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider />')
  }
  return context
}
