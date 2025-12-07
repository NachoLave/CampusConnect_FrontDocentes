'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { AuthProvider, useAuthContext } from './AuthProvider'
import { MainLayout } from '@/components/layout/main-layout'
import { APP_CONFIG } from '@/lib/config/app'

// Páginas que no requieren autenticación
const PUBLIC_PATHS = ['/login']

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuthContext()
  const pathname = usePathname()

  // Si es una ruta pública, mostrar sin layout
  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>
  }

  // Mostrar loader mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado y no es ruta pública, el AuthProvider redirigirá
  if (!isAuthenticated && !APP_CONFIG.USE_MOCK_AUTH) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  // Usuario autenticado, mostrar contenido con layout
  return <MainLayout>{children}</MainLayout>
}

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthProvider>
        <AuthenticatedContent>{children}</AuthenticatedContent>
      </AuthProvider>
    </Suspense>
  )
}

