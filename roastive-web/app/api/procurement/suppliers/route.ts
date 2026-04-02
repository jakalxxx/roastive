import { NextResponse } from 'next/server'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../_utils/auth'
import { API_BASE } from '../../_utils/env'

const normalizeRoasteryId = (value?: string | number | null) => {
  if (value === null || value === undefined) return undefined
  const stringVal = String(value).trim()
  if (!stringVal) return undefined
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  if (uuidRegex.test(stringVal)) return stringVal
  return undefined
}

export const GET = wrapAuth(async ({ headers, rid }) => {
  const roasteryId = normalizeRoasteryId(rid)
  const query = roasteryId ? `?roasteryId=${roasteryId}` : ''
  const { res, data } = await fetchJson(`${API_BASE}/v2/suppliers${query}`, { headers, cache: 'no-store' })
  return toNextJson(res, data)
})

export const POST = wrapAuth(async ({ headers, rid }, req: Request) => {
  const body = await readJson(req)
  const supplierName = typeof body?.supplierName === 'string' ? body.supplierName.trim() : ''
  if (!supplierName) {
    return NextResponse.json({ message: '업체명을 입력해주세요.' }, { status: 400 })
  }
  const roasteryId = normalizeRoasteryId(body?.roasteryId) ?? normalizeRoasteryId(rid)
  if (!roasteryId) {
    return NextResponse.json({ message: '로스터리 정보를 확인할 수 없습니다.' }, { status: 400 })
  }

  const payload = {
    supplier_name: supplierName,
    contact_name: typeof body?.contactName === 'string' && body.contactName.trim() ? body.contactName.trim() : undefined,
    phone: typeof body?.phone === 'string' && body.phone.trim() ? body.phone.replace(/\s+/g, '') : undefined,
    email: typeof body?.email === 'string' && body.email.trim() ? body.email.trim() : undefined,
    business_reg_no: typeof body?.businessRegNo === 'string' && body.businessRegNo.trim() ? body.businessRegNo.replace(/\D+/g, '') : undefined,
    address: typeof body?.address === 'string' && body.address.trim() ? body.address.trim() : undefined,
    status: typeof body?.status === 'string' && body.status.trim() ? body.status.trim() : 'ACTIVE',
    roastery_id: roasteryId,
  }

  const { res, data } = await fetchJson(`${API_BASE}/v2/suppliers`, { method: 'POST', headers, body: JSON.stringify(payload) })
  return toNextJson(res, data)
})


