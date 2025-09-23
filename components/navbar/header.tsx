"use client"
import { useState } from "react"
import { NotificationsDropdown } from "./notifications-dropdown"
import { UserDropdown } from "./user-dropdown"

// Mock data - in a real app, this would come from your API/state management
const mockUser = {
  name: "Juan Sánchez",
  id: "11223344",
  email: "juan.sanchez@campusconnect.com.ar",
  avatar: "/teacher-profile.png",
}

const initialNotifications = [
  {
    id: "1",
    type: "rejection" as const,
    title: "Actualización del estado de materia",
    message: "Te han RECHAZADO para dar CALIDAD",
    isRead: false,
  },
  {
    id: "2",
    type: "approval" as const,
    title: "Actualización del estado de materia",
    message: "Te han APROBADO para dar PROGRAMACIÓN I",
    isRead: false,
  },
  {
    id: "3",
    type: "assignment" as const,
    title: "Nuevo curso asignado",
    message: "Tenes un nuevo curso asignado el VIERNES",
    actionText: "Ver más",
    isRead: false,
  },
  {
    id: "4",
    type: "event" as const,
    title: "Se aproxima un evento",
    message: "Hoy 12:00 • Feria de Emprendedores",
    isRead: true,
  },
  {
    id: "5",
    type: "event" as const,
    title: "Se aproxima un evento",
    message: "Mañana • Capacitación obligatoria docente",
    isRead: false,
  },
]

interface HeaderProps {
  currentPage: string
}

export function Header({ currentPage }: HeaderProps) {
  const [notifications, setNotifications] = useState(initialNotifications)

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <header className="bg-slate-100 border-b border-slate-200 h-[73px]">
      <div className="flex items-center justify-between px-6 h-full">
        <div>
          <span className="text-slate-900 font-medium">
            Bienvenido, <span className="font-semibold">@{mockUser.name}</span>.
          </span>
          <span className="text-slate-600 ml-1">Estás en {currentPage}</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <NotificationsDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={handleMarkAllRead}
            onMarkAsRead={handleMarkAsRead}
          />

          <UserDropdown user={mockUser} />
        </div>
      </div>
    </header>
  )
}
