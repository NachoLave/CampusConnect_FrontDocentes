import { API_CONFIG } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'

// Proxy que simula el comportamiento de Postman para obtener datos reales del backend
class PostmanProxy {
  private static instance: PostmanProxy
  private balance: number | null = null
  private lastUpdate: number = 0
  private updateInterval: number = 5000 // 5 segundos

  static getInstance(): PostmanProxy {
    if (!PostmanProxy.instance) {
      PostmanProxy.instance = new PostmanProxy()
    }
    return PostmanProxy.instance
  }

  // Hacer llamada real al backend usando los mismos headers que Postman
  async getBalanceFromPostman(): Promise<number> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNT_BALANCE}`
      
      // Headers base necesarios para autenticación
      const headers: Record<string, string> = {
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': 'application/json',
      }
      
      // Detectar si es móvil y evitar headers problemáticos
      if (typeof window !== 'undefined' && window.navigator) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        if (!isMobile) {
          // Solo en desktop, usar headers adicionales como Postman
          headers['User-Agent'] = 'PostmanRuntime/7.49.0'
          headers['Accept-Encoding'] = 'gzip, deflate, br'
          headers['Connection'] = 'keep-alive'
        }
      }
      
      // Agregar timeout de 15 segundos para móvil (más tiempo por conexiones más lentas)
      const timeout = typeof window !== 'undefined' && window.navigator && 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        ? 15000 // 15 segundos en móvil
        : 10000 // 10 segundos en desktop
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Error desconocido')
          throw new Error(`Error del servidor: ${response.status} - ${errorText}`)
        }

        // Validar que el content-type sea JSON antes de parsear
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text()
          console.warn('⚠️ Respuesta no es JSON:', text.substring(0, 100))
          throw new Error('Respuesta del servidor no es válida')
        }

        const data = await response.json()
        
        this.balance = data.balance
        this.lastUpdate = Date.now()
        
        return this.balance
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('Timeout: La solicitud tardó demasiado tiempo')
        }
        throw fetchError
      }
    } catch (error) {
      console.error('Error obteniendo balance del backend:', error)
      throw error
    }
  }

  // Obtener balance siempre del backend (sin cache)
  async getBalance(): Promise<number> {
    // Siempre obtener del backend real, sin cache
    return await this.getBalanceFromPostman()
  }

  // Forzar actualización
  async forceUpdate(): Promise<number> {
    this.lastUpdate = 0 // Forzar actualización
    return await this.getBalance()
  }
}

export const postmanProxy = PostmanProxy.getInstance()

