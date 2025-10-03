"use client"
import { ChevronDown, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    avatar?: string
  }
}

export function UserDropdown({ user }: UserDropdownProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors flex-shrink-0">
          <Avatar className="w-8 h-8 lg:w-9 lg:h-9 flex-shrink-0">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gray-300 text-gray-700 text-xs lg:text-sm font-medium">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm font-medium text-gray-900 whitespace-nowrap">{user.name}</span>
          <ChevronDown className="hidden md:inline h-5 w-5 text-gray-600 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-80 lg:max-w-96 lg:w-96 p-3 lg:p-4 mr-2" sideOffset={8}>
        {/* User Info Section */}
        <div className="flex items-center space-x-2 lg:space-x-3 mb-3 lg:mb-4">
          <Avatar className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gray-300 text-gray-700 text-base lg:text-lg font-medium">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
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
