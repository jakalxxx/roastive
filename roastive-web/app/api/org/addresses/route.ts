import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '../../_utils/env'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../_utils/auth'

// API_BASE from common env util

export const GET = wrapAuth(async ({ headers }) => {
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/addresses`, { headers, cache: 'no-store' })
  return toNextJson(res, data)
})

export const POST = wrapAuth(async ({ headers }, req: Request) => {
  const body = await readJson(req)
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/addresses`, { method: 'POST', headers, body: JSON.stringify(body) })
  return toNextJson(res, data)
})


