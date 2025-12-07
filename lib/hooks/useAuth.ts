import { useEffect } from 'react'
import { authService } from '@/lib/api/services/auth'
import { APP_CONFIG } from '@/lib/config/app'

/**
 * Hook para inicializar la autenticación mock automáticamente
 * cuando estamos en modo desarrollo o mock
 * @deprecated Usar useAuthContext del AuthProvider en su lugar
 */
export function useMockAuth() {
  useEffect(() => {
    if (APP_CONFIG.USE_MOCK_AUTH) {
      // Inicializar modo mock automáticamente
      authService.initializeMockMode()
      console.log('Modo mock de autenticación inicializado')
    }
  }, [])
}

/**
 * Hook para obtener el estado de autenticación
 * Nota: Para la nueva implementación con JWT desde Core, usar useAuthContext
 */
export function useAuth() {
  const isAuthenticated = authService.isAuthenticated()
  
  return {
    isAuthenticated,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    getProfile: authService.getProfile.bind(authService),
    getToken: authService.getToken.bind(authService),
    isLocalDevelopment: authService.isLocalDevelopment.bind(authService),
    redirectToCore: authService.redirectToCore.bind(authService)
  }
}

// Re-exportar el contexto de autenticación desde el provider
export { useAuthContext } from '@/components/auth/AuthProvider'
