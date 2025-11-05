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
      {APP_CONFIG.USE_MOCK_AUTH && (
        <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-50">
          🔧 Auth Mock (Docente {APP_CONFIG.MOCK_TEACHER_ID})
        </div>
      )}
      {!USE_MOCK_DATA && (
        <div className="fixed bottom-4 left-4 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-50">
          🌐 Datos Reales del Backend
        </div>
      )}
    </>
  )
}
