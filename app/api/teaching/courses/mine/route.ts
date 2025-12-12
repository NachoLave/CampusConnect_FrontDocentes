import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config/api'

const BACKEND_BASE_URL = API_CONFIG.BASE_URL

/**
 * Proxy API para el endpoint de cursos del docente
 * Resuelve problemas de CORS al hacer las peticiones desde el servidor
 */
export async function GET(request: Request) {
  try {
    // Leer X-Teacher-Id del header de la request (enviado desde el frontend)
    const teacherUUID = request.headers.get('X-Teacher-Id')
    if (!teacherUUID) {
      return NextResponse.json({ error: 'No hay docente autenticado' }, { status: 401 })
    }

    // Obtener query parameters
    const { searchParams } = new URL(request.url)
    const term = searchParams.get('term')
    const includePrevious = searchParams.get('includePrevious')
    
    // Construir URL con query params
    const queryParams = new URLSearchParams()
    if (term) queryParams.append('term', term)
    if (includePrevious) queryParams.append('includePrevious', includePrevious)
    
    const queryString = queryParams.toString()
    const url = `${BACKEND_BASE_URL}/teaching/courses/mine${queryString ? `?${queryString}` : ''}`
    
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
    console.error('Error in courses/mine proxy (GET):', error)
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}

