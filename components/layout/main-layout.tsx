"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/navbar/header"
import { Sidebar } from "@/components/navbar/sidebar"
import { MobileWarning } from "@/components/mobile-warning"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getCurrentPage = () => {
    if (pathname === "/") return "Inicio"
    if (pathname.startsWith("/cursos")) return "Mis Cursos"
    if (pathname.startsWith("/calendario")) return "Calendario"
    if (pathname.startsWith("/billetera")) return "Billetera"
    if (pathname.startsWith("/comedor")) return "Comedor"
    if (pathname.startsWith("/tienda")) return "Tienda"
    if (pathname.startsWith("/perfil")) return "Perfil"
    return "Portal del Docente"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileWarning />
      <Sidebar 
        currentPage={getCurrentPage()} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Header 
        currentPage={getCurrentPage()}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="lg:ml-72 mt-14 lg:mt-[73px]">
        <main
          className={
            pathname.startsWith("/cursos/") && pathname.split("/").filter(Boolean).length === 2
              ? "p-0"
              : "p-4 lg:p-6"
          }
        >
          {children}
        </main>
      </div>
    </div>
  )
}
