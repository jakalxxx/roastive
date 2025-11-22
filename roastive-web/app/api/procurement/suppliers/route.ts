import { NextResponse } from 'next/server'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../_utils/auth'
import { API_BASE } from '../../_utils/env'

// API_BASE centrally defined in _utils/env

export const GET = wrapAuth(async ({ headers }) => {
  const { res, data } = await fetchJson(`${API_BASE}/suppliers`, { headers, cache: 'no-store' })
  return toNextJson(res, data)
})

export const POST = wrapAuth(async ({ headers }, req: Request) => {
  const body = await readJson(req)
  const { res, data } = await fetchJson(`${API_BASE}/suppliers`, { method: 'POST', headers, body: JSON.stringify(body) })
  return toNextJson(res, data)
})


