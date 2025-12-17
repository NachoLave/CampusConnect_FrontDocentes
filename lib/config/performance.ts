/**
 * Configuración de optimizaciones de rendimiento
 */

export const PERFORMANCE_CONFIG = {
  // Cache TTL en segundos
  CACHE_TTL: {
    COURSES: 60,       // 1 minuto
    CALENDAR: 180,     // 3 minutos
    WALLET: 60,        // 1 minuto
    DASHBOARD: 300,    // 5 minutos
    PROFILE: 600,      // 10 minutos
  },

  // Tiempos de debounce en ms
  DEBOUNCE: {
    SEARCH: 300,
    INPUT: 500,
    RESIZE: 150,
  },

  // Tiempos de throttle en ms
  THROTTLE: {
    SCROLL: 100,
    RESIZE: 200,
    MOUSEMOVE: 50,
  },

  // Configuración de imágenes
  IMAGES: {
    QUALITY: 85,
    PLACEHOLDER: 'blur',
    LOADING: 'lazy' as const,
    SIZES: {
      MOBILE: 640,
      TABLET: 1024,
      DESKTOP: 1920,
    }
  },

  // Configuración de lazy loading
  LAZY_LOAD: {
    ROOT_MARGIN: '50px',
    THRESHOLD: 0.01,
  },

  // Límites de paginación
  PAGINATION: {
    COURSES_PER_PAGE: 20,
    TRANSACTIONS_PER_PAGE: 15,
    EVENTS_PER_PAGE: 30,
  },

  // Configuración de requests
  API: {
    TIMEOUT: 10000,        // 10 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,     // 1 segundo
  },

  // Feature flags para optimizaciones
  FEATURES: {
    ENABLE_IMAGE_OPTIMIZATION: true,
    ENABLE_PREFETCH: true,
    ENABLE_SERVICE_WORKER: false, // Habilitar cuando esté listo
    ENABLE_VIRTUAL_SCROLL: false, // Para listas muy largas
    RESPECT_DATA_SAVER: true,     // Respetar preferencia de ahorro de datos
  }
}

/**
 * Determinar si se debe usar optimizaciones reducidas basado en la conexión
 */
export function shouldUseReducedOptimizations(): boolean {
  if (typeof navigator === 'undefined') return false
  
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection
  
  if (!connection) return false
  
  // Usar optimizaciones reducidas si:
  // - Conexión lenta (2G, slow-2g)
  // - Data saver activado
  return (
    connection.effectiveType === '2g' ||
    connection.effectiveType === 'slow-2g' ||
    connection.saveData === true
  ) && PERFORMANCE_CONFIG.FEATURES.RESPECT_DATA_SAVER
}

/**
 * Obtener calidad de imagen basada en la conexión
 */
export function getImageQuality(): number {
  if (shouldUseReducedOptimizations()) {
    return 60 // Menor calidad para conexiones lentas
  }
  return PERFORMANCE_CONFIG.IMAGES.QUALITY
}

/**
 * Determinar si se debe prefetch basado en la conexión
 */
export function shouldPrefetch(): boolean {
  if (!PERFORMANCE_CONFIG.FEATURES.ENABLE_PREFETCH) {
    return false
  }
  return !shouldUseReducedOptimizations()
}
