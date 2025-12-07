import { useState, useEffect } from 'react'
import { Proposal, CreateProposalRequest } from '@/lib/types'
import { TeacherService } from '@/lib/api/services/teacher'

interface UseProposalsReturn {
  proposals: Proposal[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createProposal: (subjectId: number | string) => Promise<boolean>
  deleteProposal: (subjectId: number | string) => Promise<boolean>
  resendProposal: (proposalId: number | string) => Promise<boolean>
  toggleProposalAvailability: (proposalId: number | string) => Promise<boolean>
}

/**
 * Hook para gestionar las propuestas de materias del docente
 * Consume los endpoints GET/POST/DELETE /teachers/me/proposals
 * Ahora soporta tanto IDs numéricos (legacy) como UUIDs (nuevo)
 */
export function useProposals(): UseProposalsReturn {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProposals = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await TeacherService.getProposals()
      
      if (response.success && response.data) {
        setProposals(response.data)
      } else {
        setError(response.error || 'Error al cargar las propuestas')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const createProposal = async (subjectId: number | string): Promise<boolean> => {
    try {
      const request: CreateProposalRequest = { subjectId }
      const response = await TeacherService.createProposal(request)
      
      if (response.success) {
        await fetchProposals() // Recargar la lista
        return true
      } else {
        setError(response.error || 'Error al crear la propuesta')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return false
    }
  }

  const deleteProposal = async (subjectId: number | string): Promise<boolean> => {
    try {
      const response = await TeacherService.deleteProposal(subjectId)
      
      if (response.success) {
        await fetchProposals() // Recargar la lista
        return true
      } else {
        setError(response.error || 'Error al eliminar la propuesta')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return false
    }
  }

  const resendProposal = async (proposalId: number | string): Promise<boolean> => {
    try {
      const response = await TeacherService.resendProposal(proposalId)
      
      if (response.success) {
        await fetchProposals() // Recargar la lista
        return true
      } else {
        setError(response.error || 'Error al reenviar la propuesta')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return false
    }
  }

  const toggleProposalAvailability = async (proposalId: number | string): Promise<boolean> => {
    try {
      const response = await TeacherService.toggleProposalAvailability(proposalId)
      
      if (response.success) {
        await fetchProposals() // Recargar la lista
        return true
      } else {
        setError(response.error || 'Error al cambiar la disponibilidad')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return false
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  return {
    proposals,
    isLoading,
    error,
    refetch: fetchProposals,
    createProposal,
    deleteProposal,
    resendProposal,
    toggleProposalAvailability
  }
}
