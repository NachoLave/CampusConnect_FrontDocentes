import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config/api'

const BACKEND_BASE_URL = API_CONFIG.BASE_URL

/**
 * Proxy API para confirmar/generar acta
 */
export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // Leer X-Teacher-Id del header de la request (enviado desde el frontend)
    const teacherUUID = request.headers.get('X-Teacher-Id')
    if (!teacherUUID) {
      return NextResponse.json({ error: 'No hay docente autenticado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const url = `${BACKEND_BASE_URL}/teaching/courses/${params.courseId}/acts:confirm`
    
    const response = await fetch(url, {
      method: 'POST',
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

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error in acts confirm proxy (POST):', error)
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}

