import { CourseWithHierarchy, Profile } from '@/types/database'
import { FLAGSHIP_COURSE_ID, FLAGSHIP_COURSE_SLUG, INITIAL_PLATFORM_STATE } from '@/lib/platform-store'

export const DEMO_PROFILE: Profile = {
  id: 'demo-user-id',
  full_name: 'Docente Demo',
  first_name: 'Docente',
  last_name: 'Demo',
  avatar_url: null,
  role: 'student',
  created_at: new Date().toISOString(),
}

const baseCourse = INITIAL_PLATFORM_STATE.courses[0]

export const DEMO_COURSES: CourseWithHierarchy[] = [
  {
    ...baseCourse,
    modules: INITIAL_PLATFORM_STATE.modules.map((m) => {
      const moduleLessons = INITIAL_PLATFORM_STATE.lessons.filter((l) => l.module_id === m.id)
      return {
        ...m,
        lessons: moduleLessons.map((l) => {
          const mats = INITIAL_PLATFORM_STATE.materials.filter((mat) => mat.lesson_id === l.id)
          const prog = INITIAL_PLATFORM_STATE.lesson_progress.find((p) => p.lesson_id === l.id)
          return {
            ...l,
            materials: mats,
            progress: prog || null,
          }
        }),
      }
    }),
    stats: {
      totalLessons: INITIAL_PLATFORM_STATE.lessons.length,
      completedLessons: 1,
      percentComplete: Math.round((1 / INITIAL_PLATFORM_STATE.lessons.length) * 100),
      totalDurationSeconds: INITIAL_PLATFORM_STATE.lessons.reduce((acc, curr) => acc + curr.duration_seconds, 0),
    },
  },
]
