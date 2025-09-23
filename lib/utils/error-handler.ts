// Utilidades para manejo de errores

export interface ErrorInfo {
  message: string
  code?: string
  details?: any
}

export class AppError extends Error {
  public readonly code?: string
  public readonly details?: any

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }
}

// Función para formatear errores de manera consistente
export function formatError(error: unknown): ErrorInfo {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR'
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
      code: 'STRING_ERROR'
    }
  }

  return {
    message: 'Ha ocurrido un error inesperado',
    code: 'UNEXPECTED_ERROR',
    details: error
  }
}

// Función para mostrar errores de manera amigable al usuario
export function getUserFriendlyError(error: unknown): string {
  const errorInfo = formatError(error)

  // Mapeo de códigos de error a mensajes amigables
  const friendlyMessages: Record<string, string> = {
    'NETWORK_ERROR': 'Error de conexión. Verifica tu conexión a internet.',
    'TIMEOUT_ERROR': 'La operación ha tardado demasiado. Intenta nuevamente.',
    'UNAUTHORIZED': 'No tienes permisos para realizar esta acción.',
    'NOT_FOUND': 'El recurso solicitado no fue encontrado.',
    'VALIDATION_ERROR': 'Los datos proporcionados no son válidos.',
    'SERVER_ERROR': 'Error interno del servidor. Intenta más tarde.',
    'UNKNOWN_ERROR': 'Ha ocurrido un error inesperado.',
    'STRING_ERROR': errorInfo.message,
    'UNEXPECTED_ERROR': 'Ha ocurrido un error inesperado.'
  }

  return friendlyMessages[errorInfo.code || 'UNKNOWN_ERROR'] || errorInfo.message
}

// Hook para manejo de errores en componentes
export function useErrorHandler() {
  const handleError = (error: unknown) => {
    const friendlyMessage = getUserFriendlyError(error)
    console.error('Error capturado:', formatError(error))
    
    // Aquí podrías integrar con un sistema de notificaciones
    // como react-hot-toast, sonner, etc.
    return friendlyMessage
  }

  return { handleError }
}

// Función para retry automático
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        throw new AppError(
          `Operación falló después de ${maxRetries} intentos`,
          'MAX_RETRIES_EXCEEDED',
          { originalError: formatError(error), attempts: attempt }
        )
      }

      // Delay exponencial
      const delay = delayMs * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
