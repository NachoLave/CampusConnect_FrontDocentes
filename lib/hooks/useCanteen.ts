'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CanteenReservation, LoadingState } from '@/lib/types'
import { CanteenService } from '@/lib/api/services'

export function useCanteenReservations() {
  const [reservations, setReservations] = useState<CanteenReservation[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: true, error: null })

  const fetchReservations = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    try {
      const response = await CanteenService.getReservations()
      if (response.success) {
        setReservations(response.data)
      } else {
        setLoadingState({ isLoading: false, error: response.error || 'Error al cargar reservas de comedor' })
        return
      }
    } catch (err) {
      setLoadingState({ isLoading: false, error: 'Error inesperado al cargar reservas de comedor' })
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





