import { NextResponse } from 'next/server'
import { API_BASE } from '../../_utils/env'
import { fetchJson, readJson, toNextJson, wrapAuth } from '../../_utils/auth'

export const GET = wrapAuth(async ({ headers, rid }) => {
  const roasteryId = rid ? String(rid).trim() : ''
  const query = roasteryId ? `?roasteryId=${encodeURIComponent(roasteryId)}` : ''
  const res = await fetchJson(`${API_BASE}/v2/sales/orders${query}`, { headers, cache: 'no-store' })
  if (!res.res.ok) return toNextJson(res.res, res.data)
  return NextResponse.json({ items: res.data })
})

export const POST = wrapAuth(async ({ headers, rid }, req: Request) => {
  const body = await readJson(req)
  const roasteryId = (body?.roasteryId ?? rid ?? '').toString().trim()
  if (!roasteryId) return NextResponse.json({ message: '로스터리 정보를 확인할 수 없습니다.' }, { status: 400 })

  const customerId = (body?.customerId ?? body?.customer_id ?? '').toString().trim()
  if (!customerId) return NextResponse.json({ message: '고객사를 선택해주세요.' }, { status: 400 })

  const productId = (body?.productId ?? body?.product_id ?? '').toString().trim()
  if (!productId) return NextResponse.json({ message: '제품을 선택해주세요.' }, { status: 400 })

  const quantity = Number(body?.quantity ?? 0)
  const unitPrice = Number(body?.unitPrice ?? 0)
  const unit = (body?.unit ?? body?.unit ?? 'EA').toString().trim() || 'EA'
  const currency = (body?.currency ?? 'KRW').toString().trim() || 'KRW'
  const status = (body?.status ?? 'NEW').toString().trim() || 'NEW'
  const orderDate = body?.orderDate ? new Date(body.orderDate).toISOString() : new Date().toISOString()
  const remarks = body?.remarks ? String(body.remarks) : undefined

  if (!quantity || quantity <= 0) return NextResponse.json({ message: '수량을 입력해주세요.' }, { status: 400 })
  if (!unitPrice || unitPrice <= 0) return NextResponse.json({ message: '단가를 입력해주세요.' }, { status: 400 })

  const orderNo = body?.orderNo
    ? String(body.orderNo).trim()
    : `SO-${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}`

  // 1) create order
  const orderPayload = {
    roasteryId,
    orderNo,
    customerId,
    orderDate,
    cutoffDate: null,
    currency,
    status,
    remarks,
  }

  const orderRes = await fetchJson(`${API_BASE}/v2/sales/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderPayload),
  })
  if (!orderRes.res.ok) return toNextJson(orderRes.res, orderRes.data)

  const createdOrder = orderRes.data?.order ?? orderRes.data
  const orderId = createdOrder?.orderId ?? createdOrder?.order_id ?? createdOrder?.orderid
  if (!orderId) return NextResponse.json({ message: 'orderId 생성에 실패했습니다.' }, { status: 500 })

  // 2) create order line
  const amount = Number((quantity || 0) * (unitPrice || 0))
  const linePayload = {
    orderId,
    productId,
    variantId: body?.variantId ?? null,
    quantity,
    unit,
    unitPrice,
    amount,
  }
  const lineRes = await fetchJson(`${API_BASE}/v2/sales/lines`, {
    method: 'POST',
    headers,
    body: JSON.stringify(linePayload),
  })
  if (!lineRes.res.ok) return toNextJson(lineRes.res, lineRes.data)

  return NextResponse.json({ ok: true, order: createdOrder, line: lineRes.data?.line ?? lineRes.data })
})



