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
  const taxProfileId = resolveParam(params?.taxProfileId)
  if (!roasteryId || !taxProfileId) {
    return NextResponse.json({ message: 'roasteryId and taxProfileId are required' }, { status: 400 })
  }
  const body = await readJson(req)
  const nextHeaders = withRoasteryHeader(headers, roasteryId)
  nextHeaders.set('Content-Type', 'application/json')
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/tax-profile/${encodeURIComponent(taxProfileId)}`, {
    method: 'PATCH',
    headers: nextHeaders,
    body: JSON.stringify(body),
  })
  return toNextJson(res, data)
})
















