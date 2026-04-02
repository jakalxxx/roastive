import { NextResponse } from 'next/server'
import { API_BASE } from '../../../_utils/env'
import { fetchJson, toNextJson, wrapAuth } from '../../../_utils/auth'

export const GET = wrapAuth(async ({ headers }, _req: Request, { params }: { params: { orderId: string } }) => {
  const orderId = (params?.orderId ?? '').toString().trim()
  if (!orderId) return NextResponse.json({ message: 'orderId가 필요합니다.' }, { status: 400 })

  const res = await fetchJson(`${API_BASE}/v2/sales/orders/${encodeURIComponent(orderId)}/detail`, {
    headers,
    cache: 'no-store',
  })
  if (!res.res.ok) return toNextJson(res.res, res.data)
  return NextResponse.json(res.data)
})








