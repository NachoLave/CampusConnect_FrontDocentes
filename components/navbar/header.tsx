"use client"
import { useState } from "react"
import { ChevronRight, Menu } from "lucide-react"
import Link from "next/link"
import { NotificationsDropdown } from "./notifications-dropdown"
import { UserDropdown } from "./user-dropdown"
import { useNotifications } from "@/lib/hooks/useNotifications"
import { useTeacherProfile } from "@/lib/hooks"

interface HeaderProps {
  currentPage: string
  onMenuClick?: () => void
}

// Componente de shimmer para el usuario
function UserSkeleton() {
  return (
    <div className="flex items-center space-x-2 px-2 py-1.5">
      <div className="relative overflow-hidden w-7 h-7 lg:w-8 lg:h-8 bg-gray-300 rounded-full">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="hidden md:block relative overflow-hidden h-5 w-32 bg-gray-200 rounded">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
    </div>
  )
}

export function Header({ currentPage, onMenuClick }: HeaderProps) {
  // Usar el hook real de notificaciones
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications()

  // Usar el hook real del perfil del docente
  const { profile, isLoading, error } = useTeacherProfile()

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
        <div className="flex items-center space-x-4 lg:space-x-6">
          <NotificationsDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllAsRead}
            onMarkAsRead={markAsRead}
          />

          {isLoading ? (
            <UserSkeleton />
          ) : error ? (
            <div className="text-red-600 text-xs">Error</div>
          ) : profile ? (
            <UserDropdown 
              user={{
                name: profile.name,
                id: profile.legajo,
                email: profile.email,
                teacherId: profile.teacherId,
                uuid: profile.uuid
              }} 
            />
          ) : null}
        </div>
      </div>
    </header>
  )
}
