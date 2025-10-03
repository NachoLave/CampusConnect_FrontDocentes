"use client"

import { useEffect, useState } from "react"
import { Monitor, X } from "lucide-react"

export function MobileWarning() {
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Check if the device is mobile
    const checkIfMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isSmallScreen = window.innerWidth < 1024
      return isMobile || isSmallScreen
    }

    const isMobileDevice = checkIfMobile()
    
    if (isMobileDevice) {
      setShowWarning(true)
    }
  }, [])

  const handleDismiss = () => {
    setShowWarning(false)
  }

  if (!showWarning) {
    return null
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={handleDismiss} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-8 relative animate-in fade-in zoom-in duration-300 my-auto">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-3 sm:mb-5">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 px-1">
              Mejor experiencia en escritorio
            </h2>
            <p className="text-xs sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Para una experiencia óptima, te recomendamos acceder a{" "}
              <span className="font-semibold text-gray-900">CampusConnect</span> desde una
              computadora de escritorio.
            </p>

            {/* Action button */}
            <button
              onClick={handleDismiss}
              className="w-full bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white font-medium py-2.5 sm:py-3.5 px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              Entendido
            </button>

            <p className="text-xs text-gray-500 mt-3 sm:mt-4 leading-snug">
              Puedes continuar en este dispositivo, pero algunas funciones pueden no estar optimizadas.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

