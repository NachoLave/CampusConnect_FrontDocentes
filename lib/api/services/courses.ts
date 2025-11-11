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

  // Obtener todos los registros de asistencia del curso
  static async getAttendanceRecords(courseId: number): Promise<ApiResponse<any[]>> {
    try {
      // Asegurar headers requeridos por backend (docente mock, roles)
      try { apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES) } catch {}
      return await apiClient.get<any[]>(API_CONFIG.ENDPOINTS.ATTENDANCE_RECORDS(courseId))
    } catch (err) {
      return { data: [] as any[], success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  // Obtener asistencia por fecha (YYYY-MM-DD)
  static async getAttendanceByDate(courseId: number, dateIso: string): Promise<ApiResponse<any>> {
    try {
      try { apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES) } catch {}
      return await apiClient.get<any>(API_CONFIG.ENDPOINTS.ATTENDANCE(courseId, dateIso))
    } catch (err) {
      return { data: null as any, success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  // Guardar asistencia para una fecha específica (PUT)
  static async saveAttendanceByDate(courseId: number, dateIso: string, items: Array<{ studentId: number; status: string | null }>): Promise<ApiResponse<any>> {
    try {
      try { apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES) } catch {}
      const endpoint = API_CONFIG.ENDPOINTS.ATTENDANCE(courseId, dateIso)
      const body = { items }
      return await apiClient.put<any>(endpoint, body)
    } catch (err) {
      return { data: null as any, success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  // Confirmar/Generar acta oficial para un curso
  static async confirmAct(courseId: number): Promise<ApiResponse<any>> {
    try {
      // Build endpoint like /teaching/courses/{id}/acts:confirm
      const endpoint = typeof API_CONFIG.ENDPOINTS.COURSE_ACTS === 'function'
        ? `${API_CONFIG.ENDPOINTS.COURSE_ACTS(courseId)}:confirm`
        : `/teaching/courses/${courseId}/acts:confirm`

      const url = `${API_CONFIG.BASE_URL}${endpoint}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES
      }

      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify({}) })
      const text = await response.text()
      let parsed: any = null
      try { parsed = text ? JSON.parse(text) : null } catch (_) { parsed = null }

      if (response.ok) {
        return { data: parsed, success: true, message: 'Acta generada correctamente' }
      }

      // Handle specific 409 / ACTA_WINDOW_CLOSED case returning server message/code
      if (response.status === 409 && parsed) {
        return { data: parsed, success: false, error: parsed.message || 'Acta ya cerrada' }
      }

      return { data: parsed, success: false, error: parsed?.message || `HTTP error ${response.status}` }
    } catch (error) {
      return { data: null as any, success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  // Obtener listado de alumnos de un curso (roster)
  static async getCourseRoster(courseId: number): Promise<ApiResponse<any[]>> {
    // Prefer using the shared apiClient and configured endpoint
    try {
      const endpoint = typeof API_CONFIG.ENDPOINTS.COURSE_ROSTER === 'function'
        ? API_CONFIG.ENDPOINTS.COURSE_ROSTER(courseId)
        : `/teaching/courses/${courseId}/roster`

      const resp = await apiClient.get<any[]>(endpoint)
      if (!resp || !resp.success) {
        return { data: [], success: false, error: resp?.error || 'Error obteniendo roster' }
      }

      // Response may be { value: [...] } or array directly
  const dataAny: any = resp.data
  const list = Array.isArray(dataAny?.value) ? dataAny.value : Array.isArray(dataAny) ? dataAny : []
      return { data: list, success: true, message: 'Roster obtenido' }
    } catch (error) {
      return { data: [], success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  // Obtener preview del acta de un curso
  static async getCourseActsPreview(courseId: number): Promise<ApiResponse<any>> {
    try {
      try { apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES) } catch {}
      const endpoint = typeof API_CONFIG.ENDPOINTS.COURSE_ACTS_PREVIEW === 'function'
        ? API_CONFIG.ENDPOINTS.COURSE_ACTS_PREVIEW(courseId)
        : `/teaching/courses/${courseId}/acts:preview`
      
      console.log('[CoursesService] getCourseActsPreview - courseId:', courseId)
      console.log('[CoursesService] getCourseActsPreview - endpoint:', endpoint)
      console.log('[CoursesService] getCourseActsPreview - baseURL:', API_CONFIG.BASE_URL)
      
      const resp = await apiClient.get<any>(endpoint)
      console.log('[CoursesService] getCourseActsPreview - response:', resp)
      
      if (!resp || !resp.success) {
        console.warn('[CoursesService] getCourseActsPreview - failed:', resp?.error)
        return { data: null as any, success: false, error: resp?.error || 'Error obteniendo preview del acta' }
      }
      
      console.log('[CoursesService] getCourseActsPreview - success, data:', resp.data)
      return { data: resp.data, success: true, message: 'Preview del acta obtenido correctamente' }
    } catch (error) {
      console.error('[CoursesService] getCourseActsPreview - exception:', error)
      return { data: null as any, success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
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

    return apiClient.get<Course>(API_CONFIG.ENDPOINTS.COURSE_DETAIL(id))
  }

  // Obtener both teachers and students in one call (helpful convenience)
  static async getCourseParticipants(courseId: number): Promise<ApiResponse<{ teachers: any[]; students: any[]; course?: any }>> {
    try {
      const [courseResp, rosterResp] = await Promise.all([
        this.getCourseById(courseId),
        this.getCourseRoster(courseId),
      ])

      if (!courseResp.success) return { data: null as any, success: false, error: courseResp.error }
      if (!rosterResp.success) return { data: null as any, success: false, error: rosterResp.error }

      const backendCourse: any = courseResp.data
      const roster = rosterResp.data || []

      // Normalize teachers: support `teachers` or `titulares` + `auxiliares`
      let teachersFromBackend: any[] = []
      if (Array.isArray(backendCourse.teachers) && backendCourse.teachers.length > 0) {
        teachersFromBackend = backendCourse.teachers.map((t: any) => ({
          id: Number(t.id ?? t.teacherId ?? 0),
          name: t.name || t.fullName || '',
          email: t.email || '',
          legajo: t.legajo?.toString?.() || '',
          role: t.role || '',
        }))
      } else {
        const titulares = Array.isArray(backendCourse.titulares) ? backendCourse.titulares : []
        const auxiliares = Array.isArray(backendCourse.auxiliares) ? backendCourse.auxiliares : []
        const combined = [...titulares, ...auxiliares]
        teachersFromBackend = combined.map((t: any) => ({
          id: Number(t.teacherId ?? t.id ?? 0),
          name: t.name || t.fullName || '',
          email: t.email || '',
          legajo: t.legajo?.toString?.() || '',
          role: t.role || (titulares.includes(t) ? 'Titular' : 'Auxiliar'),
        }))
      }

      // Map roster to students shape
      const students = (Array.isArray(roster) ? roster : []).map((s: any, idx: number) => ({
        id: Number(s.studentId ?? s.id ?? idx + 1),
        name: s.studentName || s.name || s.fullName || 'Alumno',
        legajo: s.legajo?.toString?.() || '',
        email: s.email || '',
        condition: s.status || s.condition || '',
      }))

  return { data: { teachers: teachersFromBackend, students, course: backendCourse }, success: true, message: 'Participants obtained' }
    } catch (err) {
      return { data: null as any, success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
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

  // Obtener calificaciones de un curso (todas las evaluaciones y notas)
  static async getCourseGrades(courseId: number): Promise<ApiResponse<any[]>> {
    try {
      // Paso 1: Obtener la lista de evaluaciones del curso
      // GET /teaching/courses/{courseId}/assessments
      const assessmentsEndpoint = typeof API_CONFIG.ENDPOINTS.ASSESSMENTS === 'function'
        ? API_CONFIG.ENDPOINTS.ASSESSMENTS(courseId)
        : `/teaching/courses/${courseId}/assessments`

      const assessmentsResp = await apiClient.get<any[]>(assessmentsEndpoint)
      if (!assessmentsResp || !assessmentsResp.success) {
        return { data: [], success: false, error: assessmentsResp?.error || 'Error obteniendo evaluaciones' }
      }

      // Obtener el array de evaluaciones
      const assessmentsData: any = assessmentsResp.data
      const assessments = Array.isArray(assessmentsData?.value) ? assessmentsData.value : Array.isArray(assessmentsData) ? assessmentsData : []

      if (assessments.length === 0) {
        return { data: [], success: true, message: 'No hay evaluaciones para este curso' }
      }

      // Paso 2: Para cada evaluación, obtener sus notas
      // GET /teaching/assessments/{assessmentId}/grades
      const result: any[] = []
      
      for (const assessment of assessments) {
        const assessmentId = assessment.assessmentId || assessment.id
        if (!assessmentId) continue

        const gradesEndpoint = typeof API_CONFIG.ENDPOINTS.GRADES === 'function'
          ? API_CONFIG.ENDPOINTS.GRADES(assessmentId)
          : `/teaching/assessments/${assessmentId}/grades`

        try {
          const gradesResp = await apiClient.get<any[]>(gradesEndpoint)
          
          if (gradesResp && gradesResp.success) {
            const gradesData: any = gradesResp.data
            const grades = Array.isArray(gradesData?.value) ? gradesData.value : Array.isArray(gradesData) ? gradesData : []

            // Combinar la información de la evaluación con sus notas
            // El resultado debe tener el formato que espera el componente
            result.push({
              assessmentId: assessment.assessmentId || assessment.id,
              tipo: assessment.type || assessment.tipo, // PARCIAL_1, PARCIAL_2, RECUPERATORIO, FINAL
              fecha: assessment.date || assessment.fecha,
              courseId: assessment.courseId || courseId,
              grades: grades.map((g: any) => ({
                studentId: g.studentId,
                studentName: g.studentName,
                legajo: g.legajo,
                grade: g.grade,
                published: g.published !== undefined ? g.published : false,
                assessmentId: g.assessmentId || assessmentId,
                assessmentName: g.assessmentName || assessment.type || assessment.tipo,
                courseId: g.courseId || assessment.courseId || courseId
              }))
            })
          }
        } catch (gradeError) {
          console.warn(`Error obteniendo notas para evaluación ${assessmentId}:`, gradeError)
          // Continuar con las demás evaluaciones incluso si una falla
          result.push({
            assessmentId: assessment.assessmentId || assessment.id,
            tipo: assessment.type || assessment.tipo,
            fecha: assessment.date || assessment.fecha,
            courseId: assessment.courseId || courseId,
            grades: []
          })
        }
      }

      return { data: result, success: true, message: 'Calificaciones obtenidas correctamente' }
    } catch (error) {
      return { data: [], success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  // Guardar/actualizar calificaciones de un curso
  static async saveCourseGrades(courseId: number, assessments: any[]): Promise<ApiResponse<any>> {
    try {
      // Paso 1: Obtener las evaluaciones existentes del curso
      const assessmentsEndpoint = typeof API_CONFIG.ENDPOINTS.ASSESSMENTS === 'function'
        ? API_CONFIG.ENDPOINTS.ASSESSMENTS(courseId)
        : `/teaching/courses/${courseId}/assessments`
      
      const existingAssessmentsResp = await apiClient.get<any[]>(assessmentsEndpoint)
      const existingAssessmentsData: any = existingAssessmentsResp?.data || []
      const existingAssessments = Array.isArray(existingAssessmentsData?.value) 
        ? existingAssessmentsData.value 
        : Array.isArray(existingAssessmentsData) 
        ? existingAssessmentsData 
        : []
      
      const results: any[] = []
      const errors: string[] = []

      for (const ass of assessments) {
        // Normalize grades array for sending - solo studentId y grade
        const gradesPayload = Array.isArray(ass.grades)
          ? ass.grades.map((g: any) => ({ 
              studentId: Number(g.studentId), 
              grade: g.grade === null ? null : String(g.grade)
            }))
          : []

        // Intentar obtener el assessmentId: del parámetro o buscarlo en las evaluaciones existentes
        let aid = Number(ass.assessmentId || ass.assessmentId === 0 ? ass.assessmentId : NaN)
        
        // Si no tiene assessmentId, buscar en las evaluaciones existentes por tipo
        if (!Number.isFinite(aid)) {
          const matchingAssessment = existingAssessments.find((ea: any) => {
            const eaType = String(ea.type || ea.tipo || '').toUpperCase()
            const assType = String(ass.tipo || '').toUpperCase()
            return eaType === assType
          })
          
          if (matchingAssessment) {
            aid = Number(matchingAssessment.assessmentId || matchingAssessment.id)
          }
        }
        
        // If assessmentId provided or found -> update grades via PUT to /teaching/assessments/{id}/grades
        if (Number.isFinite(aid)) {
          const endpoint = typeof API_CONFIG.ENDPOINTS.GRADES === 'function'
            ? API_CONFIG.ENDPOINTS.GRADES(aid)
            : `/teaching/assessments/${aid}/grades`

          const body = { courseId, grades: gradesPayload }
          
          try {
            const resp = await apiClient.put<any>(endpoint, body)
            
            if (resp && resp.success) {
              results.push(resp.data)
            } else {
              const errorMsg = `Error en ${ass.tipo}: ${resp?.error || 'Error desconocido'}`
              errors.push(errorMsg)
            }
          } catch (err) {
            const errorMsg = `Error en ${ass.tipo}: ${err instanceof Error ? err.message : 'Error desconocido'}`
            errors.push(errorMsg)
          }
        } else {
          // No assessmentId -> evaluación no existe, registrar error
          const errorMsg = `No se encontró evaluación para ${ass.tipo}. Debe crear la evaluación primero.`
          errors.push(errorMsg)
        }
      }

      // Retornar resultado final
      if (errors.length > 0 && results.length === 0) {
        // Todos fallaron
        return { 
          data: null as any, 
          success: false, 
          error: `Todas las evaluaciones fallaron:\n${errors.join('\n')}` 
        }
      } else if (errors.length > 0 && results.length > 0) {
        // Algunos exitosos, algunos fallaron
        return { 
          data: results, 
          success: true, 
          message: `${results.length} evaluación(es) guardada(s). ${errors.length} error(es):\n${errors.join('\n')}` 
        }
      } else {
        // Todos exitosos
        return { 
          data: results, 
          success: true, 
          message: `${results.length} evaluación(es) guardada(s) correctamente` 
        }
      }
    } catch (error) {
      return { data: null as any, success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
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

export function mapBackendCourseToFrontend(c: any): Course {
  const dayUpper = String(c.diaSemana || '').toUpperCase()
  const turnoUpper = String(c.turno || '').toUpperCase()
  const shiftAbbr = shiftToAbbr[turnoUpper] || 'TM'
  const schedule = shiftToSchedule[turnoUpper] || '8:00 - 12:00'
  // Accept multiple field names for the term/period (term is used by backend sample)
  const rawTerm = String(c.periodo || c.term || c.termId || '')
  const periodLabel = convertTermToFrontendPeriod(rawTerm)

  return {
    id: Number(c.courseId ?? c.id ?? 0) || 0,
    // Title may be provided under several names
    title: String(c.subjectName || c.materia || c.nombre || c.title || c.name || 'Curso'),
    day: dayMap[dayUpper] || 'Lunes',
    code: String(c.comision || c.code || c.courseCode || c.courseId || ''),
    students: Number(c.studentCount ?? c.students ?? 0),
    // Normalize teachers: support titulares/auxiliares or orDefault
    teachers: ((): any[] => {
      if (Array.isArray(c.titulares) || Array.isArray(c.auxiliares)) {
        const titulares = Array.isArray(c.titulares) ? c.titulares : []
        const auxiliares = Array.isArray(c.auxiliares) ? c.auxiliares : []
        return [...titulares, ...auxiliares].map((t: any) => ({ id: Number(t.teacherId ?? t.id ?? 0), name: String(t.name || t.nombre || t.fullName || ''), avatar: '/placeholder-user.jpg' }))
      }
      if (Array.isArray(c.orDefault)) {
        return c.orDefault.map((t: any) => ({ id: Number(t.teacherId) || 0, name: String(t.nombre || t.name || ''), avatar: '/placeholder-user.jpg' }))
      }
      return []
    })(),
    shift: shiftAbbr,
    schedule,
    // Derive dates from term if backend returns a term like 2025Q2
    dates: datesForTerm(rawTerm),
    period: periodLabel,
    location: String(c.classroom ?? c.aula ?? c.location ?? '' ) || undefined,
    sede: String(c.campus ?? c.sede ?? 'Virtual'),
    isVirtual: String(c.modalidad || c.mode || '').toUpperCase() === 'VIRTUAL',
    image: '/images/course-background.png'
  }
}
