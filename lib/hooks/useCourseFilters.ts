'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { CoursesService } from '@/lib/api/services/courses'
import { LoadingState } from '@/lib/types'
import { LocalStorageCache } from '@/lib/utils/cache'

const FILTERS_CACHE_KEY = 'course_filters'
const FILTERS_CACHE_TTL = 1 * 60 * 1000 // 1 minuto

export function useCourseFilters(selectedPeriod?: string) {
  const [sedes, setSedes] = useState<string[]>([])
  const [days, setDays] = useState<string[]>([])
  const [sedesLoading, setSedesLoading] = useState<LoadingState>({
    isLoading: true,
    error: null
  })
  const [daysLoading, setDaysLoading] = useState<LoadingState>({
    isLoading: true,
    error: null
  })
  const hasLoadedRef = useRef(false)

  const fetchSedes = useCallback(async () => {
    // Intentar cargar desde cache primero
    const cachedFilters = LocalStorageCache.get<{ sedes: string[], days: string[] }>(FILTERS_CACHE_KEY)
    
    if (cachedFilters && cachedFilters.sedes && cachedFilters.sedes.length > 0) {
      // Mostrar datos cacheados inmediatamente
      setSedes(cachedFilters.sedes)
      setSedesLoading({ isLoading: false, error: null })
    } else {
      setSedesLoading({ isLoading: true, error: null })
    }

    try {
      // Siempre obtener TODOS los cursos del usuario para extraer sedes únicas
      // Sin importar el período seleccionado, mostrar todas las sedes donde tiene cursos
      const term = "2025Q2" // Usar Q2 como base
      const includePrevious = true // Siempre incluir períodos anteriores
      const coursesResponse = await CoursesService.getCoursesByPeriod(term, includePrevious)
      
      if (coursesResponse.success && coursesResponse.data) {
        // Extraer sedes únicas de los cursos del usuario
        const uniqueSedes = [...new Set(coursesResponse.data.map(course => course.sede).filter(Boolean))].sort()
        console.log('Sedes únicas del usuario (todos los períodos):', uniqueSedes)
        setSedes(uniqueSedes)
        setSedesLoading({ isLoading: false, error: null })
        
        // Guardar en cache junto con días
        const cachedDays = LocalStorageCache.get<{ sedes: string[], days: string[] }>(FILTERS_CACHE_KEY)?.days || []
        LocalStorageCache.set(FILTERS_CACHE_KEY, { sedes: uniqueSedes, days: cachedDays }, FILTERS_CACHE_TTL)
      } else {
        setSedesLoading({
          isLoading: false,
          error: coursesResponse.error || 'Error al cargar cursos para obtener sedes'
        })
        return
      }
    } catch (error) {
      setSedesLoading({
        isLoading: false,
        error: 'Error inesperado al cargar sedes'
      })
      return
    }
  }, [])

  const fetchDays = useCallback(async () => {
    // Intentar cargar desde cache primero
    const cachedFilters = LocalStorageCache.get<{ sedes: string[], days: string[] }>(FILTERS_CACHE_KEY)
    
    if (cachedFilters && cachedFilters.days && cachedFilters.days.length > 0) {
      // Mostrar datos cacheados inmediatamente
      setDays(cachedFilters.days)
      setDaysLoading({ isLoading: false, error: null })
    } else {
      setDaysLoading({ isLoading: true, error: null })
    }

    try {
      // Siempre obtener TODOS los cursos del usuario para extraer días únicos
      // Sin importar el período seleccionado, mostrar todos los días donde tiene cursos
      const term = "2025Q2" // Usar Q2 como base
      const includePrevious = true // Siempre incluir períodos anteriores
      const coursesResponse = await CoursesService.getCoursesByPeriod(term, includePrevious)
      
      if (coursesResponse.success && coursesResponse.data) {
        // Extraer días únicos de los cursos del usuario
        const dayOrder: Record<string, number> = {
          'LUNES': 1, 'Lunes': 1,
          'MARTES': 2, 'Martes': 2,
          'MIÉRCOLES': 3, 'MIERCOLES': 3, 'Miércoles': 3,
          'JUEVES': 4, 'Jueves': 4,
          'VIERNES': 5, 'Viernes': 5,
          'SÁBADO': 6, 'SABADO': 6, 'Sábado': 6,
          'DOMINGO': 7, 'Domingo': 7
        }
        const uniqueDays = [...new Set(coursesResponse.data.map(course => course.day).filter(Boolean))]
          .sort((a, b) => (dayOrder[a] || 0) - (dayOrder[b] || 0))
        
        console.log('Días únicos del usuario ordenados:', uniqueDays)
        setDays(uniqueDays)
        setDaysLoading({ isLoading: false, error: null })
        
        // Guardar en cache junto con sedes
        const cachedSedes = LocalStorageCache.get<{ sedes: string[], days: string[] }>(FILTERS_CACHE_KEY)?.sedes || []
        LocalStorageCache.set(FILTERS_CACHE_KEY, { sedes: cachedSedes, days: uniqueDays }, FILTERS_CACHE_TTL)
      } else {
        setDaysLoading({
          isLoading: false,
          error: coursesResponse.error || 'Error al cargar cursos para obtener días'
        })
        return
      }
    } catch (error) {
      setDaysLoading({
        isLoading: false,
        error: 'Error inesperado al cargar días'
      })
      return
    }
  }, [])

  useEffect(() => {
    // Solo cargar una vez, no cada vez que cambia el período
    if (!hasLoadedRef.current) {
      fetchSedes()
      fetchDays()
      hasLoadedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar una vez al montar

  return {
    sedes,
    days,
    sedesLoading,
    daysLoading,
    refetchSedes: fetchSedes,
    refetchDays: fetchDays
  }
}
