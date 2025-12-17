import { authService } from './auth'

export interface AcademicEvent {
  id: string
  name: string
  startTime: string // ISO string
  endTime: string // ISO string
  location: {
    id: string
    name: string
    address: string
    capacity: number
  }
  description: string
  price: number
  availableSeats: number
  registered: boolean
  imageUrl: string | null
}

export class EventsService {
  /**
   * Obtener todos los eventos académicos registrados por el docente
   */
  static async getRegisteredEvents(): Promise<AcademicEvent[]> {
    try {
      const token = authService.getToken()
      if (!token) {
        console.warn('No hay token de autenticación para obtener eventos')
        return []
      }

      // Obtener el UUID del docente desde el JWT
      const userId = authService.getTeacherUUID()
      if (!userId) {
        console.warn('No se pudo obtener el UUID del docente para obtener eventos')
        return []
      }

      // Usar proxy de Next.js para evitar CORS
      const url = `/api/events?endDate=9999-12-02`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'userId': userId // Enviar userId al proxy
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        console.warn(`Error obteniendo eventos académicos: ${response.status}`)
        return []
      }

      const data = await response.json()
      
      // Filtrar solo los eventos donde registered: true
      if (Array.isArray(data)) {
        const registeredEvents = data.filter((event: AcademicEvent) => event.registered === true)
        console.log('🔔 [EventsService] Total eventos recibidos:', data.length)
        console.log('🔔 [EventsService] Eventos registrados:', registeredEvents.length)
        console.log('🔔 [EventsService] Eventos registrados:', registeredEvents.map(e => ({ id: e.id, name: e.name, startTime: e.startTime })))
        return registeredEvents
      }
      
      return []
    } catch (error) {
      console.warn('Error obteniendo eventos académicos:', error)
      return []
    }
  }
}
