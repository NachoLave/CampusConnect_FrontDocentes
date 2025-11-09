'use client'

import { useState, useEffect, useRef } from 'react'

interface UseAnimatedNumberOptions {
  duration?: number // Duración en milisegundos
  delay?: number // Delay antes de empezar
  easing?: (t: number) => number // Función de easing
  shouldAnimate?: boolean // Controla si debe animar
  cacheKey?: string // Clave para cachear la animación
}

// Sistema de caché global para las animaciones
const animationCache = new Set<string>()

export function useAnimatedNumber(
  targetValue: number,
  options: UseAnimatedNumberOptions = {}
) {
  const {
    duration = 4000, // Más tiempo para ver mejor cada número
    delay = 0,
    easing = (t: number) => t, // Linear para ver mejor cada incremento
    shouldAnimate = true,
    cacheKey
  } = options

  const [displayValue, setDisplayValue] = useState(targetValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number>()
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Verificar si ya se animó usando caché
    if (cacheKey && animationCache.has(cacheKey)) {
      setDisplayValue(targetValue)
      setIsAnimating(false)
      return
    }

    if (!shouldAnimate || hasAnimated.current) {
      setDisplayValue(targetValue)
      return
    }

    // Marcar como animado
    hasAnimated.current = true
    if (cacheKey) {
      animationCache.add(cacheKey)
    }

    // Empezar desde 0
    setDisplayValue(0)
    setIsAnimating(true)

    const startAnimation = () => {
      const startTime = performance.now()
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Aplicar easing linear para ver mejor cada incremento
        const easedProgress = easing(progress)
        const currentValue = targetValue * easedProgress
        
        setDisplayValue(currentValue)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setDisplayValue(targetValue)
          setIsAnimating(false)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Aplicar delay si existe
    const timeoutId = setTimeout(startAnimation, delay)

    return () => {
      clearTimeout(timeoutId)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetValue, duration, delay, shouldAnimate, easing, cacheKey])

  return { displayValue, isAnimating }
}

// Hook específico para formatear moneda
export function useAnimatedBalance(
  targetAmount: number,
  options: UseAnimatedNumberOptions = {}
) {
  const { displayValue, isAnimating } = useAnimatedNumber(targetAmount, {
    ...options,
    cacheKey: options.cacheKey || `balance-${targetAmount}` // Caché automático por monto
  })
  
  const formatCurrency = (amount: number): string => {
    // Formatear con incrementos más visibles durante la animación
    // Always show integer (no decimals) as requested: remove comma and decimals
    const roundedAmount = Math.trunc(amount)
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount).replace('ARS', '$')
  }

  return {
    formattedValue: formatCurrency(displayValue),
    displayValue,
    isAnimating
  }
}
