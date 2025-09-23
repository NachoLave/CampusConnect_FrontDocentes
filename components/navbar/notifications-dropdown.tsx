"use client"
import { Bell, X, CheckCircle, AlertTriangle, MessageCircle, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "rejection" | "approval" | "assignment" | "event"
  title: string
  message: string
  time?: string
  actionText?: string
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
  event: "bg-purple-50 border-l-purple-400 border-l-4",
}

const iconStyles = {
  rejection: "bg-red-500 text-white",
  approval: "bg-green-500 text-white",
  assignment: "bg-yellow-500 text-white",
  event: "bg-purple-500 text-white",
}

export function NotificationsDropdown({
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkAsRead,
}: NotificationsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0 max-h-96 overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Notificaciones</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllRead}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <div className="space-y-1 p-2">
          {notifications.filter((notification) => !notification.isRead).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            notifications
              .filter((notification) => !notification.isRead) // Only show unread notifications
              .map((notification) => {
                const Icon = notificationIcons[notification.type]
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors hover:bg-gray-50 relative",
                      notificationStyles[notification.type],
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          iconStyles[notification.type],
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{notification.title}</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{notification.message}</p>
                        {notification.time && <p className="text-gray-500 text-xs mt-2">{notification.time}</p>}
                        {notification.actionText && (
                          <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium mt-2">
                            {notification.actionText}
                          </button>
                        )}
                      </div>
                      {onMarkAsRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkAsRead(notification.id)}
                          className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full"
                        >
                          <Check className="h-3 w-3" />
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
