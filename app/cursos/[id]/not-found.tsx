import Link from "next/link"
import { BookOpen, Home, AlertTriangle, Search, List, CheckCircle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CourseNotFound() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Icon and Status */}
        <div className="text-center space-y-6">
          {/* Course not found icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-slate-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center border-4 border-white">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800">
              Curso No Encontrado
            </h2>
            <p className="text-slate-600 text-base md:text-lg max-w-md mx-auto leading-relaxed">
              El curso que buscas no existe, no está disponible o no tienes acceso a él. 
              Verifica el código del curso o consulta tu lista de cursos asignados.
            </p>
          </div>

          {/* Info box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <Search className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Posibles causas:
                </p>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• El código del curso es incorrecto</li>
                  <li>• No tienes asignado este curso</li>
                  <li>• El curso ha sido eliminado o finalizado</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/cursos">
              <Button 
                size="lg"
                className="bg-slate-800 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group w-full sm:w-auto border-2 border-slate-800 hover:border-slate-700"
              >
                <BookOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Ver Mis Cursos
              </Button>
            </Link>
            
            <Link href="/">
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 group w-full sm:w-auto"
              >
                <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Ir al Inicio
              </Button>
            </Link>
          </div>

          {/* Suggestions */}
          <div className="mt-10 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              ¿Qué puedes hacer?
            </h3>
            <div className="grid gap-3 text-left">
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <List className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Revisa tu lista de cursos
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Verifica los cursos que tienes asignados actualmente
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Verifica el código del curso
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Asegúrate de que el código ingresado sea correcto
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Contacta a soporte
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Si el problema persiste, comunícate con el administrador
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="pt-8 border-t border-slate-200 mt-8">
            <p className="text-slate-500 text-sm">
              ¿Crees que esto es un error?{" "}
              <Link 
                href="/perfil" 
                className="text-slate-700 hover:text-slate-900 underline font-medium transition-colors"
              >
                Contacta al administrador
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

