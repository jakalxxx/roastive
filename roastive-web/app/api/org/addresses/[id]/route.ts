import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '../../../_utils/env'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../../_utils/auth'

// API_BASE from common env util

export const PATCH = wrapAuth(async ({ headers }, _req: Request, { params }: { params: { id: string } }) => {
  const body = await readJson(_req)
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/addresses/${params.id}`, { method: 'PATCH', headers, body: JSON.stringify(body) })
  return toNextJson(res, data)
})

export const DELETE = wrapAuth(async ({ headers }, _req: Request, { params }: { params: { id: string } }) => {
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/addresses/${params.id}`, { method: 'DELETE', headers })
  return toNextJson(res, data)
})



