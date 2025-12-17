"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Filter, Building, Calendar, X, ChevronDown, RotateCcw } from "lucide-react"
import { CourseCard } from "./course-card"
import { useCourses } from "@/lib/hooks/useCourses"
import { useCourseFilters } from "@/lib/hooks/useCourseFilters"
import { CoursesGridSkeleton } from "@/components/ui/loaders/course-card-skeleton"
import { filterCoursesByTab } from "@/lib/utils/course-period"

const dayOrder = {
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
  Domingo: 7,
}

const shiftOrder = {
  TM: 1,
  TT: 2,
  TN: 3,
}

type CoursesGridProps = {
  externalSelectedPeriod?: string
  externalSelectedSedes?: string[]
  externalSelectedDays?: string[]
  externalSelectedModalities?: string[]
  onChangeSedes?: (sedes: string[]) => void
  onChangeDays?: (days: string[]) => void
  onChangeModalities?: (modalities: string[]) => void
  onAvailableSedesChange?: (sedes: string[]) => void
  onAvailableDaysChange?: (days: string[]) => void
  onAvailablePeriodsChange?: (periods: string[]) => void
  onAvailableModalitiesChange?: (modalities: string[]) => void
}

export function CoursesGrid({ externalSelectedPeriod, externalSelectedSedes, externalSelectedDays, externalSelectedModalities, onChangeSedes, onChangeDays, onChangeModalities, onAvailableSedesChange, onAvailableDaysChange, onAvailablePeriodsChange, onAvailableModalitiesChange }: CoursesGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSedeDropdown, setShowSedeDropdown] = useState(false)
  const [showDayDropdown, setShowDayDropdown] = useState(false)
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  // Usar directamente los valores externos en lugar de estado interno
  const selectedPeriod = externalSelectedPeriod ?? "Todos"
  const selectedSedes = externalSelectedSedes ?? []
  const selectedDays = externalSelectedDays ?? []
  const selectedModalities = externalSelectedModalities ?? []

  // Obtener todos los cursos del docente desde la API externa
  const { courses: allCourses, isLoading, error, refetch } = useCourses()
  
  // Obtener filtros dinámicos basados en los cursos del docente
  const { sedes: availableSedes, days: availableDays } = useCourseFilters(selectedPeriod)
  
  // Mostrar error solo si hay error y no hay cursos
  const shouldShowError = error && allCourses.length === 0
  
  // Usar sedes y días dinámicos del backend
  const sedes = availableSedes
  const days = availableDays

  // Obtener modalidades disponibles desde los cursos
  const availableModalities = useMemo(() => {
    const modalities = new Set<string>()
    allCourses.forEach((course) => {
      if (course.modality) {
        modalities.add(course.modality.toUpperCase())
      } else if (course.isVirtual) {
        modalities.add('VIRTUAL')
      } else {
        modalities.add('PRESENCIAL')
      }
    })
    return Array.from(modalities).sort()
  }, [allCourses])

  // Pasar datos dinámicos al componente padre
  useEffect(() => {
    if (onAvailableSedesChange) {
      onAvailableSedesChange(availableSedes)
    }
    if (onAvailableDaysChange) {
      onAvailableDaysChange(availableDays)
    }
    if (onAvailableModalitiesChange) {
      onAvailableModalitiesChange(availableModalities)
    }
  }, [availableSedes, availableDays, availableModalities, onAvailableSedesChange, onAvailableDaysChange, onAvailableModalitiesChange])

  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(allCourses.map((course) => course.period))]
    const currentYear = new Date().getFullYear().toString()
    // Ordenar: primero año actual (2do, luego 1er, luego Verano), luego años anteriores descendente
    return uniquePeriods.sort((a, b) => {
      const aYear = (a.match(/\d{4}/)?.[0] ?? "0")
      const bYear = (b.match(/\d{4}/)?.[0] ?? "0")
      const aIsCurrent = a.includes(currentYear)
      const bIsCurrent = b.includes(currentYear)
      if (aIsCurrent && !bIsCurrent) return -1
      if (!aIsCurrent && bIsCurrent) return 1
      if (aYear !== bYear) return Number(bYear) - Number(aYear)
      // Ordenar dentro del mismo año: 2do, 1er, Verano
      if (a.includes("2do") && !b.includes("2do")) return -1
      if (!a.includes("2do") && b.includes("2do")) return 1
      if (a.includes("1er") && b.includes("Verano")) return -1
      if (a.includes("Verano") && b.includes("1er")) return 1
      return a.localeCompare(b)
    })
  }, [allCourses])

  // Pasar períodos disponibles al componente padre
  useEffect(() => {
    if (onAvailablePeriodsChange) {
      onAvailablePeriodsChange(periods)
    }
  }, [periods, onAvailablePeriodsChange])

  // Cursos del período actual (para el contador)
  const coursesInPeriod = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return filterCoursesByTab(allCourses, selectedPeriod, currentYear)
  }, [allCourses, selectedPeriod])

  const filteredAndSortedCourses = useMemo(() => {
    const currentYear = new Date().getFullYear()
    
    // Primero filtrar por período usando la nueva lógica
    const coursesByPeriod = filterCoursesByTab(allCourses, selectedPeriod, currentYear)
    
    // Luego aplicar los demás filtros
    const filtered = coursesByPeriod.filter((course) => {
      const matchesSearch =
        searchTerm === "" ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.includes(searchTerm)

      const matchesSede = selectedSedes.length === 0 || selectedSedes.includes(course.sede)
      
      // Normalizar días para comparación (convertir a mayúsculas)
      const courseDayNormalized = course.day.toUpperCase()
      const selectedDaysNormalized = selectedDays.map(day => day.toUpperCase())
      const matchesDay = selectedDays.length === 0 || selectedDaysNormalized.includes(courseDayNormalized)

      // Filtro de modalidad
      const courseModality = course.modality?.toUpperCase() || (course.isVirtual ? 'VIRTUAL' : 'PRESENCIAL')
      const matchesModality = selectedModalities.length === 0 || selectedModalities.some(mod => mod.toUpperCase() === courseModality)

      const matches = matchesSearch && matchesSede && matchesDay && matchesModality

      return matches
    })

    // Sort by day and then by shift
    return filtered.sort((a, b) => {
      const dayComparison = dayOrder[a.day as keyof typeof dayOrder] - dayOrder[b.day as keyof typeof dayOrder]
      if (dayComparison !== 0) return dayComparison
      return shiftOrder[a.shift as keyof typeof shiftOrder] - shiftOrder[b.shift as keyof typeof shiftOrder]
    })
  }, [allCourses, searchTerm, selectedSedes, selectedDays, selectedPeriod, selectedModalities])

  const resetFilters = () => {
    setSearchTerm("")
    setShowSedeDropdown(false)
    setShowDayDropdown(false)
    setShowPeriodDropdown(false)
    // Los filtros externos se resetean desde la página padre
    if (onChangeSedes) onChangeSedes([])
    if (onChangeDays) onChangeDays([])
    if (onChangeModalities) onChangeModalities([])
  }

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.relative')) {
        setShowSedeDropdown(false)
        setShowDayDropdown(false)
        setShowPeriodDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasActiveFilters = selectedSedes.length > 0 || selectedDays.length > 0
  
  const removeSede = (sede: string) => {
    if (onChangeSedes) {
      onChangeSedes(selectedSedes.filter((s) => s !== sede))
    }
  }

  const removeDay = (day: string) => {
    if (onChangeDays) {
      onChangeDays(selectedDays.filter((d) => d !== day))
    }
  }

  const clearAllFilters = () => {
    if (onChangeSedes) onChangeSedes([])
    if (onChangeDays) onChangeDays([])
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Results count and clear filters */}
      <div className="flex items-center justify-between gap-3">
        {isLoading ? (
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <div className="text-xs lg:text-sm text-gray-600">
            Mostrando {filteredAndSortedCourses.length} de {coursesInPeriod.length} cursos
          </div>
        )}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RotateCcw className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedSedes.map((sede) => (
            <button
              key={sede}
              onClick={() => removeSede(sede)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-xs lg:text-sm font-medium transition-colors group"
            >
              <Building className="h-3 w-3 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
              <span>{sede}</span>
              <X className="h-3 w-3 lg:h-3.5 lg:w-3.5 flex-shrink-0 group-hover:text-blue-900" />
            </button>
          ))}
          {selectedDays.map((day) => (
            <button
              key={day}
              onClick={() => removeDay(day)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-full text-xs lg:text-sm font-medium transition-colors group"
            >
              <Calendar className="h-3 w-3 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
              <span>{day}</span>
              <X className="h-3 w-3 lg:h-3.5 lg:w-3.5 flex-shrink-0 group-hover:text-green-900" />
            </button>
          ))}
        </div>
      )}


      {/* Loading State */}
      {isLoading && (
        <CoursesGridSkeleton count={6} />
      )}

      {/* Error State */}
      {shouldShowError && !isLoading && (
        <div className="text-center py-8 lg:py-12">
          <div className="text-red-400 mb-2">
            <Filter className="h-10 w-10 lg:h-12 lg:w-12 mx-auto" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-1">Error al cargar cursos</h3>
          <p className="text-sm lg:text-base text-gray-500">{error}</p>
          <p className="text-xs text-gray-400 mt-2">No se pudieron cargar los datos del servidor</p>
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {filteredAndSortedCourses.map((course) => (
            <CourseCard key={course.uuid || course.id} course={course} />
          ))}
        </div>
      )}

      {/* No Courses Found */}
      {!isLoading && filteredAndSortedCourses.length === 0 && (
        <div className="text-center py-8 lg:py-12">
          <div className="text-gray-400 mb-2">
            <Filter className="h-10 w-10 lg:h-12 lg:w-12 mx-auto" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-1">No se encontraron cursos</h3>
          <p className="text-sm lg:text-base text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  )
}
