import { ApiResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'

export interface Notification {
  id: string
  type: "rejection" | "approval" | "assignment" | "event"
  title: string
  message: string
  time?: string
  actionText?: string
  link?: string | null
  isRead?: boolean
}

// Interfaz para la respuesta del backend
interface BackendNotification {
  notificationId: number
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

export class NotificationsService {
  // Convertir notificación del backend al formato del frontend
  private static convertBackendNotification(backendNotif: BackendNotification): Notification {
    // Determinar el tipo basado en el título o mensaje
    let type: "rejection" | "approval" | "assignment" | "event" = "event"
    
    const titleLower = backendNotif.title.toLowerCase()
    const messageLower = backendNotif.message.toLowerCase()
    
    if (titleLower.includes("rechazado") || messageLower.includes("rechazado")) {
      type = "rejection"
    } else if (titleLower.includes("aprobado") || messageLower.includes("aprobado")) {
      type = "approval"
    } else if (titleLower.includes("asignado") || messageLower.includes("asignado")) {
      type = "assignment"
    }

    // Formatear la fecha
    const createdAt = new Date(backendNotif.createdAt)
    const time = createdAt.toLocaleDateString("es-AR", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })

    return {
      id: backendNotif.notificationId.toString(),
      type,
      title: backendNotif.title,
      message: backendNotif.message,
      time,
      actionText: backendNotif.link ? "Ver más" : undefined,
      link: backendNotif.link,
      isRead: backendNotif.read
    }
  }

  // Obtener notificaciones del docente
  static async getNotifications(): Promise<ApiResponse<Notification[]>> {
    console.log('NotificationsService.getNotifications() - USE_MOCK_DATA:', APP_CONFIG.USE_MOCK_DATA)
    
    if (APP_CONFIG.USE_MOCK_DATA) {
      console.log('Usando datos mock para notificaciones')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "rejection",
          title: "Actualización del estado de materia",
          message: "Te han RECHAZADO para dar CALIDAD",
          isRead: false,
        },
        {
          id: "2",
          type: "approval",
          title: "Actualización del estado de materia",
          message: "Te han APROBADO para dar PROGRAMACIÓN I",
          isRead: false,
        },
        {
          id: "3",
          type: "assignment",
          title: "Nueva asignación",
          message: "Se te ha asignado la materia ALGORITMOS Y ESTRUCTURAS DE DATOS",
          isRead: true,
        },
        {
          id: "4",
          type: "event",
          title: "Recordatorio de clase",
          message: "Tienes una clase de PROGRAMACIÓN I en 30 minutos",
          isRead: false,
        }
      ]

      return {
        data: mockNotifications,
        success: true,
        message: 'Notificaciones obtenidas correctamente'
      }
    }

    try {
      console.log('Intentando obtener notificaciones reales del backend...')
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TEACHER_NOTIFICATIONS}`
      
      const headers = {
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }

      console.log(`Llamando al backend real: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const data = await response.json()
      console.log('Notificaciones obtenidas del backend real:', data)
      
      // Convertir las notificaciones del backend al formato del frontend
      const convertedNotifications = data.map((backendNotif: BackendNotification) => 
        this.convertBackendNotification(backendNotif)
      )
      
      return {
        data: convertedNotifications,
        success: true,
        message: 'Notificaciones obtenidas del backend'
      }
    } catch (error) {
      console.error('Error obteniendo notificaciones del backend:', error)
      
      // Fallback a datos mock en caso de error
      console.log('Usando notificaciones de fallback')
      const fallbackNotifications: Notification[] = [
        {
          id: "fallback-1",
          type: "event",
          title: "Sistema en mantenimiento",
          message: "Las notificaciones del backend no están disponibles temporalmente",
          isRead: false,
        }
      ]
      
      return {
        data: fallbackNotifications,
        success: true,
        message: 'Notificaciones obtenidas (modo fallback)'
      }
    }
  }

  // Marcar notificación como leída
  static async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return {
        data: undefined,
        success: true,
        message: 'Notificación marcada como leída'
      }
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TEACHER_NOTIFICATIONS}/${notificationId}:read`
      
      const headers = {
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Content-Type': 'application/json'
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      return {
        data: undefined,
        success: true,
        message: 'Notificación marcada como leída'
      }
    } catch (error) {
      console.error('Error marcando notificación como leída:', error)
      return {
        data: undefined,
        success: false,
        error: 'Error al marcar notificación como leída'
      }
    }
  }

}
