"use client"
import { ChevronDown, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface UserDropdownProps {
  user: {
    name: string
    id: string
    email: string
    teacherId?: number
  }
}

/**
 * Extrae las iniciales del nombre completo del docente.
 * NO está hardcodeado - el nombre viene dinámicamente desde el endpoint GET /teachers/me
 * 
 * Ejemplos:
 * - "Ada Lovelace" → "AL"
 * - "Juan Pérez" → "JP"
 * - "María" → "MA"
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Asigna un color consistente basado en el teacherId.
 * El color se determina usando módulo (%) para que siempre sea el mismo para cada docente.
 * 
 * Fórmula: teacherId % 10 = índice en el array de colores
 * 
 * Ejemplo:
 * - teacherId 1010 → 1010 % 10 = 0 → bg-rose-500 (Rosa)
 * - teacherId 1015 → 1015 % 10 = 5 → bg-pink-500 (Rosa fucsia)
 * - teacherId 1023 → 1023 % 10 = 3 → bg-violet-500 (Violeta)
 * 
 * Esto garantiza que el mismo docente siempre tenga el mismo color en toda la aplicación.
 */
function getUserColor(teacherId?: number): string {
  if (!teacherId) return 'bg-gray-500'
  
  const colors = [
    'bg-rose-500',      // 0: Rosa
    'bg-blue-500',      // 1: Azul
    'bg-emerald-500',   // 2: Verde esmeralda
    'bg-violet-500',    // 3: Violeta
    'bg-amber-500',     // 4: Ámbar
    'bg-pink-500',      // 5: Rosa fucsia
    'bg-cyan-500',      // 6: Cian
    'bg-teal-500',      // 7: Verde azulado
    'bg-orange-500',    // 8: Naranja
    'bg-purple-500',    // 9: Púrpura
  ]
  return colors[teacherId % colors.length]
}

export function UserDropdown({ user }: UserDropdownProps) {
  const initials = getInitials(user.name)
  const colorClass = getUserColor(user.teacherId)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors flex-shrink-0">
          <div className={`w-7 h-7 lg:w-8 lg:h-8 flex-shrink-0 rounded-full ${colorClass} flex items-center justify-center text-white font-semibold text-[10px] lg:text-xs`}>
            {initials}
          </div>
          <span className="hidden md:inline text-sm font-medium text-gray-900 whitespace-nowrap">{user.name}</span>
          <ChevronDown className="hidden md:inline h-4 w-4 text-gray-600 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-80 lg:max-w-96 lg:w-96 p-3 lg:p-4 mr-2" sideOffset={8}>
        {/* User Info Section */}
        <div className="flex items-center space-x-2 lg:space-x-3 mb-3 lg:mb-4">
          <div className={`w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0 rounded-full ${colorClass} flex items-center justify-center text-white font-semibold text-base lg:text-lg`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm lg:text-lg truncate">{user.name}</h3>
            <div className="bg-slate-700 text-white px-2 py-0.5 lg:py-1 rounded text-xs lg:text-sm font-medium inline-block mb-1">
              {user.id}
            </div>
            <p className="text-gray-600 text-xs lg:text-sm truncate">{user.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <Link href="/perfil">
          <DropdownMenuItem className="flex items-center space-x-2 lg:space-x-3 py-2 lg:py-3 cursor-pointer">
            <User className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600 flex-shrink-0" />
            <span className="text-gray-900 font-medium text-sm lg:text-base">Mi Perfil</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center space-x-2 lg:space-x-3 py-2 lg:py-3 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
          <span className="font-medium text-sm lg:text-base">Cerrar Sesion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
