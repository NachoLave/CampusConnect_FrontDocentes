import { useState, useEffect } from 'react'
import { AvailabilityBlock, CreateAvailabilityBlockRequest } from '@/lib/types'
import { TeacherService } from '@/lib/api/services/teacher'

interface UseAvailabilityReturn {
  availability: AvailabilityBlock[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  addAvailability: (block: CreateAvailabilityBlockRequest) => Promise<AvailabilityBlock | null>
  deleteAvailability: (blockId: number) => Promise<boolean>
  updateAvailabilityBlock: (blockId: number, data: { campuses: string[], modality?: string }) => Promise<boolean>
}

/**
 * Hook para gestionar la disponibilidad horaria del docente
 * Consume los endpoints GET/POST/DELETE/PATCH /teachers/me/availability
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

  const addAvailability = async (block: CreateAvailabilityBlockRequest): Promise<AvailabilityBlock | null> => {
    try {
      const response = await TeacherService.addAvailabilityBlock(block)
      
      if (response.success && response.data) {
        return response.data // Devolver el bloque creado con su ID real
      } else {
        setError(response.error || 'Error al agregar el bloque')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return null
    }
  }

  const deleteAvailability = async (blockId: number): Promise<boolean> => {
    try {
      const response = await TeacherService.deleteAvailabilityBlock(blockId)
      
      if (response.success) {
        return true
      } else {
        setError(response.error || 'Error al eliminar el bloque')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return false
    }
  }

  const updateAvailabilityBlock = async (
    blockId: number, 
    data: { campuses: string[], modality?: string }
  ): Promise<boolean> => {
    try {
      const response = await TeacherService.updateAvailabilityBlock(blockId, data)
      
      if (response.success) {
        return true
      } else {
        setError(response.error || 'Error al actualizar la disponibilidad del bloque')
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
    addAvailability,
    deleteAvailability,
    updateAvailabilityBlock
  }
}

