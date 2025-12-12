import { Subject, ApiResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG } from '@/lib/config/api'
import { authService } from './auth'

// URL de la API externa de Materias (Módulo Académico)
const MATERIAS_API_URL = 'https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api/materias'

// Interfaz para la respuesta de la API de materias externa
export interface MateriaExterna {
  uuid: string
  nombre: string
  uuid_carrera: string
  description: string
  approval_method: string
  is_elective: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  carrera?: {
    uuid: string
    name: string
    description: string
    degree_title: string
    code: string
    faculty: string
    modality: string
    duration_hours: number
    duration_years: number
    is_active: boolean
    metadata: Record<string, any>
    created_at: string
    updated_at: string
  }
}

export interface MateriaExternaResponse {
  success: boolean
  data: MateriaExterna | MateriaExterna[]
  page?: number
  limit?: number
  count?: number
  totalCount?: number
  totalPages?: number
}

export class SubjectsService {
  /**
   * Obtiene todas las materias desde la API externa (Módulo Académico)
   * GET https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api/materias
   */
  static async getAllSubjectsExternal(): Promise<ApiResponse<MateriaExterna[]>> {
    try {
      console.log('🎓 Llamando a API externa de materias...')
      
      // Obtener el JWT del servicio de autenticación
      const token = authService.getToken()
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      }
      
      // Agregar Bearer Token si está disponible
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(MATERIAS_API_URL, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data: MateriaExternaResponse = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        console.log(`✅ Materias obtenidas: ${data.data.length}`)
        return {
          data: data.data,
          success: true,
          message: 'Materias obtenidas correctamente'
        }
      }

      throw new Error('Formato de respuesta inválido')
    } catch (error) {
      console.error('❌ Error obteniendo materias externas:', error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener las materias'
      }
    }
  }

  /**
   * Obtiene una materia específica por su UUID desde la API externa
   * GET https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api/materias/{uuid}
   */
  static async getSubjectByUUID(uuid: string): Promise<ApiResponse<MateriaExterna | null>> {
    try {
      console.log(`🎓 Obteniendo materia ${uuid}...`)
      
      // Obtener el JWT del servicio de autenticación
      const token = authService.getToken()
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      }
      
      // Agregar Bearer Token si está disponible
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${MATERIAS_API_URL}/${uuid}`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠️ Materia ${uuid} no encontrada`)
          return {
            data: null,
            success: true,
            message: 'Materia no encontrada'
          }
        }
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data: MateriaExternaResponse = await response.json()
      
      if (data.success && data.data && !Array.isArray(data.data)) {
        console.log(`✅ Materia obtenida: ${data.data.nombre}`)
        return {
          data: data.data,
          success: true,
          message: 'Materia obtenida correctamente'
        }
      }

      throw new Error('Formato de respuesta inválido')
    } catch (error) {
      console.error(`❌ Error obteniendo materia ${uuid}:`, error)
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener la materia'
      }
    }
  }

  /**
   * Obtiene múltiples materias por sus UUIDs (en paralelo)
   * Útil para enriquecer las propuestas con nombres de materias
   */
  static async getSubjectsByUUIDs(uuids: string[]): Promise<Map<string, MateriaExterna>> {
    const results = new Map<string, MateriaExterna>()
    
    if (uuids.length === 0) return results

    console.log(`🎓 Obteniendo ${uuids.length} materias en paralelo...`)
    
    // Ejecutar todas las peticiones en paralelo
    const promises = uuids.map(async (uuid) => {
      const response = await this.getSubjectByUUID(uuid)
      if (response.success && response.data) {
        results.set(uuid, response.data)
      }
    })

    await Promise.all(promises)
    
    console.log(`✅ Materias obtenidas: ${results.size}/${uuids.length}`)
    return results
  }

  /**
   * Convierte una MateriaExterna al formato Subject usado internamente
   */
  static convertToSubject(materia: MateriaExterna): Subject {
    return {
      subjectId: 0, // Ya no usamos ID numérico
      subjectName: materia.nombre,
      careerId: 0, // Ya no usamos ID numérico
      careerName: materia.carrera?.name || 'Sin carrera',
      careerCode: materia.carrera?.code || '',
      // Campos adicionales
      uuid: materia.uuid,
      description: materia.description,
      careerUUID: materia.uuid_carrera,
    } as Subject & { uuid: string; description: string; careerUUID: string }
  }

  /**
   * Obtiene todas las materias en formato Subject (para compatibilidad)
   * Ahora usa la API externa
   */
  static async getAllSubjects(): Promise<ApiResponse<Subject[]>> {
    const response = await this.getAllSubjectsExternal()
    
    if (response.success && response.data) {
      const subjects = response.data.map(m => this.convertToSubject(m))
      return {
        data: subjects,
        success: true,
        message: 'Materias obtenidas correctamente'
      }
    }

    return {
      data: [],
      success: false,
      error: response.error
    }
  }
}
