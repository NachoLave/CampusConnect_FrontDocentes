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
  dayColor: string
  code: string
  students: number
  teachers: Teacher[]
  shift: 'TM' | 'TT' | 'TN'
  shiftColor: string
  schedule: string
  dates: string
  period: string
  location: string
  sede: string
  isVirtual: boolean
  image: string
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
