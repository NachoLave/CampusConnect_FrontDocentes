import { API_CONFIG, DEFAULT_HEADERS } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import { authService } from './auth'
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
    try {
      // Usar proxy interno para evitar CORS/401 en navegador
      const url = `/api/canteen/reservations`
      console.log('🔗 URL de la petición:', url)

      // Obtener headers según el modo de autenticación
      const user = authService.getProfile()
      const token = authService.getToken()
      
      // Construir headers emulando Postman; evitar Content-Type en GET
      const headers = {
        // Headers para autenticación real con JWT
        ...(token && { 'Authorization': `Bearer ${token}` }),
        // Headers para modo mock (se ignorarán si hay JWT)
        ...(APP_CONFIG.USE_MOCK_AUTH && {
          'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
          'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES
        }),
        // Headers adicionales
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
      console.log('📋 Headers de la petición:', headers)

      const response = await fetch(url, { method: 'GET', headers })
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

       const deriveMealType = (d: Date) => {
         const h = d.getHours()
         if (h < 11) return 'Desayuno'
         if (h >= 11 && h < 15) return 'Almuerzo'
         if (h >= 15 && h < 18) return 'Merienda'
         return 'Cena'
       }

       const reservations: CanteenReservation[] = Array.isArray(reservationsData) ? reservationsData.map((r: any) => {
         // Extraer fecha y hora del scheduledAt
         const scheduledDate = r.scheduledAt ? new Date(r.scheduledAt) : new Date()
         // Keep the full ISO datetime (with timezone) so client-side formatting
         // can compute the correct local date without UTC truncation issues.
         const dateIso = scheduledDate.toISOString() // full ISO, e.g. 2025-11-09T15:50:59.261Z
         const timeStr = scheduledDate.toTimeString().split(' ')[0].substring(0, 5) // HH:MM

         // Derivar el tipo de reserva (Desayuno/Almuerzo/Merienda/Cena) si backend no lo provee
         const derivedType = r.type || r.tipo || r.tipoReserva || deriveMealType(scheduledDate)

         const mapped = {
           id: String(r.reservationId ?? r.id ?? `${r.scheduledAt}-${r.menu ?? 'RESERVA'}`),
           date: dateIso, // ISO datetime - client will format to local date
           type: derivedType,
           timeRange: timeStr || r.timeRange || r.horario || undefined, // Usar la hora del scheduledAt
           sede: r.campus || r.sede || undefined,
           total: r.menu || r.type || 'Menu no especificado', // Mostrar el menu en la columna 'Menú'
           status: mapStatus(r.status || r.estado || 'Pendiente')
         }
         console.log('🔄 Mapeando reserva:', { original: r, mapped })
         return mapped
       }) : []

      console.log('✅ Reservas procesadas:', reservations)
      return { data: reservations, success: true, message: 'Reservas de comedor obtenidas' }
    } catch (error) {
      console.error('❌ Error obteniendo reservas de comedor:', error)
      return { 
        data: [] as any, 
        success: false, 
        error: error instanceof Error ? error.message : 'No se pudo obtener el historial del comedor' 
      }
    }
  }
}




