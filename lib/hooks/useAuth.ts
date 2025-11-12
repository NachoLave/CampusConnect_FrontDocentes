import { useEffect } from 'react'
import { authService } from '@/lib/api/services/auth'
import { USE_MOCK_DATA } from '@/lib/config/api'

/**
 * Hook para inicializar la autenticación mock automáticamente
 * cuando estamos en modo desarrollo o mock
 */
export function useMockAuth() {
  useEffect(() => {
    if (USE_MOCK_DATA) {
      // Inicializar modo mock automáticamente
      authService.initializeMockMode()
      console.log('Modo mock de autenticación inicializado')
    }
  }, [])
}

/**
 * Hook para obtener el estado de autenticación
 */
export function useAuth() {
  const isAuthenticated = authService.isAuthenticated()
  
  return {
    isAuthenticated,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    getProfile: authService.getProfile.bind(authService)
  }
}












