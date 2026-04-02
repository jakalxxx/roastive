'use client'

import { useCallback, useMemo, useState } from 'react'
import { ArrowDownTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { PageHeading } from '@/components/PageHeading'
import { SectionHeading } from '@/components/SectionHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'
import { jsPDF } from 'jspdf'

type SalesReportPageProps = {
  params: { locale: string }
}

type SalesReportRow = {
  orderId: string
  orderNo: string
  orderDate: string | null
  customerId?: number | null
  customerName?: string | null
  blendNames?: string | null
  currency: string
  status: string
  totalAmount: number
}

type SortOption = {
  value: string
  label: string
  sort: 'orderDate' | 'customerName' | 'blendName'
  direction: 'asc' | 'desc'
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'orderDate_desc', label: '주문일자 최신순', sort: 'orderDate', direction: 'desc' },
  { value: 'orderDate_asc', label: '주문일자 오래된순', sort: 'orderDate', direction: 'asc' },
  { value: 'customerName_asc', label: '고객사 가나다순', sort: 'customerName', direction: 'asc' },
  { value: 'customerName_desc', label: '고객사 역순', sort: 'customerName', direction: 'desc' },
  { value: 'blendName_asc', label: '블렌드 가나다순', sort: 'blendName', direction: 'asc' },
  { value: 'blendName_desc', label: '블렌드 역순', sort: 'blendName', direction: 'desc' },
]

const FILTER_TABS = [
  { key: 'custom', label: '기간 직접 선택' },
  { key: 'year', label: '연도별' },
  { key: 'quarter', label: '분기별' },
  { key: 'month', label: '월별' },
] as const

const VIEW_TABS = [
  { value: 'customer', label: '고객사별' },
  { value: 'blend', label: '블렌드별' },
] as const

const QUARTERS = [
  { value: 1, label: '1분기 (1-3월)', startMonth: 0 },
  { value: 2, label: '2분기 (4-6월)', startMonth: 3 },
  { value: 3, label: '3분기 (7-9월)', startMonth: 6 },
  { value: 4, label: '4분기 (10-12월)', startMonth: 9 },
] as const

const MONTHS = Array.from({ length: 12 }).map((_, index) => ({
  value: index + 1,
  label: `${index + 1}월`,
}))

const YEARS = (() => {
  const now = new Date().getFullYear()
  return Array.from({ length: 6 }).map((_, idx) => now - idx)
})()

const classNames = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const formatDate = (value?: string | null, locale: string = 'ko-KR') => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

const formatCurrency = (amount: number, currency: string) => {
  if (Number.isNaN(amount)) return '-'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency || 'KRW',
    maximumFractionDigits: 0,
  }).format(amount)
}

