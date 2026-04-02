'use client'

import useSWR from 'swr'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeading } from '@/components/PageHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'

type SalesOrder = {
  orderId: string
  orderNo?: string | null
  customerId: string
  customerName?: string | null
  status?: string | null
  orderDate?: string | null
  remarks?: string | null
  currency?: string | null
}

type SalesOrderLine = {
  orderDetailId: string
  productId: string
  productName?: string | null
  quantity: number
  unit: string
  unitPrice: number
  amount: number
  variantId?: string | null
}

type SalesOrderStatusLog = {
  logId: string
  status: string
  memo?: string | null
  changedAt: string
}

type OrderDetail = {
  order: SalesOrder
  lines: SalesOrderLine[]
  statusLogs: SalesOrderStatusLog[]
}

async function fetcher(url: string) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || '불러오기 실패')
  return res.json()
}

export default function OrderDetailPage({ params }: { params: { locale: string; orderId: string } }) {
  useSessionGuard(1000 * 60 * 5)
  const { locale } = params
  const orderId = params.orderId

  const { data, error, isLoading } = useSWR<OrderDetail>(`/api/sales/orders/${orderId}`, fetcher)

  const order = data?.order
  const lines = data?.lines ?? []
  const statusLogs = data?.statusLogs ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeading
        title="주문 상세"
        description="주문 기본 정보와 라인, 이력"
        breadcrumbs={[
          { name: '주문 목록', href: `/${locale}/orders` },
          { name: order?.orderNo || '주문 상세' },
        ]}
      />

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200">
          {error.message}
        </div>
      ) : null}

      {/* 기본 정보 */}
      <div className="mt-6 grid gap-6">
        <Card title="기본 정보">
          {isLoading ? (
            <Placeholder />
          ) : order ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="주문번호">{order.orderNo || '-'}</Field>
              <Field label="고객사">{order.customerName || order.customerId}</Field>
              <Field label="상태">{order.status || '-'}</Field>
              <Field label="주문일시">{order.orderDate ? new Date(order.orderDate).toLocaleString() : '-'}</Field>
              <Field label="통화">{order.currency || '-'}</Field>
              <Field label="비고">{order.remarks || '-'}</Field>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-300">데이터가 없습니다.</div>
          )}
        </Card>

        {/* 주문 제품 정보 */}
        <Card title="주문 제품 정보">
          {isLoading ? (
            <Placeholder />
          ) : lines.length ? (
            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/10">
              <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-900/80 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left">제품명</th>
                    <th className="px-4 py-3 text-left">수량</th>
                    <th className="px-4 py-3 text-left">단위</th>
                    <th className="px-4 py-3 text-left">금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {lines.map((line) => (
                    <tr key={line.orderDetailId} className="bg-white dark:bg-gray-900/40">
                      <td className="px-4 py-3">{line.productName || line.productId}</td>
                      <td className="px-4 py-3">{line.quantity}</td>
                      <td className="px-4 py-3">{line.unit}</td>
                      <td className="px-4 py-3">{line.amount?.toLocaleString() ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-300">라인이 없습니다.</div>
          )}
        </Card>

        {/* 배송 및 패킹 정보 - 데이터 소스 미확인: 빈 상태 표시 */}
        <Card title="배송 및 패킹 정보">
          <div className="text-sm text-gray-500 dark:text-gray-300">배송/패킹 정보 API가 아직 없습니다.</div>
        </Card>

        {/* 주문 이력 */}
        <Card title="주문 이력">
          {isLoading ? (
            <Placeholder />
          ) : statusLogs.length ? (
            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/10">
              <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-900/80 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left">상태</th>
                    <th className="px-4 py-3 text-left">메모</th>
                    <th className="px-4 py-3 text-left">변경시각</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {statusLogs.map((log) => (
                    <tr key={log.logId} className="bg-white dark:bg-gray-900/40">
                      <td className="px-4 py-3">{log.status}</td>
                      <td className="px-4 py-3">{log.memo || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                        {log.changedAt ? new Date(log.changedAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-300">이력이 없습니다.</div>
          )}
        </Card>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <div className="text-sm text-gray-900 dark:text-gray-100">{children}</div>
    </div>
  )
}

function Placeholder() {
  return <div className="text-sm text-gray-500 dark:text-gray-300">불러오는 중...</div>
}








