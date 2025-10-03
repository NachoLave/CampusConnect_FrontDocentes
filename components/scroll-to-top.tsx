"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll al principio de la página cuando cambia la ruta
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // Instantáneo, sin animación suave
    })
  }, [pathname])

  return null
}

