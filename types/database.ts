export type UserRole = 'student' | 'instructor' | 'admin'
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type VideoProvider = 'cloudflare' | 'cloudflare_stream' | 'youtube' | 'vimeo' | 'custom' | 'mock'

export interface Profile {
  id: string
  full_name: string | null
  first_name?: string | null
  last_name?: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at?: string | null
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  price: number
  published: boolean
  featured: boolean
  level?: string | null
  category?: string | null
  instructor_id?: string | null
  instructor_name?: string | null
  instructor_role?: string | null
  duration_hours?: number | null
  created_at: string
  updated_at?: string | null
}

export interface Module {
  id: string
  course_id: string
  title: string
  description: string | null
  order_index: number
  created_at: string
  // Virtual / joined fields
  lessons?: Lesson[]
  lessons_count?: number
  completed_lessons_count?: number
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  description: string | null
  order_index: number
  video_provider: VideoProvider | string | null
  video_id: string | null
  duration_seconds: number
  is_preview: boolean
  published: boolean
  created_at: string
  // Virtual / joined fields
  materials?: Material[]
  progress?: LessonProgress | null
}

export interface Material {
  id: string
  lesson_id: string
  title: string
  file_url: string
  file_type: string
  file_size: number
  is_free?: boolean
  created_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  status: EnrollmentStatus
  // Virtual / joined fields
  course?: Course
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  watched_seconds: number
  last_position_seconds: number
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  course_id: string
  amount: number
  currency: string
  provider: string
  provider_payment_id: string | null
  status: PaymentStatus
  created_at: string
  // Virtual / joined fields
  course?: Course
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  certificate_url: string
  // Virtual / joined fields
  course?: Course
}

/**
 * Course with complete hierarchy: modules -> lessons -> materials
 */
export interface CourseWithHierarchy extends Course {
  modules: (Module & {
    lessons: (Lesson & {
      materials: Material[]
      progress?: LessonProgress | null
    })[]
  })[]
  enrollment?: Enrollment | null
  stats?: {
    totalLessons: number
    completedLessons: number
    percentComplete: number
    totalDurationSeconds: number
  }
}

/**
 * Course summary in student dashboard
 */
export interface EnrolledCourseSummary {
  enrollment: Enrollment
  course: Course
  totalLessons: number
  completedLessons: number
  percentComplete: number
  lastLesson?: {
    id: string
    title: string
    moduleId: string
    moduleTitle: string
    lastPositionSeconds: number
  } | null
}

// ==========================================
// MODELO DE PERMISOS JERÁRQUICO
// admin (Superusuario) >= instructor (Docente) >= student (Estudiante)
// ==========================================

export const isSuperAdmin = (role: UserRole | null | undefined): boolean => role === 'admin'
export const canAccessAdmin = (role: UserRole | null | undefined): boolean => role === 'admin'
export const canAccessTeacher = (role: UserRole | null | undefined): boolean => role === 'admin' || role === 'instructor'
export const canManageUsers = (role: UserRole | null | undefined): boolean => role === 'admin'
export const canCreateContent = (role: UserRole | null | undefined): boolean => role === 'admin' || role === 'instructor'

export interface AdminUserListItem extends Profile {
  email?: string
  enrollments_count?: number
}

export interface CreateUserPayload {
  firstName: string
  lastName: string
  email: string
  temporaryPassword: string
  role: UserRole
}
