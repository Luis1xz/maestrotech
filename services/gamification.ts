import {
  ALL_BADGES,
  Badge,
  MASTERY_LEVELS,
  MasteryLevel,
  TopicPerformance,
  UserGamificationState,
} from '@/types/gamification'

export type { Badge, MasteryLevel, TopicPerformance, UserGamificationState }

const STORAGE_KEY = 'legadodocente_gamification_v4'

function getInitialState(): UserGamificationState {
  return {
    xp: 0,
    level: 1,
    levelTitle: 'Aspirante Inicial',
    nextLevelXp: 100,
    streakDays: 0,
    lastActivityDate: new Date().toISOString(),
    unlockedBadges: [],
    strengths: [],
    improvementAreas: [],
    recommendations: [],
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

export interface CompetencyRadarItem {
  subject: string
  A: number
  fullMark: number
}

export function getCompetencyRadarData(gamification: UserGamificationState): {
  hasDiagnosticData: boolean
  radarData: CompetencyRadarItem[]
} {
  const hasDiagnosticData =
    gamification.strengths.length > 0 ||
    gamification.improvementAreas.length > 0 ||
    gamification.xp > 0

  const COMPETENCY_DEFINITIONS = [
    { subject: 'Pedagogía', keywords: ['pedagogía', 'currículo', 'constructivismo', 'aprendizaje'] },
    { subject: 'Legislación 1278', keywords: ['legislación', '1278', 'estatuto', 'normativa'] },
    { subject: 'Evaluación Formativa', keywords: ['evaluación', '1290', 'siee'] },
    { subject: 'Juicio Situacional', keywords: ['situacional', 'convivencia', '1620', 'conflicto'] },
    { subject: 'Lectura Crítica', keywords: ['lectura', 'crítica', 'análisis', 'textual'] },
  ]

  const radarData: CompetencyRadarItem[] = COMPETENCY_DEFINITIONS.map((def) => {
    const matchStr = gamification.strengths.find((s) =>
      def.keywords.some((k) => s.topic.toLowerCase().includes(k))
    )
    if (matchStr) {
      return { subject: def.subject, A: matchStr.scorePercent, fullMark: 100 }
    }

    const matchImp = gamification.improvementAreas.find((i) =>
      def.keywords.some((k) => i.topic.toLowerCase().includes(k))
    )
    if (matchImp) {
      return { subject: def.subject, A: matchImp.scorePercent, fullMark: 100 }
    }

    return { subject: def.subject, A: 0, fullMark: 100 }
  })

  return { hasDiagnosticData, radarData }
}

export interface ProgressDataPoint {
  day: string
  score: number
}

export function getUserProgressCurve(gamification: UserGamificationState, totalHours: number = 0): {
  hasProgressData: boolean
  progressData: ProgressDataPoint[]
} {
  const hasProgressData = gamification.xp > 0 || totalHours > 0
  if (!hasProgressData) {
    return {
      hasProgressData: false,
      progressData: [
        { day: 'L', score: 0 },
        { day: 'M', score: 0 },
        { day: 'X', score: 0 },
        { day: 'J', score: 0 },
        { day: 'V', score: 0 },
        { day: 'S', score: 0 },
        { day: 'D', score: 0 },
      ],
    }
  }

  let avgScore = 75
  if (gamification.strengths.length > 0 || gamification.improvementAreas.length > 0) {
    const all = [...gamification.strengths, ...gamification.improvementAreas]
    avgScore = Math.round(all.reduce((acc, curr) => acc + curr.scorePercent, 0) / all.length)
  }

  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const todayIdx = (new Date().getDay() + 6) % 7 // Monday = 0

  const progressData: ProgressDataPoint[] = days.map((day, idx) => {
    if (idx < todayIdx) {
      return { day, score: Math.max(30, avgScore - (todayIdx - idx) * 4) }
    } else if (idx === todayIdx) {
      return { day, score: avgScore }
    } else {
      return { day, score: 0 }
    }
  })

  return { hasProgressData, progressData }
}

