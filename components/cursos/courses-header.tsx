"use client"

import { useState, useEffect } from "react"
import { Building, Calendar, ChevronDown } from "lucide-react"
type CoursesHeaderProps = {
  selectedPeriod: string
  onSelectPeriod: (period: string) => void
  selectedSedes: string[]
  onChangeSedes: (sedes: string[]) => void
  selectedDays: string[]
  onChangeDays: (days: string[]) => void
  availableSedes: string[]
  availableDays: string[]
}

export function CoursesHeader({ selectedPeriod, onSelectPeriod, selectedSedes, onChangeSedes, selectedDays, onChangeDays, availableSedes, availableDays }: CoursesHeaderProps) {
  const [showSedesDropdown, setShowSedesDropdown] = useState(false)
  const [showDaysDropdown, setShowDaysDropdown] = useState(false)
  

  const toggleSede = (sede: string) => {
    if (selectedSedes.includes(sede)) {
      onChangeSedes(selectedSedes.filter((s) => s !== sede))
    } else {
      onChangeSedes([...selectedSedes, sede])
    }
  }

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onChangeDays(selectedDays.filter((d) => d !== day))
    } else {
      onChangeDays([...selectedDays, day])
    }
  }

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.relative')) {
        setShowSedesDropdown(false)
        setShowDaysDropdown(false)
      }
    }

    if (showSedesDropdown || showDaysDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSedesDropdown, showDaysDropdown])
  
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-12

  const firstSemesterLabel = `1er Cuatr. ${year}`
  const secondSemesterLabel = `2do Cuatr. ${year}`

  const isActive = (label: string) => selectedPeriod === label || (label === "Todos" && selectedPeriod === "Todos")

  const handleClick = (label: string) => {
    // "Anteriores" mostrará todos los cursos, limpiando el filtro de período
    if (label === "Anteriores") {
      onSelectPeriod("Todos")
      return
    }
    onSelectPeriod(label)
  }

  // Si el período actual no coincide con ninguno, no hacemos nada especial aquí;
  // el valor por defecto se decide en la página contenedora.

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6 gap-3 lg:gap-4">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-full lg:w-auto">
        <button
          onClick={() => handleClick(secondSemesterLabel)}
          className={`flex-1 lg:flex-none px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium ${isActive(secondSemesterLabel) ? "bg-slate-800 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          <span className="hidden sm:inline">{secondSemesterLabel}</span>
          <span className="sm:hidden">2do {year}</span>
        </button>
        <button
          onClick={() => handleClick(firstSemesterLabel)}
          className={`flex-1 lg:flex-none px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium border-l border-gray-300 ${isActive(firstSemesterLabel) ? "bg-slate-800 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          <span className="hidden sm:inline">{firstSemesterLabel}</span>
          <span className="sm:hidden">1er {year}</span>
        </button>
        <button
          onClick={() => handleClick("Anteriores")}
          className={`flex-1 lg:flex-none px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium border-l border-gray-300 ${selectedPeriod === "Todos" ? "bg-slate-800 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          Anteriores
        </button>
      </div>
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-3">
        {/* Selector de sedes */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => {
              setShowSedesDropdown(!showSedesDropdown)
              setShowDaysDropdown(false)
            }}
            className="flex items-center gap-1.5 lg:gap-2 pl-8 lg:pl-10 pr-2 lg:pr-3 py-2 border border-gray-200 rounded-lg bg-white min-w-[140px] lg:min-w-[160px] text-left hover:border-gray-300 transition-colors"
          >
            <Building className="absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-400" />
            <span className="flex-1 text-xs lg:text-sm truncate">
              {selectedSedes.length === 0 ? "Sedes" : `${selectedSedes.length} sede${selectedSedes.length > 1 ? "s" : ""}`}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-400 flex-shrink-0 transition-transform ${showSedesDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showSedesDropdown && (
            <div className="absolute left-0 lg:right-0 lg:left-auto mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
              {availableSedes.map((sede) => (
                <label key={sede} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSedes.includes(sede)}
                    onChange={() => toggleSede(sede)}
                    className="rounded border-gray-300 text-slate-600 focus:ring-slate-500 flex-shrink-0"
                  />
                  <span className="text-sm">{sede}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Selector de días */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => {
              setShowDaysDropdown(!showDaysDropdown)
              setShowSedesDropdown(false)
            }}
            className="flex items-center gap-1.5 lg:gap-2 pl-8 lg:pl-10 pr-2 lg:pr-3 py-2 border border-gray-200 rounded-lg bg-white min-w-[140px] lg:min-w-[160px] text-left hover:border-gray-300 transition-colors"
          >
            <Calendar className="absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-400" />
            <span className="flex-1 text-xs lg:text-sm truncate">
              {selectedDays.length === 0 ? "Días" : `${selectedDays.length} día${selectedDays.length > 1 ? "s" : ""}`}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-400 flex-shrink-0 transition-transform ${showDaysDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showDaysDropdown && (
            <div className="absolute left-0 lg:right-0 lg:left-auto mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
              {availableDays.map((day) => (
                <label key={day} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="rounded border-gray-300 text-slate-600 focus:ring-slate-500 flex-shrink-0"
                  />
                  <span className="text-sm">{day}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
