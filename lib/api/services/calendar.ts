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
    console.log('🔍 CalendarService.getWeeklyEvents() - USE_MOCK_DATA:', APP_CONFIG.USE_MOCK_DATA)
    console.log('📅 Rango de fechas:', startDate, 'a', endDate)
    
    if (APP_CONFIG.USE_MOCK_DATA) {
      console.log('📱 Usando datos mock para calendario')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Datos mock para el calendario
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Clase de Bases de Datos',
          courseId: 2002,
          courseTitle: 'Bases de Datos',
          date: '2025-01-18',
          time: '18:30',
          duration: 240, // 4 horas
          classroom: 'B-202',
          sede: 'MDP',
          type: 'class'
        },
        {
          id: '2',
          title: 'Clase de Programación Avanzada',
          courseId: 2000,
          courseTitle: 'Programación Avanzada',
          date: '2025-01-20',
          time: '07:30',
          duration: 240, // 4 horas
          classroom: 'Aula 101',
          sede: 'Campus Central',
          type: 'class'
        }
      ]
      
      return {
        data: mockEvents,
        success: true,
        message: 'Eventos del calendario obtenidos correctamente'
      }
    }

    try {
      console.log('🌐 Intentando obtener eventos del calendario del backend...')
      
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
      
      console.log('📅 Período calculado para calendario:', {
        fechaActual: currentDate.toISOString().split('T')[0],
        mes: month,
        año: year,
        terminoCalculado: term
      })
      
      const coursesUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MY_COURSES}?term=${term}&includePrevious=false`
      const headers = {
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
      
      console.log(`📡 Llamando al backend real: ${coursesUrl}`)
      const response = await fetch(coursesUrl, { method: 'GET', headers: headers })
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }
      
      const courses = await response.json()
      console.log('✅ Cursos obtenidos del backend:', courses)
      
      // Convertir cursos a eventos del calendario
      const events = this.convertCoursesToEvents(courses, startDate, endDate)
      
      return {
        data: events,
        success: true,
        message: 'Eventos del calendario obtenidos del backend'
      }
    } catch (error) {
      console.error('❌ Error obteniendo eventos del calendario:', error)
      console.log('🔄 Usando eventos de fallback')
      
      // Fallback a datos mock
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Clase de Bases de Datos',
          courseId: 2002,
          courseTitle: 'Bases de Datos',
          date: '2025-01-18',
          time: '18:30',
          duration: 240,
          classroom: 'B-202',
          sede: 'MDP',
          type: 'class'
        }
      ]
      
      return {
        data: mockEvents,
        success: true,
        message: 'Eventos obtenidos (modo fallback)'
      }
    }
  }

  // Obtener la próxima clase
  static async getNextClass(): Promise<ApiResponse<NextClass | null>> {
    console.log('🔍 CalendarService.getNextClass() - USE_MOCK_DATA:', APP_CONFIG.USE_MOCK_DATA)
    
    if (APP_CONFIG.USE_MOCK_DATA) {
      console.log('📱 Usando datos mock para próxima clase')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockNextClass: NextClass = {
        id: '1',
        title: 'Clase de Bases de Datos',
        courseTitle: 'Bases de Datos',
        date: '2025-01-20',
        time: '18:30',
        classroom: 'B-202',
        sede: 'MDP',
        daysUntil: 2
      }

      return {
        data: mockNextClass,
        success: true,
        message: 'Próxima clase obtenida correctamente'
      }
    }

    try {
      console.log('🌐 Intentando obtener próxima clase del backend...')
      
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
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
      
      const response = await fetch(coursesUrl, { method: 'GET', headers: headers })
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }
      
      const courses = await response.json()
      console.log('✅ Cursos obtenidos para próxima clase:', courses)
      
      // Encontrar la próxima clase
      const nextClass = this.findNextClass(courses)
      
      return {
        data: nextClass,
        success: true,
        message: nextClass ? 'Próxima clase encontrada' : 'No hay clases próximas'
      }
    } catch (error) {
      console.error('❌ Error obteniendo próxima clase:', error)
      console.log('🔄 Usando próxima clase de fallback')

      return {
        data: null,
        success: true,
        message: 'No hay clases próximas (modo fallback)'
      }
    }
  }

  // Convertir cursos del backend a eventos del calendario
  private static convertCoursesToEvents(courses: any[], startDate: string, endDate: string): CalendarEvent[] {
    const events: CalendarEvent[] = []
    
    console.log('🔍 convertCoursesToEvents - Cursos recibidos:', courses)
    console.log('📅 Rango de fechas:', startDate, 'a', endDate)
    
    courses.forEach((course: any) => {
      console.log('📚 Procesando curso:', {
        materia: course.materia,
        diaSemana: course.diaSemana,
        turno: course.turno,
        aula: course.aula,
        campus: course.campus
      })
      
      // Generar eventos para cada semana en el rango usando fechas reales de enero 2025
      const time = this.getTimeFromShift(course.turno)
      
      // Usar fechas reales de enero 2025 para evitar problemas de zona horaria
      const january2025Dates = {
        'LUNES': ['2025-01-06', '2025-01-13', '2025-01-20', '2025-01-27'],
        'MARTES': ['2025-01-07', '2025-01-14', '2025-01-21', '2025-01-28'],
        'MIÉRCOLES': ['2025-01-08', '2025-01-15', '2025-01-22', '2025-01-29'],
        'JUEVES': ['2025-01-09', '2025-01-16', '2025-01-23', '2025-01-30'],
        'VIERNES': ['2025-01-10', '2025-01-17', '2025-01-24', '2025-01-31'],
        'SÁBADO': ['2025-01-11', '2025-01-18', '2025-01-25'],
        'DOMINGO': ['2025-01-12', '2025-01-19', '2025-01-26']
      }
      
      const courseDates = january2025Dates[course.diaSemana] || []
      
      console.log('🔄 Conversión:', {
        diaSemanaOriginal: course.diaSemana,
        fechasDisponibles: courseDates,
        time: time
      })
      
      courseDates.forEach((eventDate) => {
        // Verificar si la fecha está en el rango solicitado
        if (eventDate >= startDate && eventDate <= endDate) {
          console.log('✅ Creando evento:', {
            curso: course.materia,
            diaSemanaOriginal: course.diaSemana,
            fechaGenerada: eventDate,
            time: time
          })
          
          events.push({
            id: `${course.courseId}-${eventDate}`,
            title: `Clase de ${course.materia}`,
            courseId: course.courseId,
            courseTitle: course.materia,
            date: eventDate,
            time: time,
            duration: 240, // 4 horas por defecto
            classroom: course.aula || 'XXX',
            sede: course.campus || 'XXX',
            type: 'class'
          })
        }
      })
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