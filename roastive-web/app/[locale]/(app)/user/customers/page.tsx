'use client'

import { Fragment, useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PageHeading } from '@/components/PageHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'
import { useAuth } from '@/components/auth/AuthProvider'

type Customer = {
  customerId: string
  customerName: string
  code?: string | null
  status?: string | null
  representativeName?: string | null
  productUsed?: string | null
  createdAt?: string | null
  roasteryId?: string | null
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '활성' },
  { value: 'INACTIVE', label: '비활성' },
  { value: 'PENDING', label: '대기' },
] as const
type StatusValue = (typeof STATUS_OPTIONS)[number]['value']
const DEFAULT_STATUS: StatusValue = 'ACTIVE'

const STATUS_TONES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/40',
  INACTIVE: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/30',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/40',
}

const PAGE_SIZES = [10, 20, 30] as const
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0] ?? 10
type CustomerSortValue = (typeof CUSTOMER_SORT_OPTIONS)[number]['value']
const CUSTOMER_SORT_OPTIONS = [
  { value: 'createdAt_desc', label: '등록일 최신순', sort: 'createdAt', direction: 'desc' as const },
  { value: 'createdAt_asc', label: '등록일 오래된순', sort: 'createdAt', direction: 'asc' as const },
  { value: 'customerName_asc', label: '회사명 가나다순', sort: 'customerName', direction: 'asc' as const },
  { value: 'customerName_desc', label: '회사명 역순', sort: 'customerName', direction: 'desc' as const },
  { value: 'code_asc', label: '사업자번호 오름차순', sort: 'code', direction: 'asc' as const },
  { value: 'code_desc', label: '사업자번호 내림차순', sort: 'code', direction: 'desc' as const },
] as const
const CUSTOMER_META_STORAGE_KEY = 'customer_meta_v1'
const initialDrawerValues = {
  customerName: '',
  businessRegNo: '',
  representativeName: '',
  productUsed: '',
  status: DEFAULT_STATUS,
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function formatDate(value?: string | null, locale: string = 'ko-KR') {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function formatBizNumber(value?: string | null) {
  if (!value) return '-'
  const digits = value.replace(/\D+/g, '')
  if (digits.length !== 10) return value
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

const bizNoRegex = /^\d{3}-?\d{2}-?\d{5}$/

function readCustomerMeta(): Record<string, { representativeName?: string; productUsed?: string }> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = window.localStorage.getItem(CUSTOMER_META_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Record<string, { representativeName?: string; productUsed?: string }>) : {}
  } catch {
    return {}
  }
}

function saveCustomerMeta(meta: Record<string, { representativeName?: string; productUsed?: string }>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CUSTOMER_META_STORAGE_KEY, JSON.stringify(meta))
  } catch {
    // ignore
  }
}

