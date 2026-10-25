import {
  ALL_BADGES,
  Badge,
  MASTERY_LEVELS,
  MasteryLevel,
  TopicPerformance,
  UserGamificationState,
} from '@/types/gamification'

export type { Badge, MasteryLevel, TopicPerformance, UserGamificationState }

const STORAGE_KEY = 'maestrotech_gamification_v2'

function getInitialState(): UserGamificationState {
  return {
    xp: 85,
    level: 1,
    levelTitle: 'Docente Explorador',
    nextLevelXp: 150,
    streakDays: 3,
    lastActivityDate: new Date().toISOString(),
    unlockedBadges: [
      {
        ...ALL_BADGES[0], // Pionero
        unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        ...ALL_BADGES[2], // Racha
        unlockedAt: new Date().toISOString(),
      },
    ],
    strengths: [
      {
        topic: 'Pedagogía Crítica y Constructivismo',
        scorePercent: 92,
        totalAnswered: 8,
        status: 'strength',
        suggestion: '¡Excelente dominio! Tienes claridad en la mediación activa y el andamiaje formativo.',
      },
      {
        topic: 'Lectura Crítica y Análisis Textual',
        scorePercent: 88,
        totalAnswered: 6,
        status: 'strength',
        suggestion: 'Gran capacidad de inferencia en textos argumentativos y normativos.',
      },
    ],
    improvementAreas: [
      {
        topic: 'Legislación y Estatuto 1278',
        scorePercent: 54,
        totalAnswered: 7,
        status: 'reinforce',
        suggestion: 'Repasa el debido proceso disciplinario docente y las funciones del Gobierno Escolar.',
      },
      {
        topic: 'Evaluación Formativa (Decreto 1290)',
        scorePercent: 58,
        totalAnswered: 5,
        status: 'reinforce',
        suggestion: 'Fortalece la distinción entre criterios de evaluación sumativa y formativa.',
      },
    ],
    recommendations: [
      {
        id: 'rec_1278',
        title: 'Módulo: Decreto 1278 y Carrera Docente',
        description: 'Refuerza tu conocimiento sobre el concurso de méritos, periodo de prueba y escalafón.',
        actionText: 'Estudiar lección clave',
        targetView: 'courses',
        courseSlug: 'pedagogia-critica-y-constructivismo',
      },
      {
        id: 'rec_sim',
        title: 'Entrenamiento de Casos Situacionales',
        description: 'Realiza un mini-simulacro de 3 preguntas enfocado en resolución pacífica de conflictos.',
        actionText: 'Practicar casos',
        targetView: 'exam',
      },
    ],
    welcomeCompleted: false,
  }
}

export function getUserGamification(userId?: string): UserGamificationState {
  if (typeof window === 'undefined') return getInitialState()
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw) as UserGamificationState
      // Ensure calculation stays consistent
      const levelInfo = getLevelInfo(parsed.xp || 0)
      return {
        ...parsed,
        level: levelInfo.level,
        levelTitle: levelInfo.title,
        nextLevelXp: levelInfo.maxXp,
      }
    }
  } catch {
    // fallback
  }
  const initial = getInitialState()
  saveUserGamification(initial, userId)
  return initial
}

export function saveUserGamification(state: UserGamificationState, userId?: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY
    localStorage.setItem(key, JSON.stringify(state))
  } catch {
    // ignore quota
  }
}

export function getLevelInfo(xp: number): MasteryLevel {
  for (const lvl of MASTERY_LEVELS) {
    if (xp >= lvl.minXp && xp < lvl.maxXp) {
      return lvl
    }
  }
  return MASTERY_LEVELS[MASTERY_LEVELS.length - 1]
}

export function addXp(
  amount: number,
  userId?: string
): { state: UserGamificationState; leveledUp: boolean; newLevel: MasteryLevel } {
  const current = getUserGamification(userId)
  const prevLevel = getLevelInfo(current.xp).level
  const newXp = current.xp + amount
  const newLevelInfo = getLevelInfo(newXp)
  const leveledUp = newLevelInfo.level > prevLevel

  const updated: UserGamificationState = {
    ...current,
    xp: newXp,
    level: newLevelInfo.level,
    levelTitle: newLevelInfo.title,
    nextLevelXp: newLevelInfo.maxXp,
    lastActivityDate: new Date().toISOString(),
  }

  saveUserGamification(updated, userId)
  return { state: updated, leveledUp, newLevel: newLevelInfo }
}

