'use client'

import { useEffect, useState, useRef } from 'react'
import { getCurrentSemesterInfo, formatSemesterProgress, getProgressColor, getProgressTextColor, getSemesterMonths } from '@/lib/utils/semester'
import { usePageTransition } from '@/lib/hooks/usePageTransition'

// Sistema de caché para la barra de progreso
const progressCache = new Set<string>()

interface SemesterProgressProps {
  animated?: boolean
  className?: string
}

export function SemesterProgress({ animated = true, className = "" }: SemesterProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const hasAnimated = useRef(false)
  
  const { shouldAnimate } = usePageTransition()
  const semesterInfo = getCurrentSemesterInfo()
  const progressText = formatSemesterProgress(semesterInfo)
  const progressColor = getProgressColor(semesterInfo.progress)
  const textColor = getProgressTextColor(semesterInfo.progress)
  
  const cacheKey = `semester-progress-${semesterInfo.year}-${semesterInfo.semester}-${semesterInfo.progress}`

  useEffect(() => {
    // Verificar si ya se animó usando caché
    if (progressCache.has(cacheKey) || hasAnimated.current) {
      setDisplayProgress(semesterInfo.progress)
      setIsAnimating(false)
      return
    }

    if (animated && shouldAnimate) {
      // Marcar como animado
      hasAnimated.current = true
      progressCache.add(cacheKey)
      
      // Reset para empezar la animación desde 0
      setDisplayProgress(0)
      setIsAnimating(true)
      
      // Pequeño delay para que se note el efecto
      const initialDelay = setTimeout(() => {
        // Animación progresiva de la barra más suave
        const duration = 3000 // 3 segundos para ver mejor el progreso
        const steps = 100 // Más steps para animación más suave
        const increment = semesterInfo.progress / steps
        const stepDuration = duration / steps

        let currentStep = 0
        const timer = setInterval(() => {
          currentStep++
          const newProgress = Math.min(semesterInfo.progress, increment * currentStep)
          setDisplayProgress(newProgress)

          if (currentStep >= steps || newProgress >= semesterInfo.progress) {
            clearInterval(timer)
            setDisplayProgress(semesterInfo.progress)
            setIsAnimating(false)
          }
        }, stepDuration)

        return () => clearInterval(timer)
      }, 800) // Delay inicial de 800ms

      return () => clearTimeout(initialDelay)
    } else {
      // Si no debe animar, mostrar progreso inmediatamente
      setDisplayProgress(semesterInfo.progress)
      setIsAnimating(false)
    }
  }, [semesterInfo.progress, animated, shouldAnimate, cacheKey])

  return (
    <div className={`${className}`}>
      {/* Header del cuatrimestre */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-slate-300 text-sm font-medium">
            Cuatrimestre {semesterInfo.displayName}
          </span>
          <div className="text-slate-400 text-xs mt-0.5">
            {getSemesterMonths(semesterInfo.semester)}
          </div>
        </div>
        <div className={`text-xs font-medium ${textColor} transition-colors duration-500 ${isAnimating ? 'animate-count-up' : ''}`}>
          {Math.round(displayProgress)}%
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="relative">
        <div className="w-full bg-slate-700/80 rounded-full h-3 overflow-hidden shadow-inner backdrop-blur-sm">
          <div 
            className={`h-3 rounded-full transition-all duration-200 ease-out relative ${progressColor} shadow-lg`}
            style={{ 
              width: `${displayProgress}%`,
              transition: isAnimating ? 'width 0.05s ease-out, box-shadow 0.3s ease-out' : 'width 0.5s ease-out',
              boxShadow: isAnimating ? '0 0 10px #cbd5e140' : 'none' // Color slate-300 con transparencia
            }}
          >
            {/* Efecto de brillo animado en la barra */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent">
              <div className={`w-full h-full ${isAnimating ? 'animate-pulse' : ''}`}></div>
            </div>
            
            {/* Shimmer effect cuando está animando */}
            {isAnimating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
            )}
          </div>
        </div>
        
        {/* Efecto de partículas cuando está animando */}
        {isAnimating && displayProgress > 0 && (
          <div className="absolute -top-2 -bottom-2 left-0 right-0 pointer-events-none">
            {/* Partícula principal */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1 transition-all duration-75 ease-out"
              style={{ left: `${displayProgress}%` }}
            >
              <div className={`w-3 h-3 rounded-full ${progressColor} opacity-90 animate-ping`}></div>
              <div className={`absolute inset-0 w-3 h-3 rounded-full ${progressColor} animate-pulse`}></div>
            </div>
            
            {/* Partículas adicionales */}
            {displayProgress > 10 && (
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 animate-bounce"
                style={{ left: `${displayProgress * 0.7}%` }}
              >
                <div className={`w-1 h-1 rounded-full ${progressColor} opacity-60`}></div>
              </div>
            )}
            
            {displayProgress > 30 && (
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 animate-pulse"
                style={{ left: `${displayProgress * 0.4}%` }}
              >
                <div className={`w-1 h-1 rounded-full ${progressColor} opacity-40`}></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Texto de progreso */}
      <div className="flex justify-between items-center mt-2">
        <p className={`text-xs transition-colors duration-500 ${textColor}`}>
          {progressText}
        </p>
        {semesterInfo.remainingDays > 0 && semesterInfo.progress < 100 && (
          <p className="text-slate-500 text-xs">
            {semesterInfo.remainingDays} días restantes
          </p>
        )}
      </div>

      {/* Información adicional siempre visible */}
      <div className="mt-3 pt-3 border-t border-slate-600/20">
        <div className="text-xs text-slate-400 space-y-2">
          <div className="flex justify-between">
            <span>Inicio:</span>
            <span className="text-slate-300">{semesterInfo.startDate.toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long' 
            })}</span>
          </div>
          <div className="flex justify-between">
            <span>Fin:</span>
            <span className="text-slate-300">{semesterInfo.endDate.toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long' 
            })}</span>
          </div>
          <div className="flex justify-between">
            <span>Días transcurridos:</span>
            <span className="text-slate-300">{semesterInfo.elapsedDays} de {semesterInfo.totalDays}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
