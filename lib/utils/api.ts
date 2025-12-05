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
  setMockHeaders(teacherId: string, roles: string, teacherEmail?: string) {
    this.headers['X-Teacher-Id'] = teacherId
    // Solo establecer X-Teacher-Roles si se proporciona un valor no vacío
    if (roles && roles.trim() !== '') {
      this.headers['X-Teacher-Roles'] = roles
    } else {
      delete this.headers['X-Teacher-Roles']
    }
    // Solo establecer X-Teacher-Email si se proporciona un valor no vacío
    if (teacherEmail && teacherEmail.trim() !== '') {
      this.headers['X-Teacher-Email'] = teacherEmail
    } else {
      delete this.headers['X-Teacher-Email']
    }
  }

  // Obtener los headers de mock actualmente configurados (helper para UI/tests)
  getMockHeaders() {
    return {
      teacherId: this.headers['X-Teacher-Id'],
      roles: this.headers['X-Teacher-Roles'],
      teacherEmail: this.headers['X-Teacher-Email']
    }
  }

  // Método para hacer requests GET
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      // En desarrollo, simulamos delay
      if (process.env.NODE_ENV === 'development') {
        await mockDelay()
      }

      const url = `${this.baseURL}${endpoint}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      })

      if (!response.ok) {
        // Capturar detalles del error del servidor
        let errorDetail = `HTTP error! status: ${response.status}`
        let errorBody: any = null
        try {
          const text = await response.text()
          if (text) {
            try {
              errorBody = JSON.parse(text)
              errorDetail = errorBody.message || errorBody.error || errorBody.detail || errorDetail
            } catch {
              errorDetail += ` - ${text}`
            }
          }
        } catch {}
        
        console.error('🔴 [apiClient.get] Error:', {
          url,
          status: response.status,
          statusText: response.statusText,
          errorDetail,
          errorBody,
          headers: Object.fromEntries(response.headers.entries())
        })
        
        throw new Error(errorDetail)
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

      // Si el body está vacío o es null, no enviar body en el request
      const hasBody = body !== null && body !== undefined && Object.keys(body).length > 0
      
      // Crear headers - remover Content-Type si no hay body (algunos backends lo requieren así)
      let headers: Record<string, string> = { ...this.headers }
      if (!hasBody) {
        const { 'Content-Type': _, ...headersWithoutContentType } = headers
        headers = headersWithoutContentType
      }
      
      const requestOptions: RequestInit = {
        method: 'POST',
        headers
      }

      if (hasBody) {
        requestOptions.body = JSON.stringify(body)
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, requestOptions)

      if (!response.ok) {
        // Intentar leer el cuerpo de la respuesta de error
        let errorDetail = `HTTP error! status: ${response.status}`
        let errorBody: any = null
        try {
          errorBody = await response.json()
          errorDetail = errorBody.message || errorBody.error || errorBody.detail || JSON.stringify(errorBody)
        } catch {
          // Si no se puede parsear como JSON, intentar leer como texto
          try {
            const errorText = await response.text()
            if (errorText) {
              errorDetail += ` - ${errorText}`
              // Intentar parsear como JSON si es texto
              try {
                errorBody = JSON.parse(errorText)
                errorDetail = errorBody.message || errorBody.error || errorBody.detail || errorDetail
              } catch {}
            }
          } catch {}
        }
        
        // Log detallado del error para debugging
        console.error(`[apiClient.post] Error ${response.status} en ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          errorDetail,
          errorBody,
          headers: Object.fromEntries(response.headers.entries())
        })
        
        throw new Error(errorDetail)
      }

      // Manejar respuestas 204 No Content (sin body)
      if (response.status === 204) {
        return {
          data: null as T,
          success: true,
          message: 'Operación realizada correctamente'
        }
      }

      // Para otras respuestas exitosas, intentar parsear JSON
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

      // Si el body está vacío o es null, no enviar body en el request
      const hasBody = body !== null && body !== undefined && Object.keys(body).length > 0
      
      // Crear headers - remover Content-Type si no hay body (algunos backends lo requieren así)
      let headers: Record<string, string> = { ...this.headers }
      if (!hasBody) {
        const { 'Content-Type': _, ...headersWithoutContentType } = headers
        headers = headersWithoutContentType
      }
      
      const requestOptions: RequestInit = {
        method: 'PUT',
        headers
      }

      if (hasBody) {
        requestOptions.body = JSON.stringify(body)
      }

      const fullUrl = `${this.baseURL}${endpoint}`
      const response = await fetch(fullUrl, requestOptions)

      if (!response.ok) {
        // Intentar leer el cuerpo de la respuesta de error
        let errorDetail = `HTTP error! status: ${response.status}`
        let errorBody: any = null
        try {
          errorBody = await response.json()
          errorDetail = errorBody.message || errorBody.error || errorBody.detail || JSON.stringify(errorBody)
        } catch {
          // Si no se puede parsear como JSON, intentar leer como texto
          try {
            const errorText = await response.text()
            if (errorText) {
              errorDetail += ` - ${errorText}`
              // Intentar parsear como JSON si es texto
              try {
                errorBody = JSON.parse(errorText)
                errorDetail = errorBody.message || errorBody.error || errorBody.detail || errorDetail
              } catch {}
            }
          } catch {}
        }
        
        // Log detallado del error para debugging
        const responseHeaders: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value
        })
        
        console.error(`[apiClient.put] Error ${response.status} en ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          errorDetail,
          errorBody,
          responseHeaders,
          url: fullUrl,
          method: 'PUT',
          // Log the request headers actually sent with this ApiClient instance
          requestHeaders: headers
        })
        
        throw new Error(errorDetail)
      }

      // Manejar respuestas 204 No Content (sin body)
      if (response.status === 204) {
        return {
          data: null as T,
          success: true,
          message: 'Datos actualizados correctamente'
        }
      }

      // Para otras respuestas exitosas, intentar parsear JSON
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
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await mockDelay()
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined
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
