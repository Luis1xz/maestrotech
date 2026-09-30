'use client'

import { useState, useEffect, useCallback } from 'react'
import { Profile } from '@/types/database'
import { getProfile, updateProfile } from '@/services/profiles'

export function useProfile(userId?: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: err } = await getProfile(userId)
    if (err) {
      setError(err.message)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const saveProfile = async (updates: Partial<Profile>) => {
    if (!userId) return { success: false, error: 'No autenticado' }
    const { data, error: err } = await updateProfile(userId, updates)
    if (err) {
      return { success: false, error: err.message }
    }
    setProfile(data)
    return { success: true, error: null, data }
  }

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    saveProfile,
  }
}
