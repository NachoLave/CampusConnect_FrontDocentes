import { API_CONFIG, DEFAULT_HEADERS } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import { ApiResponse } from '@/lib/types'
import { authService } from './auth'

// Tipos para las reservas del microservicio de comedor
export interface CanteenReservationResponse {
  cost: number
  createdAt: string
  id: number
  locationId: number
  mealTime: string // ALMUERZO, CENA, DESAYUNO, MERIENDA
  reservationDate: string // ISO datetime
  reservationTimeSlot: string | null // ALMUERZO_SLOT_1, CENA_SLOT_2, etc.
  slotEndTime: string | null // HH:mm:ss
  slotStartTime: string | null // HH:mm:ss
  status: string // ACTIVA, CANCELADA, etc.
  userId: string
}

// Tipo para locations
export interface CanteenLocation {
  id: number
  name: string
  address: string
  capacity: number
}

// Tipo mapeado para el frontend
export interface CanteenReservation {
  id: string
  date: string // Fecha en formato ISO para formateo en el cliente
  type: string // Tipo de reserva (Almuerzo, Cena, etc.)
  timeRange?: string // Horario formateado (HH:mm)
  cost: number // Costo de la reserva
  sede?: string // Nombre de la sede
  status: 'Activa' | 'Confirmada' | 'Cancelada' | 'Ausente'
}

// Helper para crear un fetch con timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 15000): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado tiempo. Por favor, verifica tu conexión.')
    }
    throw error
  }
}

// Función para mapear estados del backend a estados del frontend
function mapStatus(backendStatus: string): CanteenReservation['status'] {
  const statusMap: Record<string, CanteenReservation['status']> = {
    'ACTIVA': 'Activa',
    'ACTIVO': 'Activa',
    'CONFIRMADA': 'Confirmada',
    'CONFIRMADO': 'Confirmada',
    'CANCELADA': 'Cancelada',
    'CANCELADO': 'Cancelada',
    'AUSENTE': 'Ausente'
  }
  
  return statusMap[backendStatus.toUpperCase()] || 'Activa'
}

// Función para mapear mealTime a formato legible
function mapMealTime(mealTime: string): string {
  const mealTimeMap: Record<string, string> = {
    'ALMUERZO': 'Almuerzo',
    'CENA': 'Cena',
    'DESAYUNO': 'Desayuno',
    'MERIENDA': 'Merienda'
  }
  
  return mealTimeMap[mealTime.toUpperCase()] || mealTime
}

// Función para extraer solo la hora de un datetime ISO
function extractTime(isoDate: string): string {
  try {
    const date = new Date(isoDate)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  } catch {
    return ''
  }
}

export class CanteenService {
  /**
   * Obtiene las locations (sedes) del microservicio de comedor
   */
  static async getLocations(): Promise<ApiResponse<CanteenLocation[]>> {
    try {
      // Obtener el token del usuario autenticado
      const token = authService.getToken()
      if (!token) {
        return {
          data: [] as CanteenLocation[],
          success: false,
          error: 'Usuario no autenticado. No se puede obtener el token.'
        }
      }

      const url = '/api/canteen/locations'
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, 15000)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido')
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('La respuesta del servidor no es un array válido')
      }

      return {
        data: data,
        success: true,
        message: 'Locations obtenidas correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo locations de comedor:', error)
      return {
        data: [] as CanteenLocation[],
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener locations'
      }
    }
  }

  static async getReservations(): Promise<ApiResponse<CanteenReservation[]>> {
    console.log('CanteenService.getReservations() - Obteniendo historial de reservas')
    
    try {
      console.log('Llamando al microservicio de comedor...')
      
      // Obtener el token del usuario autenticado
      const token = authService.getToken()
      if (!token) {
        return {
          data: [] as CanteenReservation[],
          success: false,
          error: 'Usuario no autenticado. No se puede obtener el token.'
        }
      }
      
      // Obtener reservas y locations en paralelo
      const [reservationsResponse, locationsResponse] = await Promise.all([
        fetchWithTimeout(`/api/canteen/reservations`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }, 15000),
        this.getLocations()
      ])

      if (!reservationsResponse.ok) {
        const errorText = await reservationsResponse.text().catch(() => 'Error desconocido')
        throw new Error(`Error del servidor: ${reservationsResponse.status} - ${errorText}`)
      }

      const data = await reservationsResponse.json()
      console.log('Reservas obtenidas del microservicio:', data)
      
      // Validar que sea un array (puede venir vacío si no hay reservas)
      if (!Array.isArray(data)) {
        // Si no es un array, devolver array vacío (puede ser que el endpoint devuelva null o vacío)
        console.warn('La respuesta del servidor no es un array válido, devolviendo array vacío')
        return {
          data: [] as CanteenReservation[],
          success: true,
          message: 'No hay reservas de comedor'
        }
      }
      
      // Si el array está vacío, devolver éxito con array vacío
      if (data.length === 0) {
        return {
          data: [] as CanteenReservation[],
          success: true,
          message: 'No hay reservas de comedor'
        }
      }

      // Crear mapa de locationId -> nombre de sede
      const locationsMap = new Map<number, string>()
      if (locationsResponse.success && locationsResponse.data) {
        locationsResponse.data.forEach(location => {
          locationsMap.set(location.id, location.name)
        })
      }

      // Mapear las reservas del formato del backend al formato del frontend
      const reservations: CanteenReservation[] = data.map((r: CanteenReservationResponse) => {
        // Extraer fecha y horario de reservationDate
        const reservationDate = r.reservationDate
        const timeRange = extractTime(reservationDate)
        
        // Obtener nombre de la sede desde el mapa
        const sedeName = locationsMap.get(r.locationId) || undefined
        
        return {
          id: String(r.id),
          date: reservationDate, // ISO datetime - el cliente formateará la fecha
          type: mapMealTime(r.mealTime), // Mapear a formato legible
          timeRange: timeRange, // Horario extraído (HH:mm)
          cost: r.cost, // Costo
          sede: sedeName, // Nombre de la sede
          status: mapStatus(r.status) // Estado mapeado
        }
      })

      // Ordenar por fecha de reserva de más nuevo a más antiguo
      reservations.sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateB - dateA // Orden descendente (más nuevo primero)
      })

      console.log('Reservas procesadas:', reservations)
      return {
        data: reservations,
        success: true,
        message: 'Reservas de comedor obtenidas correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo reservas de comedor:', error)
      
      // Mensaje de error más específico según el tipo de error
      let errorMessage = 'No se pudo obtener el historial de reservas de comedor'
      
      if (error instanceof Error) {
        if (error.message.includes('tardó demasiado')) {
          errorMessage = 'La solicitud tardó demasiado. Por favor, verifica tu conexión a internet.'
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.'
        } else if (error.message.includes('AbortError') || error.message.includes('aborted')) {
          errorMessage = 'La solicitud fue cancelada. Por favor, intenta nuevamente.'
        } else {
          errorMessage = error.message || errorMessage
        }
      }
      
      return {
        data: [] as CanteenReservation[],
        success: false,
        error: errorMessage
      }
    }
  }
}




