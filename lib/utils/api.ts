import { API_CONFIG, DEFAULT_HEADERS } from '@/lib/config/api'
import { ApiResponse } from '@/lib/types'

// Simulación de delay para hacer más realista la experiencia mock
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Cliente HTTP básico
class ApiClient {
  private baseURL: string
  private headers: Record<string, string>

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.headers = { ...DEFAULT_HEADERS }
  }

  // Método para establecer el token de autenticación
  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`
  }

  // Método para limpiar el token de autenticación
  clearAuthToken() {
    delete this.headers['Authorization']
  }

  // Método para establecer headers de desarrollo (mock mode)
  setMockHeaders(teacherId: string, roles: string) {
    this.headers['X-Teacher-Id'] = teacherId
    this.headers['X-Teacher-Roles'] = roles
  }

  // Método para hacer requests GET
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      // En desarrollo, simulamos delay
      if (process.env.NODE_ENV === 'development') {
        await mockDelay()
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
        message: 'Datos obtenidos correctamente'
      }
    } catch (error) {
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // Método para hacer requests POST
  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await mockDelay()
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
        message: 'Operación realizada correctamente'
      }
    } catch (error) {
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // Método para hacer requests PUT
  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await mockDelay()
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        // Intentar leer el cuerpo de la respuesta de error
        let errorDetail = `HTTP error! status: ${response.status}`
        try {
          const errorBody = await response.json()
          errorDetail = errorBody.message || errorBody.error || JSON.stringify(errorBody)
        } catch {
          // Si no se puede parsear como JSON, intentar leer como texto
          try {
            const errorText = await response.text()
            if (errorText) errorDetail += ` - ${errorText}`
          } catch {}
        }
        throw new Error(errorDetail)
      }

      const data = await response.json()
      return {
        data,
        success: true,
        message: 'Datos actualizados correctamente'
      }
    } catch (error) {
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // Método para hacer requests DELETE
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await mockDelay()
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
        message: 'Elemento eliminado correctamente'
      }
    } catch (error) {
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // Método para hacer requests PATCH
  async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await mockDelay()
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
        message: 'Datos actualizados correctamente'
      }
    } catch (error) {
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
}

export const apiClient = new ApiClient()
