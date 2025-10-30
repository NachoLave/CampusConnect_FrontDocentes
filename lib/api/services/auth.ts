import { API_CONFIG, DEFAULT_HEADERS, USE_MOCK_DATA } from '@/lib/config/api'
import type { AuthUser, LoginCredentials, AuthResponse } from '@/lib/types'

// Mock data para desarrollo
const MOCK_USER: AuthUser = {
  id: 1,
  name: 'Dr. Juan Pérez',
  email: 'juan.perez@campus.edu',
  avatar: '/placeholder-user.jpg',
  roles: ['TEACHER', 'ADMIN'],
  department: 'Ingeniería en Sistemas'
}

const MOCK_TOKEN = 'mock-jwt-token-for-development'

class AuthService {
  private user: AuthUser | null = null
  private token: string | null = null
  private isMockMode = false

  /**
   * Inicializa el modo mock para desarrollo
   */
  initializeMockMode(): void {
    if (!USE_MOCK_DATA) {
      console.warn('⚠️ initializeMockMode() llamado pero USE_MOCK_DATA es false')
      return
    }
    
    this.isMockMode = true
    this.user = MOCK_USER
    this.token = MOCK_TOKEN
    
    // Guardar en localStorage para persistencia
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_user', JSON.stringify(MOCK_USER))
      localStorage.setItem('mock_token', MOCK_TOKEN)
    }
    
    console.log('🔧 Modo mock de autenticación inicializado')
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (this.isMockMode) {
      return this.user !== null
    }

    // En modo real, verificar token en localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('auth_user')
      return !!(token && user)
    }
    
    return false
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  getProfile(): AuthUser | null {
    if (this.isMockMode) {
      return this.user
    }

    // En modo real, obtener de localStorage
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user')
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch (error) {
          console.error('Error parsing user from localStorage:', error)
        }
      }
    }
    
    return null
  }

  /**
   * Realiza el login del usuario
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (this.isMockMode) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      this.user = MOCK_USER
      this.token = MOCK_TOKEN
      
      return {
        user: MOCK_USER,
        token: MOCK_TOKEN
      }
    }

    // Implementación real para producción
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`)
      }

      const authResponse: AuthResponse = await response.json()
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', authResponse.token)
        localStorage.setItem('auth_user', JSON.stringify(authResponse.user))
        if (authResponse.refreshToken) {
          localStorage.setItem('auth_refresh_token', authResponse.refreshToken)
        }
      }

      this.user = authResponse.user
      this.token = authResponse.token

      return authResponse
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.user = null
    this.token = null
    
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('mock_user')
      localStorage.removeItem('mock_token')
    }
    
    console.log('👋 Usuario deslogueado')
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    if (this.isMockMode) {
      return this.token
    }

    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    
    return null
  }

  /**
   * Refresca el token de autenticación
   */
  async refreshToken(): Promise<string> {
    if (this.isMockMode) {
      return MOCK_TOKEN
    }

    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('auth_refresh_token') 
      : null

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ refreshToken })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Actualizar token en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token)
        if (data.refreshToken) {
          localStorage.setItem('auth_refresh_token', data.refreshToken)
        }
      }

      this.token = data.token
      return data.token
    } catch (error) {
      console.error('Token refresh error:', error)
      // Si falla el refresh, hacer logout
      this.logout()
      throw error
    }
  }

  /**
   * Restaura la sesión desde localStorage (para recargas de página)
   */
  restoreSession(): void {
    if (typeof window === 'undefined') return

    // Verificar si hay datos mock guardados
    const mockUser = localStorage.getItem('mock_user')
    const mockToken = localStorage.getItem('mock_token')
    
    if (mockUser && mockToken && USE_MOCK_DATA) {
      this.isMockMode = true
      this.user = JSON.parse(mockUser)
      this.token = mockToken
      return
    }

    // Verificar datos reales
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    
    if (token && userStr) {
      try {
        this.user = JSON.parse(userStr)
        this.token = token
      } catch (error) {
        console.error('Error restoring session:', error)
        this.logout()
      }
    }
  }
}

// Crear instancia singleton
export const authService = new AuthService()

// Restaurar sesión al cargar el módulo
if (typeof window !== 'undefined') {
  authService.restoreSession()
}