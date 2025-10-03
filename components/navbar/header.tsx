"use client"
import { useState } from "react"
import { ChevronRight, Menu } from "lucide-react"
import Link from "next/link"
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
  onMenuClick?: () => void
}

export function Header({ currentPage, onMenuClick }: HeaderProps) {
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

  // Breadcrumb logic
  const getBreadcrumb = () => {
    const items = [{ label: "Inicio", href: "/" }]
    
    if (currentPage !== "Inicio") {
      items.push({ label: currentPage, href: "#" })
    }
    
    return items
  }

  const breadcrumbItems = getBreadcrumb()

  return (
    <header className="bg-slate-100 border-b border-slate-200 h-14 lg:h-[73px] fixed top-0 right-0 left-0 lg:left-72 z-10">
      <div className="flex items-center justify-between px-4 lg:px-6 h-full">
        {/* Left Section - Mobile: Menu Button | Desktop: Breadcrumb */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>

          {/* Breadcrumb - Hidden on small screens */}
          <div className="hidden lg:flex items-center space-x-2 text-sm">
            {breadcrumbItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="font-semibold text-slate-800">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-slate-800 cursor-pointer transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: Current Page Title */}
          <span className="lg:hidden font-semibold text-slate-800 text-sm">
            {currentPage}
          </span>
        </div>

        {/* Right Section - Notifications & User */}
        <div className="flex items-center space-x-2 lg:space-x-4">
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
