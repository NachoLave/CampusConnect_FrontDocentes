'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CanteenReservation, LoadingState } from '@/lib/types'
import { CanteenService } from '@/lib/api/services'
import { LocalStorageCache } from '@/lib/utils/cache'

const CANTEEN_CACHE_KEY = 'canteen_reservations'
const CANTEEN_CACHE_TTL = 2 * 60 * 1000 // 2 minutos

export function useCanteenReservations() {
  const [reservations, setReservations] = useState<CanteenReservation[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: true, error: null })

  const fetchReservations = useCallback(async () => {
    // Intentar cargar desde cache primero
    const cachedData = LocalStorageCache.get<CanteenReservation[]>(CANTEEN_CACHE_KEY)
    
    if (cachedData) {
      // Mostrar datos cacheados inmediatamente
      setReservations(cachedData)
      setLoadingState({ isLoading: false, error: null })
    } else {
      // Si no hay cache, mantener loading mientras se carga
      setLoadingState({ isLoading: true, error: null })
    }

    // Siempre hacer fetch para actualizar en background
    try {
      const response = await CanteenService.getReservations()
      if (response.success) {
        setReservations(response.data)
        // Guardar en cache
        LocalStorageCache.set(CANTEEN_CACHE_KEY, response.data, CANTEEN_CACHE_TTL)
      } else {
        // Si hay error y no hay cache, mostrar error
        if (!cachedData) {
          setLoadingState({ isLoading: false, error: response.error || 'Error al cargar reservas de comedor' })
        }
        return
      }
    } catch (err) {
      // Si hay error y no hay cache, mostrar error
      if (!cachedData) {
        setLoadingState({ isLoading: false, error: 'Error inesperado al cargar reservas de comedor' })
      }
      return
    }
    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => { fetchReservations() }, [fetchReservations])

  return {
    reservations,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchReservations
  }
}





