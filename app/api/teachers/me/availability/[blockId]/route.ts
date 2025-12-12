import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config/api'

const BACKEND_BASE_URL = API_CONFIG.BASE_URL

/**
 * Proxy API para endpoints específicos de disponibilidad (PATCH, DELETE)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { blockId: string } }
) {
  try {
    // Leer X-Teacher-Id del header de la request (enviado desde el frontend)
    const teacherUUID = request.headers.get('X-Teacher-Id')
    if (!teacherUUID) {
      return NextResponse.json({ error: 'No hay docente autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const url = `${BACKEND_BASE_URL}${API_CONFIG.ENDPOINTS.TEACHER_AVAILABILITY}/${params.blockId}`
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Teacher-Id': teacherUUID
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText || response.statusText }, { status: response.status })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in availability proxy (PATCH):', error)
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { blockId: string } }
) {
  try {
    // Leer X-Teacher-Id del header de la request (enviado desde el frontend)
    const teacherUUID = request.headers.get('X-Teacher-Id')
    if (!teacherUUID) {
      return NextResponse.json({ error: 'No hay docente autenticado' }, { status: 401 })
    }

    const url = `${BACKEND_BASE_URL}${API_CONFIG.ENDPOINTS.TEACHER_AVAILABILITY}/${params.blockId}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Teacher-Id': teacherUUID
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText || response.statusText }, { status: response.status })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in availability proxy (DELETE):', error)
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}

