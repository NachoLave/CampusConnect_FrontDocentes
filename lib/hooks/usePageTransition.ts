'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function usePageTransition() {
  const [isHomePage, setIsHomePage] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const currentIsHome = pathname === '/'
    setIsHomePage(currentIsHome)

    // Si llegamos a la página de inicio y no hemos animado aún, activar animación
    if (currentIsHome && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [pathname, hasAnimated])

  // Reset animation cuando salimos de inicio
  useEffect(() => {
    if (!isHomePage) {
      setHasAnimated(false)
    }
  }, [isHomePage])

  return {
    isHomePage,
    shouldAnimate: isHomePage && hasAnimated
  }
}
