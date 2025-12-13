'use client'
import { useState, useEffect, useCallback } from 'react'
import { CalendarService, CalendarEvent, NextClass, CalendarEventsResponse } from '@/lib/api/services/calendar'
import { LoadingState } from '@/lib/types'

export function useWeeklyCalendar(startDate: string, endDate: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })
  const [eventTypeErrors, setEventTypeErrors] = useState<{ classes?: string; canteen?: string; events?: string }>({})

  const fetchEvents = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })

    try {
      const response = await CalendarService.getWeeklyEvents(startDate, endDate) as CalendarEventsResponse

      if (response.success && response.data) {
        setEvents(response.data)
        // Guardar errores por tipo si existen
        if (response.errors) {
          setEventTypeErrors(response.errors)
          // Auto-ocultar errores después de 10 segundos
          setTimeout(() => {
            setEventTypeErrors({})
          }, 10000)
        } else {
          setEventTypeErrors({})
        }
      } else {
        // Aún así, si hay datos parciales, mostrarlos
        if (response.data && response.data.length > 0) {
          setEvents(response.data)
        }
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
    eventTypeErrors,
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