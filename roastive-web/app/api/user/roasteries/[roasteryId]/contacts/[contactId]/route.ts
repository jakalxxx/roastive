import { NextResponse } from 'next/server'
import { API_BASE } from '../../../../../_utils/env'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../../../../_utils/auth'

const resolveParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) ?? null

const withRoasteryHeader = (headers: Headers, roasteryId: string) => {
  const nextHeaders = new Headers(headers)
  nextHeaders.set('X-Roastery-Id', roasteryId)
  return nextHeaders
}

export const PATCH = wrapAuth(async ({ headers }, req, { params }) => {
  const roasteryId = resolveParam(params?.roasteryId)
  const contactId = resolveParam(params?.contactId)
  if (!roasteryId || !contactId) {
    return NextResponse.json({ message: 'roasteryId and contactId are required' }, { status: 400 })
  }
  const body = await readJson(req)
  const nextHeaders = withRoasteryHeader(headers, roasteryId)
  nextHeaders.set('Content-Type', 'application/json')
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/contacts/${encodeURIComponent(contactId)}`, {
    method: 'PATCH',
    headers: nextHeaders,
    body: JSON.stringify(body),
  })
  return toNextJson(res, data)
})

export const DELETE = wrapAuth(async ({ headers }, _req, { params }) => {
  const roasteryId = resolveParam(params?.roasteryId)
  const contactId = resolveParam(params?.contactId)
  if (!roasteryId || !contactId) {
    return NextResponse.json({ message: 'roasteryId and contactId are required' }, { status: 400 })
  }
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/contacts/${encodeURIComponent(contactId)}`, {
    method: 'DELETE',
    headers: withRoasteryHeader(headers, roasteryId),
  })
  return toNextJson(res, data)
})
















