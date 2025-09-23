// Utilidades para estados de carga sin JSX

export interface LoadingOptions {
  minLoadingTime?: number // Tiempo mínimo de carga en ms
  showLoadingAfter?: number // Mostrar loading después de X ms
}

// Hook para manejar estados de carga con tiempos mínimos
export function useLoadingState(options: LoadingOptions = {}) {
  const { minLoadingTime = 0, showLoadingAfter = 0 } = options

  const withLoading = async <T>(
    asyncFn: () => Promise<T>,
    setLoading: (loading: boolean) => void
  ): Promise<T> => {
    let showLoadingTimeout: NodeJS.Timeout | null = null
    let hasShownLoading = false

    try {
      // Configurar timeout para mostrar loading si es necesario
      if (showLoadingAfter > 0) {
        showLoadingTimeout = setTimeout(() => {
          setLoading(true)
          hasShownLoading = true
        }, showLoadingAfter)
      } else {
        setLoading(true)
        hasShownLoading = true
      }

      const startTime = Date.now()
      const result = await asyncFn()
      const elapsedTime = Date.now() - startTime

      // Asegurar tiempo mínimo de loading si se configuró
      if (minLoadingTime > 0 && elapsedTime < minLoadingTime && hasShownLoading) {
        const remainingTime = minLoadingTime - elapsedTime
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }

      return result
    } finally {
      // Limpiar timeout si no se activó
      if (showLoadingTimeout) {
        clearTimeout(showLoadingTimeout)
      }
      
      // Solo ocultar loading si se mostró
      if (hasShownLoading) {
        setLoading(false)
      }
    }
  }

  return { withLoading }
}

// Configuraciones CSS para diferentes tipos de skeleton (sin JSX)
export const LoadingStates = {
  // Clases CSS para diferentes tipos de skeleton
  courseCardSkeleton: 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse',
  transactionSkeleton: 'animate-pulse flex items-center justify-between py-3 border-b border-gray-100',
  eventSkeleton: 'animate-pulse p-3 rounded-lg border bg-gray-50 border-gray-200',
  textSkeleton: 'animate-pulse h-4 bg-gray-200 rounded',
  carouselSkeleton: 'relative max-w-7xl mx-auto animate-pulse'
}

// Tipos para utilidades de estado
export interface StateConfig<T> {
  isLoading: boolean
  error: string | null
  data: T | null
}

// Utilidad para determinar qué estado mostrar
export function getStateType<T>(config: StateConfig<T>): 'loading' | 'error' | 'empty' | 'success' {
  if (config.isLoading) return 'loading'
  if (config.error) return 'error'
  if (!config.data) return 'empty'
  return 'success'
}
