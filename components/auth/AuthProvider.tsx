'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { authService, CORE_LOGIN_URL, getRedirectUrl } from '@/lib/api/services/auth'
import { APP_CONFIG } from '@/lib/config/app'
import { apiClient } from '@/lib/utils/api'
import type { AuthUser } from '@/lib/types'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  logout: () => void
  loginWithToken: (token: string) => boolean
  redirectToCore: () => void
  tokenTimeRemaining: number
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [tokenTimeRemaining, setTokenTimeRemaining] = useState(0)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Función para hacer login con un token
  const loginWithToken = (token: string): boolean => {
    const success = authService.processJWTFromCore(token)
    if (success) {
      setUser(authService.getProfile())
      setIsAuthenticated(true)
      
      // Configurar headers para el apiClient con JWT real
      apiClient.setAuthToken(token)
      
      // Guardar el UUID del docente para uso en endpoints
      const teacherUUID = authService.getTeacherUUID()
      if (teacherUUID) {
        apiClient.setTeacherUUID(teacherUUID)
        console.log('✅ UUID del docente configurado:', teacherUUID)
      }
      
      return true
    }
    return false
  }

  // Función para cerrar sesión
  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    
    // Redirigir al login
    if (authService.isLocalDevelopment()) {
      router.push('/login')
    } else {
      authService.redirectToCore()
    }
  }

  // Función para redirigir a Core
  const redirectToCore = () => {
    authService.redirectToCore()
  }

  // Efecto para verificar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 Inicializando autenticación...')
      
      // Si estamos en modo mock auth, usar el mock
      if (APP_CONFIG.USE_MOCK_AUTH) {
        console.log('📦 Modo mock auth activado')
        authService.initializeMockMode()
        setUser(authService.getProfile())
        setIsAuthenticated(true)
        
        // Configurar headers mock
        apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES)
        
        setIsLoading(false)
        return
      }

      // Verificar si hay un JWT en la URL (viniendo de Core)
      const jwtFromUrl = searchParams.get('JWT')
      
      if (jwtFromUrl) {
        console.log('🎫 JWT encontrado en URL, procesando...')
        
        const success = loginWithToken(jwtFromUrl)
        
        if (success) {
          // Limpiar el JWT de la URL por seguridad
          const url = new URL(window.location.href)
          url.searchParams.delete('JWT')
          window.history.replaceState({}, '', url.toString())
          
          console.log('✅ Login exitoso desde Core')
          setIsLoading(false)
          return
        } else {
          console.error('❌ JWT inválido o expirado')
        }
      }

      // Intentar restaurar sesión desde localStorage
      const sessionRestored = authService.restoreSession()
      
      if (sessionRestored && authService.isAuthenticated()) {
        console.log('✅ Sesión restaurada desde localStorage')
        setUser(authService.getProfile())
        setIsAuthenticated(true)
        
        // Configurar el token y UUID en apiClient
        const token = authService.getToken()
        if (token) {
          apiClient.setAuthToken(token)
          
          // Configurar también el UUID del docente
          const teacherUUID = authService.getTeacherUUID()
          if (teacherUUID) {
            apiClient.setTeacherUUID(teacherUUID)
            console.log('✅ UUID del docente restaurado:', teacherUUID)
          }
        }
        
        setIsLoading(false)
        return
      }

      // No hay sesión válida
      console.log('⚠️ No hay sesión válida')
      setIsAuthenticated(false)
      setIsLoading(false)

      // Si no estamos en /login y no hay sesión, redirigir
      if (pathname !== '/login') {
        if (authService.isLocalDevelopment()) {
          // En desarrollo local, ir a la página de login manual
          router.push('/login')
        } else {
          // En producción, redirigir a Core
          authService.redirectToCore()
        }
      }
    }

    initAuth()
  }, [searchParams, pathname, router])

  // Actualizar tiempo restante del token cada minuto
  useEffect(() => {
    if (!isAuthenticated) return

    const updateTimeRemaining = () => {
      const remaining = authService.getTokenTimeRemaining()
      setTokenTimeRemaining(remaining)
      
      // Si el token está por expirar (menos de 5 minutos), avisar
      if (remaining > 0 && remaining < 300) {
        console.warn(`⚠️ Token expira en ${Math.floor(remaining / 60)} minutos`)
      }
      
      // Si el token expiró, hacer logout
      if (remaining <= 0 && isAuthenticated) {
        console.log('⏰ Token expirado, cerrando sesión...')
        logout()
      }
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000) // Cada minuto

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    token: authService.getToken(),
    logout,
    loginWithToken,
    redirectToCore,
    tokenTimeRemaining
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

