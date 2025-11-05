import { useState, useEffect } from 'react'
import { AvailabilityBlock, UpdateAvailabilityRequest } from '@/lib/types'
import { TeacherService } from '@/lib/api/services/teacher'

interface UseAvailabilityReturn {
  availability: AvailabilityBlock[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateAvailability: (blocks: AvailabilityBlock[]) => Promise<boolean>
}

/**
 * Hook para gestionar la disponibilidad horaria del docente
 * Consume los endpoints GET/PUT /teachers/me/availability
 */
export function useAvailability(): UseAvailabilityReturn {
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailability = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await TeacherService.getAvailability()
      
      if (response.success && response.data) {
        setAvailability(response.data)
      } else {
        setError(response.error || 'Error al cargar la disponibilidad')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const updateAvailability = async (blocks: AvailabilityBlock[]): Promise<boolean> => {
    try {
      const request: UpdateAvailabilityRequest = { blocks }
      const response = await TeacherService.updateAvailability(request)
      
      if (response.success) {
        await fetchAvailability() // Recargar la lista
        return true
      } else {
        setError(response.error || 'Error al actualizar la disponibilidad')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return false
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [])

  return {
    availability,
    isLoading,
    error,
    refetch: fetchAvailability,
    updateAvailability
  }
}

