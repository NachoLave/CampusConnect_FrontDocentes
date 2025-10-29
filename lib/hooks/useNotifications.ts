'use client'

import { useState, useEffect, useCallback } from 'react'
import { Notification, NotificationsService } from '@/lib/api/services/notifications'
import { LoadingState } from '@/lib/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchNotifications = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await NotificationsService.getNotifications()
      
      if (response.success) {
        setNotifications(response.data)
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar notificaciones' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar notificaciones' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await NotificationsService.markAsRead(notificationId)
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Error marcando notificación como leída:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await NotificationsService.markAllAsRead()
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        )
      }
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

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











