// Configuración de API
export const API_CONFIG = {
  // En desarrollo usamos datos mockeados, en producción la URL real del backend
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://modulodocentefinal-production.up.railway.app',
  ENDPOINTS: {
    // Autenticación
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    
    // Cursos del docente
    COURSES: '/teaching/courses',
    MY_COURSES: '/teaching/courses/mine',
    COURSE_DETAIL: (id: number) => `/teaching/courses/${id}`,
    COURSE_ROSTER: (id: number) => `/teaching/courses/${id}/roster`,
    
    // Asistencia
    ATTENDANCE: (courseId: number, date: string) => `/teaching/courses/${courseId}/attendance/${date}`,
    ATTENDANCE_RANGE: (courseId: number) => `/teaching/courses/${courseId}/attendance`,
    ATTENDANCE_RECORDS: (courseId: number) => `/teaching/courses/${courseId}/attendance/records`,
    
    // Evaluaciones y calificaciones
    ASSESSMENTS: (courseId: number) => `/teaching/courses/${courseId}/assessments`,
    GRADES: (assessmentId: number) => `/teaching/assessments/${assessmentId}/grades`,
    COURSE_GRADES: (courseId: number) => `/teaching/courses/${courseId}/grades`,
    PUBLISH_GRADES: (assessmentId: number) => `/teaching/assessments/${assessmentId}:publish`,
    
    // Perfil del docente
    TEACHER_PROFILE: '/teachers/me',
    TEACHER_COURSES: '/teachers/me/courses',
    TEACHER_AVAILABILITY: '/teachers/me/availability',
    TEACHER_PROPOSALS: '/teachers/me/proposals',
    TEACHER_CALENDAR: '/teachers/me/calendar',
    TEACHER_NOTIFICATIONS: '/teachers/me/notifications',
    
    // Cuenta y servicios
    ACCOUNT_BALANCE: '/teachers/me/account/balance',
    CANTEEN_RESERVATIONS: '/teachers/me/canteen/reservations',
    CANTEEN_EXPORT: '/teachers/me/canteen/reservations:export',
    STORE_ORDERS: '/teachers/me/store/orders',
    STORE_EXPORT: '/teachers/me/store/orders:export',
    
    // Actas
    COURSE_ACTS: (courseId: number) => `/teaching/courses/${courseId}/acts`,
    ACTS_PREVIEW: '/teaching/acts:preview',
    ACTS_CONFIRM: '/teaching/acts:confirm',
    
    // Admin - Materias
    ADMIN_SUBJECTS: '/admin/subjects',
    
    // Admin - Sedes
    ADMIN_CAMPUSES: '/admin/sedes'
  }
}

// Headers por defecto para las requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

// Configuración para desarrollo (mock)
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
export const USE_MOCK_DATA = false // Usar datos reales del backend
