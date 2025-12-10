// Tipos base
export interface Teacher {
  id: number
  uuid?: string          // UUID del docente (API externa)
  name: string
  avatar: string
  email?: string
  department?: string
  legajo?: string        // Legajo del docente
  role?: string          // Rol en el curso (TITULAR, AUXILIAR)
}

export interface Course {
  id: number
  uuid?: string          // UUID del curso (API externa)
  title: string
  day: string
  dayColor?: string
  code: string           // Comisión
  students: number
  teachers: Teacher[]
  shift: string // 'Mañana' | 'Tarde' | 'Noche'
  shiftColor?: string
  schedule: string
  dates?: string
  period: string
  location?: string       // Aula
  sede: string
  isVirtual?: boolean
  image?: string
  // Campos adicionales del backend
  modality?: string
  classroom?: string
  professor?: string
  credits?: number
  description?: string
  status?: string
  // Información automática agregada por el frontend
  horarioInicio?: string
  horarioFin?: string
  turnoAbreviacion?: string
  fechaInicio?: string
  fechaFin?: string
  // Campos de API externa de cursos
  subjectName?: string    // Nombre de la materia
  subjectUuid?: string    // UUID de la materia
  careerName?: string     // Nombre de la carrera
  careerUuid?: string     // UUID de la carrera
  examen?: string         // Tipo de examen
  cantidadMax?: number    // Cantidad máxima de alumnos
  cantidadMin?: number    // Cantidad mínima de alumnos
  desde?: string          // Fecha inicio ISO
  hasta?: string          // Fecha fin ISO
  teacherRole?: string    // Rol del docente en el curso (TITULAR/AUXILIAR)
  teacherInscriptionStatus?: string  // Estado de inscripción del docente
  promocionable?: boolean // Si el curso permite promoción directa (sin examen final)
}

// ============================================================================
// TIPOS PARA APIs EXTERNAS DE CURSOS E INSCRIPCIONES
// ============================================================================

// Usuario en API externa
export interface ExternalUser {
  uuid: string
  nombre: string
  apellido: string
  legajo: string
  dni: number
  email: string
  telefono_personal: string
  status: string
  rol: string   // DOCENTE, ALUMNO
  carrera_uuid: string | null
  fecha_alta: string
}

// Curso en API externa
export interface ExternalCurso {
  uuid: string
  uuid_materia: string
  examen: string
  comision: string
  modalidad: string       // PRESENCIAL, VIRTUAL
  sede: string
  aula: string
  periodo: string
  turno: string           // MAÑANA, TARDE, NOCHE
  estado: string          // activo, inactivo
  cantidad_max: number
  cantidad_min: number
  desde: string           // ISO date
  hasta: string           // ISO date
  created_at: string
  updated_at: string
  dia: string             // LUNES, MARTES, etc.
}

