import { useState, useEffect } from 'react'
import { Subject } from '@/lib/types'
import { SubjectsService } from '@/lib/api/services/subjects'

interface UseSubjectsReturn {
  subjects: Subject[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener todas las materias disponibles
 * Consume el endpoint GET /admin/subjects
 */
export function useSubjects(): UseSubjectsReturn {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await SubjectsService.getAllSubjects()
      
      if (response.success && response.data) {
        setSubjects(response.data)
      } else {
        setError(response.error || 'Error al cargar las materias')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  return {
    subjects,
    isLoading,
    error,
    refetch: fetchSubjects
  }
}

