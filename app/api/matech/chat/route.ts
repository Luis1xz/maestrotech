import { NextRequest, NextResponse } from 'next/server'
import { askMaTech } from '@/services/matech'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      courseId,
      courseTitle,
      question,
      studentName,
      conversationId,
      chatHistory,
      userId: bodyUserId,
    } = body

    if (!courseId || !question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Parámetros inválidos. courseId y question son obligatorios.' },
        { status: 400 }
      )
    }

    if (question.trim().length === 0) {
      return NextResponse.json(
        { error: 'La pregunta no puede estar vacía.' },
        { status: 400 }
      )
    }

    if (question.length > 2000) {
      return NextResponse.json(
        { error: 'La pregunta excede el límite máximo de 2000 caracteres.' },
        { status: 400 }
      )
    }

    // Identificar el usuario
    let userId = bodyUserId || 'anonymous-student'
    const authHeader = request.headers.get('authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim()
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
      const anonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

      if (url && anonKey && !token.startsWith('custom-session:')) {
        try {
          const authClient = createClient(url, anonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          })
          const { data: { user } } = await authClient.auth.getUser(token)
          if (user?.id) {
            userId = user.id
          }
        } catch {
          // continuar con fallback
        }
      }
    }

    const result = await askMaTech({
      userId,
      courseId,
      courseTitle: courseTitle || 'Curso Oficial',
      question: question.trim(),
      studentName: studentName || 'Estudiante',
      conversationId,
      chatHistory: Array.isArray(chatHistory) ? chatHistory : undefined,
    })

    if (result.error && !result.replyText) {
      return NextResponse.json(
        { error: result.error, remainingDaily: result.remainingDaily, remainingMonthly: result.remainingMonthly },
        { status: 429 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[API /api/matech/chat] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error interno al procesar la consulta con MaTech' },
      { status: 500 }
    )
  }
}
