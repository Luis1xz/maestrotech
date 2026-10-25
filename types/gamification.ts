export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  category: 'onboarding' | 'resilience' | 'mastery' | 'streak' | 'simulation'
  xpReward: number
  unlockedAt?: string
  isNew?: boolean
}

export interface MasteryLevel {
  level: number
  title: string
  minXp: number
  maxXp: number
  badgeReward: string
  color: string
}

export const MASTERY_LEVELS: MasteryLevel[] = [
  {
    level: 1,
    title: 'Docente Explorador',
    minXp: 0,
    maxXp: 150,
    badgeReward: '🌱 Primeros pasos pedagógicos',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    level: 2,
    title: 'Docente Reflexivo',
    minXp: 150,
    maxXp: 400,
    badgeReward: '💡 Pensamiento crítico activo',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    level: 3,
    title: 'Formador Innovador',
    minXp: 400,
    maxXp: 800,
    badgeReward: '🚀 Innovación en el aula',
    color: 'from-violet-500 to-purple-500',
  },
  {
    level: 4,
    title: 'Especialista Pedagógico',
    minXp: 800,
    maxXp: 1500,
    badgeReward: '🎯 Dominio de evaluación y normas',
    color: 'from-amber-500 to-orange-500',
  },
  {
    level: 5,
    title: 'Maestro Mentor CNSC',
    minXp: 1500,
    maxXp: 3000,
    badgeReward: '👑 Excelencia y liderazgo docente',
    color: 'from-emerald-500 to-teal-600',
  },
]

export const ALL_BADGES: Badge[] = [
  {
    id: 'pioneer',
    title: 'Pionero del Aprendizaje',
    description: 'Completaste con éxito tu primer caso situacional en MaestroTech.',
    icon: 'Sparkles',
    category: 'onboarding',
    xpReward: 50,
  },
  {
    id: 'resilient_mind',
    title: 'Mente Resiliente',
    description: 'Aprendiste de un error, analizaste la pista y volviste a intentarlo con éxito.',
    icon: 'HeartHandshake',
    category: 'resilience',
    xpReward: 40,
  },
  {
    id: 'streak_3',
    title: 'Constancia Docente',
    description: 'Mantuviste una racha de práctica activa por 3 días seguidos.',
    icon: 'Flame',
    category: 'streak',
    xpReward: 60,
  },
  {
    id: 'eval_expert',
    title: 'Experto en Decreto 1278',
    description: 'Demostraste dominio normativo en preguntas sobre el estatuto docente.',
    icon: 'Award',
    category: 'mastery',
    xpReward: 75,
  },
  {
    id: 'pedagogy_master',
    title: 'Estratega Constructivista',
    description: 'Resolviste correctamente situaciones complejas de mediación pedagógica.',
    icon: 'Brain',
    category: 'mastery',
    xpReward: 80,
  },
  {
    id: 'simulator_hero',
    title: 'Conquistador de Simulacro',
    description: 'Completaste un simulacro oficial CNSC con más del 70% de aciertos.',
    icon: 'Trophy',
    category: 'simulation',
    xpReward: 100,
  },
]

export interface TopicPerformance {
  topic: string
  scorePercent: number
  totalAnswered: number
  status: 'strength' | 'reinforce'
  suggestion: string
}

export interface UserGamificationState {
  xp: number
  level: number
  levelTitle: string
  nextLevelXp: number
  streakDays: number
  lastActivityDate: string
  unlockedBadges: Badge[]
  strengths: TopicPerformance[]
  improvementAreas: TopicPerformance[]
  recommendations: {
    id: string
    title: string
    description: string
    actionText: string
    targetView: string
    courseSlug?: string
  }[]
  welcomeCompleted: boolean
}
