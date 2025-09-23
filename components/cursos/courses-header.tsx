"use client"

import { Building, Calendar, ChevronDown } from "lucide-react"
type CoursesHeaderProps = {
  selectedPeriod: string
  onSelectPeriod: (period: string) => void
  selectedSedes: string[]
  onChangeSedes: (sedes: string[]) => void
  selectedDays: string[]
  onChangeDays: (days: string[]) => void
}

export function CoursesHeader({ selectedPeriod, onSelectPeriod, selectedSedes, onChangeSedes, selectedDays, onChangeDays }: CoursesHeaderProps) {
  // Valores de ejemplo de sedes y días. En un futuro pueden venir de un hook o props si se requiere dinamismo.
  const availableSedes = ["Virtual", "Monserrat", "Belgrano", "Recoleta", "Campus Costa Pinamar"]
  const availableDays = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"]

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
    <div className="flex items-center justify-between mb-6 gap-4">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => handleClick(secondSemesterLabel)}
          className={`px-4 py-2 text-sm font-medium ${isActive(secondSemesterLabel) ? "bg-slate-800 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          {secondSemesterLabel}
        </button>
        <button
          onClick={() => handleClick(firstSemesterLabel)}
          className={`px-4 py-2 text-sm font-medium border-l border-gray-300 ${isActive(firstSemesterLabel) ? "bg-slate-800 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          {firstSemesterLabel}
        </button>
        <button
          onClick={() => handleClick("Anteriores")}
          className={`px-4 py-2 text-sm font-medium border-l border-gray-300 ${selectedPeriod === "Todos" ? "bg-slate-800 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          Anteriores
        </button>
      </div>
      <div className="flex items-center gap-3">
        {/* Selector de sedes */}
        <div className="relative group">
          <button className="flex items-center gap-2 pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white min-w-[160px] text-left">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <span className="flex-1 text-sm">
              {selectedSedes.length === 0 ? "Todas las sedes" : `${selectedSedes.length} sede${selectedSedes.length > 1 ? "s" : ""}`}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          <div className="hidden group-hover:block absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {availableSedes.map((sede) => (
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
        </div>

        {/* Selector de días */}
        <div className="relative group">
          <button className="flex items-center gap-2 pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white min-w-[160px] text-left">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <span className="flex-1 text-sm">
              {selectedDays.length === 0 ? "Todos los días" : `${selectedDays.length} día${selectedDays.length > 1 ? "s" : ""}`}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          <div className="hidden group-hover:block absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {availableDays.map((day) => (
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
        </div>
      </div>
    </div>
  )
}
