'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Profile, UserRole } from '@/types/database'
import { getProfile, ensureProfile } from '@/services/profiles'
import { DEMO_PROFILE } from '@/services/demo-data'
import { fetchPlatformState } from '@/lib/platform-state-client'

const CUSTOM_SESSION_STORAGE_KEY = 'maestrotech_custom_session_v1'

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
  quickSignInAs: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function buildSyntheticSessionAndUser(params: {
  id: string
  email: string
  full_name: string
  first_name?: string | null
  last_name?: string | null
  role: UserRole
  avatar_url?: string | null
}): { user: User; session: Session; profile: Profile } {
  const now = new Date().toISOString()
  const syntheticUser: User = {
    id: params.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: params.email,
    email_confirmed_at: now,
    app_metadata: { provider: 'email', role: params.role },
    user_metadata: {
      full_name: params.full_name,
      first_name: params.first_name || '',
      last_name: params.last_name || '',
      role: params.role,
      avatar_url: params.avatar_url || null,
    },
    identities: [],
    created_at: now,
    updated_at: now,
  }

  const syntheticSession: Session = {
    access_token: `custom-session:${params.id}`,
    refresh_token: `custom-refresh:${params.id}`,
    expires_in: 86400 * 7,
    expires_at: Math.floor(Date.now() / 1000) + 86400 * 7,
    token_type: 'bearer',
    user: syntheticUser,
  }

  const profile: Profile = {
    id: params.id,
    full_name: params.full_name,
    first_name: params.first_name || null,
    last_name: params.last_name || null,
    role: params.role,
    avatar_url: params.avatar_url || null,
    created_at: now,
  }

  return { user: syntheticUser, session: syntheticSession, profile }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isConfigured = isSupabaseConfigured()

  const userRef = React.useRef<User | null>(null)
  userRef.current = user

  const loadedUserIdRef = React.useRef<string | null>(null)
  const isFetchingProfileRef = React.useRef<boolean>(false)

  const activateCustomSession = useCallback(
    (params: {
      id: string
      email: string
      full_name: string
      first_name?: string | null
      last_name?: string | null
      role: UserRole
      avatar_url?: string | null
    }) => {
      const built = buildSyntheticSessionAndUser(params)
      setUser(built.user)
      userRef.current = built.user
      setSession(built.session)
      setProfile(built.profile)
      loadedUserIdRef.current = built.user.id
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(CUSTOM_SESSION_STORAGE_KEY, JSON.stringify(params))
        } catch {
          // Ignore storage error
        }
      }
    },
    []
  )

  const loadUserProfile = useCallback(
    async (userId: string, currentUser?: User | null) => {
      if (!isConfigured) {
        setProfile(DEMO_PROFILE)
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
            'Estudiante'
          const googleAvatar =
            u?.user_metadata?.avatar_url || u?.user_metadata?.picture || null

          const { data: created } = await ensureProfile(userId, {
            email: emailHint,
            full_name: googleFullName,
            first_name: u?.user_metadata?.first_name || '',
            last_name: u?.user_metadata?.last_name || '',
            avatar_url: googleAvatar,
            role: 'student',
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
    [isConfigured]
  )

  useEffect(() => {
    let isMounted = true

    const restoreSavedCustomSession = (): boolean => {
      if (typeof window === 'undefined') return false
      try {
        const raw = window.localStorage.getItem(CUSTOM_SESSION_STORAGE_KEY)
        if (!raw) return false
        const parsed = JSON.parse(raw)
        if (parsed && parsed.id && parsed.email) {
          activateCustomSession(parsed)
          return true
        }
      } catch {
        // Ignore
      }
      return false
    }

    if (!isConfigured) {
      restoreSavedCustomSession()
      setIsLoading(false)
      return
    }

    const client = getSupabase()

    const syncSession = async (currentSession: Session | null) => {
      if (!isMounted) return
      if (currentSession?.user) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(CUSTOM_SESSION_STORAGE_KEY)
        }
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
        // Si no hay sesión de Supabase, comprobar si hay una sesión activa de plataforma en localStorage
        const restored = restoreSavedCustomSession()
        if (!restored) {
          setSession(null)
          setUser(null)
          setProfile(null)
          loadedUserIdRef.current = null
        }
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    client.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        syncSession(initialSession)
      })
      .catch(() => {
        restoreSavedCustomSession()
        if (isMounted) setIsLoading(false)
      })

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return

      if (event === 'SIGNED_OUT') {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(CUSTOM_SESSION_STORAGE_KEY)
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
  }, [isConfigured, loadUserProfile, activateCustomSession])

  const refreshProfile = useCallback(async () => {
    if (userRef.current) {
      loadedUserIdRef.current = null
      await loadUserProfile(userRef.current.id, userRef.current)
    }
  }, [loadUserProfile])

  const quickSignInAs = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const cleanEmail = email.trim().toLowerCase()
      const state = await fetchPlatformState()
      const storeUser = (state?.users || []).find(
        (u) => (u.email || '').toLowerCase() === cleanEmail
      )

      if (storeUser) {
        activateCustomSession({
          id: storeUser.id,
          email: storeUser.email || cleanEmail,
          full_name: storeUser.full_name || 'Docente MaestroTech',
          first_name: storeUser.first_name,
          last_name: storeUser.last_name,
          role: storeUser.role,
          avatar_url: storeUser.avatar_url,
        })
        return { error: null }
      }

      return { error: new Error('Cuenta no encontrada en la plataforma') }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión rápida'
      return { error: new Error(msg) }
    }
  }

  const signIn = async ({ email, password }: SignInParams): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase()

    try {
      // 1. Verificar si la cuenta existe en nuestro almacén sincronizado de plataforma
      const state = await fetchPlatformState()
      const storeUser = (state?.users || []).find(
        (u) => (u.email || '').toLowerCase() === cleanEmail
      )

      if (isConfigured) {
        const client = getSupabase()
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

        if (!error && data.user) {
          setUser(data.user)
          userRef.current = data.user
          setSession(data.session)
          loadedUserIdRef.current = null
          await loadUserProfile(data.user.id, data.user)
          return { error: null }
        }

        // Si Supabase devuelve "Email not confirmed" o si el usuario está registrado en platform-state
        if (storeUser) {
          activateCustomSession({
            id: storeUser.id,
            email: storeUser.email || cleanEmail,
            full_name: storeUser.full_name || 'Docente MaestroTech',
            first_name: storeUser.first_name,
            last_name: storeUser.last_name,
            role: storeUser.role,
            avatar_url: storeUser.avatar_url,
          })
          return { error: null }
        }

        if (error && error.message.toLowerCase().includes('email not confirmed')) {
          // Permitir ingreso inmediato aunque el correo no haya sido confirmado por SMTP
          const fallbackId = crypto.randomUUID()
          const created = await ensureProfile(fallbackId, {
            email: cleanEmail,
            full_name: cleanEmail.split('@')[0],
            role: 'student',
          })
          activateCustomSession({
            id: created.data?.id || fallbackId,
            email: cleanEmail,
            full_name: created.data?.full_name || cleanEmail.split('@')[0],
            first_name: created.data?.first_name,
            last_name: created.data?.last_name,
            role: created.data?.role || 'student',
            avatar_url: null,
          })
          return { error: null }
        }

        if (error) {
          return { error: new Error(error.message) }
        }
      } else if (storeUser) {
        activateCustomSession({
          id: storeUser.id,
          email: storeUser.email || cleanEmail,
          full_name: storeUser.full_name || 'Docente MaestroTech',
          first_name: storeUser.first_name,
          last_name: storeUser.last_name,
          role: storeUser.role,
          avatar_url: storeUser.avatar_url,
        })
        return { error: null }
      }

      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      return { error: new Error(msg) }
    }
  }

  const signUp = async ({
    email,
    password,
    firstName,
    lastName,
  }: SignUpParams): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase()
    const fullName = `${firstName} ${lastName}`.trim()

    try {
      let userId: string = crypto.randomUUID()
      let hasLiveSession = false

      if (isConfigured) {
        const client = getSupabase()
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              first_name: firstName,
              last_name: lastName,
            },
          },
        })

        if (error && !error.message.toLowerCase().includes('already registered')) {
          return { error: new Error(error.message) }
        }

        if (data?.user?.id) {
          userId = data.user.id
        }
        if (data?.session && data?.user) {
          hasLiveSession = true
          setUser(data.user)
          userRef.current = data.user
          setSession(data.session)
        }
      }

      const { data: ensured } = await ensureProfile(userId, {
        email: cleanEmail,
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        role: 'student',
      })

      if (!hasLiveSession) {
        activateCustomSession({
          id: ensured?.id || userId,
          email: cleanEmail,
          full_name: ensured?.full_name || fullName,
          first_name: firstName,
          last_name: lastName,
          role: ensured?.role || 'student',
          avatar_url: null,
        })
      } else {
        await loadUserProfile(userId)
      }

      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar usuario'
      return { error: new Error(msg) }
    }
  }

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    if (!isConfigured) {
      setProfile(DEMO_PROFILE)
      return { error: null }
    }

    try {
      const client = getSupabase()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
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

  const signOut = async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CUSTOM_SESSION_STORAGE_KEY)
    }

    if (isConfigured) {
      try {
        const client = getSupabase()
        await client.auth.signOut()
      } catch (err) {
        console.error('Error al cerrar sesión:', err)
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
        quickSignInAs,
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
