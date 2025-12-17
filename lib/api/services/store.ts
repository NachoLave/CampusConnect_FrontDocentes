import { API_CONFIG, DEFAULT_HEADERS } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import { ApiResponse } from '@/lib/types'
import { authService } from './auth'

// Tipos para las órdenes de tienda (adaptados a nuevo microservicio)
export interface StoreOrderItem {
  id: number
  cantidad: number
  subtotal: number
  stock_id: number
  compra_id: number
  created_at: string
  Stock: {
    stock: number
    talle: string | null
    Color: {
      hexa: string
      nombre: string
    }
    Articulo: {
      Titulo: string
      descripcion: string
      Imagen: Array<{
        imagen: string
      }>
    }
  }
}

export interface StoreOrder {
  id: number
  usuario_id: string
  created_at: string
  total_compra: number
  Item_compra: StoreOrderItem[]
}

export interface StoreOrderSummary {
  totalOrders: number
  totalSpent: number
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

export class StoreService {
  // Obtener historial de órdenes de tienda
  static async getOrders(): Promise<ApiResponse<StoreOrder[]>> {
    console.log('StoreService.getOrders() - Obteniendo historial de órdenes')
    
    try {
      console.log('Llamando al microservicio de tienda...')
      
      // Obtener el userId del JWT del usuario autenticado
      const jwtPayload = authService.getJWTPayload()
      if (!jwtPayload || !jwtPayload.sub) {
        return {
          data: null as any,
          success: false,
          error: 'Usuario no autenticado. No se puede obtener el UUID.'
        }
      }

      const userId = jwtPayload.sub
      
      // Usar proxy de Next.js para evitar CORS y manejar cold start de Render.com
      const url = `/api/store/orders?userId=${userId}`
      
      // Headers simplificados
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      console.log(`Llamando al proxy de tienda: ${url}`)
      
      // Usar fetch con timeout más largo para dar tiempo al cold start
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: headers,
        cache: 'no-store'
      }, 25000) // 25 segundos de timeout (el proxy tiene 20s + margen)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido')
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`)
      }

      // Validar que el content-type sea JSON antes de parsear
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.warn('Respuesta no es JSON:', text.substring(0, 100))
        throw new Error('Respuesta del servidor no es válida')
      }

      const data = await response.json()
      console.log('Órdenes obtenidas del microservicio:', data)
      
      // Validar que sea un array
      if (!Array.isArray(data)) {
        throw new Error('La respuesta del servidor no es un array válido')
      }

      return {
        data: data,
        success: true,
        message: 'Historial de órdenes obtenido correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo órdenes:', error)
      
      // Mensaje de error más específico según el tipo de error
      let errorMessage = 'No se pudo obtener el historial de órdenes'
      
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
        data: null as any,
        success: false,
        error: errorMessage
      }
    }
  }

  // Obtener resumen de órdenes
  static async getOrderSummary(): Promise<ApiResponse<StoreOrderSummary>> {
    console.log('StoreService.getOrderSummary() - Obteniendo resumen de órdenes')
    
    try {
      const ordersResponse = await this.getOrders()
      
      if (!ordersResponse.success) {
        return {
          data: null as any,
          success: false,
          error: ordersResponse.error || 'Error obteniendo resumen'
        }
      }

      const orders = ordersResponse.data
      const summary: StoreOrderSummary = {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + (order.total_compra || 0), 0)
      }

      return {
        data: summary,
        success: true,
        message: 'Resumen de órdenes obtenido correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo resumen:', error)
      return {
        data: null as any,
        success: false,
        error: 'No se pudo obtener el resumen de órdenes'
      }
    }
  }

  // Obtener órdenes con paginación
  static async getOrdersPaginated(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    orders: StoreOrder[]
    total: number
    page: number
    totalPages: number
  }>> {
    console.log('StoreService.getOrdersPaginated() - Obteniendo órdenes paginadas')
    
    try {
      const ordersResponse = await this.getOrders()
      
      if (!ordersResponse.success) {
        return {
          data: null as any,
          success: false,
          error: ordersResponse.error || 'Error obteniendo órdenes paginadas'
        }
      }

      const allOrders = ordersResponse.data
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const orders = allOrders.slice(startIndex, endIndex)
      const total = allOrders.length
      const totalPages = Math.ceil(total / limit)

      return {
        data: {
          orders,
          total,
          page,
          totalPages
        },
        success: true,
        message: 'Órdenes paginadas obtenidas correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo órdenes paginadas:', error)
      return {
        data: null as any,
        success: false,
        error: 'No se pudo obtener las órdenes paginadas'
      }
    }
  }

  // Exportar órdenes (para futuras funcionalidades)
  static async exportOrders(): Promise<ApiResponse<Blob>> {
    console.log('StoreService.exportOrders() - Exportando órdenes')
    
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORE_EXPORT}`
      
      const headers = {
        ...DEFAULT_HEADERS,
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }

      console.log(`Exportando órdenes desde: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const blob = await response.blob()
      console.log('Órdenes exportadas correctamente')
      
      return {
        data: blob,
        success: true,
        message: 'Órdenes exportadas correctamente'
      }
    } catch (error) {
      console.error('Error exportando órdenes:', error)
      return {
        data: null as any,
        success: false,
        error: 'No se pudo exportar las órdenes'
      }
    }
  }
}