export function unlockBadge(
  badgeId: string,
  userId?: string
): { state: UserGamificationState; badge: Badge | null; isNewlyUnlocked: boolean } {
  const current = getUserGamification(userId)
  const badgeDef = ALL_BADGES.find((b) => b.id === badgeId)
  if (!badgeDef) return { state: current, badge: null, isNewlyUnlocked: false }

  const already = current.unlockedBadges.some((b) => b.id === badgeId)
  if (already) {
    return { state: current, badge: badgeDef, isNewlyUnlocked: false }
  }

  const unlockedBadge: Badge = {
    ...badgeDef,
    unlockedAt: new Date().toISOString(),
    isNew: true,
  }

  const nextXp = current.xp + badgeDef.xpReward
  const lvl = getLevelInfo(nextXp)

  const updated: UserGamificationState = {
    ...current,
    xp: nextXp,
    level: lvl.level,
    levelTitle: lvl.title,
    nextLevelXp: lvl.maxXp,
    unlockedBadges: [unlockedBadge, ...current.unlockedBadges],
  }

  saveUserGamification(updated, userId)
  return { state: updated, badge: unlockedBadge, isNewlyUnlocked: true }
}

export function recordQuestionAnswer(params: {
  competency: string
  isCorrect: boolean
  isRetry: boolean
  userId?: string
}): { state: UserGamificationState; xpGained: number; badgeUnlocked?: Badge } {
  let xp = params.isCorrect ? (params.isRetry ? 15 : 25) : 5 // Points given for effort even when wrong!
  let badgeToUnlock: string | null = null

  if (params.isCorrect && params.isRetry) {
    badgeToUnlock = 'resilient_mind'
    xp += 10
  }

  const res = addXp(xp, params.userId)
  let finalState = res.state
  let unlockedBadgeObj: Badge | undefined

  if (badgeToUnlock) {
    const badgeRes = unlockBadge(badgeToUnlock, params.userId)
    if (badgeRes.isNewlyUnlocked && badgeRes.badge) {
      finalState = badgeRes.state
      unlockedBadgeObj = badgeRes.badge
    }
  }

  // Update strengths / improvement areas dynamically
  const compName = params.competency || 'Pedagogía y Evaluación'
  const cleanComp = compName.trim()

  const existingStrength = finalState.strengths.find((s) => s.topic.toLowerCase().includes(cleanComp.toLowerCase()))
  const existingImprove = finalState.improvementAreas.find((s) => s.topic.toLowerCase().includes(cleanComp.toLowerCase()))

  if (params.isCorrect) {
    if (!existingStrength) {
      finalState.strengths = [
        {
          topic: cleanComp,
          scorePercent: 90,
          totalAnswered: 1,
          status: 'strength' as const,
          suggestion: '¡Dominio demostrado en esta competencia! Sigue afianzando tus conocimientos.',
        },
        ...finalState.strengths,
      ].slice(0, 4)
    }
    if (existingImprove) {
      existingImprove.scorePercent = Math.min(85, existingImprove.scorePercent + 15)
      if (existingImprove.scorePercent >= 75) {
        finalState.improvementAreas = finalState.improvementAreas.filter((s) => s.topic !== existingImprove.topic)
      }
    }
  } else {
    if (!existingImprove && !existingStrength) {
      finalState.improvementAreas = [
        {
          topic: cleanComp,
          scorePercent: 50,
          totalAnswered: 1,
          status: 'reinforce' as const,
          suggestion: 'Revisa las lecturas recomendadas y casos prácticos sobre este eje.',
        },
        ...finalState.improvementAreas,
      ].slice(0, 4)
    }
  }

  saveUserGamification(finalState, params.userId)
  return { state: finalState, xpGained: xp, badgeUnlocked: unlockedBadgeObj }
}

export function recordWelcomeCaseCompleted(userId?: string): {
  state: UserGamificationState
  badge: Badge
  xpGained: number
} {
  const current = getUserGamification(userId)
  const badgeRes = unlockBadge('pioneer', userId)
  const updated: UserGamificationState = {
    ...badgeRes.state,
    welcomeCompleted: true,
  }
  saveUserGamification(updated, userId)
  const pioneerBadge = ALL_BADGES.find((b) => b.id === 'pioneer') || ALL_BADGES[0]
  return {
    state: updated,
    badge: pioneerBadge,
    xpGained: pioneerBadge.xpReward,
  }
}
