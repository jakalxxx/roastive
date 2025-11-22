import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '../../../_utils/env'
import { getAccessOr401, fetchJson, toNextJson, readJson } from '../../../_utils/auth'

// API_BASE from common env util

export async function POST(req: Request) {
  const auth = getAccessOr401()
  if (auth instanceof NextResponse) return auth
  const headers = new Headers(auth.headers)
  headers.set('Content-Type', 'application/json')

  const body = await readJson(req)
  const userId = cookies().get('user_id')?.value
  if (userId) headers.set('X-User-Id', String(userId))

  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/settings/init`, { method: 'POST', headers, body: JSON.stringify(body) })
  const out = toNextJson(res, data)
  const newId = (data?.data?.roastery_id ?? data?.roastery_id)
  if (newId) out.cookies.set('roastery_id', String(newId), { httpOnly: true, sameSite: 'lax', path: '/' })
  return out
}


