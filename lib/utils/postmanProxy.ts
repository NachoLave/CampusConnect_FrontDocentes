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
      
      const headers = {
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
      this.balance = data.balance
      this.lastUpdate = Date.now()
      
      console.log(`✅ Balance obtenido del backend real: $${this.balance}`)
      return this.balance
    } catch (error) {
      console.error('❌ Error obteniendo balance del backend:', error)
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

