"use client"

import { useMemo, useState } from "react"
import { CoursesGrid } from "@/components/cursos/courses-grid"
import { CoursesHeader } from "@/components/cursos/courses-header"

export default function CursosPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Determinar cuatrimestre actual según las fechas dadas
  // 1er: marzo (3) a julio (7), 2do: agosto (8) a diciembre (12). Ene-Feb fuera de período -> por defecto "Anteriores" (Todos)
  const defaultPeriod = useMemo(() => {
    if (month >= 3 && month <= 7) return `1er Cuatr. ${year}`
    if (month >= 8 && month <= 12) return `2do Cuatr. ${year}`
    return "Todos"
  }, [month, year])

  const [selectedPeriod, setSelectedPeriod] = useState<string>(defaultPeriod)
  const [selectedSedes, setSelectedSedes] = useState<string[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [availableSedes, setAvailableSedes] = useState<string[]>([])
  const [availableDays, setAvailableDays] = useState<string[]>([])

  return (
    <>
      <CoursesHeader
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        selectedSedes={selectedSedes}
        onChangeSedes={setSelectedSedes}
        selectedDays={selectedDays}
        onChangeDays={setSelectedDays}
        availableSedes={availableSedes}
        availableDays={availableDays}
      />
      <CoursesGrid
        externalSelectedPeriod={selectedPeriod}
        externalSelectedSedes={selectedSedes}
        externalSelectedDays={selectedDays}
        onChangeSedes={setSelectedSedes}
        onChangeDays={setSelectedDays}
        onAvailableSedesChange={setAvailableSedes}
        onAvailableDaysChange={setAvailableDays}
      />
    </>
  )
}
