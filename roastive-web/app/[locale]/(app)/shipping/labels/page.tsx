'use client'

import { useCallback, useMemo, useState } from 'react'
import { ShippingListPage, formatDateTime } from '../_components/ShippingListPage'

const STATUS_LABELS: Record<string, string> = {
  READY: '발행 대기',
  PRINTED: '출력 완료',
  CANCELLED: '취소됨',
}

const STATUS_TONES: Record<string, string> = {
  READY: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/40',
  PRINTED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/40',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-400/30',
}

const LABEL_SORT_OPTIONS = [
  { value: 'requested_desc', label: '신청일 최신순', sort: 'requestedAt', direction: 'desc' as const },
  { value: 'requested_asc', label: '신청일 오래된순', sort: 'requestedAt', direction: 'asc' as const },
  { value: 'customer_asc', label: '고객사 가나다순', sort: 'customerName', direction: 'asc' as const },
  { value: 'customer_desc', label: '고객사 역순', sort: 'customerName', direction: 'desc' as const },
] as const

const CARRIER_OPTIONS = [
  { value: 'CJ', label: 'CJ대한통운' },
  { value: 'LOTTE', label: '롯데택배' },
  { value: 'HANJIN', label: '한진택배' },
] as const

const ensureId = (value: any, prefix: string) => {
  const str = value == null ? '' : String(value)
  if (str.trim()) return str
  return `${prefix}-${Math.random().toString(36).slice(2)}`
}

export default function ShippingLabelsPage() {
  const [carrier, setCarrier] = useState<(typeof CARRIER_OPTIONS)[number]['value']>(CARRIER_OPTIONS[0].value)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<'excel' | 'goodsflow' | null>(null)

  const carrierLabel = useMemo(
    () => CARRIER_OPTIONS.find((option) => option.value === carrier)?.label ?? carrier,
    [carrier]
  )

  const handleBulkAction = useCallback(
    async (type: 'excel' | 'goodsflow', selectedItems: any[], clearSelection: () => void) => {
      if (!selectedItems.length || pendingAction) return
      setPendingAction(type)
      setActionMessage(null)
      await new Promise((resolve) => setTimeout(resolve, 600))
      setActionMessage(
        `선택된 ${selectedItems.length}건을 ${carrierLabel} ${
          type === 'excel' ? '엑셀로 다운로드했습니다.' : '굿스플로로 전달했습니다.'
        }`
      )
      setPendingAction(null)
      clearSelection()
    },
    [carrierLabel, pendingAction]
  )

  const config = useMemo(
    () => ({
      title: '운송장 출력',
      description: '주문별 운송장 발행 현황을 확인하고 관리하세요.',
      apiPath: '/api/shipping/labels',
      searchPlaceholder: '주문번호, 고객사명 또는 운송장 번호 검색',
      getBreadcrumbs: (base: string) => [
        { name: '홈', href: `${base}/dashboard` },
        { name: '배송 관리' },
        { name: '운송장 출력' },
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
              <p className="text-xs text-gray-500 dark:text-gray-300">{item.destination || item.address || '-'}</p>
            </div>
          ),
        },
        {
          label: '택배사',
          render: (item: any) => item.carrier || '-',
        },
        {
          label: '운송장 번호',
          render: (item: any) => item.trackingNo || '-',
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
        {
          label: '신청일시',
          render: (item: any, ctx: { locale: string }) => formatDateTime(item.requestedAt, ctx.locale === 'en' ? 'en-US' : ctx.locale === 'ja' ? 'ja-JP' : 'ko-KR'),
        },
      ],
      sortOptions: LABEL_SORT_OPTIONS,
      rowKey: (item: any) => ensureId(item.labelId ?? item.orderNo, 'label'),
      getSearchValue: (item: any) => `${item.orderNo ?? ''} ${item.customerName ?? ''} ${item.trackingNo ?? ''} ${item.carrier ?? ''}`,
      normalizeItem: (raw: any) => ({
        labelId: ensureId(raw.labelId ?? raw.label_id, 'label'),
        orderNo: raw.orderNo ?? raw.order_no ?? '-',
        customerName: raw.customerName ?? raw.customer_name ?? '-',
        destination: raw.destination ?? raw.address ?? '',
        carrier: raw.carrier ?? raw.courier ?? '',
        trackingNo: raw.trackingNo ?? raw.tracking_no ?? '',
        status: (raw.status ?? 'READY').toString().toUpperCase(),
        requestedAt: raw.requestedAt ?? raw.requested_at ?? null,
      }),
      emptyMessage: '등록된 운송장 데이터가 없습니다.',
      selection: {
        renderActions: ({ selectedItems, clearSelection }: { selectedItems: any[]; clearSelection: () => void }) => (
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as (typeof CARRIER_OPTIONS)[number]['value'])}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {CARRIER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedItems.length || pendingAction === 'excel'}
              onClick={() => handleBulkAction('excel', selectedItems, clearSelection)}
              className="btn-execute disabled:cursor-not-allowed"
            >
              엑셀 다운로드
            </button>
            <button
              type="button"
              disabled={!selectedItems.length || pendingAction === 'goodsflow'}
              onClick={() => handleBulkAction('goodsflow', selectedItems, clearSelection)}
              className="btn-execute disabled:cursor-not-allowed"
            >
              굿스플로
            </button>
            {actionMessage ? (
              <p className="basis-full text-xs font-semibold text-emerald-600 dark:text-emerald-300">{actionMessage}</p>
            ) : null}
          </div>
        ),
      },
    }),
    [carrier, handleBulkAction, pendingAction, actionMessage]
  )

  return <ShippingListPage config={config} />
}


