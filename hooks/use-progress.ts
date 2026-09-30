'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUserGlobalProgress, updateLessonProgress, UserGlobalProgress } from '@/services/progress'

export function useProgress(userId?: string | null) {
  const [stats, setStats] = useState<UserGlobalProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setStats(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: err } = await getUserGlobalProgress(userId)

    if (err) {
      setError(err.message)
    } else {
      setStats(data)
    }

    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const recordProgress = async (
    lessonId: string,
    data: {
      watched_seconds?: number
      last_position_seconds?: number
      completed?: boolean
    }
  ) => {
    if (!userId) return null
    const res = await updateLessonProgress(userId, lessonId, data)
    return res
  }

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    recordProgress,
  }
}
