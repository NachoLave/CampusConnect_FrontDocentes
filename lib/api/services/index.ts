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
export { AdminService } from './admin'
export type { SedeExterna } from './admin'
export { authService, CORE_LOGIN_URL, getRedirectUrl } from './auth'
export type { JWTPayload } from './auth'

// ============================================================================
// HELPERS PARA AUTENTICACIÓN - Usar en lugar de APP_CONFIG.MOCK_TEACHER_ID
// ============================================================================

import { authService as auth } from './auth'
import { apiClient } from '@/lib/utils/api'
import { APP_CONFIG } from '@/lib/config/app'

/**
 * Obtiene el UUID del docente autenticado
 * - En modo JWT real: devuelve el 'sub' del token
 * - En modo mock: devuelve MOCK_TEACHER_ID
 * 
 * @returns UUID del docente o null si no está autenticado
 */
export function getTeacherUUID(): string | null {
  // Primero intentar desde apiClient (más rápido)
  const uuidFromClient = apiClient.getTeacherUUID()
  if (uuidFromClient) return uuidFromClient
  
  // Fallback a authService
  return auth.getTeacherUUID()
}

/**
 * Obtiene el email del docente autenticado
 */
export function getTeacherEmail(): string | null {
  return auth.getTeacherEmail()
}

/**
 * Obtiene el nombre del docente autenticado
 */
export function getTeacherName(): string | null {
  return auth.getTeacherName()
}

/**
 * Obtiene el rol del docente autenticado
 */
export function getTeacherRole(): string | null {
  return auth.getTeacherRole()
}

/**
 * Obtiene el UUID de la billetera del docente
 */
export function getWalletUUID(): string | null {
  return auth.getWalletUUID()
}

/**
 * Verifica si estamos usando autenticación real (JWT) o mock
 */
export function isUsingRealAuth(): boolean {
  return !APP_CONFIG.USE_MOCK_AUTH && apiClient.hasAuthToken()
}

/**
 * Obtiene los headers de autenticación actuales
 * Útil para debug y para pasar a fetch manuales
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  
  const currentHeaders = apiClient.getCurrentHeaders()
  
  if (currentHeaders.authorization) {
    headers['Authorization'] = currentHeaders.authorization
  }
  
  // En modo mock, agregar headers legacy
  if (APP_CONFIG.USE_MOCK_AUTH && currentHeaders.mockTeacherId) {
    headers['X-Teacher-Id'] = currentHeaders.mockTeacherId
    if (currentHeaders.mockRoles) {
      headers['X-Teacher-Roles'] = currentHeaders.mockRoles
    }
  }
  
  return headers
}

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
  StoreOrderSummary,
  Campus,
  // Tipos para APIs externas de cursos
  ExternalUser,
  ExternalCurso,
  ExternalMateria,
  ExternalCarrera,
  ExternalInscripcion,
  ExternalCursoDetalle,
  InscripcionesResponse,
  CursoDetalleResponse
} from '@/lib/types'
