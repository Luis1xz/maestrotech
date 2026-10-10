import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const getSupabaseUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  ).trim()
}

export const getSupabaseAnonKey = (): string => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim()
}

/**
 * Checks if real Supabase credentials are configured in the environment.
 */
export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('http') &&
    !url.includes('placeholder') &&
    !url.includes('your-project')
  )
}

let supabaseInstance: SupabaseClient | null = null
let isRealClientInitialized = false

/**
 * Get or create the Supabase browser client singleton.
 * Safe for SSR and client rendering in Next.js.
 */
export const getSupabase = (): SupabaseClient => {
  const isConfigured = isSupabaseConfigured()
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()

  // Return existing real client if already initialized
  if (supabaseInstance && isRealClientInitialized) {
    return supabaseInstance
  }

  if (!isConfigured) {
    if (supabaseInstance) return supabaseInstance
    supabaseInstance = createClient(
      'https://placeholder-domain-maestro.supabase.co',
      'placeholder-anon-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
    isRealClientInitialized = false
    return supabaseInstance
  }

  // Custom fetch wrapper to handle PostgREST clock-skew (PGRST303: JWT issued at future)
  const customFetch: typeof fetch = async (input, init) => {
    const response = await fetch(input, init)
    if (response.status === 401 || response.status === 403) {
      try {
        const cloned = response.clone()
        const bodyText = await cloned.text()
        if (bodyText.includes('PGRST303') || bodyText.includes('JWT issued at future')) {
          await new Promise((r) => setTimeout(r, 1500))
          const retryRes = await fetch(input, init)
          if (retryRes.status !== 401 && retryRes.status !== 403) {
            return retryRes
          }
          // If still failing on a GET request due to local/server clock skew, fallback to anonKey
          const method = (init?.method || 'GET').toUpperCase()
          if (method === 'GET' && init?.headers) {
            const headers = new Headers(init.headers as HeadersInit)
            headers.set('apikey', anonKey)
            headers.set('Authorization', `Bearer ${anonKey}`)
            return await fetch(input, { ...init, headers })
          }
          return retryRes
        }
      } catch {
        // Return original response if inspection fails
      }
    }
    return response
  }

  // Real client initialization with explicit global apikey header and resilient fetch
  supabaseInstance = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        apikey: anonKey,
      },
      fetch: customFetch,
    },
  })
  isRealClientInitialized = true

  return supabaseInstance
}

/**
 * Proxy export ensuring that direct imports of `supabase` always
 * evaluate through `getSupabase()`.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient) {
    const client = getSupabase()
    const value = client[prop]
    return typeof value === 'function' ? (value as Function).bind(client) : value
  },
})

