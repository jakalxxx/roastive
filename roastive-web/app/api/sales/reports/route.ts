'use server'

import { NextResponse } from 'next/server'
import { API_BASE } from '../../_utils/env'
import { fetchJson, toNextJson, wrapAuth } from '../../_utils/auth'

const normalizeRoasteryId = (value?: string | number | null) => {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const raw = String(value).trim()
  if (!raw) return undefined
  const numeric = Number(raw)
  if (!Number.isNaN(numeric)) return numeric
  try {
    const uuid = raw.replace(/-/g, '')
    if (uuid.length === 32) {
      const head = BigInt(`0x${uuid.slice(0, 16)}`)
      const tail = BigInt(`0x${uuid.slice(16)}`)
      const combined = Number((head ^ tail) & BigInt('0xffffffffffffffff'))
      return Math.abs(combined)
    }
  } catch {
    return undefined
  }
  return undefined
}

export const GET = wrapAuth(async ({ headers, rid }, req: Request) => {
  const url = new URL(req.url)
  const params = new URLSearchParams(url.search)
  const roasteryId = normalizeRoasteryId(params.get('roasteryId')) ?? normalizeRoasteryId(rid)
  if (roasteryId) {
    params.set('roasteryId', String(roasteryId))
  } else {
    params.delete('roasteryId')
  }
  const query = params.toString()
  const endpoint = `${API_BASE}/v2/sales/reports/orders${query ? `?${query}` : ''}`
  const { res, data } = await fetchJson(endpoint, { headers, cache: 'no-store' })
  if (!res.ok) return toNextJson(res, data)
  return NextResponse.json({ items: Array.isArray(data) ? data : data?.items ?? [] })
})
























