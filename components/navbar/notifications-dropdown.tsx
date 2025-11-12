"use client"
import { Bell, X, CheckCircle, AlertTriangle, MessageCircle, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Notification {
  id: string
  type: "rejection" | "approval" | "assignment" | "event"
  title: string
  message: string
  time?: string
  actionText?: string
  link?: string | null
  isRead?: boolean // Added read state for each notification
}

interface NotificationsDropdownProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAllRead?: () => void
  onMarkAsRead?: (id: string) => void // Added callback for marking individual notifications as read
}

const notificationIcons = {
  rejection: X,
  approval: CheckCircle,
  assignment: AlertTriangle,
  event: MessageCircle,
}

const notificationStyles = {
  rejection: "bg-red-50 border-l-red-400 border-l-4",
  approval: "bg-green-50 border-l-green-400 border-l-4",
  assignment: "bg-yellow-50 border-l-yellow-400 border-l-4",
  event: "border-l-4",
}

const iconStyles = {
  rejection: "bg-red-500 text-white",
  approval: "bg-green-500 text-white",
  assignment: "bg-yellow-500 text-white",
  event: "text-white",
}

// Gama de colores basada en #1D293D (similar a los tonos slate del gráfico de wallet)
const notificationColorPalette = [
  "#1D293D", // Base color - más oscuro
  "#2A3A52", // Segundo tono
  "#3A4D66", // Tercer tono
  "#4A607A", // Cuarto tono
  "#5A738E", // Quinto tono - más claro
]

// Función para obtener el color de fondo con opacidad
const getNotificationBgColor = (color: string, opacity: number = 0.1) => {
  const rgb = hexToRgb(color)
  if (!rgb) return `rgba(29, 41, 61, ${opacity})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

// Función auxiliar para convertir hex a RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function NotificationsDropdown({
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkAsRead,
}: NotificationsDropdownProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0 flex items-center justify-center">
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 bg-red-500 text-white text-[11px] flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-80 lg:max-w-96 lg:w-96 p-0 max-h-[70vh] lg:max-h-96 overflow-y-auto mr-2">
        <div className="p-3 lg:p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllRead}
              className="text-blue-600 hover:text-blue-700 text-xs lg:text-sm h-auto py-1 px-2"
            >
              Marcar leídas
            </Button>
          )}
        </div>
        <div className="space-y-1 p-2">
          {notifications.filter((notification) => !notification.isRead).length === 0 ? (
            <div className="p-6 lg:p-8 text-center text-gray-500">
              <Bell className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm lg:text-base">No hay notificaciones</p>
            </div>
          ) : (
            notifications
              .filter((notification) => !notification.isRead) // Only show unread notifications
              .map((notification, index) => {
                const Icon = notificationIcons[notification.type]
                // Obtener color de la paleta basado en el índice (cicla si hay más notificaciones que colores)
                const colorIndex = index % notificationColorPalette.length
                const notificationColor = notificationColorPalette[colorIndex]
                const bgColor = getNotificationBgColor(notificationColor, 0.1)
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 lg:p-4 rounded-lg border transition-colors hover:bg-gray-50 relative bg-white",
                      notificationStyles[notification.type],
                    )}
                    style={notification.type === "event" ? { 
                      borderLeftColor: notificationColor,
                      boxShadow: `0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`
                    } : {
                      boxShadow: `0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`
                    }}
                  >
                    <div className="flex items-start space-x-2 lg:space-x-3">
                      <div
                        className={cn(
                          "w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          iconStyles[notification.type],
                        )}
                        style={notification.type === "event" ? { backgroundColor: notificationColor } : undefined}
                      >
                        <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </div>
                      <div className="flex-1 min-w-0 pr-7 lg:pr-8">
                        <h4 className="font-semibold text-gray-900 text-xs lg:text-sm mb-1 leading-tight">{notification.title}</h4>
                        <p className="text-gray-700 text-xs lg:text-sm leading-relaxed">{notification.message}</p>
                        {notification.time && <p className="text-gray-500 text-xs mt-1 lg:mt-2">{notification.time}</p>}
                        {notification.link && notification.actionText && (
                          <Link
                            href={notification.link}
                            onClick={() => onMarkAsRead && onMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 text-xs lg:text-sm font-medium mt-1 lg:mt-2 inline-block hover:underline"
                          >
                            {notification.actionText}
                          </Link>
                        )}
                      </div>
                      {onMarkAsRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkAsRead(notification.id)}
                          className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 h-5 w-5 lg:h-6 lg:w-6 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full"
                        >
                          <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
