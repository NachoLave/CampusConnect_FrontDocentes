// Tipos base
export interface Teacher {
  id: number
  name: string
  avatar: string
  email?: string
  department?: string
}

export interface Course {
  id: number
  title: string
  day: string
  dayColor?: string
  code: string
  students: number
  teachers: Teacher[]
  shift: string // 'Mañana' | 'Tarde' | 'Noche'
  shiftColor?: string
  schedule: string
  dates?: string
  period: string
  location?: string
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

// Tipos para tienda
export interface StoreOrder {
  id: string
  orderNumber: string
  date: string
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'
  total: number
  items: StoreOrderItem[]
  paymentMethod: string
  deliveryAddress?: string
  notes?: string
}

export interface StoreOrderItem {
  id: string
  productId: string
  product?: string  // Nombre del producto desde el backend
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category: string
}

export interface StoreOrderSummary {
  totalOrders: number
  totalSpent: number
  pendingOrders: number
  deliveredOrders: number
}

// Tipos para comedor
export interface CanteenReservation {
  id: string
  date: string
  type: string // ALMUERZO | DESAYUNO | CENA | MERIENDA
  timeRange?: string
  sede?: string
  total?: number
  status: 'Finalizado' | 'Cancelado' | 'Pendiente'
}
