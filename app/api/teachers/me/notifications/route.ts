import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config/api'
import { errorTracker } from '@/lib/utils/error-tracker'

const BACKEND_BASE_URL = API_CONFIG.BASE_URL

/**
 * Proxy API para los endpoints de notificaciones del módulo docente
 * Resuelve problemas de CORS al hacer las peticiones desde el servidor
 */
export async function GET(request: Request) {
  try {
    // Leer X-Teacher-Id del header de la request (enviado desde el frontend)
    const teacherUUID = request.headers.get('X-Teacher-Id')
    if (!teacherUUID) {
      console.error('[Notifications Proxy] No X-Teacher-Id header found')
      return NextResponse.json({ error: 'No hay docente autenticado' }, { status: 401 })
    }

    const url = `${BACKEND_BASE_URL}${API_CONFIG.ENDPOINTS.TEACHER_NOTIFICATIONS}`
    console.log(`[Notifications Proxy] Calling backend: ${url} with X-Teacher-Id: ${teacherUUID}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Teacher-Id': teacherUUID
      },
      cache: 'no-store'
    })

    console.log(`[Notifications Proxy] Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Notifications Proxy] Backend error (${response.status}):`, errorText)
      
      // Registrar error en el tracker
      errorTracker.trackError(
        'Notificaciones',
        '/teachers/me/notifications',
        'GET',
        response.status,
        errorText || response.statusText,
        { url, teacherUUID }
      )
      
      return NextResponse.json({ error: errorText || response.statusText }, { status: response.status })
    }

    const data = await response.json()
    console.log(`[Notifications Proxy] Success, received ${Array.isArray(data) ? data.length : 'unknown'} items`)
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('[Notifications Proxy] Exception:', error)
    console.error('[Notifications Proxy] Error details:', {
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

