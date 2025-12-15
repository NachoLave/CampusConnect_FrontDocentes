'use client'
import { useState, useEffect, useCallback } from 'react'
import { CalendarService, CalendarEvent, NextClass, CalendarEventsResponse } from '@/lib/api/services/calendar'
import { LoadingState } from '@/lib/types'
import { LocalStorageCache } from '@/lib/utils/cache'

const CALENDAR_CACHE_KEY = 'calendar_events'
const CALENDAR_CACHE_TTL = 3 * 60 * 1000 // 3 minutos

export function useWeeklyCalendar(startDate: string, endDate: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })
  const [eventTypeErrors, setEventTypeErrors] = useState<{ classes?: string; canteen?: string; events?: string }>({})

  const fetchEvents = useCallback(async () => {
    // Intentar cargar desde cache primero
    const cacheKey = `${CALENDAR_CACHE_KEY}_${startDate}_${endDate}`
    const cachedData = LocalStorageCache.get<{ events: CalendarEvent[]; errors?: { classes?: string; canteen?: string; events?: string } }>(cacheKey)
    
    if (cachedData) {
      // Mostrar datos cacheados inmediatamente
      setEvents(cachedData.events)
      if (cachedData.errors) {
        setEventTypeErrors(cachedData.errors)
      }
      setLoadingState({ isLoading: false, error: null })
    } else {
      // Si no hay cache, mantener loading mientras se carga
      setLoadingState({ isLoading: true, error: null })
    }

    // Siempre hacer fetch para actualizar en background
    try {
      const response = await CalendarService.getWeeklyEvents(startDate, endDate) as CalendarEventsResponse

      if (response.success && response.data) {
        setEvents(response.data)
        
        // Guardar en cache
        LocalStorageCache.set(cacheKey, {
          events: response.data,
          errors: response.errors
        }, CALENDAR_CACHE_TTL)
        
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
          // Guardar datos parciales en cache también
          LocalStorageCache.set(cacheKey, {
            events: response.data,
            errors: response.errors
          }, CALENDAR_CACHE_TTL)
        }
        setLoadingState({
          isLoading: false,
          error: response.error || 'Error al cargar eventos del calendario'
        })
        return
      }
    } catch (error) {
      // Si hay error y no hay cache, mostrar error
      if (!cachedData) {
        setLoadingState({
          isLoading: false,
          error: 'Error inesperado al cargar eventos del calendario'
        })
      }
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

const NEXT_CLASS_CACHE_KEY = 'next_class'
const NEXT_CLASS_CACHE_TTL = 1 * 60 * 1000 // 1 minuto

export function useNextClass() {
  const [nextClass, setNextClass] = useState<NextClass | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchNextClass = useCallback(async () => {
    // Intentar cargar desde cache primero
    const cachedData = LocalStorageCache.get<NextClass | null>(NEXT_CLASS_CACHE_KEY)
    
    if (cachedData !== null) {
      // Mostrar datos cacheados inmediatamente
      setNextClass(cachedData)
      setLoadingState({ isLoading: false, error: null })
    } else {
      // Si no hay cache, mantener loading mientras se carga
      setLoadingState({ isLoading: true, error: null })
    }

    // Siempre hacer fetch para actualizar en background
    try {
      const response = await CalendarService.getNextClass()

      if (response.success) {
        setNextClass(response.data)
        // Guardar en cache
        LocalStorageCache.set(NEXT_CLASS_CACHE_KEY, response.data, NEXT_CLASS_CACHE_TTL)
      } else {
        // Si hay error y no hay cache, mostrar error
        if (cachedData === null) {
          setLoadingState({
            isLoading: false,
            error: response.error || 'Error al cargar próxima clase'
          })
        }
        return
      }
    } catch (error) {
      // Si hay error y no hay cache, mostrar error
      if (cachedData === null) {
        setLoadingState({
          isLoading: false,
          error: 'Error inesperado al cargar próxima clase'
        })
      }
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