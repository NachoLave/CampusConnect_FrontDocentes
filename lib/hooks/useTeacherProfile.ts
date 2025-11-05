import { useState, useEffect } from 'react'
import { TeacherProfile } from '@/lib/types'
import { TeacherService } from '@/lib/api/services/teacher'

interface UseTeacherProfileReturn {
  profile: TeacherProfile | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener el perfil del docente autenticado
 * Consume el endpoint GET /teachers/me
 */
export function useTeacherProfile(): UseTeacherProfileReturn {
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await TeacherService.getProfile()
      
      if (response.success && response.data) {
        setProfile(response.data)
      } else {
        setError(response.error || 'Error al cargar el perfil')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile
  }
}

