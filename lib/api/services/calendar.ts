import { Course, ApiResponse } from '@/lib/types'
import { API_CONFIG } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import { authService } from './auth'

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
      // Usar proxy de Next.js para evitar CORS
      const teacherUUID = authService.getTeacherUUID()
      if (!teacherUUID) {
        throw new Error('No hay docente autenticado')
      }
      
      const coursesUrl = `/api/teaching/courses/mine?term=2025Q2&includePrevious=true`
      const coursesResponse = await fetch(coursesUrl, { 
        method: 'GET', 
        headers: {
          'Accept': 'application/json',
          'X-Teacher-Id': teacherUUID
        }
      })

      if (!coursesResponse.ok) {
        throw new Error(`Error del servidor cursos: ${coursesResponse.status}`)
      }

      const courses = await coursesResponse.json()
      
  // Convertir cursos a eventos del calendario (incluye exámenes)
  const classEvents = await this.convertCoursesToEvents(courses, startDate, endDate)

      // Obtener reservas de comedor (ya usa proxy)
      const canteenUrl = `/api/canteen/reservations?userId=${authService.getTeacherUUID()}`
      let canteenEvents: CalendarEvent[] = []
      
      try {
        const canteenResponse = await fetch(canteenUrl, { 
          method: 'GET', 
          headers: {
            'Accept': 'application/json'
          }
        })
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
      
      // Usar proxy de Next.js para evitar CORS
      const teacherUUID = authService.getTeacherUUID()
      if (!teacherUUID) {
        return {
          data: null,
          success: false,
          error: 'No hay docente autenticado'
        }
      }
      
      const coursesUrl = `/api/teaching/courses/mine?term=${term}&includePrevious=false`
      
      const response = await fetch(coursesUrl, { 
        method: 'GET', 
        headers: {
          'Accept': 'application/json',
          'X-Teacher-Id': teacherUUID
        }
      })
      
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
  private static async convertCoursesToEvents(courses: any[], startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = []

    const headers = {
      'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
      'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
      'Accept': 'application/json'
    }

    // Process courses in parallel to fetch assessments for each course
    await Promise.all((courses || []).map(async (course: any) => {
      try {
        // Determinar rango de fechas según el periodo (Q1 o Q2)
        const periodo = String(course.periodo || '').toUpperCase()
        let courseStart: Date
        let courseEnd: Date

        if (periodo.includes('Q1')) {
          // Q1: 01/03/YYYY - 31/07/YYYY
          const year = (periodo.match(/\d{4}/) || [])[0] || '2025'
          courseStart = new Date(Number(year), 2, 1)
          courseEnd = new Date(Number(year), 6, 31)
        } else if (periodo.includes('Q2')) {
          // Q2: 01/08/YYYY - 23/12/YYYY
          const year = (periodo.match(/\d{4}/) || [])[0] || '2025'
          courseStart = new Date(Number(year), 7, 1)
          courseEnd = new Date(Number(year), 11, 23)
        } else {
          // If no valid period, skip
          return
        }

        // Obtener el día de la semana del curso
        const dayOfWeek = this.getDayOfWeekNumber(course.diaSemana)
        const time = this.getTimeFromShift(course.turno)

        // Generate class occurrences
        const currentDate = new Date(courseStart)
        while (currentDate <= courseEnd) {
          if (currentDate.getDay() === dayOfWeek) {
            const dateStr = currentDate.toISOString().split('T')[0]
            if (dateStr >= startDate && dateStr <= endDate) {
              events.push({
                id: `${course.courseId}-${dateStr}`,
                title: `Clase: ${course.materia}`,
                courseId: course.courseId,
                courseTitle: course.materia,
                date: dateStr,
                time: time,
                duration: 240,
                classroom: course.aula || '',
                sede: course.campus || '',
                type: 'class'
              })
            }
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }

        // Fetch assessments for this course and convert them to exam events
        try {
          const assessmentsUrl = `${API_CONFIG.BASE_URL}/teaching/courses/${course.courseId}/assessments`
          const resp = await fetch(assessmentsUrl, { method: 'GET', headers })
          if (resp.ok) {
            const assessments = await resp.json()
            if (Array.isArray(assessments)) {
              assessments.forEach((a: any) => {
                // Expecting a.date in YYYY-MM-DD
                const aDate = String(a.date || '')
                if (!aDate) return
                if (aDate >= startDate && aDate <= endDate) {
                  events.push({
                    id: `exam-${a.assessmentId}-${course.courseId}`,
                    // Include assessment type and course name in the label
                    title: `Examen: ${a.type || 'Evaluación'} • ${course.materia}`,
                    courseId: course.courseId,
                    courseTitle: course.materia,
                    date: aDate,
                    time: this.getTimeFromShift(course.turno),
                    duration: 120,
                    classroom: course.aula || '',
                    sede: course.campus || '',
                    type: 'exam'
                  })
                }
              })
            }
          }
        } catch (err) {
          // swallow assessment fetch errors for this course
          console.warn(`Error fetching assessments for course ${course.courseId}:`, err)
        }

      } catch (err) {
        console.warn('Error processing course for calendar events:', err)
      }
    }))

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
              title: `Clase: ${course.materia}`,
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
    // Normalize day string: uppercase and remove diacritics so we accept
    // both 'MIÉRCOLES' and 'MIERCOLES' (and other variants).
    const normalized = String(day || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const dayMap: { [key: string]: number } = {
      'LUNES': 1,
      'MARTES': 2,
      'MIERCOLES': 3,
      'JUEVES': 4,
      'VIERNES': 5,
      'SABADO': 6,
      'DOMINGO': 0
    }

    return dayMap[normalized] ?? 1
  }

  // Obtener hora según el turno
  private static getTimeFromShift(shift: string): string {
    // Align times with 'Mis cursos' display: mañana -> 08:00, tarde -> 14:00, noche -> 18:00
    const timeMap: { [key: string]: string } = {
      'MANIANA': '08:00',
      'MANANA': '08:00',
      'TARDE': '14:00',
      'NOCHE': '18:00'
    }
    return timeMap[shift] ?? '08:00'
  }
}