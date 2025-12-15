'use client'

import { useState, useEffect, useCallback } from 'react'
import { CarouselImage, LoadingState } from '@/lib/types'
import { DashboardService } from '@/lib/api/services'

export function useCarousel() {
  const [images, setImages] = useState<CarouselImage[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchCarouselImages = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await DashboardService.getCarouselImages()
      
      if (response.success) {
        setImages(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar imágenes del carrusel' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar carrusel' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => {
    fetchCarouselImages()
  }, [fetchCarouselImages])

  return {
    images,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchCarouselImages
  }
}

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState<{
    carouselImages: CarouselImage[]
    nextClass: any
    balance: number
    todayReservation: any
    announcements: any[]
  } | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchDashboardData = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await DashboardService.getDashboardData()
      
      if (response.success) {
        setDashboardData(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar datos del dashboard' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar dashboard' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    dashboardData,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchDashboardData
  }
}

// Hook optimizado para cargar todos los datos del Dashboard en paralelo
import { WalletService } from '@/lib/api/services/wallet'
import { CalendarService, NextClass, CalendarEvent } from '@/lib/api/services/calendar'
import { CanteenService, CanteenReservation } from '@/lib/api/services/canteen'
import { LocalStorageCache } from '@/lib/utils/cache'

const DASHBOARD_CACHE_KEY = 'dashboard_all_data'
const DASHBOARD_CACHE_TTL = 3 * 60 * 1000 // 3 minutos

export function useDashboardDataParallel() {
  const [data, setData] = useState<{
    balance: number
    nextClass: NextClass | null
    reservations: CanteenReservation[]
    events: CalendarEvent[]
  } | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })
  const [errors, setErrors] = useState<{
    balance?: string
    nextClass?: string
    reservations?: string
    events?: string
  }>({})

  const fetchAllData = useCallback(async () => {
    // 1. Intentar cargar desde cache primero
    const cachedData = LocalStorageCache.get<typeof data>(DASHBOARD_CACHE_KEY)
    
    if (cachedData) {
      // Mostrar datos cacheados inmediatamente
      setData(cachedData)
      setLoadingState({ isLoading: false, error: null })
    } else {
      // Si no hay cache, mantener loading mientras se carga
      setLoadingState({ isLoading: true, error: null })
    }

    // 2. OPTIMIZACIÓN: Ejecutar TODAS las llamadas en paralelo
    const currentYear = new Date().getFullYear()
    const startDate = new Date(currentYear, 0, 1).toISOString().split('T')[0]
    const endDate = new Date(currentYear, 11, 31).toISOString().split('T')[0]

    const [balanceResult, nextClassResult, reservationsResult, eventsResult] = await Promise.allSettled([
      WalletService.getBalance(),
      CalendarService.getNextClass(),
      CanteenService.getReservations(),
      CalendarService.getWeeklyEvents(startDate, endDate)
    ])

    // Procesar resultados
    const newData: typeof data = {
      balance: 0,
      nextClass: null,
      reservations: [],
      events: []
    }
    const newErrors: typeof errors = {}

    if (balanceResult.status === 'fulfilled' && balanceResult.value.success) {
      newData.balance = balanceResult.value.data
    } else {
      newErrors.balance = balanceResult.status === 'fulfilled' 
        ? balanceResult.value.error || 'Error al cargar saldo'
        : 'Error inesperado al cargar saldo'
    }

    if (nextClassResult.status === 'fulfilled' && nextClassResult.value.success) {
      newData.nextClass = nextClassResult.value.data
    } else {
      newErrors.nextClass = nextClassResult.status === 'fulfilled'
        ? nextClassResult.value.error || 'Error al cargar próxima clase'
        : 'Error inesperado al cargar próxima clase'
    }

    if (reservationsResult.status === 'fulfilled' && reservationsResult.value.success) {
      newData.reservations = reservationsResult.value.data
    } else {
      newErrors.reservations = reservationsResult.status === 'fulfilled'
        ? reservationsResult.value.error || 'Error al cargar reservas'
        : 'Error inesperado al cargar reservas'
    }

    if (eventsResult.status === 'fulfilled' && eventsResult.value.success) {
      newData.events = eventsResult.value.data || []
    } else {
      newErrors.events = eventsResult.status === 'fulfilled'
        ? eventsResult.value.message || 'Error al cargar eventos'
        : 'Error inesperado al cargar eventos'
    }

    // Actualizar estado
    setData(newData)
    setErrors(newErrors)
    
    // Guardar en cache
    LocalStorageCache.set(DASHBOARD_CACHE_KEY, newData, DASHBOARD_CACHE_TTL)
    
    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return {
    data,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    errors,
    refetch: fetchAllData
  }
}

export function useQuickStats() {
  const [stats, setStats] = useState<{
    totalCourses: number
    todayClasses: number
    thisWeekClasses: number
    balance: number
  } | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchStats = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await DashboardService.getQuickStats()
      
      if (response.success) {
        setStats(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar estadísticas' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar estadísticas' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchStats
  }
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchAnnouncements = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await DashboardService.getAnnouncements()
      
      if (response.success) {
        setAnnouncements(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar anuncios' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar anuncios' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  return {
    announcements,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchAnnouncements
  }
}
