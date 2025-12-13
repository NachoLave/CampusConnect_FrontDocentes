import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKOFFICE_URL = 'https://backoffice-production-df78.up.railway.app/api/v1'

export async function GET(
  request: Request,
  { params }: { params: { cursoUUID: string } }
) {
  try {
    const { cursoUUID } = params
    const { searchParams } = new URL(request.url)
    const skip = searchParams.get('skip') || '0'
    const limit = searchParams.get('limit') || '100'

    if (!cursoUUID) {
      return NextResponse.json({ error: 'cursoUUID es requerido' }, { status: 400 })
    }

    // Intentar obtener el token desde el header Authorization primero
    const authHeader = request.headers.get('Authorization')
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // Fallback: intentar obtener desde cookies
      const cookieStore = await cookies()
      token = cookieStore.get('auth_token')?.value || null
    }

    if (!token) {
      return NextResponse.json({ error: 'No hay token de autenticación' }, { status: 401 })
    }

    // Llamar al endpoint de backoffice a través del proxy
    const url = `${BACKOFFICE_URL}/clases-individuales/curso/${cursoUUID}?skip=${skip}&limit=${limit}`
    
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
      console.error(`Error obteniendo clases individuales: ${resp.status} - ${text}`)
      return NextResponse.json({ error: text || resp.statusText }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error en proxy de clases individuales:', error)
    return NextResponse.json({ error: error?.message || 'Error del servidor' }, { status: 500 })
  }
}
