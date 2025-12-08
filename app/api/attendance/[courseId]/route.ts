import { NextRequest, NextResponse } from 'next/server'

const BACKEND_BASE_URL = 'https://modulodocentefinal-production.up.railway.app'

/**
 * Proxy API para el endpoint de asistencia por rango
 * GET /teaching/courses/{courseId}/attendance
 * Esto resuelve el problema de CORS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const url = `${BACKEND_BASE_URL}/teaching/courses/${courseId}/attendance`
    
    // Obtener query params si los hay
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const finalUrl = queryString ? `${url}?${queryString}` : url
    
    // Obtener headers de la request original
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    
    // Pasar headers importantes del cliente al backend
    const xTeacherId = request.headers.get('X-Teacher-Id')
    const xTeacherRoles = request.headers.get('X-Teacher-Roles')
    const xTeacherEmail = request.headers.get('X-Teacher-Email')
    
    if (xTeacherId) headers['X-Teacher-Id'] = xTeacherId
    if (xTeacherRoles) headers['X-Teacher-Roles'] = xTeacherRoles
    if (xTeacherEmail) headers['X-Teacher-Email'] = xTeacherEmail

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers,
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Error del servidor: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en proxy de asistencia por rango:', error)
    return NextResponse.json(
      { error: 'Error al obtener la asistencia' },
      { status: 500 }
    )
  }
}

