// Exportar todos los servicios
export { CoursesService } from './courses'
export { CalendarService } from './calendar'
export { WalletService } from './wallet'
export { DashboardService } from './dashboard'

// Re-exportar tipos para conveniencia
export type {
  Course,
  Teacher,
  Event,
  CalendarData,
  Transaction,
  WalletInfo,
  CarouselImage,
  ApiResponse,
  LoadingState
} from '@/lib/types'
