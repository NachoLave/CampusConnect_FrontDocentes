"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Filter, Building, Calendar, X, ChevronDown, RotateCcw } from "lucide-react"
import { CourseCard } from "./course-card"
// Importamos los datos directamente por ahora
import coursesData from "@/lib/data/courses.json"

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
  onChangeSedes?: (sedes: string[]) => void
  onChangeDays?: (days: string[]) => void
}

export function CoursesGrid({ externalSelectedPeriod, externalSelectedSedes, externalSelectedDays, onChangeSedes, onChangeDays }: CoursesGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSedeDropdown, setShowSedeDropdown] = useState(false)
  const [showDayDropdown, setShowDayDropdown] = useState(false)
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  // Usar los datos importados directamente
  const allCourses = coursesData
  
  // Usar directamente los valores externos en lugar de estado interno
  const selectedPeriod = externalSelectedPeriod ?? "Todos"
  const selectedSedes = externalSelectedSedes ?? []
  const selectedDays = externalSelectedDays ?? []
  
  const sedes = useMemo(() => {
    const uniqueSedes = [...new Set(allCourses.map((course) => course.sede))]
    return uniqueSedes.sort()
  }, [allCourses])

  const days = useMemo(() => {
    const uniqueDays = [...new Set(allCourses.map((course) => course.day))]
    return uniqueDays.sort((a, b) => dayOrder[a as keyof typeof dayOrder] - dayOrder[b as keyof typeof dayOrder])
  }, [allCourses])

  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(allCourses.map((course) => course.period))]
    const currentYear = new Date().getFullYear().toString()
    // Ordenar: primero año actual (2do, luego 1er), luego años anteriores descendente
    return uniquePeriods.sort((a, b) => {
      const aYear = (a.match(/\d{4}/)?.[0] ?? "0")
      const bYear = (b.match(/\d{4}/)?.[0] ?? "0")
      const aIsCurrent = a.includes(currentYear)
      const bIsCurrent = b.includes(currentYear)
      if (aIsCurrent && !bIsCurrent) return -1
      if (!aIsCurrent && bIsCurrent) return 1
      if (aYear !== bYear) return Number(bYear) - Number(aYear)
      if (a.includes("2do") && b.includes("1er")) return -1
      if (a.includes("1er") && b.includes("2do")) return 1
      return a.localeCompare(b)
    })
  }, [allCourses])

  // Cursos del período actual (para el contador)
  const coursesInPeriod = useMemo(() => {
    return allCourses.filter((course) => {
      const matchesPeriod = selectedPeriod === "Todos" || course.period === selectedPeriod
      return matchesPeriod
    })
  }, [allCourses, selectedPeriod])

  const filteredAndSortedCourses = useMemo(() => {
    const filtered = allCourses.filter((course) => {
      const matchesSearch =
        searchTerm === "" ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.includes(searchTerm)

      const matchesSede = selectedSedes.length === 0 || selectedSedes.includes(course.sede)
      const matchesDay = selectedDays.length === 0 || selectedDays.includes(course.day)
      const matchesPeriod = selectedPeriod === "Todos" || course.period === selectedPeriod

      return matchesSearch && matchesSede && matchesDay && matchesPeriod
    })

    // Sort by day and then by shift
    return filtered.sort((a, b) => {
      const dayComparison = dayOrder[a.day as keyof typeof dayOrder] - dayOrder[b.day as keyof typeof dayOrder]
      if (dayComparison !== 0) return dayComparison
      return shiftOrder[a.shift as keyof typeof shiftOrder] - shiftOrder[b.shift as keyof typeof shiftOrder]
    })
  }, [allCourses, searchTerm, selectedSedes, selectedDays, selectedPeriod])

  const resetFilters = () => {
    setSearchTerm("")
    setShowSedeDropdown(false)
    setShowDayDropdown(false)
    setShowPeriodDropdown(false)
    // Los filtros externos se resetean desde la página padre
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
        <div className="text-xs lg:text-sm text-gray-600">
          Mostrando {filteredAndSortedCourses.length} de {coursesInPeriod.length} cursos
        </div>
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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {filteredAndSortedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filteredAndSortedCourses.length === 0 && (
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
