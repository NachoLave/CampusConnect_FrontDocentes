"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/navbar/header"
import { Sidebar } from "@/components/navbar/sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()

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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={getCurrentPage()} />

      <div className="flex-1 flex flex-col">
        <Header currentPage={getCurrentPage()} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
