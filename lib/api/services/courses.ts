import { Course, ApiResponse, PaginatedResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import coursesData from '@/lib/data/courses.json'

// Interfaz para la respuesta del backend
interface BackendCourse {
  courseId: number
  materia: string
  comision: string
  periodo: string
  modalidad: string
  campus: string
  aula: string
  diaSemana: string
  turno: string
  studentCount: number
  orDefault?: any
}

export class CoursesService {
  // Convertir curso del backend al formato del frontend
  private static convertBackendCourse(backendCourse: BackendCourse): Course {
    // Mapear turnos del backend a turnos del frontend
    const turnoMapping: { [key: string]: string } = {
      'MANIANA': 'Mañana',
      'TARDE': 'Tarde', 
      'NOCHE': 'Noche'
    }

    // Mapear modalidad
    const modalidadMapping: { [key: string]: string } = {
      'PRESENCIAL': 'Presencial',
      'VIRTUAL': 'Virtual',
      'HIBRIDA': 'Híbrida'
    }

    // Obtener horarios automáticos según el turno
    const getHorarios = (turno: string) => {
      switch (turno) {
        case 'MANIANA':
          return { inicio: '07:30', fin: '11:30', abreviacion: 'TM' }
        case 'TARDE':
          return { inicio: '13:30', fin: '17:30', abreviacion: 'TT' }
        case 'NOCHE':
          return { inicio: '18:30', fin: '22:30', abreviacion: 'TN' }
        default:
          return { inicio: 'XX:XX', fin: 'XX:XX', abreviacion: 'XX' }
      }
    }

    // Obtener fechas según el período
    const getFechasPeriodo = (periodo: string) => {
      switch (periodo) {
        case '2025Q1':
          return { inicio: '01/03/2025', fin: '31/07/2025' }
        case '2025Q2':
          return { inicio: '01/08/2025', fin: '23/12/2025' }
        default:
          return { inicio: 'XX/XX/XXXX', fin: 'XX/XX/XXXX' }
      }
    }

    const horarios = getHorarios(backendCourse.turno)
    const fechas = getFechasPeriodo(backendCourse.periodo)

    return {
      id: backendCourse.courseId,
      title: backendCourse.materia,
      code: `${backendCourse.materia.substring(0, 3).toUpperCase()}-${backendCourse.comision}`,
      sede: backendCourse.campus || 'XXX',
      day: backendCourse.diaSemana || 'XXX',
      shift: turnoMapping[backendCourse.turno] || 'XXX',
      period: this.convertPeriodToFrontend(backendCourse.periodo) || 'XXX',
      modality: modalidadMapping[backendCourse.modalidad] || 'XXX',
      classroom: backendCourse.aula || 'XXX',
      students: backendCourse.studentCount || 0,
      schedule: `${backendCourse.diaSemana || 'XXX'} - ${turnoMapping[backendCourse.turno] || 'XXX'}`,
      // Campos adicionales que podrían no estar disponibles
      professor: 'XXX', // No disponible en el backend
      credits: 0, // No disponible en el backend
      description: `Curso de ${backendCourse.materia} - Comisión ${backendCourse.comision}`,
      status: 'active', // Asumimos activo
      // Información automática agregada por el frontend
      horarioInicio: horarios.inicio,
      horarioFin: horarios.fin,
      turnoAbreviacion: horarios.abreviacion,
      fechaInicio: fechas.inicio,
      fechaFin: fechas.fin,
      // Campo requerido por CourseCard - usar datos del backend si están disponibles
      teachers: backendCourse.orDefault && Array.isArray(backendCourse.orDefault) 
        ? backendCourse.orDefault.map((teacher: any) => ({
            id: teacher.teacherId?.toString() || 'XXX',
            name: teacher.nombre || 'XXX',
            email: `${teacher.nombre?.toLowerCase().replace(/\s+/g, '.')}@campus.com` || 'docente@campus.com'
          }))
        : [
            {
              id: '1010',
              name: 'Docente Test',
              email: 'docente@campus.com'
            }
          ]
    }
  }

  // Convertir período del backend al formato del frontend
  private static convertPeriodToFrontend(backendPeriod: string): string {
    if (!backendPeriod) return 'XXX'
    
    // Backend: "2025Q1" -> Frontend: "1er Cuatr. 2025"
    // Backend: "2025Q2" -> Frontend: "2do Cuatr. 2025"
    const match = backendPeriod.match(/(\d{4})Q(\d)/)
    if (match) {
      const year = match[1]
      const quarter = match[2]
      if (quarter === '1') {
        return `1er Cuatr. ${year}`
      } else if (quarter === '2') {
        return `2do Cuatr. ${year}`
      }
    }
    
    return backendPeriod // Fallback al valor original
  }

  // Obtener cursos por período
  static async getCoursesByPeriod(term: string, includePrevious: boolean = false): Promise<ApiResponse<Course[]>> {
    console.log('🔍 CoursesService.getCoursesByPeriod() - USE_MOCK_DATA:', APP_CONFIG.USE_MOCK_DATA)
    console.log('📅 Período solicitado:', term, 'includePrevious:', includePrevious)
    
    if (APP_CONFIG.USE_MOCK_DATA) {
      console.log('📱 Usando datos mock para cursos')
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        data: coursesData as Course[],
        success: true,
        message: 'Cursos obtenidos correctamente'
      }
    }

    try {
      console.log('🌐 Intentando obtener cursos reales del backend...')
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MY_COURSES}?term=${term}&includePrevious=${includePrevious}`
      
      const headers = {
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }

      console.log(`📡 Llamando al backend real: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Cursos obtenidos del backend real:', data)
      console.log('📊 Resumen de cursos por período:', {
        total: data.length,
        porPeriodo: data.reduce((acc: any, course: BackendCourse) => {
          acc[course.periodo] = (acc[course.periodo] || 0) + 1
          return acc
        }, {}),
        term: term,
        includePrevious: includePrevious
      })
      
      // Convertir los cursos del backend al formato del frontend
      const convertedCourses = data.map((backendCourse: BackendCourse) => {
        const converted = this.convertBackendCourse(backendCourse)
        console.log('🔄 Converting course:', {
          backend: backendCourse.periodo,
          frontend: converted.period,
          title: converted.title,
          teachers: converted.teachers,
          orDefault: backendCourse.orDefault,
          horarios: {
            inicio: converted.horarioInicio,
            fin: converted.horarioFin,
            abreviacion: converted.turnoAbreviacion
          },
          fechas: {
            inicio: converted.fechaInicio,
            fin: converted.fechaFin
          }
        })
        return converted
      })
      
      return {
        data: convertedCourses,
        success: true,
        message: 'Cursos obtenidos del backend'
      }
    } catch (error) {
      console.error('❌ Error obteniendo cursos del backend:', error)
      
      // Fallback a datos mock en caso de error
      console.log('🔄 Usando cursos de fallback')
      return {
        data: coursesData as Course[],
        success: true,
        message: 'Cursos obtenidos (modo fallback)'
      }
    }
  }

  // Obtener todos los cursos (método legacy - usar getCoursesByPeriod)
  static async getCourses(): Promise<ApiResponse<Course[]>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      // Simulamos delay para hacer más realista
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        data: coursesData as Course[],
        success: true,
        message: 'Cursos obtenidos correctamente'
      }
    }

    // Por defecto, obtener cursos del período actual
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    
    let term = '2025Q2' // Por defecto
    if (month >= 3 && month <= 7) {
      term = `${year}Q1`
    } else if (month >= 8 && month <= 12) {
      term = `${year}Q2`
    }
    
    return this.getCoursesByPeriod(term, true)
  }

  // Obtener curso por ID con información detallada
  static async getCourseById(id: number): Promise<ApiResponse<Course>> {
    console.log('🔍 CoursesService.getCourseById() - USE_MOCK_DATA:', APP_CONFIG.USE_MOCK_DATA)
    
    if (APP_CONFIG.USE_MOCK_DATA) {
      console.log('📱 Usando datos mock para curso específico')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const course = coursesData.find(c => c.id === id)
      if (course) {
        return {
          data: course,
          success: true,
          message: 'Curso obtenido correctamente'
        }
      } else {
        return {
          data: null,
          success: false,
          error: 'Curso no encontrado'
        }
      }
    }

    try {
      console.log('🌐 Intentando obtener curso específico del backend...')
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COURSE_DETAIL(id)}`
      const headers = {
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
      
      console.log(`📡 Llamando al backend real: ${url}`)
      const response = await fetch(url, { method: 'GET', headers: headers })
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Curso específico obtenido del backend:', data)
      
      // Convertir el curso detallado del backend al formato del frontend
      const convertedCourse = this.convertBackendCourse(data)
      
      return {
        data: convertedCourse,
        success: true,
        message: 'Curso específico obtenido del backend'
      }
    } catch (error) {
      console.error('❌ Error obteniendo curso específico:', error)
      console.log('🔄 Usando curso de fallback')
      
      // Fallback a datos mock
      const course = coursesData.find(c => c.id === id)
      if (course) {
        return {
          data: course,
          success: true,
          message: 'Curso obtenido (modo fallback)'
        }
      } else {
        return {
          data: null,
          success: false,
          error: 'Curso no encontrado'
        }
      }
    }
  }

  // Obtener cursos con filtros
  static async getCoursesFiltered(filters: {
    searchTerm?: string
    sedes?: string[]
    days?: string[]
  }): Promise<ApiResponse<Course[]>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
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

  // Obtener sedes únicas de los cursos actuales
  static async getAvailableSedes(): Promise<ApiResponse<string[]>> {
    console.log('🔍 CoursesService.getAvailableSedes() - USE_MOCK_DATA:', APP_CONFIG.USE_MOCK_DATA)
    
    if (APP_CONFIG.USE_MOCK_DATA) {
      console.log('📱 Usando datos mock para sedes')
      await new Promise(resolve => setTimeout(resolve, 200))
      const sedes = [...new Set(coursesData.map(course => course.sede))].sort()
      return {
        data: sedes,
        success: true,
        message: 'Sedes obtenidas correctamente'
      }
    }

    try {
      console.log('🌐 Obteniendo sedes únicas del backend...')
      // Obtener todos los cursos para extraer sedes únicas
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MY_COURSES}?term=2025Q2&includePrevious=true`
      const headers = {
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
      
      const response = await fetch(url, { method: 'GET', headers: headers })
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Cursos obtenidos para extraer sedes:', data)
      
      // Extraer sedes únicas
      const sedes = [...new Set(data.map((course: BackendCourse) => course.campus).filter(Boolean))].sort()
      console.log('🏢 Sedes únicas encontradas:', sedes)
      
      return {
        data: sedes,
        success: true,
        message: 'Sedes obtenidas del backend'
      }
    } catch (error) {
      console.error('❌ Error obteniendo sedes:', error)
      console.log('🔄 Usando sedes de fallback')
      
      // Fallback a datos mock
      const sedes = [...new Set(coursesData.map(course => course.sede))].sort()
      return {
        data: sedes,
        success: true,
        message: 'Sedes obtenidas (modo fallback)'
      }
    }
  }

  // Obtener días únicos de los cursos actuales
  static async getAvailableDays(): Promise<ApiResponse<string[]>> {
    console.log('🔍 CoursesService.getAvailableDays() - USE_MOCK_DATA:', APP_CONFIG.USE_MOCK_DATA)
    
    if (APP_CONFIG.USE_MOCK_DATA) {
      console.log('📱 Usando datos mock para días')
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

    try {
      console.log('🌐 Obteniendo días únicos del backend...')
      // Obtener todos los cursos para extraer días únicos
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MY_COURSES}?term=2025Q2&includePrevious=true`
      const headers = {
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
      
      const response = await fetch(url, { method: 'GET', headers: headers })
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Cursos obtenidos para extraer días:', data)
      
      // Extraer días únicos y ordenarlos
      const dayOrder = {
        'LUNES': 1, 'MARTES': 2, 'MIÉRCOLES': 3, 'JUEVES': 4, 
        'VIERNES': 5, 'SÁBADO': 6, 'DOMINGO': 7
      }
      const days = [...new Set(data.map((course: BackendCourse) => course.diaSemana).filter(Boolean))]
        .sort((a, b) => dayOrder[a as keyof typeof dayOrder] - dayOrder[b as keyof typeof dayOrder])
      
      console.log('📅 Días únicos encontrados:', days)
      
      return {
        data: days,
        success: true,
        message: 'Días obtenidos del backend'
      }
    } catch (error) {
      console.error('❌ Error obteniendo días:', error)
      console.log('🔄 Usando días de fallback')
      
      // Fallback a datos mock
      const dayOrder = {
        'LUNES': 1, 'MARTES': 2, 'MIÉRCOLES': 3, 'JUEVES': 4, 
        'VIERNES': 5, 'SÁBADO': 6, 'DOMINGO': 7
      }
      const days = [...new Set(coursesData.map(course => course.day))]
        .sort((a, b) => dayOrder[a as keyof typeof dayOrder] - dayOrder[b as keyof typeof dayOrder])
      
      return {
        data: days,
        success: true,
        message: 'Días obtenidos (modo fallback)'
      }
    }
  }
}
