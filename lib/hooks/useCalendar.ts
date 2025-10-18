'use client'
import { useState, useEffect, useCallback } from 'react'
import { CalendarService, CalendarEvent, NextClass } from '@/lib/api/services/calendar'
import { LoadingState } from '@/lib/types'

export function useWeeklyCalendar(startDate: string, endDate: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchEvents = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })

    try {
      const response = await CalendarService.getWeeklyEvents(startDate, endDate)

      if (response.success && response.data) {
        setEvents(response.data)
      } else {
        setLoadingState({
          isLoading: false,
          error: response.error || 'Error al cargar eventos del calendario'
        })
        return
      }
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: 'Error inesperado al cargar eventos del calendario'
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [startDate, endDate])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    events,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchEvents
  }
}

export function useNextClass() {
  const [nextClass, setNextClass] = useState<NextClass | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchNextClass = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })

    try {
      const response = await CalendarService.getNextClass()

      if (response.success) {
        setNextClass(response.data)
      } else {
        setLoadingState({
          isLoading: false,
          error: response.error || 'Error al cargar próxima clase'
        })
        return
      }
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: 'Error inesperado al cargar próxima clase'
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => {
    fetchNextClass()
  }, [fetchNextClass])

  return {
    nextClass,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchNextClass
  }
}