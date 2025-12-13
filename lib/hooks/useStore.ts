'use client'

import { useState, useEffect, useCallback } from 'react'
import { StoreOrder, StoreOrderSummary, LoadingState } from '@/lib/types'
import { StoreService } from '@/lib/api/services'
import { LocalStorageCache } from '@/lib/utils/cache'

const STORE_ORDERS_CACHE_KEY = 'store_orders'
const STORE_ORDERS_CACHE_TTL = 3 * 60 * 1000 // 3 minutos

export function useStoreOrders() {
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchOrders = useCallback(async () => {
    // Intentar cargar desde cache primero
    const cachedData = LocalStorageCache.get<StoreOrder[]>(STORE_ORDERS_CACHE_KEY)
    
    if (cachedData) {
      // Mostrar datos cacheados inmediatamente
      setOrders(cachedData)
      setLoadingState({ isLoading: false, error: null })
    } else {
      // Si no hay cache, mantener loading mientras se carga
      setLoadingState({ isLoading: true, error: null })
    }

    // Siempre hacer fetch para actualizar en background
    try {
      const response = await StoreService.getOrders()
      
      if (response.success) {
        setOrders(response.data || [])
        // Guardar en cache
        LocalStorageCache.set(STORE_ORDERS_CACHE_KEY, response.data || [], STORE_ORDERS_CACHE_TTL)
        setLoadingState({ isLoading: false, error: null })
      } else {
        // Si hay error y no hay cache, mostrar error
        if (!cachedData) {
          setLoadingState({ 
            isLoading: false, 
            error: response.error || 'Error al cargar órdenes de tienda' 
          })
        }
      }
    } catch (error) {
      console.error('Error en fetchOrders:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error inesperado al cargar órdenes de tienda'
      
      // Si hay error y no hay cache, mostrar error
      if (!cachedData) {
        setLoadingState({ 
          isLoading: false, 
          error: errorMessage
        })
      }
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchOrders
  }
}

export function useStoreOrderSummary() {
  const [summary, setSummary] = useState<StoreOrderSummary | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchSummary = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await StoreService.getOrderSummary()
      
      if (response.success) {
        setSummary(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar resumen de órdenes' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar resumen de órdenes' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return {
    summary,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchSummary
  }
}

export function useStoreOrdersPaginated(page: number = 1, limit: number = 10) {
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  })
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchOrders = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await StoreService.getOrdersPaginated(page, limit)
      
      if (response.success) {
        setOrders(response.data.orders)
        setPagination({
          total: response.data.total,
          page: response.data.page,
          totalPages: response.data.totalPages
        })
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar órdenes paginadas' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar órdenes paginadas' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [page, limit])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    pagination,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchOrders
  }
}

export function useStoreExport() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null
  })

  const exportOrders = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await StoreService.exportOrders()
      
      if (response.success) {
        // Crear un enlace de descarga
        const url = window.URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        link.download = `ordenes-tienda-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        setLoadingState({ isLoading: false, error: null })
        return true
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al exportar órdenes' 
        })
        return false
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al exportar órdenes' 
      })
      return false
    }
  }, [])

  return {
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    exportOrders
  }
}
