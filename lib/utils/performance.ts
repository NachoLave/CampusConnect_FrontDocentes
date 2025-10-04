/**
 * Utilidades de optimización de rendimiento
 */

/**
 * Debounce function para optimizar eventos que se disparan frecuentemente
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function para limitar la frecuencia de ejecución
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Lazy load de datos pesados con cache
 */
export class DataCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>()
  private ttl: number

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000
  }

  get(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

/**
 * Detectar si el usuario prefiere movimiento reducido
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Intersection Observer para lazy loading de imágenes
 */
export function createLazyLoadObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined') return null
  
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry)
      }
    })
  }, {
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  })
}

/**
 * Request Idle Callback wrapper con fallback
 */
export function requestIdleCallbackPolyfill(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if (typeof window === 'undefined') return 0
  
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options)
  }
  
  // Fallback para navegadores sin soporte
  return window.setTimeout(() => {
    const start = Date.now()
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    })
  }, 1)
}

/**
 * Cancelar Idle Callback con fallback
 */
export function cancelIdleCallbackPolyfill(id: number): void {
  if (typeof window === 'undefined') return
  
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id)
  } else {
    window.clearTimeout(id)
  }
}

/**
 * Optimizar imágenes según el tamaño del dispositivo
 */
export function getOptimizedImageSize(): number {
  if (typeof window === 'undefined') return 1920
  
  const width = window.innerWidth
  const dpr = window.devicePixelRatio || 1
  
  // Retornar el tamaño óptimo considerando el DPR
  if (width <= 640) return Math.min(640 * dpr, 1280)
  if (width <= 1024) return Math.min(1024 * dpr, 2048)
  return Math.min(1920 * dpr, 3840)
}

/**
 * Precargar recursos críticos
 */
export function preloadResource(href: string, as: string): void {
  if (typeof document === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

/**
 * Verificar si la conexión es lenta
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  
  if (!connection) return false
  
  // Considerar lenta si es 2G, slow-2g o save-data está activado
  return connection.effectiveType === '2g' || 
         connection.effectiveType === 'slow-2g' ||
         connection.saveData === true
}
