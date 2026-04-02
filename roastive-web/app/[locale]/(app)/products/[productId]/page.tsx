'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeading } from '@/components/PageHeading'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'

type ProductDetail = {
  productId: string
  roasteryId: string
  productName: string
  productType: string
  unit: string
  avgLossRate?: number | null
  description?: string
  status: string
  basePrice?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

type Variant = {
  variantId: string
  productId: string
  unitSize: number
  unit: string
  sku?: string
  status: string
}

type RecipeSet = {
  setId: string
  productId: string
  setName: string
  description?: string
  status: string
}

const STATUS_MAP: Record<string, string> = {
  ACTIVE: '판매중',
  PAUSED: '일시중지',
  ARCHIVED: '단종',
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export default function ProductDetailPage({ params }: { params: { locale: string; productId: string } }) {
  const { locale, productId } = params
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [variantDrawerOpen, setVariantDrawerOpen] = useState(false)

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [recipeSets, setRecipeSets] = useState<RecipeSet[]>([])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fetch(`/api/products/${productId}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || '제품 정보를 불러오지 못했습니다.')
        if (!active) return
        setProduct(data?.product ?? null)
        setVariants(Array.isArray(data?.variants) ? data.variants : [])
        setRecipeSets(Array.isArray(data?.recipeSets) ? data.recipeSets : [])
      })
      .catch((err: any) => {
        if (active) setError(err?.message || '제품 정보를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [productId])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeading
        title="제품 상세"
        description="제품 기준 정보를 확인하세요."
        breadcrumbs={[
          { name: '제품 관리', href: `/${locale}/products` },
          { name: '제품 상세' },
        ]}
      />

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">기본 정보</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">PRODUCT_MASTER</p>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/products`)}
              className="rounded-full border border-gray-200 px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/10"
            >
              목록으로
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <InfoRow label="제품명" value={product?.productName ?? '-'} />
            <InfoRow label="제품 구분" value={product?.productType ?? '-'} />
            <InfoRow label="기본 단위" value={product?.unit ?? '-'} />
            <InfoRow label="손실율" value={product?.avgLossRate ? `${product.avgLossRate.toFixed(2)}%` : '-'} />
            <InfoRow label="단가" value={product?.basePrice ? `${product.basePrice.toLocaleString()} KRW` : '-'} />
            <InfoRow label="상태" value={STATUS_MAP[product?.status ?? ''] ?? product?.status ?? '-'} />
            <InfoRow label="등록일시" value={formatDate(product?.createdAt)} />
            <InfoRow label="수정일시" value={formatDate(product?.updatedAt)} />
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">설명</p>
              <p className="mt-2 min-h-[48px] whitespace-pre-wrap rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-200">
                {product?.description || '—'}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">원두 정보</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Recipe Set</p>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              <PlusIcon className="size-4" aria-hidden="true" />
              등록
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-300">불러오는 중...</p>
            ) : recipeSets.length ? (
              recipeSets.map((set) => (
                <div key={set.setId} className="rounded-xl border border-gray-100 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{set.setName}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-300">{set.status}</span>
                  </div>
                  {set.description ? <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{set.description}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-300">등록된 원두 정보가 없습니다.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Variant 목록</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">제품 규격 정보</p>
          </div>
          <button
            type="button"
            onClick={() => setVariantDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            <PlusIcon className="size-4" aria-hidden="true" />
            등록
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 dark:border-white/10">
          <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-900/80 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">규격</th>
                <th className="px-4 py-3 text-left">단위</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-300">
                    불러오는 중입니다...
                  </td>
                </tr>
              ) : variants.length ? (
                variants.map((v) => (
                  <tr key={v.variantId} className="bg-white dark:bg-gray-900/40">
                    <td className="px-4 py-3">{v.unitSize.toLocaleString()}</td>
                    <td className="px-4 py-3">{v.unit}</td>
                    <td className="px-4 py-3">{v.sku || '-'}</td>
                    <td className="px-4 py-3">{v.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-300">
                    등록된 Variant가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Transition show={drawerOpen}>
        <Dialog className="relative z-50" onClose={() => setDrawerOpen(false)}>
          <TransitionChild
            as="div"
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
                  as="div"
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-xl">
                    <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-900">
                      <div className="flex items-center justify-between px-6 py-4 sm:px-8">
                        <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">원두 정보 등록</Dialog.Title>
                        <button
                          type="button"
                          onClick={() => setDrawerOpen(false)}
                          className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <span className="sr-only">닫기</span>
                          <XMarkIcon className="size-5" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                        <p className="text-sm text-gray-600 dark:text-gray-300">레시피/원두 정보 등록 기능은 준비 중입니다.</p>
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition show={variantDrawerOpen}>
        <Dialog className="relative z-50" onClose={() => setVariantDrawerOpen(false)}>
          <TransitionChild
            as="div"
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
                  as="div"
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-xl">
                    <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-900">
                      <div className="flex items-center justify-between px-6 py-4 sm:px-8">
                        <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">Variant 등록</Dialog.Title>
                        <button
                          type="button"
                          onClick={() => setVariantDrawerOpen(false)}
                          className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <span className="sr-only">닫기</span>
                          <XMarkIcon className="size-5" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Variant 등록 기능은 준비 중입니다.</p>
                      </div>
                    </div>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{value || '-'}</p>
    </div>
  )
}
