"use client"
import { useState } from "react"
import { ChevronRight, Menu } from "lucide-react"
import Link from "next/link"
import { NotificationsDropdown } from "./notifications-dropdown"
import { UserDropdown } from "./user-dropdown"
import { useNotifications } from "@/lib/hooks/useNotifications"

// Mock data - in a real app, this would come from your API/state management
const mockUser = {
  name: "Juan Sánchez",
  id: "11223344",
  email: "juan.sanchez@campusconnect.com.ar",
  avatar: "/placeholder-user.jpg",
}

interface HeaderProps {
  currentPage: string
  onMenuClick?: () => void
}

export function Header({ currentPage, onMenuClick }: HeaderProps) {
  // Usar el hook real de notificaciones
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications()

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
            onMarkAllRead={markAllAsRead}
            onMarkAsRead={markAsRead}
          />

          <UserDropdown user={mockUser} />
        </div>
      </div>
    </header>
  )
}
