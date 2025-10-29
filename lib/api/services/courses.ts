import { Course, ApiResponse, PaginatedResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG, USE_MOCK_DATA } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import coursesData from '@/lib/data/courses.json'

export class CoursesService {
  // Obtener todos los cursos
  static async getCourses(): Promise<ApiResponse<Course[]>> {
    if (USE_MOCK_DATA) {
      // Simulamos delay para hacer más realista
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        data: coursesData as Course[],
        success: true,
        message: 'Cursos obtenidos correctamente'
      }
    }

    return apiClient.get<Course[]>(API_CONFIG.ENDPOINTS.COURSES)
  }

  // Obtener curso por ID
  static async getCourseById(id: number): Promise<ApiResponse<Course>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const course = coursesData.find(c => c.id === id)
      if (!course) {
        return {
          data: null as any,
          success: false,
          error: 'Curso no encontrado'
        }
      }
      return {
        data: course as Course,
        success: true,
        message: 'Curso obtenido correctamente'
      }
    }

    return apiClient.get<Course>(API_CONFIG.ENDPOINTS.COURSE_BY_ID(id))
  }

  // Obtener cursos con filtros
  static async getCoursesFiltered(filters: {
    searchTerm?: string
    sedes?: string[]
    days?: string[]
  }): Promise<ApiResponse<Course[]>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400))
      let filteredCourses = coursesData as Course[]

      // Aplicar filtros
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        filteredCourses = filteredCourses.filter(course =>
          course.title.toLowerCase().includes(searchLower) ||
          course.code.includes(filters.searchTerm!)
        )
      }

      if (filters.sedes && filters.sedes.length > 0) {
        filteredCourses = filteredCourses.filter(course =>
          filters.sedes!.includes(course.sede)
        )
      }

      if (filters.days && filters.days.length > 0) {
        filteredCourses = filteredCourses.filter(course =>
          filters.days!.includes(course.day)
        )
      }

      return {
        data: filteredCourses,
        success: true,
        message: 'Cursos filtrados obtenidos correctamente'
      }
    }

    // En producción, construir query params y hacer request real
    const queryParams = new URLSearchParams()
    if (filters.searchTerm) queryParams.append('search', filters.searchTerm)
    if (filters.sedes) filters.sedes.forEach(sede => queryParams.append('sede', sede))
    if (filters.days) filters.days.forEach(day => queryParams.append('day', day))

    const endpoint = `${API_CONFIG.ENDPOINTS.COURSES}?${queryParams.toString()}`
    return apiClient.get<Course[]>(endpoint)
  }

  // Obtener sedes únicas
  static async getAvailableSedes(): Promise<ApiResponse<string[]>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const sedes = [...new Set(coursesData.map(course => course.sede))].sort()
      return {
        data: sedes,
        success: true,
        message: 'Sedes obtenidas correctamente'
      }
    }

    return apiClient.get<string[]>(`${API_CONFIG.ENDPOINTS.COURSES}/sedes`)
  }

  // Obtener días únicos
  static async getAvailableDays(): Promise<ApiResponse<string[]>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const dayOrder = {
        'LUNES': 1, 'MARTES': 2, 'MIÉRCOLES': 3, 'JUEVES': 4, 
        'VIERNES': 5, 'SÁBADO': 6, 'DOMINGO': 7
      }
      const days = [...new Set(coursesData.map(course => course.day))]
        .sort((a, b) => dayOrder[a as keyof typeof dayOrder] - dayOrder[b as keyof typeof dayOrder])
      
      return {
        data: days,
        success: true,
        message: 'Días obtenidos correctamente'
      }
    }

    return apiClient.get<string[]>(`${API_CONFIG.ENDPOINTS.COURSES}/days`)
  }

  // Obtener cursos por período
  static async getCoursesByPeriod(term: string, includePrevious: boolean = false): Promise<ApiResponse<Course[]>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Filtrar cursos por período
      let filteredCourses = coursesData as Course[]
      
      if (!includePrevious) {
        // Convertir el término del backend al formato de los datos mock
        let mockTerm = term
        if (term.includes('Q1')) {
          const year = term.match(/\d{4}/)?.[0] || '2025'
          mockTerm = `1er Cuatr. ${year}`
        } else if (term.includes('Q2')) {
          const year = term.match(/\d{4}/)?.[0] || '2025'
          mockTerm = `2do Cuatr. ${year}`
        }
        
        // Solo cursos del período específico
        filteredCourses = filteredCourses.filter(course => course.period === mockTerm)
      } else {
        // Incluir cursos anteriores también
        const currentYear = new Date().getFullYear().toString()
        filteredCourses = filteredCourses.filter(course => {
          const courseYear = course.period.match(/\d{4}/)?.[0]
          return courseYear === currentYear || parseInt(courseYear || '0') < parseInt(currentYear)
        })
      }
      
      return {
        data: filteredCourses,
        success: true,
        message: 'Cursos del período obtenidos correctamente'
      }
    }

    // Producción: llamar al endpoint real de "mis cursos" y mapear la respuesta
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('term', term)
      queryParams.append('includePrevious', includePrevious ? 'true' : 'false')

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MY_COURSES}?${queryParams.toString()}`
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES
      }

      const response = await fetch(url, { method: 'GET', headers })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const backendCourses = await response.json()

      // Mapear cursos del backend al tipo Course del frontend
      const mapped: Course[] = (backendCourses || []).map((c: any) => mapBackendCourseToFrontend(c))

      return {
        data: mapped,
        success: true,
        message: 'Cursos del período obtenidos correctamente (backend)'
      }
    } catch (error) {
      return {
        data: [] as Course[],
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido obteniendo cursos del backend'
      }
    }
  }
}

// Helpers de mapeo
const dayMap: Record<string, string> = {
  'LUNES': 'Lunes',
  'MARTES': 'Martes',
  'MIERCOLES': 'Miércoles',
  'MIÉRCOLES': 'Miércoles',
  'JUEVES': 'Jueves',
  'VIERNES': 'Viernes',
  'SABADO': 'Sábado',
  'SÁBADO': 'Sábado',
  'DOMINGO': 'Domingo'
}

const shiftToAbbr: Record<string, string> = {
  'MANIANA': 'TM',
  'MAÑANA': 'TM',
  'TARDE': 'TT',
  'NOCHE': 'TN'
}

const shiftToSchedule: Record<string, string> = {
  'MANIANA': '8:00 - 12:00',
  'MAÑANA': '8:00 - 12:00',
  'TARDE': '14:00 - 18:00',
  'NOCHE': '18:00 - 22:00'
}

function convertTermToFrontendPeriod(term: string): string {
  const year = term.match(/\d{4}/)?.[0] || ''
  if (term.includes('Q1')) return `1er Cuatr. ${year}`
  if (term.includes('Q2')) return `2do Cuatr. ${year}`
  return term
}

function datesForTerm(term: string): string | undefined {
  const year = term.match(/\d{4}/)?.[0]
  if (!year) return undefined
  if (term.includes('Q1')) return `01/03/${year} - 31/07/${year}`
  if (term.includes('Q2')) return `01/08/${year} - 23/12/${year}`
  return undefined
}

function mapBackendCourseToFrontend(c: any): Course {
  const dayUpper = String(c.diaSemana || '').toUpperCase()
  const turnoUpper = String(c.turno || '').toUpperCase()
  const shiftAbbr = shiftToAbbr[turnoUpper] || 'TM'
  const schedule = shiftToSchedule[turnoUpper] || '8:00 - 12:00'
  const periodLabel = convertTermToFrontendPeriod(String(c.periodo || ''))

  return {
    id: Number(c.courseId) || 0,
    title: String(c.materia || 'Curso'),
    day: dayMap[dayUpper] || 'Lunes',
    code: String(c.comision || c.courseId || ''),
    students: Number(c.studentCount ?? 0),
    teachers: Array.isArray(c.orDefault)
      ? c.orDefault.map((t: any) => ({ id: Number(t.teacherId) || 0, name: String(t.nombre || ''), avatar: '/placeholder-user.jpg' }))
      : [],
    shift: shiftAbbr,
    schedule,
    dates: datesForTerm(String(c.periodo || '')),
    period: periodLabel,
    location: c.aula ? String(c.aula) : undefined,
    sede: String(c.campus || 'Virtual'),
    isVirtual: String(c.modalidad || '').toUpperCase() === 'VIRTUAL',
    image: '/images/course-background.png'
  }
}
