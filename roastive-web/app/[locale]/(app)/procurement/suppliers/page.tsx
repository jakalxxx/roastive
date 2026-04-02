'use client'

import { Fragment, useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PageHeading } from '@/components/PageHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'
import { useAuth } from '@/components/auth/AuthProvider'

type Supplier = {
  supplierId: string
  supplierName: string
  contactName?: string
  phone?: string
  email?: string
  businessRegNo?: string
  address?: string
  status?: string
  roasteryId?: number
  createdAt?: string | null
  updatedAt?: string | null
}

type SupplierSortValue = (typeof SUPPLIER_SORT_OPTIONS)[number]['value']

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '거래중' },
  { value: 'PAUSED', label: '일시중지' },
  { value: 'INACTIVE', label: '중단' },
] as const

const STATUS_TONES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/40',
  PAUSED: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/40',
  INACTIVE: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/30',
}

const SUPPLIER_SORT_OPTIONS = [
  { value: 'created_desc', label: '등록일 최신순', sort: 'createdAt', direction: 'desc' as const },
  { value: 'created_asc', label: '등록일 오래된순', sort: 'createdAt', direction: 'asc' as const },
  { value: 'name_asc', label: '업체명 가나다순', sort: 'supplierName', direction: 'asc' as const },
  { value: 'name_desc', label: '업체명 역순', sort: 'supplierName', direction: 'desc' as const },
  { value: 'biz_asc', label: '사업자번호 오름차순', sort: 'businessRegNo', direction: 'asc' as const },
  { value: 'biz_desc', label: '사업자번호 내림차순', sort: 'businessRegNo', direction: 'desc' as const },
] as const

const PAGE_SIZES = [10, 20, 30] as const
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0]

