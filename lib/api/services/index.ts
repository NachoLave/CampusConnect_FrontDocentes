// Exportar todos los servicios
export { CoursesService } from './courses'
export { CalendarService } from './calendar'
export { WalletService } from './wallet'
export { DashboardService } from './dashboard'
export { NotificationsService } from './notifications'
export { StoreService } from './store'
export { CanteenService } from './canteen'
export { TeacherService } from './teacher'
export { SubjectsService } from './subjects'
export { authService } from './auth'

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
  LoadingState,
  AuthUser,
  LoginCredentials,
  AuthResponse,
  TeacherProfile,
  Proposal,
  CreateProposalRequest,
  AvailabilityBlock,
  UpdateAvailabilityRequest,
  Subject,
  StoreOrder,
  StoreOrderItem,
  StoreOrderSummary
} from '@/lib/types'
