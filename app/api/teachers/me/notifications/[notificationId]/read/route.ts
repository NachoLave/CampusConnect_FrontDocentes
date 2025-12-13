import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config/api'
import { errorTracker } from '@/lib/utils/error-tracker'

const BACKEND_BASE_URL = API_CONFIG.BASE_URL

/**
 * Proxy API para marcar notificación como leída
 */
export async function PATCH(
  request: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    // Leer X-Teacher-Id del header de la request (enviado desde el frontend)
    const teacherUUID = request.headers.get('X-Teacher-Id')
    if (!teacherUUID) {
      return NextResponse.json({ error: 'No hay docente autenticado' }, { status: 401 })
    }

    // El endpoint del backend es: /teachers/me/notifications/notificationId/read
    const url = `${BACKEND_BASE_URL}/teachers/me/notifications/${params.notificationId}/read`
    
    console.log(`[Notifications Proxy PATCH] Calling backend: ${url} with X-Teacher-Id: ${teacherUUID}`)
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Teacher-Id': teacherUUID
      },
      cache: 'no-store'
    })

    console.log(`[Notifications Proxy PATCH] Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Notifications Proxy PATCH] Backend error (${response.status}):`, errorText)
      
      // Registrar error en el tracker
      errorTracker.trackError(
        'Notificaciones',
        `/teachers/me/notifications/${params.notificationId}/read`,
        'PATCH',
        response.status,
        errorText || response.statusText,
        { url, teacherUUID, notificationId: params.notificationId }
      )
      
      return NextResponse.json({ error: errorText || response.statusText }, { status: response.status })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in notifications proxy (PATCH):', error)
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}

