import { NextResponse } from 'next/server'
import { API_BASE } from '../../_utils/env'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../_utils/auth'

type RawRoastery = Record<string, any>

function normalizeRoastery(raw: RawRoastery) {
  return {
    roasteryId: String(raw.roasteryId ?? raw.roastery_id ?? ''),
    roasteryName: String(raw.roasteryName ?? raw.roastery_name ?? ''),
    code: raw.code ?? raw.roasteryCode ?? raw.roastery_code ?? '',
    status: raw.status ?? 'ACTIVE',
    legalName: raw.legalName ?? raw.legal_name ?? '',
    representativeName: raw.representativeName ?? raw.representative_name ?? '',
    businessRegNo: raw.businessRegNo ?? raw.business_reg_no ?? '',
    address: raw.address ?? '',
    createdAt: raw.createdAt ?? raw.created_at ?? null,
  }
}

export const GET = wrapAuth(async ({ headers }) => {
  const [{ res, data }, { res: addrRes, data: addrData }] = await Promise.all([
    fetchJson(`${API_BASE}/v2/roasteries`, { headers, cache: 'no-store' }),
    fetchJson(`${API_BASE}/v2/roasteries/addresses/headquarters`, { headers, cache: 'no-store' }),
  ])
  if (!res.ok) return toNextJson(res, data)

  const rawItems: RawRoastery[] = Array.isArray(data) ? data : data?.items ?? []
  const rawAddresses: RawRoastery[] = Array.isArray(addrData?.items) ? addrData.items : Array.isArray(addrData) ? addrData : []

  const addressMap = new Map<string, { line1?: string; line2?: string; city?: string; state?: string; postalCode?: string }>()
  rawAddresses.forEach((addr: any) => {
    const rid = String(addr?.roasteryId ?? addr?.roastery_id ?? '')
    if (!rid) return
    addressMap.set(rid, {
      line1: addr?.addressLine1 ?? addr?.address_line1 ?? '',
      line2: addr?.addressLine2 ?? addr?.address_line2 ?? '',
      city: addr?.city ?? '',
      state: addr?.state ?? '',
      postalCode: addr?.postalCode ?? addr?.postal_code ?? '',
    })
  })

  const items = rawItems.map((raw) => {
    const base = normalizeRoastery(raw)
    const addr = addressMap.get(base.roasteryId)
    if (addr) {
      const line = [addr.line1, addr.line2].filter(Boolean).join(' ').trim()
      const region = [addr.city, addr.state, addr.postalCode].filter(Boolean).join(' ').trim()
      base.address = line || region || base.address
    }
    return base
  })

  return NextResponse.json({ items })
})

const normalizeString = (value?: unknown) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

export const POST = wrapAuth(async ({ headers }, req: Request) => {
  const body = await readJson(req)
  const roasteryName = normalizeString(body?.roasteryName)
  const businessRegNo = typeof body?.businessRegNo === 'string' ? body.businessRegNo.replace(/\D+/g, '') : ''
  if (!roasteryName) {
    return NextResponse.json({ message: '로스터리명을 입력해주세요.' }, { status: 400 })
  }
  if (businessRegNo.length !== 10) {
    return NextResponse.json({ message: '사업자번호 10자리를 입력해주세요.' }, { status: 400 })
  }

  const payload = {
    roastery_name: roasteryName,
    business_reg_no: businessRegNo,
    legal_name: normalizeString(body?.legalName),
    brand_name: normalizeString(body?.brandName),
    representative_name: normalizeString(body?.representativeName),
    phone: normalizeString(body?.phone),
    email: normalizeString(body?.email),
    address: normalizeString(body?.address),
    status: (normalizeString(body?.status) ?? 'ACTIVE').toUpperCase(),
  }

  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  return toNextJson(res, data)
})


