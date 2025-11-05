import { TeacherProfile, ApiResponse, Proposal, CreateProposalRequest, AvailabilityBlock, UpdateAvailabilityRequest } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG } from '@/lib/config/api'

export class TeacherService {
  /**
   * Obtiene el perfil completo del docente autenticado
   * GET /teachers/me
   */
  static async getProfile(): Promise<ApiResponse<TeacherProfile>> {
    try {
      const response = await apiClient.get<TeacherProfile>(API_CONFIG.ENDPOINTS.TEACHER_PROFILE)
      
      if (response.success && response.data) {
        return {
          data: response.data,
          success: true,
          message: 'Perfil del docente obtenido correctamente'
        }
      }

      throw new Error(response.error || 'Error al obtener el perfil')
    } catch (error) {
      console.error('Error obteniendo perfil del docente:', error)
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener el perfil'
      }
    }
  }

  /**
   * Obtiene las propuestas de materias del docente
   * GET /teachers/me/proposals
   */
  static async getProposals(): Promise<ApiResponse<Proposal[]>> {
    try {
      const response = await apiClient.get<Proposal[]>(API_CONFIG.ENDPOINTS.TEACHER_PROPOSALS)
      
      if (response.success && response.data) {
        return {
          data: response.data,
          success: true,
          message: 'Propuestas obtenidas correctamente'
        }
      }

      throw new Error(response.error || 'Error al obtener las propuestas')
    } catch (error) {
      console.error('Error obteniendo propuestas:', error)
      return {
        data: [] as Proposal[],
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener las propuestas'
      }
    }
  }

  /**
   * Crea una nueva propuesta de materia
   * POST /teachers/me/proposals
   */
  static async createProposal(request: CreateProposalRequest): Promise<ApiResponse<Proposal>> {
    try {
      const response = await apiClient.post<Proposal>(API_CONFIG.ENDPOINTS.TEACHER_PROPOSALS, request)
      
      if (response.success && response.data) {
        return {
          data: response.data,
          success: true,
          message: 'Propuesta creada correctamente'
        }
      }

      throw new Error(response.error || 'Error al crear la propuesta')
    } catch (error) {
      console.error('Error creando propuesta:', error)
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al crear la propuesta'
      }
    }
  }

  /**
   * Elimina una propuesta pendiente
   * DELETE /teachers/me/proposals?subjectId=X
   */
  static async deleteProposal(subjectId: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.TEACHER_PROPOSALS}?subjectId=${subjectId}`)
      
      return {
        data: undefined,
        success: true,
        message: 'Propuesta eliminada correctamente'
      }
    } catch (error) {
      console.error('Error eliminando propuesta:', error)
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar la propuesta'
      }
    }
  }

  /**
   * Reenvía una propuesta rechazada actualizando su estado
   * PUT /teachers/me/proposals/{proposalId}
   */
  static async resendProposal(proposalId: number): Promise<ApiResponse<Proposal>> {
    try {
      const response = await apiClient.put<Proposal>(
        `${API_CONFIG.ENDPOINTS.TEACHER_PROPOSALS}/${proposalId}`,
        { decision: 'PENDIENTE' }
      )
      
      if (response.success && response.data) {
        return {
          data: response.data,
          success: true,
          message: 'Propuesta reenviada correctamente'
        }
      }

      throw new Error(response.error || 'Error al reenviar la propuesta')
    } catch (error) {
      console.error('Error reenviando propuesta:', error)
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al reenviar la propuesta'
      }
    }
  }

  /**
   * Obtiene la disponibilidad horaria del docente
   * GET /teachers/me/availability
   */
  static async getAvailability(): Promise<ApiResponse<AvailabilityBlock[]>> {
    try {
      const response = await apiClient.get<AvailabilityBlock[]>(API_CONFIG.ENDPOINTS.TEACHER_AVAILABILITY)
      
      if (response.success && response.data) {
        return {
          data: response.data,
          success: true,
          message: 'Disponibilidad obtenida correctamente'
        }
      }

      throw new Error(response.error || 'Error al obtener la disponibilidad')
    } catch (error) {
      console.error('Error obteniendo disponibilidad:', error)
      return {
        data: [] as AvailabilityBlock[],
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener la disponibilidad'
      }
    }
  }

  /**
   * Actualiza la disponibilidad horaria del docente
   * PUT /teachers/me/availability
   */
  static async updateAvailability(request: UpdateAvailabilityRequest): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.put<void>(API_CONFIG.ENDPOINTS.TEACHER_AVAILABILITY, request)
      
      return {
        data: undefined,
        success: true,
        message: 'Disponibilidad actualizada correctamente'
      }
    } catch (error) {
      console.error('Error actualizando disponibilidad:', error)
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar la disponibilidad'
      }
    }
  }
}

