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
