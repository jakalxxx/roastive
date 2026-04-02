'use client'

import { useMemo } from 'react'
import { ShippingListPage, formatDateTime } from '../_components/ShippingListPage'

const STATUS_LABELS: Record<string, string> = {
  READY: '출고 대기',
  PICKED: '피킹 완료',
  SHIPPED: '출고 완료',
}

const STATUS_TONES: Record<string, string> = {
  READY: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/40',
  PICKED: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-200 dark:ring-sky-400/40',
  SHIPPED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/40',
}

const OUTBOUND_SORT_OPTIONS = [
  { value: 'scheduled_desc', label: '출고일 최신순', sort: 'scheduledAt', direction: 'desc' as const },
  { value: 'scheduled_asc', label: '출고일 오래된순', sort: 'scheduledAt', direction: 'asc' as const },
  { value: 'customer_asc', label: '고객사 가나다순', sort: 'customerName', direction: 'asc' as const },
  { value: 'customer_desc', label: '고객사 역순', sort: 'customerName', direction: 'desc' as const },
] as const

const ensureId = (value: any, prefix: string) => {
  const str = value == null ? '' : String(value)
  if (str.trim()) return str
  return `${prefix}-${Math.random().toString(36).slice(2)}`
}

export default function ShippingOutboundPage() {
  const config = useMemo(
    () => ({
      title: '출고 목록',
      description: '출고 예정 데이터를 확인하고 상태를 모니터링하세요.',
      apiPath: '/api/shipping/outbound',
      searchPlaceholder: '주문번호 또는 고객사명 검색',
      getBreadcrumbs: (base: string) => [
        { name: '홈', href: `${base}/dashboard` },
        { name: '배송 관리' },
        { name: '출고 목록' },
      ],
      columns: [
        {
          label: '주문번호',
          render: (item: any) => <span className="font-semibold text-gray-900 dark:text-white">{item.orderNo || '-'}</span>,
        },
        {
          label: '고객사',
          render: (item: any) => (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">{item.customerName || '-'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">{item.destination || '-'}</p>
            </div>
          ),
        },
        {
          label: '출고 창고',
          render: (item: any) => item.warehouseName || item.warehouse || '-',
        },
        {
          label: '총 품목수',
          render: (item: any) => `${item.totalItems ?? 0}건`,
        },
        {
          label: '출고 예정일',
          render: (item: any, ctx: { locale: string }) => formatDateTime(item.scheduledAt, ctx.locale === 'en' ? 'en-US' : ctx.locale === 'ja' ? 'ja-JP' : 'ko-KR'),
        },
        {
          label: '상태',
          render: (item: any) => {
            const tone = STATUS_TONES[item.status] ?? 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-200 dark:ring-gray-400/30'
            return (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}>
                {STATUS_LABELS[item.status] ?? item.status ?? '-'}
              </span>
            )
          },
        },
      ],
      sortOptions: OUTBOUND_SORT_OPTIONS,
      rowKey: (item: any) => ensureId(item.outboundId ?? item.orderNo, 'outbound'),
      getSearchValue: (item: any) => `${item.orderNo ?? ''} ${item.customerName ?? ''} ${item.destination ?? ''} ${item.warehouseName ?? ''}`,
      normalizeItem: (raw: any) => ({
        outboundId: ensureId(raw.outboundId ?? raw.outbound_id, 'outbound'),
        orderNo: raw.orderNo ?? raw.order_no ?? '-',
        customerName: raw.customerName ?? raw.customer_name ?? '-',
        destination: raw.destination ?? raw.address ?? '',
        warehouseName: raw.warehouseName ?? raw.warehouse_name ?? '',
        totalItems: Number(raw.totalItems ?? raw.total_items ?? 0),
        status: (raw.status ?? 'READY').toString().toUpperCase(),
        scheduledAt: raw.scheduledAt ?? raw.scheduled_at ?? null,
      }),
      emptyMessage: '출고 데이터가 없습니다.',
    }),
    []
  )

  return <ShippingListPage config={config} />
}



























