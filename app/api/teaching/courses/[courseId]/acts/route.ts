import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config/api'

const BACKEND_BASE_URL = API_CONFIG.BASE_URL

/**
 * Proxy API para los endpoints de actas del módulo docente
 * Resuelve problemas de CORS al hacer las peticiones desde el servidor
 */
export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // Leer X-Teacher-Id del header de la request (enviado desde el frontend)
    const teacherUUID = request.headers.get('X-Teacher-Id')
    if (!teacherUUID) {
      return NextResponse.json({ error: 'No hay docente autenticado' }, { status: 401 })
    }

    const url = `${BACKEND_BASE_URL}/teaching/courses/${params.courseId}/acts`
    
    const response = await fetch(url, {
      method: 'GET',
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

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error in acts proxy (GET):', error)
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}

