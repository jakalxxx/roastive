'use server'

import { NextResponse } from 'next/server'
import { API_BASE } from '../../_utils/env'
import { wrapAuth, fetchJson, readJson } from '../../_utils/auth'

const toIsoInstallDate = (value?: string | null) => {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  // YYYY-MM-DD -> YYYY-MM-DDT00:00:00+09:00 (KST 기준)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00+09:00`
  }
  return trimmed
}

export const GET = wrapAuth(async ({ headers }) => {
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/roasters`, { headers, cache: 'no-store' })
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  const raw = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
  const items = (raw as any[]).map((row) => {
    const id = row.roasterId ?? row.id
    const roasteryId = row.roasteryId
    const purchaseDate = row.purchaseDate ?? row.installDate ?? ''
    const status = row.status ?? 'OPERATIONAL'

    return {
      id: String(id ?? ''),
      roasteryId: String(roasteryId ?? ''),
      master: {
        roasterName: row.roasterName ?? '',
        manufacturer: row.manufacturer ?? '',
        model: row.model ?? '',
        serialNumber: row.serialNo ?? '',
        capacityKg: '',
        fuelType: '',
        installDate: typeof purchaseDate === 'string' ? purchaseDate : '',
        status,
        manager: '',
        lastInspection: '',
      },
      location: {
        zone: '',
        floor: '',
        area: '',
        coordinates: '',
        ventilation: '',
      },
      spec: {
        heatingType: 'GAS',
        burnerCount: '',
        sensorPackage: '',
        power: '',
        notes: '',
        lastSync: '',
      },
    }
  })

  return NextResponse.json({ items }, { status: 200 })
})

export const POST = wrapAuth(async ({ headers }, req: Request) => {
  const body = await readJson(req)
  const master = body?.master ?? {}
  const roasterName = typeof master.roasterName === 'string' ? master.roasterName.trim() : ''
  if (!roasterName) {
    return NextResponse.json({ message: '로스터기명을 입력해주세요.' }, { status: 400 })
  }

  const payload = {
    roasterName,
    manufacturer: typeof master.manufacturer === 'string' ? master.manufacturer.trim() : undefined,
    model: typeof master.model === 'string' ? master.model.trim() : undefined,
    serialNo: typeof master.serialNumber === 'string' ? master.serialNumber.trim() : undefined,
    installDate: toIsoInstallDate(typeof master.installDate === 'string' ? master.installDate : undefined),
    status: typeof master.status === 'string' && master.status.trim() ? master.status.trim() : 'OPERATIONAL',
  }

  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/roasters`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  return NextResponse.json(data, { status: res.status })
})

export const PUT = wrapAuth(async ({ headers }, req: Request) => {
  const body = await readJson(req)
  const id = typeof body?.id === 'string' ? body.id.trim() : ''
  if (!id) {
    return NextResponse.json({ message: '수정할 로스터기를 확인할 수 없습니다.' }, { status: 400 })
  }
  const master = body?.master ?? {}
  const roasterName = typeof master.roasterName === 'string' ? master.roasterName.trim() : ''
  if (!roasterName) {
    return NextResponse.json({ message: '로스터기명을 입력해주세요.' }, { status: 400 })
  }

  const payload = {
    roasterName,
    manufacturer: typeof master.manufacturer === 'string' ? master.manufacturer.trim() : undefined,
    model: typeof master.model === 'string' ? master.model.trim() : undefined,
    serialNo: typeof master.serialNumber === 'string' ? master.serialNumber.trim() : undefined,
    installDate: toIsoInstallDate(typeof master.installDate === 'string' ? master.installDate : undefined),
    status: typeof master.status === 'string' && master.status.trim() ? master.status.trim() : 'OPERATIONAL',
  }

  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/roasters/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  return NextResponse.json(data, { status: res.status })
})

export const DELETE = wrapAuth(async ({ headers }, req: Request) => {
  const body = await readJson(req)
  const id = typeof body?.id === 'string' ? body.id.trim() : ''
  if (!id) {
    return NextResponse.json({ message: '삭제할 로스터기를 확인할 수 없습니다.' }, { status: 400 })
  }

  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/roasters/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  })
  return NextResponse.json(data, { status: res.status })
})
