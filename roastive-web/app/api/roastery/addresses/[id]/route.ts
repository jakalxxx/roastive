import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '../../../_utils/env'
import { fetchJson, toNextJson, readJson, wrapAuth } from '../../../_utils/auth'

// API_BASE from common env util

export const PATCH = wrapAuth(async ({ headers }, req: Request, { params }: { params: { id: string } }) => {
  const body = await readJson(req)
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/addresses/${params.id}`, { method: 'PATCH', headers, body: JSON.stringify(body) })
  return toNextJson(res, data)
})

export const DELETE = wrapAuth(async ({ headers }, _req: Request, { params }: { params: { id: string } }) => {
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/addresses/${params.id}`, { method: 'DELETE', headers })
  return toNextJson(res, data)
})


