import { NextResponse } from 'next/server'
import { API_BASE } from '../../../_utils/env'
import { fetchJson, readJson, toNextJson, wrapAuth } from '../../../_utils/auth'

const normalizeBizNo = (value?: string | null) => {
  if (value === null || value === undefined) return undefined
  const digits = String(value).replace(/\D+/g, '')
  return digits || undefined
}

export const GET = wrapAuth(async ({ headers, rid }, req: Request, { params }: { params: { customerId: string } }) => {
  const url = new URL(req.url)
  const queryRoasteryId = url.searchParams.get('roasteryId')?.trim()
  const resolvedRoasteryId = queryRoasteryId || (rid ? String(rid).trim() : '')
  if (!resolvedRoasteryId) {
    return NextResponse.json({ message: '로스터리 정보를 확인할 수 없습니다.' }, { status: 400 })
  }
  const query = `?roasteryId=${encodeURIComponent(resolvedRoasteryId)}`
  const { res, data } = await fetchJson(`${API_BASE}/v2/customers/${params.customerId}/detail${query}`, {
    headers,
    cache: 'no-store',
  })
  return toNextJson(res, data)
})

export const PUT = wrapAuth(async ({ headers, rid }, req: Request, { params }: { params: { customerId: string } }) => {
  const body = await readJson(req)
  const customerName = (body?.customerName ?? '').trim()
  if (!customerName) {
    return NextResponse.json({ message: '고객사명을 입력해주세요.' }, { status: 400 })
  }
  const status = (body?.status ?? 'ACTIVE').trim() || 'ACTIVE'
  const roasteryId =
    (body?.roasteryId ? String(body.roasteryId).trim() : '') || (rid ? String(rid).trim() : '')
  if (!roasteryId) {
    return NextResponse.json({ message: '로스터리 정보를 확인할 수 없습니다.' }, { status: 400 })
  }

  const code = normalizeBizNo(body?.code ?? body?.businessRegNo)

  const payload = {
    customerName,
    status,
    code: code || null,
    roasteryId,
  }

  const { res, data } = await fetchJson(`${API_BASE}/v2/customers/${params.customerId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  return toNextJson(res, data)
})

























