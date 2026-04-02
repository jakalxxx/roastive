'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { PageHeading } from '@/components/PageHeading'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useSessionGuard } from '@/lib/useSessionGuard'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'

type ProductVariant = {
  variantId: string
  productId: string
  unitSize: number
  unit: string
  sku?: string
  status: string
}

type ProductBasePrice = {
  priceId: string
  productId: string
  currency: string
  amount: number
  priceLabel?: string
  effectiveFrom?: string | null
  effectiveTo?: string | null
}

type ProductRecipeSet = {
  setId: string
  productId: string
  setName: string
  description?: string
  status: string
  ingredients?: any
}

type ProductMaster = {
  productId: string
  productName: string
  productType: string
  unit: string
  avgLossRate?: number | null
  description?: string
  status: string
  basePrice?: number | null
  createdAt?: string | null
  variants: ProductVariant[]
  basePrices: ProductBasePrice[]
  recipeSets: ProductRecipeSet[]
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '판매중' },
  { value: 'PAUSED', label: '일시중지' },
  { value: 'ARCHIVED', label: '단종' },
] as const

const PRODUCT_TYPE_OPTIONS = [
  { value: 'BLEND', label: '블렌드' },
  { value: 'SINGLE', label: '싱글 오리진' },
  { value: 'DECAF', label: '디카페인' },
  { value: 'READY_TO_DRINK', label: 'RTD' },
] as const

const UNIT_OPTIONS = ['KG', 'G', 'L', 'ML', 'EA'] as const

const PRODUCT_SORT_OPTIONS = [
  { value: 'created_desc', label: '등록일 최신순' },
  { value: 'created_asc', label: '등록일 오래된순' },
  { value: 'name_asc', label: '제품명 오름차순' },
  { value: 'name_desc', label: '제품명 내림차순' },
] as const

const PAGE_SIZES = [10, 20, 50] as const
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0]

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}

