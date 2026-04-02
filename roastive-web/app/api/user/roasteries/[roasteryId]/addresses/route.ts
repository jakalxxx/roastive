import { NextResponse } from 'next/server'
import { API_BASE } from '../../../../_utils/env'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../../../_utils/auth'

const resolveRoasteryId = (value?: string | string[]) => {
  const id = Array.isArray(value) ? value[0] : value
  if (!id) {
    return null
  }
  return id
}

const withRoasteryHeader = (headers: Headers, roasteryId: string) => {
  const nextHeaders = new Headers(headers)
  nextHeaders.set('X-Roastery-Id', roasteryId)
  return nextHeaders
}

export const GET = wrapAuth(async ({ headers }, _req, { params }) => {
  const roasteryId = resolveRoasteryId(params?.roasteryId)
  if (!roasteryId) {
    return NextResponse.json({ message: 'roasteryId is required' }, { status: 400 })
  }
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/addresses`, {
    headers: withRoasteryHeader(headers, roasteryId),
    cache: 'no-store',
  })
  return toNextJson(res, data)
})

export const POST = wrapAuth(async ({ headers }, req, { params }) => {
  const roasteryId = resolveRoasteryId(params?.roasteryId)
  if (!roasteryId) {
    return NextResponse.json({ message: 'roasteryId is required' }, { status: 400 })
  }
  const body = await readJson(req)
  const nextHeaders = withRoasteryHeader(headers, roasteryId)
  nextHeaders.set('Content-Type', 'application/json')
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/addresses`, {
    method: 'POST',
    headers: nextHeaders,
    body: JSON.stringify(body),
  })
  return toNextJson(res, data)
})
















