import { INITIAL_PLATFORM_STATE, PlatformStateData } from './platform-store'

const LOCAL_STORAGE_KEY = 'maestrotech_platform_state_v3'
const DELETED_IDS_KEY = 'maestrotech_deleted_ids_v3'

let cachedState: PlatformStateData | null = null

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return ''
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

function getDeletedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY)
    if (raw) {
      return new Set(JSON.parse(raw) as string[])
    }
  } catch {
    // ignore
  }
  return new Set()
}

function addDeletedId(id: string) {
  if (typeof window === 'undefined' || !id) return
  try {
    const set = getDeletedIds()
    set.add(id)
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)))
  } catch {
    // ignore
  }
}

function removeDeletedId(id: string) {
  if (typeof window === 'undefined' || !id) return
  try {
    const set = getDeletedIds()
    if (set.has(id)) {
      set.delete(id)
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)))
    }
  } catch {
    // ignore
  }
}

function readLocalState(): PlatformStateData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as PlatformStateData
    }
  } catch {
    // ignore
  }
  return null
}

function saveLocalState(state: PlatformStateData) {
  cachedState = state
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota error
  }
}

function mergeById<T extends { id: string }>(
  localArr: T[] | undefined,
  serverArr: T[] | undefined,
  deleted: Set<string>
): T[] {
  const map = new Map<string, T>()
  for (const item of serverArr || []) {
    if (item && item.id && !deleted.has(item.id)) {
      map.set(item.id, item)
    }
  }
  for (const item of localArr || []) {
    if (item && item.id && !deleted.has(item.id)) {
      const existing = map.get(item.id)
      if (existing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serverRoleTs = (existing as any).role_updated_at || ''
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const localRoleTs = (item as any).role_updated_at || ''
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serverIsAdminWithoutTs = !serverRoleTs && !localRoleTs && (existing as any).role === 'admin'
        if ((serverRoleTs && serverRoleTs > localRoleTs) || serverIsAdminWithoutTs) {
          map.set(item.id, { ...item, ...existing })
        } else {
          map.set(item.id, { ...existing, ...item })
        }
      } else {
        map.set(item.id, item)
      }
    }
  }
  return Array.from(map.values())
}

function mergeStates(
  local: PlatformStateData | null,
  server: PlatformStateData
): PlatformStateData {
  if (!local) return server
  const deleted = getDeletedIds()
  for (const delId of local.deletedCourseIds || []) deleted.add(delId)
  for (const delId of server.deletedCourseIds || []) deleted.add(delId)

  return {
    courses: mergeById(local.courses, server.courses, deleted),
    modules: mergeById(local.modules, server.modules, deleted).sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0)
    ),
    lessons: mergeById(local.lessons, server.lessons, deleted).sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0)
    ),
    materials: mergeById(local.materials, server.materials, deleted),
    enrollments: mergeById(local.enrollments, server.enrollments, deleted),
    lesson_progress: mergeById(local.lesson_progress, server.lesson_progress, deleted),
    certificates: mergeById(local.certificates, server.certificates, deleted),
    users: mergeById(local.users, server.users, deleted),
    exam_questions: mergeById(local.exam_questions, server.exam_questions, deleted),
    deletedCourseIds: Array.from(deleted),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyMutationToState(state: PlatformStateData, action: string, payload: any): void {
  switch (action) {
    case 'upsert_course': {
      const course = payload
      removeDeletedId(course.id)
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
      addDeletedId(id)
      state.courses = state.courses.filter((c) => c.id !== id)
      if (!state.deletedCourseIds) state.deletedCourseIds = []
      if (!state.deletedCourseIds.includes(id)) state.deletedCourseIds.push(id)
      break
    }

    case 'upsert_module': {
      const mod = payload
      removeDeletedId(mod.id)
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
      addDeletedId(id)
      const lessonIds = state.lessons.filter((l) => l.module_id === id).map((l) => l.id)
      for (const lid of lessonIds) addDeletedId(lid)
      state.modules = state.modules.filter((m) => m.id !== id)
      state.lessons = state.lessons.filter((l) => l.module_id !== id)
      state.materials = state.materials.filter((mat) => !lessonIds.includes(mat.lesson_id))
      break
    }

    case 'upsert_lesson': {
      const lesson = payload
      removeDeletedId(lesson.id)
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
      addDeletedId(id)
      state.lessons = state.lessons.filter((l) => l.id !== id)
      state.materials = state.materials.filter((m) => m.lesson_id !== id)
      break
    }

    case 'upsert_material': {
      const mat = payload
      removeDeletedId(mat.id)
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
      addDeletedId(id)
      state.materials = state.materials.filter((m) => m.id !== id)
      break
    }

    case 'upsert_enrollment': {
      const enr = payload
      removeDeletedId(enr.id)
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
      removeDeletedId(q.id)
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
      addDeletedId(id)
      state.exam_questions = state.exam_questions.filter((q) => q.id !== id)
      break
    }
  }
}

export async function fetchPlatformState(): Promise<PlatformStateData> {
  const local = readLocalState() || cachedState

  try {
    const res = await fetch(`${getBaseUrl()}/api/platform-state`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const rawText = await res.text()
      const serverData = JSON.parse(rawText) as PlatformStateData
      const merged = mergeStates(local, serverData)
      saveLocalState(merged)
      return merged
    }
  } catch {
    // Fallback a local o memoria
  }

  if (local) {
    cachedState = local
    return local
  }

  if (!cachedState) {
    cachedState = structuredClone(INITIAL_PLATFORM_STATE)
  }
  return cachedState
}

export async function mutatePlatformState(
  action: string,
  payload: unknown
): Promise<PlatformStateData> {
  // 1. Aplicar mutación inmediatamente en estado local del navegador (inmune a rotación de instancias en Vercel)
  const baseState = structuredClone(
    readLocalState() || cachedState || INITIAL_PLATFORM_STATE
  )
  applyMutationToState(baseState, action, payload)
  saveLocalState(baseState)

  // 2. Sincronizar también con el servidor (/api/platform-state)
  try {
    const res = await fetch(`${getBaseUrl()}/api/platform-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    })
    if (res.ok) {
      const rawText = await res.text()
      const json = JSON.parse(rawText)
      if (json?.state) {
        const merged = mergeStates(baseState, json.state as PlatformStateData)
        saveLocalState(merged)
        return merged
      }
    }
  } catch {
    // El estado local ya fue actualizado exitosamente arriba
  }

  return baseState
}
