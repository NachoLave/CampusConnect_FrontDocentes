'use client'

import { useAnimatedBalance } from '@/lib/hooks/useAnimatedNumber'
import { usePageTransition } from '@/lib/hooks/usePageTransition'

interface AnimatedBalanceProps {
  amount: number
  className?: string
  animated?: boolean
}

export function AnimatedBalance({ 
  amount, 
  className = "text-3xl font-bold text-slate-900", 
  animated = true 
}: AnimatedBalanceProps) {
  const { shouldAnimate } = usePageTransition()
  
  const { formattedValue, displayValue, isAnimating } = useAnimatedBalance(amount, {
    duration: 5000, // 5 segundos para ver claramente cada número
    delay: 1200, // Delay para que se note el inicio
    shouldAnimate: animated && shouldAnimate,
    easing: (t: number) => {
      // Easing más suave para ver mejor cada incremento
      if (t < 0.1) return 0 // Pausa inicial
      // Después linear para ver cada número claramente
      return (t - 0.1) / 0.9
    },
    cacheKey: `home-balance-${amount}` // Caché específico para el saldo de inicio
  })

  return (
    <div className={`${className} transition-all duration-300 relative`}>
      <span className={`${isAnimating ? 'text-green-600 animate-counting-glow' : 'text-slate-900'} transition-colors duration-500 font-mono`}>
        {formattedValue}
      </span>
      {isAnimating && (
        <>
          <span className="inline-block w-0.5 h-8 bg-green-500 ml-1 animate-blink"></span>
          <div className="absolute -inset-1 bg-green-100/20 rounded-lg animate-pulse pointer-events-none"></div>
        </>
      )}
      {isAnimating && displayValue > 100 && (
        <div className="absolute -top-2 -right-2 text-xs text-green-500 animate-bounce">
          💰
        </div>
      )}
    </div>
  )
}
