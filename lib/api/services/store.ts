import { API_CONFIG, DEFAULT_HEADERS } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import { ApiResponse } from '@/lib/types'

// Tipos para las órdenes de tienda
export interface StoreOrder {
  id: string
  orderNumber: string
  date: string
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'
  total: number
  items: StoreOrderItem[]
  paymentMethod: string
  deliveryAddress?: string
  notes?: string
}

export interface StoreOrderItem {
  id: string
  productId: string
  product?: string  // Nombre del producto desde el backend
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category: string
}

export interface StoreOrderSummary {
  totalOrders: number
  totalSpent: number
  pendingOrders: number
  deliveredOrders: number
}

// Mapeo de productos para cuando no viene el nombre desde el backend
const PRODUCT_NAMES: { [key: string]: string } = {
  '1': 'Café Premium',
  '2': 'Sandwich Club',
  '3': 'Agua Mineral',
  '4': 'Galletas Integrales',
  '5': 'Jugo de Naranja',
  '6': 'Ensalada César',
  '7': 'Pizza Margherita',
  '8': 'Hamburguesa Clásica',
  '9': 'Papas Fritas',
  '10': 'Refresco Cola',
  '11': 'Té Verde',
  '12': 'Croissant',
  '13': 'Yogurt Griego',
  '14': 'Barra de Cereal',
  '15': 'Smoothie Frutal'
}

export class StoreService {
  // Obtener historial de órdenes de tienda
  static async getOrders(): Promise<ApiResponse<StoreOrder[]>> {
    console.log('🛒 StoreService.getOrders() - Obteniendo historial de órdenes')
    
    try {
      console.log('🌐 Llamando al backend real...')
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORE_ORDERS}`
      
      const headers = {
        ...DEFAULT_HEADERS,
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }

      console.log(`📡 Llamando al backend real: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Órdenes obtenidas del backend real:', data)
      
      // Validar y limpiar los datos de las órdenes
      const validatedOrders = Array.isArray(data) ? data.map(order => ({
        ...order,
        // Asegurar que la fecha sea válida
        date: order.date || new Date().toISOString(),
        // Asegurar que el total sea un número
        total: typeof order.total === 'number' ? order.total : 0,
        // Asegurar que los items sean un array y validar sus propiedades
        items: Array.isArray(order.items) ? order.items.map(item => {
          const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0
          const quantity = typeof item.quantity === 'number' ? item.quantity : 1
          const calculatedTotal = unitPrice * quantity
          
          return {
            ...item,
            // Asegurar que los precios sean números
            unitPrice,
            // Calcular el total correctamente como precio unitario × cantidad
            totalPrice: calculatedTotal,
            // Asegurar que la cantidad sea un número
            quantity,
            // Usar el nombre del producto del backend (variable 'product') o buscar en el mapeo por productId
            productName: item.product || item.productName || PRODUCT_NAMES[item.productId] || `Producto ${item.productId || 'Desconocido'}`
          }
        }) : []
      })) : []
      
      return {
        data: validatedOrders,
        success: true,
        message: 'Historial de órdenes obtenido correctamente'
      }
    } catch (error) {
      console.error('❌ Error obteniendo órdenes:', error)
      return {
        data: null as any,
        success: false,
        error: 'No se pudo obtener el historial de órdenes'
      }
    }
  }

  // Obtener resumen de órdenes
  static async getOrderSummary(): Promise<ApiResponse<StoreOrderSummary>> {
    console.log('📊 StoreService.getOrderSummary() - Obteniendo resumen de órdenes')
    
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
        totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0),
        pendingOrders: orders.filter(order => order.status === 'PENDING').length,
        deliveredOrders: orders.filter(order => order.status === 'DELIVERED').length
      }

      return {
        data: summary,
        success: true,
        message: 'Resumen de órdenes obtenido correctamente'
      }
    } catch (error) {
      console.error('❌ Error obteniendo resumen:', error)
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
    console.log('📄 StoreService.getOrdersPaginated() - Obteniendo órdenes paginadas')
    
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
      console.error('❌ Error obteniendo órdenes paginadas:', error)
      return {
        data: null as any,
        success: false,
        error: 'No se pudo obtener las órdenes paginadas'
      }
    }
  }

  // Exportar órdenes (para futuras funcionalidades)
  static async exportOrders(): Promise<ApiResponse<Blob>> {
    console.log('📤 StoreService.exportOrders() - Exportando órdenes')
    
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

      console.log(`📡 Exportando órdenes desde: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const blob = await response.blob()
      console.log('✅ Órdenes exportadas correctamente')
      
      return {
        data: blob,
        success: true,
        message: 'Órdenes exportadas correctamente'
      }
    } catch (error) {
      console.error('❌ Error exportando órdenes:', error)
      return {
        data: null as any,
        success: false,
        error: 'No se pudo exportar las órdenes'
      }
    }
  }
}