function formatCurrency(amount?: number | null, currency: string = 'KRW') {
  if (!amount || Number.isNaN(amount)) return '-'
  try {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString()} ${currency}`
  }
}

export default function ProductListPage({ params }: { params: { locale: string } }) {
  useSessionGuard(1000 * 60 * 5)
  const { user } = useAuth()
  const router = useRouter()
  const [cookieRoasteryId, setCookieRoasteryId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const match = document.cookie.match(/(?:^|;\s*)roastery_id=([^;]+)/)
    setCookieRoasteryId(match ? decodeURIComponent(match[1]) : null)
  }, [user])
  const activeRoasteryId = useMemo(() => {
    const roasteries = Array.isArray(user?.roasteries) ? (user?.roasteries as Array<any>) : []
    if (!roasteries.length) return null
    const primary = roasteries[0] as any
    const candidates = [
      primary?.roastery_id,
      primary?.roasteryId,
      primary?.id,
      primary?.legacy_roastery_id,
      primary?.legacyRoasteryId,
      primary?.roastery_numeric_id,
      primary?.roasteryNumericId,
    ]
    const first = candidates.find((value) => typeof value === 'string' ? value.trim().length > 0 : typeof value === 'number')
    return first ? String(first).trim() : null
  }, [user])

  const resolvedRoasteryId = useMemo(() => {
    const candidates = [activeRoasteryId, cookieRoasteryId]
    for (const candidate of candidates) {
      if (!candidate) continue
      const trimmed = String(candidate).trim()
      if (trimmed.length > 0) return trimmed
    }
    return null
  }, [activeRoasteryId, cookieRoasteryId])
  const locale = params.locale ?? 'ko'
  const [products, setProducts] = useState<ProductMaster[]>([])
  const [search, setSearch] = useState('')
  const [sortOption, setSortOption] = useState<(typeof PRODUCT_SORT_OPTIONS)[number]['value']>(PRODUCT_SORT_OPTIONS[0].value)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [formValues, setFormValues] = useState({
    productName: '',
    productType: PRODUCT_TYPE_OPTIONS[0].value,
    unit: UNIT_OPTIONS[0],
    avgLossRate: '',
    basePrice: '',
    description: '',
    status: STATUS_OPTIONS[0].value,
  })

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fetch('/api/products', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || '제품 목록을 불러오지 못했습니다.')
        if (active) setProducts(Array.isArray(data?.items) ? (data.items as ProductMaster[]) : [])
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || '제품 목록을 불러오지 못했습니다.')
          setProducts([])
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [refreshKey])

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    let list = [...products]
    if (keyword) {
      list = list.filter(
        (item) =>
          item.productName.toLowerCase().includes(keyword) ||
          item.productType.toLowerCase().includes(keyword) ||
          (item.description ?? '').toLowerCase().includes(keyword)
      )
    }
    list.sort((a, b) => {
      switch (sortOption) {
        case 'created_asc':
          return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
        case 'name_asc':
          return a.productName.localeCompare(b.productName)
        case 'name_desc':
          return b.productName.localeCompare(a.productName)
        case 'created_desc':
        default:
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      }
    })
    return list
  }, [products, search, sortOption])

  useEffect(() => {
    setPage(1)
  }, [filteredProducts.length, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const pagedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize)

  const handleChange = (field: keyof typeof formValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const resetDrawer = () => {
    setFormValues({
      productName: '',
      productType: PRODUCT_TYPE_OPTIONS[0].value,
      unit: UNIT_OPTIONS[0],
      avgLossRate: '',
      basePrice: '',
      description: '',
      status: STATUS_OPTIONS[0].value,
    })
    setFormError(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      const trimmedName = formValues.productName.trim()
      if (!trimmedName) {
        setFormError('제품명을 입력해주세요.')
        return
      }
      if (resolvedRoasteryId === null) {
        setFormError('로스터리 정보를 확인할 수 없습니다. 관리자에게 문의하세요.')
        return
      }
      const payload = {
        productName: trimmedName,
        productType: formValues.productType,
        unit: formValues.unit,
        avgLossRate: formValues.avgLossRate ? Number(formValues.avgLossRate) : undefined,
        basePrice: formValues.basePrice ? Number(formValues.basePrice) : undefined,
        description: formValues.description.trim() || undefined,
        status: formValues.status,
      }
      Object.assign(payload, { roasteryId: resolvedRoasteryId })
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || '제품 등록에 실패했습니다.')
      }
      resetDrawer()
      setDrawerOpen(false)
      setRefreshKey((prev) => prev + 1)
    } catch (err: any) {
      setFormError(err?.message || '제품 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeading
        title="제품 목록"
        description="제품 기준 정보를 등록하고 관리하세요."
        breadcrumbs={[
          { name: '제품 관리', href: `/${locale}/products` },
          { name: '제품 목록' },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 dark:border-white/5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">제품 기준 정보</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                PRODUCT_MASTER 기준으로 Variant · Base Price · Recipe Set을 함께 관리합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetDrawer()
                setDrawerOpen(true)
              }}
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              <PlusIcon className="size-4" aria-hidden="true" />
              제품 등록
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 shadow-sm dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
            <p className="font-semibold">안내</p>
            <p className="mt-1">아래의 기능이 업데이트 될 예정입니다.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>제품별 레시피 관리</li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 size-4 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="제품명, 유형, 설명 검색"
                className="w-full rounded-full border border-gray-200 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as (typeof PRODUCT_SORT_OPTIONS)[number]['value'])}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {PRODUCT_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}개씩 보기
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-white/10">
            <div className="max-h-[540px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-4 py-3 sm:px-6">제품명</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">제품 구분</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">기본 단위</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">손실율</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">단가</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">등록일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
                        제품 정보를 불러오는 중입니다...
                      </td>
                    </tr>
                  ) : pagedProducts.length ? (
                    pagedProducts.map((product) => (
                      <tr
                        key={product.productId}
                        className="cursor-pointer bg-white transition hover:bg-gray-50 dark:bg-gray-900/40 dark:hover:bg-gray-800/60"
                        onClick={() => router.push(`/${locale}/products/${product.productId}`)}
                      >
                        <td className="px-4 py-4 sm:px-6">
                          <p className="text-base font-semibold text-gray-900 dark:text-white">{product.productName}</p>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          {PRODUCT_TYPE_OPTIONS.find((opt) => opt.value === product.productType)?.label ?? product.productType}
                        </td>
                        <td className="px-4 py-4 sm:px-6">{product.unit}</td>
                        <td className="px-4 py-4 sm:px-6">{product.avgLossRate ? `${product.avgLossRate.toFixed(2)}%` : '-'}</td>
                        <td className="px-4 py-4 sm:px-6">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(product.basePrice ?? product.basePrices?.[0]?.amount, product.basePrices?.[0]?.currency ?? 'KRW')}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 sm:px-6">{formatDate(product.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
                        등록된 제품 정보가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filteredProducts.length > pageSize ? (
            <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <div>
                총 <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span>건
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
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
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
                >
                  다음
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <Transition show={drawerOpen}>
        <Dialog className="relative z-50" onClose={() => (submitting ? null : setDrawerOpen(false))}>
          <TransitionChild
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
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
                  <DialogPanel className="pointer-events-auto w-screen max-w-xl">
                    <form onSubmit={handleSubmit} className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-900">
                      <div className="flex items-center justify-between px-6 py-4 sm:px-8">
                        <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">제품 등록</Dialog.Title>
                        <button
                          type="button"
                          onClick={() => (!submitting ? setDrawerOpen(false) : null)}
                          className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <span className="sr-only">닫기</span>
                          <XMarkIcon className="size-5" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                        <div className="space-y-6">
                          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">기본정보</p>
                              <p className="text-xs text-gray-500 dark:text-gray-300">product_master</p>
                            </div>
                            <div className="space-y-5">
                              <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">제품명</label>
                                <input
                                  required
                                  value={formValues.productName}
                                  onChange={handleChange('productName')}
                                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">제품 유형</label>
                                  <select
                                    value={formValues.productType}
                                    onChange={handleChange('productType')}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                  >
                                    {PRODUCT_TYPE_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">기본 단위</label>
                                  <select
                                    value={formValues.unit}
                                    onChange={handleChange('unit')}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                  >
                                    {UNIT_OPTIONS.map((unit) => (
                                      <option key={unit} value={unit}>
                                        {unit}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">기본가</label>
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    step="100"
                                    value={formValues.basePrice}
                                    onChange={handleChange('basePrice')}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="기준가 (선택)"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">평균 손실률 (%)</label>
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    step="0.01"
                                    value={formValues.avgLossRate}
                                    onChange={handleChange('avgLossRate')}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="예: 2.5"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">설명</label>
                                <textarea
                                  rows={3}
                                  value={formValues.description}
                                  onChange={handleChange('description')}
                                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                  placeholder="제품 특징 및 참고사항"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">상태</label>
                                <select
                                  value={formValues.status}
                                  onChange={handleChange('status')}
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
                          {formError ? <p className="text-sm text-rose-500">{formError}</p> : null}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 px-6 py-4 sm:px-8">
                        <button
                          type="button"
                          onClick={() => (!submitting ? setDrawerOpen(false) : null)}
                          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-60 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                        >
                          {submitting ? '등록 중...' : '제품 등록'}
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


