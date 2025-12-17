'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Notification, NotificationsService } from '@/lib/api/services/notifications'
import { LoadingState } from '@/lib/types'
import { useEventNotifications } from './useEventNotifications'
import { SubjectsService } from '@/lib/api/services/subjects'
import { PERFORMANCE_CONFIG } from '@/lib/config/performance'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [rawNotifications, setRawNotifications] = useState<Notification[]>([]) // Notificaciones sin enriquecer
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false, // Iniciar en false para no bloquear la UI
    error: null
  })
  const [subjectsMap, setSubjectsMap] = useState<Map<string, string>>(new Map()) // UUID -> nombre

  // Ref para almacenar el intervalo de polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  // Ref para trackear si la página está visible
  const isPageVisibleRef = useRef(true)
  // Ref para trackear notificaciones que se están marcando como leídas (para evitar que el polling las re-agregue)
  const markingAsReadRef = useRef<Set<string>>(new Set())

  // Obtener notificaciones de eventos locales
  const { 
    eventNotifications, 
    markEventNotificationAsRead, 
    isEventNotification 
  } = useEventNotifications()

  // Función para cargar materias desde el EP externo
  const loadSubjects = useCallback(async () => {
    try {
      console.log('🔔 [useNotifications] Cargando materias desde EP externo...')
      const response = await SubjectsService.getAllSubjectsExternal()
      
      if (response.success && response.data) {
        const map = new Map<string, string>() // UUID -> nombre
        
        response.data.forEach(materia => {
          if (materia.uuid && materia.nombre) {
            map.set(materia.uuid, materia.nombre)
          }
        })
        
        console.log('🔔 [useNotifications] Mapa de materias creado con', map.size, 'entradas desde EP externo')
        setSubjectsMap(map)
      } else {
        console.warn('🔔 [useNotifications] Error obteniendo materias:', response.error)
      }
    } catch (error) {
      console.error('🔔 [useNotifications] Error cargando materias:', error)
    }
  }, [])

  // Cargar materias al montar y cada 10 segundos
  useEffect(() => {
    loadSubjects()
    
    // Recargar materias cada 10 segundos para mantener datos actualizados
    const interval = setInterval(loadSubjects, 10 * 1000)
    
    return () => clearInterval(interval)
  }, [loadSubjects])

  // Función para enriquecer notificaciones con nombre de materia
  const enrichNotifications = useCallback((notifs: Notification[]): Notification[] => {
    console.log('🔔 [enrichNotifications] Enriqueciendo notificaciones:', {
      total: notifs.length,
      subjectsMapSize: subjectsMap.size,
      subjectsMapKeys: Array.from(subjectsMap.keys()).slice(0, 5) // Primeros 5 para debug
    })
    
    return notifs.map(notif => {
      // Solo enriquecer notificaciones de propuestas aprobadas/rechazadas que tengan subjectId
      const isProposalNotification = 
        (notif.type === 'approval' || notif.type === 'rejection') &&
        (notif.title.includes('Propuesta aprobada') || notif.title.includes('Propuesta rechazada')) &&
        notif.subjectId
      
      console.log('🔔 [enrichNotifications] Procesando notificación:', {
        id: notif.id,
        title: notif.title,
        type: notif.type,
        subjectId: notif.subjectId,
        isProposalNotification
      })
      
      if (!isProposalNotification) {
        return notif
      }

      // Buscar el nombre de la materia por UUID
      const subjectName = subjectsMap.get(notif.subjectId)
      
      console.log('🔔 [enrichNotifications] Búsqueda de materia:', {
        subjectId: notif.subjectId,
        found: !!subjectName,
        subjectName: subjectName || 'NO ENCONTRADA'
      })
      
      if (subjectName) {
        // Enriquecer el mensaje con el nombre de la materia
        const enrichedMessage = notif.title.includes('aprobada')
          ? `Tu propuesta para dictar la materia "${subjectName}" fue aprobada.`
          : `Tu propuesta para dictar la materia "${subjectName}" fue rechazada.`
        
        console.log('🔔 [enrichNotifications] Mensaje enriquecido:', enrichedMessage)
        
        return {
          ...notif,
          message: enrichedMessage
        }
      }

      // Si no se encuentra la materia, mantener el mensaje original
      console.warn('🔔 [enrichNotifications] Materia no encontrada para subjectId:', notif.subjectId)
      return notif
    })
  }, [subjectsMap])

  const fetchNotifications = useCallback(async () => {
    // No establecer isLoading en true para no bloquear la UI
    // Las notificaciones se cargarán en background
    
    // Recargar materias cada vez que se refrescan las notificaciones
    loadSubjects()
    
    try {
      const response = await NotificationsService.getNotifications()
      
      if (response.success) {
        // Filtrar notificaciones que se están marcando como leídas
        // Esto evita que el polling las re-agregue inmediatamente después de marcarlas
        const filteredNotifications = response.data.filter(notif => 
          !markingAsReadRef.current.has(notif.id)
        )
        
        setRawNotifications(filteredNotifications)
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
  }, [loadSubjects])

  // Enriquecer notificaciones cuando cambien las materias o las notificaciones raw
  useEffect(() => {
    console.log('🔔 [useNotifications] useEffect - Enriqueciendo notificaciones:', {
      rawNotificationsCount: rawNotifications.length,
      subjectsMapSize: subjectsMap.size
    })
    const enriched = enrichNotifications(rawNotifications)
    setNotifications(enriched)
    console.log('🔔 [useNotifications] useEffect - Notificaciones enriquecidas:', enriched.length)
  }, [rawNotifications, enrichNotifications, subjectsMap])

  // Función para detener el polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      console.log('🔔 [useNotifications] Polling detenido')
    }
  }, [])

  // Función para iniciar el polling continuo
  const startPolling = useCallback(() => {
    // Limpiar intervalo anterior si existe
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // Solo iniciar polling si la página está visible
    if (!isPageVisibleRef.current) {
      return
    }

    const interval = PERFORMANCE_CONFIG.POLLING.NOTIFICATIONS
    
    console.log(`🔔 [useNotifications] Iniciando polling de notificaciones cada ${interval}ms`)
    
    // Ejecutar inmediatamente la primera vez
    fetchNotifications()
    
    // Configurar intervalo para polling continuo
    pollingIntervalRef.current = setInterval(() => {
      // Solo hacer fetch si la página está visible
      if (isPageVisibleRef.current) {
        fetchNotifications()
      }
    }, interval)
  }, [fetchNotifications])

  const markAsRead = useCallback(async (notificationId: string) => {
    // Si es una notificación de evento local, manejarla localmente sin POST
    if (isEventNotification(notificationId)) {
      markEventNotificationAsRead(notificationId)
      return
    }

    // Pausar el polling temporalmente para evitar que re-agregue la notificación
    const wasPollingActive = pollingIntervalRef.current !== null
    if (wasPollingActive) {
      stopPolling()
    }

    // Agregar a la lista de notificaciones que se están marcando como leídas
    markingAsReadRef.current.add(notificationId)

    // Guardar la notificación antes de eliminarla (por si hay que revertir)
    const notificationToRemove = notifications.find(n => n.id === notificationId)

    // Optimistic UI: eliminar inmediatamente del estado
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )

    try {
      const response = await NotificationsService.markAsRead(notificationId)
      
      if (!response.success) {
        // Revertir en caso de error: restaurar la notificación
        markingAsReadRef.current.delete(notificationId)
        if (notificationToRemove) {
          setNotifications(prev => [...prev, notificationToRemove])
        }
        // Reanudar polling si estaba activo
        if (wasPollingActive) {
          startPolling()
        }
        console.error('Error marcando notificación como leída:', response.error)
      } else {
        // Esperar un poco para que el backend procese, luego reanudar polling y limpiar el Set
        setTimeout(() => {
          markingAsReadRef.current.delete(notificationId)
          // Reanudar polling si estaba activo
          if (wasPollingActive) {
            startPolling()
          }
        }, 3000) // 3 segundos para asegurar que el backend procesó
      }
    } catch (error) {
      // Revertir en caso de error: restaurar la notificación
      markingAsReadRef.current.delete(notificationId)
      if (notificationToRemove) {
        setNotifications(prev => [...prev, notificationToRemove])
      }
      // Reanudar polling si estaba activo
      if (wasPollingActive) {
        startPolling()
      }
      console.error('Error marcando notificación como leída:', error)
    }
  }, [notifications, isEventNotification, markEventNotificationAsRead, stopPolling, startPolling])

  const markAllAsRead = useCallback(async () => {
    // Obtener todas las notificaciones combinadas (backend + eventos)
    const allNotifications = [...notifications, ...eventNotifications]
    const previousNotifications = allNotifications.filter(n => !n.isRead)
    
    // Separar notificaciones de eventos locales de las del backend
    const eventNotifs = previousNotifications.filter(n => isEventNotification(n.id))
    const backendNotifs = previousNotifications.filter(n => !isEventNotification(n.id))

    // Si no hay notificaciones del backend para marcar, solo manejar eventos
    if (backendNotifs.length === 0) {
      eventNotifs.forEach(notif => {
        markEventNotificationAsRead(notif.id)
      })
      return
    }

    // Pausar el polling temporalmente para evitar que re-agregue las notificaciones
    const wasPollingActive = pollingIntervalRef.current !== null
    if (wasPollingActive) {
      stopPolling()
    }

    // Guardar las notificaciones del backend antes de eliminarlas (por si hay que revertir)
    const backendNotificationsToRemove = notifications.filter(n => 
      backendNotifs.some(bn => bn.id === n.id)
    )

    // Agregar todas las notificaciones del backend a la lista de marcadas como leídas
    backendNotifs.forEach(notif => {
      markingAsReadRef.current.add(notif.id)
    })

    // Marcar notificaciones de eventos localmente
    eventNotifs.forEach(notif => {
      markEventNotificationAsRead(notif.id)
    })
    
    // Optimistic UI: eliminar todas las notificaciones del backend inmediatamente
    setNotifications(prev => 
      prev.filter(notification => 
        !backendNotifs.some(bn => bn.id === notification.id)
      )
    )

    try {
      // Hacer una request individual por cada notificación del backend no leída
      const promises = backendNotifs.map(notification => 
        NotificationsService.markAsRead(notification.id)
      )
      
      const results = await Promise.allSettled(promises)
      
      // Verificar si hubo errores
      const failedNotifications: typeof backendNotificationsToRemove = []
      const failedIds = new Set<string>()
      
      results.forEach((result, index) => {
        if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)) {
          const failedNotif = backendNotificationsToRemove[index]
          if (failedNotif) {
            failedNotifications.push(failedNotif)
            failedIds.add(failedNotif.id)
          }
        }
      })
      
      // Remover de la lista de marcadas como leídas solo las que fallaron
      backendNotifs.forEach(notif => {
        if (failedIds.has(notif.id)) {
          // Remover inmediatamente las que fallaron
          markingAsReadRef.current.delete(notif.id)
        }
      })
      
      // Revertir solo las que fallaron: restaurar las notificaciones que fallaron
      if (failedNotifications.length > 0) {
        setNotifications(prev => [...prev, ...failedNotifications])
        console.error(`Error marcando ${failedNotifications.length} notificaciones como leídas`)
      }
      
      // Esperar un poco para que el backend procese todas las notificaciones, luego reanudar polling y limpiar el Set
      setTimeout(() => {
        // Limpiar todas las notificaciones exitosas del Set
        backendNotifs.forEach(notif => {
          if (!failedIds.has(notif.id)) {
            markingAsReadRef.current.delete(notif.id)
          }
        })
        // Reanudar polling si estaba activo
        if (wasPollingActive) {
          startPolling()
        }
      }, 3000) // 3 segundos para asegurar que el backend procesó todas
    } catch (error) {
      // Revertir todas las del backend en caso de error catastrófico
      backendNotifs.forEach(notif => {
        markingAsReadRef.current.delete(notif.id)
      })
      setNotifications(prev => [...prev, ...backendNotificationsToRemove])
      // Reanudar polling si estaba activo
      if (wasPollingActive) {
        startPolling()
      }
      console.error('Error marcando todas las notificaciones como leídas:', error)
    }
  }, [notifications, eventNotifications, isEventNotification, markEventNotificationAsRead, stopPolling, startPolling])

  // Cargar notificaciones inmediatamente al montar y configurar polling continuo
  useEffect(() => {
    // Ejecutar inmediatamente sin esperar
    fetchNotifications()
    
    // Iniciar polling continuo
    startPolling()

    // Page Visibility API: Detener polling cuando la página no está visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Página oculta - detener polling
        isPageVisibleRef.current = false
        stopPolling()
        console.log('🔔 [useNotifications] Página oculta - polling pausado')
      } else {
        // Página visible - reanudar polling
        isPageVisibleRef.current = true
        // Hacer fetch inmediato y reanudar polling
        fetchNotifications()
        startPolling()
        console.log('🔔 [useNotifications] Página visible - polling reanudado')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup: Detener polling al desmontar
    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      console.log('🔔 [useNotifications] Hook desmontado - polling detenido')
    }
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











