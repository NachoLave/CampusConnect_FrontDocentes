/**
 * Sistema de cache usando localStorage para el dashboard
 * Permite mostrar datos cacheados inmediatamente mientras se actualizan en background
 */

interface CachedData<T> {
  data: T
  timestamp: number
  ttl: number // Time to live en milisegundos
}

const CACHE_PREFIX = 'dashboard_cache_'
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutos por defecto

export class LocalStorageCache {
  /**
   * Obtener datos del cache
   */
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`)
      if (!cached) return null
      
      const parsed: CachedData<T> = JSON.parse(cached)
      const now = Date.now()
      
      // Verificar si el cache expiró
      if (now - parsed.timestamp > parsed.ttl) {
        // Cache expirado, eliminarlo
        localStorage.removeItem(`${CACHE_PREFIX}${key}`)
        return null
      }
      
      return parsed.data
    } catch (error) {
      console.warn(`Error reading cache for key ${key}:`, error)
      return null
    }
  }
  
  /**
   * Guardar datos en el cache
   */
  static set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    if (typeof window === 'undefined') return
    
    try {
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now(),
        ttl
      }
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cached))
    } catch (error) {
      console.warn(`Error writing cache for key ${key}:`, error)
      // Si el localStorage está lleno, intentar limpiar caches viejos
      this.clearExpired()
    }
  }
  
  /**
   * Eliminar un item específico del cache
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`${CACHE_PREFIX}${key}`)
  }
  
  /**
   * Limpiar todos los caches expirados
   */
  static clearExpired(): void {
    if (typeof window === 'undefined') return
    
    try {
      const keys = Object.keys(localStorage)
      const now = Date.now()
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key)
            if (cached) {
              const parsed: CachedData<any> = JSON.parse(cached)
              if (now - parsed.timestamp > parsed.ttl) {
                localStorage.removeItem(key)
              }
            }
          } catch (error) {
            // Si hay error parseando, eliminar el item
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      console.warn('Error clearing expired cache:', error)
    }
  }
  
  /**
   * Limpiar todo el cache del dashboard
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return
    
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Error clearing all cache:', error)
    }
  }
  
  /**
   * Verificar si hay datos cacheados válidos
   */
  static has(key: string): boolean {
    return this.get(key) !== null
  }
}

// Limpiar caches expirados al cargar el módulo
if (typeof window !== 'undefined') {
  LocalStorageCache.clearExpired()
}
