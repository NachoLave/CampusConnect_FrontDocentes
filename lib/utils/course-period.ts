/**
 * Utilidades para mapear cursos a pestañas de períodos
 */

import { Course } from '@/lib/types'

/**
 * Obtiene el año del campo "desde" de un curso
 */
export function getCourseYear(course: Course): number {
  if (course.desde) {
    try {
      const desde = new Date(course.desde)
      return desde.getFullYear()
    } catch {
      // Si falla, usar año actual
      return new Date().getFullYear()
    }
  }
  return new Date().getFullYear()
}

/**
 * Determina a qué pestaña pertenece un curso basándose en:
 * - El año del campo "desde"
 * - El campo "period" (ya normalizado por normalizePeriod)
 */
export function getCourseTab(course: Course, currentYear: number): string {
  const courseYear = getCourseYear(course)
  const periodNormalized = (course.period || '').toLowerCase().trim()
  
  // Log de depuración temporal
  console.log('🔍 [getCourseTab]', {
    period: course.period,
    periodNormalized,
    courseYear,
    currentYear,
    desde: course.desde
  })
  
  // El campo period ya viene normalizado desde mapExternalToCourse con formato:
  // "1er Cuatr. YYYY", "2do Cuatr. YYYY", "Verano YYYY", o "Otros"
  
  // Si el periodo es "Otros" o vacío, devolver "Otros"
  if (!periodNormalized || periodNormalized === 'otros' || periodNormalized === 'todos' || periodNormalized === 'todas') {
    console.log('  -> Otros (periodo vacío o "Otros")')
    return 'Otros'
  }
  
  // Intentar extraer el tipo y año del periodo normalizado
  // Patrón: "1er Cuatr. 2025", "2do Cuatr. 2025", "Verano 2026"
  // El regex debe capturar: tipo (1er/2do/verano), luego opcionalmente "cuatr", luego el año
  // Para "Verano" no hay "cuatr", así que hacemos el grupo opcional
  let periodMatch = periodNormalized.match(/(1er|2do)\s+cuatr?\.?\s*(\d{4})/i)
  if (!periodMatch) {
    // Intentar con "Verano" que no tiene "cuatr"
    periodMatch = periodNormalized.match(/(verano)\s+(\d{4})/i)
  }
  
  if (periodMatch) {
    const tipo = periodMatch[1].toLowerCase()
    const periodYear = parseInt(periodMatch[2])
    
    console.log('  -> Match encontrado:', { tipo, periodYear, currentYear })
    
    // Para 1er cuatrimestre: solo mapear si el año del periodo coincide con el año actual
    if (tipo === '1er' && periodYear === currentYear) {
      console.log('  -> 1er Cuatr. ' + currentYear)
      return `1er Cuatr. ${currentYear}`
    }
    
    // Para 2do cuatrimestre: solo mapear si el año del periodo coincide con el año actual
    if (tipo === '2do' && periodYear === currentYear) {
      console.log('  -> 2do Cuatr. ' + currentYear)
      return `2do Cuatr. ${currentYear}`
    }
    
    // Para Verano: el año del periodo debe ser el año siguiente al actual
    // Ejemplo: Verano 2026 cuando currentYear = 2025
    if (tipo === 'verano' && periodYear === currentYear + 1) {
      console.log('  -> Verano ' + (currentYear + 1))
      return `Verano ${currentYear + 1}`
    }
    
    // Si el periodo tiene un año diferente al esperado, va a Otros
    console.log('  -> Otros (año no coincide)')
    return 'Otros'
  }
  
  // Fallback: intentar detectar por palabras clave si no está en formato normalizado
  // Esto puede pasar si el periodo viene en formato diferente
  console.log('  -> No match, usando fallback')
  const isPrimer = periodNormalized.includes('1er') || periodNormalized.includes('primer') || periodNormalized.includes('q1')
  const isSegundo = periodNormalized.includes('2do') || periodNormalized.includes('segundo') || periodNormalized.includes('q2')
  const isVerano = periodNormalized.includes('verano')
  
  console.log('  -> Fallback detectado:', { isPrimer, isSegundo, isVerano, courseYear, currentYear })
  
  // Si es del año en curso
  if (courseYear === currentYear) {
    if (isPrimer) {
      console.log('  -> 1er Cuatr. ' + currentYear + ' (fallback)')
      return `1er Cuatr. ${currentYear}`
    }
    if (isSegundo) {
      console.log('  -> 2do Cuatr. ' + currentYear + ' (fallback)')
      return `2do Cuatr. ${currentYear}`
    }
    if (isVerano) {
      // Verano del año en curso se mapea al año siguiente
      console.log('  -> Verano ' + (currentYear + 1) + ' (fallback)')
      return `Verano ${currentYear + 1}`
    }
  }
  
  // Si es verano y el año del curso es el siguiente al actual
  // (porque el verano es entre años, ej: desde 2026-01-13 → Verano 2026)
  if (isVerano && courseYear === currentYear + 1) {
    console.log('  -> Verano ' + (currentYear + 1) + ' (fallback, año siguiente)')
    return `Verano ${currentYear + 1}`
  }
  
  // Cualquier otro caso va a "Otros"
  console.log('  -> Otros (fallback final)')
  return 'Otros'
}

/**
 * Genera las pestañas de períodos que siempre se deben mostrar:
 * - 1er Cuatr. [año actual]
 * - 2do Cuatr. [año actual]
 * - Verano [año siguiente]
 * - Otros
 */
export function getDefaultPeriodTabs(currentYear: number): string[] {
  return [
    `1er Cuatr. ${currentYear}`,
    `2do Cuatr. ${currentYear}`,
    `Verano ${currentYear + 1}`,
    'Otros'
  ]
}

/**
 * Filtra cursos por pestaña de período
 */
export function filterCoursesByTab(courses: Course[], tab: string, currentYear: number): Course[] {
  if (tab === 'Todos' || tab === 'Todas') {
    return courses
  }
  
  return courses.filter(course => {
    const courseTab = getCourseTab(course, currentYear)
    return courseTab === tab
  })
}
