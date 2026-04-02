import { NextResponse } from 'next/server'
import { API_BASE } from '../../../_utils/env'
import { fetchJson, toNextJson, wrapAuth } from '../../../_utils/auth'

export const GET = wrapAuth(async ({ headers, rid }) => {
  const query = rid ? `?roasteryId=${encodeURIComponent(String(rid))}` : ''
  const res = await fetchJson(`${API_BASE}/v2/customers/stats/new-month${query}`, { headers, cache: 'no-store' })
  if (!res.res.ok) return toNextJson(res.res, res.data)
  return NextResponse.json(res.data)
})








