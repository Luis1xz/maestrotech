'use client'

import { useState, useEffect, useCallback } from 'react'
import { Course } from '@/types/database'
import { getCourses } from '@/services/courses'

interface UseCoursesOptions {
  featuredOnly?: boolean
  category?: string
  autoFetch?: boolean
}

export function useCourses(options?: UseCoursesOptions) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err, isDemo: demo } = await getCourses({
      featuredOnly: options?.featuredOnly,
      category: options?.category,
    })

    if (err) {
      setError(err.message)
      setCourses([])
    } else {
      setCourses(data || [])
      setIsDemo(Boolean(demo))
    }

    setLoading(false)
  }, [options?.featuredOnly, options?.category])

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchCourses()
    }
  }, [fetchCourses, options?.autoFetch])

  return {
    courses,
    loading,
    error,
    isDemo,
    refetch: fetchCourses,
  }
}
