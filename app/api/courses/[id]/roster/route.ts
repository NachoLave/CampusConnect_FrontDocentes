import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const id = params.id
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COURSE_ROSTER(Number(id))}`
  try {
    const headers: Record<string, string> = {
      'Accept': '*/*',
      'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
      'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES
    }
    const resp = await fetch(url, { method: 'GET', headers, cache: 'no-store' })
    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: text || resp.statusText }, { status: resp.status })
    }
    const data = await resp.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}


