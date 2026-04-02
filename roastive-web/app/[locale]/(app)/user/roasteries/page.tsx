'use client'

import { Fragment, useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PageHeading } from '@/components/PageHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'

type Roastery = {
  roasteryId: string
  roasteryName: string
  code?: string | null
  status?: string | null
  legalName?: string | null
  brandName?: string | null
  businessRegNo?: string | null
  representativeName?: string | null
  address?: string | null
  createdAt?: string | null
}

const STATUS_TONES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/40',
  INACTIVE: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/30',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/40',
}

const PAGE_SIZES = [10, 20, 30]
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0] ?? 10
type RoasterySortValue = (typeof ROASTERY_SORT_OPTIONS)[number]['value']
const ROASTERY_SORT_OPTIONS = [
  { value: 'createdAt_desc', label: '등록일 최신순', sort: 'createdAt', direction: 'desc' as const },
  { value: 'createdAt_asc', label: '등록일 오래된순', sort: 'createdAt', direction: 'asc' as const },
  { value: 'businessRegNo_asc', label: '사업자번호 오름차순', sort: 'businessRegNo', direction: 'asc' as const },
  { value: 'businessRegNo_desc', label: '사업자번호 내림차순', sort: 'businessRegNo', direction: 'desc' as const },
  { value: 'brandName_asc', label: '브랜드명 가나다순', sort: 'brandName', direction: 'asc' as const },
  { value: 'representativeName_asc', label: '대표자명 가나다순', sort: 'representativeName', direction: 'asc' as const },
] as const

const ROASTERY_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '활성' },
  { value: 'INACTIVE', label: '비활성' },
  { value: 'PENDING', label: '대기' },
] as const

