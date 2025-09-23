import { CalendarData, Event, ApiResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG, USE_MOCK_DATA } from '@/lib/config/api'
import calendarData from '@/lib/data/calendar.json'

export class CalendarService {
  // Obtener eventos del calendario
  static async getCalendarEvents(): Promise<ApiResponse<CalendarData>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400))
      return {
        data: calendarData as CalendarData,
        success: true,
        message: 'Eventos del calendario obtenidos correctamente'
      }
    }

    return apiClient.get<CalendarData>(API_CONFIG.ENDPOINTS.CALENDAR)
  }

  // Obtener eventos para una fecha específica
  static async getEventsByDate(date: number): Promise<ApiResponse<Event[]>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const events = (calendarData as CalendarData)[date] || []
      return {
        data: events,
        success: true,
        message: 'Eventos de la fecha obtenidos correctamente'
      }
    }

    return apiClient.get<Event[]>(API_CONFIG.ENDPOINTS.CALENDAR_EVENTS(date.toString()))
  }

  // Obtener eventos para un rango de fechas
  static async getEventsByDateRange(startDate: number, endDate: number): Promise<ApiResponse<CalendarData>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const filteredEvents: CalendarData = {}
      
      for (let date = startDate; date <= endDate; date++) {
        const events = (calendarData as CalendarData)[date] || []
        if (events.length > 0) {
          filteredEvents[date] = events
        }
      }

      return {
        data: filteredEvents,
        success: true,
        message: 'Eventos del rango de fechas obtenidos correctamente'
      }
    }

    const endpoint = `${API_CONFIG.ENDPOINTS.CALENDAR}?start=${startDate}&end=${endDate}`
    return apiClient.get<CalendarData>(endpoint)
  }

  // Agregar nuevo evento (para futuras funcionalidades)
  static async addEvent(date: number, event: Omit<Event, 'id'>): Promise<ApiResponse<Event>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 600))
      const newEvent = {
        ...event,
        id: Date.now() // Simulamos ID único
      } as any

      return {
        data: newEvent,
        success: true,
        message: 'Evento agregado correctamente'
      }
    }

    return apiClient.post<Event>(API_CONFIG.ENDPOINTS.CALENDAR, { date, ...event })
  }

  // Obtener próxima clase
  static async getNextClass(): Promise<ApiResponse<Event & { date: number }>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Buscar la próxima clase (simplificado para el mock)
      const today = 19 // Fecha actual simulada
      for (let date = today; date <= today + 7; date++) {
        const events = (calendarData as CalendarData)[date] || []
        const classEvent = events.find(event => event.type === 'class')
        if (classEvent) {
          return {
            data: { ...classEvent, date },
            success: true,
            message: 'Próxima clase obtenida correctamente'
          }
        }
      }

      return {
        data: null as any,
        success: false,
        error: 'No se encontraron clases próximas'
      }
    }

    return apiClient.get<Event & { date: number }>(`${API_CONFIG.ENDPOINTS.CALENDAR}/next-class`)
  }
}
