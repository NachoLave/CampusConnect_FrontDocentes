import { Course, ApiResponse } from '@/lib/types'
import { API_CONFIG } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import { authService } from './auth'
import { CoursesService } from './courses'

export interface CalendarEvent {
  id: string
  title: string
  courseId: number | string
  courseTitle: string
  courseUUID?: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  duration: number // minutos
  classroom: string
  sede: string
  type: 'class' | 'exam' | 'meeting' | 'event' | 'canteen'
}

// Interfaz para las clases individuales del endpoint de backoffice
export interface ClaseIndividual {
  id_clase: string
  id_curso: string
  titulo: string
  descripcion: string
  fecha_clase: string // YYYY-MM-DD
  tipo: 'regular' | 'parcial_1' | 'parcial_2' | 'recuperatorio' | 'final'
  estado: string
  observaciones: string
  status: boolean
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

// Interfaz extendida para incluir errores por tipo de evento
export interface CalendarEventsResponse extends ApiResponse<CalendarEvent[]> {
  errors?: {
    classes?: string
    canteen?: string
    events?: string
  }
}

export class CalendarService {
  // Obtener clases individuales de un curso desde el endpoint de backoffice (a través del proxy)
  private static async getClasesIndividuales(cursoUUID: string): Promise<ClaseIndividual[]> {
    try {
      // Obtener el token para enviarlo en el header
      const token = authService.getToken()
      
      // Usar el proxy de Next.js para evitar CORS y problemas de DNS
      const url = `/api/clases-individuales/curso/${cursoUUID}?skip=0&limit=100`
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      }
      
      // Agregar el token en el header si está disponible
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        console.warn(`Error obteniendo clases individuales para curso ${cursoUUID}: ${response.status}`)
        return []
      }

      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.warn(`Error obteniendo clases individuales para curso ${cursoUUID}:`, error)
      return []
    }
  }

  // Mapear tipo de clase a título para el calendario
  private static mapClaseTypeToTitle(tipo: string, cursoNombre: string): string {
    switch (tipo) {
      case 'regular':
        return `${cursoNombre} - Clase Regular`
      case 'parcial_1':
        return `${cursoNombre} - Primer Parcial`
      case 'parcial_2':
        return `${cursoNombre} - Segundo Parcial`
      case 'recuperatorio':
        return `${cursoNombre} - Recuperatorio`
      case 'final':
        return `${cursoNombre} - Examen Final`
      default:
        return `${cursoNombre} - Clase`
    }
  }

  // Determinar si un tipo de clase es examen o clase regular
  private static isExamType(tipo: string): boolean {
    return ['parcial_1', 'parcial_2', 'recuperatorio', 'final'].includes(tipo)
  }

  // Obtener eventos del calendario para una semana específica
  static async getWeeklyEvents(startDate: string, endDate: string): Promise<CalendarEventsResponse> {
    const errors: { classes?: string; canteen?: string; events?: string } = {}
    const allEvents: CalendarEvent[] = []
    
    // Usar proxy de Next.js para evitar CORS
    const teacherUUID = authService.getTeacherUUID()
    if (!teacherUUID) {
      return {
        data: [],
        success: false,
        message: 'No hay docente autenticado',
        errors: { classes: 'No hay docente autenticado', canteen: 'No hay docente autenticado', events: 'No hay docente autenticado' }
      }
    }
    
    // OPTIMIZACIÓN: Ejecutar las 3 fuentes principales en paralelo usando Promise.allSettled
    const token = authService.getToken()
    
    const [classesResult, canteenResult, eventsResult] = await Promise.allSettled([
      // 1. Obtener clases/exámenes
      (async () => {
        try {
          const coursesResponse = await CoursesService.getCourses()
          if (coursesResponse.success && coursesResponse.data) {
            const courses = coursesResponse.data
            const classEvents = await this.convertClasesIndividualesToEvents(courses, startDate, endDate)
            return { events: classEvents, error: null }
          } else {
            return { events: [], error: 'No se pudieron obtener los cursos del docente' }
          }
        } catch (error: any) {
          console.warn('Error obteniendo clases/exámenes:', error)
          return { events: [], error: error?.message || 'Error al cargar clases y exámenes' }
        }
      })(),
      
      // 2. Obtener reservas de comedor (con locations en paralelo)
      (async () => {
        try {
          if (!token) {
            return { events: [], error: 'No hay token de autenticación para obtener reservas de comedor' }
          }
          
          // Obtener reservas y locations en paralelo
          const [canteenResponse, locationsResponse] = await Promise.all([
            fetch(`/api/canteen/reservations`, { 
              method: 'GET', 
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }),
            fetch(`/api/canteen/locations`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            })
          ])
          
          if (canteenResponse.ok) {
            const canteenData = await canteenResponse.json()
            // Manejar el caso de que la respuesta pueda venir vacía
            if (Array.isArray(canteenData) && canteenData.length > 0) {
              // Crear mapa de locationId -> nombre de sede
              const locationsMap = new Map<number, string>()
              if (locationsResponse.ok) {
                try {
                  const locationsData = await locationsResponse.json()
                  if (Array.isArray(locationsData)) {
                    locationsData.forEach((location: any) => {
                      locationsMap.set(location.id, location.name)
                    })
                  }
                } catch (e) {
                  console.warn('Error parseando locations de comedor:', e)
                }
              }
              
              const canteenEvents = this.convertCanteenToEvents(canteenData, startDate, endDate, locationsMap)
              return { events: canteenEvents, error: null }
            }
            return { events: [], error: null }
          } else {
            return { events: [], error: `Error ${canteenResponse.status} al cargar reservas de comedor` }
          }
        } catch (err: any) {
          console.warn('Error obteniendo reservas de comedor:', err)
          return { events: [], error: err?.message || 'Error al cargar reservas de comedor' }
        }
      })(),
      
      // 3. Obtener eventos académicos (con timeout)
      (async () => {
        try {
          const eventEventsPromise = this.getEvents(startDate, endDate)
          const timeoutPromise = new Promise<CalendarEvent[]>((resolve) => {
            setTimeout(() => {
              console.warn('Timeout adicional en getEvents, retornando array vacío para no bloquear')
              resolve([])
            }, 9000) // 9 segundos máximo total (8s del fetch + 1s de margen)
          })
          
          const eventEvents = await Promise.race([eventEventsPromise, timeoutPromise])
          return { events: eventEvents, error: null }
        } catch (err: any) {
          console.warn('Error obteniendo eventos académicos:', err)
          return { events: [], error: err?.message || 'Error al cargar eventos académicos (puede ser timeout o error de conexión)' }
        }
      })()
    ])
    
    // Procesar resultados
    if (classesResult.status === 'fulfilled') {
      allEvents.push(...classesResult.value.events)
      if (classesResult.value.error) {
        errors.classes = classesResult.value.error
      }
    } else {
      errors.classes = 'Error inesperado al cargar clases y exámenes'
    }
    
    if (canteenResult.status === 'fulfilled') {
      allEvents.push(...canteenResult.value.events)
      if (canteenResult.value.error) {
        errors.canteen = canteenResult.value.error
      }
    } else {
      errors.canteen = 'Error inesperado al cargar reservas de comedor'
    }
    
    if (eventsResult.status === 'fulfilled') {
      allEvents.push(...eventsResult.value.events)
      if (eventsResult.value.error) {
        errors.events = eventsResult.value.error
      }
    } else {
      errors.events = 'Error inesperado al cargar eventos académicos'
    }

    // Retornar eventos cargados exitosamente, incluso si algunos tipos fallaron
    const hasErrors = Object.keys(errors).length > 0
    return {
      data: allEvents,
      success: true, // Siempre true si al menos algunos eventos se cargaron
      message: hasErrors 
        ? 'Algunos eventos no pudieron cargarse' 
        : 'Eventos del calendario obtenidos correctamente',
      errors: hasErrors ? errors : undefined
    }
  }

  // Obtener la próxima clase
  static async getNextClass(): Promise<ApiResponse<NextClass | null>> {
    try {
      // Obtener cursos del docente
      const coursesResponse = await CoursesService.getCourses()
      if (!coursesResponse.success || !coursesResponse.data) {
        return {
          data: null,
          success: false,
          error: 'No se pudieron obtener los cursos del docente'
        }
      }

      const courses = coursesResponse.data
      
      // Encontrar la próxima clase usando clases individuales
      const nextClass = await this.findNextClassFromClases(courses)
      
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

  // Mapear mealTime a formato legible
  private static mapMealTime(mealTime: string): string {
    const mealTimeMap: Record<string, string> = {
      'ALMUERZO': 'Almuerzo',
      'CENA': 'Cena',
      'DESAYUNO': 'Desayuno',
      'MERIENDA': 'Merienda'
    }
    return mealTimeMap[mealTime?.toUpperCase()] || mealTime || 'Reserva'
  }

  // Mapear estado a formato legible
  private static mapCanteenStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVA': 'Activa',
      'CONFIRMADA': 'Confirmada',
      'CANCELADA': 'Cancelada',
      'AUSENTE': 'Ausente'
    }
    return statusMap[status?.toUpperCase()] || status || 'Pendiente'
  }

  // Obtener eventos académicos desde el endpoint de eventos
  // Con timeout corto y manejo de errores independiente para no bloquear otros eventos
  private static async getEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      // Obtener el token del usuario autenticado
      const token = authService.getToken()
      if (!token) {
        console.warn('No hay token de autenticación para obtener eventos')
        return []
      }

      // Usar proxy de Next.js para evitar CORS
      const url = `/api/events?endDate=9999-12-02`
      
      // Timeout de 8 segundos para eventos (un poco más que el proxy de 7s para dar margen)
      // Si tarda más, cancelamos y retornamos array vacío para no bloquear
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 segundos timeout
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal // Agregar signal para poder cancelar
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.warn(`Error obteniendo eventos académicos: ${response.status}`)
          return []
        }

        const data = await response.json()
        return this.convertEventsToCalendarEvents(data, startDate, endDate)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        // Si es un abort (timeout), loguear específicamente
        if (fetchError.name === 'AbortError') {
          console.warn('Timeout obteniendo eventos académicos (más de 8 segundos)')
          return []
        }
        
        // Para otros errores, re-lanzar para que el catch externo lo maneje
        throw fetchError
      }
    } catch (error) {
      console.warn('Error obteniendo eventos académicos:', error)
      // Siempre retornar array vacío para no bloquear otros eventos
      return []
    }
  }

  // Convertir eventos académicos a eventos del calendario
  private static convertEventsToCalendarEvents(events: any[], startDate: string, endDate: string): CalendarEvent[] {
    const calendarEvents: CalendarEvent[] = []
    
    events.forEach((event: any) => {
      if (!event.startTime) return
      
      // Parsear fecha de inicio (ISO string)
      const startDateTime = new Date(event.startTime)
      const dateStr = startDateTime.toISOString().split('T')[0] // YYYY-MM-DD
      
      // Solo agregar si está en el rango solicitado
      if (dateStr >= startDate && dateStr <= endDate) {
        // Extraer hora de inicio
        const hours = startDateTime.getHours().toString().padStart(2, '0')
        const minutes = startDateTime.getMinutes().toString().padStart(2, '0')
        const time = `${hours}:${minutes}`
        
        // Calcular duración en minutos
        let duration = 60 // Por defecto 1 hora
        if (event.endTime) {
          const endDateTime = new Date(event.endTime)
          duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60))
        }
        
        // Construir ubicación completa: nombre + dirección
        const locationName = event.location?.name || ''
        const locationAddress = event.location?.address || ''
        const fullLocation = locationName && locationAddress 
          ? `${locationName}, ${locationAddress}`
          : locationName || locationAddress || ''
        
        calendarEvents.push({
          id: `event-${event.id}`,
          title: event.name || 'Evento',
          courseId: 0,
          courseTitle: event.name || 'Evento',
          date: dateStr,
          time: time,
          duration: duration,
          classroom: fullLocation,
          sede: '', // No hay información de sede en eventos
          type: 'event'
        })
      }
    })
    
    return calendarEvents
  }

  // Convertir reservas de comedor a eventos del calendario
  private static convertCanteenToEvents(reservations: any[], startDate: string, endDate: string, locationsMap?: Map<number, string>): CalendarEvent[] {
    const events: CalendarEvent[] = []
    
    reservations.forEach((reservation: any) => {
      // reservationDate viene en formato ISO: "2025-12-10T12:00:00"
      const reservationDate = reservation.reservationDate
      if (!reservationDate) return
      
      // Extraer la fecha directamente del string ISO para evitar problemas de zona horaria
      // Formato: "2025-12-10T12:00:00" -> "2025-12-10"
      const dateStr = reservationDate.split('T')[0]
      
      // Usar slotStartTime y slotEndTime si están disponibles, sino extraer de reservationDate
      let time = ''
      let duration = 60 // 1 hora por defecto
      
      if (reservation.slotStartTime && reservation.slotEndTime) {
        // Formato: "12:00:00" -> "12:00"
        time = reservation.slotStartTime.slice(0, 5)
        const startTime = reservation.slotStartTime.split(':').map(Number)
        const endTime = reservation.slotEndTime.split(':').map(Number)
        const startMinutes = startTime[0] * 60 + startTime[1]
        const endMinutes = endTime[0] * 60 + endTime[1]
        duration = endMinutes - startMinutes
      } else {
        // Fallback: extraer hora directamente del string ISO
        // Formato: "2025-12-10T12:00:00" -> "12:00"
        const timeMatch = reservationDate.match(/T(\d{2}:\d{2})/)
        time = timeMatch ? timeMatch[1] : '12:00'
      }
      
      // Solo agregar si está en el rango solicitado
      if (dateStr >= startDate && dateStr <= endDate) {
        const mealTime = this.mapMealTime(reservation.mealTime || '')
        
        // Obtener nombre de la sede desde el mapa de locations
        const locationId = reservation.locationId
        const sedeName = (locationsMap && locationId) ? locationsMap.get(locationId) || '' : ''
        
        // Título simplificado: solo el tipo de comida (el contexto visual ya indica que es comedor)
        const title = `Comedor - ${mealTime}`
        
        events.push({
          id: `canteen-${reservation.id}`,
          title: title,
          courseId: 0,
          courseTitle: mealTime, // Solo el tipo de comida para courseTitle
          date: dateStr,
          time: time,
          duration: duration,
          classroom: '', // Dejar vacío para comedor, solo usar sede
          sede: sedeName || '', // Nombre de la sede
          type: 'canteen'
        })
      }
    })
    
    return events
  }

  // Convertir clases individuales a eventos del calendario
  private static async convertClasesIndividualesToEvents(courses: Course[], startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = []

    // Procesar todos los cursos en paralelo
    await Promise.all(courses.map(async (course) => {
      try {
        // Obtener UUID del curso
        const cursoUUID = course.uuid
        if (!cursoUUID) {
          console.warn(`Curso sin UUID: ${course.title}`)
          return
        }

        // Obtener clases individuales del curso
        const clases = await this.getClasesIndividuales(cursoUUID)

        // Convertir cada clase a un evento del calendario
        clases.forEach((clase) => {
          const fechaClase = clase.fecha_clase
          
          // Solo incluir si está en el rango de fechas solicitado
          if (fechaClase >= startDate && fechaClase <= endDate) {
            const isExam = this.isExamType(clase.tipo)
            const title = this.mapClaseTypeToTitle(clase.tipo, course.title)
            
            // Obtener hora del curso (usar el turno del curso)
            const time = this.getTimeFromCourse(course)
            
            events.push({
              id: `clase-${clase.id_clase}`,
              title,
              courseId: course.id || 0,
              courseUUID: cursoUUID,
              courseTitle: course.title,
              date: fechaClase,
              time: time,
              duration: 240, // 4 horas por defecto
              classroom: course.location || '',
              sede: course.sede || '',
              type: isExam ? 'exam' : 'class'
            })
          }
        })
      } catch (err) {
        console.warn(`Error procesando curso ${course.title} para eventos del calendario:`, err)
      }
    }))

    return events.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}:00`)
      const dateB = new Date(`${b.date}T${b.time}:00`)
      return dateA.getTime() - dateB.getTime()
    })
  }

  // Obtener hora del curso basado en su turno
  private static getTimeFromCourse(course: Course): string {
    // Si el curso tiene un schedule, extraer la hora de inicio
    if (course.schedule) {
      const match = course.schedule.match(/(\d{1,2}):(\d{2})/)
      if (match) {
        return `${match[1].padStart(2, '0')}:${match[2]}`
      }
    }

    // Fallback: usar el turno
    const shift = course.shift?.toUpperCase() || ''
    return this.getTimeFromShift(shift)
  }

  // Encontrar la próxima clase usando clases individuales
  private static async findNextClassFromClases(courses: Course[]): Promise<NextClass | null> {
    const now = new Date() // Usar fecha y hora actual completa
    
    const upcomingClasses: NextClass[] = []

    // Procesar todos los cursos en paralelo
    await Promise.all(courses.map(async (course) => {
      try {
        const cursoUUID = course.uuid
        if (!cursoUUID) return

        // Obtener clases individuales del curso
        const clases = await this.getClasesIndividuales(cursoUUID)

        // Filtrar TODAS las clases (regulares y exámenes) que estén programadas y sean futuras
        clases
          .filter(clase => clase.estado === 'programada')
          .forEach((clase) => {
            const time = this.getTimeFromCourse(course)
            
            // Crear fecha y hora completa de la clase
            const classDateTime = new Date(`${clase.fecha_clase}T${time}:00`)
            
            // Solo incluir clases que aún no han pasado (fecha y hora futuras)
            if (classDateTime > now) {
              // Calcular días hasta la clase
              const diffTime = classDateTime.getTime() - now.getTime()
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
              
              // Si es hoy pero aún no pasó la hora, daysUntil = 0
              // Si es mañana, daysUntil = 1, etc.
              const daysUntil = diffDays

              // Generar título según el tipo de clase
              const title = this.mapClaseTypeToTitle(clase.tipo, course.title)

              upcomingClasses.push({
                id: `clase-${clase.id_clase}`,
                title: title,
                courseTitle: course.title,
                date: clase.fecha_clase,
                time: time,
                classroom: course.location || '',
                sede: course.sede || '',
                daysUntil: daysUntil
              })
            }
          })
      } catch (err) {
        console.warn(`Error obteniendo próxima clase para curso ${course.title}:`, err)
      }
    }))

    // Ordenar por fecha y tiempo, y tomar la más cercana
    upcomingClasses.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}:00`)
      const dateB = new Date(`${b.date}T${b.time}:00`)
      return dateA.getTime() - dateB.getTime()
    })

    if (upcomingClasses.length > 0) {
      const next = upcomingClasses[0]
      console.log('Próxima clase encontrada:', {
        title: next.title,
        courseTitle: next.courseTitle,
        date: next.date,
        time: next.time,
        daysUntil: next.daysUntil,
        classroom: next.classroom,
        sede: next.sede
      })
      return next
    }

    console.log('No se encontraron clases próximas')
    return null
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