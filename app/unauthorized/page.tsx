'use client'

import { AlertCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/navbar/header'

export default function Unauthorized() {
  const handleRedirect = () => {
    window.location.href = 'https://core-frontend-2025-02.netlify.app/home'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="Acceso No Autorizado" />
      <div className="pt-14 lg:pt-[73px] min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Icon and Status */}
          <div className="text-center space-y-6">
            {/* Large 403 with icon */}
            <div className="relative inline-block">
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertCircle className="h-24 w-24 text-red-300 opacity-20" />
              </div>
              <h1 className="text-8xl md:text-9xl font-bold text-slate-800 relative">
                403
              </h1>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-800">
                Acceso No Autorizado
              </h2>
              <p className="text-slate-600 text-base md:text-lg max-w-md mx-auto leading-relaxed">
                No tienes permisos para acceder a este módulo. Este módulo está disponible únicamente para Docentes.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button 
                size="lg"
                onClick={handleRedirect}
                className="bg-slate-800 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group w-full sm:w-auto border-2 border-slate-800 hover:border-slate-700"
              >
                <LogOut className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Volver al Inicio
              </Button>
            </div>

            {/* Info Section */}
            <div className="mt-12 space-y-6">
              <h3 className="text-base font-semibold text-slate-700 text-center">
                Información Importante
              </h3>
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="flex gap-4 p-5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200 bg-white shadow-sm">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mt-0.5">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-800 mb-1.5">
                      Acceso Restringido
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Este módulo requiere el rol de DOCENTE para acceder. Tu cuenta actual no tiene los permisos necesarios.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200 bg-white shadow-sm">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mt-0.5">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-800 mb-1.5">
                      ¿Necesitas Acceso?
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Si crees que esto es un error, contacta al administrador del sistema para verificar tu rol de usuario.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="pt-8 border-t border-slate-200 mt-8">
              <p className="text-slate-500 text-sm">
                ¿Necesitas ayuda? Contacta al{" "}
                <a 
                  href="https://core-frontend-2025-02.netlify.app/home" 
                  className="text-slate-700 hover:text-slate-900 underline font-medium transition-colors"
                >
                  soporte técnico
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
