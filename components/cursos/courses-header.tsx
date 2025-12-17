"use client"

import { useState, useEffect } from "react"
import { Building, Calendar, ChevronDown, Monitor } from "lucide-react"
type CoursesHeaderProps = {
  selectedPeriod: string
  onSelectPeriod: (period: string) => void
  selectedSedes: string[]
  onChangeSedes: (sedes: string[]) => void
  selectedDays: string[]
  onChangeDays: (days: string[]) => void
  selectedModalities: string[]
  onChangeModalities: (modalities: string[]) => void
  availableSedes: string[]
  availableDays: string[]
  availablePeriods: string[]
  availableModalities: string[]
}

export function CoursesHeader({ selectedPeriod, onSelectPeriod, selectedSedes, onChangeSedes, selectedDays, onChangeDays, selectedModalities, onChangeModalities, availableSedes, availableDays, availablePeriods, availableModalities }: CoursesHeaderProps) {
  const [showSedesDropdown, setShowSedesDropdown] = useState(false)
  const [showDaysDropdown, setShowDaysDropdown] = useState(false)
  const [showModalityDropdown, setShowModalityDropdown] = useState(false)
  

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

  const toggleModality = (modality: string) => {
    if (selectedModalities.includes(modality)) {
      onChangeModalities(selectedModalities.filter((m) => m !== modality))
    } else {
      onChangeModalities([...selectedModalities, modality])
    }
  }

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.relative')) {
        setShowSedesDropdown(false)
        setShowDaysDropdown(false)
        setShowModalityDropdown(false)
      }
    }

    if (showSedesDropdown || showDaysDropdown || showModalityDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSedesDropdown, showDaysDropdown, showModalityDropdown])

  const isActive = (label: string) => selectedPeriod === label

  const handleClick = (label: string) => {
    // "Otros" se maneja igual que cualquier otra pestaña
    onSelectPeriod(label)
  }

  // Siempre mostrar las pestañas de períodos del año en curso
  // 1er y 2do del año actual, Verano del año siguiente, y Otros
  const now = new Date()
  const currentYear = now.getFullYear()
  const periodButtons = [
    `1er Cuatr. ${currentYear}`,
    `2do Cuatr. ${currentYear}`,
    `Verano ${currentYear + 1}`,
    "Otros"
  ]

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6 gap-3 lg:gap-4">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-full lg:w-auto">
        {periodButtons.map((period, index) => {
          const isLast = index === periodButtons.length - 1
          const displayText = period
          const shortText = period.includes("Verano") 
            ? period.replace(/\d{4}/, "").trim() 
            : period.includes("2do") 
              ? `2do ${period.match(/\d{4}/)?.[0] || ""}` 
              : period.includes("1er")
                ? `1er ${period.match(/\d{4}/)?.[0] || ""}`
                : period
          
          return (
            <button
              key={period}
              onClick={() => handleClick(period)}
              className={`flex-1 lg:flex-none px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium ${
                index > 0 ? "border-l border-gray-300" : ""
              } ${isActive(period) ? "bg-slate-800 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              <span className="hidden sm:inline">{displayText}</span>
              <span className="sm:hidden">{shortText}</span>
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-3">
        {/* Selector de sedes */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => {
              setShowSedesDropdown(!showSedesDropdown)
              setShowDaysDropdown(false)
              setShowModalityDropdown(false)
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
              setShowModalityDropdown(false)
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

        {/* Selector de modalidad */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => {
              setShowModalityDropdown(!showModalityDropdown)
              setShowSedesDropdown(false)
              setShowDaysDropdown(false)
            }}
            className="flex items-center gap-1.5 lg:gap-2 pl-8 lg:pl-10 pr-2 lg:pr-3 py-2 border border-gray-200 rounded-lg bg-white min-w-[140px] lg:min-w-[160px] text-left hover:border-gray-300 transition-colors"
          >
            <Monitor className="absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-400" />
            <span className="flex-1 text-xs lg:text-sm truncate">
              {selectedModalities.length === 0 ? "Modalidad" : `${selectedModalities.length} modalidad${selectedModalities.length > 1 ? "es" : ""}`}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-400 flex-shrink-0 transition-transform ${showModalityDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showModalityDropdown && (
            <div className="absolute left-0 lg:right-0 lg:left-auto mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
              {availableModalities.map((modality) => {
                const displayName = modality === 'PRESENCIAL' ? 'Presencial' : modality === 'VIRTUAL' ? 'Virtual' : modality
                return (
                  <label key={modality} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedModalities.includes(modality)}
                      onChange={() => toggleModality(modality)}
                      className="rounded border-gray-300 text-slate-600 focus:ring-slate-500 flex-shrink-0"
                    />
                    <span className="text-sm">{displayName}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