// Materia en detalle de curso
export interface ExternalMateria {
  uuid: string
  nombre: string
  uuid_carrera: string
  description: string
  approval_method: string
  is_elective: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Carrera en detalle de curso
export interface ExternalCarrera {
  uuid: string
  name: string
  description: string
  degree_title: string
  code: string
  faculty: string
  modality: string
  duration_hours: number
  duration_years: number
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Inscripción (desde /api/inscripciones)
export interface ExternalInscripcion {
  uuid: string
  uuid_curso: string
  user_uuid: string
  estado: string          // confirmada, pendiente
  rol: string             // TITULAR, AUXILIAR, ALUMNO
  razon: string
  fecha_baja: string | null
  created_at: string
  updated_at: string
  user: ExternalUser
  curso: ExternalCurso
}

// Respuesta paginada de inscripciones
export interface InscripcionesResponse {
  success: boolean
  data: ExternalInscripcion[]
  page: number
  limit: number
  count: number
  totalCount: number
  totalPages: number
}

// Detalle completo de un curso (desde /api/cursos/:id)
export interface ExternalCursoDetalle {
  uuid: string
  uuid_materia: string
  examen: string
  comision: string
  modalidad: string
  sede: string
  aula: string
  periodo: string
  turno: string
  estado: string
  cantidad_max: number
  cantidad_min: number
  desde: string
  hasta: string
  created_at: string
  updated_at: string
  dia: string
  materia: ExternalMateria
  carrera: ExternalCarrera
}

// Respuesta de detalle de curso
export interface CursoDetalleResponse {
  success: boolean
  data: ExternalCursoDetalle
}

export interface Event {
  time: string
  title: string
  type: 'class' | 'meeting' | 'exam'
}

export interface CalendarData {
  [date: number]: Event[]
}

export interface Transaction {
  id: number
  type: 'income' | 'expense'
  description: string
  date: string
  time: string
  amount: number
  icon: any // Lucide icon component
  iconColor: string
  iconBg: string
}

export interface WalletInfo {
  balance: number
  accountType: string
  accountNumber: string
  status: 'active' | 'inactive' | 'suspended'
  lastUpdated: string
  currency?: string // ARG, ARS, etc.
}

// Tipos para respuestas de API externa de billetera
export interface ExternalWallet {
  uuid: string
  user_uuid: string
  currency: string
  balance: string
  status: string
  last_activity_at: string | null
  created_at: string
  updated_at: string
}

export interface ExternalTransfer {
  uuid: string
  from_wallet_uuid: string
  to_wallet_uuid: string
  amount: string
  currency: string
  type: 'credit' | 'debit'
  status: string
  description: string
  metadata: any | null
  processed_at: string
  created_at: string
  updated_at: string
}

export interface CarouselImage {
  src: string
  alt: string
  title: string
  subtitle: string
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Tipos para filtros y búsquedas
export interface CourseFilters {
  searchTerm: string
  selectedSedes: string[]
  selectedDays: string[]
}

// Tipos para estados de carga
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Tipos para autenticación
export interface AuthUser {
  id: number
  name: string
  email: string
  avatar?: string
  roles: string[]
  department?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
  refreshToken?: string
}

// Tipo para perfil del docente (desde backend o JWT)
export interface TeacherProfile {
  teacherId: number
  email: string
  name: string
  activo: boolean
  role: string // TITULAR | ADJUNTO | JTP | AYUDANTE | ADMIN | DOCENTE
  legajo: string
  cantidadCursosDictados: number
  // Campos adicionales del JWT (Core)
  uuid?: string                    // UUID del docente (campo 'sub' del JWT)
  walletUUIDs?: string[]           // UUIDs de billeteras asociadas
  career?: {
    uuid: string
    name: string
  }
  subrol?: string | null
}

// Tipos para Propuestas de Materias
export interface Proposal {
  proposalId: number | string    // Puede ser número (legacy) o UUID (nuevo)
  subjectId: number | string     // Puede ser número (legacy) o UUID (nuevo)
  subjectName: string | null     // null para mostrar shimmer durante carga optimista
  status: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  createdAt: string
  decidedAt: string | null
  active: boolean
}

export interface CreateProposalRequest {
  subjectId: number | string     // UUID de la materia
}

// Tipos para Disponibilidad Horaria
export interface AvailabilityBlock {
  id?: string // UUID del bloque
  dayOfWeek: string // LUNES, MARTES, MIERCOLES, JUEVES, VIERNES
  shift: 'MANIANA' | 'MANANA' | 'TARDE' | 'NOCHE' // MANIANA es el correcto, MANANA por compatibilidad
  modality: 'PRESENCIAL' | 'VIRTUAL' | 'AMBAS'
  campuses: string[] // Array de strings: UUIDs de sedes (strings) o "VIR" para virtual. Todos los valores son strings, excepto "VIR" que es un caso especial
  // Campos enriquecidos desde API externa (para display)
  campusNames?: string[] // Nombres de las sedes para mostrar en UI
}

export interface CreateAvailabilityBlockRequest {
  dayOfWeek: string
  shift: 'MANIANA' | 'MANANA' | 'TARDE' | 'NOCHE' // MANIANA es el correcto, MANANA por compatibilidad
  modality: 'PRESENCIAL' | 'VIRTUAL' | 'AMBAS'
  campuses: string[] // Array de strings: UUIDs de sedes (strings) o "VIR" para virtual. Todos los valores son strings
}

export interface UpdateAvailabilityBlockRequest {
  modality?: 'PRESENCIAL' | 'VIRTUAL' | 'AMBAS'
  campuses: string[] // Array de strings: UUIDs de sedes (strings) o "VIR" para virtual. Todos los valores son strings
}

// Tipos para Sedes
export interface Campus {
  id: number
  code: string
  name: string
  active: boolean
  // Campos adicionales de API externa (Backoffice)
  uuid?: string        // UUID de la sede
  ubicacion?: string   // Dirección de la sede
}

// Tipos para Materias (Admin)
export interface Subject {
  subjectId: number
  subjectName: string
  careerId: number
  careerName: string
  careerCode: string
  // Campos adicionales para API externa
  uuid?: string              // UUID de la materia (API externa)
  description?: string       // Descripción de la materia
  careerUUID?: string        // UUID de la carrera
}

// Tipos para tienda (adaptados a microservicio)
export interface StoreOrderItem {
  id: number
  cantidad: number
  subtotal: number
  stock_id: number
  compra_id: number
  created_at: string
  Stock: {
    stock: number
    talle: string | null
    Color: {
      hexa: string
      nombre: string
    }
    Articulo: {
      Titulo: string
      descripcion: string
      Imagen: Array<{
        imagen: string
      }>
    }
  }
}

export interface StoreOrder {
  id: number
  usuario_id: string
  created_at: string
  total_compra: number
  Item_compra: StoreOrderItem[]
}

export interface StoreOrderSummary {
  totalOrders: number
  totalSpent: number
}

// Tipos para comedor
export interface CanteenReservation {
  id: string
  date: string // Fecha en formato ISO para formateo en el cliente
  type: string // Tipo de reserva (Almuerzo, Cena, Desayuno, Merienda)
  timeRange?: string // Horario formateado (HH:mm)
  cost: number // Costo de la reserva
  sede?: string // Nombre de la sede
  status: 'Finalizado' | 'Cancelado' | 'Pendiente' | 'Activa'
}
