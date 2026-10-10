import { NextRequest, NextResponse } from 'next/server'
import { readStore, writeStore } from '@/lib/platform-store-server'

export async function GET() {
  const state = readStore()
  return NextResponse.json(state, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, payload } = body
    const state = readStore()

    switch (action) {
      case 'upsert_course': {
        const course = payload
        const idx = state.courses.findIndex((c) => c.id === course.id || c.slug === course.slug)
        if (idx >= 0) {
          state.courses[idx] = { ...state.courses[idx], ...course }
        } else {
          state.courses.unshift(course)
        }
        state.deletedCourseIds = (state.deletedCourseIds || []).filter((id) => id !== course.id)
        break
      }

      case 'delete_course': {
        const { id } = payload
        state.courses = state.courses.filter((c) => c.id !== id)
        if (!state.deletedCourseIds) state.deletedCourseIds = []
        if (!state.deletedCourseIds.includes(id)) state.deletedCourseIds.push(id)
        break
      }

      case 'upsert_module': {
        const mod = payload
        const idx = state.modules.findIndex((m) => m.id === mod.id)
        if (idx >= 0) {
          state.modules[idx] = { ...state.modules[idx], ...mod }
        } else {
          state.modules.push(mod)
        }
        break
      }

      case 'delete_module': {
        const { id } = payload
        const lessonIds = state.lessons.filter((l) => l.module_id === id).map((l) => l.id)
        state.modules = state.modules.filter((m) => m.id !== id)
        state.lessons = state.lessons.filter((l) => l.module_id !== id)
        state.materials = state.materials.filter((mat) => !lessonIds.includes(mat.lesson_id))
        break
      }

      case 'upsert_lesson': {
        const lesson = payload
        const idx = state.lessons.findIndex((l) => l.id === lesson.id)
        if (idx >= 0) {
          state.lessons[idx] = { ...state.lessons[idx], ...lesson }
        } else {
          state.lessons.push(lesson)
        }
        break
      }

      case 'delete_lesson': {
        const { id } = payload
        state.lessons = state.lessons.filter((l) => l.id !== id)
        state.materials = state.materials.filter((m) => m.lesson_id !== id)
        break
      }

      case 'upsert_material': {
        const mat = payload
        const idx = state.materials.findIndex((m) => m.id === mat.id)
        if (idx >= 0) {
          state.materials[idx] = { ...state.materials[idx], ...mat }
        } else {
          state.materials.push(mat)
        }
        break
      }

      case 'delete_material': {
        const { id } = payload
        state.materials = state.materials.filter((m) => m.id !== id)
        break
      }

      case 'upsert_enrollment': {
        const enr = payload
        const idx = state.enrollments.findIndex(
          (e) => e.id === enr.id || (e.user_id === enr.user_id && e.course_id === enr.course_id)
        )
        if (idx >= 0) {
          state.enrollments[idx] = { ...state.enrollments[idx], ...enr }
        } else {
          state.enrollments.unshift(enr)
        }
        break
      }

      case 'upsert_progress':
      case 'upsert_lesson_progress': {
        const prog = payload
        const idx = state.lesson_progress.findIndex(
          (p) => p.id === prog.id || (p.user_id === prog.user_id && p.lesson_id === prog.lesson_id)
        )
        if (idx >= 0) {
          state.lesson_progress[idx] = {
            ...state.lesson_progress[idx],
            ...prog,
            watched_seconds: Math.max(
              state.lesson_progress[idx].watched_seconds || 0,
              prog.watched_seconds || 0
            ),
          }
        } else {
          state.lesson_progress.push(prog)
        }
        break
      }

      case 'upsert_certificate': {
        const cert = payload
        const idx = state.certificates.findIndex(
          (c) => c.id === cert.id || (c.user_id === cert.user_id && c.course_id === cert.course_id)
        )
        if (idx >= 0) {
          state.certificates[idx] = { ...state.certificates[idx], ...cert }
        } else {
          state.certificates.unshift(cert)
        }
        break
      }

      case 'upsert_user': {
        const usr = payload
        const idx = state.users.findIndex(
          (u) =>
            u.id === usr.id ||
            (usr.email && (u.email || '').toLowerCase() === usr.email.toLowerCase())
        )
        if (idx >= 0) {
          const existing = state.users[idx]
          const keepExistingRole =
            existing.role_updated_at &&
            (!usr.role_updated_at || existing.role_updated_at > usr.role_updated_at)
          state.users[idx] = {
            ...existing,
            ...usr,
            role: keepExistingRole ? existing.role : usr.role || existing.role,
            role_updated_at: keepExistingRole
              ? existing.role_updated_at
              : usr.role_updated_at || existing.role_updated_at,
          }
        } else {
          state.users.unshift(usr)
        }
        break
      }

      case 'update_user_role': {
        const {
          id,
          role,
          email,
          full_name,
          first_name,
          last_name,
          avatar_url,
          created_at,
          role_updated_at,
        } = payload
        const cleanEmail = (email || '').trim().toLowerCase()
        const updatedAt = role_updated_at || new Date().toISOString()
        let matched = false

        state.users = state.users.map((u) => {
          if (u.id === id || (cleanEmail && (u.email || '').toLowerCase() === cleanEmail)) {
            matched = true
            return {
              ...u,
              role,
              role_updated_at: updatedAt,
              email: u.email || email || 'usuario@maestrotech.co',
              full_name: u.full_name || full_name || 'Docente MaestroTech',
              first_name: u.first_name ?? first_name ?? null,
              last_name: u.last_name ?? last_name ?? null,
              avatar_url: u.avatar_url ?? avatar_url ?? null,
            }
          }
          return u
        })

        if (!matched && id) {
          state.users.unshift({
            id,
            email: email || 'usuario@maestrotech.co',
            full_name: full_name || 'Docente MaestroTech',
            first_name: first_name ?? null,
            last_name: last_name ?? null,
            role,
            role_updated_at: updatedAt,
            avatar_url: avatar_url ?? null,
            created_at: created_at || new Date().toISOString(),
          })
        }
        break
      }

      case 'upsert_exam_question': {
        const q = payload
        const idx = state.exam_questions.findIndex((item) => item.id === q.id)
        if (idx >= 0) {
          state.exam_questions[idx] = { ...state.exam_questions[idx], ...q }
        } else {
          state.exam_questions.push(q)
        }
        break
      }

      case 'delete_exam_question': {
        const { id } = payload
        state.exam_questions = state.exam_questions.filter((q) => q.id !== id)
        break
      }

      case 'delete_user': {
        const { id, email } = payload
        const cleanEmail = (email || '').trim().toLowerCase()
        if (!state.deletedUserIds) state.deletedUserIds = []
        if (id && !state.deletedUserIds.includes(id)) {
          state.deletedUserIds.push(id)
        }
        state.users = state.users.filter(
          (u) => u.id !== id && (!cleanEmail || (u.email || '').toLowerCase() !== cleanEmail)
        )
        if (id) {
          state.enrollments = state.enrollments.filter((e) => e.user_id !== id)
          state.lesson_progress = state.lesson_progress.filter((p) => p.user_id !== id)
          state.certificates = state.certificates.filter((c) => c.user_id !== id)
        }
        break
      }

      default:
        return NextResponse.json({ error: `Acción desconocida: ${action}` }, { status: 400 })
    }

    writeStore(state)
    return NextResponse.json({ success: true, state })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar estado'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