const initialDrawerValues = {
  supplierName: '',
  contactName: '',
  phone: '',
  email: '',
  businessRegNo: '',
  address: '',
  status: STATUS_OPTIONS[0].value,
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function formatBizNo(value?: string | null) {
  if (!value) return '-'
  const digits = value.replace(/\D+/g, '').slice(0, 10)
  if (digits.length < 10) return value
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

function formatDate(value?: string | null, locale: string = 'ko-KR') {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function formatPhone(value?: string | null) {
  if (!value) return '-'
  const digits = value.replace(/\D+/g, '')
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return value
}

export default function ProcurementSuppliersPage() {
  useSessionGuard(1000 * 60 * 5)
  const { user } = useAuth()
  const pathname = usePathname() || '/ko'
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] === 'en' || segments[0] === 'ja' || segments[0] === 'ko' ? segments[0] : 'ko'
  const base = `/${locale}`
  const dateLocale = locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR'
  const router = useRouter()
  const roasteryId = (user?.roasteries?.[0]?.roastery_id ?? user?.roasteries?.[0]?.id ?? '') as string
  const roasteryNumeric = roasteryId ? Number(roasteryId) : null

  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'createdAt' | 'supplierName' | 'businessRegNo'>('createdAt')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
  const [sortOption, setSortOption] = useState<SupplierSortValue>(SUPPLIER_SORT_OPTIONS[0].value)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerValues, setDrawerValues] = useState(initialDrawerValues)
  const [drawerSaving, setDrawerSaving] = useState(false)
  const [drawerError, setDrawerError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetch('/api/procurement/suppliers', { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || '구매처 목록을 불러오지 못했습니다.')
        const itemsRaw = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
        const mapped = (itemsRaw as any[]).map((item) => ({
          supplierId: String(item.supplierId ?? item.supplier_id ?? ''),
          supplierName: String(item.supplierName ?? item.supplier_name ?? ''),
          contactName: item.contactName ?? item.contact_name ?? '',
          phone: item.phone ?? '',
          email: item.email ?? '',
          businessRegNo: item.businessRegNo ?? item.business_reg_no ?? '',
          address: item.address ?? '',
          status: (item.status ?? 'ACTIVE') as string,
          roasteryId: Number(item.roasteryId ?? item.roastery_id ?? 0),
          createdAt: item.createdAt ?? item.created_at ?? null,
        })) as Supplier[]
        const filtered = roasteryNumeric ? mapped.filter((item) => item.roasteryId === roasteryNumeric) : mapped
        setSuppliers(filtered)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setError(err?.message || '구매처 목록을 불러오지 못했습니다.')
        setSuppliers([])
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [refreshKey, roasteryNumeric])

  useEffect(() => {
    setPage(1)
  }, [pageSize])


  const handleSortOptionChange = useCallback((value: SupplierSortValue) => {
    const option = SUPPLIER_SORT_OPTIONS.find((opt) => opt.value === value) ?? SUPPLIER_SORT_OPTIONS[0]
    setSortOption(option.value)
    setSortKey(option.sort === 'businessRegNo' ? 'businessRegNo' : (option.sort as typeof sortKey))
    setDirection(option.direction)
    setPage(1)
  }, [])

  const filteredSuppliers = useMemo(() => {
    let list = suppliers
    if (search) {
      const lower = search.toLowerCase()
      list = list.filter((supplier) => {
        const target = `${supplier.supplierName} ${supplier.contactName ?? ''} ${supplier.phone ?? ''} ${supplier.email ?? ''} ${supplier.businessRegNo ?? ''} ${supplier.address ?? ''}`.toLowerCase()
        return target.includes(lower)
      })
    }
    const sorted = [...list].sort((a, b) => {
      const av = (a[sortKey] ?? '').toString().toLowerCase()
      const bv = (b[sortKey] ?? '').toString().toLowerCase()
      if (av === bv) return 0
      if (direction === 'asc') return av > bv ? 1 : -1
      return av < bv ? 1 : -1
    })
    return sorted
  }, [suppliers, search, sortKey, direction])

  const totalCount = filteredSuppliers.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const pagedSuppliers = filteredSuppliers.slice((page - 1) * pageSize, page * pageSize)

  const handleDrawerChange = (field: keyof typeof drawerValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDrawerValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const resetDrawer = () => {
    setDrawerValues(initialDrawerValues)
    setDrawerError(null)
  }

  const handleDrawerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!drawerValues.supplierName.trim()) {
      setDrawerError('업체명을 입력해주세요.')
      return
    }
    setDrawerSaving(true)
    setDrawerError(null)
    try {
      const payload = {
        supplierName: drawerValues.supplierName.trim(),
        contactName: drawerValues.contactName.trim() || undefined,
        phone: drawerValues.phone.replace(/\s+/g, ''),
        email: drawerValues.email.trim() || undefined,
        businessRegNo: drawerValues.businessRegNo.replace(/\D+/g, ''),
        address: drawerValues.address.trim() || undefined,
        status: drawerValues.status,
        roasteryId: roasteryNumeric ?? undefined,
      }
      const res = await fetch('/api/procurement/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || '구매처 등록에 실패했습니다.')
      setDrawerOpen(false)
      resetDrawer()
      setRefreshKey((prev) => prev + 1)
    } catch (err: any) {
      setDrawerError(err?.message || '구매처 등록에 실패했습니다.')
    } finally {
      setDrawerSaving(false)
    }
  }

  return (
    <>
      <PageHeading
        title="구매처 목록"
        description="구매처 정보를 등록하고 관리하세요."
        breadcrumbs={[
          { name: '구매 관리', href: `${base}/procurement/suppliers` },
          { name: '구매처 목록' },
        ]}
        meta={
          error ? (
            <div className="mt-3 border border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : null
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 dark:border-white/5">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              총 <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span>건
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetDrawer()
                  setDrawerOpen(true)
                }}
                className="btn-register"
              >
                <PlusIcon className="size-4" aria-hidden="true" />
                구매처 등록
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="업체명, 담당자, 사업자번호 검색"
                  className="w-72 rounded-full border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <select
                value={sortOption}
                onChange={(event) => handleSortOptionChange(event.target.value as SupplierSortValue)}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {SUPPLIER_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              페이지당
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
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

          <div className="mt-6 overflow-hidden border border-gray-100 shadow-sm dark:border-white/10">
            <div className="max-h-[540px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      사업자번호
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      업체명
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      담당자 / 연락처
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      이메일
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      상태
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6">
                      등록일
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
                        구매처 정보를 불러오는 중입니다...
                      </td>
                    </tr>
                  ) : pagedSuppliers.length ? (
                    pagedSuppliers.map((supplier) => (
                      <tr
                        key={supplier.supplierId}
                        className="cursor-pointer bg-white transition hover:bg-gray-50 dark:bg-gray-900/40 dark:hover:bg-gray-900/60"
                        onClick={() => supplier.supplierId && router.push(`${base}/procurement/suppliers/${supplier.supplierId}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if ((event.key === 'Enter' || event.key === ' ') && supplier.supplierId) {
                            event.preventDefault()
                            router.push(`${base}/procurement/suppliers/${supplier.supplierId}`)
                          }
                        }}
                        aria-label={`${supplier.supplierName} 상세 보기`}
                      >
                        <td className="px-4 py-4 font-semibold sm:px-6">{formatBizNo(supplier.businessRegNo)}</td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900 dark:text-white">{supplier.supplierName}</p>
                            {supplier.address ? <p className="text-xs text-gray-500 dark:text-gray-400">{supplier.address}</p> : null}
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">{supplier.contactName || '-'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-300">{formatPhone(supplier.phone)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 sm:px-6">{supplier.email || '-'}</td>
                        <td className="px-4 py-4 sm:px-6">
                          <span
                            className={classNames(
                              'inline-flex items-center px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                              STATUS_TONES[supplier.status?.toUpperCase?.() ?? 'ACTIVE'] ?? STATUS_TONES.ACTIVE
                            )}
                          >
                            {STATUS_OPTIONS.find((opt) => opt.value === supplier.status)?.label ?? supplier.status ?? '거래중'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 sm:px-6">{formatDate(supplier.createdAt, dateLocale)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
                        등록된 구매처 정보가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!loading ? (
            <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <div>
                총 <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span>건
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300.dark:hover:border-white/20 dark:hover:text-white"
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
                  className="border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900.disabled:cursor-not-allowed disabled:opacity-50 dark.border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
                >
                  다음
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <Transition show={drawerOpen}>
        <Dialog className="relative z-50" onClose={() => (drawerSaving ? null : setDrawerOpen(false))}>
          <TransitionChild
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogBackdrop className="fixed inset-0 bg-black/30" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <TransitionChild
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-md">
                    <form onSubmit={handleDrawerSubmit} className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-900">
                      <div className="flex items-center justify-between px-6 py-4 sm:px-8">
                        <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">구매처 등록</DialogTitle>
                        <button
                          type="button"
                          onClick={() => (drawerSaving ? null : setDrawerOpen(false))}
                          className="rounded p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <span className="sr-only">닫기</span>
                          <XMarkIcon className="size-5" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                        <div className="space-y-5">
                          <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">업체명</label>
                            <input
                              required
                              value={drawerValues.supplierName}
                              onChange={handleDrawerChange('supplierName')}
                              className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                              placeholder="예: 원두상사"
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">담당자명</label>
                              <input
                                value={drawerValues.contactName}
                                onChange={handleDrawerChange('contactName')}
                                className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                                placeholder="예: 홍길동"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">연락처</label>
                              <input
                                value={drawerValues.phone}
                                onChange={handleDrawerChange('phone')}
                                inputMode="tel"
                                className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                                placeholder="010-0000-0000"
                              />
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">이메일</label>
                              <input
                                type="email"
                                value={drawerValues.email}
                                onChange={handleDrawerChange('email')}
                                className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm dark:border-white/10.dark:bg-white/5 dark:text-white"
                                placeholder="supplier@example.com"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">사업자번호</label>
                              <input
                                value={drawerValues.businessRegNo}
                                onChange={handleDrawerChange('businessRegNo')}
                                inputMode="numeric"
                                placeholder="000-00-00000"
                                className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5.dark:text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-900 dark:text.gray-100">주소</label>
                            <textarea
                              rows={2}
                              value={drawerValues.address}
                              onChange={handleDrawerChange('address')}
                              className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5.dark:text-white"
                              placeholder="도로명 주소"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">상태</label>
                            <select
                              value={drawerValues.status}
                              onChange={handleDrawerChange('status')}
                              className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          {drawerError ? <p className="text-sm text-rose-500">{drawerError}</p> : null}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 px-6 py-4 sm:px-8">
                        <button
                          type="button"
                          onClick={() => (drawerSaving ? null : setDrawerOpen(false))}
                          className="border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover.bg-white/5"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          disabled={drawerSaving}
                          className="bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-60 dark:bg-white/10.dark:text-white dark:hover:bg-white/20"
                        >
                          {drawerSaving ? '등록 중...' : '저장'}
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


