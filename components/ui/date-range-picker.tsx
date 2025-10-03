"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"

interface DatePickerProps {
  selectedDate: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  minDate?: Date | null
  maxDate?: Date | null
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"]

export function DatePicker({ selectedDate, onChange, placeholder = "Seleccionar fecha", minDate = null, maxDate = null }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDayClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    
    // Validar restricciones
    if (minDate && date < minDate) return
    if (maxDate && date > maxDate) return
    
    onChange(date)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(null)
  }

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false
    const date = new Date(currentYear, currentMonth, day)
    return date.toDateString() === selectedDate.toDateString()
  }

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isToday = (day: number) => {
    // Solo mostrar como "hoy" si NO está seleccionado
    if (isDateSelected(day)) return false
    
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    )
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const getDisplayValue = () => {
    return formatDate(selectedDate)
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent text-sm bg-white cursor-pointer hover:border-gray-400 transition-colors"
      >
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <span className={getDisplayValue() ? "text-gray-900" : "text-gray-400"}>
          {getDisplayValue() || placeholder}
        </span>
        {selectedDate && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:right-auto mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 sm:p-4 w-full sm:w-auto sm:min-w-[320px] max-w-[320px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] sm:text-xs font-medium text-gray-500 py-1 sm:py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {emptyDays.map((i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const selected = isDateSelected(day)
              const todayDate = isToday(day)
              const disabled = isDateDisabled(day)

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  disabled={disabled}
                  className={`
                    relative h-8 w-8 sm:h-9 sm:w-9 rounded-md text-xs sm:text-sm font-medium transition-all
                    ${disabled
                      ? "text-gray-300 cursor-not-allowed"
                      : selected
                      ? "bg-slate-800 text-white shadow-md hover:bg-slate-700 z-10"
                      : todayDate
                      ? "border-2 border-slate-400 text-slate-900 hover:bg-gray-100"
                      : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  {day}
                  {todayDate && (
                    <span className="absolute bottom-0.5 sm:bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-slate-800 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

