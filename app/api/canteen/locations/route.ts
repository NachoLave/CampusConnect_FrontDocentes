import { NextResponse } from 'next/server'

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

    // Llamar al endpoint de locations de Azure a través del proxy
    const url = 'https://comedorback.azurewebsites.net/locations'
    
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
      return NextResponse.json({ error: text || resp.statusText }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error en proxy de locations de comedor:', error)
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}

