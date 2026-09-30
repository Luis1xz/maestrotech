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

  // Real client initialization with explicit global apikey header
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