const randomId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random()}`
}

export default function SalesReportPage({ params }: SalesReportPageProps) {
  useSessionGuard(1000 * 60 * 5)
  const locale = ['ko', 'en', 'ja'].includes(params?.locale) ? params.locale : 'ko'
  const base = `/${locale}`
  const [filterMode, setFilterMode] = useState<(typeof FILTER_TABS)[number]['key']>('custom')
  const [viewMode, setViewMode] = useState<(typeof VIEW_TABS)[number]['value']>('customer')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedYear, setSelectedYear] = useState(YEARS[0] ?? new Date().getFullYear())
  const [selectedQuarter, setSelectedQuarter] = useState(1)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0].value)
  const [rows, setRows] = useState<SalesReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const currentSort = SORT_OPTIONS.find((opt) => opt.value === sortOption) ?? SORT_OPTIONS[0]
  const isCustomerView = viewMode === 'customer'
  const primaryColumnLabel = isCustomerView ? '고객사' : '블렌드'
  const secondaryColumnLabel = isCustomerView ? '블렌드' : '고객사'

  const buildIsoString = (date: Date, endOfDay?: boolean) => {
    const copy = new Date(date)
    if (endOfDay) {
      copy.setUTCHours(23, 59, 59, 999)
    }
    return copy.toISOString()
  }

  const computeRange = useCallback(() => {
    if (filterMode === 'custom') {
      if (!fromDate || !toDate) {
        return { error: '조회할 시작일과 종료일을 모두 선택해주세요.' }
      }
      const start = new Date(`${fromDate}T00:00:00Z`)
      const end = new Date(`${toDate}T23:59:59Z`)
      return { from: buildIsoString(start), to: buildIsoString(end, true) }
    }
    if (filterMode === 'year') {
      const start = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0, 0))
      const end = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999))
      return { from: buildIsoString(start), to: buildIsoString(end, true) }
    }
    if (filterMode === 'quarter') {
      const quarter = QUARTERS.find((q) => q.value === selectedQuarter) ?? QUARTERS[0]
      const start = new Date(Date.UTC(selectedYear, quarter.startMonth, 1, 0, 0, 0, 0))
      const end = new Date(Date.UTC(selectedYear, quarter.startMonth + 3, 0, 23, 59, 59, 999))
      return { from: buildIsoString(start), to: buildIsoString(end, true) }
    }
    const start = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0))
    const end = new Date(Date.UTC(selectedYear, selectedMonth, 0, 23, 59, 59, 999))
    return { from: buildIsoString(start), to: buildIsoString(end, true) }
  }, [filterMode, fromDate, toDate, selectedYear, selectedQuarter, selectedMonth])

  const handleSearch = useCallback(async () => {
    const { from, to, error: rangeError } = computeRange()
    if (rangeError) {
      setError(rangeError)
      return
    }
    setLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      params.set('sort', currentSort.sort)
      params.set('direction', currentSort.direction)
      const res = await fetch(`/api/sales/reports?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || '매출 리포트를 불러오지 못했습니다.')
      }
      const items = Array.isArray(data?.items) ? data.items : []
      const normalized: SalesReportRow[] = items.map((item: any) => ({
        orderId: item.orderId ?? item.order_id ?? randomId(),
        orderNo: item.orderNo ?? item.order_no ?? '-',
        orderDate: item.orderDate ?? item.order_date ?? null,
        customerId: item.customerId ?? item.customer_id ?? null,
        customerName: item.customerName ?? item.customer_name ?? null,
        blendNames: item.blendNames ?? item.blend_names ?? '',
        currency: item.currency ?? 'KRW',
        status: item.status ?? '-',
        totalAmount: Number(item.totalAmount ?? item.total_amount ?? 0),
      }))
      setRows(normalized)
    } catch (err: any) {
      setRows([])
      setError(err?.message || '매출 리포트를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [computeRange, currentSort])

  const totalAmount = useMemo(
    () => rows.reduce((sum, row) => sum + (Number.isFinite(row.totalAmount) ? row.totalAmount : 0), 0),
    [rows]
  )

  const downloadExcel = useCallback(() => {
    if (!rows.length) return
    const primaryLabel = viewMode === 'customer' ? '고객사' : '블렌드'
    const secondaryLabel = viewMode === 'customer' ? '블렌드' : '고객사'
    const header = ['주문일자', '주문번호', primaryLabel, secondaryLabel, '통화', '매출액', '상태']
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
    const csv = [
      header.join(','),
      ...rows.map((row) =>
        [
          formatDate(row.orderDate),
          row.orderNo,
          viewMode === 'customer' ? row.customerName || '-' : row.blendNames || '-',
          viewMode === 'customer' ? row.blendNames || '-' : row.customerName || '-',
          row.currency,
          row.totalAmount,
          row.status,
        ]
          .map((value) => escape(String(value ?? '')))
          .join(',')
      ),
    ].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sales-report-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [rows, viewMode])

  const downloadPdf = useCallback(() => {
    if (!rows.length) return
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(14)
    doc.text('매출 리포트', 12, 18)
    doc.setFontSize(9)
    const headers =
      viewMode === 'customer'
        ? ['주문일자', '주문번호', '고객사', '블렌드', '통화', '매출액', '상태']
        : ['주문일자', '주문번호', '블렌드', '고객사', '통화', '매출액', '상태']
    let y = 28
    doc.text(headers.join(' | '), 12, y)
    y += 6
    rows.forEach((row) => {
      const line = [
        formatDate(row.orderDate),
        row.orderNo,
        viewMode === 'customer' ? row.customerName || '-' : row.blendNames || '-',
        viewMode === 'customer' ? row.blendNames || '-' : row.customerName || '-',
        row.currency,
        formatCurrency(row.totalAmount, row.currency),
        row.status,
      ].join(' | ')
      doc.text(line, 12, y, { maxWidth: 270 })
      y += 6
      if (y > 190) {
        doc.addPage()
        y = 20
      }
    })
    doc.save(`sales-report-${Date.now()}.pdf`)
  }, [rows, viewMode])

  const actions = (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={downloadExcel}
        disabled={!rows.length}
        className="btn-execute disabled:cursor-not-allowed"
      >
        <ArrowDownTrayIcon className="size-4" aria-hidden="true" />
        엑셀 다운로드
      </button>
      <button
        type="button"
        onClick={downloadPdf}
        disabled={!rows.length}
        className="btn-execute disabled:cursor-not-allowed"
      >
        <DocumentArrowDownIcon className="size-4" aria-hidden="true" />
        PDF 다운로드
      </button>
    </div>
  )

  return (
    <>
      <PageHeading
        title="매출 리포트"
        description="발송·정산 완료된 주문을 기준으로 매출 리포트를 조회하고 다운로드할 수 있습니다."
        actions={actions}
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '매출 리포트' },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          <SectionHeading
            title="조회 기준"
            description="고객사 또는 블렌드 관점으로 리포트를 확인할 수 있습니다."
            tabs={VIEW_TABS}
            currentTab={viewMode}
            onTabChange={(value) => setViewMode(value as (typeof VIEW_TABS)[number]['value'])}
          />
          <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            <p className="font-semibold">특이사항</p>
            <p className="mt-1">
              다량의 전체 데이터를 조회하므로 조회 조건을 수립한 후 데이터를 불러와 주세요. 초기 화면에서는 데이터를 조회하지 않습니다.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">검색 조건</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterMode(tab.key)}
                    className={classNames(
                      'rounded-full px-4 py-2 text-sm font-semibold',
                      filterMode === tab.key
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filterMode === 'custom' && (
              <div className="flex flex-wrap gap-4">
                <label className="flex flex-col text-sm font-semibold text-gray-600 dark:text-gray-200">
                  시작일
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="mt-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </label>
                <label className="flex flex-col text-sm font-semibold text-gray-600 dark:text-gray-200">
                  종료일
                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    className="mt-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </label>
              </div>
            )}

            {filterMode === 'year' && (
              <div className="flex flex-wrap gap-4">
                <label className="flex flex-col text-sm font-semibold text-gray-600 dark:text-gray-200">
                  연도
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(Number(event.target.value))}
                    className="mt-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {filterMode === 'quarter' && (
              <div className="flex flex-wrap gap-4">
                <label className="flex flex-col text-sm font-semibold text-gray-600 dark:text-gray-200">
                  연도
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(Number(event.target.value))}
                    className="mt-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-sm font-semibold text-gray-600 dark:text-gray-200">
                  분기
                  <select
                    value={selectedQuarter}
                    onChange={(event) => setSelectedQuarter(Number(event.target.value))}
                    className="mt-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {QUARTERS.map((quarter) => (
                      <option key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {filterMode === 'month' && (
              <div className="flex flex-wrap gap-4">
                <label className="flex flex-col text-sm font-semibold text-gray-600 dark:text-gray-200">
                  연도
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(Number(event.target.value))}
                    className="mt-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-sm font-semibold text-gray-600 dark:text-gray-200">
                  월
                  <select
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(Number(event.target.value))}
                    className="mt-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {MONTHS.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="flex flex-wrap items-end gap-4 border-t border-gray-100 pt-6 dark:border-white/5">
              <label className="flex flex-col text-sm font-semibold text-gray-600 dark:text-gray-200">
                정렬
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value)}
                className="mt-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={handleSearch} className="btn-execute">
                조회하기
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">매출 데이터</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                발송완료 · 정산완료 주문 기준으로 생성된 리포트입니다.
              </p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              총 <span className="font-semibold text-gray-900 dark:text-white">{rows.length}</span>건 ·{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalAmount, 'KRW')}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-white/10">
            <div className="max-h-[640px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      주문일자
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      주문번호
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      {primaryColumnLabel}
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      {secondaryColumnLabel}
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      매출액
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      통화
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {!hasSearched && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
                        조회 조건을 선택하세요.
                      </td>
                    </tr>
                  )}
                  {hasSearched && loading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
                        데이터를 불러오는 중입니다...
                      </td>
                    </tr>
                  )}
                  {hasSearched && !loading && !rows.length && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
                        조건에 해당하는 데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                  {rows.map((row) => (
                    <tr key={row.orderId} className="bg-white transition hover:bg-gray-50 dark:bg-gray-900/40 dark:hover:bg-gray-900/60">
                      <td className="px-4 py-4 sm:px-6">{formatDate(row.orderDate)}</td>
                      <td className="px-4 py-4 font-semibold sm:px-6">{row.orderNo}</td>
                      {isCustomerView ? (
                        <>
                          <td className="px-4 py-4 sm:px-6">{row.customerName || '-'}</td>
                          <td className="px-4 py-4 sm:px-6">{row.blendNames || '-'}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-4 sm:px-6">{row.blendNames || '-'}</td>
                          <td className="px-4 py-4 sm:px-6">{row.customerName || '-'}</td>
                        </>
                      )}
                      <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white sm:px-6">
                        {formatCurrency(row.totalAmount, row.currency)}
                      </td>
                      <td className="px-4 py-4 sm:px-6">{row.currency}</td>
                      <td className="px-4 py-4 sm:px-6">
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}


