"use client"

import { useState } from "react"
import { Home, BookOpen, Calendar, Wallet, UtensilsCrossed, ShoppingBag, GraduationCap, X, Fingerprint } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { SemesterProgress } from "@/components/ui/semester-progress"
import { authService } from "@/lib/api/services/auth"

const menuItems = [
  { icon: Home, label: "Inicio", href: "/" },
  { icon: BookOpen, label: "Mis Cursos", href: "/cursos" },
  { icon: Calendar, label: "Calendario", href: "/calendario" },
  { icon: Wallet, label: "Billetera", href: "/billetera" },
  { icon: UtensilsCrossed, label: "Comedor", href: "/comedor" },
  { icon: ShoppingBag, label: "Tienda", href: "/tienda" },
]

interface SidebarProps {
  currentPage?: string
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ currentPage = "Inicio", isOpen = false, onClose }: SidebarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyToken = async () => {
    const token = authService.getToken()
    if (!token) {
      return
    }

    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error al copiar token:', error)
    }
  }

  return (
    <>
      {/* Badge flotante de confirmación - fuera del sidebar */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-none">
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Fingerprint className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Token copiado en el portapapeles</span>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-72 bg-slate-800 h-screen fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button - Mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-3 right-3 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-4 lg:p-6 border-b border-slate-700 flex-shrink-0">
          <Link 
            href="/" 
            className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105" 
            onClick={onClose}
          >
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-slate-500 group-hover:shadow-lg group-hover:shadow-slate-900/50 transition-all duration-300">
              <GraduationCap className="h-5 w-5 lg:h-6 lg:w-6 text-slate-200 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-base lg:text-lg truncate group-hover:text-slate-100 transition-colors duration-300">CampusConnect</h2>
              <p className="text-slate-400 text-xs lg:text-sm truncate group-hover:text-slate-300 transition-colors duration-300">Portal del Docente</p>
            </div>
          </Link>
        </div>

        <div className="p-4 lg:p-6 border-b border-slate-700 flex-shrink-0">
          <SemesterProgress animated={true} />
        </div>

        <nav className="p-4 lg:p-6 flex-1 overflow-y-auto">
          <ul className="space-y-2 lg:space-y-3">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center space-x-3 lg:space-x-4 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    item.label === currentPage
                      ? "bg-slate-700 text-white shadow-lg border-l-4 border-slate-500"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white hover:translate-x-1",
                  )}
                >
                  <item.icon className="h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Botón para copiar token - esquina inferior derecha */}
        <div className="relative flex-shrink-0">
          <button
            onClick={handleCopyToken}
            className="absolute bottom-4 right-4 p-2.5 bg-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-600 rounded-lg transition-all duration-200 shadow-md"
            title="Copiar token del docente"
          >
            <Fingerprint className="h-5 w-5" />
          </button>
        </div>
      </aside>
    </>
  )
}
