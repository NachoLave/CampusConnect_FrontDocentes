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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
          <Avatar className="w-9 h-9">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gray-300 text-gray-700 text-sm font-medium">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-900">{user.name}</span>
          <ChevronDown className="h-5 w-5 text-gray-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-96 p-4" sideOffset={8}>
        {/* User Info Section */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gray-300 text-gray-700 text-lg font-medium">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
            <div className="bg-slate-700 text-white px-2 py-1 rounded text-sm font-medium inline-block mb-1">
              {user.id}
            </div>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <Link href="/perfil">
          <DropdownMenuItem className="flex items-center space-x-3 py-3 cursor-pointer">
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-gray-900 font-medium">Mi Perfil</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center space-x-3 py-3 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Cerrar Sesion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
