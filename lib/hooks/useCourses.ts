'use client'

import { useState, useEffect, useCallback } from 'react'
import { Course, LoadingState, CourseFilters } from '@/lib/types'
import { CoursesService } from '@/lib/api/services'
import { LocalStorageCache } from '@/lib/utils/cache'
import { PERFORMANCE_CONFIG } from '@/lib/config/performance'

const COURSES_CACHE_KEY = 'courses_all'
const COURSES_CACHE_TTL = PERFORMANCE_CONFIG.CACHE_TTL.COURSES * 1000 // Convertir segundos a milisegundos

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchCourses = useCallback(async (skipCache = false) => {
    // Intentar cargar desde cache primero (a menos que se pida explícitamente saltar el cache)
    const cachedCourses = skipCache ? null : LocalStorageCache.get<Course[]>(COURSES_CACHE_KEY)
    
    if (cachedCourses && cachedCourses.length > 0) {
      // Mostrar datos cacheados inmediatamente
      setCourses(cachedCourses)
      setLoadingState({ isLoading: false, error: null })
      
      // Hacer fetch en background para actualizar (pero no bloquear la UI)
      // El cache tiene TTL de 1 minuto, así que solo actualizar en background si es necesario
      CoursesService.getCourses().then(response => {
        if (response.success && response.data) {
          setCourses(response.data)
          LocalStorageCache.set(COURSES_CACHE_KEY, response.data, COURSES_CACHE_TTL)
        }
      }).catch(() => {
        // Ignorar errores en background refresh, mantener datos del cache
      })
      return
    }
    
    // Si no hay cache, mostrar loading y hacer fetch
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await CoursesService.getCourses()
      
      if (response.success) {
        setCourses(response.data)
        // Guardar en cache
        LocalStorageCache.set(COURSES_CACHE_KEY, response.data, COURSES_CACHE_TTL)
        setLoadingState({ isLoading: false, error: null })
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar cursos' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar cursos' 
      })
      return
    }
  }, [])

  useEffect(() => {
    // Cargar cursos solo una vez al montar
    // Si hay cache, se mostrará inmediatamente y se actualizará en background
    fetchCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar una vez al montar - fetchCourses está memoizado y no cambia

  return {
    courses,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchCourses
  }
}

export function useCoursesFiltered(filters: CourseFilters) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchFilteredCourses = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await CoursesService.getCoursesFiltered({
        searchTerm: filters.searchTerm,
        sedes: filters.selectedSedes,
        days: filters.selectedDays
      })
      
      if (response.success) {
        setCourses(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al filtrar cursos' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al filtrar cursos' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [filters.searchTerm, filters.selectedSedes, filters.selectedDays])

  useEffect(() => {
    fetchFilteredCourses()
  }, [fetchFilteredCourses])

  return {
    courses,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchFilteredCourses
  }
}

export function useCourse(idOrUuid: number | string) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchCourse = useCallback(async () => {
    if (!idOrUuid) return

    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await CoursesService.getCourseById(idOrUuid)
      
      if (response.success) {
        setCourse(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar curso' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar curso' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [idOrUuid])

  useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

  return {
    course,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchCourse
  }
}

export function useCoursesByPeriod(term: string, includePrevious: boolean = false) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchCoursesByPeriod = useCallback(async () => {
    console.log('useCoursesByPeriod - Iniciando carga:', { term, includePrevious })
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await CoursesService.getCoursesByPeriod(term, includePrevious)
      
      console.log('useCoursesByPeriod - Respuesta recibida:', {
        success: response.success,
        dataLength: response.data?.length || 0,
        error: response.error,
        message: response.message
      })
      
      if (response.success) {
        setCourses(response.data)
        console.log('useCoursesByPeriod - Cursos establecidos:', response.data.length)
      } else {
        console.log('useCoursesByPeriod - Error en respuesta:', response.error)
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar cursos del período' 
        })
        return
      }
    } catch (error) {
      console.log('useCoursesByPeriod - Error capturado:', error)
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar cursos del período' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [term, includePrevious])

  useEffect(() => {
    fetchCoursesByPeriod()
  }, [fetchCoursesByPeriod])

  return {
    courses,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchCoursesByPeriod
  }
}

export function useCourseOptions() {
  const [sedes, setSedes] = useState<string[]>([])
  const [days, setDays] = useState<string[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchOptions = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const [sedesResponse, daysResponse] = await Promise.all([
        CoursesService.getAvailableSedes(),
        CoursesService.getAvailableDays()
      ])
      
      if (sedesResponse.success && daysResponse.success) {
        setSedes(sedesResponse.data)
        setDays(daysResponse.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: 'Error al cargar opciones de filtrado' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar opciones' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  return {
    sedes,
    days,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchOptions
  }
}
