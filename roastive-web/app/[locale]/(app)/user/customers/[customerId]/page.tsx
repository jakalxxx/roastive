'use client'

import { Fragment, useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { ArrowPathIcon, ArrowUturnLeftIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PageHeading } from '@/components/PageHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'

type CustomerDetailPageProps = {
  params: { locale: string; customerId: string }
  searchParams?: { roasteryId?: string }
}

type StatusValue = 'ACTIVE' | 'INACTIVE' | 'PENDING'

type CustomerSummary = {
  customerId: string
  customerName: string
  code?: string | null
  status?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

type CustomerDetail = {
  customer: CustomerSummary
  roastery?: {
    roasteryId?: string | null
    status?: string | null
    requestedAt?: string | null
    approvedAt?: string | null
  }
}

type DrawerFormValues = {
  customerName: string
  businessRegNo: string
  representativeName: string
  productUsed: string
  status: StatusValue
}

const STATUS_OPTIONS: { value: StatusValue; label: string }[] = [
  { value: 'ACTIVE', label: '활성' },
  { value: 'INACTIVE', label: '비활성' },
  { value: 'PENDING', label: '대기' },
]

const STATUS_TONES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/40',
  INACTIVE: 'bg-gray-100 text-gray-600 ring-gray-500/30 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/30',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/40',
}

const DEFAULT_FORM: DrawerFormValues = {
  customerName: '',
  businessRegNo: '',
  representativeName: '',
  productUsed: '',
  status: 'ACTIVE',
}

const CUSTOMER_META_STORAGE_KEY = 'customer_meta_v1'

function classNames(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ')
}

function formatDate(value?: string | null, locale: string = 'ko-KR') {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function formatDateTime(value?: string | null, locale: string = 'ko-KR') {
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

function formatBizNumber(value?: string | null) {
  if (!value) return '-'
  const digits = value.replace(/\D+/g, '')
  if (digits.length !== 10) return value
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

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
    // ignore storage errors
  }
}

export default function CustomerDetailPage({ params, searchParams }: CustomerDetailPageProps) {
  useSessionGuard(1000 * 60 * 5)
  const router = useRouter()
  const locale = ['ko', 'en', 'ja'].includes(params.locale) ? params.locale : 'ko'
  const base = `/${locale}`
  const roasteryQuery = typeof searchParams?.roasteryId === 'string' ? searchParams.roasteryId : ''

  const [detail, setDetail] = useState<CustomerDetail | null>(null)
  const [meta, setMeta] = useState({ representativeName: '', productUsed: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formValues, setFormValues] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setNotFound(false)
    const query = roasteryQuery ? `?roasteryId=${encodeURIComponent(roasteryQuery)}` : ''
    fetch(`/api/user/customers/${params.customerId}${query}`, { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.status === 404) {
          setDetail(null)
          setNotFound(true)
          return
        }
        if (!res.ok) throw new Error(data?.message || '고객사 정보를 불러오지 못했습니다.')
        const customerData = data?.customer ?? data?.customer ?? data ?? {}
        const normalized: CustomerDetail = {
          customer: {
            customerId: customerData.customerId ?? customerData.customer_id ?? params.customerId,
            customerName: customerData.customerName ?? customerData.customer_name ?? '',
            code: customerData.code ?? customerData.customer_code ?? '',
            status: customerData.status ?? 'ACTIVE',
            createdAt: customerData.createdAt ?? customerData.created_at ?? null,
            updatedAt: customerData.updatedAt ?? customerData.updated_at ?? null,
          },
          roastery: data?.roastery
            ? {
                roasteryId: data.roastery.roasteryId ?? data.roastery.roastery_id ?? roasteryQuery ?? '',
                status: data.roastery.status ?? '',
                requestedAt: data.roastery.requestedAt ?? data.roastery.requested_at ?? null,
                approvedAt: data.roastery.approvedAt ?? data.roastery.approved_at ?? null,
              }
            : {
                roasteryId: data?.roasteryId ?? roasteryQuery ?? '',
                status: data?.mappingStatus ?? '',
                requestedAt: data?.requestedAt ?? null,
                approvedAt: data?.approvedAt ?? null,
              },
        }
        const metaMap = readCustomerMeta()
        const metaEntry = metaMap[normalized.customer.customerId] ?? {}
        setMeta({
          representativeName: metaEntry.representativeName ?? '',
          productUsed: metaEntry.productUsed ?? '',
        })
        setDetail(normalized)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setError(err?.message || '고객사 정보를 불러오지 못했습니다.')
        setDetail(null)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [params.customerId, roasteryQuery, refreshKey])

  const statusClass = useMemo(() => {
    const key = detail?.customer?.status?.toUpperCase?.() ?? 'ACTIVE'
    return STATUS_TONES[key] ?? STATUS_TONES.ACTIVE
  }, [detail?.customer?.status])

  const handleBack = useCallback(() => {
    router.push(`${base}/user/customers` as Route)
  }, [base, router])

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  const openDrawer = () => {
    if (!detail) return
    setFormValues({
      customerName: detail.customer.customerName ?? '',
      businessRegNo: detail.customer.code ?? '',
      representativeName: meta.representativeName ?? '',
      productUsed: meta.productUsed ?? '',
      status: (detail.customer.status?.toUpperCase?.() as StatusValue) ?? 'ACTIVE',
    })
    setDrawerOpen(true)
  }

  const handleDrawerChange =
    (field: keyof DrawerFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value
      setFormValues((prev) => ({ ...prev, [field]: value }))
    }

  const closeDrawer = () => {
    if (saving) return
    setDrawerOpen(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!detail) return
    const trimmedName = formValues.customerName.trim()
    if (!trimmedName) {
      setError('고객사명을 입력해주세요.')
      return
    }
    const roasteryId = detail.roastery?.roasteryId || roasteryQuery
    if (!roasteryId) {
      setError('로스터리 정보를 확인할 수 없습니다.')
      return
    }
    const codeDigits = formValues.businessRegNo.replace(/\D+/g, '')
    setSaving(true)
    setError(null)
    const query = roasteryQuery ? `?roasteryId=${encodeURIComponent(roasteryQuery)}` : ''
    const res = await fetch(`/api/user/customers/${detail.customer.customerId}${query}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: trimmedName,
        code: codeDigits,
        status: formValues.status,
        roasteryId,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data?.message || '고객사 정보를 수정하지 못했습니다.')
      setSaving(false)
      return
    }
    const metaMap = readCustomerMeta()
    metaMap[detail.customer.customerId] = {
      representativeName: formValues.representativeName.trim(),
      productUsed: formValues.productUsed.trim(),
    }
    saveCustomerMeta(metaMap)
    setMeta(metaMap[detail.customer.customerId])
    setDrawerOpen(false)
    setSaving(false)
    setRefreshKey((prev) => prev + 1)
  }

  const actions = (
    <>
      <button
        type="button"
        onClick={handleRefresh}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-white/10 dark:text-gray-200 dark:hover:border-white/20"
      >
        <ArrowPathIcon className="size-4" aria-hidden="true" />
        새로고침
      </button>
      <button
        type="button"
        onClick={openDrawer}
        disabled={!detail}
        className="btn-edit disabled:cursor-not-allowed"
      >
        <PencilSquareIcon className="size-4" aria-hidden="true" />
        정보 수정
      </button>
      <button
        type="button"
        onClick={handleBack}
        className="btn-edit"
      >
        <ArrowUturnLeftIcon className="size-4" aria-hidden="true" />
        목록으로
      </button>
    </>
  )

  return (
    <>
      <PageHeading
        title="고객사 상세"
        description="고객사 기본 정보와 연결된 로스터리 정보를 확인하고 수정할 수 있습니다."
        actions={actions}
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` as Route },
          { name: '고객사 목록', href: `${base}/user/customers` as Route },
          { name: detail?.customer?.customerName || '상세' },
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
            고객사 정보를 불러오는 중입니다...
          </div>
        )}
        {error && !loading && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}
        {notFound && !loading && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
            해당 고객사 정보를 찾을 수 없습니다.
            <div className="mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="btn-edit"
              >
                목록으로 이동
              </button>
            </div>
          </div>
        )}

        {!loading && !notFound && detail && (
          <div className="space-y-8">
            <section className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900/40">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">고객사 정보</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">기본 프로필 및 메모</p>
                </div>
                <span
                  className={classNames(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                    statusClass
                  )}
                >
                  {STATUS_OPTIONS.find((opt) => opt.value === detail.customer.status)?.label ??
                    detail.customer.status ??
                    'ACTIVE'}
                </span>
              </div>
              <dl className="grid gap-6 px-6 py-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">회사명</dt>
                  <dd className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{detail.customer.customerName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">사업자번호</dt>
                  <dd className="mt-2 font-mono text-sm text-gray-800 dark:text-gray-200">
                    {formatBizNumber(detail.customer.code)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">대표자명</dt>
                  <dd className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                    {meta.representativeName || '등록된 정보가 없습니다.'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">등록일</dt>
                  <dd className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(detail.customer.createdAt, locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">최종 수정</dt>
                  <dd className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                    {formatDateTime(detail.customer.updatedAt, locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">사용 제품</dt>
                  <dd className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                    {meta.productUsed || '등록된 정보가 없습니다.'}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900/40">
              <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">로스터리 연결 정보</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">해당 고객사가 연결된 로스터리 기준으로 표시됩니다.</p>
              </div>
              <dl className="grid gap-6 px-6 py-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">로스터리 ID</dt>
                  <dd className="mt-2 font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                    {detail.roastery?.roasteryId || roasteryQuery || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">연결 상태</dt>
                  <dd className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                    {detail.roastery?.status || '미확인'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">요청일</dt>
                  <dd className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                    {formatDateTime(detail.roastery?.requestedAt, locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">승인일</dt>
                  <dd className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                    {formatDateTime(detail.roastery?.approvedAt, locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR')}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </div>

      <SlideOver
        open={drawerOpen}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        submitting={saving}
        title="고객사 정보 수정"
        description="고객사 정보를 최신 상태로 유지하세요."
        submitLabel="저장"
      >
        <div className="space-y-6">
          <div>
            <label htmlFor="detail-business-reg" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              사업자번호
            </label>
            <input
              id="detail-business-reg"
              name="detail-business-reg"
              value={formValues.businessRegNo}
              onChange={handleDrawerChange('businessRegNo')}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="000-00-00000"
              inputMode="numeric"
              maxLength={12}
            />
          </div>
          <div>
            <label htmlFor="detail-customer-name" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              회사명
            </label>
            <input
              id="detail-customer-name"
              name="detail-customer-name"
              value={formValues.customerName}
              onChange={handleDrawerChange('customerName')}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="예: 로스티브 커피"
            />
          </div>
          <div>
            <label htmlFor="detail-representative-name" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              대표자명
            </label>
            <input
              id="detail-representative-name"
              name="detail-representative-name"
              value={formValues.representativeName}
              onChange={handleDrawerChange('representativeName')}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="대표자명을 입력하세요"
            />
          </div>
          <div>
            <label htmlFor="detail-product-used" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              사용 제품
            </label>
            <textarea
              id="detail-product-used"
              name="detail-product-used"
              value={formValues.productUsed}
              onChange={handleDrawerChange('productUsed')}
              rows={3}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="예: 원두 A, 드립백 B"
            />
          </div>
          <div>
            <label htmlFor="detail-status" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              상태
            </label>
            <select
              id="detail-status"
              name="detail-status"
              value={formValues.status}
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
      </SlideOver>
    </>
  )
}

type SlideOverProps = {
  open: boolean
  title: string
  description?: string
  submitting?: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
  submitLabel?: string
}

function SlideOver({ open, title, description, submitting, onClose, onSubmit, children, submitLabel = '저장' }: SlideOverProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => (submitting ? null : onClose())}>
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
                  <form onSubmit={onSubmit} className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-900">
                    <div className="flex items-center justify-between px-6 py-4 sm:px-8">
                      <div>
                        <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">{title}</DialogTitle>
                        {description ? (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => (submitting ? null : onClose())}
                        className="rounded p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <span className="sr-only">닫기</span>
                        <XMarkIcon className="size-5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">{children}</div>
                    <div className="flex items-center justify-end gap-3 px-6 py-4 sm:px-8">
                      <button
                        type="button"
                        onClick={() => (submitting ? null : onClose())}
                        className="border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-register disabled:cursor-not-allowed"
                      >
                        {submitting ? `${submitLabel} 중...` : submitLabel}
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
  )
}


