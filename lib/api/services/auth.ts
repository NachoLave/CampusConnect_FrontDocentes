import { API_CONFIG, DEFAULT_HEADERS } from '@/lib/config/api'
import type { AuthUser, LoginCredentials, AuthResponse } from '@/lib/types'
import { APP_CONFIG } from '@/lib/config/app'
import { LocalStorageCache } from '@/lib/utils/cache'

// URL del login de Core
export const CORE_LOGIN_URL = 'https://core-frontend-2025-02.netlify.app'

// Obtener la URL de redirección según el entorno
export const getRedirectUrl = (): string => {
  if (typeof window !== 'undefined') {
    // En desarrollo local
    if (window.location.hostname === 'localhost') {
      return `http://localhost:${window.location.port}`
    }
    // En producción, usar el origin actual
    return window.location.origin
  }
  return ''
}

// Estructura del payload JWT decodificado (desde Core)
export interface JWTPayload {
  sub: string          // UUID del docente (principal identificador)
  email?: string
  name?: string
  nombre?: string      // Alternativa para name
  roles?: string[]
  role?: string        // Rol único (DOCENTE, ADMIN, etc.)
  subrol?: string | null
  career?: {
    uuid: string
    name: string
  }
  wallet?: string[]    // UUIDs de billeteras asociadas
  department?: string
  iat: number          // Issued at
  exp: number          // Expiration
}

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
  private jwtPayload: JWTPayload | null = null

  /**
   * Inicializa el modo mock para desarrollo
   */
  initializeMockMode(): void {
    if (!APP_CONFIG.USE_MOCK_AUTH) {
      console.warn('initializeMockMode() llamado pero USE_MOCK_AUTH es false')
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
    
    console.log('🔐 Modo mock de autenticación inicializado')
  }

  /**
   * Decodifica un JWT sin verificar la firma (la verificación la hace el backend)
   */
  decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        console.error('Token JWT inválido: no tiene 3 partes')
        return null
      }
      
      // Decodificar el payload (segunda parte)
      const payload = parts[1]
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded)
    } catch (error) {
      console.error('Error decodificando JWT:', error)
      return null
    }
  }

  /**
   * Verifica si el token está expirado
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeJWT(token)
    if (!payload || !payload.exp) {
      return true
    }
    
    // exp está en segundos, Date.now() en milisegundos
    const expirationTime = payload.exp * 1000
    const now = Date.now()
    
    // Agregar un margen de 60 segundos para evitar problemas de timing
    return now >= (expirationTime - 60000)
  }

  /**
   * Procesa el JWT recibido desde Core y crea la sesión
   */
  processJWTFromCore(token: string): boolean {
    console.log('🔑 Procesando JWT desde Core...')
    
    // Decodificar el token
    const payload = this.decodeJWT(token)
    if (!payload) {
      console.error('❌ No se pudo decodificar el JWT')
      return false
    }
    
    // Verificar expiración
    if (this.isTokenExpired(token)) {
      console.error('❌ El token JWT está expirado')
      return false
    }
    
    // Verificar si es un usuario diferente (cambio de usuario)
    const currentUserId = this.jwtPayload?.sub
    const newUserId = payload.sub
    const isDifferentUser = currentUserId && currentUserId !== newUserId
    
    if (isDifferentUser) {
      console.log('🔄 Detectado cambio de usuario, limpiando cache...')
      // Limpiar cache cuando cambia el usuario
      // IMPORTANTE: Al cambiar de usuario, SÍ se eliminan las notificaciones de eventos
      // porque son específicas del usuario anterior
      if (typeof window !== 'undefined') {
        LocalStorageCache.clearAll()
        // También limpiar datos específicos del usuario anterior
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('attendance_') || key.startsWith('grades_'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        // Eliminar notificaciones de eventos del usuario anterior
        localStorage.removeItem('event_notifications_shown')
        localStorage.removeItem('event_notifications_read')
      }
    }
    
    console.log('✅ JWT válido:', {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.nombre,
      roles: payload.roles || payload.role,
      exp: new Date(payload.exp * 1000).toLocaleString()
    })
    
    // Crear el usuario desde el payload
    // Usar el UUID (sub) como identificador numérico si es posible parsearlo, sino usar 0
    const userId = payload.sub ? parseInt(payload.sub.replace(/-/g, '').substring(0, 8), 16) || 0 : 0
    this.user = {
      id: userId,
      name: payload.name || payload.nombre || 'Docente',
      email: payload.email || '',
      roles: payload.roles || (payload.role ? [payload.role] : ['TEACHER']),
      department: payload.department
    }
    
    this.token = token
    this.jwtPayload = payload
    
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(this.user))
      localStorage.setItem('jwt_payload', JSON.stringify(payload))
    }
    
    console.log('✅ Sesión creada exitosamente para:', this.user.name)
    return true
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (this.isMockMode && APP_CONFIG.USE_MOCK_AUTH) {
      return this.user !== null
    }

    // Verificar token en memoria o localStorage
    const token = this.token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null)
    
    if (!token) {
      return false
    }
    
    // Verificar que no esté expirado
    if (this.isTokenExpired(token)) {
      console.log('⚠️ Token expirado, limpiando sesión...')
      this.logout()
      return false
    }
    
    return true
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  getProfile(): AuthUser | null {
    if (this.isMockMode && APP_CONFIG.USE_MOCK_AUTH) {
      return this.user
    }

    // Primero intentar de memoria
    if (this.user) {
      return this.user
    }

    // Luego de localStorage
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
   * Realiza el login del usuario (para flujo tradicional, no Core)
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
    this.jwtPayload = null
    
    // Limpiar localStorage y cache
    if (typeof window !== 'undefined') {
      // Guardar las claves de notificaciones de eventos antes de limpiar
      // Estas NO deben eliminarse al cerrar sesión, solo cuando se marquen como leídas
      const eventNotificationsShown = localStorage.getItem('event_notifications_shown')
      const eventNotificationsRead = localStorage.getItem('event_notifications_read')
      
      // Limpiar datos de autenticación
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('jwt_payload')
      localStorage.removeItem('mock_user')
      localStorage.removeItem('mock_token')
      
      // Limpiar toda la cache de datos del usuario
      LocalStorageCache.clearAll()
      
      // Limpiar cualquier otro dato específico del usuario que pueda estar en localStorage
      // (por ejemplo, datos de asistencia guardados localmente)
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('attendance_') || key.startsWith('grades_'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Restaurar las notificaciones de eventos (NO deben eliminarse al cerrar sesión)
      if (eventNotificationsShown) {
        localStorage.setItem('event_notifications_shown', eventNotificationsShown)
      }
      if (eventNotificationsRead) {
        localStorage.setItem('event_notifications_read', eventNotificationsRead)
      }
    }
    
    console.log('👋 Usuario deslogueado - Cache limpiada')
  }

  /**
   * Redirige al login de Core con la URL de retorno
   */
  redirectToCore(): void {
    if (typeof window !== 'undefined') {
      const redirectUrl = encodeURIComponent(getRedirectUrl())
      const coreUrl = `${CORE_LOGIN_URL}/?redirectUrl=${redirectUrl}`
      console.log('🔄 Redirigiendo a Core:', coreUrl)
      window.location.href = coreUrl
    }
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    if (this.isMockMode && APP_CONFIG.USE_MOCK_AUTH) {
      return this.token
    }

    if (this.token) {
      return this.token
    }

    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    
    return null
  }

  /**
   * Obtiene el payload JWT decodificado
   */
  getJWTPayload(): JWTPayload | null {
    if (this.jwtPayload) {
      return this.jwtPayload
    }

    if (typeof window !== 'undefined') {
      const payloadStr = localStorage.getItem('jwt_payload')
      if (payloadStr) {
        try {
          return JSON.parse(payloadStr)
        } catch (error) {
          console.error('Error parsing JWT payload:', error)
        }
      }
    }

    return null
  }

  /**
   * Obtiene el tiempo restante del token en segundos
   */
  getTokenTimeRemaining(): number {
    const token = this.getToken()
    if (!token) return 0

    const payload = this.decodeJWT(token)
    if (!payload || !payload.exp) return 0

    const now = Math.floor(Date.now() / 1000)
    return Math.max(0, payload.exp - now)
  }

  /**
   * Obtiene el UUID del docente desde el JWT (campo 'sub')
   * Este es el identificador principal para usar en endpoints
   */
  getTeacherUUID(): string | null {
    // En modo mock, devolver el ID mock
    if (this.isMockMode && APP_CONFIG.USE_MOCK_AUTH) {
      return APP_CONFIG.MOCK_TEACHER_ID
    }

    const payload = this.getJWTPayload()
    return payload?.sub || null
  }

  /**
   * Obtiene el email del docente desde el JWT
   */
  getTeacherEmail(): string | null {
    const payload = this.getJWTPayload()
    return payload?.email || null
  }

  /**
   * Obtiene el nombre del docente desde el JWT
   */
  getTeacherName(): string | null {
    const payload = this.getJWTPayload()
    return payload?.name || payload?.nombre || null
  }

  /**
   * Obtiene el rol del docente desde el JWT
   */
  getTeacherRole(): string | null {
    const payload = this.getJWTPayload()
    if (payload?.roles && payload.roles.length > 0) {
      return payload.roles[0]
    }
    return payload?.role || null
  }

  /**
   * Obtiene todos los roles del docente
   */
  getTeacherRoles(): string[] {
    const payload = this.getJWTPayload()
    if (payload?.roles) {
      return payload.roles
    }
    if (payload?.role) {
      return [payload.role]
    }
    return []
  }

  /**
   * Obtiene el UUID de la billetera del docente (primera billetera si hay varias)
   */
  getWalletUUID(): string | null {
    const payload = this.getJWTPayload()
    if (payload?.wallet && payload.wallet.length > 0) {
      return payload.wallet[0]
    }
    return null
  }

  /**
   * Obtiene todos los UUIDs de billeteras del docente
   */
  getWalletUUIDs(): string[] {
    const payload = this.getJWTPayload()
    return payload?.wallet || []
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
  restoreSession(): boolean {
    if (typeof window === 'undefined') return false

    // Si estamos en modo mock auth, inicializar mock
    if (APP_CONFIG.USE_MOCK_AUTH) {
      const mockUser = localStorage.getItem('mock_user')
      const mockToken = localStorage.getItem('mock_token')
      
      if (mockUser && mockToken) {
        this.isMockMode = true
        this.user = JSON.parse(mockUser)
        this.token = mockToken
        return true
      }
    }

    // Verificar datos reales
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    
    if (token && userStr) {
      // Verificar que el token no esté expirado
      if (this.isTokenExpired(token)) {
        console.log('⚠️ Token guardado está expirado, limpiando...')
        this.logout()
        return false
      }

      try {
        this.user = JSON.parse(userStr)
        this.token = token
        
        const payloadStr = localStorage.getItem('jwt_payload')
        if (payloadStr) {
          this.jwtPayload = JSON.parse(payloadStr)
        }
        
        console.log('✅ Sesión restaurada para:', this.user?.name)
        return true
      } catch (error) {
        console.error('Error restoring session:', error)
        this.logout()
        return false
      }
    }

    return false
  }

  /**
   * Verifica si estamos en modo desarrollo local
   */
  isLocalDevelopment(): boolean {
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    }
    return false
  }
}

// Crear instancia singleton
export const authService = new AuthService()

// Restaurar sesión al cargar el módulo (solo en cliente)
if (typeof window !== 'undefined') {
  authService.restoreSession()
}

