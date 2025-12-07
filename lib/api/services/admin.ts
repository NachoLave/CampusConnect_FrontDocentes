import { Campus, ApiResponse } from '@/lib/types'

// URL de la API externa de Sedes (Módulo Backoffice)
const SEDES_API_URL = 'https://backoffice-production-df78.up.railway.app/api/v1/sedes'

// Interfaz para la respuesta de la API de sedes externa
export interface SedeExterna {
  id_sede: string
  nombre: string
  ubicacion: string
  status: boolean
}

export class AdminService {
  /**
   * Obtiene la lista de todas las sedes desde la API externa (Backoffice)
   * GET https://backoffice-production-df78.up.railway.app/api/v1/sedes/?skip=0&limit=100
   */
  static async getAllCampuses(): Promise<ApiResponse<SedeExterna[]>> {
    try {
      console.log('🏢 Obteniendo sedes desde API externa...')
      
      const response = await fetch(`${SEDES_API_URL}/?skip=0&limit=100`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const sedes: SedeExterna[] = await response.json()
      console.log(`✅ Sedes obtenidas: ${sedes.length}`)
      
      return {
        data: sedes,
        success: true,
        message: 'Sedes obtenidas correctamente'
      }
    } catch (error) {
      console.error('❌ Error obteniendo sedes:', error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener las sedes'
      }
    }
  }

  /**
   * Obtiene la lista de sedes activas desde la API externa
   * Filtra las sedes donde status === true
   */
  static async getActiveCampuses(): Promise<ApiResponse<Campus[]>> {
    try {
      const response = await this.getAllCampuses()
      
      if (response.success && response.data) {
        // Filtrar solo las sedes activas y convertir al formato Campus
        const activeCampuses = response.data
          .filter(sede => sede.status === true)
          .map(sede => this.convertToCampus(sede))
        
        console.log(`🏢 Sedes activas: ${activeCampuses.length}`)
        
        return {
          data: activeCampuses,
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

  /**
   * Convierte una SedeExterna al formato Campus usado internamente
   */
  private static convertToCampus(sede: SedeExterna): Campus {
    // Generar código a partir del nombre (primeras 3 letras en mayúsculas)
    const code = sede.nombre.substring(0, 3).toUpperCase()
    
    return {
      id: 0, // Ya no usamos ID numérico
      code: code,
      name: sede.nombre,
      active: sede.status,
      // Campos adicionales
      uuid: sede.id_sede,
      ubicacion: sede.ubicacion,
    } as Campus & { uuid: string; ubicacion: string }
  }

  /**
   * Obtiene una sede por su UUID
   */
  static async getCampusByUUID(uuid: string): Promise<SedeExterna | null> {
    const response = await this.getAllCampuses()
    
    if (response.success && response.data) {
      return response.data.find(sede => sede.id_sede === uuid) || null
    }
    
    return null
  }
}
