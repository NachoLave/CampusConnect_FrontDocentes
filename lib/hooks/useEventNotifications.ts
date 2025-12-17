'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { EventsService, AcademicEvent } from '@/lib/api/services/events'
import { Notification } from '@/lib/api/services/notifications'

// Clave para localStorage donde guardamos las notificaciones de eventos ya mostradas
const EVENT_NOTIFICATIONS_STORAGE_KEY = 'event_notifications_shown'

// Clave para localStorage donde guardamos las notificaciones de eventos marcadas como leídas
const EVENT_NOTIFICATIONS_READ_KEY = 'event_notifications_read'

interface EventNotificationState {
  notifications: Notification[]
  readNotificationIds: Set<string>
}

/**
 * Hook para monitorear eventos académicos y generar notificaciones locales
 * cuando un evento se aproxima (30 minutos antes)
 */
export function useEventNotifications() {
  const [eventNotifications, setEventNotifications] = useState<Notification[]>([])
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckRef = useRef<Date>(new Date())

  // Cargar notificaciones ya mostradas y leídas desde localStorage
  useEffect(() => {
    try {
      const shown = localStorage.getItem(EVENT_NOTIFICATIONS_STORAGE_KEY)
      const read = localStorage.getItem(EVENT_NOTIFICATIONS_READ_KEY)
      
      if (read) {
        const readIds = JSON.parse(read) as string[]
        setReadNotificationIds(new Set(readIds))
      }
    } catch (error) {
      console.warn('Error cargando notificaciones de eventos desde localStorage:', error)
    }
  }, [])

  // Función para verificar si un evento necesita notificación
  const shouldNotifyEvent = useCallback((event: AcademicEvent, shownIds: Set<string>): boolean => {
    // Si ya se mostró la notificación para este evento, no mostrar de nuevo
    if (shownIds.has(event.id)) {
      console.log(`🔔 [shouldNotifyEvent] Evento "${event.name}" (${event.id}) ya fue mostrado, omitiendo`)
      return false
    }

    // Si el evento ya pasó, no notificar
    // Nota: new Date() convierte automáticamente el string ISO UTC a la zona horaria local del navegador
    const eventStart = new Date(event.startTime)
    const now = new Date()
    
    // Log detallado para debugging
    const timeUntilEvent = eventStart.getTime() - now.getTime()
    const minutesUntil = Math.floor(timeUntilEvent / (1000 * 60))
    const hoursUntil = Math.floor(minutesUntil / 60)
    
    console.log(`🔔 [shouldNotifyEvent] Verificando evento "${event.name}" (${event.id}):`, {
      startTime: event.startTime,
      startTimeParsed: eventStart.toISOString(),
      startTimeLocal: eventStart.toLocaleString('es-AR'),
      now: now.toISOString(),
      nowLocal: now.toLocaleString('es-AR'),
      timeUntilEventMs: timeUntilEvent,
      minutesUntil,
      hoursUntil,
      isPast: eventStart <= now
    })
    
    if (eventStart <= now) {
      console.log(`🔔 [shouldNotifyEvent] Evento "${event.name}" ya pasó, omitiendo`)
      return false
    }

    // Calcular tiempo hasta el evento
    const thirtyMinutes = 30 * 60 * 1000 // 30 minutos en milisegundos

    // Notificar si el evento está dentro de los próximos 30 minutos
    // (desde ahora hasta 30 minutos antes del evento)
    const shouldNotify = timeUntilEvent <= thirtyMinutes && timeUntilEvent > 0
    
    console.log(`🔔 [shouldNotifyEvent] Resultado para "${event.name}":`, {
      timeUntilEvent,
      thirtyMinutes,
      shouldNotify,
      condition1: timeUntilEvent <= thirtyMinutes,
      condition2: timeUntilEvent > 0
    })
    
    return shouldNotify
  }, [])

  // Función para crear una notificación de evento
  const createEventNotification = useCallback((event: AcademicEvent, isRead: boolean): Notification => {
    // Nota: new Date() convierte automáticamente el string ISO UTC a la zona horaria local del navegador
    // Esto asegura que las fechas y horarios se muestren correctamente en la zona horaria del usuario
    const eventStart = new Date(event.startTime)
    const now = new Date()
    const timeUntilEvent = eventStart.getTime() - now.getTime()
    const fiveMinutesAfterStart = 5 * 60 * 1000 // 5 minutos en milisegundos
    
    // Determinar si el evento ya comenzó
    const hasStarted = eventStart <= now
    const timeSinceStart = now.getTime() - eventStart.getTime()
    const isWithin5MinutesAfterStart = hasStarted && timeSinceStart <= fiveMinutesAfterStart
    
    // Calcular tiempo restante o transcurrido en formato legible
    let timeMessage = ''
    let title = 'Evento Académico Próximo'
    
    if (hasStarted) {
      // Si el evento ya comenzó pero está dentro de los 5 minutos
      if (isWithin5MinutesAfterStart) {
        const minutesSince = Math.floor(timeSinceStart / (1000 * 60))
        title = 'Evento Académico en Curso'
        timeMessage = `hace ${minutesSince} minuto${minutesSince !== 1 ? 's' : ''}`
      } else {
        // Si pasaron más de 5 minutos, no debería mostrarse (se limpia en el cleanup)
        const minutesSince = Math.floor(timeSinceStart / (1000 * 60))
        timeMessage = `hace ${minutesSince} minuto${minutesSince !== 1 ? 's' : ''}`
      }
    } else {
      // El evento aún no comenzó
      const minutesUntil = Math.floor(timeUntilEvent / (1000 * 60))
      const hoursUntil = Math.floor(minutesUntil / 60)
      
      if (hoursUntil > 0) {
        timeMessage = `en ${hoursUntil} hora${hoursUntil > 1 ? 's' : ''} y ${minutesUntil % 60} minuto${(minutesUntil % 60) !== 1 ? 's' : ''}`
      } else {
        timeMessage = `en ${minutesUntil} minuto${minutesUntil !== 1 ? 's' : ''}`
      }
    }
    
    // Formatear fecha y hora en zona horaria local (es-AR = Argentina)
    // toLocaleString() automáticamente convierte a la zona horaria local del navegador
    const formattedTime = eventStart.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Usar zona horaria del navegador
    })

    // ID especial para identificar notificaciones locales de eventos
    // Prefijo "event-local-" para distinguirlas de las del backend
    const notificationId = `event-local-${event.id}`

    // Link al portal de eventos con el ID del evento en el hash para mostrar detalles
    const eventLink = `https://desap2-eventos-front.onrender.com/#/event/${event.id}`

    return {
      id: notificationId,
      type: 'event',
      title,
      message: hasStarted 
        ? `El evento "${event.name}" comenzó ${timeMessage} (${formattedTime})`
        : `El evento "${event.name}" comenzará ${timeMessage} (${formattedTime})`,
      time: formattedTime,
      actionText: 'Ver detalles',
      link: eventLink,
      isRead
    }
  }, [])

  // Función para verificar eventos y generar notificaciones
  const checkEvents = useCallback(async () => {
    try {
      const events = await EventsService.getRegisteredEvents()
      console.log('🔔 [useEventNotifications] Eventos registrados obtenidos:', events.length)
      
      // Cargar IDs de notificaciones ya mostradas
      let shownIds = new Set<string>()
      try {
        const shown = localStorage.getItem(EVENT_NOTIFICATIONS_STORAGE_KEY)
        if (shown) {
          shownIds = new Set(JSON.parse(shown) as string[])
        }
        console.log('🔔 [useEventNotifications] IDs ya mostrados:', Array.from(shownIds))
      } catch (e) {
        console.warn('Error leyendo notificaciones mostradas:', e)
      }

      // Cargar IDs de notificaciones leídas
      let readIds = new Set<string>()
      try {
        const read = localStorage.getItem(EVENT_NOTIFICATIONS_READ_KEY)
        if (read) {
          readIds = new Set(JSON.parse(read) as string[])
        }
      } catch (e) {
        console.warn('Error leyendo notificaciones leídas:', e)
      }

      // Generar notificaciones para eventos que necesitan ser notificados
      const newNotifications: Notification[] = []
      const newShownIds = new Set(shownIds)

      console.log('🔔 [useEventNotifications] Procesando eventos:', events.map(e => ({
        id: e.id,
        name: e.name,
        startTime: e.startTime,
        registered: e.registered
      })))
      
      events.forEach((event) => {
        const shouldNotify = shouldNotifyEvent(event, shownIds)
        
        if (shouldNotify) {
          const notificationId = `event-local-${event.id}`
          const isRead = readIds.has(notificationId)
          const notification = createEventNotification(event, isRead)
          newNotifications.push(notification)
          newShownIds.add(event.id)
          console.log(`🔔 [useEventNotifications] ✅ Notificación creada para "${event.name}" (${event.id})`)
        } else {
          console.log(`🔔 [useEventNotifications] ⏭️ No se creará notificación para "${event.name}" (${event.id})`)
        }
      })
      
      console.log('🔔 [useEventNotifications] Nuevas notificaciones generadas:', newNotifications.length)

      // Guardar IDs de notificaciones mostradas
      try {
        localStorage.setItem(EVENT_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(newShownIds)))
      } catch (e) {
        console.warn('Error guardando notificaciones mostradas:', e)
      }

      // Actualizar estado con todas las notificaciones de eventos (incluyendo las que ya estaban)
      // Mantener notificaciones hasta que el usuario las marque como leídas o pasen 5 minutos desde que el evento comenzó
      const now = new Date()
      const fiveMinutes = 5 * 60 * 1000 // 5 minutos en milisegundos
      
      setEventNotifications(prev => {
        // Actualizar notificaciones existentes con el mensaje correcto y tiempo actualizado
        const updatedExisting = prev.map(notif => {
          if (notif.id.startsWith('event-local-')) {
            const eventId = notif.id.replace('event-local-', '')
            const event = events.find(e => e.id === eventId)
            
            if (event) {
              // Nota: new Date() convierte automáticamente el string ISO UTC a la zona horaria local
              const eventStart = new Date(event.startTime)
              const hasStarted = eventStart <= now
              // Formatear fecha y hora en zona horaria local
              const formattedTime = eventStart.toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Usar zona horaria del navegador
              })
              
              // Actualizar el mensaje dinámicamente basado en el tiempo actual
              if (hasStarted && !notif.isRead) {
                // El evento ya comenzó
                const timeSinceStart = now.getTime() - eventStart.getTime()
                const isWithin5Minutes = timeSinceStart <= fiveMinutes
                
                if (isWithin5Minutes) {
                  const minutesSince = Math.floor(timeSinceStart / (1000 * 60))
                  return {
                    ...notif,
                    title: 'Evento Académico en Curso',
                    message: `El evento "${event.name}" comenzó hace ${minutesSince} minuto${minutesSince !== 1 ? 's' : ''} (${formattedTime})`
                  }
                }
              } else if (!hasStarted && !notif.isRead) {
                // El evento aún no comenzó - actualizar tiempo restante
                const timeUntilEvent = eventStart.getTime() - now.getTime()
                const minutesUntil = Math.floor(timeUntilEvent / (1000 * 60))
                const hoursUntil = Math.floor(minutesUntil / 60)
                
                let timeMessage = ''
                if (hoursUntil > 0) {
                  timeMessage = `en ${hoursUntil} hora${hoursUntil > 1 ? 's' : ''} y ${minutesUntil % 60} minuto${(minutesUntil % 60) !== 1 ? 's' : ''}`
                } else {
                  timeMessage = `en ${minutesUntil} minuto${minutesUntil !== 1 ? 's' : ''}`
                }
                
                return {
                  ...notif,
                  title: 'Evento Académico Próximo',
                  message: `El evento "${event.name}" comenzará ${timeMessage} (${formattedTime})`
                }
              }
            }
          }
          return notif
        })
        
        // Filtrar notificaciones que ya no deben mostrarse (solo las no leídas que pasaron más de 5 minutos)
        const existingValid = updatedExisting.filter(notif => {
          // Si es una notificación de evento local, verificar si aún debe mostrarse
          if (notif.id.startsWith('event-local-')) {
            // Si está marcada como leída, mantenerla (no se elimina automáticamente)
            if (notif.isRead) {
              return true
            }
            
            const eventId = notif.id.replace('event-local-', '')
            const event = events.find(e => e.id === eventId)
            if (event) {
              const eventStart = new Date(event.startTime)
              const timeSinceStart = now.getTime() - eventStart.getTime()
              
              // Mantener si:
              // 1. El evento aún no comenzó, O
              // 2. El evento comenzó pero pasaron menos de 5 minutos
              return eventStart > now || (eventStart <= now && timeSinceStart <= fiveMinutes)
            }
            // Si no encontramos el evento, mantener la notificación
            return true
          }
          return true
        })

        // Combinar con nuevas notificaciones, evitando duplicados
        const combined = [...existingValid]
        newNotifications.forEach(newNotif => {
          // Solo agregar si no existe ya (por ID)
          if (!combined.find(n => n.id === newNotif.id)) {
            combined.push(newNotif)
          } else {
            // Si existe, actualizar el mensaje si es necesario
            const existingIndex = combined.findIndex(n => n.id === newNotif.id)
            if (existingIndex !== -1) {
              // Actualizar solo si el nuevo mensaje es diferente (evento comenzó)
              if (newNotif.title === 'Evento Académico en Curso') {
                combined[existingIndex] = newNotif
              }
            }
          }
        })

        return combined
      })

      lastCheckRef.current = new Date()
    } catch (error) {
      console.warn('Error verificando eventos para notificaciones:', error)
    }
  }, [shouldNotifyEvent, createEventNotification])

  // Marcar notificación de evento como leída (solo localmente)
  const markEventNotificationAsRead = useCallback((notificationId: string) => {
    if (!notificationId.startsWith('event-local-')) {
      return // No es una notificación de evento local
    }

    setReadNotificationIds(prev => {
      const newSet = new Set(prev)
      newSet.add(notificationId)
      
      // Guardar en localStorage
      try {
        localStorage.setItem(EVENT_NOTIFICATIONS_READ_KEY, JSON.stringify(Array.from(newSet)))
      } catch (e) {
        console.warn('Error guardando notificación leída:', e)
      }
      
      return newSet
    })

    // Optimistic UI: eliminar inmediatamente del estado (desaparecer del frontend)
    setEventNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    )
  }, [])

  // Iniciar monitoreo de eventos
  useEffect(() => {
    // Verificar inmediatamente al montar
    checkEvents()

    // Verificar cada minuto (60000 ms) para detectar eventos que se aproximan
    intervalRef.current = setInterval(() => {
      checkEvents()
    }, 60000) // 1 minuto

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkEvents])

  // Limpiar notificaciones de eventos que ya pasaron más de 5 minutos
  // PERO solo si NO están marcadas como leídas (las leídas se mantienen hasta que el usuario las elimine manualmente)
  useEffect(() => {
    const cleanup = async () => {
      try {
        // Obtener eventos actuales para verificar cuáles ya pasaron
        const events = await EventsService.getRegisteredEvents()
        const now = new Date()
        const fiveMinutes = 5 * 60 * 1000 // 5 minutos en milisegundos
        
        setEventNotifications(prev => {
          return prev.filter(notif => {
            // Solo limpiar notificaciones de eventos locales
            if (notif.id.startsWith('event-local-')) {
              // NUNCA eliminar notificaciones marcadas como leídas
              // Estas solo se eliminan cuando el usuario las marca explícitamente
              if (notif.isRead) {
                return true
              }
              
              const eventId = notif.id.replace('event-local-', '')
              const event = events.find(e => e.id === eventId)
              
              if (event) {
                const eventStart = new Date(event.startTime)
                const timeSinceStart = now.getTime() - eventStart.getTime()
                
                // Eliminar solo si:
                // 1. El evento comenzó Y
                // 2. Pasaron más de 5 minutos desde que comenzó Y
                // 3. NO está marcada como leída
                if (eventStart <= now && timeSinceStart > fiveMinutes) {
                  return false // Eliminar
                }
                
                // Mantener en todos los otros casos
                return true
              }
              
              // Si no encontramos el evento, mantener la notificación
              return true
            }
            return true
          })
        })
      } catch (error) {
        console.warn('Error en cleanup de notificaciones de eventos:', error)
      }
    }

    // Limpiar cada minuto (junto con el check de eventos)
    const cleanupInterval = setInterval(cleanup, 60000) // 1 minuto
    return () => clearInterval(cleanupInterval)
  }, [])

  return {
    eventNotifications,
    markEventNotificationAsRead,
    isEventNotification: (notificationId: string) => notificationId.startsWith('event-local-')
  }
}
