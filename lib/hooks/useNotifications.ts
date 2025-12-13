'use client'

import { useState, useEffect, useCallback } from 'react'
import { Notification, NotificationsService } from '@/lib/api/services/notifications'
import { LoadingState } from '@/lib/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false, // Iniciar en false para no bloquear la UI
    error: null
  })

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
  }, [])

  const markAllAsRead = useCallback(async () => {
    // Guardar estado anterior para rollback
    const previousNotifications = notifications.filter(n => !n.isRead)
    
    // Optimistic UI: marcar todas como leídas inmediatamente
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )

    try {
      // Hacer una request individual por cada notificación no leída
      const unreadNotifications = previousNotifications
      const promises = unreadNotifications.map(notification => 
        NotificationsService.markAsRead(notification.id)
      )
      
      const results = await Promise.allSettled(promises)
      
      // Verificar si hubo errores
      const failedIds: string[] = []
      results.forEach((result, index) => {
        if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)) {
          failedIds.push(unreadNotifications[index].id)
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
      // Revertir todas en caso de error catastrófico
      setNotifications(prev => 
        prev.map(notification => {
          const wasUnread = previousNotifications.find(n => n.id === notification.id)
          return wasUnread ? { ...notification, isRead: false } : notification
        })
      )
      console.error('Error marcando todas las notificaciones como leídas:', error)
    }
  }, [notifications])

  // Cargar notificaciones inmediatamente al montar el hook
  // No esperar a que termine ningún otro proceso
  useEffect(() => {
    // Ejecutar inmediatamente sin esperar
    fetchNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Dependencias vacías intencionalmente - solo ejecutar una vez al montar

  const unreadCount = notifications.filter(n => !n.isRead).length

  return {
    notifications,
    unreadCount,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}











