'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarData, Event, LoadingState } from '@/lib/types'
import { CalendarService } from '@/lib/api/services'

export function useCalendar() {
  const [calendarData, setCalendarData] = useState<CalendarData>({})
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchCalendarData = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await CalendarService.getCalendarEvents()
      
      if (response.success) {
        setCalendarData(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar calendario' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar calendario' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  return {
    calendarData,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchCalendarData
  }
}

export function useEventsByDate(date: number) {
  const [events, setEvents] = useState<Event[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchEvents = useCallback(async () => {
    if (!date) return

    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await CalendarService.getEventsByDate(date)
      
      if (response.success) {
        setEvents(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar eventos' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar eventos' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [date])

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

export function useEventsByDateRange(startDate: number, endDate: number) {
  const [eventsData, setEventsData] = useState<CalendarData>({})
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchEventsRange = useCallback(async () => {
    if (!startDate || !endDate) return

    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await CalendarService.getEventsByDateRange(startDate, endDate)
      
      if (response.success) {
        setEventsData(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar eventos del rango' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar eventos del rango' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [startDate, endDate])

  useEffect(() => {
    fetchEventsRange()
  }, [fetchEventsRange])

  return {
    eventsData,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchEventsRange
  }
}

export function useNextClass() {
  const [nextClass, setNextClass] = useState<(Event & { date: number }) | null>(null)
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

export function useCalendarActions() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null
  })

  const addEvent = useCallback(async (date: number, event: Omit<Event, 'id'>) => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await CalendarService.addEvent(date, event)
      
      if (response.success) {
        setLoadingState({ isLoading: false, error: null })
        return response.data
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al agregar evento' 
        })
        return null
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al agregar evento' 
      })
      return null
    }
  }, [])

  return {
    addEvent,
    isLoading: loadingState.isLoading,
    error: loadingState.error
  }
}
