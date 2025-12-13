'use client'

import { useState, useEffect } from 'react'
import { errorTracker, ErrorInfo } from '@/lib/utils/error-tracker'

/**
 * Hook para manejar notificaciones de errores globalmente
 * Muestra badges temporales con información detallada de errores
 */
export function useErrorNotifications() {
  const [errors, setErrors] = useState<ErrorInfo[]>([])

  useEffect(() => {
    // Cargar errores iniciales
    setErrors(errorTracker.getErrors())

    // Suscribirse a nuevos errores
    const unsubscribe = errorTracker.subscribe((newErrors) => {
      setErrors(newErrors)
    })

    return unsubscribe
  }, [])

  const dismissError = (id: string) => {
    errorTracker.removeError(id)
  }

  const clearAllErrors = () => {
    errorTracker.clearErrors()
  }

  const clearModuleErrors = (module: string) => {
    errorTracker.clearModuleErrors(module)
  }

  return {
    errors,
    dismissError,
    clearAllErrors,
    clearModuleErrors
  }
}
