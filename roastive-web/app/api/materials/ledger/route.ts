'use server'

import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

const PRODUCT_NAMES = ['하우스 블렌드', '싱글오리진 A', '드립백 세트', '콜드브루 베이스', 'RTD 라떼']
const GREEN_BEANS = ['에티오피아 예가체프', '케냐 AA', '콜롬비아 수프리모', '브라질 세라도', '과테말라 안티구아']
const MOVEMENT_TYPES = ['입고', '출고'] as const

const randomFrom = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

const generateRows = (view: 'product' | 'green-bean', count: number, start: Date, end: Date) => {
  const rows = []
  for (let i = 0; i < count; i += 1) {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    const baseName = view === 'product' ? randomFrom(PRODUCT_NAMES) : randomFrom(GREEN_BEANS)
    const type = randomFrom(MOVEMENT_TYPES)
    const quantity = Math.round(Math.random() * 200 + 5)
    rows.push({
      id: randomUUID(),
      baseDate: date.toISOString(),
      type,
      name: baseName,
      quantity: type === '입고' ? quantity : quantity * -1,
    })
  }
  return rows
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const view = (url.searchParams.get('view') || 'product').toLowerCase()
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json({ message: '조회 기간을 선택해주세요.' }, { status: 400 })
  }
  const start = new Date(from)
  const end = new Date(to)
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
    return NextResponse.json({ message: '잘못된 날짜 형식입니다.' }, { status: 400 })
  }
  if (end < start) {
    return NextResponse.json({ message: '종료일은 시작일 이후여야 합니다.' }, { status: 400 })
  }

  const diffMs = end.getTime() - start.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  const capped = diffDays > 365 ? 365 : Math.max(diffDays, 30)
  const count = Math.min(200, Math.ceil(capped / 7) * 5)

  const rows = generateRows(view === 'green-bean' ? 'green-bean' : 'product', count, start, end)

  return NextResponse.json({ items: rows })
}
























