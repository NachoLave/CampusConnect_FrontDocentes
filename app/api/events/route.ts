import { NextResponse } from 'next/server'
import { errorTracker } from '@/lib/utils/error-tracker'

const EVENTS_API_URL = 'https://eventos-academicos-service-1.onrender.com/api/events'

/**
 * Proxy API para los endpoints de eventos académicos
 * Resuelve problemas de CORS al hacer las peticiones desde el servidor
 */
export async function GET(request: Request) {
  try {
    // Leer userId del header de la request (enviado desde el frontend)
    const userId = request.headers.get('userId')
    if (!userId) {
      console.error('[Events Proxy] No userId header found')
      return NextResponse.json({ error: 'No hay usuario autenticado' }, { status: 401 })
    }

    // Obtener endDate de query params o usar valor por defecto
    const { searchParams } = new URL(request.url)
    const endDate = searchParams.get('endDate') || '9999-12-02'

    const url = `${EVENTS_API_URL}?endDate=${endDate}`
    console.log(`[Events Proxy] Calling backend: ${url} with userId: ${userId}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'userId': userId
      },
      cache: 'no-store'
    })

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
        { url, userId }
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
