import { Campus, ApiResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG } from '@/lib/config/api'

export class AdminService {
  /**
   * Obtiene la lista de sedes activas
   * GET /admin/sedes?onlyActive=true
   */
  static async getActiveCampuses(): Promise<ApiResponse<Campus[]>> {
    try {
      const response = await apiClient.get<Campus[]>(`${API_CONFIG.ENDPOINTS.ADMIN_CAMPUSES}?onlyActive=true`)
      
      if (response.success && response.data) {
        return {
          data: response.data,
          success: true,
          message: 'Sedes activas obtenidas correctamente'
        }
      }

      throw new Error(response.error || 'Error al obtener las sedes')
    } catch (error) {
      console.error('Error obteniendo sedes activas:', error)
      return {
        data: [] as Campus[],
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener las sedes'
      }
    }
  }
}

