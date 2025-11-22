import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '../../_utils/env'
import { fetchJson, toNextJson } from '../../_utils/auth'

// API_BASE from common env util

export async function GET(_req: Request, { params }: { params: { type: string } }) {
  // 비로그인 페이지에서도 코드셋은 공개 조회 허용
  const token = cookies().get('auth_token')?.value
  const headers = token ? new Headers({ 'Authorization': `Bearer ${token}` }) : undefined
  // 백엔드 기존 코드셋 엔드포인트 규격에 맞춤
  const url = new URL(`${API_BASE}/v2/code-sets`)
  url.searchParams.set('type', params.type)
  try {
    const { res, data } = await fetchJson(url.toString(), { headers, cache: 'no-store' })
    return toNextJson(res, data)
  } catch {
    return NextResponse.json({ ok: false, items: [], message: 'Service unavailable' }, { status: 503 })
  }
}


