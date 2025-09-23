import { Course, ApiResponse, PaginatedResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG, USE_MOCK_DATA } from '@/lib/config/api'
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
}
