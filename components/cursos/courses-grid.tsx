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

export function CoursesGrid() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSedes, setSelectedSedes] = useState<string[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Todos")
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
    // Ordenar períodos: primero los actuales (2025), luego los anteriores
    return uniquePeriods.sort((a, b) => {
      if (a.includes("2025") && !b.includes("2025")) return -1
      if (!a.includes("2025") && b.includes("2025")) return 1
      if (a.includes("2do") && b.includes("1er")) return -1
      if (a.includes("1er") && b.includes("2do")) return 1
      return a.localeCompare(b)
    })
  }, [allCourses])

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
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o código de curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() => setShowSedeDropdown(!showSedeDropdown)}
                className="flex items-center gap-2 pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white min-w-[140px] text-left"
              >
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <span className="flex-1 text-sm">
                  {selectedSedes.length === 0
                    ? "Todas las sedes"
                    : `${selectedSedes.length} sede${selectedSedes.length > 1 ? "s" : ""}`}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {showSedeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {sedes.map((sede) => (
                    <label key={sede} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSedes.includes(sede)}
                        onChange={() => toggleSede(sede)}
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-sm">{sede}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDayDropdown(!showDayDropdown)}
                className="flex items-center gap-2 pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white min-w-[140px] text-left"
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <span className="flex-1 text-sm">
                  {selectedDays.length === 0
                    ? "Todos los días"
                    : `${selectedDays.length} día${selectedDays.length > 1 ? "s" : ""}`}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {showDayDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {days.map((day) => (
                    <label key={day} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(day)}
                        onChange={() => toggleDay(day)}
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Filtro de Período */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors min-w-[180px] justify-between"
                type="button"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {selectedPeriod === "Todos" ? "Todos los períodos" : selectedPeriod}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {showPeriodDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="radio"
                        name="period"
                        checked={selectedPeriod === "Todos"}
                        onChange={() => setSelectedPeriod("Todos")}
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-sm">Todos</span>
                    </label>
                    {periods.map((period) => (
                      <label key={period} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="radio"
                          name="period"
                          checked={selectedPeriod === period}
                          onChange={() => setSelectedPeriod(period)}
                          className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                        />
                        <span className="text-sm">{period}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {(selectedSedes.length > 0 || selectedDays.length > 0 || selectedPeriod !== "Todos") && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedSedes.map((sede) => (
              <span
                key={sede}
                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
              >
                <Building className="h-3 w-3" />
                {sede}
                <button onClick={() => removeSede(sede)} className="ml-1 hover:text-slate-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedDays.map((day) => (
              <span
                key={day}
                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
              >
                <Calendar className="h-3 w-3" />
                {day}
                <button onClick={() => removeDay(day)} className="ml-1 hover:text-slate-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedPeriod !== "Todos" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                <Calendar className="h-3 w-3" />
                {selectedPeriod}
                <button onClick={() => setSelectedPeriod("Todos")} className="ml-1 hover:text-slate-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredAndSortedCourses.length} de {allCourses.length} cursos
        </div>
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
