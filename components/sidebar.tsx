import { Home, BookOpen, Calendar, Wallet, UtensilsCrossed, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: Home, label: "Inicio", active: true },
  { icon: BookOpen, label: "Mis Cursos", active: false },
  { icon: Calendar, label: "Calendario", active: false },
  { icon: Wallet, label: "Billetera", active: false },
  { icon: UtensilsCrossed, label: "Comedor", active: false },
  { icon: ShoppingBag, label: "Tienda", active: false },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-800 min-h-[calc(100vh-73px)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  item.active ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