export default function UserCustomersPage() {
  useSessionGuard(1000 * 60 * 5)
  const { user } = useAuth()
  const pathname = usePathname() || '/ko'
  const searchParams = useSearchParams()
  const router = useRouter()
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] === 'en' || segments[0] === 'ja' || segments[0] === 'ko' ? segments[0] : 'ko'
  const base = `/${locale}`
  const roasteryId = (user?.roasteries?.[0]?.roastery_id ?? user?.roasteries?.[0]?.id ?? '') as string

  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortKey, setSortKey] = useState<'code' | 'customerName' | 'representativeName' | 'productUsed' | 'status' | 'createdAt'>('createdAt')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
  const [sortOption, setSortOption] = useState<CustomerSortValue>(CUSTOMER_SORT_OPTIONS[0].value)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<StatusValue>(DEFAULT_STATUS)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerValues, setDrawerValues] = useState(initialDrawerValues)
  const [drawerError, setDrawerError] = useState<string | null>(null)
  const [drawerSaving, setDrawerSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const paramMonth = searchParams.get('month') ?? ''
    setMonthFilter(paramMonth)
  }, [searchParams])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetch('/api/user/customers', { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || '고객사 목록을 불러오지 못했습니다.')
        const meta = readCustomerMeta()
        const items = Array.isArray(data?.items)
          ? (data.items as any[]).map((item) => {
              const id = String(item.customerId ?? item.customer_id ?? '')
              const metaEntry = meta?.[id] ?? {}
              return {
                customerId: id,
                customerName: String(item.customerName ?? item.customer_name ?? ''),
                code: item.code ?? item.customer_code ?? '',
                status: item.status ?? 'ACTIVE',
                createdAt: item.createdAt ?? item.created_at ?? null,
                representativeName:
                  item.representativeName ?? item.representative_name ?? metaEntry.representativeName ?? '',
                productUsed: item.productUsed ?? item.product_used ?? metaEntry.productUsed ?? '',
                roasteryId: String(item.roasteryId ?? roasteryId ?? ''),
              }
            })
          : []
        setCustomers(items)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setError(err?.message || '고객사 목록을 불러오지 못했습니다.')
        setCustomers([])
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [refreshToken])

  useEffect(() => {
    setSelected((prev) => prev.filter((id) => customers.some((c) => c.customerId === id)))
  }, [customers])

  const handleSortOptionChange = useCallback((value: CustomerSortValue) => {
    const option = CUSTOMER_SORT_OPTIONS.find((opt) => opt.value === value) ?? CUSTOMER_SORT_OPTIONS[0]
    setSortOption(option.value)
    setSortKey(option.sort)
    setDirection(option.direction)
    setPage(1)
  }, [])

  const filteredCustomers = useMemo(() => {
    let data = customers
    if (search) {
      const lower = search.toLowerCase()
      data = data.filter((customer) => {
        const target = `${customer.customerName} ${customer.code ?? ''} ${customer.representativeName ?? ''} ${customer.productUsed ?? ''}`.toLowerCase()
        return target.includes(lower)
      })
    }
    if (monthFilter) {
      data = data.filter((customer) => (customer.createdAt ?? '').slice(0, 7) === monthFilter)
    }
    if (statusFilter) {
      data = data.filter((customer) => (customer.status ?? '').toUpperCase() === statusFilter)
    }
    const sorted = [...data].sort((a, b) => {
      const av = (a[sortKey] ?? '').toString().toLowerCase()
      const bv = (b[sortKey] ?? '').toString().toLowerCase()
      if (av === bv) return 0
      if (direction === 'asc') return av > bv ? 1 : -1
      return av < bv ? 1 : -1
    })
    return sorted
  }, [customers, search, statusFilter, sortKey, direction])

  const total = filteredCustomers.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const toggleSelect = (customerId: string) => {
    setSelected((prev) => (prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]))
  }

  const toggleSelectAll = () => {
    if (selected.length === pagedCustomers.length) {
      setSelected([])
    } else {
      setSelected(pagedCustomers.map((customer) => customer.customerId))
    }
  }

  const handleRowClick = useCallback(
    (customer: Customer) => {
      const targetRoasteryId = customer.roasteryId || roasteryId || ''
      const query = targetRoasteryId ? `?roasteryId=${encodeURIComponent(targetRoasteryId)}` : ''
      router.push(`${base}/user/customers/${customer.customerId}${query}`)
    },
    [base, roasteryId, router]
  )

  const resetDrawerForm = useCallback(() => {
    setDrawerValues(initialDrawerValues)
    setDrawerError(null)
  }, [])

  const closeDrawer = useCallback(() => {
    if (drawerSaving) return
    setDrawerOpen(false)
    resetDrawerForm()
  }, [drawerSaving, resetDrawerForm])

  const handleDrawerChange =
    (field: keyof typeof initialDrawerValues) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      setDrawerValues((prev) => ({ ...prev, [field]: value }))
    }

  const handleCreateCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDrawerError(null)
    if (!roasteryId) {
      setDrawerError('연결된 로스터리 정보를 찾을 수 없습니다.')
      return
    }
    if (!drawerValues.customerName.trim()) {
      setDrawerError('고객사명을 입력해주세요.')
      return
    }
    if (!drawerValues.businessRegNo.trim() || !bizNoRegex.test(drawerValues.businessRegNo.trim())) {
      setDrawerError('유효한 사업자번호(000-00-00000)를 입력해주세요.')
      return
    }
    if (!drawerValues.representativeName.trim()) {
      setDrawerError('대표자명을 입력해주세요.')
      return
    }
    if (!drawerValues.productUsed.trim()) {
      setDrawerError('사용 제품을 입력해주세요.')
      return
    }
    const normalizedBizNo = drawerValues.businessRegNo.replace(/\D+/g, '')
    const payload = {
      customerName: drawerValues.customerName.trim(),
      code: normalizedBizNo,
      status: drawerValues.status || 'ACTIVE',
      representativeName: drawerValues.representativeName.trim(),
      productUsed: drawerValues.productUsed.trim(),
      roasteryId,
    }
    setDrawerSaving(true)
    try {
      const res = await fetch('/api/user/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setDrawerError(data?.message || '고객사 등록에 실패했습니다.')
        return
      }
      const meta = readCustomerMeta()
      const created = data?.customer ?? data
      const customerId = created?.customerId ?? created?.customer_id
      if (customerId) {
        meta[String(customerId)] = {
          representativeName: drawerValues.representativeName.trim(),
          productUsed: drawerValues.productUsed.trim(),
        }
        saveCustomerMeta(meta)
      }
      setDrawerOpen(false)
      resetDrawerForm()
      setRefreshToken((token) => token + 1)
    } catch (err: any) {
      setDrawerError(err?.message || '고객사 등록 중 오류가 발생했습니다.')
    } finally {
      setDrawerSaving(false)
    }
  }

  const applyBulkStatus = async () => {
    if (!selected.length) return
    setBulkLoading(true)
    try {
      const payload = {
        customerIds: selected,
        status: bulkStatus,
        customers: customers.filter((customer) => selected.includes(customer.customerId)),
      }
      const res = await fetch('/api/user/customers/bulk-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || '상태 변경에 실패했습니다.')
      }
      setSelected([])
      setRefreshToken((token) => token + 1)
    } catch (err: any) {
      setError(err?.message || '상태 변경에 실패했습니다.')
    } finally {
      setBulkLoading(false)
    }
  }

  const emptyState = !loading && total === 0

  return (
    <>
      <PageHeading
        title="고객사 목록"
        description="고객사 정보를 등록하고 관리하세요."
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '사용자 관리' },
          { name: '고객사 목록' },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 dark:border-white/5">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              선택된 고객사 <span className="font-semibold text-gray-900 dark:text-white">{selected.length}</span>건
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as StatusValue)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyBulkStatus}
                disabled={!selected.length || bulkLoading}
                className="btn-execute disabled:cursor-not-allowed"
              >
                일괄 상태변경
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDrawerForm()
                  setDrawerOpen(true)
                }}
                className="btn-register"
              >
                <PlusIcon className="size-4" aria-hidden="true" />
                고객사 등록
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="고객사명, 사업자번호 검색"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-64 rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="">전체 상태</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={sortOption}
                onChange={(e) => handleSortOptionChange(e.target.value as CustomerSortValue)}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                aria-label="정렬 기준"
              >
                {CUSTOMER_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              페이지당
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

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-white/10">
            <div className="max-h-[540px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-4 py-3 sm:px-6">
                    <input
                      type="checkbox"
                      checked={pagedCustomers.length > 0 && selected.length === pagedCustomers.length}
                      onChange={toggleSelectAll}
                      onClick={(event) => event.stopPropagation()}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">사업자번호</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">회사명</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">대표자명</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">사용 제품</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">상태</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">등록일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {pagedCustomers.map((customer) => (
                  <tr
                    key={customer.customerId}
                    className="bg-white transition hover:bg-gray-50 dark:bg-gray-900/40 dark:hover:bg-gray-900/70 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    onClick={() => handleRowClick(customer)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.target instanceof HTMLInputElement) return
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleRowClick(customer)
                      }
                    }}
                    title="고객사 상세 보기"
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <input
                        type="checkbox"
                        checked={selected.includes(customer.customerId)}
                        onChange={() => toggleSelect(customer.customerId)}
                        onClick={(event) => event.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-4 font-semibold sm:px-6">{customer.code ? formatBizNumber(customer.code) : '-'}</td>
                    <td className="px-4 py-4 sm:px-6">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{customer.customerName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      {customer.representativeName || '-'}
                    </td>
                    <td className="px-4 py-4 sm:px-6 text-sm text-gray-500 dark:text-gray-300">{customer.productUsed || '-'}</td>
                    <td className="px-4 py-4 sm:px-6">
                      <span
                        className={classNames(
                          'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                          STATUS_TONES[customer.status?.toUpperCase?.() ?? 'ACTIVE'] ?? STATUS_TONES.ACTIVE
                        )}
                      >
                        {STATUS_OPTIONS.find((opt) => opt.value === customer.status)?.label ?? customer.status ?? 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 sm:px-6">
                      {formatDate(customer.createdAt, locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            {loading && (
              <div className="border-t border-gray-100 px-6 py-6 text-center text-sm text-gray-500 dark:border-white/5 dark:text-gray-300">
                고객사 데이터를 불러오는 중입니다...
              </div>
            )}

            {emptyState && (
              <div className="border-t border-gray-100 px-6 py-10 text-center text-sm text-gray-500 dark:border-white/5 dark:text-gray-300">
                조회된 고객사 데이터가 없습니다.
              </div>
            )}
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
                className="border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed.disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
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
                className="border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition.hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
              >
                다음
              </button>
            </div>
          </div>
        </section>
      </div>

      <Transition show={drawerOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeDrawer}>
          <TransitionChild
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogBackdrop className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <TransitionChild
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-md">
                    <form onSubmit={handleCreateCustomer} className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-900">
                      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                        <div className="flex items-start justify-between">
                          <div>
                            <DialogTitle className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                              고객사 등록
                            </DialogTitle>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">신규 고객사 정보를 등록하세요.</p>
                          </div>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              onClick={closeDrawer}
                              className="rounded-full p-1 text-gray-400 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-gray-500 dark:hover:text-gray-300"
                            >
                              <span className="sr-only">고객사 등록 닫기</span>
                              <XMarkIcon className="size-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        {drawerError ? (
                          <p role="alert" className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                            {drawerError}
                          </p>
                        ) : null}

                        <div className="mt-6 space-y-6">
                          <div>
                            <label htmlFor="business-reg-no" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                              사업자번호
                            </label>
                            <input
                              id="business-reg-no"
                              name="business-reg-no"
                              value={drawerValues.businessRegNo}
                              onChange={handleDrawerChange('businessRegNo')}
                              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              placeholder="000-00-00000"
                              inputMode="numeric"
                              maxLength={12}
                            />
                          </div>
                          <div>
                            <label htmlFor="customer-name" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                              회사명
                            </label>
                            <input
                              id="customer-name"
                              name="customer-name"
                              value={drawerValues.customerName}
                              onChange={handleDrawerChange('customerName')}
                              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              placeholder="예: 로스티브 커피"
                            />
                          </div>
                          <div>
                            <label htmlFor="representative-name" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                              대표자명
                            </label>
                            <input
                              id="representative-name"
                              name="representative-name"
                              value={drawerValues.representativeName}
                              onChange={handleDrawerChange('representativeName')}
                              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              placeholder="대표자명을 입력하세요"
                            />
                          </div>
                          <div>
                            <label htmlFor="product-used" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                              사용 제품
                            </label>
                            <textarea
                              id="product-used"
                              name="product-used"
                              value={drawerValues.productUsed}
                              onChange={handleDrawerChange('productUsed')}
                              rows={3}
                              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              placeholder="예: 원두 A, RTD B"
                            />
                          </div>
                          <div>
                            <label htmlFor="customer-status" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                              상태
                            </label>
                            <select
                              id="customer-status"
                              name="customer-status"
                              value={drawerValues.status}
                              onChange={handleDrawerChange('status')}
                              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 justify-end gap-3 px-6 py-4 sm:px-8">
                        <button
                          type="button"
                          onClick={closeDrawer}
                          className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:text-gray-300 dark:hover:text-white"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          disabled={drawerSaving}
                          className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-60"
                        >
                          {drawerSaving ? '등록 중...' : '등록'}
                        </button>
                      </div>
                    </form>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}



