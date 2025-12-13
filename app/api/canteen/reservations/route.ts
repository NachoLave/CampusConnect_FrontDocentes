import { NextResponse } from 'next/server'
import { errorTracker } from '@/lib/utils/error-tracker'

export async function GET(request: Request) {
  try {
    // Obtener userId de los query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 })
    }

    // Llamar al endpoint de Azure a través del proxy
    const url = `https://comedorback.azurewebsites.net/reservations/userId/${userId}`
    
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
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
        { url, userId }
      )
      
      return NextResponse.json({ error: text || resp.statusText }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error en proxy de reservas de comedor:', error)
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}


