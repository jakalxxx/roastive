'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PageHeading } from '@/components/PageHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'

type ShippingListItem = Record<string, any>

type ColumnRenderContext = { locale: string }

type Column = {
  label: string
  className?: string
  render: (item: ShippingListItem, ctx: ColumnRenderContext) => ReactNode
}

type SortOption = {
  value: string
  label: string
  sort: string
  direction: 'asc' | 'desc'
}

type ShippingListPageProps = {
  config: {
    title: string
    description: string
    apiPath: string
    searchPlaceholder: string
    getBreadcrumbs: (basePath: string) => Array<{ name: string; href?: string }>
    columns: Column[]
    sortOptions: SortOption[]
    rowKey: (item: ShippingListItem) => string
    getSearchValue: (item: ShippingListItem) => string
    normalizeItem: (raw: any) => ShippingListItem
    emptyMessage: string
    renderToolbarExtras?: () => ReactNode
    selection?: {
      renderActions?: (context: {
        selectedKeys: string[]
        selectedItems: ShippingListItem[]
        clearSelection: () => void
      }) => ReactNode
      label?: string
    }
  }
}

const PAGE_SIZES = [10, 20, 30]

export function formatDateTime(value?: string | null, locale: string = 'ko-KR') {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function ShippingListPage({ config }: ShippingListPageProps) {
  useSessionGuard(1000 * 60 * 5)
  const pathname = usePathname() || '/ko'
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] === 'en' || segments[0] === 'ja' || segments[0] === 'ko' ? segments[0] : 'ko'
  const base = `/${locale}`

  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [sortValue, setSortValue] = useState(config.sortOptions[0]?.value ?? '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0])
  const [items, setItems] = useState<ShippingListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim().toLowerCase())
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetch(config.apiPath, { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || '데이터를 불러오지 못했습니다.')
        const rawItems = Array.isArray(data?.items) ? data.items : []
        setItems(rawItems.map((raw: any) => config.normalizeItem(raw)))
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setItems([])
        setError(err?.message || '데이터를 불러오지 못했습니다.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [config])

  useEffect(() => {
    setSelectedKeys((prev) => prev.filter((key) => items.some((item) => config.rowKey(item) === key)))
  }, [items, config])

  const sortConfig = useMemo(() => config.sortOptions.find((option) => option.value === sortValue), [config.sortOptions, sortValue])

  const filteredItems = useMemo(() => {
    let data = items
    if (search) {
      data = data.filter((item) => config.getSearchValue(item).toLowerCase().includes(search))
    }
    if (sortConfig?.sort) {
      const field = sortConfig.sort
      const direction = sortConfig.direction
      data = [...data].sort((a, b) => {
        const av = (a?.[field] ?? '').toString().toLowerCase()
        const bv = (b?.[field] ?? '').toString().toLowerCase()
        if (av === bv) return 0
        if (direction === 'asc') return av > bv ? 1 : -1
        return av < bv ? 1 : -1
      })
    }
    return data
  }, [items, search, sortConfig, config])

  const total = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const breadcrumbs = config.getBreadcrumbs(base)
  const emptyState = !loading && total === 0
  const selectionEnabled = Boolean(config.selection)
  const selectedItems = useMemo(
    () => (selectionEnabled ? items.filter((item) => selectedKeys.includes(config.rowKey(item))) : []),
    [selectionEnabled, items, selectedKeys, config]
  )

  const clearSelection = () => setSelectedKeys([])
  const pagedKeys = pagedItems.map((item) => config.rowKey(item))
  const allPagedSelected = selectionEnabled && pagedKeys.length > 0 && pagedKeys.every((key) => selectedKeys.includes(key))
  const toggleSelectAll = () => {
    if (!selectionEnabled) return
    if (allPagedSelected) {
      setSelectedKeys((prev) => prev.filter((key) => !pagedKeys.includes(key)))
    } else {
      setSelectedKeys((prev) => Array.from(new Set([...prev, ...pagedKeys])))
    }
  }

  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]))
  }

  return (
    <>
      <PageHeading title={config.title} description={config.description} breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          {selectionEnabled ? (
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 text-sm text-gray-600 dark:border-white/5 dark:text-gray-300">
              <div>
                선택된 항목{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedKeys.length}
                </span>
                건
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={!selectedKeys.length}
                  className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-200 dark:hover:border-white/20 dark:hover:text-white"
                >
                  선택 해제
                </button>
                {config.selection?.renderActions
                  ? config.selection.renderActions({
                      selectedKeys,
                      selectedItems,
                      clearSelection,
                    })
                  : null}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 text-sm text-gray-600 dark:border-white/5 dark:text-gray-300 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder={config.searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-64 rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              {config.sortOptions.length ? (
                <select
                  value={sortValue}
                  onChange={(e) => {
                    setSortValue(e.target.value)
                    setPage(1)
                  }}
                  className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  {config.sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : null}
              <div className="flex items-center gap-2">
                <span>페이지당</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}건
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
              <div>
                총 <span className="font-semibold text-gray-900 dark:text-white">{total}</span>건
              </div>
              {config.renderToolbarExtras ? <div className="flex items-center gap-2">{config.renderToolbarExtras()}</div> : null}
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-white/10">
            <div className="max-h-[560px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                  <tr>
                    {selectionEnabled ? (
                      <th scope="col" className="w-12 px-4 py-3 sm:px-6">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-white/20"
                          checked={allPagedSelected}
                          onChange={toggleSelectAll}
                          aria-label="전체 선택"
                        />
                      </th>
                    ) : null}
                    {config.columns.map((column) => (
                      <th key={column.label} scope="col" className={`px-4 py-3 sm:px-6 ${column.className ?? ''}`}>
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {pagedItems.map((item) => {
                    const key = config.rowKey(item)
                    const checked = selectedKeys.includes(key)
                    return (
                      <tr key={key} className="bg-white dark:bg-gray-900/40">
                        {selectionEnabled ? (
                          <td className="px-4 py-4 sm:px-6">
                            <input
                              type="checkbox"
                              className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-white/20"
                              checked={checked}
                              onChange={() => toggleSelect(key)}
                              aria-label="행 선택"
                            />
                          </td>
                        ) : null}
                        {config.columns.map((column) => (
                          <td key={column.label} className={`px-4 py-4 sm:px-6 ${column.className ?? ''}`}>
                            {column.render(item, { locale })}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {loading ? (
              <div className="border-t border-gray-100 px-6 py-6 text-center text-sm text-gray-500 dark:border-white/5 dark:text-gray-300">
                데이터를 불러오는 중입니다...
              </div>
            ) : null}
            {emptyState ? (
              <div className="border-t border-gray-100 px-6 py-10 text-center text-sm text-gray-500 dark:border-white/5 dark:text-gray-300">
                {config.emptyMessage}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              총 <span className="font-semibold text-gray-900 dark:text-white">{total}</span>건
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
              >
                이전
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
              >
                다음
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}


