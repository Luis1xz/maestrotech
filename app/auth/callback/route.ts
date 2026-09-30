import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || 'dashboard'

  // 1. Manejo de error o cancelación por parte del usuario en el consentimiento de Google
  if (error) {
    console.warn('[auth/callback] OAuth error recibido desde Google/Supabase:', error, errorDescription)
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('auth_error', errorDescription || error)
    return NextResponse.redirect(redirectUrl)
  }

  // 2. Redirección a la aplicación principal con el código de autorización.
  // El cliente de Supabase en el navegador (inicializado con detectSessionInUrl: true y
  // con el code_verifier en localStorage) completará el intercambio PKCE, guardará la sesión,
  // cargará o creará el profile y activará el dashboard.
  if (code) {
    const targetUrl = new URL('/', request.url)
    targetUrl.searchParams.set('code', code)
    targetUrl.searchParams.set('view', next)
    return NextResponse.redirect(targetUrl)
  }

  // 3. Fallback si no hay parámetros en la URL
  return NextResponse.redirect(new URL('/', request.url))
}
