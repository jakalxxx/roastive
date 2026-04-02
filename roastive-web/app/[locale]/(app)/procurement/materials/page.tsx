'use client'

import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment, useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { PurchaseListPage, formatDateTime } from '../_components/PurchaseListPage'

type MaterialPurchase = {
  purchaseId: string
  purchaseNo: string
  supplierName: string
  invoiceNo?: string
  purchaseDate?: string | null
  expectedArrival?: string | null
  currency: string
  paymentTerms?: string
  status: string
  totalAmount: number
  itemName: string
  categoryDetail?: string
  materialType?: string
  color?: string
  size?: string
  dimensions?: string
  thickness?: number
  lotHint?: string
  quantity?: number
  unit?: string
  unitPrice?: number
}

type DrawerForm = {
  purchaseNo: string
  supplierName: string
  invoiceNo: string
  purchaseDate: string
  expectedArrival: string
  currency: string
  paymentTerms: string
  status: string
  itemName: string
  categoryDetail: string
  materialType: string
  color: string
  size: string
  dimensions: string
  thickness: string
  lotHint: string
  quantity: string
  unit: string
  unitPrice: string
  remarks: string
}

const STATUS_LABELS: Record<string, string> = {
  ORDERED: '발주 완료',
  INBOUND: '입고 진행',
  CLOSED: '마감',
  DRAFT: '임시저장',
}

const STATUS_TONES: Record<string, string> = {
  ORDERED:
    'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-400/40',
  INBOUND:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/40',
  CLOSED:
    'bg-gray-100 text-gray-700 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-100 dark:ring-gray-400/30',
  DRAFT:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/40',
}

