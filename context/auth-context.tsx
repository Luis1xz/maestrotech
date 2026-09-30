'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Profile, UserRole } from '@/types/database'
import { getProfile, ensureProfile } from '@/services/profiles'
import { DEMO_PROFILE } from '@/services/demo-data'

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
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isConfigured = isSupabaseConfigured()

  // Referencias para evitar loops infinitos y carreras asíncronas
  const userRef = React.useRef<User | null>(null)
  userRef.current = user

  const loadedUserIdRef = React.useRef<string | null>(null)
  const isFetchingProfileRef = React.useRef<boolean>(false)

  const loadUserProfile = useCallback(async (userId: string, currentUser?: User | null) => {
    if (!isConfigured) {
      setProfile(DEMO_PROFILE)
      return
    }

    if (isFetchingProfileRef.current) return
    isFetchingProfileRef.current = true

    try {
      const { data, error } = await getProfile(userId)
      if (data) {
        // Si ya existe el perfil, se respeta estrictamente su rol existente (admin, instructor, student)
        setProfile(data)
        loadedUserIdRef.current = userId
      } else if (!error) {
        // La consulta fue exitosa pero no existe fila en 'profiles' todavía (usuario nuevo)
        const u = currentUser || userRef.current
        const googleFullName =
          u?.user_metadata?.full_name ||
          u?.user_metadata?.name ||
          (u?.user_metadata?.first_name ? `${u.user_metadata.first_name} ${u.user_metadata.last_name || ''}`.trim() : '') ||
          u?.email?.split('@')[0] ||
          'Estudiante'
        const googleAvatar =
          u?.user_metadata?.avatar_url ||
          u?.user_metadata?.picture ||
          null

        // SEGURIDAD ESTRICTA: Nuevas cuentas registradas (incluido Google OAuth) siempre inician con role = 'student'
        const newRole: UserRole = 'student'

        const { data: created } = await ensureProfile(userId, {
          full_name: googleFullName,
          avatar_url: googleAvatar,
          role: newRole,
        })
        if (created) {
          setProfile(created)
          loadedUserIdRef.current = userId
        }
      } else {
        console.warn('[auth-context] Error al obtener perfil:', error.message)
        // En caso de fallo de consulta temporal, si user_metadata contiene rol seguro, no dejarlo sin permisos
        const u = currentUser || userRef.current
        const metaRole = (u?.user_metadata?.role || u?.app_metadata?.role) as UserRole | undefined
        if (metaRole) {
          setProfile((prev) => prev || {
            id: userId,
            full_name: u?.user_metadata?.full_name || u?.user_metadata?.name || u?.email?.split('@')[0] || 'Docente',
            first_name: u?.user_metadata?.first_name || '',
            last_name: u?.user_metadata?.last_name || '',
            avatar_url: u?.user_metadata?.avatar_url || u?.user_metadata?.picture || null,
            role: metaRole,
            created_at: new Date().toISOString(),
          })
        }
      }
    } catch (err) {
      console.error('[auth-context] Excepción al cargar perfil:', err)
    } finally {
      isFetchingProfileRef.current = false
    }
  }, [isConfigured])

  // Inicialización de sesión y suscripción en tiempo real (se monta solo una vez)
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false)
      return
    }

    let isMounted = true
    const client = getSupabase()

    const syncSession = async (currentSession: Session | null) => {
      if (!isMounted) return
      setSession(currentSession)
      const currentUser = currentSession?.user || null
      setUser(currentUser)
      userRef.current = currentUser

      if (currentUser) {
        if (loadedUserIdRef.current !== currentUser.id) {
          await loadUserProfile(currentUser.id, currentUser)
        }
      } else {
        setProfile(null)
        loadedUserIdRef.current = null
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    // 1. Obtener sesión inicial
    client.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        syncSession(initialSession)
      })
      .catch((err) => {
        console.error('[auth-context] Error al obtener sesión inicial:', err)
        if (isMounted) setIsLoading(false)
      })

    // 2. Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return

      if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setProfile(null)
        userRef.current = null
        loadedUserIdRef.current = null
        setIsLoading(false)
        return
      }

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (event === 'USER_UPDATED' || (newSession?.user && loadedUserIdRef.current !== newSession.user.id)) {
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

  const signIn = async ({ email, password }: SignInParams): Promise<{ error: Error | null }> => {
    if (!isConfigured) {
      // Modo demo: simular inicio de sesión exitoso
      setProfile(DEMO_PROFILE)
      return { error: null }
    }

    try {
      const client = getSupabase()
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: new Error(error.message) }
      }

      if (data.user) {
        setUser(data.user)
        userRef.current = data.user
        setSession(data.session)
        loadedUserIdRef.current = null
        await loadUserProfile(data.user.id, data.user)
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
    if (!isConfigured) {
      setProfile({
        ...DEMO_PROFILE,
        full_name: `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name: lastName,
      })
      return { error: null }
    }

    try {
      const client = getSupabase()
      const fullName = `${firstName} ${lastName}`.trim()

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
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

      // Asegurar perfil en la tabla profiles
      if (data.user) {
        await ensureProfile(data.user.id, {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          role: 'student',
        })
        await loadUserProfile(data.user.id)
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
    if (!isConfigured) {
      setUser(null)
      userRef.current = null
      setProfile(null)
      setSession(null)
      loadedUserIdRef.current = null
      return
    }

    try {
      const client = getSupabase()
      await client.auth.signOut()
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    } finally {
      setUser(null)
      userRef.current = null
      setProfile(null)
      setSession(null)
      loadedUserIdRef.current = null
    }
  }

  const isAuthenticated = Boolean(user) || (!isConfigured && Boolean(profile))
  const role: UserRole | null =
    profile?.role ||
    ((user?.user_metadata?.role || user?.app_metadata?.role) as UserRole | undefined) ||
    (profile ? 'student' : (isLoading ? null : (isAuthenticated ? 'student' : null)))

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated,
        isDemo: !isConfigured,
        role,
        signIn,
        signUp,
        signInWithGoogle,
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
