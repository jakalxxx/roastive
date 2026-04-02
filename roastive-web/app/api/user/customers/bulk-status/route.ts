import { NextResponse } from 'next/server'
import { API_BASE } from '../../../_utils/env'
import { wrapAuth, fetchJson, readJson, toNextJson } from '../../../_utils/auth'

type RawCustomer = Record<string, any>

const REQUIRED_FIELDS = ['customerName'] as const

function buildPayload(customer: RawCustomer, nextStatus: string) {
  const normalized = {
    customerName: customer.customerName ?? customer.customer_name ?? '',
    code: customer.code ?? customer.customer_code ?? null,
    status: nextStatus,
  }
  for (const key of REQUIRED_FIELDS) {
    if (!normalized[key]) throw new Error(`MISSING_${key}`)
  }
  return normalized
}

export const PATCH = wrapAuth(async ({ headers }, req: Request) => {
  const body = await readJson(req)
  const customerIds: string[] = Array.isArray(body?.customerIds) ? body.customerIds.map(String) : []
  const status: string = typeof body?.status === 'string' ? body.status : ''
  const customers: RawCustomer[] = Array.isArray(body?.customers) ? body.customers : []

  if (!customerIds.length) {
    return NextResponse.json({ ok: false, message: '선택된 고객사가 없습니다.' }, { status: 400 })
  }
  if (!status) {
    return NextResponse.json({ ok: false, message: '변경할 상태를 선택해주세요.' }, { status: 400 })
  }

  for (const id of customerIds) {
    const target = customers.find((item) => String(item.customerId ?? item.customer_id) === id)
    if (!target) continue
    let payload
    try {
      payload = buildPayload(target, status)
    } catch (err: any) {
      return NextResponse.json({ ok: false, message: '고객사 데이터가 올바르지 않습니다.', detail: err?.message }, { status: 400 })
    }
    const { res, data } = await fetchJson(`${API_BASE}/v2/customers/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) return toNextJson(res, data)
  }

  return NextResponse.json({ ok: true, updated: customerIds.length })
})































