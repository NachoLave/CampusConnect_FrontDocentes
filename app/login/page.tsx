'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService, CORE_LOGIN_URL, getRedirectUrl } from '@/lib/api/services/auth'
import { APP_CONFIG } from '@/lib/config/app'
import { apiClient } from '@/lib/utils/api'

function LoginContent() {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [decodedPayload, setDecodedPayload] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar si ya hay sesión o si viene JWT en URL
  useEffect(() => {
    // Si estamos en modo mock, redirigir al dashboard
    if (APP_CONFIG.USE_MOCK_AUTH) {
      router.push('/')
      return
    }

    // Verificar si viene JWT en la URL
    const jwtFromUrl = searchParams.get('JWT')
    if (jwtFromUrl) {
      handleTokenSubmit(jwtFromUrl)
      return
    }

    // Verificar si ya hay sesión válida
    if (authService.isAuthenticated()) {
      router.push('/')
    }
  }, [searchParams, router])

  // Decodificar token en tiempo real para preview
  useEffect(() => {
    if (token.trim()) {
      const payload = authService.decodeJWT(token.trim())
      setDecodedPayload(payload)
    } else {
      setDecodedPayload(null)
    }
  }, [token])

  const handleTokenSubmit = async (tokenToProcess?: string) => {
    const finalToken = (tokenToProcess || token).trim()
    
    if (!finalToken) {
      setError('Por favor ingresa un token JWT')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const success = authService.processJWTFromCore(finalToken)
      
      if (success) {
        // Configurar el token en apiClient
        apiClient.setAuthToken(finalToken)
        
        // Limpiar JWT de la URL si existe
        const url = new URL(window.location.href)
        if (url.searchParams.has('JWT')) {
          url.searchParams.delete('JWT')
          window.history.replaceState({}, '', url.toString())
        }
        
        // Redirigir al dashboard
        router.push('/')
      } else {
        setError('El token es inválido o está expirado. Por favor obtén uno nuevo desde Core.')
      }
    } catch (err) {
      setError('Error procesando el token: ' + (err instanceof Error ? err.message : 'Error desconocido'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGoToCore = () => {
    const redirectUrl = encodeURIComponent(getRedirectUrl())
    window.open(`${CORE_LOGIN_URL}/?redirectUrl=${redirectUrl}`, '_blank')
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">CampusConnect</h1>
          </div>
          <h2 className="text-xl text-slate-300 font-medium">Portal del Docente</h2>
          <p className="text-slate-400 mt-2">Modo Desarrollo Local</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <h3 className="text-blue-400 font-semibold flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cómo obtener el token
            </h3>
            <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
              <li>Abre el login de Core en una nueva pestaña</li>
              <li>Inicia sesión con tu usuario y contraseña</li>
              <li>Selecciona el módulo "Docentes" o similar</li>
              <li>Copia el parámetro <code className="bg-slate-700 px-1.5 py-0.5 rounded text-emerald-400">JWT</code> de la URL</li>
              <li>Pégalo aquí abajo</li>
            </ol>
          </div>

          {/* Open Core Button */}
          <button
            onClick={handleGoToCore}
            className="w-full mb-6 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Abrir Login de Core
          </button>

          {/* Token Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Token JWT
              </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Pega aquí el token JWT (ej: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
                className="w-full h-32 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm resize-none"
              />
            </div>

            {/* Token Preview */}
            {decodedPayload && (
              <div className="p-4 bg-slate-900/50 border border-slate-600 rounded-xl">
                <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Vista previa del token (Payload completo)
                </h4>
                
                {/* Información de expiración */}
                {decodedPayload.exp && (
                  <div className={`mb-3 p-2 rounded-lg text-sm ${Date.now() / 1000 > decodedPayload.exp ? 'bg-red-500/20 border border-red-500/30' : 'bg-emerald-500/20 border border-emerald-500/30'}`}>
                    <span className={Date.now() / 1000 > decodedPayload.exp ? 'text-red-400' : 'text-emerald-400'}>
                      {Date.now() / 1000 > decodedPayload.exp ? '⚠️ TOKEN EXPIRADO' : '✅ Token válido'} - Expira: {formatDate(decodedPayload.exp)}
                    </span>
                  </div>
                )}

                {/* Payload completo en JSON */}
                <div className="bg-slate-950 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(decodedPayload, null, 2)}
                  </pre>
                </div>

                {/* Campos clave identificados */}
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <h5 className="text-xs font-medium text-slate-500 mb-2">Campos identificados:</h5>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {Object.entries(decodedPayload).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="text-emerald-400 font-mono min-w-[120px]">{key}:</span>
                        <span className="text-slate-300 font-mono break-all">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={() => handleTokenSubmit()}
              disabled={isProcessing || !token.trim()}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar Sesión
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            URL de Core: <a href={CORE_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">{CORE_LOGIN_URL}</a>
          </p>
          <p className="mt-1">
            Este formulario solo está disponible en desarrollo local
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

