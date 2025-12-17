import { TeacherProfile, ApiResponse, Proposal, CreateProposalRequest, AvailabilityBlock, CreateAvailabilityBlockRequest, UpdateAvailabilityRequest } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG } from '@/lib/config/api'
import { authService } from './auth'
import { SubjectsService } from './subjects'
import { AdminService } from './admin'

export class TeacherService {
  /**
   * Obtiene el UUID del docente autenticado
   * @throws Error si no hay docente autenticado
   */
  private static getTeacherUUID(): string {
    const uuid = authService.getTeacherUUID()
    if (!uuid) {
      throw new Error('No hay docente autenticado')
    }
    return uuid
  }

  /**
   * Headers base para requests al backend del módulo docente
   * Solo usa X-Teacher-Id con el UUID (sin Authorization)
   */
  private static getHeaders(): Record<string, string> {
    const teacherUUID = this.getTeacherUUID()
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Teacher-Id': teacherUUID
    }
  }

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
   * Envía el UUID del docente en el header X-Teacher-Id
   */
  static async getProposals(): Promise<ApiResponse<Proposal[]>> {
    try {
      const teacherUUID = this.getTeacherUUID()
      console.log(`📋 Obteniendo propuestas para docente ${teacherUUID}...`)

      // Usar proxy de Next.js para evitar CORS
      const response = await fetch(`/api/teachers/me/proposals`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Teacher-Id': teacherUUID
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const proposals: Proposal[] = await response.json()
      console.log(`📋 Propuestas obtenidas: ${proposals.length}`)

      // Enriquecer propuestas con nombres de materias
      const enrichedProposals = await this.enrichProposalsWithSubjectNames(proposals)
      
      return {
        data: enrichedProposals,
        success: true,
        message: 'Propuestas obtenidas correctamente'
      }
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
   * Enriquece las propuestas con los nombres de las materias desde la API externa
   */
  private static async enrichProposalsWithSubjectNames(proposals: Proposal[]): Promise<Proposal[]> {
    if (proposals.length === 0) return proposals

    // Obtener UUIDs únicos de materias
    const subjectUUIDs = [...new Set(proposals.map(p => String(p.subjectId)))]
    
    console.log(`🎓 Enriqueciendo ${proposals.length} propuestas con nombres de ${subjectUUIDs.length} materias...`)

    // Obtener todas las materias en paralelo
    const materiasMap = await SubjectsService.getSubjectsByUUIDs(subjectUUIDs)

    // Enriquecer cada propuesta con el nombre de la materia
    return proposals.map(proposal => {
      const materia = materiasMap.get(String(proposal.subjectId))
      return {
        ...proposal,
        subjectName: materia?.nombre || null
      }
    })
  }

  /**
   * Crea una nueva propuesta de materia
   * POST /teachers/me/proposals
   */
  static async createProposal(request: CreateProposalRequest): Promise<ApiResponse<Proposal>> {
    try {
      const teacherUUID = this.getTeacherUUID()
      console.log(`📝 Creando propuesta para materia ${request.subjectId}...`)

      // Usar proxy de Next.js para evitar CORS
      const response = await fetch(`/api/teachers/me/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Teacher-Id': teacherUUID
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP error! status: ${response.status}`)
      }

      const proposal: Proposal = await response.json()
      console.log(`✅ Propuesta creada: ${proposal.proposalId}`)
      
      return {
        data: proposal,
        success: true,
        message: 'Propuesta creada correctamente'
      }
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
  static async deleteProposal(subjectId: number | string): Promise<ApiResponse<void>> {
    try {
      const teacherUUID = this.getTeacherUUID()
      console.log(`🗑️ Eliminando propuesta de materia ${subjectId}...`)

      // Usar proxy de Next.js para evitar CORS
      const response = await fetch(
        `/api/teachers/me/proposals?subjectId=${subjectId}`,
        {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'X-Teacher-Id': teacherUUID
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      console.log(`✅ Propuesta eliminada`)
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
  static async resendProposal(proposalId: number | string): Promise<ApiResponse<Proposal>> {
    try {
      const teacherUUID = this.getTeacherUUID()
      console.log(`🔄 Reenviando propuesta ${proposalId}...`)

      // Usar proxy de Next.js para evitar CORS
      const response = await fetch(
        `/api/teachers/me/proposals/${proposalId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Teacher-Id': teacherUUID
          },
          body: JSON.stringify({ decision: 'PENDIENTE' })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const proposal: Proposal = await response.json()
      console.log(`✅ Propuesta reenviada`)
      
      return {
        data: proposal,
        success: true,
        message: 'Propuesta reenviada correctamente'
      }
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
   * Cambia la disponibilidad (activa/inactiva) de una propuesta aprobada
   * PATCH /teachers/me/proposals/{proposalId}/toggle-availability
   */
  static async toggleProposalAvailability(proposalId: number | string): Promise<ApiResponse<Proposal>> {
    try {
      const teacherUUID = this.getTeacherUUID()
      console.log(`🔄 Cambiando disponibilidad de propuesta ${proposalId}...`)

      // Usar proxy de Next.js para evitar CORS
      const response = await fetch(
        `/api/teachers/me/proposals/${proposalId}`,
        {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'X-Teacher-Id': teacherUUID
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const proposal: Proposal = await response.json()
      console.log(`✅ Disponibilidad actualizada`)
      
      return {
        data: proposal,
        success: true,
        message: 'Disponibilidad actualizada correctamente'
      }
    } catch (error) {
      console.error('Error cambiando disponibilidad de propuesta:', error)
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al cambiar la disponibilidad'
      }
    }
  }

  /**
   * Obtiene la disponibilidad horaria del docente
   * GET /teachers/me/availability?includeAssigned=true
   * Enriquece cada bloque con los nombres de las sedes desde la API externa
   */
  static async getAvailability(): Promise<ApiResponse<AvailabilityBlock[]>> {
    try {
      const teacherUUID = this.getTeacherUUID()
      console.log(`📅 Obteniendo disponibilidad para docente ${teacherUUID}...`)

      // Usar proxy de Next.js para evitar CORS
      // IMPORTANTE: Incluir parámetro includeAssigned=true
      const response = await fetch(`/api/teachers/me/availability?includeAssigned=true`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Teacher-Id': teacherUUID
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const availability: AvailabilityBlock[] = await response.json()
      console.log(`📅 Disponibilidad obtenida: ${availability.length} bloques`)
      
      // Enriquecer con nombres de sedes
      const enrichedAvailability = await this.enrichAvailabilityWithCampusNames(availability)
      
      return {
        data: enrichedAvailability,
        success: true,
        message: 'Disponibilidad obtenida correctamente'
      }
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
   * Enriquece los bloques de disponibilidad con los nombres de las sedes desde la API externa
   */
  private static async enrichAvailabilityWithCampusNames(blocks: AvailabilityBlock[]): Promise<AvailabilityBlock[]> {
    if (blocks.length === 0) return blocks

    // Obtener UUIDs únicos de sedes de todos los bloques
    const allCampusUUIDs = new Set<string>()
    blocks.forEach(block => {
      block.campuses.forEach(uuid => allCampusUUIDs.add(uuid))
    })

    if (allCampusUUIDs.size === 0) {
      console.log('📅 No hay sedes para enriquecer')
      return blocks
    }

    console.log(`🏢 Enriqueciendo ${blocks.length} bloques con nombres de ${allCampusUUIDs.size} sedes...`)

    // Obtener todas las sedes de la API externa
    const sedesResponse = await AdminService.getAllCampuses()
    
    if (!sedesResponse.success || !sedesResponse.data) {
      console.warn('⚠️ No se pudieron obtener las sedes para enriquecer')
      return blocks
    }

    // Crear mapa UUID -> nombre
    const sedesMap = new Map<string, string>()
    sedesResponse.data.forEach(sede => {
      sedesMap.set(sede.id_sede, sede.nombre)
    })

    console.log(`🏢 Mapa de sedes creado: ${sedesMap.size} sedes`)

    // Enriquecer cada bloque
    return blocks.map(block => {
      const campusNames = block.campuses
        .map(uuid => sedesMap.get(uuid) || uuid) // Si no encuentra, muestra el UUID
        .filter(name => name) // Filtrar nulls

      return {
        ...block,
        campusNames
      }
    })
  }

  /**
   * Agrega un bloque individual de disponibilidad horaria
   * POST /teachers/me/availability
   */
  static async addAvailabilityBlock(request: CreateAvailabilityBlockRequest): Promise<ApiResponse<AvailabilityBlock>> {
    try {
      const teacherUUID = this.getTeacherUUID()
      console.log(`➕ Agregando bloque de disponibilidad...`)

      // Usar proxy de Next.js para evitar CORS
      const response = await fetch(`/api/teachers/me/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Teacher-Id': teacherUUID
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const block: AvailabilityBlock = await response.json()
      console.log(`✅ Bloque agregado: ${block.id}`)
      
      return {
        data: block,
        success: true,
        message: 'Bloque de disponibilidad agregado correctamente'
      }
    } catch (error) {
      console.error('Error agregando bloque de disponibilidad:', error)
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al agregar el bloque'
      }
    }
  }

  /**
   * Elimina un bloque individual de disponibilidad horaria
   * DELETE /teachers/me/availability/{id}
   */
  static async deleteAvailabilityBlock(blockId: number): Promise<ApiResponse<void>> {
    try {
      const teacherUUID = this.getTeacherUUID()
      console.log(`🗑️ Eliminando bloque ${blockId}...`)

      // Usar proxy de Next.js para evitar CORS
      const response = await fetch(
        `/api/teachers/me/availability/${blockId}`,
        {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'X-Teacher-Id': teacherUUID
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log(`✅ Bloque eliminado`)
      return {
        data: undefined,
        success: true,
        message: 'Bloque de disponibilidad eliminado correctamente'
      }
    } catch (error) {
      console.error('Error eliminando bloque de disponibilidad:', error)
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar el bloque'
      }
    }
  }

  /**
   * Actualiza las sedes y/o modalidad de un bloque de disponibilidad específico
   * PATCH /teachers/me/availability/{blockId}
   */
  static async updateAvailabilityBlock(
    blockId: number, 
    data: { campuses: string[], modality?: string }
  ): Promise<ApiResponse<void>> {
    try {
      const teacherUUID = this.getTeacherUUID()
      console.log(`✏️ Actualizando bloque ${blockId}...`)

      // Usar proxy de Next.js para evitar CORS
      const response = await fetch(
        `/api/teachers/me/availability/${blockId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Teacher-Id': teacherUUID
          },
          body: JSON.stringify(data)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log(`✅ Bloque actualizado`)
      return {
        data: undefined,
        success: true,
        message: 'Disponibilidad actualizada correctamente'
      }
    } catch (error) {
      console.error('Error actualizando disponibilidad del bloque:', error)
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar la disponibilidad'
      }
    }
  }
}
