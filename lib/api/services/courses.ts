import { Course, ApiResponse, PaginatedResponse, ExternalInscripcion, ExternalCursoDetalle, InscripcionesResponse, CursoDetalleResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG, USE_MOCK_DATA } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import { authService } from './auth'
import coursesData from '@/lib/data/courses.json'

// URL base de la API externa de cursos
const CURSOS_API_URL = 'https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api'

export class CoursesService {
  /**
   * Obtiene el UUID del docente autenticado
   */
  private static getTeacherUUID(): string | null {
    return authService.getTeacherUUID()
  }

  /**
   * Normaliza el periodo al formato del frontend
   * API: "1er Cuatrimestre 2025" → Frontend: "1er Cuatr. 2025"
   */
  private static normalizePeriodToFrontend(rawPeriod: string): string {
    if (!rawPeriod) return 'Todos'
    
    const yearMatch = rawPeriod.match(/\d{4}/)
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString()
    
    const lower = rawPeriod.toLowerCase()
    if (lower.includes('1er') || lower.includes('primer')) {
      return `1er Cuatr. ${year}`
    }
    if (lower.includes('2do') || lower.includes('segundo')) {
      return `2do Cuatr. ${year}`
    }
    if (lower.includes('q1')) {
      return `1er Cuatr. ${year}`
    }
    if (lower.includes('q2')) {
      return `2do Cuatr. ${year}`
    }
    
    return rawPeriod
  }

