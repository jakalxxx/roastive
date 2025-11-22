import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '../../_utils/env'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../_utils/auth'

// API_BASE from common env util

// remove resolveRoasteryId fallback to '1'

export const GET = wrapAuth(async ({ headers }) => {
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/settings`, { headers, cache: 'no-store' })
  return toNextJson(res, data)
})

export async function POST(req: Request) {
  // validate business reg no availability
  const { biz_no } = await readJson(req).then(x => x as any).catch(() => ({ biz_no: '' }))
  // 공개 엔드포인트로 조회 (첫 로그인 등 roastery_id 미보유 상황 지원)
  const url = new URL(`${API_BASE}/v2/public/validate-biz`)
  if (biz_no) url.searchParams.set('biz_no', biz_no)
  try {
    const { res, data } = await fetchJson(url.toString(), { cache: 'no-store' })
    return toNextJson(res, data)
  } catch {
    // 백엔드 다운 시 false 반환 및 503
    return NextResponse.json({ ok: false, available: false, message: 'Service unavailable' }, { status: 503 })
  }
}
export const PATCH = wrapAuth(async ({ headers }, req: Request) => {
  const body = await readJson(req)
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/settings`, { method: 'PATCH', headers, body: JSON.stringify(body) })
  return toNextJson(res, data)
})


