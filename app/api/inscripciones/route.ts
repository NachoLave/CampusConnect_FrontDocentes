import { NextResponse } from 'next/server'
import { errorTracker } from '@/lib/utils/error-tracker'

const CURSOS_API_URL = 'https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api'

// Forzar que esta ruta sea dinámica
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const user_uuid = searchParams.get('user_uuid')
    const uuid_curso = searchParams.get('uuid_curso')

    // Validar que al menos uno de los parámetros esté presente
    if (!user_uuid && !uuid_curso) {
      return NextResponse.json({ error: 'Se requiere user_uuid o uuid_curso' }, { status: 400 })
    }

    // Intentar obtener el token desde el header Authorization
    const authHeader = request.headers.get('Authorization')
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    if (!token) {
      return NextResponse.json({ error: 'Token de autenticación requerido' }, { status: 401 })
    }

    // Construir la URL con los query parameters
    const queryParams = new URLSearchParams()
    if (user_uuid) {
      queryParams.append('user_uuid', user_uuid)
    }
    if (uuid_curso) {
      queryParams.append('uuid_curso', uuid_curso)
    }

    const url = `${CURSOS_API_URL}/inscripciones?${queryParams.toString()}`
    console.log(`[Inscripciones Proxy] Calling backend: ${url}`)

    // Intentar con reintentos para manejar posibles problemas de latencia
    let resp: Response
    let retryCount = 0
    const maxRetries = 2

    while (retryCount <= maxRetries) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 segundos timeout

      try {
        resp = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal,
          cache: 'no-store'
        })

        clearTimeout(timeoutId)

        if (resp.ok) {
          const data = await resp.json()
          return NextResponse.json(data, { status: 200 })
        }

        // Si es un error 5xx o timeout, reintentar
        if (resp.status >= 500 || resp.status === 408) {
          if (retryCount < maxRetries) {
            retryCount++
            console.log(`[Inscripciones Proxy] Retry ${retryCount}/${maxRetries} for ${url}`)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Backoff exponencial
            continue
          }
        }

        // Para otros errores, no reintentar
        const text = await resp.text()
        console.error(`[Inscripciones Proxy] Error ${resp.status}: ${text}`)

        errorTracker.trackError(
          'Inscripciones',
          '/api/inscripciones',
          'GET',
          resp.status,
          text || resp.statusText,
          { url, user_uuid, uuid_curso }
        )

        return NextResponse.json({ error: text || resp.statusText }, { status: resp.status })
      } catch (fetchError: any) {
        clearTimeout(timeoutId)

        if (fetchError.name === 'AbortError') {
          if (retryCount < maxRetries) {
            retryCount++
            console.log(`[Inscripciones Proxy] Timeout, retry ${retryCount}/${maxRetries} for ${url}`)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
            continue
          }
          return NextResponse.json({ error: 'Timeout: La solicitud tardó demasiado tiempo' }, { status: 504 })
        }

        throw fetchError
      }
    }

    return NextResponse.json({ error: 'Error después de múltiples intentos' }, { status: 500 })
  } catch (error: any) {
    console.error('[Inscripciones Proxy] Error:', error)
    return NextResponse.json({ error: error?.message || 'Error del servidor' }, { status: 500 })
  }
}
