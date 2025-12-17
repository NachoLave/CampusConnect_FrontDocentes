import { NextResponse } from 'next/server'
import { errorTracker } from '@/lib/utils/error-tracker'

const STORE_API_URL = 'https://uadestore.onrender.com/api'

/**
 * Proxy API para los endpoints de tienda
 * Resuelve problemas de CORS y cold start de Render.com
 */
export async function GET(request: Request) {
  try {
    // Obtener userId de query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 })
    }

    const url = `${STORE_API_URL}/orders/me?userId=${userId}`
    console.log(`[Store Proxy] Calling backend: ${url}`)
    
    let response: Response
    let retryCount = 0
    const maxRetries = 2
    
    // Intentar con reintentos para manejar cold start
    while (retryCount <= maxRetries) {
      // Crear nuevo controller y timeout para cada intento
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 segundos
      
      try {
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          cache: 'no-store',
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        // Si la respuesta es exitosa, salir del loop
        if (response.ok) {
          break
        }
        
        // Si es un error 5xx y aún tenemos reintentos, esperar un poco y reintentar
        if (response.status >= 500 && retryCount < maxRetries) {
          console.log(`[Store Proxy] Error ${response.status}, reintentando... (${retryCount + 1}/${maxRetries})`)
          clearTimeout(timeoutId)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1 segundo antes de reintentar
          retryCount++
          continue
        }
        
        // Si no es un error 5xx o ya no hay reintentos, lanzar error
        clearTimeout(timeoutId)
        throw new Error(`Error del servidor: ${response.status}`)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        // Si es timeout y aún tenemos reintentos, reintentar
        if (fetchError.name === 'AbortError' && retryCount < maxRetries) {
          console.log(`[Store Proxy] Timeout, reintentando... (${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1 segundo antes de reintentar
          retryCount++
          continue
        }
        
        // Si es timeout y no hay más reintentos
        if (fetchError.name === 'AbortError') {
          console.error('[Store Proxy] Timeout: El endpoint tardó más de 20 segundos después de reintentos')
          errorTracker.trackError(
            'Tienda',
            '/api/store/orders',
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

    console.log(`[Store Proxy] Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Store Proxy] Backend error (${response.status}):`, errorText)
      
      // Registrar error en el tracker
      errorTracker.trackError(
        'Tienda',
        '/api/store/orders',
        'GET',
        response.status,
        errorText || response.statusText,
        { url, retries: retryCount }
      )
      
      return NextResponse.json({ error: errorText || response.statusText }, { status: response.status })
    }

    const data = await response.json()
    console.log(`[Store Proxy] Success, received ${Array.isArray(data) ? data.length : 'unknown'} items`)
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('[Store Proxy] Exception:', error)
    console.error('[Store Proxy] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    return NextResponse.json({ 
      error: error?.message || 'Proxy error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
}
