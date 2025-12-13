/**
 * Sistema centralizado de tracking de errores por módulo y endpoint
 * Para la entrega final: mostrar qué módulo falló, qué endpoint y código de error
 */

export interface ErrorInfo {
  id: string
  module: string // Ej: "Calendario", "Comedor", "Tienda", "Cursos", etc.
  endpoint: string // Ej: "/api/teachers/me/notifications", "/api/canteen/reservations"
  method: string // GET, POST, PATCH, etc.
  statusCode?: number // Código HTTP de error
  message: string
  timestamp: number
  details?: any
}

class ErrorTracker {
  private errors: Map<string, ErrorInfo> = new Map()
  private listeners: Set<(errors: ErrorInfo[]) => void> = new Set()
  private maxErrors = 10 // Máximo de errores a mantener

  /**
   * Registrar un error
   */
  trackError(module: string, endpoint: string, method: string, statusCode: number | undefined, message: string, details?: any): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const error: ErrorInfo = {
      id,
      module,
      endpoint,
      method,
      statusCode,
      message,
      timestamp: Date.now(),
      details
    }

    this.errors.set(id, error)

    // Limitar cantidad de errores
    if (this.errors.size > this.maxErrors) {
      const oldestError = Array.from(this.errors.values())
        .sort((a, b) => a.timestamp - b.timestamp)[0]
      this.errors.delete(oldestError.id)
    }

    // Notificar a los listeners
    this.notifyListeners()

    return id
  }

  /**
   * Obtener todos los errores activos
   */
  getErrors(): ErrorInfo[] {
    return Array.from(this.errors.values())
  }

  /**
   * Obtener errores de un módulo específico
   */
  getErrorsByModule(module: string): ErrorInfo[] {
    return Array.from(this.errors.values())
      .filter(error => error.module === module)
  }

  /**
   * Eliminar un error específico
   */
  removeError(id: string): void {
    this.errors.delete(id)
    this.notifyListeners()
  }

  /**
   * Limpiar todos los errores
   */
  clearErrors(): void {
    this.errors.clear()
    this.notifyListeners()
  }

  /**
   * Limpiar errores de un módulo específico
   */
  clearModuleErrors(module: string): void {
    const moduleErrors = this.getErrorsByModule(module)
    moduleErrors.forEach(error => this.errors.delete(error.id))
    this.notifyListeners()
  }

  /**
   * Suscribirse a cambios en los errores
   */
  subscribe(listener: (errors: ErrorInfo[]) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners(): void {
    const errors = this.getErrors()
    this.listeners.forEach(listener => listener(errors))
  }

  /**
   * Auto-eliminar errores después de un tiempo (para badges temporales)
   */
  autoRemoveError(id: string, delayMs: number = 10000): void {
    if (typeof window === 'undefined') return
    setTimeout(() => {
      this.removeError(id)
    }, delayMs)
  }
}

// Instancia singleton
export const errorTracker = new ErrorTracker()

/**
 * Helper para extraer información del endpoint desde una URL
 */
export function extractEndpointInfo(url: string): { module: string; endpoint: string } {
  // Mapear rutas a módulos
  const moduleMap: Record<string, string> = {
    '/api/teachers/me/notifications': 'Notificaciones',
    '/api/canteen': 'Comedor',
    '/api/events': 'Eventos Académicos',
    '/api/clases-individuales': 'Clases',
    '/api/teaching/courses': 'Cursos',
    '/api/teachers/me': 'Perfil',
    '/api/teachers/me/courses': 'Cursos',
    '/api/teachers/me/availability': 'Disponibilidad',
    '/api/teachers/me/proposals': 'Propuestas',
    '/api/teachers/me/account/balance': 'Billetera',
    '/api/teachers/me/wallet': 'Billetera',
    '/api/teachers/me/store': 'Tienda',
    '/api/teachers/me/canteen': 'Comedor',
    '/api/attendance': 'Asistencia',
    '/api/assessments': 'Calificaciones',
    '/api/acts': 'Actas',
    '/api/sedes': 'Sedes',
    '/api/subjects': 'Materias'
  }

  // Buscar el módulo correspondiente
  for (const [path, module] of Object.entries(moduleMap)) {
    if (url.includes(path)) {
      // Extraer el endpoint completo
      const urlObj = new URL(url, 'http://localhost') // URL relativa
      const endpoint = urlObj.pathname + (urlObj.search || '')
      return { module, endpoint }
    }
  }

  // Si no se encuentra, intentar inferir del path
  const pathParts = url.split('/').filter(Boolean)
  const module = pathParts[1] ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1) : 'Desconocido'
  const endpoint = url.split('?')[0] // Sin query params

  return { module, endpoint }
}
