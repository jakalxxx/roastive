'use client'

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeading } from '@/components/PageHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'
import { Dialog, DialogPanel, Transition, TransitionChild, Combobox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, PlusIcon } from '@heroicons/react/20/solid'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

type SalesOrder = {
  orderId: string
  orderNo?: string | null
  customerId: string
  customerName?: string | null
  productNames?: string | null
  orderDate?: string | null
  status?: string | null
}

type Customer = { customerId: string; customerName: string; status?: string | null }
type Product = { productId: string; productName: string; status?: string | null }

const STATUS_OPTIONS = [
  { value: 'NEW', label: '신규' },
  { value: 'CONFIRMED', label: '확정' },
  { value: 'CANCELLED', label: '취소' },
] as const

const PAGE_SIZES = [10, 20, 30]

const SORT_OPTIONS = [
  { value: 'orderDate_desc', label: '주문일 최신순', sort: 'orderDate', direction: 'desc' as const },
  { value: 'orderDate_asc', label: '주문일 오래된순', sort: 'orderDate', direction: 'asc' as const },
  { value: 'customer_asc', label: '고객사 가나다순', sort: 'customerName', direction: 'asc' as const },
  { value: 'customer_desc', label: '고객사 역순', sort: 'customerName', direction: 'desc' as const },
] as const

const classNames = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

