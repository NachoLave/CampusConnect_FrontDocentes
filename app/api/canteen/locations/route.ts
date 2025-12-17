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

    // Llamar al endpoint de locations de Azure a través del proxy
    const url = 'https://comedorback.azurewebsites.net/locations'
    console.log(`[Canteen Locations Proxy] Calling backend: ${url}`)
    
    let resp: Response
    let retryCount = 0
    const maxRetries = 2
    
    // Intentar con reintentos para manejar posibles problemas de latencia
    while (retryCount <= maxRetries) {
      // Crear nuevo controller y timeout para cada intento
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 segundos
      
      try {
        resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
      },
          cache: 'no-store',
          signal: controller.signal
    })
        clearTimeout(timeoutId)
        
        // Si la respuesta es exitosa, salir del loop
        if (resp.ok) {
          break
        }
        
        // Si es un error 5xx y aún tenemos reintentos, esperar un poco y reintentar
        if (resp.status >= 500 && retryCount < maxRetries) {
          console.log(`[Canteen Locations Proxy] Error ${resp.status}, reintentando... (${retryCount + 1}/${maxRetries})`)
          clearTimeout(timeoutId)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1 segundo antes de reintentar
          retryCount++
          continue
        }
        
        // Si no es un error 5xx o ya no hay reintentos, lanzar error
        clearTimeout(timeoutId)
        throw new Error(`Error del servidor: ${resp.status}`)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        // Si es timeout y aún tenemos reintentos, reintentar
        if (fetchError.name === 'AbortError' && retryCount < maxRetries) {
          console.log(`[Canteen Locations Proxy] Timeout, reintentando... (${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1 segundo antes de reintentar
          retryCount++
          continue
        }
        
        // Si es timeout y no hay más reintentos
        if (fetchError.name === 'AbortError') {
          console.error('[Canteen Locations Proxy] Timeout: El endpoint tardó más de 20 segundos después de reintentos')
          errorTracker.trackError(
            'Comedor',
            '/api/canteen/locations',
            'GET',
            504, // Gateway Timeout
            'El endpoint tardó demasiado en responder (timeout)',
            { url, timeout: true, retries: retryCount }
          )
          return NextResponse.json({ error: 'Timeout: El endpoint tardó demasiado en responder' }, { status: 504 })
        }
        
        // Para otros errores, re-lanzar
        throw fetchError
      }
    }

    console.log(`[Canteen Locations Proxy] Backend response status: ${resp.status}`)

    if (!resp.ok) {
      const text = await resp.text()
      
      // Registrar error en el tracker
      errorTracker.trackError(
        'Comedor',
        '/api/canteen/locations',
        'GET',
        resp.status,
        text || resp.statusText,
        { url, retries: retryCount }
      )
      
      return NextResponse.json({ error: text || resp.statusText }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error en proxy de locations de comedor:', error)
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}

