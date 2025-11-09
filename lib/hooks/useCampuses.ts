import { useState, useEffect } from 'react'
import { Campus } from '@/lib/types'
import { AdminService } from '@/lib/api/services/admin'

interface UseCampusesReturn {
  campuses: Campus[]
  isLoading: boolean
  error: string | null
}

/**
 * Hook para obtener las sedes activas
 * Consume el endpoint GET /admin/sedes?onlyActive=true
 */
export function useCampuses(): UseCampusesReturn {
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await AdminService.getActiveCampuses()
        
        if (response.success && response.data) {
          setCampuses(response.data)
        } else {
          setError(response.error || 'Error al cargar las sedes')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampuses()
  }, [])

  return {
    campuses,
    isLoading,
    error
  }
}

