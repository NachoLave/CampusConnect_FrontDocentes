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
   * Configura SOLO el header X-Teacher-Id con el UUID real del docente.
   * Para llamadas al backend de nuestro módulo (asistencia, calificaciones, actas).
   * NO envía X-Teacher-Roles ni Authorization.
   */
  private static setOnlyTeacherIdHeader(): void {
    const teacherUUID = this.getTeacherUUID()
    if (teacherUUID) {
      // Solo establecer X-Teacher-Id, sin roles ni authorization
      apiClient.setRealTeacherIdHeader(teacherUUID)
    } else {
      // No hay UUID disponible
    }
  }

  /**
   * Obtiene SOLO el header X-Teacher-Id para llamadas al backend propio.
   * NO incluye X-Teacher-Roles ni Authorization.
   */
  private static getOnlyTeacherIdHeaders(): Record<string, string> {
    const teacherUUID = this.getTeacherUUID()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    
    if (teacherUUID) {
      headers['X-Teacher-Id'] = teacherUUID
    } else {
      headers['X-Teacher-Id'] = APP_CONFIG.MOCK_TEACHER_ID
    }
    
    return headers
  }

  /**
   * Log detallado de una request que se va a enviar
   */
  private static logRequest(method: string, url: string, headers: Record<string, string>, body?: any): void {
    // Logs removidos
  }

  /**
   * Log detallado de una response recibida
   */
  private static logResponse(method: string, url: string, status: number, data: any, error?: string): void {
    // Logs removidos
  }

  /**
   * Normaliza el periodo al formato del frontend
   * API: "1er Cuatrimestre 2025" → Frontend: "1er Cuatr. 2025"
   * API: "2do Cuatrimestre 2025" → Frontend: "2do Cuatr. 2025"
   * API: "verano 2025" → Frontend: "Verano 2025"
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
    if (lower.includes('verano')) {
      return `Verano ${year}`
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
      return {
        data: [],
        success: false,
        error: 'No hay docente autenticado'
      }
    }

    try {
      // Paso 1: Obtener inscripciones del docente
      const inscripciones = await this.getDocenteInscripciones(teacherUUID)
      
      if (!inscripciones || inscripciones.length === 0) {
        return {
          data: [],
          success: true,
          message: 'No hay cursos asignados'
        }
      }

      // Paso 2: Para cada inscripción, obtener detalles del curso, conteo de alumnos y estado de acta
      const cursosPromises = inscripciones.map(async (inscripcion) => {
        const cursoUUID = inscripcion.uuid_curso
        
        // Obtener detalles completos del curso
        const cursoDetalle = await this.getCursoDetalle(cursoUUID)
        
        // Obtener inscripciones del curso para contar alumnos y docentes
        const cursoInscripciones = await this.getCursoInscripciones(cursoUUID)
        
        // Obtener estado de acta para este curso
        let hasActa = false
        try {
          const actsResp = await this.getActs(cursoUUID)
          if (actsResp && actsResp.success) {
            const acts = Array.isArray(actsResp.data) ? actsResp.data : []
            hasActa = acts.length > 0
          }
        } catch (err) {
          // Ignorar errores al obtener actas, no bloquear carga de cursos
        }
        
        // Convertir a formato Course del frontend
        const course = this.mapExternalToCourse(inscripcion, cursoDetalle, cursoInscripciones)
        
        // Agregar información de acta al curso
        if (hasActa) {
          course.status = 'ACTA_GENERADA'
        }
        
        return course
      })

      const cursos = await Promise.all(cursosPromises)
      
      return {
        data: cursos,
        success: true,
        message: 'Cursos obtenidos correctamente'
      }
    } catch (error) {
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
      // Obtener el JWT del servicio de autenticación
      const token = authService.getToken()
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      }
      
      // Agregar Bearer Token si está disponible
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${CURSOS_API_URL}/inscripciones?user_uuid=${teacherUUID}`, {
        method: 'GET',
        headers
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
      return []
    }
  }

  /**
   * Obtiene los detalles completos de un curso
   * GET /api/cursos/:cursoId
   */
  private static async getCursoDetalle(cursoUUID: string): Promise<ExternalCursoDetalle | null> {
    try {
      // Obtener el JWT del servicio de autenticación
      const token = authService.getToken()
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      }
      
      // Agregar Bearer Token si está disponible
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const url = `${CURSOS_API_URL}/cursos/${cursoUUID}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CursoDetalleResponse = await response.json()
      
      if (data.success && data.data) {
        return data.data
      }

      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Obtiene las inscripciones de un curso (para contar alumnos y docentes)
   * GET /api/inscripciones?uuid_curso=cursoId
   */
  private static async getCursoInscripciones(cursoUUID: string): Promise<ExternalInscripcion[]> {
    try {
      // Obtener el JWT del servicio de autenticación
      const token = authService.getToken()
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      }
      
      // Agregar Bearer Token si está disponible
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${CURSOS_API_URL}/inscripciones?uuid_curso=${cursoUUID}`, {
        method: 'GET',
        headers
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
    
    // Obtener docentes (rol === 'TITULAR', 'AUXILIAR' o 'DOCENTE')
    const docentes = cursoInscripciones.filter(i => i.rol === 'TITULAR' || i.rol === 'AUXILIAR' || i.rol === 'DOCENTE')
    
    // Mapear docentes al formato Teacher
    const teachers = docentes.map(d => {
      // Determinar el rol para mostrar
      let roleDisplay = 'Docente'
      if (d.rol === 'TITULAR') {
        roleDisplay = 'Titular'
      } else if (d.rol === 'AUXILIAR') {
        roleDisplay = 'Auxiliar'
      } else if (d.rol === 'DOCENTE') {
        // Si es DOCENTE, intentar determinar si es titular o auxiliar desde subrol
        const subrol = (d.user as any).subrol
        if (subrol) {
          const subrolUpper = String(subrol).toUpperCase()
          if (subrolUpper.includes('TITULAR')) {
            roleDisplay = 'Titular'
          } else if (subrolUpper.includes('AUXILIAR') || subrolUpper.includes('AUX')) {
            roleDisplay = 'Auxiliar'
          } else {
            roleDisplay = 'Docente'
          }
        } else {
          roleDisplay = 'Docente'
        }
      }
      
      return {
        id: 0,
        uuid: d.user.uuid,
        name: `${d.user.nombre} ${d.user.apellido}`.trim(),
        email: d.user.email,
        legajo: d.user.legajo,
        role: roleDisplay,
        avatar: '/placeholder-user.jpg'
      }
    })

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
    // API: "verano 2025" → Frontend: "Verano 2025"
    const normalizePeriod = (rawPeriod: string): string => {
      if (!rawPeriod) return 'Todos'
      
      // Extraer el año
      const yearMatch = rawPeriod.match(/\d{4}/)
      const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString()
      
      // Detectar cuatrimestre o verano
      const lower = rawPeriod.toLowerCase()
      if (lower.includes('1er') || lower.includes('primer')) {
        return `1er Cuatr. ${year}`
      }
      if (lower.includes('2do') || lower.includes('segundo')) {
        return `2do Cuatr. ${year}`
      }
      if (lower.includes('verano')) {
        return `Verano ${year}`
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
  // Solo envía header X-Teacher-Id con el UUID del docente
  // Usa proxy local para evitar problemas de CORS
  static async getAttendanceRecords(courseId: number | string): Promise<ApiResponse<any[]>> {
    const url = `/api/attendance/${courseId}/records`
    const headers = this.getOnlyTeacherIdHeaders()
    
    this.logRequest('GET', url, headers)
    
    try {
      const response = await fetch(url, { method: 'GET', headers })
      const text = await response.text()
      let data: any = null
      try { data = text ? JSON.parse(text) : null } catch { data = null }
      
      this.logResponse('GET', url, response.status, data, response.ok ? undefined : `HTTP ${response.status}`)
      
      if (response.ok) {
        const list = Array.isArray(data?.value) ? data.value : Array.isArray(data) ? data : []
        return { data: list, success: true, message: 'Registros de asistencia obtenidos' }
      }
      return { data: [], success: false, error: data?.message || `HTTP error ${response.status}` }
    } catch (err) {
      return { data: [], success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  // Obtener asistencia por fecha (YYYY-MM-DD)
  // Solo envía header X-Teacher-Id con el UUID del docente
  // Usa proxy local para evitar problemas de CORS
  static async getAttendanceByDate(courseId: number | string, dateIso: string): Promise<ApiResponse<any>> {
    const url = `/api/attendance/${courseId}/${dateIso}`
    const headers = this.getOnlyTeacherIdHeaders()
    
    this.logRequest('GET', url, headers)
    
    try {
      const response = await fetch(url, { method: 'GET', headers })
      const text = await response.text()
      let data: any = null
      try { data = text ? JSON.parse(text) : null } catch { data = null }
      
      this.logResponse('GET', url, response.status, data, response.ok ? undefined : `HTTP ${response.status}`)
      
      if (response.ok) {
        return { data, success: true, message: 'Asistencia obtenida' }
      }
      return { data: null, success: false, error: data?.message || `HTTP error ${response.status}` }
    } catch (err) {
      return { data: null, success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  // Guardar asistencia para una fecha específica (PUT)
  // Solo envía header X-Teacher-Id con el UUID del docente
  // NOTA: courseId puede ser UUID (string) o number. studentId siempre es UUID string.
  // Usa proxy local para evitar problemas de CORS
  static async saveAttendanceByDate(courseId: number | string, dateIso: string, items: Array<{ studentId: string; status: string | null }>): Promise<ApiResponse<any>> {
    const url = `/api/attendance/${courseId}/${dateIso}`
    const headers = this.getOnlyTeacherIdHeaders()
    const body = { items }
    
    this.logRequest('PUT', url, headers, body)
    
    try {
      const response = await fetch(url, { 
        method: 'PUT', 
        headers, 
        body: JSON.stringify(body) 
      })
      const text = await response.text()
      let data: any = null
      try { data = text ? JSON.parse(text) : null } catch { data = null }
      
      this.logResponse('PUT', url, response.status, data, response.ok ? undefined : `HTTP ${response.status}`)
      
      if (response.ok) {
        return { data, success: true, message: 'Asistencia guardada correctamente' }
      }
      return { data: null, success: false, error: data?.message || `HTTP error ${response.status}` }
    } catch (err) {
      return { data: null, success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  // Confirmar/Generar acta oficial para un curso
  // Solo envía header X-Teacher-Id con el UUID del docente
  static async confirmAct(courseId: number | string): Promise<ApiResponse<any>> {
    // Usar URL directa del backend sin proxy
    const teacherUUID = this.getTeacherUUID()
    const url = `${API_CONFIG.BASE_URL}/teaching/courses/${courseId}/acts:confirm`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    
    // Solo enviar X-Teacher-Id (sin Bearer token)
    if (teacherUUID) {
      headers['X-Teacher-Id'] = teacherUUID
    }
    
    const body = {}

    try {
      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
      const text = await response.text()
      let data: any = null
      try { data = text ? JSON.parse(text) : null } catch { data = null }

      if (response.ok) {
        return { data, success: true, message: 'Acta generada correctamente' }
      }

      // Handle specific 409 / ACTA_WINDOW_CLOSED case
      if (response.status === 409 && data) {
        return { data, success: false, error: data.message || 'Acta ya cerrada' }
      }

      return { data, success: false, error: data?.message || `HTTP error ${response.status}` }
    } catch (error) {
      return { data: null, success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  // Obtener actas (acts) asociadas a un curso
  // Usa URL directa del backend sin proxy
  static async getActs(courseId: number | string): Promise<ApiResponse<any[]>> {
    const teacherUUID = this.getTeacherUUID()
    const url = `${API_CONFIG.BASE_URL}/teaching/courses/${courseId}/acts`
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }
    
    // Solo enviar X-Teacher-Id (sin Bearer token)
    if (teacherUUID) {
      headers['X-Teacher-Id'] = teacherUUID
    }

    try {
      const response = await fetch(url, { method: 'GET', headers })
      const text = await response.text()
      let data: any = null
      try { data = text ? JSON.parse(text) : null } catch { data = null }

      if (response.ok) {
        const list = Array.isArray(data?.value) ? data.value : Array.isArray(data) ? data : []
        return { data: list, success: true, message: 'Actas obtenidas' }
      }
      return { data: [], success: false, error: data?.message || `HTTP error ${response.status}` }
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
  // Solo envía header X-Teacher-Id con el UUID del docente
  static async getCourseActsPreview(courseId: number | string): Promise<ApiResponse<any>> {
    // Usar proxy de Next.js para evitar CORS
    const teacherUUID = this.getTeacherUUID()
    const url = `/api/teaching/courses/${courseId}/acts/preview`
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(teacherUUID && { 'X-Teacher-Id': teacherUUID })
    }

    try {
      const response = await fetch(url, { method: 'GET', headers })
      const text = await response.text()
      let data: any = null
      try { data = text ? JSON.parse(text) : null } catch { data = null }

      if (response.ok) {
        return { data, success: true, message: 'Preview del acta obtenido correctamente' }
      }
      return { data: null, success: false, error: data?.message || `HTTP error ${response.status}` }
    } catch (error) {
      return { data: null, success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
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
      const docentesInscripciones = inscripciones.filter(i => i.rol === 'TITULAR' || i.rol === 'AUXILIAR' || i.rol === 'DOCENTE')
      const alumnosInscripciones = inscripciones.filter(i => i.rol === 'ALUMNO')

      // Mapear docentes
      const teachers = docentesInscripciones.map(d => {
        // Determinar el rol para mostrar
        let roleDisplay = 'Docente'
        if (d.rol === 'TITULAR') {
          roleDisplay = 'Titular'
        } else if (d.rol === 'AUXILIAR') {
          roleDisplay = 'Auxiliar'
        } else if (d.rol === 'DOCENTE') {
          // Si es DOCENTE, intentar determinar si es titular o auxiliar desde subrol
          const subrol = (d.user as any).subrol
          if (subrol) {
            const subrolUpper = String(subrol).toUpperCase()
            if (subrolUpper.includes('TITULAR')) {
              roleDisplay = 'Titular'
            } else if (subrolUpper.includes('AUXILIAR') || subrolUpper.includes('AUX')) {
              roleDisplay = 'Auxiliar'
            } else {
              roleDisplay = 'Docente'
            }
          } else {
            roleDisplay = 'Docente'
          }
        }
        
        return {
          id: d.user.uuid,
          uuid: d.user.uuid,
          teacherId: d.user.uuid,
          name: `${d.user.nombre} ${d.user.apellido}`.trim(),
          legajo: d.user.legajo || '',
          email: d.user.email || '',
          role: roleDisplay,
          dni: d.user.dni
        }
      })

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

      return {
        data: { teachers, students, course },
        success: true,
        message: 'Participantes obtenidos correctamente'
      }
    } catch (error) {
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
  // Solo envía header X-Teacher-Id con el UUID del docente
  static async getCourseGrades(courseId: number | string): Promise<ApiResponse<any[]>> {
    const headers = this.getOnlyTeacherIdHeaders()
    
    try {
      // Paso 1: Obtener la lista de evaluaciones del curso
      const assessmentsEndpoint = typeof API_CONFIG.ENDPOINTS.ASSESSMENTS === 'function'
        ? API_CONFIG.ENDPOINTS.ASSESSMENTS(courseId)
        : `/teaching/courses/${courseId}/assessments`
      
      // Usar proxy de Next.js para evitar CORS
      const teacherUUID = this.getTeacherUUID()
      const assessmentsUrl = `/api/teaching/courses/${courseId}/assessments`

      const assessmentsResponse = await fetch(assessmentsUrl, { 
        method: 'GET', 
        headers: {
          'Accept': 'application/json',
          ...(teacherUUID && { 'X-Teacher-Id': teacherUUID })
        }
      })
      const assessmentsText = await assessmentsResponse.text()
      let assessmentsData: any = null
      try { assessmentsData = assessmentsText ? JSON.parse(assessmentsText) : null } catch { assessmentsData = null }

      if (!assessmentsResponse.ok) {
        return { data: [], success: false, error: assessmentsData?.message || `Error obteniendo evaluaciones: HTTP ${assessmentsResponse.status}` }
      }

      const assessments = Array.isArray(assessmentsData?.value) ? assessmentsData.value : Array.isArray(assessmentsData) ? assessmentsData : []

      if (assessments.length === 0) {
        return { data: [], success: true, message: 'No hay evaluaciones para este curso' }
      }

      // Paso 2: Para cada evaluación, obtener sus notas
      const result: any[] = []
      
      for (const assessment of assessments) {
        const assessmentId = assessment.assessmentId || assessment.id
        if (!assessmentId) continue

        const gradesEndpoint = typeof API_CONFIG.ENDPOINTS.GRADES === 'function'
          ? API_CONFIG.ENDPOINTS.GRADES(assessmentId)
          : `/teaching/assessments/${assessmentId}/grades`
        
        const gradesUrl = `${API_CONFIG.BASE_URL}${gradesEndpoint}`

        try {
          const gradesResponse = await fetch(gradesUrl, { method: 'GET', headers })
          const gradesText = await gradesResponse.text()
          let gradesData: any = null
          try { gradesData = gradesText ? JSON.parse(gradesText) : null } catch { gradesData = null }

          if (gradesResponse.ok) {
            const grades = Array.isArray(gradesData?.value) ? gradesData.value : Array.isArray(gradesData) ? gradesData : []

            result.push({
              assessmentId: assessment.assessmentId || assessment.id,
              tipo: assessment.type || assessment.tipo,
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
          } else {
            result.push({
              assessmentId: assessment.assessmentId || assessment.id,
              tipo: assessment.type || assessment.tipo,
              fecha: assessment.date || assessment.fecha,
              courseId: assessment.courseId || courseId,
              grades: []
            })
          }
        } catch (gradeError) {
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
  // Solo envía header X-Teacher-Id con el UUID del docente
  static async publishGrades(assessmentId: number): Promise<ApiResponse<{
    assessmentId: number
    publishedCount: number
    publishedAt: string | null
  }>> {
    const endpoint = typeof API_CONFIG.ENDPOINTS.PUBLISH_GRADES === 'function'
      ? API_CONFIG.ENDPOINTS.PUBLISH_GRADES(assessmentId)
      : `/teaching/assessments/${assessmentId}:publish`

    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    const headers = this.getOnlyTeacherIdHeaders()

    try {
      const response = await fetch(url, { method: 'POST', headers })
      const text = await response.text()
      let data: any = null
      try { data = text ? JSON.parse(text) : null } catch { data = null }

      if (!response.ok) {
        return {
          data: null as any,
          success: false,
          error: data?.message || `Error publicando calificaciones: HTTP ${response.status}`
        }
      }

      const publishData = data
      
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
  // Solo envía header X-Teacher-Id con el UUID del docente
  static async saveCourseGrades(courseId: number | string, assessments: any[]): Promise<ApiResponse<any>> {
    const headers = this.getOnlyTeacherIdHeaders()
    
    try {
      // Paso 1: Obtener las evaluaciones existentes del curso
      // Usar proxy de Next.js para evitar CORS
      const teacherUUID = this.getTeacherUUID()
      const assessmentsUrl = `/api/teaching/courses/${courseId}/assessments`
      
      const assessmentHeaders: Record<string, string> = {
        'Accept': 'application/json'
      }
      if (teacherUUID) {
        assessmentHeaders['X-Teacher-Id'] = teacherUUID
      }
      
      const assessmentsResponse = await fetch(assessmentsUrl, { 
        method: 'GET', 
        headers: assessmentHeaders
      })
      const assessmentsText = await assessmentsResponse.text()
      let assessmentsData: any = null
      try { assessmentsData = assessmentsText ? JSON.parse(assessmentsText) : null } catch { assessmentsData = null }
      
      const existingAssessments = Array.isArray(assessmentsData?.value) 
        ? assessmentsData.value 
        : Array.isArray(assessmentsData) 
        ? assessmentsData 
        : []
      
      const results: any[] = []
      const errors: string[] = []

      for (const ass of assessments) {
        // Normalize grades array for sending - solo studentId y grade
        // IMPORTANTE: studentId es UUID (string), NO number
        const gradesPayload = Array.isArray(ass.grades)
          ? ass.grades.map((g: any) => {
              // studentId debe ser string (UUID), no number
              const studentId = g.studentId ? String(g.studentId) : null
              return {
                studentId,
                grade: g.grade === null ? null : String(g.grade)
              }
            })
          : []

        // Intentar obtener el assessmentId (puede ser string UUID o number)
        let aid: string | number | null = null
        
        // Si viene directamente en el payload, usarlo (puede ser string o number)
        if (ass.assessmentId !== null && ass.assessmentId !== undefined && ass.assessmentId !== '') {
          aid = ass.assessmentId
        }
        
        // Si no se encontró, buscar en las evaluaciones existentes por tipo
        if (!aid) {
          const matchingAssessment = existingAssessments.find((ea: any) => {
            const eaType = String(ea.type || ea.tipo || '').toUpperCase()
            const assType = String(ass.tipo || '').toUpperCase()
            return eaType === assType
          })
          
          if (matchingAssessment) {
            aid = matchingAssessment.assessmentId || matchingAssessment.id
          }
        }
        
        if (aid) {
          // El endpoint es PUT a /grades:publish con body completo
          // PUT /teaching/assessments/{assessmentId}/grades:publish
          const gradesEndpoint = typeof API_CONFIG.ENDPOINTS.GRADES === 'function'
            ? `${API_CONFIG.ENDPOINTS.GRADES(aid)}:publish`
            : `/teaching/assessments/${aid}/grades:publish`

          const gradesUrl = `${API_CONFIG.BASE_URL}${gradesEndpoint}`
          const body = { courseId, grades: gradesPayload }
          
          try {
            const gradesResponse = await fetch(gradesUrl, { 
              method: 'PUT', 
              headers, 
              body: JSON.stringify(body) 
            })
            const gradesText = await gradesResponse.text()
            let gradesData: any = null
            try { gradesData = gradesText ? JSON.parse(gradesText) : null } catch { gradesData = null }
            
            if (gradesResponse.ok) {
              results.push({ ...gradesData, assessmentId: aid, tipo: ass.tipo })
            } else {
              const errorMsg = `Error en ${ass.tipo}: ${gradesData?.message || `HTTP ${gradesResponse.status}`}`
              errors.push(errorMsg)
            }
          } catch (err) {
            const errorMsg = `Error en ${ass.tipo}: ${err instanceof Error ? err.message : 'Error desconocido'}`
            errors.push(errorMsg)
          }
        } else {
          const errorMsg = `No se encontró evaluación para ${ass.tipo}. Debe crear la evaluación primero.`
          errors.push(errorMsg)
        }
      }

      if (errors.length > 0 && results.length === 0) {
        return { 
          data: null as any, 
          success: false, 
          error: `Todas las evaluaciones fallaron:\n${errors.join('\n')}` 
        }
      } else if (errors.length > 0 && results.length > 0) {
        return { 
          data: results, 
          success: true, 
          message: `${results.length} evaluación(es) guardada(s). ${errors.length} error(es):\n${errors.join('\n')}` 
        }
      } else {
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
  const lower = term.toLowerCase()
  if (lower.includes('q1')) return `1er Cuatr. ${year}`
  if (lower.includes('q2')) return `2do Cuatr. ${year}`
  if (lower.includes('verano')) return `Verano ${year}`
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
