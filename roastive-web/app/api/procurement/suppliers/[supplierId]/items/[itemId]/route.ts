'use server'

import { NextResponse } from 'next/server'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../../../../_utils/auth'
import { API_BASE } from '../../../../../_utils/env'

const normalizeUuid = (value?: unknown) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

const parseInteger = (value?: unknown) => {
  if (value === null || value === undefined || value === '') return undefined
  const num = Number(value)
  if (!Number.isFinite(num)) return undefined
  return Math.round(num)
}

const parseDecimal = (value?: unknown) => {
  if (value === null || value === undefined || value === '') return undefined
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

const toIsoDate = (value?: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

const normalizeString = (value?: unknown) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

export const PUT = wrapAuth(
  async ({ headers }, req: Request, { params }: { params: { supplierId: string; itemId: string } }) => {
    const body = await readJson(req)
    const itemId = normalizeUuid(body?.itemId)
    if (!itemId) {
      return NextResponse.json({ message: '상품 ID를 입력해주세요.' }, { status: 400 })
    }

    const payload = {
      item_id: itemId,
      vendor_sku: normalizeString(body?.vendorSku),
      vendor_name: normalizeString(body?.vendorName),
      lead_time_days: parseInteger(body?.leadTimeDays),
      moq: parseDecimal(body?.moq),
      currency: normalizeString(body?.currency),
      last_price: parseDecimal(body?.lastPrice),
      last_price_date: toIsoDate(body?.lastPriceDate),
    }

    const { res, data } = await fetchJson(
      `${API_BASE}/v2/suppliers/${params.supplierId}/items/${params.itemId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      }
    )
    return toNextJson(res, data)
  }
)


