const ROASTERY_FORM_DEFAULTS = {
  roasteryName: '',
  businessRegNo: '',
  legalName: '',
  brandName: '',
  representativeName: '',
  phone: '',
  email: '',
  address: '',
  status: 'ACTIVE',
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function formatDateTime(value?: string | null, locale: string = 'ko-KR') {
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

function getStatusTone(value?: string | null) {
  const key = typeof value === 'string' ? value.toUpperCase() : 'ACTIVE'
  return STATUS_TONES[key] ?? STATUS_TONES.ACTIVE
}

function resolveRoasteryErrorMessage(raw?: string | null) {
  const text = (raw ?? '').trim()
  const lower = text.toLowerCase()
  const includes = (target: string) => lower.includes(target)
  const includesKo = (target: string) => text.includes(target)

  if (text) {
    if (includes('email') || includesKo('이메일')) {
      return '이미 사용하고 있는 이메일입니다.'
    }
    const hasBizKeyword =
      includes('business') ||
      includes('biz') ||
      includes('regno') ||
      includesKo('사업자')

    if (hasBizKeyword) {
      const duplicateHint =
        includes('duplicate') ||
        includes('already') ||
        includesKo('중복') ||
        includesKo('이미')

      if (duplicateHint) {
        return '이미 등록된 있는 사업자번호 입니다.'
      }
      return '사업자번호를 확인해주세요.'
    }
  }

  return text || '로스터리를 등록하지 못했습니다.'
}

export default function UserRoasteriesPage() {
  useSessionGuard(1000 * 60 * 5)
  const pathname = usePathname() || '/ko'
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] === 'en' || segments[0] === 'ja' || segments[0] === 'ko' ? segments[0] : 'ko'
  const base = `/${locale}`
  const dateLocale = locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR'
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'businessRegNo' | 'brandName' | 'representativeName' | 'createdAt'>('createdAt')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
  const [sortOption, setSortOption] = useState<RoasterySortValue>(ROASTERY_SORT_OPTIONS[0].value)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [roasteries, setRoasteries] = useState<Roastery[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerValues, setDrawerValues] = useState(ROASTERY_FORM_DEFAULTS)
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
    const url = '/api/user/roasteries'
    console.log('[Roasteries] fetching list', {
      url,
      query,
      search,
      sortKey,
      direction,
      page,
      pageSize,
    })
    fetch(url, { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || '로스터리 목록을 불러오지 못했습니다.')
        const items = Array.isArray(data?.items)
          ? (data.items as any[]).map((item) => ({
              roasteryId: String(item.roasteryId ?? item.roastery_id ?? ''),
              roasteryName: String(item.roasteryName ?? item.roastery_name ?? ''),
              code: item.code ?? '',
              status: (item.status ?? 'ACTIVE').toString().toUpperCase(),
              legalName: item.legalName ?? item.legal_name ?? '',
              brandName: item.brandName ?? item.brand_name ?? '',
              businessRegNo: item.businessRegNo ?? item.business_reg_no ?? '',
              representativeName: item.representativeName ?? item.representative_name ?? '',
              address: item.address ?? item.address_line1 ?? '',
              createdAt: item.createdAt ?? item.created_at ?? null,
            }))
          : []
        setRoasteries(items)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setRoasteries([])
        setError(err?.message || '로스터리 목록을 불러오지 못했습니다.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [refreshKey])

  const filteredRoasteries = useMemo(() => {
    let data = roasteries
    if (search) {
      const lower = search.toLowerCase()
      data = data.filter((roastery) => {
        const target = `${roastery.businessRegNo ?? ''} ${roastery.legalName ?? ''} ${roastery.roasteryName ?? ''} ${roastery.brandName ?? ''} ${roastery.representativeName ?? ''} ${roastery.address ?? ''}`.toLowerCase()
        return target.includes(lower)
      })
    }
    const sorted = [...data].sort((a, b) => {
      const av = (a[sortKey] ?? '').toString().toLowerCase()
      const bv = (b[sortKey] ?? '').toString().toLowerCase()
      if (av === bv) return 0
      if (direction === 'asc') return av > bv ? 1 : -1
      return av < bv ? 1 : -1
    })
    return sorted
  }, [roasteries, search, sortKey, direction])

  const total = filteredRoasteries.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagedRoasteries = filteredRoasteries.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handleSortOptionChange = useCallback((value: RoasterySortValue) => {
    const option = ROASTERY_SORT_OPTIONS.find((opt) => opt.value === value) ?? ROASTERY_SORT_OPTIONS[0]
    setSortOption(option.value)
    setSortKey(option.sort)
    setDirection(option.direction)
    setPage(1)
  }, [])

  const emptyState = !loading && total === 0

  const resetDrawerForm = useCallback(() => {
    setDrawerValues(ROASTERY_FORM_DEFAULTS)
    setDrawerError(null)
  }, [])

  const handleRowActivate = useCallback(
    (roasteryId: string) => {
      if (!roasteryId) return
      router.push(`${base}/user/roasteries/${roasteryId}`)
    },
    [router, base]
  )

  const handleDrawerChange =
    (field: keyof typeof ROASTERY_FORM_DEFAULTS) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value
      setDrawerValues((prev) => ({ ...prev, [field]: value }))
    }

  const closeDrawer = useCallback(() => {
    if (drawerSaving) return
    setDrawerOpen(false)
    resetDrawerForm()
  }, [drawerSaving, resetDrawerForm])

  const handleCreateRoastery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDrawerError(null)
    if (!drawerValues.roasteryName.trim()) {
      setDrawerError('로스터리명을 입력해주세요.')
      return
    }
    const bizDigits = drawerValues.businessRegNo.replace(/\D+/g, '')
    if (bizDigits.length !== 10) {
      setDrawerError('사업자번호 10자리를 입력해주세요. (예: 000-00-00000)')
      return
    }
    setDrawerSaving(true)
    try {
      const payload = {
        roasteryName: drawerValues.roasteryName.trim(),
        businessRegNo: bizDigits,
        legalName: drawerValues.legalName.trim() || undefined,
        brandName: drawerValues.brandName.trim() || undefined,
        representativeName: drawerValues.representativeName.trim() || undefined,
        phone: drawerValues.phone.trim() || undefined,
        email: drawerValues.email.trim() || undefined,
        address: drawerValues.address.trim() || undefined,
        status: drawerValues.status || 'ACTIVE',
      }
      const res = await fetch('/api/user/roasteries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const serverMessage = data?.message || data?.error?.message
        setDrawerError(resolveRoasteryErrorMessage(serverMessage))
        return
      }
      setDrawerOpen(false)
      resetDrawerForm()
      setRefreshKey((key) => key + 1)
    } catch (err: any) {
      setDrawerError(resolveRoasteryErrorMessage(err?.message))
    } finally {
      setDrawerSaving(false)
    }
  }

  const openDrawer = () => {
    resetDrawerForm()
    setDrawerOpen(true)
  }

  return (
    <>
      <PageHeading
        title="로스터리 목록"
        description="로스터리 정보를 등록하고 관리하세요"
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '사용자 관리' },
          { name: '로스터리 목록' },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 dark:border-white/5">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              총 <span className="font-semibold text-gray-900 dark:text-white">{total}</span>건
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={openDrawer} className="btn-register">
                <PlusIcon className="size-4" aria-hidden="true" />
                로스터리 등록
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="사업자번호, 사업자명 또는 대표자명 검색"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-72 rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <select
                value={sortOption}
                onChange={(e) => handleSortOptionChange(e.target.value as RoasterySortValue)}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                aria-label="정렬 기준"
              >
                {ROASTERY_SORT_OPTIONS.map((option) => (
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
                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">사업자명</th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">사업자번호</th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">대표자명</th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">주소</th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">상태</th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:px-6">등록일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {pagedRoasteries.map((roastery) => (
                    <tr
                      key={roastery.roasteryId}
                      role="button"
                      tabIndex={0}
                      aria-label={`${roastery.roasteryName || roastery.legalName || '로스터리'} 상세보기`}
                      onClick={() => handleRowActivate(roastery.roasteryId)}
                      onKeyDown={(event: KeyboardEvent<HTMLTableRowElement>) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleRowActivate(roastery.roasteryId)
                        }
                      }}
                      className="bg-white transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:bg-gray-900/40 dark:hover:bg-gray-900/60"
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{roastery.legalName || roastery.roasteryName || '-'}</p>
                          {roastery.brandName ? <p className="text-xs text-gray-500 dark:text-gray-300">{roastery.brandName}</p> : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold sm:px-6">{roastery.businessRegNo || '-'}</td>
                      <td className="px-4 py-4 sm:px-6">{roastery.representativeName || '-'}</td>
                      <td className="px-4 py-4 sm:px-6">
                        <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{roastery.address || '-'}</p>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span
                          className={classNames(
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1',
                            getStatusTone(roastery.status)
                          )}
                        >
                          {roastery.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 sm:px-6">
                        {formatDateTime(roastery.createdAt, locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>

            {loading && (
              <div className="border-t border-gray-100 px-6 py-6 text-center text-sm text-gray-500 dark:border-white/5 dark:text-gray-300">
                로스터리 데이터를 불러오는 중입니다...
              </div>
            )}

            {emptyState && (
              <div className="border-t border-gray-100 px-6 py-10 text-center text-sm text-gray-500 dark:border-white/5 dark:text-gray-300">
                조회된 로스터리 데이터가 없습니다.
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

      <Transition show={drawerOpen} as={Fragment}>
        <Dialog className="relative z-50" onClose={() => (drawerSaving ? null : closeDrawer())}>
          <TransitionChild as={Fragment} enter="ease-in-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
            <DialogBackdrop className="fixed inset-0 bg-black/30" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-8">
                <TransitionChild
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-xl">
                    <form onSubmit={handleCreateRoastery} className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-900">
                      <div className="flex items-center justify-between px-6 py-4 sm:px-8">
                        <div>
                          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">로스터리 등록</DialogTitle>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">로스터리 기본 정보를 입력하세요.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => (drawerSaving ? null : closeDrawer())}
                          className="rounded p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <span className="sr-only">닫기</span>
                          <XMarkIcon className="size-5" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                        <div className="space-y-6">
                          <div>
                            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">로스터리명 *</label>
                            <input
                              required
                              value={drawerValues.roasteryName}
                              onChange={handleDrawerChange('roasteryName')}
                              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              placeholder="예: 로스티브 커피"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">사업자번호 *</label>
                            <input
                              required
                              value={drawerValues.businessRegNo}
                              onChange={handleDrawerChange('businessRegNo')}
                              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              placeholder="000-00-00000"
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">법인명</label>
                              <input
                                value={drawerValues.legalName}
                                onChange={handleDrawerChange('legalName')}
                                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                placeholder="예: 로스티브 주식회사"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">브랜드명</label>
                              <input
                                value={drawerValues.brandName}
                                onChange={handleDrawerChange('brandName')}
                                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                placeholder="예: Roastive"
                              />
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">대표자명</label>
                              <input
                                value={drawerValues.representativeName}
                                onChange={handleDrawerChange('representativeName')}
                                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                placeholder="예: 김로스터"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">상태</label>
                              <select
                                value={drawerValues.status}
                                onChange={handleDrawerChange('status')}
                                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              >
                                {ROASTERY_STATUS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">전화번호</label>
                              <input
                                value={drawerValues.phone}
                                onChange={handleDrawerChange('phone')}
                                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                placeholder="예: 02-000-0000"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">이메일</label>
                              <input
                                type="email"
                                value={drawerValues.email}
                                onChange={handleDrawerChange('email')}
                                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                placeholder="contact@example.com"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">주소</label>
                            <textarea
                              rows={3}
                              value={drawerValues.address}
                              onChange={handleDrawerChange('address')}
                              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              placeholder="도로명 주소"
                            />
                          </div>
                          {drawerError ? <p className="text-sm text-rose-500">{drawerError}</p> : null}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 px-6 py-4 sm:px-8">
                        <button
                          type="button"
                          onClick={() => (drawerSaving ? null : closeDrawer())}
                          className="border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                          취소
                        </button>
                        <button type="submit" disabled={drawerSaving} className="btn-register disabled:cursor-not-allowed">
                          {drawerSaving ? '등록 중...' : '로스터리 등록'}
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


