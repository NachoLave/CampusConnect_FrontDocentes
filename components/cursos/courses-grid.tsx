"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Filter, Building, Calendar, X, ChevronDown } from "lucide-react"
import { CourseCard } from "./course-card"
// Importamos los datos directamente por ahora
import coursesData from "@/lib/data/courses.json"

const dayOrder = {
  LUNES: 1,
  MARTES: 2,
  MIÉRCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SÁBADO: 6,
  DOMINGO: 7,
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
}

export function CoursesGrid({ externalSelectedPeriod, externalSelectedSedes, externalSelectedDays }: CoursesGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSedes, setSelectedSedes] = useState<string[]>(externalSelectedSedes ?? [])
  const [selectedDays, setSelectedDays] = useState<string[]>(externalSelectedDays ?? [])
  const [selectedPeriod, setSelectedPeriod] = useState<string>(externalSelectedPeriod ?? "Todos")
  const [showSedeDropdown, setShowSedeDropdown] = useState(false)
  const [showDayDropdown, setShowDayDropdown] = useState(false)
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  // Usar los datos importados directamente
  const allCourses = coursesData
  
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

  // Sincronizar cuando viene el período seleccionado desde afuera
  useEffect(() => {
    if (externalSelectedPeriod !== undefined) {
      setSelectedPeriod(externalSelectedPeriod)
    }
  }, [externalSelectedPeriod])

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
    setSelectedSedes([])
    setSelectedDays([])
    setSelectedPeriod("Todos")
    setShowSedeDropdown(false)
    setShowDayDropdown(false)
    setShowPeriodDropdown(false)
  }

  const toggleSede = (sede: string) => {
    setSelectedSedes((prev) => (prev.includes(sede) ? prev.filter((s) => s !== sede) : [...prev, sede]))
  }

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const removeSede = (sede: string) => {
    setSelectedSedes((prev) => prev.filter((s) => s !== sede))
  }

  const removeDay = (day: string) => {
    setSelectedDays((prev) => prev.filter((d) => d !== day))
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

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredAndSortedCourses.length} de {allCourses.length} cursos
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAndSortedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filteredAndSortedCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron cursos</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  )
}