const formatCurrency = (amount: number, currency: string) => {
  if (!Number.isFinite(amount)) return '-'
  const code = currency && currency.trim() ? currency : 'KRW'
  try {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: code === 'USD' ? 'USD' : 'KRW',
      maximumFractionDigits: code === 'USD' ? 2 : 0,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString()} ${code}`
  }
}

const formatNumber = (value?: number) => {
  if (!Number.isFinite(value)) return '-'
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const INITIAL_FORM: DrawerForm = {
  purchaseNo: '',
  supplierName: '',
  invoiceNo: '',
  purchaseDate: '',
  expectedArrival: '',
  currency: 'KRW',
  paymentTerms: '',
  status: 'ORDERED',
  itemName: '',
  categoryDetail: '',
  materialType: '',
  color: '',
  size: '',
  dimensions: '',
  thickness: '',
  lotHint: '',
  quantity: '',
  unit: '',
  unitPrice: '',
  remarks: '',
}

const ensureId = (value: any, prefix: string) => {
  const str = value == null ? '' : String(value)
  if (str.trim()) return str
  return `${prefix}-${Math.random().toString(36).slice(2)}`
}

const inputClass =
  'mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white'

export default function MaterialsPurchasesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSaving, setDrawerSaving] = useState(false)
  const [form, setForm] = useState<DrawerForm>(INITIAL_FORM)

  const openDrawer = useCallback(() => {
    setForm(INITIAL_FORM)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    if (drawerSaving) return
    setDrawerOpen(false)
  }, [drawerSaving])

  const handleChange =
    (field: keyof DrawerForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value } = e.target
      setForm((prev) => ({ ...prev, [field]: value }))
    }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDrawerSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    setDrawerSaving(false)
    setDrawerOpen(false)
  }

  const renderToolbarExtras = useCallback(
    () => (
      <button type="button" className="btn-register" onClick={openDrawer}>
        등록
      </button>
    ),
    [openDrawer]
  )

  const config = useMemo(
    () => ({
      title: '부자재 구매',
      description: '부자재 구매 내역을 관리하세요.',
      apiPath: '/api/procurement/materials/purchases',
      searchPlaceholder: '구매번호, 공급사명, 자재/규격 검색',
      getBreadcrumbs: (base: string) => [
        { name: '홈', href: `${base}/dashboard` },
        { name: '구매 관리' },
        { name: '부자재 구매' },
      ],
      columns: [
        {
          label: '구매번호',
          render: (item: MaterialPurchase) => (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">{item.purchaseNo}</p>
              {item.invoiceNo ? <p className="text-xs text-gray-500 dark:text-gray-300">Invoice {item.invoiceNo}</p> : null}
            </div>
          ),
        },
        {
          label: '공급사/조건',
          render: (item: MaterialPurchase) => (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">{item.supplierName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">{item.paymentTerms || '결제조건 미입력'}</p>
            </div>
          ),
        },
        {
          label: '자재 정보',
          render: (item: MaterialPurchase) => (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">{item.itemName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                {[item.categoryDetail, item.materialType, item.size].filter(Boolean).join(' · ') || '상세 미입력'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-400">
                {[item.color, item.dimensions].filter(Boolean).join(' / ') || '규격 정보 미입력'}
              </p>
            </div>
          ),
        },
        {
          label: '규격',
          render: (item: MaterialPurchase) => (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">{item.dimensions || '-'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                두께 {item.thickness ? `${item.thickness}mm` : '미입력'} {item.lotHint ? `· LOT ${item.lotHint}` : ''}
              </p>
            </div>
          ),
        },
        {
          label: '수량/단위',
          render: (item: MaterialPurchase) => (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(item.quantity)} {item.unit || ''}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-300">단가 {formatCurrency(item.unitPrice ?? 0, item.currency)}</p>
            </div>
          ),
        },
        {
          label: '금액',
          className: 'text-right',
          render: (item: MaterialPurchase) => (
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.totalAmount, item.currency)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">통화 {item.currency || 'KRW'}</p>
            </div>
          ),
        },
        {
          label: '상태',
          render: (item: MaterialPurchase) => {
            const tone =
              STATUS_TONES[item.status] ??
              'bg-gray-100 text-gray-700 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-200 dark:ring-gray-400/30'
            return (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}>
                {STATUS_LABELS[item.status] ?? item.status ?? '-'}
              </span>
            )
          },
        },
        {
          label: '구매일/입고예정',
          render: (item: MaterialPurchase, ctx: { locale: string }) => (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">{formatDateTime(item.purchaseDate, ctx.locale)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">입고 {formatDateTime(item.expectedArrival, ctx.locale)}</p>
            </div>
          ),
        },
      ],
      sortOptions: [
        { value: 'date_desc', label: '구매일 최신순', sort: 'purchaseDate', direction: 'desc' as const },
        { value: 'date_asc', label: '구매일 오래된순', sort: 'purchaseDate', direction: 'asc' as const },
        { value: 'amount_desc', label: '금액 높은순', sort: 'totalAmount', direction: 'desc' as const },
        { value: 'supplier_asc', label: '공급사 가나다순', sort: 'supplierName', direction: 'asc' as const },
      ],
      rowKey: (item: MaterialPurchase) => ensureId(item.purchaseId ?? item.purchaseNo, 'purchase'),
      getSearchValue: (item: MaterialPurchase) =>
        [item.purchaseNo, item.supplierName, item.itemName, item.categoryDetail, item.materialType, item.size, item.lotHint]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
      normalizeItem: (raw: any): MaterialPurchase => {
        const firstItem = Array.isArray(raw?.items) && raw.items.length ? raw.items[0] : {}
        const quantity = Number(firstItem?.quantity ?? raw?.quantity ?? 0)
        const unitPrice = Number(firstItem?.unitPrice ?? raw?.unitPrice ?? 0)
        const amount = Number(raw?.totalAmount ?? quantity * unitPrice ?? 0)
        return {
          purchaseId: ensureId(raw?.purchaseId ?? raw?.purchase_id ?? raw?.id, 'purchase'),
          purchaseNo: raw?.purchaseNo ?? raw?.purchase_no ?? '-',
          supplierName: raw?.supplierName ?? raw?.supplier_name ?? '공급사 미정',
          invoiceNo: raw?.invoiceNo ?? raw?.invoice_no ?? '',
          purchaseDate: raw?.purchaseDate ?? raw?.purchase_date ?? null,
          expectedArrival: raw?.expectedArrival ?? raw?.expected_arrival ?? null,
          currency: raw?.currency ?? raw?.cur ?? 'KRW',
          paymentTerms: raw?.paymentTerms ?? raw?.payment_terms ?? '',
          status: (raw?.status ?? 'ORDERED').toString().toUpperCase(),
          totalAmount: amount,
          itemName: firstItem?.itemName ?? raw?.itemName ?? '품목 미정',
          categoryDetail: firstItem?.categoryDetail ?? raw?.categoryDetail ?? '',
          materialType: firstItem?.materialType ?? raw?.materialType ?? '',
          color: firstItem?.color ?? raw?.color ?? '',
          size: firstItem?.size ?? raw?.size ?? '',
          dimensions: firstItem?.dimensions ?? raw?.dimensions ?? '',
          thickness: Number(firstItem?.thickness ?? raw?.thickness ?? 0) || undefined,
          lotHint: firstItem?.lotHint ?? raw?.lotHint ?? '',
          quantity,
          unit: firstItem?.unit ?? raw?.unit ?? '',
          unitPrice,
        }
      },
      emptyMessage: '등록된 부자재 구매 데이터가 없습니다.',
      renderToolbarExtras,
    }),
    [renderToolbarExtras]
  )

  return (
    <>
      <PurchaseListPage config={config} />

      <Transition show={drawerOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeDrawer}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-out duration-200"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in duration-150"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <form
                      onSubmit={handleSubmit}
                      className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-900"
                    >
                      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                        <div className="flex items-center justify-between bg-gray-50 px-6 py-4 dark:bg-gray-800/80 sm:px-8">
                          <div>
                            <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">부자재 구매 등록</Dialog.Title>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                              purchase_master / purchase_detail / item_material 구조를 기준으로 입력 필드를 구성했습니다.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={closeDrawer}
                            className="rounded p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <span className="sr-only">닫기</span>
                            <XMarkIcon className="size-5" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="flex-1 space-y-8 px-6 py-6">
                          <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">기본 정보</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">구매번호 (purchase_no)</label>
                                <input className={inputClass} value={form.purchaseNo} onChange={handleChange('purchaseNo')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">공급사 (supplier_id)</label>
                                <input className={inputClass} value={form.supplierName} onChange={handleChange('supplierName')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">구매일 (purchase_date)</label>
                                <input type="datetime-local" className={inputClass} value={form.purchaseDate} onChange={handleChange('purchaseDate')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">입고 예정일 (expected_arrival)</label>
                                <input type="datetime-local" className={inputClass} value={form.expectedArrival} onChange={handleChange('expectedArrival')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">통화 (currency)</label>
                                <select className={inputClass} value={form.currency} onChange={handleChange('currency')}>
                                  <option value="KRW">KRW</option>
                                  <option value="USD">USD</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">결제 조건 (payment_terms)</label>
                                <input className={inputClass} value={form.paymentTerms} onChange={handleChange('paymentTerms')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">송장번호 (invoice_no)</label>
                                <input className={inputClass} value={form.invoiceNo} onChange={handleChange('invoiceNo')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">상태 (status)</label>
                                <select className={inputClass} value={form.status} onChange={handleChange('status')}>
                                  <option value="DRAFT">임시저장</option>
                                  <option value="ORDERED">발주 완료</option>
                                  <option value="INBOUND">입고 진행</option>
                                  <option value="CLOSED">마감</option>
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">비고 (remarks)</label>
                                <textarea className={`${inputClass} min-h-[88px]`} value={form.remarks} onChange={handleChange('remarks')} />
                              </div>
                            </div>
                          </section>

                          <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">품목 정보 (item_material)</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">품목명</label>
                                <input className={inputClass} value={form.itemName} onChange={handleChange('itemName')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">세부 카테고리 (category_detail)</label>
                                <input className={inputClass} value={form.categoryDetail} onChange={handleChange('categoryDetail')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">재질 (material_type)</label>
                                <input className={inputClass} value={form.materialType} onChange={handleChange('materialType')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">색상 (color)</label>
                                <input className={inputClass} value={form.color} onChange={handleChange('color')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">규격/사이즈 (size)</label>
                                <input className={inputClass} value={form.size} onChange={handleChange('size')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">가로x세로/치수 (dimensions)</label>
                                <input className={inputClass} value={form.dimensions} onChange={handleChange('dimensions')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">두께 (thickness)</label>
                                <input className={inputClass} value={form.thickness} onChange={handleChange('thickness')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">LOT 참고 (lot_hint)</label>
                                <input className={inputClass} value={form.lotHint} onChange={handleChange('lotHint')} />
                              </div>
                            </div>
                          </section>

                          <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">구매 수량 (purchase_detail)</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">수량 (quantity)</label>
                                <input className={inputClass} value={form.quantity} onChange={handleChange('quantity')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">단위 (unit)</label>
                                <input className={inputClass} value={form.unit} onChange={handleChange('unit')} />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">단가 (unit_price)</label>
                                <input className={inputClass} value={form.unitPrice} onChange={handleChange('unitPrice')} />
                              </div>
                            </div>
                          </section>

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            * 실제 저장/연동은 API 연결 후 적용됩니다. 현재는 필드 구조 확인용 UI입니다.
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 justify-end gap-3 bg-gray-50 px-6 py-4 dark:bg-gray-800/80">
                        <button
                          type="button"
                          onClick={closeDrawer}
                          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:text-gray-900 dark:border-white/15 dark:text-gray-200 dark:hover:border-white/25 dark:hover:text-white"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          disabled={drawerSaving}
                          className="btn-register disabled:cursor-not-allowed"
                        >
                          {drawerSaving ? '저장 중...' : '임시 저장'}
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
