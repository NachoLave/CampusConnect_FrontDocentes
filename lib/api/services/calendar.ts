import { Course, ApiResponse } from '@/lib/types'
import { API_CONFIG } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'

export interface CalendarEvent {
  id: string
  title: string
  courseId: number
  courseTitle: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  duration: number // minutos
  classroom: string
  sede: string
  type: 'class' | 'exam' | 'meeting'
}

export interface NextClass {
  id: string
  title: string
  courseTitle: string
  date: string
  time: string
  classroom: string
  sede: string
  daysUntil: number
}

export class CalendarService {
  // Obtener eventos del calendario para una semana específica
  static async getWeeklyEvents(startDate: string, endDate: string): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const headers = {
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': 'application/json'
      }

      // Obtener cursos del docente para ambos cuatrimestres
      const coursesUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MY_COURSES}?term=2025Q2&includePrevious=true`
      const coursesResponse = await fetch(coursesUrl, { method: 'GET', headers })

      if (!coursesResponse.ok) {
        throw new Error(`Error del servidor cursos: ${coursesResponse.status}`)
      }

      const courses = await coursesResponse.json()
      
      // Convertir cursos a eventos del calendario
      const classEvents = this.convertCoursesToEvents(courses, startDate, endDate)

      // Obtener reservas de comedor
      const canteenUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CANTEEN_RESERVATIONS}`
      let canteenEvents: CalendarEvent[] = []
      
      try {
        const canteenResponse = await fetch(canteenUrl, { method: 'GET', headers })
        if (canteenResponse.ok) {
          const canteenData = await canteenResponse.json()
          canteenEvents = this.convertCanteenToEvents(canteenData, startDate, endDate)
        }
      } catch (err) {
        console.warn('Error obteniendo reservas de comedor:', err)
      }

      // Combinar eventos de clases y comedor
      const allEvents = [...classEvents, ...canteenEvents]

      return {
        data: allEvents,
        success: true,
        message: 'Eventos del calendario obtenidos correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo eventos del calendario:', error)

      return {
        data: [],
        success: false,
        message: 'No se pudieron obtener eventos del backend'
      }
    }
  }

  // Obtener la próxima clase
  static async getNextClass(): Promise<ApiResponse<NextClass | null>> {
    try {
      // Obtener cursos del período actual
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      
      let term = '2025Q2' // Por defecto
      if (month >= 3 && month <= 7) {
        term = `${year}Q1`
      } else if (month >= 8 && month <= 12) {
        term = `${year}Q2`
      }
      
      const coursesUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MY_COURSES}?term=${term}&includePrevious=false`
      const headers = {
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': 'application/json'
      }
      
      const response = await fetch(coursesUrl, { method: 'GET', headers })
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }
      
      const courses = await response.json()
      
      // Encontrar la próxima clase
      const nextClass = this.findNextClass(courses)
      
      return {
        data: nextClass,
        success: true,
        message: nextClass ? 'Próxima clase encontrada' : 'No hay clases próximas'
      }
    } catch (error) {
      console.error('Error obteniendo próxima clase:', error)

      return {
        data: null,
        success: true,
        message: 'No hay clases próximas'
      }
    }
  }

  // Convertir reservas de comedor a eventos del calendario
  private static convertCanteenToEvents(reservations: any[], startDate: string, endDate: string): CalendarEvent[] {
    const events: CalendarEvent[] = []
    
    reservations.forEach((reservation: any) => {
      // scheduledAt viene en formato ISO con timezone: "2025-11-09T12:59:09.816054401-03:00"
      const scheduledAt = reservation.scheduledAt
      if (!scheduledAt) return
      
      const dateObj = new Date(scheduledAt)
      const dateStr = dateObj.toISOString().split('T')[0]
      const time = dateObj.toTimeString().slice(0, 5)
      
      // Solo agregar si está en el rango solicitado
      if (dateStr >= startDate && dateStr <= endDate) {
        events.push({
          id: `canteen-${reservation.reservationId}`,
          title: `Comedor: ${reservation.menu || 'Reserva'}`,
          courseId: 0,
          courseTitle: reservation.menu || 'Reserva de comedor',
          date: dateStr,
          time: time,
          duration: 60, // 1 hora por defecto
          classroom: reservation.menu || '',
          sede: reservation.campus || '',
          type: 'meeting' // Usamos 'meeting' para comedor, se mapeará a 'comedor' en el frontend
        })
      }
    })
    
    return events
  }

  // Convertir cursos del backend a eventos del calendario
  private static convertCoursesToEvents(courses: any[], startDate: string, endDate: string): CalendarEvent[] {
    const events: CalendarEvent[] = []
    
    courses.forEach((course: any) => {
      // Determinar rango de fechas según el periodo (Q1 o Q2)
      const periodo = String(course.periodo || '').toUpperCase()
      let courseStart: Date
      let courseEnd: Date
      
      if (periodo === '2025Q1') {
        // Q1: 01/03/2025 - 31/07/2025
        courseStart = new Date(2025, 2, 1) // Marzo es mes 2 (0-indexed)
        courseEnd = new Date(2025, 6, 31) // Julio es mes 6
      } else if (periodo === '2025Q2') {
        // Q2: 01/08/2025 - 23/12/2025
        courseStart = new Date(2025, 7, 1) // Agosto es mes 7
        courseEnd = new Date(2025, 11, 23) // Diciembre es mes 11
      } else {
        // Si no tiene periodo válido, saltar este curso
        return
      }
      
      // Obtener el día de la semana del curso
      const dayOfWeek = this.getDayOfWeekNumber(course.diaSemana)
      const time = this.getTimeFromShift(course.turno)
      
      // Generar todas las fechas del curso que coincidan con el día de la semana
      const currentDate = new Date(courseStart)
      while (currentDate <= courseEnd) {
        if (currentDate.getDay() === dayOfWeek) {
          const dateStr = currentDate.toISOString().split('T')[0]
          
          // Solo agregar si está en el rango solicitado
          if (dateStr >= startDate && dateStr <= endDate) {
            events.push({
              id: `${course.courseId}-${dateStr}`,
              title: `Clase de ${course.materia}`,
              courseId: course.courseId,
              courseTitle: course.materia,
              date: dateStr,
              time: time,
              duration: 240, // 4 horas por defecto
              classroom: course.aula || '',
              sede: course.campus || '',
              type: 'class'
            })
          }
        }
        // Avanzar al siguiente día
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })
    
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Encontrar la próxima clase
  private static findNextClass(courses: any[]): NextClass | null {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    const upcomingClasses: NextClass[] = []
    
    courses.forEach((course: any) => {
      const dayOfWeek = this.getDayOfWeekNumber(course.diaSemana)
      const time = this.getTimeFromShift(course.turno)
      
      // Buscar la próxima ocurrencia de esta clase
      for (let i = 0; i < 14; i++) { // Buscar en las próximas 2 semanas
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        
        if (date.getDay() === dayOfWeek) {
          const dateStr = date.toISOString().split('T')[0]
          const classDateTime = new Date(`${dateStr}T${time}:00`)
          
          // Solo incluir clases futuras
          if (classDateTime > today) {
            const daysUntil = Math.ceil((classDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            
            upcomingClasses.push({
              id: `${course.courseId}-${dateStr}`,
              title: `Clase de ${course.materia}`,
              courseTitle: course.materia,
              date: dateStr,
              time: time,
              classroom: course.aula || 'XXX',
              sede: course.campus || 'XXX',
              daysUntil: daysUntil
            })
          }
        }
      }
    })
    
    // Ordenar por fecha y tiempo, y tomar la más cercana
    upcomingClasses.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}:00`)
      const dateB = new Date(`${b.date}T${b.time}:00`)
      return dateA.getTime() - dateB.getTime()
    })
    
    return upcomingClasses.length > 0 ? upcomingClasses[0] : null
  }

  // Convertir día de la semana a número
  private static getDayOfWeekNumber(day: string): number {
    const dayMap: { [key: string]: number } = {
      'LUNES': 1,
      'MARTES': 2,
      'MIÉRCOLES': 3,
      'JUEVES': 4,
      'VIERNES': 5,
      'SÁBADO': 6,
      'DOMINGO': 0
    }
    return dayMap[day] ?? 1
  }

  // Obtener hora según el turno
  private static getTimeFromShift(shift: string): string {
    const timeMap: { [key: string]: string } = {
      'MANIANA': '07:30',
      'TARDE': '13:30',
      'NOCHE': '18:30'
    }
    return timeMap[shift] ?? '07:30'
  }
}