  /**
   * Obtiene todos los cursos del docente desde la API externa
   * Flujo:
   * 1. GET /api/inscripciones?user_uuid=UUID -> Obtiene inscripciones del docente
   * 2. Para cada curso, obtiene detalles de /api/cursos/:id
   * 3. Para cada curso, obtiene inscripciones de /api/inscripciones?uuid_curso=id para contar alumnos
   */
  static async getCourses(): Promise<ApiResponse<Course[]>> {
    const teacherUUID = this.getTeacherUUID()
    
    if (!teacherUUID) {
      console.error('❌ No hay docente autenticado')
      return {
        data: [],
        success: false,
        error: 'No hay docente autenticado'
      }
    }

    try {
      console.log(`📚 Obteniendo cursos del docente ${teacherUUID}...`)

      // Paso 1: Obtener inscripciones del docente
      const inscripciones = await this.getDocenteInscripciones(teacherUUID)
      
      if (!inscripciones || inscripciones.length === 0) {
        console.log('📚 No se encontraron cursos para este docente')
        return {
          data: [],
          success: true,
          message: 'No hay cursos asignados'
        }
      }

      console.log(`📚 Inscripciones encontradas: ${inscripciones.length}`)

      // Paso 2: Para cada inscripción, obtener detalles del curso y conteo de alumnos
      const cursosPromises = inscripciones.map(async (inscripcion) => {
        const cursoUUID = inscripcion.uuid_curso
        
        // Obtener detalles completos del curso
        const cursoDetalle = await this.getCursoDetalle(cursoUUID)
        
        // Obtener inscripciones del curso para contar alumnos y docentes
        const cursoInscripciones = await this.getCursoInscripciones(cursoUUID)
        
        // Convertir a formato Course del frontend
        return this.mapExternalToCourse(inscripcion, cursoDetalle, cursoInscripciones)
      })

      const cursos = await Promise.all(cursosPromises)
      
      console.log(`✅ Cursos obtenidos: ${cursos.length}`)
      
      return {
        data: cursos,
        success: true,
        message: 'Cursos obtenidos correctamente'
      }
    } catch (error) {
      console.error('❌ Error obteniendo cursos:', error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Obtiene las inscripciones del docente (cursos que dicta)
   * GET /api/inscripciones?user_uuid=UUID
   */
  private static async getDocenteInscripciones(teacherUUID: string): Promise<ExternalInscripcion[]> {
    try {
      console.log(`📋 Obteniendo inscripciones del docente ${teacherUUID}...`)
      
      const response = await fetch(`${CURSOS_API_URL}/inscripciones?user_uuid=${teacherUUID}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: InscripcionesResponse = await response.json()
      
      if (data.success && data.data) {
        console.log(`📋 Inscripciones obtenidas: ${data.data.length}`)
        return data.data
      }

      return []
    } catch (error) {
      console.error('❌ Error obteniendo inscripciones del docente:', error)
      return []
    }
  }

  /**
   * Obtiene los detalles completos de un curso
   * GET /api/cursos/:cursoId
   */
  private static async getCursoDetalle(cursoUUID: string): Promise<ExternalCursoDetalle | null> {
    try {
      const url = `${CURSOS_API_URL}/cursos/${cursoUUID}`
      console.log(`📖 Obteniendo detalle del curso ${cursoUUID}...`)
      console.log(`📖 URL: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      console.log(`📖 Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ HTTP error! status: ${response.status}, body: ${errorText}`)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CursoDetalleResponse = await response.json()
      console.log(`📖 Response data:`, data)
      
      if (data.success && data.data) {
        console.log(`✅ Detalle del curso obtenido: ${data.data.materia?.nombre || cursoUUID}`)
        return data.data
      }

      console.warn(`⚠️ Respuesta sin success o sin data:`, data)
      return null
    } catch (error) {
      console.error(`❌ Error obteniendo detalle del curso ${cursoUUID}:`, error)
      return null
    }
  }

  /**
   * Obtiene las inscripciones de un curso (para contar alumnos y docentes)
   * GET /api/inscripciones?uuid_curso=cursoId
   */
  private static async getCursoInscripciones(cursoUUID: string): Promise<ExternalInscripcion[]> {
    try {
      const response = await fetch(`${CURSOS_API_URL}/inscripciones?uuid_curso=${cursoUUID}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: InscripcionesResponse = await response.json()
      
      if (data.success && data.data) {
        return data.data
      }

      return []
    } catch (error) {
      console.error(`❌ Error obteniendo inscripciones del curso ${cursoUUID}:`, error)
      return []
    }
  }

  /**
   * Convierte datos de API externa a formato Course del frontend
   */
  private static mapExternalToCourse(
    inscripcion: ExternalInscripcion, 
    cursoDetalle: ExternalCursoDetalle | null,
    cursoInscripciones: ExternalInscripcion[]
  ): Course {
    const curso = cursoDetalle || inscripcion.curso
    
    // Contar alumnos (rol === 'ALUMNO')
    const alumnos = cursoInscripciones.filter(i => i.rol === 'ALUMNO')
    
    // Obtener docentes (rol === 'TITULAR' o 'AUXILIAR')
    const docentes = cursoInscripciones.filter(i => i.rol === 'TITULAR' || i.rol === 'AUXILIAR')
    
    // Mapear docentes al formato Teacher
    const teachers = docentes.map(d => ({
      id: 0,
      uuid: d.user.uuid,
      name: `${d.user.nombre} ${d.user.apellido}`.trim(),
      email: d.user.email,
      legajo: d.user.legajo,
      role: d.rol,
      avatar: '/placeholder-user.jpg'
    }))

    // Mapear turno
    const turnoMap: Record<string, string> = {
      'MAÑANA': 'TM',
      'MANANA': 'TM',
      'TARDE': 'TT',
      'NOCHE': 'TN'
    }
    const shift = turnoMap[curso.turno?.toUpperCase()] || 'TM'

    // Mapear horarios por turno
    const scheduleMap: Record<string, string> = {
      'MAÑANA': '8:00 - 12:00',
      'MANANA': '8:00 - 12:00',
      'TARDE': '14:00 - 18:00',
      'NOCHE': '18:00 - 22:00'
    }
    const schedule = scheduleMap[curso.turno?.toUpperCase()] || '8:00 - 12:00'

    // Mapear día
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
    const day = dayMap[curso.dia?.toUpperCase()] || 'Lunes'

    // Formatear fechas
    const formatDate = (isoDate: string) => {
      try {
        const date = new Date(isoDate)
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      } catch {
        return ''
      }
    }

    const desde = curso.desde ? formatDate(curso.desde) : ''
    const hasta = curso.hasta ? formatDate(curso.hasta) : ''
    const dates = desde && hasta ? `${desde} - ${hasta}` : undefined

    // Normalizar el periodo al formato del frontend
    // API: "1er Cuatrimestre 2025" → Frontend: "1er Cuatr. 2025"
    // API: "2do Cuatrimestre 2025" → Frontend: "2do Cuatr. 2025"
    const normalizePeriod = (rawPeriod: string): string => {
      if (!rawPeriod) return 'Todos'
      
      // Extraer el año
      const yearMatch = rawPeriod.match(/\d{4}/)
      const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString()
      
      // Detectar cuatrimestre
      const lower = rawPeriod.toLowerCase()
      if (lower.includes('1er') || lower.includes('primer')) {
        return `1er Cuatr. ${year}`
      }
      if (lower.includes('2do') || lower.includes('segundo')) {
        return `2do Cuatr. ${year}`
      }
      
      // Si tiene Q1 o Q2 (formato backend antiguo)
      if (lower.includes('q1')) {
        return `1er Cuatr. ${year}`
      }
      if (lower.includes('q2')) {
        return `2do Cuatr. ${year}`
      }
      
      // Fallback: devolver el periodo original
      return rawPeriod
    }

    const period = normalizePeriod(curso.periodo)

    return {
      id: 0, // Ya no usamos ID numérico
      uuid: curso.uuid,
      title: cursoDetalle?.materia?.nombre || 'Curso sin nombre',
      day,
      code: curso.comision,
      students: alumnos.length,
      teachers,
      shift,
      schedule,
      dates,
      period,
      location: curso.aula,
      sede: curso.sede,
      isVirtual: curso.modalidad?.toUpperCase() === 'VIRTUAL',
      image: '/images/course-background.png',
      modality: curso.modalidad,
      status: curso.estado,
      // Determinar si es promocionable basado en approval_method de la materia
      // "final" → requiere examen final (no promocionable)
      // "promocion" o cualquier otro → promocionable
      promocionable: cursoDetalle?.materia?.approval_method?.toLowerCase() !== 'final',
      // Campos adicionales
      subjectName: cursoDetalle?.materia?.nombre,
      subjectUuid: curso.uuid_materia,
      careerName: cursoDetalle?.carrera?.name,
      careerUuid: cursoDetalle?.carrera?.uuid,
      examen: curso.examen,
      cantidadMax: curso.cantidad_max,
      cantidadMin: curso.cantidad_min,
      desde: curso.desde,
      hasta: curso.hasta,
      teacherRole: inscripcion.rol,
      teacherInscriptionStatus: inscripcion.estado
    }
  }

  // Obtener todos los registros de asistencia del curso
  static async getAttendanceRecords(courseId: number | string): Promise<ApiResponse<any[]>> {
    try {
      // Asegurar headers requeridos por backend (docente mock, roles)
      try { apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES) } catch {}
      const endpoint = API_CONFIG.ENDPOINTS.ATTENDANCE_RECORDS(courseId)
      return await apiClient.get<any[]>(endpoint)
    } catch (err) {
      return { data: [] as any[], success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  // Obtener asistencia por fecha (YYYY-MM-DD)
  static async getAttendanceByDate(courseId: number | string, dateIso: string): Promise<ApiResponse<any>> {
    try {
      try { apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES) } catch {}
      const endpoint = API_CONFIG.ENDPOINTS.ATTENDANCE(courseId, dateIso)
      return await apiClient.get<any>(endpoint)
    } catch (err) {
      return { data: null as any, success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  // Guardar asistencia para una fecha específica (PUT)
  // NOTA: courseId puede ser UUID (string) o number. studentId siempre es UUID string.
  static async saveAttendanceByDate(courseId: number | string, dateIso: string, items: Array<{ studentId: string; status: string | null }>): Promise<ApiResponse<any>> {
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
  static async confirmAct(courseId: number | string): Promise<ApiResponse<any>> {
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

  // Obtener actas (acts) asociadas a un curso
  static async getActs(courseId: number | string): Promise<ApiResponse<any[]>> {
    try {
      try { apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES) } catch {}
      const endpoint = typeof API_CONFIG.ENDPOINTS.COURSE_ACTS === 'function'
        ? API_CONFIG.ENDPOINTS.COURSE_ACTS(courseId)
        : `/teaching/courses/${courseId}/acts`

      const resp = await apiClient.get<any[]>(endpoint)
      if (!resp || !resp.success) {
        return { data: [], success: false, error: resp?.error || 'Error obteniendo actas' }
      }

      const dataAny: any = resp.data
      const list = Array.isArray(dataAny?.value) ? dataAny.value : Array.isArray(dataAny) ? dataAny : []
      return { data: list, success: true, message: 'Actas obtenidas' }
    } catch (error) {
      return { data: [], success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  // Obtener listado de alumnos de un curso (roster)
  // Backend devuelve: { studentId (UUID string), studentName, status, legajo, email, dni, activo }
  static async getCourseRoster(courseId: number): Promise<ApiResponse<any[]>> {
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
  static async getCourseActsPreview(courseId: number | string): Promise<ApiResponse<any>> {
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

  // Obtener curso por ID o UUID
  static async getCourseById(idOrUuid: number | string): Promise<ApiResponse<Course>> {
    // Si es un UUID (string con guiones), usar API externa
    if (typeof idOrUuid === 'string' && idOrUuid.includes('-')) {
      return this.getCourseByUUID(idOrUuid)
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const course = coursesData.find(c => c.id === idOrUuid)
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

    return apiClient.get<Course>(API_CONFIG.ENDPOINTS.COURSE_DETAIL(idOrUuid as number))
  }

  /**
   * Obtiene un curso por UUID desde la API externa
   */
  static async getCourseByUUID(cursoUUID: string): Promise<ApiResponse<Course>> {
    try {
      console.log(`📖 Obteniendo curso por UUID ${cursoUUID}...`)
      
      // Obtener detalles del curso
      const cursoDetalle = await this.getCursoDetalle(cursoUUID)
      
      if (!cursoDetalle) {
        return {
          data: null as any,
          success: false,
          error: 'Curso no encontrado'
        }
      }

      // Obtener inscripciones del curso
      const cursoInscripciones = await this.getCursoInscripciones(cursoUUID)
      
      // Crear una inscripción dummy para mapear
      const dummyInscripcion: ExternalInscripcion = {
        uuid: '',
        uuid_curso: cursoUUID,
        user_uuid: '',
        estado: '',
        rol: '',
        razon: '',
        fecha_baja: null,
        created_at: '',
        updated_at: '',
        user: {} as any,
        curso: cursoDetalle as any
      }
      
      const course = this.mapExternalToCourse(dummyInscripcion, cursoDetalle, cursoInscripciones)
      
      return {
        data: course,
        success: true,
        message: 'Curso obtenido correctamente'
      }
    } catch (error) {
      console.error(`❌ Error obteniendo curso ${cursoUUID}:`, error)
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Obtiene participantes de un curso por UUID desde la API externa
   * Retorna el formato esperado por course-info.tsx: { teachers, students, course }
   */
  static async getCourseParticipantsByUUID(cursoUUID: string): Promise<ApiResponse<{ teachers: any[]; students: any[]; course?: any }>> {
    try {
      console.log(`📖 Obteniendo participantes del curso ${cursoUUID}...`)
      
      // Obtener detalles del curso y las inscripciones en paralelo
      const [cursoDetalle, inscripciones] = await Promise.all([
        this.getCursoDetalle(cursoUUID),
        this.getCursoInscripciones(cursoUUID)
      ])
      
      if (!cursoDetalle) {
        return {
          data: null as any,
          success: false,
          error: 'Curso no encontrado'
        }
      }

      // Separar inscripciones por rol
      const docentesInscripciones = inscripciones.filter(i => i.rol === 'TITULAR' || i.rol === 'AUXILIAR')
      const alumnosInscripciones = inscripciones.filter(i => i.rol === 'ALUMNO')

      // Mapear docentes
      const teachers = docentesInscripciones.map(d => ({
        id: d.user.uuid,
        uuid: d.user.uuid,
        teacherId: d.user.uuid,
        name: `${d.user.nombre} ${d.user.apellido}`.trim(),
        legajo: d.user.legajo || '',
        email: d.user.email || '',
        role: d.rol === 'TITULAR' ? 'Titular' : 'Auxiliar',
        dni: d.user.dni
      }))

      // Mapear alumnos
      const students = alumnosInscripciones.map(a => ({
        id: a.user.uuid,
        uuid: a.user.uuid,
        studentId: a.user.uuid,
        name: `${a.user.nombre} ${a.user.apellido}`.trim(),
        legajo: a.user.legajo || '',
        email: a.user.email || '',
        condition: a.estado?.toUpperCase() === 'CONFIRMADA' ? 'ACTIVA' : 'REGULAR',
        dni: a.user.dni,
        telefono: a.user.telefono_personal,
        carreraUuid: a.user.carrera_uuid,
        inscripcionEstado: a.estado,
        activo: a.user.status === 'activo'
      }))

      // Mapear turno
      const turnoMap: Record<string, string> = {
        'MAÑANA': 'TM',
        'MANANA': 'TM',
        'TARDE': 'TT',
        'NOCHE': 'TN'
      }
      const shift = turnoMap[cursoDetalle.turno?.toUpperCase()] || cursoDetalle.turno || 'TM'

      // Mapear horarios por turno
      const scheduleMap: Record<string, string> = {
        'MAÑANA': '8:00 - 12:00',
        'MANANA': '8:00 - 12:00',
        'TARDE': '14:00 - 18:00',
        'NOCHE': '18:00 - 22:00'
      }
      const schedule = scheduleMap[cursoDetalle.turno?.toUpperCase()] || '8:00 - 12:00'

      // Formatear fechas
      const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return ''
        try {
          const date = new Date(dateStr)
          return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        } catch { return '' }
      }

      const fechaInicio = formatDate(cursoDetalle.desde)
      const fechaFin = formatDate(cursoDetalle.hasta)
      const dates = fechaInicio && fechaFin ? `${fechaInicio} - ${fechaFin}` : ''

      // Construir objeto course con todos los datos
      const course = {
        id: 0,
        uuid: cursoDetalle.uuid,
        title: cursoDetalle.materia?.nombre || 'Curso sin nombre',
        code: cursoDetalle.comision || '',
        day: cursoDetalle.dia || '',
        diaSemana: cursoDetalle.dia || '',
        shift,
        turno: cursoDetalle.turno || '',
        schedule,
        horario: schedule,
        dates,
        fechaInicio,
        fechaFin,
        desde: cursoDetalle.desde,
        hasta: cursoDetalle.hasta,
        location: cursoDetalle.aula || '',
        aula: cursoDetalle.aula || '',
        sede: cursoDetalle.sede || '',
        isVirtual: cursoDetalle.modalidad?.toUpperCase() === 'VIRTUAL',
        modalidad: cursoDetalle.modalidad || 'PRESENCIAL',
        status: cursoDetalle.estado || 'activo',
        students: students.length,
        teachers,
        // Datos de la materia
        materia: cursoDetalle.materia?.nombre || '',
        materiaUuid: cursoDetalle.uuid_materia,
        materiaDescription: cursoDetalle.materia?.description || '',
        approvalMethod: cursoDetalle.materia?.approval_method || '',
        promocionable: cursoDetalle.materia?.approval_method?.toLowerCase() !== 'final',
        // Datos de la carrera
        carrera: cursoDetalle.carrera?.name || '',
        carreraUuid: cursoDetalle.carrera?.uuid || '',
        carreraDescription: cursoDetalle.carrera?.description || '',
        faculty: cursoDetalle.carrera?.faculty || '',
        // Otros datos del curso
        examen: cursoDetalle.examen || '',
        cantidadMax: cursoDetalle.cantidad_max || 0,
        cantidadMin: cursoDetalle.cantidad_min || 0,
        period: CoursesService.normalizePeriodToFrontend(cursoDetalle.periodo || '')
      }

      console.log(`✅ Participantes obtenidos: ${teachers.length} docentes, ${students.length} alumnos`)

      return {
        data: { teachers, students, course },
        success: true,
        message: 'Participantes obtenidos correctamente'
      }
    } catch (error) {
      console.error(`❌ Error obteniendo participantes del curso ${cursoUUID}:`, error)
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
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
      // Backend devuelve: { studentId (UUID string), studentName, status, legajo, email, dni, activo }
      const students = (Array.isArray(roster) ? roster : []).map((s: any) => ({
        id: s.studentId,           // Backend devuelve studentId como UUID string
        studentId: s.studentId,    // Mantener también como studentId
        name: s.studentName,       // Backend devuelve studentName
        legajo: s.legajo || '',
        email: s.email || '',
        condition: s.status || '', // Backend devuelve status (REGULAR, LIBRE, ACTIVA, BAJA)
        dni: s.dni,
        activo: s.activo
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
  static async getCourseGrades(courseId: number | string): Promise<ApiResponse<any[]>> {
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

  // Publicar calificaciones de una evaluación
  // POST /teaching/assessments/{assessmentId}:publish (sin body)
  // Responde con { assessmentId, publishedCount, publishedAt }
  // Si publishedCount > 0 y publishedAt no es null, hubo cambios y se publicaron
  // Si publishedCount === 0 y publishedAt === null, no hubo cambios y no se hizo nada en la BD
  // El backend guarda el ID del profesor (del header X-Teacher-Id) y la fecha de publicación
  static async publishGrades(assessmentId: number): Promise<ApiResponse<{
    assessmentId: number
    publishedCount: number
    publishedAt: string | null
  }>> {
    try {
      const endpoint = typeof API_CONFIG.ENDPOINTS.PUBLISH_GRADES === 'function'
        ? API_CONFIG.ENDPOINTS.PUBLISH_GRADES(assessmentId)
        : `/teaching/assessments/${assessmentId}:publish`

      // Solo usar X-Teacher-Id (el backend genera el evento automáticamente)
      // Limpiar otros headers y solo dejar X-Teacher-Id
      apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, '', '')
      

      // El endpoint usa POST sin body (el ID del profesor viene en el header X-Teacher-Id)
      // Enviar null para que no se incluya body en el request
      const resp = await apiClient.post<{
        assessmentId: number
        publishedCount: number
        publishedAt: string | null
      }>(endpoint, null as any)

      if (!resp || !resp.success) {
        console.error('[publishGrades] Error en la respuesta:', resp)
        return {
          data: null as any,
          success: false,
          error: resp?.error || 'Error publicando calificaciones'
        }
      }

      const publishData = resp.data
      
      // Verificar si hubo cambios publicados
      if (publishData && publishData.publishedCount > 0 && publishData.publishedAt) {
        return {
          data: publishData,
          success: true,
          message: `Se publicaron ${publishData.publishedCount} calificación(es) correctamente`
        }
      } else {
        // No hubo cambios, pero la operación fue exitosa
        return {
          data: publishData || {
            assessmentId,
            publishedCount: 0,
            publishedAt: null
          },
          success: true,
          message: 'No hay cambios en las calificaciones para publicar'
        }
      }
    } catch (error) {
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al publicar calificaciones'
      }
    }
  }

  // Guardar/actualizar calificaciones de un curso
  static async saveCourseGrades(courseId: number | string, assessments: any[]): Promise<ApiResponse<any>> {
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
        // Obtener desde GET /teaching/courses/{courseId}/assessments
        if (!Number.isFinite(aid)) {
          const matchingAssessment = existingAssessments.find((ea: any) => {
            const eaType = String(ea.type || ea.tipo || '').toUpperCase()
            const assType = String(ass.tipo || '').toUpperCase()
            return eaType === assType
          })
          
          if (matchingAssessment) {
            aid = Number(matchingAssessment.assessmentId || matchingAssessment.id)
          } else {
            console.warn(`[saveCourseGrades] No se encontró assessmentId para tipo ${ass.tipo} en las evaluaciones del curso`)
          }
        }
        
        // If assessmentId provided or found -> update grades via PUT to /teaching/assessments/{id}/grades
        // IMPORTANTE: Solo se envía UNA evaluación a la vez (una columna por PUT)
        if (Number.isFinite(aid)) {
          const endpoint = typeof API_CONFIG.ENDPOINTS.GRADES === 'function'
            ? API_CONFIG.ENDPOINTS.GRADES(aid)
            : `/teaching/assessments/${aid}/grades`

          // Body con solo esta evaluación (una columna)
          const body = { courseId, grades: gradesPayload }
          
          try {
            const resp = await apiClient.put<any>(endpoint, body)
            
            if (resp && resp.success) {
              // Guardar el assessmentId para poder publicarlo después
              results.push({ ...resp.data, assessmentId: aid, tipo: ass.tipo })
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

      // Retornar resultado final con los assessmentIds que se guardaron exitosamente
      // Esto permite que el componente sepa qué evaluaciones publicar
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
        // Todos exitosos - results contiene los assessmentIds guardados
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
  // Ahora usa la API externa y filtra por período si es necesario
  static async getCoursesByPeriod(term: string, includePrevious: boolean = false): Promise<ApiResponse<Course[]>> {
    // Usar la API externa para obtener todos los cursos del docente
    const result = await this.getCourses()
    
    if (!result.success || !result.data) {
      return result
    }

    let filteredCourses = result.data

    if (!includePrevious && term) {
      // Normalizar término para comparar
      const normalizedTerm = term.toLowerCase()
      
      filteredCourses = filteredCourses.filter(course => {
        const coursePeriod = (course.period || '').toLowerCase()
        return coursePeriod.includes(normalizedTerm) || 
               coursePeriod.includes(term)
      })
    }

    return {
      data: filteredCourses,
      success: true,
      message: 'Cursos del período obtenidos correctamente'
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
