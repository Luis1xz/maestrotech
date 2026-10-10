'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { CourseWithHierarchy } from '@/types/database'
import { getCourseBySlug } from '@/services/courses'

export function useCourse(slug: string, userId?: string) {
  const [course, setCourse] = useState<CourseWithHierarchy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const hasLoadedOnceRef = useRef<string | null>(null)

  const fetchCourse = useCallback(
    async (silent = false) => {
      if (!slug) return
      const cacheKey = `${slug}:${userId || 'anon'}`
      if (!silent && hasLoadedOnceRef.current !== cacheKey) {
        setLoading(true)
      }
      setError(null)

      const { data, error: err, isDemo: demo } = await getCourseBySlug(slug, userId)

      if (err) {
        setError(err.message)
        if (!silent) setCourse(null)
      } else {
        setCourse(data)
        setIsDemo(Boolean(demo))
        hasLoadedOnceRef.current = cacheKey
      }

      setLoading(false)
    },
    [slug, userId]
  )

  useEffect(() => {
    fetchCourse(false)
  }, [fetchCourse])

  const refetch = useCallback(async () => {
    await fetchCourse(true)
  }, [fetchCourse])

  const isEnrolled = Boolean(course?.enrollment && course.enrollment.status === 'active')

  return {
    course,
    loading,
    error,
    isDemo,
    isEnrolled,
    refetch,
  }
}
