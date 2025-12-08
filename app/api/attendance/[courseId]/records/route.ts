import { NextRequest, NextResponse } from 'next/server'

const BACKEND_BASE_URL = 'https://modulodocentefinal-production.up.railway.app'

/**
 * Proxy API para el endpoint de registros de asistencia
 * GET /teaching/courses/{courseId}/attendance/records
 * Esto resuelve el problema de CORS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const url = `${BACKEND_BASE_URL}/teaching/courses/${courseId}/attendance/records`
    
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

    const response = await fetch(url, {
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
    console.error('Error en proxy de registros de asistencia:', error)
    return NextResponse.json(
      { error: 'Error al obtener los registros de asistencia' },
      { status: 500 }
    )
  }
}

