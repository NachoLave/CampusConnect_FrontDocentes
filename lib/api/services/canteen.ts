import { API_CONFIG, DEFAULT_HEADERS } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import type { ApiResponse, CanteenReservation } from '@/lib/types'

// Función para mapear estados del backend a estados del frontend
function mapStatus(backendStatus: string): CanteenReservation['status'] {
  const statusMap: Record<string, CanteenReservation['status']> = {
    'RESERVADO': 'Pendiente',
    'CONSUMIDO': 'Finalizado',
    'CANCELADO': 'Cancelado',
    'PENDIENTE': 'Pendiente',
    'FINALIZADO': 'Finalizado'
  }
  
  return statusMap[backendStatus.toUpperCase()] || 'Pendiente'
}

export class CanteenService {
  static async getReservations(): Promise<ApiResponse<CanteenReservation[]>> {
    console.log('🔍 CanteenService.getReservations() - USE_MOCK_DATA:', APP_CONFIG.USE_MOCK_DATA)
    
    if (APP_CONFIG.USE_MOCK_DATA) {
      console.log('📱 Usando datos mock para comedor')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockReservations: CanteenReservation[] = [
        {
          id: 'mock-1',
          date: '2025-10-21',
          type: 'ALMUERZO',
          timeRange: '12:00',
          sede: 'Campus Central',
          total: 'Menu ejecutivo',
          status: 'Pendiente'
        },
        {
          id: 'mock-2', 
          date: '2025-10-21',
          type: 'ALMUERZO',
          timeRange: '13:00',
          sede: 'Campus Sur',
          total: 'Menu vegetariano',
          status: 'Finalizado'
        }
      ]
      
      return {
        data: mockReservations,
        success: true,
        message: 'Reservas de comedor obtenidas (modo mock)'
      }
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CANTEEN_RESERVATIONS}`
      console.log('🔗 URL de la petición:', url)

      const headers = {
        ...DEFAULT_HEADERS,
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
      console.log('📋 Headers de la petición:', headers)

      const response = await fetch(url, { 
        method: 'GET', 
        headers,
        cache: 'no-cache' // Forzar recarga sin caché
      })
      console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error del servidor:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📊 Datos recibidos del servidor:', data)

      // El endpoint devuelve { value: [...], Count: number }
      const reservationsData = data.value || data
      console.log('📊 Datos de reservas extraídos:', reservationsData)

      const reservations: CanteenReservation[] = Array.isArray(reservationsData) ? reservationsData.map((r: any) => {
        // Extraer fecha y hora del scheduledAt
        const scheduledDate = r.scheduledAt ? new Date(r.scheduledAt) : new Date()
        const dateStr = scheduledDate.toISOString().split('T')[0] // YYYY-MM-DD
        const timeStr = scheduledDate.toTimeString().split(' ')[0].substring(0, 5) // HH:MM
        
        const mapped = {
          id: String(r.reservationId ?? r.id ?? `${r.scheduledAt}-${r.menu ?? 'RESERVA'}`),
          date: dateStr, // Usar solo la fecha
          type: r.menu || r.type || r.tipo || r.tipoReserva || 'ALMUERZO',
          timeRange: timeStr || r.timeRange || r.horario || undefined, // Usar la hora del scheduledAt
          sede: r.campus || r.sede || undefined,
          total: r.menu || r.type || 'Menu no especificado', // Mostrar el menu en lugar del total
          status: mapStatus(r.status || r.estado || 'Pendiente')
        }
        console.log('🔄 Mapeando reserva:', { original: r, mapped })
        return mapped
      }) : []

      console.log('✅ Reservas procesadas:', reservations)
      return { data: reservations, success: true, message: 'Reservas de comedor obtenidas' }
    } catch (error) {
      console.error('❌ Error obteniendo reservas de comedor:', error)
      console.log('🔄 Usando datos de fallback')
      
      // Fallback a datos mock
      const fallbackReservations: CanteenReservation[] = [
        {
          id: 'fallback-1',
          date: '2025-10-21',
          type: 'ALMUERZO',
          timeRange: '12:00',
          sede: 'Campus Central',
          total: 'Menu ejecutivo',
          status: 'Pendiente'
        },
        {
          id: 'fallback-2',
          date: '2025-10-21', 
          type: 'ALMUERZO',
          timeRange: '13:00',
          sede: 'Campus Sur',
          total: 'Menu vegetariano',
          status: 'Finalizado'
        }
      ]
      
      return {
        data: fallbackReservations,
        success: true,
        message: 'Reservas obtenidas (modo fallback)'
      }
    }
  }
}




