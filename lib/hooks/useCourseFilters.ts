'use client'
import { useState, useEffect, useCallback } from 'react'
import { CoursesService } from '@/lib/api/services/courses'
import { LoadingState } from '@/lib/types'

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

  const fetchSedes = useCallback(async () => {
    setSedesLoading({ isLoading: true, error: null })

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

    setSedesLoading({ isLoading: false, error: null })
  }, [selectedPeriod])

  const fetchDays = useCallback(async () => {
    setDaysLoading({ isLoading: true, error: null })

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

    setDaysLoading({ isLoading: false, error: null })
  }, [selectedPeriod])

  useEffect(() => {
    fetchSedes()
    fetchDays()
  }, [fetchSedes, fetchDays])

  return {
    sedes,
    days,
    sedesLoading,
    daysLoading,
    refetchSedes: fetchSedes,
    refetchDays: fetchDays
  }
}
