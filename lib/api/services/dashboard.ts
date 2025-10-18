import { CarouselImage, ApiResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG, USE_MOCK_DATA } from '@/lib/config/api'
import carouselData from '@/lib/data/carousel.json'
import { WalletService } from './wallet'

export class DashboardService {
  // Obtener imágenes del carrusel
  static async getCarouselImages(): Promise<ApiResponse<CarouselImage[]>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        data: carouselData as CarouselImage[],
        success: true,
        message: 'Imágenes del carrusel obtenidas correctamente'
      }
    }

    return apiClient.get<CarouselImage[]>(API_CONFIG.ENDPOINTS.CAROUSEL_IMAGES)
  }

  // Obtener datos completos del dashboard
  static async getDashboardData(): Promise<ApiResponse<{
    carouselImages: CarouselImage[]
    nextClass: any
    balance: number
    todayReservation: any
    announcements: any[]
  }>> {
    try {
      // Obtener balance real del backend
      const balanceResponse = await WalletService.getBalance()
      const realBalance = balanceResponse.success ? balanceResponse.data : 0
      
      const dashboardData = {
        carouselImages: carouselData as CarouselImage[],
        nextClass: {
          title: "Desarrollo de Aplicaciones II",
          code: "18068",
          isVirtual: true,
          date: "Hoy",
          schedule: "14:00 - 18:00"
        },
        balance: realBalance, // Usar balance real del backend
        todayReservation: {
          date: "Hoy",
          time: "9:00 - 11:00"
        },
        announcements: [
          {
            id: 1,
            title: "Período de Inscripciones Abiertas",
            description: "Las inscripciones para el próximo semestre están abiertas hasta el 30 de septiembre.",
            type: "important",
            date: "2023-09-15"
          }
        ]
      }

      return {
        data: dashboardData,
        success: true,
        message: 'Datos del dashboard obtenidos correctamente desde el backend'
      }
    } catch (error) {
      console.error('Error obteniendo datos del dashboard:', error)
      return {
        data: null as any,
        success: false,
        message: 'No se pudieron obtener los datos del dashboard'
      }
    }
  }

  // Obtener estadísticas rápidas
  static async getQuickStats(): Promise<ApiResponse<{
    totalCourses: number
    todayClasses: number
    thisWeekClasses: number
    balance: number
  }>> {
    try {
      // Obtener balance real del backend
      const balanceResponse = await WalletService.getBalance()
      const realBalance = balanceResponse.success ? balanceResponse.data : 0
      
      const stats = {
        totalCourses: 7,
        todayClasses: 2,
        thisWeekClasses: 12,
        balance: realBalance // Usar balance real del backend
      }

      return {
        data: stats,
        success: true,
        message: 'Estadísticas rápidas obtenidas correctamente desde el backend'
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas rápidas:', error)
      return {
        data: null as any,
        success: false,
        message: 'No se pudieron obtener las estadísticas rápidas'
      }
    }
  }

  // Obtener anuncios
  static async getAnnouncements(): Promise<ApiResponse<any[]>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const announcements = [
        {
          id: 1,
          title: "Período de Inscripciones Abiertas",
          description: "Las inscripciones para el próximo semestre están abiertas hasta el 30 de septiembre.",
          type: "important",
          date: "2023-09-15",
          priority: "high"
        },
        {
          id: 2,
          title: "Mantenimiento Programado",
          description: "El sistema estará en mantenimiento el domingo de 2:00 AM a 6:00 AM.",
          type: "maintenance",
          date: "2023-09-20",
          priority: "medium"
        }
      ]

      return {
        data: announcements,
        success: true,
        message: 'Anuncios obtenidos correctamente'
      }
    }

    return apiClient.get<any[]>(`${API_CONFIG.ENDPOINTS.DASHBOARD_DATA}/announcements`)
  }
}
