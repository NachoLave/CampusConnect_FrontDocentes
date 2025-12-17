import { NextResponse } from 'next/server'
import { errorTracker } from '@/lib/utils/error-tracker'

const EVENTS_API_URL = 'https://eventos-academicos-service-1.onrender.com/api/events'

/**
 * Proxy API para los endpoints de eventos académicos
 * Resuelve problemas de CORS al hacer las peticiones desde el servidor
 */
export async function GET(request: Request) {
  try {
    // Obtener el token desde el header Authorization
    const authHeader = request.headers.get('Authorization')
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    if (!token) {
      console.error('[Events Proxy] No Bearer token found')
      return NextResponse.json({ error: 'Token de autenticación requerido' }, { status: 401 })
    }

    // Obtener userId desde el header (UUID del docente)
    const userId = request.headers.get('userId')
    if (!userId) {
      console.error('[Events Proxy] No userId header found')
      return NextResponse.json({ error: 'Header userId requerido' }, { status: 400 })
    }

    // Obtener endDate de query params o usar valor por defecto
    const { searchParams } = new URL(request.url)
    const endDate = searchParams.get('endDate') || '9999-12-02'

    const url = `${EVENTS_API_URL}?endDate=${endDate}`
    console.log(`[Events Proxy] Calling backend: ${url} with userId: ${userId}`)
    
    // Timeout de 7 segundos en el proxy para no bloquear
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 7000) // 7 segundos
    
    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'userId': userId // Enviar userId al backend
        },
        cache: 'no-store',
        signal: controller.signal
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        console.error('[Events Proxy] Timeout: El endpoint tardó más de 7 segundos')
        errorTracker.trackError(
          'Eventos Académicos',
          '/api/events',
          'GET',
          504, // Gateway Timeout
          'El endpoint tardó demasiado en responder (timeout)',
          { url, timeout: true }
        )
        return NextResponse.json({ error: 'Timeout: El endpoint tardó demasiado en responder' }, { status: 504 })
      }
      
      throw fetchError
    }

    console.log(`[Events Proxy] Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Events Proxy] Backend error (${response.status}):`, errorText)
      
      // Registrar error en el tracker
      errorTracker.trackError(
        'Eventos Académicos',
        '/api/events',
        'GET',
        response.status,
        errorText || response.statusText,
        { url }
      )
      
      return NextResponse.json({ error: errorText || response.statusText }, { status: response.status })
    }

    const data = await response.json()
    console.log(`[Events Proxy] Success, received ${Array.isArray(data) ? data.length : 'unknown'} items`)
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('[Events Proxy] Exception:', error)
    console.error('[Events Proxy] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    return NextResponse.json({ 
      error: error?.message || 'Proxy error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
}
