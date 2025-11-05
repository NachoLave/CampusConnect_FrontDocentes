'use client'

import { useEffect } from 'react'
import { useMockAuth } from '@/lib/hooks/useAuth'
import { USE_MOCK_DATA } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import { apiClient } from '@/lib/utils/api'

interface MockAuthProviderProps {
  children: React.ReactNode
}

/**
 * Provider que inicializa automáticamente el modo mock de autenticación
 * cuando estamos en modo desarrollo
 */
export function MockAuthProvider({ children }: MockAuthProviderProps) {
  useMockAuth()

  // Configurar headers de autenticación globalmente para apiClient
  useEffect(() => {
    apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES)
    console.log('🔐 Headers de autenticación configurados:', {
      'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
      'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES
    })
  }, [])

  return (
    <>
      {children}
    </>
  )
}