export default function OrdersPage({ params }: { params: { locale: string } }) {
  useSessionGuard(1000 * 60 * 5)
  const locale = params.locale ?? 'ko'
  const router = useRouter()
  const searchParams = useSearchParams()

  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customerQuery, setCustomerQuery] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [unit, setUnit] = useState('EA')
  const [currency, setCurrency] = useState('KRW')
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value)
  const [remarks, setRemarks] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 검색/정렬/페이징/선택 상태
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState(() => searchParams.get('date') ?? '')
  const [sortValue, setSortValue] = useState<string>(SORT_OPTIONS[0]?.value ?? '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sales/orders', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      const items: SalesOrder[] = Array.isArray(data?.items) ? data.items : data?.items ?? []
      setOrders(items)
    } catch {
      setError('주문 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  // 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim().toLowerCase())
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const paramDate = searchParams.get('date') ?? ''
    setDateFilter(paramDate)
  }, [searchParams])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  useEffect(() => {
    fetch('/api/user/customers')
      .then((res) => res.json())
      .then((data) => {
        const items: Customer[] = Array.isArray(data?.items) ? data.items : []
        setCustomers(items.filter((c) => (c.status ?? 'ACTIVE') === 'ACTIVE'))
      })
      .catch(() => setCustomers([]))
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const items: Product[] = Array.isArray(data?.items) ? data.items : []
        setProducts(items.filter((p) => (p.status ?? 'ACTIVE') === 'ACTIVE'))
      })
      .catch(() => setProducts([]))
  }, [])

  const sortConfig = useMemo(
    () => SORT_OPTIONS.find((opt) => opt.value === sortValue),
    [sortValue],
  )

  const filteredOrders = useMemo(() => {
    let data = orders
    if (search) {
      data = data.filter((o) => {
        const value = `${o.orderNo ?? ''} ${o.customerName ?? ''} ${o.productNames ?? ''}`.toLowerCase()
        return value.includes(search)
      })
    }
    if (dateFilter) {
      data = data.filter((o) => (o.orderDate ?? '').slice(0, 10) === dateFilter)
    }
    if (sortConfig) {
      const { sort, direction } = sortConfig
      data = [...data].sort((a, b) => {
        if (sort === 'orderDate') {
          const ad = a.orderDate ? new Date(a.orderDate).getTime() : 0
          const bd = b.orderDate ? new Date(b.orderDate).getTime() : 0
          return direction === 'asc' ? ad - bd : bd - ad
        }
        const av = (a[sort as keyof SalesOrder] ?? '').toString().toLowerCase()
        const bv = (b[sort as keyof SalesOrder] ?? '').toString().toLowerCase()
        if (av === bv) return 0
        if (direction === 'asc') return av > bv ? 1 : -1
        return av < bv ? 1 : -1
      })
    }
    return data
  }, [orders, search, sortConfig])

  const total = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    setSelectedKeys((prev) => prev.filter((key) => orders.some((o) => o.orderId === key)))
  }, [orders])

  const pagedKeys = pagedOrders.map((o) => o.orderId)
  const allPagedSelected = pagedKeys.length > 0 && pagedKeys.every((key) => selectedKeys.includes(key))

  const clearSelection = () => setSelectedKeys([])
  const toggleSelectAll = () => {
    if (allPagedSelected) {
      setSelectedKeys((prev) => prev.filter((key) => !pagedKeys.includes(key)))
    } else {
      setSelectedKeys((prev) => Array.from(new Set([...prev, ...pagedKeys])))
    }
  }

  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]))
  }

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => c.customerName.toLowerCase().includes(q))
  }, [customerQuery, customers])

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.productName.toLowerCase().includes(q))
  }, [productQuery, products])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!selectedCustomer) return setFormError('고객사를 선택하세요.')
    if (!selectedProduct) return setFormError('제품을 선택하세요.')
    const qty = Number(quantity)
    const price = Number(unitPrice)
    if (!qty || qty <= 0) return setFormError('수량을 입력하세요.')
    if (!price || price <= 0) return setFormError('단가를 입력하세요.')

    setSubmitting(true)
    try {
      const res = await fetch('/api/sales/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.customerId,
          productId: selectedProduct.productId,
          quantity: qty,
          unitPrice: price,
          unit,
          currency,
          status,
          orderDate: new Date(orderDate).toISOString(),
          remarks: remarks.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || '주문 등록에 실패했습니다.')
      await loadOrders()
      setSelectedCustomer(null)
      setSelectedProduct(null)
      setQuantity('')
      setUnitPrice('')
      setUnit('EA')
      setCurrency('KRW')
      setStatus(STATUS_OPTIONS[0].value)
      setRemarks('')
      setOrderDate(new Date().toISOString().slice(0, 16))
      setDrawerOpen(false)
    } catch (err: any) {
      setFormError(err?.message || '주문 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeading
        title="주문 목록"
        description="SALES_ORDER 목록과 등록"
        breadcrumbs={[
          { name: '주문', href: `/${locale}/orders` },
          { name: '주문 목록' },
        ]}
      />

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 text-sm text-gray-600 dark:border-white/5 dark:text-gray-300">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            총 <span className="font-semibold text-gray-900 dark:text-white">{total}</span>건
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="btn-register"
            >
              <PlusIcon className="size-4" />
              주문 등록
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 text-sm text-gray-600 dark:border-white/5 dark:text-gray-300">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="주문번호, 고객사명 또는 제품명 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-64 rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            {SORT_OPTIONS.length ? (
              <select
                value={sortValue}
                onChange={(e) => {
                  setSortValue(e.target.value)
                  setPage(1)
                }}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {SORT_OPTIONS.map((option) => (
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
        </div>

        {/* 목록 테이블 */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border:white/10">
          <div className="max-h-[560px] overflow-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide:white/10 dark:text-gray-100">
              <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border:white/20"
                      checked={allPagedSelected}
                      onChange={toggleSelectAll}
                      aria-label="전체 선택"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">주문번호</th>
                  <th className="px-4 py-3 text-left">고객사</th>
                  <th className="px-4 py-3 text-left">제품정보</th>
                  <th className="px-4 py-3 text-left">상태</th>
                  <th className="px-4 py-3 text-left">주문일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide:white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-300">
                      불러오는 중입니다...
                    </td>
                  </tr>
                ) : pagedOrders.length ? (
                  pagedOrders.map((o) => {
                    const checked = selectedKeys.includes(o.orderId)
                    return (
                      <tr
                        key={o.orderId}
                        title={`주문번호: ${o.orderId}`}
                        className="cursor-pointer bg-white transition hover:bg-gray-50 dark:bg-gray-900/40 dark:hover:bg-gray-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        onClick={() => router.push(`/${locale}/orders/${o.orderId}`)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border:white/20"
                            checked={checked}
                            onChange={(e) => {
                              e.stopPropagation()
                              toggleSelect(o.orderId)
                            }}
                            aria-label="행 선택"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/${locale}/orders/${o.orderId}`}
                            className="text-indigo-600 hover:underline dark:text-indigo-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {o.orderNo || '-'}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{o.customerName || o.customerId || '-'}</td>
                        <td className="px-4 py-3">{o.productNames || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-400/40">
                            {o.status ?? '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                          {o.orderDate ? new Date(o.orderDate).toLocaleString() : '-'}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-300">
                      등록된 주문이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 하단 페이징 */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            총 <span className="font-semibold text-gray-900 dark:text-white">{total}</span>건
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border:white/10 dark:text-gray-300 dark:hover:border:white/20 dark:hover:text-white"
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
              className="border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border:white/10 dark:text-gray-300 dark:hover:border:white/20 dark:hover:text-white"
            >
              다음
            </button>
          </div>
        </div>
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
                    <form
                      onSubmit={handleSubmit}
                      className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between px-6 py-4 sm:px-8">
                        <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">주문 등록</Dialog.Title>
                        <button
                          type="button"
                          onClick={() => (!submitting ? setDrawerOpen(false) : null)}
                          className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <span className="sr-only">닫기</span>
                          <PlusIcon className="size-5 rotate-45" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                        {formError ? (
                          <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-100">
                            {formError}
                          </div>
                        ) : null}
                        <div className="space-y-5">
                          <Field label="고객사">
                            <SimpleCombobox
                              options={filteredCustomers}
                              displayValue={(item) => item?.customerName ?? ''}
                              onQueryChange={setCustomerQuery}
                              onChange={setSelectedCustomer}
                              selected={selectedCustomer}
                              placeholder="고객사 검색"
                            />
                          </Field>
                          <Field label="제품">
                            <SimpleCombobox
                              options={filteredProducts}
                              displayValue={(item) => item?.productName ?? ''}
                              onQueryChange={setProductQuery}
                              onChange={setSelectedProduct}
                              selected={selectedProduct}
                              placeholder="제품 검색"
                            />
                          </Field>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="주문일시">
                              <input
                                type="datetime-local"
                                value={orderDate}
                                onChange={(e) => setOrderDate(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </Field>
                            <Field label="통화">
                              <input
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </Field>
                            <Field label="수량">
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </Field>
                            <Field label="단가">
                              <input
                                type="number"
                                min={0}
                                step="1"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </Field>
                            <Field label="단위">
                              <input
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </Field>
                            <Field label="상태">
                              <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              >
                                {STATUS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </Field>
                          </div>
                          <Field label="비고">
                            <textarea
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              rows={3}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                          </Field>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 px-6 py-4 sm:px-8">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                        >
                          <PlusIcon className="size-4" />
                          주문 등록
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
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
      {children}
    </div>
  )
}

type SimpleComboboxProps<T> = {
  options: T[]
  selected: T | null
  onChange: (value: T | null) => void
  onQueryChange: (value: string) => void
  displayValue: (item: T | null) => string
  placeholder?: string
}

function SimpleCombobox<T extends { [key: string]: any }>({
  options,
  selected,
  onChange,
  onQueryChange,
  displayValue,
  placeholder,
}: SimpleComboboxProps<T>) {
  return (
    <Combobox value={selected} onChange={onChange} nullable>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-white/10 dark:bg-white/5">
          <Combobox.Input
            className="w-full border-none bg-transparent py-2 pl-3 pr-10 text-sm text-gray-900 focus:outline-none dark:text-white"
            displayValue={displayValue}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => onQueryChange('')}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-white/10 dark:bg-gray-900 dark:text-gray-100">
            {options.length === 0 ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-500 dark:text-gray-300">검색 결과가 없습니다.</div>
            ) : (
              options.map((item, idx) => (
                <Combobox.Option
                  key={idx}
                  className={({ active }) =>
                    classNames(
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                      active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-white' : 'text-gray-900 dark:text-gray-100'
                    )
                  }
                  value={item}
                >
                  {({ active, selected }) => (
                    <>
                      <span className={classNames('block truncate', selected ? 'font-semibold' : 'font-normal')}>{displayValue(item)}</span>
                      {selected ? (
                        <span
                          className={classNames(
                            'absolute inset-y-0 right-0 flex items-center pr-4',
                            active ? 'text-indigo-700 dark:text-white' : 'text-indigo-600 dark:text-indigo-200'
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  )
}
