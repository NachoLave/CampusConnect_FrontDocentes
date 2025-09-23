import { Home, BookOpen, Calendar, Wallet, UtensilsCrossed, ShoppingBag, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { SemesterProgress } from "@/components/ui/semester-progress"

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
}

export function Sidebar({ currentPage = "Inicio" }: SidebarProps) {
  return (
    <aside className="w-72 bg-slate-800 min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-slate-200" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">CampusConnect</h2>
            <p className="text-slate-400 text-sm">Portal del Docente</p>
          </div>
        </Link>
      </div>

      <div className="p-6 border-b border-slate-700">
        <SemesterProgress animated={true} />
      </div>

      <nav className="p-6">
        <ul className="space-y-3">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  item.label === currentPage
                    ? "bg-slate-700 text-white shadow-lg border-l-4 border-slate-500"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white hover:translate-x-1",
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
