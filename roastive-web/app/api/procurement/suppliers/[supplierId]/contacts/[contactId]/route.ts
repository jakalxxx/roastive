'use server'

import { NextResponse } from 'next/server'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../../../../_utils/auth'
import { API_BASE } from '../../../../../_utils/env'

const normalizeString = (value?: unknown) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

export const PUT = wrapAuth(
  async ({ headers }, req: Request, { params }: { params: { supplierId: string; contactId: string } }) => {
    const body = await readJson(req)
    const contactName = normalizeString(body?.contactName)
    if (!contactName) {
      return NextResponse.json({ message: '담당자명을 입력해주세요.' }, { status: 400 })
    }
    const payload = {
      contact_name: contactName,
      phone: normalizeString(body?.phone),
      email: normalizeString(body?.email),
      role: normalizeString(body?.role),
      position: normalizeString(body?.position),
      primary: Boolean(body?.primary),
    }
    const { res, data } = await fetchJson(
      `${API_BASE}/v2/suppliers/${params.supplierId}/contacts/${params.contactId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      }
    )
    return toNextJson(res, data)
  }
)











