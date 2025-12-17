"use client"

import { useMemo, useState } from "react"
import { CoursesGrid } from "@/components/cursos/courses-grid"
import { CoursesHeader } from "@/components/cursos/courses-header"

export default function CursosPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Determinar período por defecto según el mes actual
  // 1er: marzo (3) a julio (7), 2do: agosto (8) a diciembre (12)
  // Ene-Feb: mostrar 1er cuatrimestre del año en curso
  const defaultPeriod = useMemo(() => {
    if (month >= 3 && month <= 7) return `1er Cuatr. ${year}`
    if (month >= 8 && month <= 12) return `2do Cuatr. ${year}`
    // Enero-Febrero: mostrar 1er cuatrimestre del año en curso
    return `1er Cuatr. ${year}`
  }, [month, year])

  const [selectedPeriod, setSelectedPeriod] = useState<string>(defaultPeriod)
  const [selectedSedes, setSelectedSedes] = useState<string[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedModalities, setSelectedModalities] = useState<string[]>([])
  const [availableSedes, setAvailableSedes] = useState<string[]>([])
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [availableModalities, setAvailableModalities] = useState<string[]>([])

  return (
    <>
      <CoursesHeader
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        selectedSedes={selectedSedes}
        onChangeSedes={setSelectedSedes}
        selectedDays={selectedDays}
        onChangeDays={setSelectedDays}
        selectedModalities={selectedModalities}
        onChangeModalities={setSelectedModalities}
        availableSedes={availableSedes}
        availableDays={availableDays}
        availablePeriods={availablePeriods}
        availableModalities={availableModalities}
      />
      <CoursesGrid
        externalSelectedPeriod={selectedPeriod}
        externalSelectedSedes={selectedSedes}
        externalSelectedDays={selectedDays}
        externalSelectedModalities={selectedModalities}
        onChangeSedes={setSelectedSedes}
        onChangeDays={setSelectedDays}
        onChangeModalities={setSelectedModalities}
        onAvailableSedesChange={setAvailableSedes}
        onAvailableDaysChange={setAvailableDays}
        onAvailablePeriodsChange={setAvailablePeriods}
        onAvailableModalitiesChange={setAvailableModalities}
      />
    </>
  )
}
