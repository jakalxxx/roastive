'use server'

import { NextResponse } from 'next/server'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../../_utils/auth'
import { API_BASE } from '../../../_utils/env'

const normalizeRoasteryId = (value?: string | number | null) => {
  if (value === null || value === undefined) return undefined
  const stringVal = String(value).trim()
  if (!stringVal) return undefined
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  if (uuidRegex.test(stringVal)) return stringVal
  return undefined
}

const toSupplierPayload = (body: any, roasteryId: string) => ({
  supplier_name: body?.supplierName?.trim(),
  contact_name: body?.contactName?.trim() || undefined,
  phone: body?.phone?.trim() || undefined,
  email: body?.email?.trim() || undefined,
  business_reg_no: body?.businessRegNo?.replace?.(/\D+/g, '') || undefined,
  address: body?.address?.trim() || undefined,
  status: typeof body?.status === 'string' && body.status.trim() ? body.status.trim() : 'ACTIVE',
  roastery_id: roasteryId,
})

export const GET = wrapAuth(async ({ headers, rid }, _req: Request, { params }: { params: { supplierId: string } }) => {
  const roasteryId = normalizeRoasteryId(rid)
  const query = roasteryId ? `?roasteryId=${encodeURIComponent(String(roasteryId))}` : ''
  const { res, data } = await fetchJson(`${API_BASE}/v2/suppliers/${params.supplierId}/detail${query}`, { headers, cache: 'no-store' })
  return toNextJson(res, data)
})

export const PUT = wrapAuth(async ({ headers, rid }, req: Request, { params }: { params: { supplierId: string } }) => {
  const body = await readJson(req)
  const supplierName = typeof body?.supplierName === 'string' ? body.supplierName.trim() : ''
  if (!supplierName) {
    return NextResponse.json({ message: '업체명을 입력해주세요.' }, { status: 400 })
  }
  const roasteryId = normalizeRoasteryId(body?.roasteryId) ?? normalizeRoasteryId(rid)
  if (!roasteryId) {
    return NextResponse.json({ message: '로스터리 정보를 확인할 수 없습니다.' }, { status: 400 })
  }
  const payload = toSupplierPayload(body, roasteryId)
  if (!payload.supplier_name) {
    return NextResponse.json({ message: '업체명을 입력해주세요.' }, { status: 400 })
  }

  const { res, data } = await fetchJson(`${API_BASE}/v2/suppliers/${params.supplierId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  return toNextJson(res, data)
})


