'use client'

import { useCallback, useMemo, useState } from 'react'
import { ArrowDownTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { PageHeading } from '@/components/PageHeading'
import { SectionHeading } from '@/components/SectionHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'

const FILTER_TABS = [
  { key: 'custom', label: '기간 직접 선택' },
  { key: 'year', label: '연도별' },
  { key: 'quarter', label: '분기별' },
  { key: 'month', label: '월별' },
] as const

const YEARS = (() => {
  const now = new Date().getFullYear()
  return Array.from({ length: 5 }).map((_, index) => now - index)
})()

const QUARTERS = [
  { value: 1, label: '1분기', startMonth: 0 },
  { value: 2, label: '2분기', startMonth: 3 },
  { value: 3, label: '3분기', startMonth: 6 },
  { value: 4, label: '4분기', startMonth: 9 },
] as const

const MONTHS = Array.from({ length: 12 }).map((_, index) => ({
  value: index + 1,
  label: `${index + 1}월`,
}))

type SettlementRow = (typeof MOCK_SETTLEMENTS)[number]

const MOCK_SETTLEMENTS = [
  {
    id: 'SET-202512-0001',
    orderNo: 'SO-20251201-001',
    customerName: '스탠다드스퀘어 송도점',
    shipmentCompletedAt: '2025-12-02T08:30:00+09:00',
    settlementAmount: 1820000,
    tax: 182000,
  },
  {
    id: 'SET-202511-0005',
    orderNo: 'SO-20251115-003',
    customerName: '블루팬더 로스터스',
    shipmentCompletedAt: '2025-11-18T14:10:00+09:00',
    settlementAmount: 940000,
    tax: 94000,
  },
  {
    id: 'SET-202510-0010',
    orderNo: 'SO-20251021-010',
    customerName: '라이트하우스 커피랩',
    shipmentCompletedAt: '2025-10-25T10:45:00+09:00',
    settlementAmount: 2145000,
    tax: 214500,
  },
] as const

const formatDate = (value?: string | null, locale: string = 'ko-KR') => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatCurrency = (value?: number | null, locale: string = 'ko-KR', currency = 'KRW') => {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
}

export default function SettlementListPage({ params }: { params: { locale: string } }) {
  useSessionGuard(1000 * 60 * 5)
  const locale = ['ko', 'en', 'ja'].includes(params?.locale) ? params.locale : 'ko'
  const base = `/${locale}`

  const [filterMode, setFilterMode] = useState<(typeof FILTER_TABS)[number]['key']>('custom')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedYear, setSelectedYear] = useState(YEARS[0])
  const [selectedQuarter, setSelectedQuarter] = useState(1)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<SettlementRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const buildIso = (date: Date, endOfDay?: boolean) => {
    const copy = new Date(date)
    if (endOfDay) copy.setUTCHours(23, 59, 59, 999)
    return copy.toISOString()
  }

  const computeRange = useCallback(() => {
    if (filterMode === 'custom') {
      if (!fromDate || !toDate) return { error: '정산 조회 기간을 모두 선택해주세요.' }
      const start = new Date(`${fromDate}T00:00:00Z`)
      const end = new Date(`${toDate}T23:59:59Z`)
      return { from: buildIso(start), to: buildIso(end, true) }
    }
    if (filterMode === 'year') {
      const start = new Date(Date.UTC(selectedYear, 0, 1))
      const end = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59))
      return { from: buildIso(start), to: buildIso(end, true) }
    }
    if (filterMode === 'quarter') {
      const quarter = QUARTERS.find((q) => q.value === selectedQuarter) ?? QUARTERS[0]
      const start = new Date(Date.UTC(selectedYear, quarter.startMonth, 1))
      const end = new Date(Date.UTC(selectedYear, quarter.startMonth + 3, 0, 23, 59, 59))
      return { from: buildIso(start), to: buildIso(end, true) }
    }
    const start = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1))
    const end = new Date(Date.UTC(selectedYear, selectedMonth, 0, 23, 59, 59))
    return { from: buildIso(start), to: buildIso(end, true) }
  }, [filterMode, fromDate, toDate, selectedYear, selectedQuarter, selectedMonth])

  const handleSearch = useCallback(() => {
    const { from, to, error: rangeError } = computeRange()
    if (rangeError) {
      setError(rangeError)
      return
    }
    if (!from || !to) {
      setError('정산 조회 기간을 선택해주세요.')
      return
    }
    const diff = new Date(to).getTime() - new Date(from).getTime()
    const diffDays = diff / (1000 * 60 * 60 * 24)
    if (diffDays > 366) {
      setError('최대 조회 기간은 1년입니다.')
      return
    }
    setError(null)
    setLoading(true)
    setHasSearched(true)
    setTimeout(() => {
      const filtered = MOCK_SETTLEMENTS.filter((row) => {
        const time = new Date(row.shipmentCompletedAt).getTime()
        const inRange = time >= new Date(from).getTime() && time <= new Date(to).getTime()
        const keyword = query.trim().toLowerCase()
        const matchesQuery = keyword
          ? row.orderNo.toLowerCase().includes(keyword) || row.customerName.toLowerCase().includes(keyword)
          : true
        return inRange && matchesQuery
      }) as SettlementRow[]
      setRows(filtered)
      setLoading(false)
    }, 350)
  }, [computeRange, query])

  const totalAmount = useMemo(() => rows.reduce((sum, row) => sum + row.settlementAmount, 0), [rows])
  const totalTax = useMemo(() => rows.reduce((sum, row) => sum + row.tax, 0), [rows])

  const downloadCsv = (type: 'tax' | 'statement') => {
    if (!rows.length) return
    const header =
      type === 'tax'
        ? ['정산ID', '주문번호', '거래처', '정산일', '공급가액', '부가세']
        : ['정산ID', '주문번호', '거래처', '정산일', '정산금액(합계)']
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
    const csv = [
      header.join(','),
      ...rows.map((row) =>
        [
          row.id,
          row.orderNo,
          row.customerName,
          formatDate(row.shipmentCompletedAt, 'ko-KR'),
          type === 'tax' ? row.settlementAmount : row.settlementAmount + row.tax,
          type === 'tax' ? row.tax : undefined,
        ]
          .filter((value) => value !== undefined)
          .map((value) => escape(String(value ?? '')))
          .join(',')
      ),
    ].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${type === 'tax' ? 'tax-invoice' : 'transaction-statement'}-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeading
        title="정산 목록"
        description="배송 완료된 주문 건만 정산 대상에 포함됩니다."
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '정산 관리', href: `${base}/settlement` },
          { name: '정산 목록' },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
          <SectionHeading
            title="정산 조회 조건"
            description="원료 수불 대장과 동일한 기간 필터를 제공합니다."
            tabs={FILTER_TABS}
            currentTab={filterMode}
            onTabChange={(value) => setFilterMode(value as (typeof FILTER_TABS)[number]['key'])}
          />

          <div className="mt-6 space-y-6">
            {filterMode === 'custom' && (
              <div className="flex flex-wrap gap-4">
                <label className="flex flex-col text-sm font-semibold text-gray-600 dark:text-gray-200">
                  시작일
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="mt-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </label>
                <label className="flex flex-col text-sm font-semibold text-gray-600 dark:text-gray-200">
                  종료일
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
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
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
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
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
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
                    onChange={(e) => setSelectedQuarter(Number(e.target.value))}
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
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
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
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
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

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                placeholder="주문번호 또는 거래처명 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-72 rounded-full border border-gray-200 bg-white py-2 pl-4 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <button type="button" onClick={handleSearch} className="btn-primary">
                조회
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
            <div>
              배송 완료된 주문({rows.length}건)을 기준으로 정산 데이터가 생성됩니다.
              {!hasSearched && <span className="ml-2 text-amber-600 dark:text-amber-300">조회 후 다운로드할 수 있습니다.</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadCsv('tax')}
                disabled={!rows.length}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-white"
              >
                <ArrowDownTrayIcon className="size-4" />
                세금계산서 발행 다운로드
              </button>
              <button
                type="button"
                onClick={() => downloadCsv('statement')}
                disabled={!rows.length}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-white"
              >
                <DocumentArrowDownIcon className="size-4" />
                거래명세서 다운로드
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-white/10">
            <div className="max-h-[520px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      정산 ID
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      주문/거래처
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      정산 기준일
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      공급가액
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      부가세
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      합계
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        정산 데이터를 불러오는 중입니다...
                      </td>
                    </tr>
                  ) : !rows.length ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        {hasSearched ? '조건에 해당하는 정산 데이터가 없습니다.' : '조회 조건을 설정한 후 검색을 실행하세요.'}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="bg-white dark:bg-gray-900/40">
                        <td className="px-4 py-4 font-semibold sm:px-6">{row.id}</td>
                        <td className="px-4 py-4 sm:px-6">
                          <p className="font-semibold text-gray-900 dark:text-white">{row.orderNo}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-300">{row.customerName}</p>
                        </td>
                        <td className="px-4 py-4 sm:px-6">{formatDate(row.shipmentCompletedAt, locale)}</td>
                        <td className="px-4 py-4 sm:px-6">{formatCurrency(row.settlementAmount, locale)}</td>
                        <td className="px-4 py-4 sm:px-6">{formatCurrency(row.tax, locale)}</td>
                        <td className="px-4 py-4 font-semibold sm:px-6">{formatCurrency(row.settlementAmount + row.tax, locale)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {rows.length > 0 && (
                  <tfoot className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-900/80 dark:text-gray-300">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 sm:px-6">
                        합계 ({rows.length}건)
                      </td>
                      <td className="px-4 py-3 sm:px-6">{formatCurrency(totalAmount, locale)}</td>
                      <td className="px-4 py-3 sm:px-6">{formatCurrency(totalTax, locale)}</td>
                      <td className="px-4 py-3 sm:px-6">{formatCurrency(totalAmount + totalTax, locale)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}










