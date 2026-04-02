import { NextResponse } from 'next/server'

const SAMPLE_OUTBOUND = [
  {
    outboundId: 'OUT-240010',
    orderNo: 'ORD-202411-004',
    customerName: '모던 커피랩',
    destination: '경기도 성남시 분당구 황새울로 326',
    warehouseName: '판교 물류센터',
    totalItems: 12,
    status: 'READY',
    scheduledAt: '2024-11-28T14:00:00+09:00',
  },
  {
    outboundId: 'OUT-240011',
    orderNo: 'ORD-202411-005',
    customerName: '어헤드 베이커리',
    destination: '서울시 마포구 독막로 88',
    warehouseName: '상암 물류허브',
    totalItems: 8,
    status: 'PICKED',
    scheduledAt: '2024-11-27T10:30:00+09:00',
  },
  {
    outboundId: 'OUT-240012',
    orderNo: 'ORD-202411-006',
    customerName: '그라운드 커피바',
    destination: '인천시 연수구 센트럴로 160',
    warehouseName: '인천 3센터',
    totalItems: 5,
    status: 'SHIPPED',
    scheduledAt: '2024-11-26T09:00:00+09:00',
  },
]

export async function GET() {
  return NextResponse.json({ items: SAMPLE_OUTBOUND })
}



























