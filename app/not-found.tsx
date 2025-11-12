import Link from "next/link"
import { Home, BookOpen, AlertCircle, Calendar, Wallet, UtensilsCrossed, ShoppingBag, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Icon and Status */}
        <div className="text-center space-y-6">
          {/* Large 404 with icon */}
          <div className="relative inline-block">
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertCircle className="h-24 w-24 text-slate-300 opacity-20" />
            </div>
            <h1 className="text-8xl md:text-9xl font-bold text-slate-800 relative">
              404
            </h1>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800">
              Página No Encontrada
            </h2>
            <p className="text-slate-600 text-base md:text-lg max-w-md mx-auto leading-relaxed">
              Lo sentimos, la página que buscas no existe o ha sido movida. 
              Verifica la URL o navega a una de las siguientes secciones.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/">
              <Button 
                size="lg"
                className="bg-slate-800 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group w-full sm:w-auto border-2 border-slate-800 hover:border-slate-700"
              >
                <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Ir al Inicio
              </Button>
            </Link>
            
            <Link href="/cursos">
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 group w-full sm:w-auto"
              >
                <BookOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Ver Mis Cursos
              </Button>
            </Link>
          </div>

          {/* Quick Links Card */}
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Enlaces Rápidos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link 
                href="/calendario" 
                className="flex items-center justify-center space-x-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg p-3 transition-all duration-200 border border-slate-200 hover:border-slate-300"
              >
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Calendario</span>
              </Link>
              <Link 
                href="/billetera" 
                className="flex items-center justify-center space-x-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg p-3 transition-all duration-200 border border-slate-200 hover:border-slate-300"
              >
                <Wallet className="h-4 w-4 text-slate-400" />
                <span>Billetera</span>
              </Link>
              <Link 
                href="/comedor" 
                className="flex items-center justify-center space-x-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg p-3 transition-all duration-200 border border-slate-200 hover:border-slate-300"
              >
                <UtensilsCrossed className="h-4 w-4 text-slate-400" />
                <span>Comedor</span>
              </Link>
              <Link 
                href="/tienda" 
                className="flex items-center justify-center space-x-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg p-3 transition-all duration-200 border border-slate-200 hover:border-slate-300"
              >
                <ShoppingBag className="h-4 w-4 text-slate-400" />
                <span>Tienda</span>
              </Link>
              <Link 
                href="/perfil" 
                className="flex items-center justify-center space-x-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg p-3 transition-all duration-200 border border-slate-200 hover:border-slate-300"
              >
                <User className="h-4 w-4 text-slate-400" />
                <span>Perfil</span>
              </Link>
              <Link 
                href="/cursos" 
                className="flex items-center justify-center space-x-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg p-3 transition-all duration-200 border border-slate-200 hover:border-slate-300"
              >
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span>Cursos</span>
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="pt-8 border-t border-slate-200 mt-8">
            <p className="text-slate-500 text-sm">
              ¿Necesitas ayuda? Contacta al{" "}
              <Link 
                href="/perfil" 
                className="text-slate-700 hover:text-slate-900 underline font-medium transition-colors"
              >
                soporte técnico
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

