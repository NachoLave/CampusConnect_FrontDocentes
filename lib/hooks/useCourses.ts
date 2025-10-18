'use client'

import { useState, useEffect, useCallback } from 'react'
import { Course, LoadingState, CourseFilters } from '@/lib/types'
import { CoursesService } from '@/lib/api/services'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchCourses = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await CoursesService.getCourses()
      
      if (response.success) {
        setCourses(response.data)
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

    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

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

export function useCourse(id: number) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchCourse = useCallback(async () => {
    if (!id) return

    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await CoursesService.getCourseById(id)
      
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
  }, [id])

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
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await CoursesService.getCoursesByPeriod(term, includePrevious)
      
      if (response.success) {
        setCourses(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar cursos del período' 
        })
        return
      }
    } catch (error) {
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
