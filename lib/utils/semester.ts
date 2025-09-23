// Utilidades para calcular el cuatrimestre actual y su progreso

export interface SemesterInfo {
  year: number
  semester: 1 | 2
  displayName: string
  progress: number
  startDate: Date
  endDate: Date
  totalDays: number
  elapsedDays: number
  remainingDays: number
}

export function getCurrentSemesterInfo(): SemesterInfo {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // getMonth() devuelve 0-11
  const currentDate = now.getDate()

  let semester: 1 | 2
  let startDate: Date
  let endDate: Date

  // Determinar el cuatrimestre basado en la fecha actual
  if (currentMonth >= 3 && currentMonth <= 7) {
    // Primer cuatrimestre: Marzo - Julio
    semester = 1
    startDate = new Date(currentYear, 2, 1) // Marzo = mes 2 (0-indexado)
    endDate = new Date(currentYear, 7, 31) // Julio = mes 6, día 31
  } else if (currentMonth >= 8 && currentMonth <= 12) {
    // Segundo cuatrimestre: Agosto - Diciembre  
    semester = 2
    startDate = new Date(currentYear, 7, 1) // Agosto = mes 7
    endDate = new Date(currentYear, 11, 31) // Diciembre = mes 11, día 31
  } else {
    // Enero-Febrero: mostrar el último cuatrimestre del año anterior
    // o el próximo cuatrimestre
    if (currentMonth <= 2) {
      // Enero-Febrero: mostrar segundo cuatrimestre del año anterior
      semester = 2
      startDate = new Date(currentYear - 1, 7, 1)
      endDate = new Date(currentYear - 1, 11, 31)
    } else {
      // No debería llegar aquí, pero por seguridad
      semester = 1
      startDate = new Date(currentYear, 2, 1)
      endDate = new Date(currentYear, 7, 31)
    }
  }

  // Calcular días totales y transcurridos
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  const remainingDays = Math.max(0, totalDays - elapsedDays)

  // Calcular progreso (0-100%)
  let progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100))
  
  // Si estamos fuera del período, ajustar el progreso
  if (now < startDate) {
    progress = 0 // Aún no ha comenzado
  } else if (now > endDate) {
    progress = 100 // Ya terminó
  }

  const displayName = `${currentYear}-${semester}`

  return {
    year: currentYear,
    semester,
    displayName,
    progress: Math.round(progress),
    startDate,
    endDate,
    totalDays,
    elapsedDays: Math.max(0, elapsedDays),
    remainingDays
  }
}

export function formatSemesterProgress(semesterInfo: SemesterInfo): string {
  const { progress, remainingDays } = semesterInfo
  
  if (progress === 100) {
    return 'Cuatrimestre finalizado'
  } else if (progress === 0) {
    return 'Cuatrimestre próximo a comenzar'
  } else if (remainingDays <= 7) {
    return `${progress}% - Última semana`
  } else if (remainingDays <= 30) {
    return `${progress}% - ${remainingDays} días restantes`
  } else {
    return `${progress}% completado`
  }
}

export function getSemesterMonths(semester: 1 | 2): string {
  return semester === 1 ? 'Marzo - Julio' : 'Agosto - Diciembre'
}

// Función para obtener el color de la barra - ahora usa colores slate consistentes
export function getProgressColor(progress: number): string {
  return 'bg-slate-300' // Color consistente con el texto del título
}

// Función para obtener el color del texto - ahora usa colores slate consistentes  
export function getProgressTextColor(progress: number): string {
  return 'text-slate-300' // Color consistente con el texto del título
}
