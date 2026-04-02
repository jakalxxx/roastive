'use server'

import { NextResponse } from 'next/server'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../../../_utils/auth'
import { API_BASE } from '../../../../_utils/env'

const normalizeString = (value?: unknown) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

const normalizeDate = (value?: unknown) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

const normalizeNumber = (value?: unknown) => {
  if (value === null || value === undefined || value === '') return undefined
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

export const POST = wrapAuth(async ({ headers }, req: Request, { params }: { params: { supplierId: string } }) => {
  const body = await readJson(req)
  const contractNo = normalizeString(body?.contractNo)
  if (!contractNo) {
    return NextResponse.json({ message: '계약 번호를 입력해주세요.' }, { status: 400 })
  }

  const prices = Array.isArray(body?.prices)
    ? body.prices
        .map((price: any) => {
          const itemId = normalizeString(price?.itemId)
          if (!itemId) return null
          return {
            item_id: itemId,
            unit_price: normalizeNumber(price?.unitPrice),
            valid_from: normalizeDate(price?.validFrom),
            valid_to: normalizeDate(price?.validTo),
            min_qty: normalizeNumber(price?.minQty),
          }
        })
        .filter(Boolean)
    : undefined

  const payload = {
    contract_no: contractNo,
    start_date: normalizeDate(body?.startDate),
    end_date: normalizeDate(body?.endDate),
    incoterm: normalizeString(body?.incoterm),
    currency: normalizeString(body?.currency) ?? 'KRW',
    payment_terms: normalizeString(body?.paymentTerms),
    status: normalizeString(body?.status) ?? 'ACTIVE',
    prices: prices?.length ? prices : undefined,
  }

  const { res, data } = await fetchJson(`${API_BASE}/v2/suppliers/${params.supplierId}/contracts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  return toNextJson(res, data)
})
















