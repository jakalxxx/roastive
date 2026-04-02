import { NextResponse } from 'next/server'
import { API_BASE } from '../../_utils/env'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../_utils/auth'

type RawCustomer = Record<string, any>

type Customer = {
  customerId: string
  customerName: string
  code?: string | null
  status?: string | null
  createdAt?: string
  roasteryId?: string | number | null
}

function normalizeCustomer(raw: RawCustomer): Customer {
  return {
    customerId: String(raw.customerId ?? raw.customer_id ?? ''),
    customerName: String(raw.customerName ?? raw.customer_name ?? ''),
    code: raw.code ?? raw.customerCode ?? raw.customer_code ?? null,
    status: raw.status ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    roasteryId: raw.roasteryId ?? raw.roastery_id ?? null,
  }
}

export const GET = wrapAuth(async ({ headers, rid }) => {
  const roasteryQuery = rid ? `?roasteryId=${encodeURIComponent(String(rid))}` : ''
  const { res, data } = await fetchJson(`${API_BASE}/v2/customers${roasteryQuery}`, { headers, cache: 'no-store' })
  if (!res.ok) return toNextJson(res, data)

  const resolvedRid = rid ? String(rid) : ''
  const rawItems: RawCustomer[] = Array.isArray(data) ? data : data?.items ?? []
  const items = rawItems
    .map(normalizeCustomer)
    .filter((item) => {
      if (!item.roasteryId && resolvedRid) {
        item.roasteryId = resolvedRid
      }
      if (!item.roasteryId || !resolvedRid) return true
      return String(item.roasteryId) === resolvedRid
    })

  return NextResponse.json({ items })
})

export const POST = wrapAuth(async ({ headers, rid }, req: Request) => {
  const body = await readJson(req)
  const customerName = (body?.customerName ?? '').trim()
  const code = body?.code ? String(body.code).trim() : undefined
  const status = (body?.status ?? 'ACTIVE').trim() || 'ACTIVE'
  const roasteryId = rid ? String(rid).trim() : ''

  if (!customerName) {
    return NextResponse.json({ message: '고객사명을 입력해주세요.' }, { status: 400 })
  }
  if (!roasteryId) {
    return NextResponse.json({ message: '로스터리 정보를 확인할 수 없습니다.' }, { status: 400 })
  }

  const payload = {
    customerName,
    code,
    status,
    roasteryId,
  }

  const { res, data } = await fetchJson(`${API_BASE}/v2/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) return toNextJson(res, data)

  const created = data?.customer ?? data

  return NextResponse.json({ ok: true, customer: created })
})


