'use client'

import { useCallback, useMemo, useState } from 'react'
import { ArrowDownTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { PageHeading } from '@/components/PageHeading'
import { SectionHeading } from '@/components/SectionHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'
import { jsPDF } from 'jspdf'

type LedgerPageProps = {
  params: { locale: string }
}

type LedgerRow = {
  id: string
  baseDate: string
  type: '입고' | '출고'
  name: string
  quantity: number
}

const FILTER_TABS = [
  { key: 'custom', label: '기간 직접 선택' },
  { key: 'year', label: '연도별' },
  { key: 'quarter', label: '분기별' },
  { key: 'month', label: '월별' },
] as const

const VIEW_TABS = [
  { value: 'product', label: '제품별' },
  { value: 'green-bean', label: '생두별' },
] as const

const YEARS = (() => {
  const now = new Date().getFullYear()
  return Array.from({ length: 6 }).map((_, idx) => now - idx)
})()

const QUARTERS = [
  { value: 1, label: '1분기', startMonth: 0 },
  { value: 2, label: '2분기', startMonth: 3 },
  { value: 3, label: '3분기', startMonth: 6 },
  { value: 4, label: '4분기', startMonth: 9 },
]

const MONTHS = Array.from({ length: 12 }).map((_, index) => ({
  value: index + 1,
  label: `${index + 1}월`,
}))

const classNames = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const formatDate = (value?: string | null, locale: string = 'ko-KR') => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

const randomId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random()}`
}

export default function RawMaterialLedgerPage({ params }: LedgerPageProps) {
  useSessionGuard(1000 * 60 * 5)
  const locale = ['ko', 'en', 'ja'].includes(params?.locale) ? params.locale : 'ko'
  const base = `/${locale}`

  const [filterMode, setFilterMode] = useState<(typeof FILTER_TABS)[number]['key']>('custom')
  const [viewMode, setViewMode] = useState<(typeof VIEW_TABS)[number]['value']>('product')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedYear, setSelectedYear] = useState(YEARS[0])
  const [selectedQuarter, setSelectedQuarter] = useState(1)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [rows, setRows] = useState<LedgerRow[]>([])
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
      if (!fromDate || !toDate) return { error: '조회할 시작일과 종료일을 모두 선택해주세요.' }
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

  const handleSearch = useCallback(async () => {
    const { from, to, error: rangeError } = computeRange()
    if (rangeError) {
      setError(rangeError)
      return
    }
    if (!from || !to) {
      setError('조회 기간을 선택해주세요.')
      return
    }
    const diff = new Date(to).getTime() - new Date(from).getTime()
    const diffDays = diff / (1000 * 60 * 60 * 24)
    if (diffDays > 366) {
      setError('최대 조회 기간은 1년입니다.')
      return
    }
    setLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      const params = new URLSearchParams({ view: viewMode, from, to })
      const res = await fetch(`/api/materials/ledger?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || '원료 수불 데이터를 불러오지 못했습니다.')
      }
      const items = Array.isArray(data?.items) ? data.items : []
      setRows(
        items.map((row: any) => ({
          id: row.id ?? randomId(),
          baseDate: row.baseDate ?? row.base_date ?? null,
          type: row.type === '출고' ? '출고' : '입고',
          name: row.name ?? row.productName ?? '-',
          quantity: Number(row.quantity ?? 0),
        }))
      )
    } catch (err: any) {
      setRows([])
      setError(err?.message || '원료 수불 데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [computeRange, viewMode])

  const downloadExcel = useCallback(() => {
    if (!rows.length) return
    const header = ['기준일자', '구분', viewMode === 'product' ? '제품명' : '생두명', '수량(kg)']
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
    const csv = [
      header.join(','),
      ...rows.map((row) =>
        [formatDate(row.baseDate), row.type, row.name, row.quantity].map((value) => escape(String(value ?? ''))).join(',')
      ),
    ].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `raw-material-ledger-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [rows, viewMode])

  const downloadPdf = useCallback(() => {
    if (!rows.length) return
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(14)
    doc.text('원료 수불 대장', 12, 18)
    doc.setFontSize(9)
    const headers = ['기준일자', '구분', viewMode === 'product' ? '제품명' : '생두명', '수량(kg)']
    let y = 28
    doc.text(headers.join(' | '), 12, y)
    y += 6
    rows.forEach((row) => {
      const line = [formatDate(row.baseDate), row.type, row.name, `${row.quantity}`].join(' | ')
      doc.text(line, 12, y, { maxWidth: 270 })
      y += 6
      if (y > 190) {
        doc.addPage()
        y = 20
      }
    })
    doc.save(`raw-material-ledger-${Date.now()}.pdf`)
  }, [rows, viewMode])

  const totalInbound = useMemo(
    () => rows.filter((row) => row.type === '입고').reduce((sum, row) => sum + row.quantity, 0),
    [rows]
  )
  const totalOutbound = useMemo(
    () => rows.filter((row) => row.type === '출고').reduce((sum, row) => sum + row.quantity, 0),
    [rows]
  )

  return (
    <>
      <PageHeading
        title="원료 수불 대장"
        description="제품/생두 기준으로 원료 입출고 현황을 조회하고 다운로드하세요."
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '구매 관리', href: `${base}/procurement/materials` },
          { name: '원료 수불 대장' },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
          <SectionHeading
            title="조회 기준"
            description="제품별 또는 생두별 관점을 선택한 후 기간 조건을 설정하세요."
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
                <label className="flex flex-col text-sm font-semibold text-gray-600.dark:text-gray-200">
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
                    className="mt-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500.focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
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
                    className="mt-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500.focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
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
              <button type="button" onClick={handleSearch} className="btn-execute">
                조회하기
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">입출고 목록</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">조건에 맞는 원료 수불 내역을 확인하세요.</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                입고 {totalInbound}kg · 출고 {Math.abs(totalOutbound)}kg
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={downloadExcel} disabled={!rows.length} className="btn-execute disabled:cursor-not-allowed">
                  <ArrowDownTrayIcon className="size-4" aria-hidden="true" />
                  엑셀 다운로드
                </button>
                <button type="button" onClick={downloadPdf} disabled={!rows.length} className="btn-execute disabled:cursor-not-allowed">
                  <DocumentArrowDownIcon className="size-4" aria-hidden="true" />
                  PDF 다운로드
                </button>
              </div>
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
                      기준일자
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      구분
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      {viewMode === 'product' ? '제품명' : '생두명'}
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6 text-right">
                      수량(kg)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {!hasSearched && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
                        조회 조건을 선택하세요.
                      </td>
                    </tr>
                  )}
                  {hasSearched && loading && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
                        데이터를 불러오는 중입니다...
                      </td>
                    </tr>
                  )}
                  {hasSearched && !loading && !rows.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
                        조건에 해당하는 데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                  {rows.map((row) => (
                    <tr key={row.id} className="bg-white transition hover:bg-gray-50 dark:bg-gray-900/40 dark:hover:bg-gray-900/60">
                      <td className="px-4 py-4 sm:px-6">{formatDate(row.baseDate, locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR')}</td>
                      <td className="px-4 py-4 sm:px-6">
                        <span
                          className={classNames(
                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                            row.type === '입고'
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/40'
                              : 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-400/40'
                          )}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">{row.name}</td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-900 dark:text-white sm:px-6">{row.quantity.toLocaleString()}</td>
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


