import { NextResponse } from 'next/server'
import { API_BASE } from '../../../_utils/env'
import { wrapAuth, fetchJson, toNextJson } from '../../../_utils/auth'

export const GET = wrapAuth(async ({ headers }, _req, { params }) => {
  const roasteryIdParam = Array.isArray(params?.roasteryId) ? params?.roasteryId[0] : params?.roasteryId
  if (!roasteryIdParam) {
    return NextResponse.json({ message: 'roasteryId is required' }, { status: 400 })
  }
  const roasteryId = encodeURIComponent(roasteryIdParam)
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/${roasteryId}`, {
    headers,
    cache: 'no-store',
  })
  return toNextJson(res, data)
})

