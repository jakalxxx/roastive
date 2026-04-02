'use client'

import { useEffect, useMemo, useState } from 'react'
import { PageHeading } from '@/components/PageHeading'
import { usePathname, useRouter } from 'next/navigation'
import type { Route } from 'next'
import useSWR from 'swr'

type PillTone = 'brand' | 'success' | 'warning' | 'danger' | 'muted'

type TodayOrder = {
  orderId: string
  orderNo?: string | null
  customerName?: string | null
  productNames?: string | null
  status?: string | null
  orderDate?: string | null
}

type TodayOrdersResponse = { count: number; items: TodayOrder[] }

type ProductionPlan = {
  sku: string
  profile: string
  batch: string
  targetKg: number
  line: string
  start: string
  status: string
  tone: PillTone
}

type WarehouseStock = {
  id: string
  name: string
  material: string
  location: string
  currentKg: number
  safetyKg: number
  fillPercent: number
  status: 'ok' | 'warning'
}

type ParcelShipment = {
  id: string
  carrier: string
  destination: string
  shippedAt: string
  lastScan: string
  idleHours: number
  status: string
  tone: PillTone
}

type CoffeeIndexPayload = {
  price: number
  changePercent: number
  currency: string
  updatedAt: string
  fallback?: boolean
  message?: string
}

const productionPlans: ProductionPlan[] = [
  { sku: '브런치 블렌드 500g', profile: 'Loring S35 · 205℃', batch: 'BB-117', targetKg: 280, line: '로스터 1호기', start: '08:30', status: '배출 중', tone: 'success' },
  { sku: '디카페인 드립백', profile: 'Stronghold S7 · 198℃', batch: 'DC-044', targetKg: 75, line: 'R&D 라인', start: '10:00', status: '프로파일 검증', tone: 'warning' },
  { sku: '하우스 에스프레소ㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴ', profile: 'Probat P25 · 212℃', batch: 'HE-302', targetKg: 320, line: '로스터 2호기', start: '13:00', status: '원두 블렌딩 대기', tone: 'brand' },
]

const warehouseStocks: WarehouseStock[] = [
  { id: 'WH-A01', name: '안성 자동화 창고', material: '브라질 NY2 생두', location: '빈 12열 A-03', currentKg: 820, safetyKg: 1500, fillPercent: 42, status: 'warning' },
  { id: 'WH-C02', name: '김포 저온 창고', material: '케냐 AA 생두', location: '저온 2층 B-11', currentKg: 410, safetyKg: 800, fillPercent: 38, status: 'warning' },
  { id: 'WH-A02', name: '안성 부자재 존', material: '드립백 필터', location: '패키징 존 C-07', currentKg: 9_500, safetyKg: 12_000, fillPercent: 64, status: 'ok' },
  { id: 'WH-B03', name: '부산 3PL', material: '콜롬비아 수프리모', location: '램프존 D-22', currentKg: 1_950, safetyKg: 2_200, fillPercent: 71, status: 'ok' },
]

const parcelShipments: ParcelShipment[] = [
  { id: 'TBX-551204', carrier: 'CJ대한통운', destination: '서울 마포', shippedAt: '11.25 09:10', lastScan: '11.25 21:55 (상차)', idleHours: 14, status: '배송중', tone: 'brand' },
  { id: 'TBX-551205', carrier: '롯데택배', destination: '대전 서구', shippedAt: '11.24 16:40', lastScan: '11.25 02:10 (터미널 입고)', idleHours: 32, status: '경로 정체', tone: 'warning' },
  { id: 'TBX-551206', carrier: '한진택배', destination: '부산 해운대', shippedAt: '11.24 14:22', lastScan: '11.24 14:22 (집하)', idleHours: 40, status: '미이동 경고', tone: 'danger' },
]

const toneClasses: Record<PillTone, string> = {
  brand: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-400/40',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-400/40',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/40',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-400/40',
  muted: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/30',
}

