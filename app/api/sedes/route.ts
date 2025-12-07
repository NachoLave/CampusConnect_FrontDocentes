import { NextResponse } from 'next/server'

/**
 * Proxy API para el endpoint de sedes del Backoffice
 * Esto resuelve el problema de CORS al hacer la petición desde el servidor
 */
export async function GET() {
  try {
    const response = await fetch(
      'https://backoffice-production-df78.up.railway.app/api/v1/sedes/?skip=0&limit=100',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Evitar cache para obtener datos frescos
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error del servidor: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en proxy de sedes:', error)
    return NextResponse.json(
      { error: 'Error al obtener las sedes' },
      { status: 500 }
    )
  }
}

