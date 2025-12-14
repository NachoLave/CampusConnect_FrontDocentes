import { NextResponse } from 'next/server'
import { errorTracker } from '@/lib/utils/error-tracker'

export async function GET(request: Request) {
  try {
    // Obtener el token desde el header Authorization
    const authHeader = request.headers.get('Authorization')
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    if (!token) {
      return NextResponse.json({ error: 'Token de autenticación requerido' }, { status: 401 })
    }

    // Llamar al nuevo endpoint de Azure con Bearer Token
    const url = 'https://comedorback.azurewebsites.net/reservations/mine'
    
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    })

    if (!resp.ok) {
      const text = await resp.text()
      
      // Registrar error en el tracker
      errorTracker.trackError(
        'Comedor',
        '/api/canteen/reservations',
        'GET',
        resp.status,
        text || resp.statusText,
        { url }
      )
      
      return NextResponse.json({ error: text || resp.statusText }, { status: resp.status })
    }

    // La respuesta puede venir vacía si no hay reservas
    const data = await resp.json()
    
    // Asegurarse de que siempre devolvemos un array
    if (Array.isArray(data)) {
      return NextResponse.json(data, { status: 200 })
    }
    
    // Si la respuesta no es un array, devolver array vacío
    return NextResponse.json([], { status: 200 })
  } catch (error: any) {
    console.error('Error en proxy de reservas de comedor:', error)
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}


