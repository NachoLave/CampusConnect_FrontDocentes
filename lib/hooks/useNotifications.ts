'use client'

import { useState, useEffect, useCallback } from 'react'
import { Notification, NotificationsService } from '@/lib/api/services/notifications'
import { LoadingState } from '@/lib/types'
import { useEventNotifications } from './useEventNotifications'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false, // Iniciar en false para no bloquear la UI
    error: null
  })

  // Obtener notificaciones de eventos locales
  const { 
    eventNotifications, 
    markEventNotificationAsRead, 
    isEventNotification 
  } = useEventNotifications()

  const fetchNotifications = useCallback(async () => {
    // No establecer isLoading en true para no bloquear la UI
    // Las notificaciones se cargarán en background
    
    try {
      const response = await NotificationsService.getNotifications()
      
      if (response.success) {
        setNotifications(response.data)
        setLoadingState({ isLoading: false, error: null })
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar notificaciones' 
        })
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar notificaciones' 
      })
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    // Si es una notificación de evento local, manejarla localmente sin POST
    if (isEventNotification(notificationId)) {
      markEventNotificationAsRead(notificationId)
      return
    }

    // Optimistic UI: actualizar inmediatamente
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    )

    try {
      const response = await NotificationsService.markAsRead(notificationId)
      
      if (!response.success) {
        // Revertir en caso de error
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: false }
              : notification
          )
        )
        console.error('Error marcando notificación como leída:', response.error)
      }
    } catch (error) {
      // Revertir en caso de error
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: false }
            : notification
        )
      )
      console.error('Error marcando notificación como leída:', error)
    }
  }, [isEventNotification, markEventNotificationAsRead])

  const markAllAsRead = useCallback(async () => {
    // Obtener todas las notificaciones combinadas (backend + eventos)
    const allNotifications = [...notifications, ...eventNotifications]
    const previousNotifications = allNotifications.filter(n => !n.isRead)
    
    // Separar notificaciones de eventos locales de las del backend
    const eventNotifs = previousNotifications.filter(n => isEventNotification(n.id))
    const backendNotifs = previousNotifications.filter(n => !isEventNotification(n.id))

    // Marcar notificaciones de eventos localmente
    eventNotifs.forEach(notif => {
      markEventNotificationAsRead(notif.id)
    })
    
    // Optimistic UI: marcar todas como leídas inmediatamente
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )

    try {
      // Hacer una request individual por cada notificación del backend no leída
      const promises = backendNotifs.map(notification => 
        NotificationsService.markAsRead(notification.id)
      )
      
      const results = await Promise.allSettled(promises)
      
      // Verificar si hubo errores
      const failedIds: string[] = []
      results.forEach((result, index) => {
        if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)) {
          failedIds.push(backendNotifs[index].id)
        }
      })
      
      // Revertir solo las que fallaron
      if (failedIds.length > 0) {
        setNotifications(prev => 
          prev.map(notification => 
            failedIds.includes(notification.id)
              ? { ...notification, isRead: false }
              : notification
          )
        )
        console.error(`Error marcando ${failedIds.length} notificaciones como leídas`)
      }
    } catch (error) {
      // Revertir todas las del backend en caso de error catastrófico
      setNotifications(prev => 
        prev.map(notification => {
          const wasUnread = backendNotifs.find(n => n.id === notification.id)
          return wasUnread ? { ...notification, isRead: false } : notification
        })
      )
      console.error('Error marcando todas las notificaciones como leídas:', error)
    }
  }, [notifications, eventNotifications, isEventNotification, markEventNotificationAsRead])

  // Cargar notificaciones inmediatamente al montar el hook
  // No esperar a que termine ningún otro proceso
  useEffect(() => {
    // Ejecutar inmediatamente sin esperar
    fetchNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Dependencias vacías intencionalmente - solo ejecutar una vez al montar

  // Combinar notificaciones del backend con las de eventos locales
  const allNotifications = [...notifications, ...eventNotifications]
  const unreadCount = allNotifications.filter(n => !n.isRead).length

  // Log para debuggear
  useEffect(() => {
    console.log('🔔 [useNotifications] Notificaciones combinadas:', {
      backend: notifications.length,
      eventos: eventNotifications.length,
      total: allNotifications.length,
      noLeidas: unreadCount,
      todas: allNotifications.map(n => ({ id: n.id, title: n.title, isRead: n.isRead }))
    })
  }, [notifications, eventNotifications, allNotifications, unreadCount])

  return {
    notifications: allNotifications,
    unreadCount,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}