export default function DashboardPage() {
  const pathname = usePathname() || '/ko'
  const router = useRouter()
  const seg = pathname.split('/').filter(Boolean)
  const locale = seg[0] === 'en' || seg[0] === 'ja' || seg[0] === 'ko' ? seg[0] : 'ko'
  const base = `/${locale}`
  const today = new Date()
  const formatted = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(today)
  const totalProductionKg = productionPlans.reduce((sum, plan) => sum + plan.targetKg, 0)

  const { data: todayOrdersRes, error: todayOrdersErr, isLoading: todayLoading } = useSWR<TodayOrdersResponse>(
    '/api/dashboard/orders/today',
    async (url: string) => {
      const res = await fetch(url, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || '주문 정보를 불러오지 못했습니다.')
      return data
    },
  )

  const { data: customerStats, error: customerErr, isLoading: customerLoading } = useSWR<{ newActiveCustomers: number }>(
    '/api/dashboard/customers/new-month',
    async (url: string) => {
      const res = await fetch(url, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || '고객 통계를 불러오지 못했습니다.')
      return data
    },
  )

  const totalOrders = todayOrdersRes?.count ?? 0
  const todayOrders = todayOrdersRes?.items ?? []
  const [coffeeIndex, setCoffeeIndex] = useState<CoffeeIndexPayload | null>(null)
  const [coffeeLoading, setCoffeeLoading] = useState(true)
  const [coffeeError, setCoffeeError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setCoffeeLoading(true)
    setCoffeeError(null)
    fetch('/api/coffee-index', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || '지수를 불러오지 못했습니다.')
        if (active) setCoffeeIndex(data)
      })
      .catch((err) => {
        if (!active) return
        setCoffeeIndex(null)
        setCoffeeError(err?.message || '지수를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (active) setCoffeeLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const coffeeDateLabel = useMemo(() => {
    if (!coffeeIndex?.updatedAt) return null
    try {
      return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(coffeeIndex.updatedAt))
    } catch {
      return coffeeIndex.updatedAt
    }
  }, [coffeeIndex?.updatedAt, locale])

  const coffeePriceLabel = coffeeIndex ? `${coffeeIndex.price.toFixed(2)} ${coffeeIndex.currency ?? ''}` : coffeeLoading ? '불러오는 중…' : '--'
  const coffeeChangeLabel = coffeeIndex
    ? `${coffeeIndex.changePercent >= 0 ? '+' : ''}${coffeeIndex.changePercent.toFixed(2)}%`
    : coffeeLoading
      ? '로딩 중'
      : '데이터 없음'
  const coffeeChangeTone =
    coffeeIndex && !coffeeLoading
      ? coffeeIndex.fallback
        ? 'text-gray-400 dark:text-gray-500'
        : coffeeIndex.changePercent >= 0
          ? 'text-emerald-600 dark:text-emerald-300'
          : 'text-rose-600 dark:text-rose-300'
      : 'text-gray-400 dark:text-gray-500'
  const coffeeSubtitle = coffeeLoading
    ? '데이터 불러오는 중...'
    : coffeeError
      ? coffeeError
      : coffeeIndex?.message
        ? coffeeIndex.message
        : coffeeDateLabel
          ? `기준일자 ${coffeeDateLabel}`
          : '기준일자 정보 없음'

  const handleTodayOrdersClick = () => {
    const todayStr = new Date().toISOString().slice(0, 10)
    router.push(`${base}/orders?date=${todayStr}` as Route)
  }

  const handleNewCustomersClick = () => {
    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    router.push(`${base}/user/customers?month=${monthStr}` as Route)
  }

  return (
    <>
      <PageHeading
        title="대시보드"
        description="오늘의 주문 · 생산 · 재고 · 배송 현황을 확인하세요."
        meta={<p className="text-sm text-gray-500 dark:text-gray-400">{formatted} 기준 자동 갱신</p>}
        breadcrumbs={[{ name: '홈', href: `${base}/dashboard` }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 [&_button]:whitespace-nowrap">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">오늘의 총 생산량</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{totalProductionKg.toLocaleString()}kg</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">라인 계획 합산</p>
          </div>
          <button
            type="button"
            onClick={handleTodayOrdersClick}
            className="rounded-3xl border border-gray-100 bg-white px-6 py-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-white/10 dark:bg-white/5"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">오늘의 주문건수</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {todayLoading ? '…' : `${totalOrders}건`}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {todayOrdersErr ? todayOrdersErr.message : '실시간 접수 현황'}
            </p>
          </button>
          <button
            type="button"
            onClick={handleNewCustomersClick}
            className="rounded-3xl border border-gray-100 bg-white px-6 py-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-white/10 dark:bg-white/5"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">이달의 신규 고객</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {customerLoading ? '…' : `${customerStats?.newActiveCustomers ?? 0}건`}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {customerErr ? customerErr.message : `${today.getFullYear()}년 ${today.getMonth() + 1}월 기준`}
            </p>
          </button>
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">커피지수 (KC=F)</p>
              <span className={`text-sm font-semibold ${coffeeChangeTone}`}>{coffeeChangeLabel}</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{coffeePriceLabel}</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{coffeeSubtitle}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">오늘의 주문 목록</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {todayLoading ? '불러오는 중...' : `${todayOrders.length}건 접수됨`}
              </p>
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Detail · stacked</span>
          </div>
          <div className="mt-6 flow-root">
            <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-white/10">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/5 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-4 py-3 sm:px-6">주문일시</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">고객사명</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">제품명</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">주문번호</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {todayOrdersErr ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-sm text-rose-600 dark:text-rose-200">
                          {todayOrdersErr.message}
                        </td>
                      </tr>
                    ) : todayOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                          오늘 등록된 주문이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      todayOrders.map((order) => (
                        <tr key={order.orderId} className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                          <td className="px-4 py-4 font-medium sm:px-6">
                            {order.orderDate ? new Date(order.orderDate).toLocaleString() : '-'}
                          </td>
                          <td className="px-4 py-4 sm:px-6">{order.customerName || '-'}</td>
                          <td className="px-4 py-4 sm:px-6">
                            <p className="max-w-[200px] truncate" title={order.productNames ?? ''}>
                              {order.productNames || '-'}
                            </p>
                          </td>
                          <td className="px-4 py-4 sm:px-6">{order.orderNo || '-'}</td>
                          <td className="px-4 py-4 sm:px-6">
                            <span className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-400/40">
                              {order.status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>


          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">오늘의 제품별 생산 계획</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">라인별 배치와 상태를 추적하세요.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {productionPlans.map((plan) => (
              <article key={plan.batch} className="rounded-2xl border border-gray-100 bg-white/70 p-4 shadow-sm transition hover:border-gray-200 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{plan.line}</p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.sku}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.profile}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">타깃</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{plan.targetKg}kg</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">배치 {plan.batch}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    시작 {plan.start}
                  </div>
                  <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${toneClasses[plan.tone]}`}>
                    {plan.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>


          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">창고 재고 현황</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">안전 재고 이하 품목에 경고를 표시합니다.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {warehouseStocks.map((stock) => {
              const deficit = stock.currentKg < stock.safetyKg
              const warning = deficit || stock.status === 'warning'
              const badgeTone = warning ? 'warning' : 'success'
              return (
                <article key={stock.id} className={`rounded-2xl border p-4 shadow-sm ${warning ? 'border-amber-200 bg-amber-50/40 dark:border-amber-400/30 dark:bg-amber-500/10' : 'border-gray-100 bg-white/80 dark:border-white/10 dark:bg-white/5'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stock.name}</p>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{stock.material}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stock.location}</p>
                    </div>
                    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneClasses[badgeTone]}`}>
                      {warning ? '재고 부족' : '안정'}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">현재 재고</dt>
                      <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{stock.currentKg.toLocaleString()} kg</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">안전 재고</dt>
                      <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{stock.safetyKg.toLocaleString()} kg</dd>
                    </div>
                  </dl>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>충전률</span>
                      <span>{stock.fillPercent}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-100 dark:bg-white/10">
                      <div className={`h-full rounded-full ${warning ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(stock.fillPercent, 100)}%` }} />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>


          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">출고된 택배 배송 이력</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">송장, 발송일, 상태만 간결하게 확인하세요.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {parcelShipments.map((parcel) => {
              const delayed = parcel.idleHours >= 24
              return (
                <article key={parcel.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">송장 {parcel.id}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{parcel.shippedAt}</p>
                  </div>
                  <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${toneClasses[delayed ? 'danger' : parcel.tone]}`}>
                    {delayed ? '미이동 경고' : parcel.status}
                  </span>
                </article>
              )
            })}
          </div>
        </section>
        </div>
      </div>
    </>
  )
}


