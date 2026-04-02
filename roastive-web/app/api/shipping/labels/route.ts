import { NextResponse } from 'next/server'

const SAMPLE_LABELS = [
  {
    labelId: 'LBL-240001',
    orderNo: 'ORD-202411-001',
    customerName: '센트럴 커피',
    destination: '서울시 서초구 반포대로 45',
    carrier: 'CJ대한통운',
    trackingNo: '6475-2213-9988',
    status: 'READY',
    requestedAt: '2024-11-27T09:10:00+09:00',
  },
  {
    labelId: 'LBL-240002',
    orderNo: 'ORD-202411-002',
    customerName: '브루어스 클럽',
    destination: '부산시 해운대구 센텀서로 25',
    carrier: '롯데택배',
    trackingNo: '8821-3334-1099',
    status: 'PRINTED',
    requestedAt: '2024-11-26T15:42:00+09:00',
  },
  {
    labelId: 'LBL-240003',
    orderNo: 'ORD-202411-003',
    customerName: '아웃사이더 로스터스',
    destination: '대구시 수성구 달구벌대로 2250',
    carrier: '한진택배',
    trackingNo: '5511-8822-0044',
    status: 'CANCELLED',
    requestedAt: '2024-11-25T11:05:00+09:00',
  },
]

export async function GET() {
  return NextResponse.json({ items: SAMPLE_LABELS })
}



























