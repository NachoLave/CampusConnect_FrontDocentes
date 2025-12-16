"use client"
import { ChevronDown, User, LogOut, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuthContext } from "@/components/auth/AuthProvider"
import { APP_CONFIG } from "@/lib/config/app"

interface UserDropdownProps {
  user: {
    name: string
    id: string           // Puede ser legajo o UUID
    email: string
    teacherId?: number   // Legacy: ID numérico del backend
    uuid?: string        // Nuevo: UUID del docente desde JWT
  }
}

/**
 * Extrae las iniciales del nombre completo del docente.
 * NO está hardcodeado - el nombre viene dinámicamente desde el JWT o endpoint
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
 * Genera un hash numérico simple a partir de un string (para UUIDs)
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Asigna un color consistente basado en el UUID o teacherId.
 * - Si hay UUID, usa un hash del string
 * - Si hay teacherId numérico, usa módulo
 * 
 * Esto garantiza que el mismo docente siempre tenga el mismo color.
 */
function getUserColor(uuid?: string, teacherId?: number): string {
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

  // Priorizar UUID si está disponible
  if (uuid) {
    const hash = hashString(uuid)
    return colors[hash % colors.length]
  }
  
  // Fallback a teacherId numérico
  if (teacherId) {
    return colors[teacherId % colors.length]
  }
  
  return 'bg-gray-500'
}


/**
 * Formatea el tiempo restante en formato legible
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expirado'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function UserDropdown({ user }: UserDropdownProps) {
  const { logout, tokenTimeRemaining } = useAuthContext()
  const initials = getInitials(user.name)
  const colorClass = getUserColor(user.uuid, user.teacherId)

  const handleLogout = () => {
    logout()
  }

  // Determinar si el token está por expirar (menos de 10 minutos)
  const isTokenExpiringSoon = tokenTimeRemaining > 0 && tokenTimeRemaining < 600

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
            <p className="text-gray-600 text-xs lg:text-sm truncate">{user.email}</p>
          </div>
        </div>

        {/* Token Time Remaining (solo si no es mock) */}
        {!APP_CONFIG.USE_MOCK_AUTH && tokenTimeRemaining > 0 && (
          <>
            <div className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs ${isTokenExpiringSoon ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>
                Sesión expira en: <strong>{formatTimeRemaining(tokenTimeRemaining)}</strong>
              </span>
            </div>
            <DropdownMenuSeparator className="my-2" />
          </>
        )}

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <Link href="/perfil">
          <DropdownMenuItem className="flex items-center space-x-2 lg:space-x-3 py-2 lg:py-3 cursor-pointer">
            <User className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600 flex-shrink-0" />
            <span className="text-gray-900 font-medium text-sm lg:text-base">Mi Perfil</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          className="flex items-center space-x-2 lg:space-x-3 py-2 lg:py-3 cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
          <span className="font-medium text-sm lg:text-base">Volver al Inicio</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
