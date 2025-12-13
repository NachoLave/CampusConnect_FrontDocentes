import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config/api'

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

    const url = `${BACKEND_BASE_URL}${API_CONFIG.ENDPOINTS.TEACHER_NOTIFICATIONS}/${params.notificationId}/read`
    
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
      return NextResponse.json({ error: errorText || response.statusText }, { status: response.status })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in notifications proxy (PATCH):', error)
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}

