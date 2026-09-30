'use client'

import { useState, useEffect, useCallback } from 'react'
import { CourseWithHierarchy } from '@/types/database'
import { getCourseBySlug } from '@/services/courses'
import { enrollInCourse } from '@/services/enrollments'

export function useCourse(slug: string, userId?: string) {
  const [course, setCourse] = useState<CourseWithHierarchy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  const fetchCourse = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setError(null)

    const { data, error: err, isDemo: demo } = await getCourseBySlug(slug, userId)

    if (err) {
      setError(err.message)
      setCourse(null)
    } else {
      setCourse(data)
      setIsDemo(Boolean(demo))
    }

    setLoading(false)
  }, [slug, userId])

  useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

  const enroll = async () => {
    if (!userId || !course) {
      return { success: false, error: 'Debes iniciar sesión para matricularte' }
    }

    setEnrolling(true)
    const { data, error: err } = await enrollInCourse(userId, course.id)
    setEnrolling(false)

    if (err) {
      return { success: false, error: err.message }
    }

    // Actualizar datos del curso con la nueva matrícula
    await fetchCourse()
    return { success: true, error: null, enrollment: data }
  }

  const isEnrolled = Boolean(course?.enrollment && course.enrollment.status === 'active')

  return {
    course,
    loading,
    error,
    isDemo,
    isEnrolled,
    enrolling,
    enroll,
    refetch: fetchCourse,
  }
}
