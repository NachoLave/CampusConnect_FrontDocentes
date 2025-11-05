import { Subject, ApiResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG } from '@/lib/config/api'

export class SubjectsService {
  /**
   * Obtiene todas las materias disponibles
   * GET /admin/subjects
   */
  static async getAllSubjects(): Promise<ApiResponse<Subject[]>> {
    try {
      console.log('📚 Llamando a GET /admin/subjects...')
      const response = await apiClient.get<Subject[]>(API_CONFIG.ENDPOINTS.ADMIN_SUBJECTS)
      
      console.log('📚 Respuesta de /admin/subjects:', response)
      
      if (response.success && response.data) {
        console.log(`✅ Materias obtenidas: ${response.data.length} materias`)
        return {
          data: response.data,
          success: true,
          message: 'Materias obtenidas correctamente'
        }
      }

      console.error('❌ Error en respuesta:', response.error)
      throw new Error(response.error || 'Error al obtener las materias')
    } catch (error) {
      console.error('❌ Error obteniendo materias:', error)
      return {
        data: [] as Subject[],
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener las materias'
      }
    }
  }
}

