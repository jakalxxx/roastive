'use client'

import { Dialog, DialogPanel, Transition } from '@headlessui/react'
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { PageHeading } from '@/components/PageHeading'
import { PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

type SupplierDetail = {
  supplierId: string
  supplierName: string
  contactName?: string
  phone?: string
  email?: string
  businessRegNo?: string
  address?: string
  status?: string
  contacts?: Array<{ contactId: string; contactName: string; phone?: string; email?: string; role?: string; createdAt?: string }>
  contracts?: Array<{
    contractId: string
    contractNo: string
    status?: string
    startDate?: string
    endDate?: string
    createdAt?: string
  }>
  items?: Array<{
    itemId: string
    itemName: string
    vendorSku?: string
    unitPrice?: number
    currency?: string
    status?: string
  }>
}

const cardClass =
  'rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/60'

type DrawerMode = 'supplier' | 'contact' | 'item' | 'contract' | null

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="space-y-1 text-sm">
    <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span>
    {children}
  </label>
)

export default function SupplierDetailPage() {
  const params = useParams<{ supplierId: string; locale: string }>()
  const searchParams = useSearchParams()
  const pathname = usePathname() || '/ko'
  const seg = pathname.split('/').filter(Boolean)
  const locale = seg[0] === 'en' || seg[0] === 'ja' || seg[0] === 'ko' ? seg[0] : 'ko'
  const base = `/${locale}`

  const supplierId = params?.supplierId
  const roasteryId = searchParams.get('roasteryId') ?? ''
  const customerId = searchParams.get('customerId') ?? ''

  const [detail, setDetail] = useState<SupplierDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [contactPage, setContactPage] = useState(1)
  const [contractPage, setContractPage] = useState(1)
  const [itemPage, setItemPage] = useState(1)

  const CONTACT_PAGE_SIZE = 5
  const CONTRACT_PAGE_SIZE = 5
  const ITEM_PAGE_SIZE = 5

  const fetchDetail = () => {
    if (!supplierId) return
    setLoading(true)
    setError(null)
    const query = roasteryId ? `?roasteryId=${encodeURIComponent(roasteryId)}` : ''
    fetch(`/api/procurement/suppliers/${supplierId}${query}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || '구매처 정보를 불러오지 못했습니다.')
        const payload = data?.data ?? data?.result ?? data
        setDetail({
          supplierId: String(payload?.supplierId ?? payload?.supplier_id ?? payload?.id ?? supplierId),
          supplierName: payload?.supplierName ?? payload?.supplier_name ?? payload?.name ?? '',
          contactName: payload?.contactName ?? payload?.contact_name ?? '',
          phone: payload?.phone ?? payload?.tel ?? '',
          email: payload?.email ?? '',
          businessRegNo: payload?.businessRegNo ?? payload?.business_reg_no ?? '',
          address: payload?.address ?? '',
          status: payload?.status ?? payload?.state ?? '',
          contacts: Array.isArray(payload?.contacts) ? payload.contacts : [],
          contracts: Array.isArray(payload?.contracts) ? payload.contracts : [],
          items: Array.isArray(payload?.items) ? payload.items : [],
        })
      })
      .catch((err: any) => {
        setError(err?.message || '구매처 정보를 불러오지 못했습니다.')
        setDetail(null)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId, roasteryId])

  useEffect(() => {
    setContactPage(1)
    setContractPage(1)
    setItemPage(1)
  }, [detail?.supplierId])

  const breadcrumb = useMemo(
    () => [
      { name: '홈', href: `${base}/dashboard` },
      { name: '구매 관리', href: `${base}/procurement/suppliers` },
      { name: detail?.supplierName || '구매처 상세' },
    ],
    [base, detail?.supplierName]
  )

  const openDrawer = (mode: DrawerMode) => {
    setDrawerMode(mode)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setDrawerMode(null)
  }

  const paginated = <T,>(list: T[] | undefined, page: number, size: number) => {
    const total = list?.length ?? 0
    const totalPages = Math.max(1, Math.ceil(total / size))
    const currentPage = Math.min(Math.max(page, 1), totalPages)
    const start = (currentPage - 1) * size
    return {
      total,
      totalPages,
      currentPage,
      data: (list ?? []).slice(start, start + size),
    }
  }

  const contactPaged = paginated(detail?.contacts, contactPage, CONTACT_PAGE_SIZE)
  const contractPaged = paginated(detail?.contracts, contractPage, CONTRACT_PAGE_SIZE)
  const itemPaged = paginated(detail?.items, itemPage, ITEM_PAGE_SIZE)

  return (
    <>
      <PageHeading
        title={detail?.supplierName || '구매처 상세'}
        description="구매처 정보와 담당자/계약/상품을 한 화면에서 관리하세요."
        breadcrumbs={breadcrumb}
        meta={
          error ? (
            <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : customerId ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">연결된 고객사 ID: {customerId}</p>
          ) : null
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <section className={`${cardClass} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">구매처 정보</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">기본 정보 및 상태를 확인하세요.</p>
            </div>
            <button type="button" className="btn-edit" onClick={() => openDrawer('supplier')}>
              <PencilSquareIcon className="size-4" />
              수정
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-300">불러오는 중...</p>
          ) : detail ? (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">사업자번호</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{detail.businessRegNo || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">담당자</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{detail.contactName || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">연락처</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{detail.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">이메일</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{detail.email || '-'}</dd>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">주소</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{detail.address || '-'}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-300">데이터가 없습니다.</p>
          )}
        </section>

        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">담당자 정보</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">supplier_contact</p>
            </div>
            <button type="button" className="btn-register" onClick={() => openDrawer('contact')}>
              <PlusIcon className="size-4" />
              담당자 등록
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="max-h-[360px] overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-200">
                  <tr>
                    <th className="px-4 py-3">이름</th>
                    <th className="px-4 py-3">역할</th>
                    <th className="px-4 py-3">연락처</th>
                    <th className="px-4 py-3">이메일</th>
                    <th className="px-4 py-3">등록일</th>
                    <th className="px-4 py-3 text-right">수정</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {contactPaged.data.map((c) => (
                    <tr key={c.contactId}>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{c.contactName}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.role || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.phone || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.email || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.createdAt || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" className="btn-edit text-xs" onClick={() => openDrawer('contact')}>
                          수정
                        </button>
                      </td>
                    </tr>
                  ))}
                  {contactPaged.total === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-300" colSpan={6}>
                        등록된 담당자가 없습니다.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {contactPaged.total > CONTACT_PAGE_SIZE ? (
              <div className="flex items-center justify-end gap-3 px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                <button
                  type="button"
                  className="rounded-full border border-gray-200 px-3 py-1 dark:border-white/15"
                  onClick={() => setContactPage((p) => Math.max(1, p - 1))}
                  disabled={contactPaged.currentPage === 1}
                >
                  이전
                </button>
                <span>
                  {contactPaged.currentPage} / {contactPaged.totalPages}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-gray-200 px-3 py-1 dark:border-white/15"
                  onClick={() => setContactPage((p) => Math.min(contactPaged.totalPages, p + 1))}
                  disabled={contactPaged.currentPage === contactPaged.totalPages}
                >
                  다음
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">계약 정보</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">supplier_contract / supplier_contract_price</p>
            </div>
            <button type="button" className="btn-register" onClick={() => openDrawer('contract')}>
              <PlusIcon className="size-4" />
              계약 등록
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="max-h-[360px] overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-200">
                  <tr>
                    <th className="px-4 py-3">계약번호</th>
                    <th className="px-4 py-3">계약기간</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">등록일시</th>
                    <th className="px-4 py-3 text-right">수정</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {contractPaged.data.map((c) => (
                    <tr key={c.contractId}>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{c.contractNo}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {c.startDate || '-'} ~ {c.endDate || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.status || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.createdAt || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" className="btn-edit text-xs" onClick={() => openDrawer('contract')}>
                          수정
                        </button>
                      </td>
                    </tr>
                  ))}
                  {contractPaged.total === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-300" colSpan={5}>
                        등록된 계약정보가 없습니다.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {contractPaged.total > CONTRACT_PAGE_SIZE ? (
              <div className="flex items-center justify-end gap-3 px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                <button
                  type="button"
                  className="rounded-full border border-gray-200 px-3 py-1 dark:border-white/15"
                  onClick={() => setContractPage((p) => Math.max(1, p - 1))}
                  disabled={contractPaged.currentPage === 1}
                >
                  이전
                </button>
                <span>
                  {contractPaged.currentPage} / {contractPaged.totalPages}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-gray-200 px-3 py-1 dark:border-white/15"
                  onClick={() => setContractPage((p) => Math.min(contractPaged.totalPages, p + 1))}
                  disabled={contractPaged.currentPage === contractPaged.totalPages}
                >
                  다음
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">상품 정보</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">supplier_item</p>
            </div>
            <button type="button" className="btn-register" onClick={() => openDrawer('item')}>
              <PlusIcon className="size-4" />
              상품 등록
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="max-h-[360px] overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-200">
                  <tr>
                    <th className="px-4 py-3">상품명</th>
                    <th className="px-4 py-3">Vendor SKU</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">통화</th>
                    <th className="px-4 py-3">단가</th>
                    <th className="px-4 py-3 text-right">동작</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {itemPaged.data.map((i) => (
                    <tr key={i.itemId}>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{i.itemName}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{i.vendorSku || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{i.status ?? 'ACTIVE'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{i.currency ?? 'KRW'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{i.unitPrice ?? '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" className="btn-edit text-xs" onClick={() => openDrawer('item')}>
                            수정
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:border-rose-300 dark:border-rose-500/40 dark:text-rose-200"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {itemPaged.total === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-300" colSpan={6}>
                        등록된 상품이 없습니다.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {itemPaged.total > ITEM_PAGE_SIZE ? (
              <div className="flex items-center justify-end gap-3 px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                <button
                  type="button"
                  className="rounded-full border border-gray-200 px-3 py-1 dark:border-white/15"
                  onClick={() => setItemPage((p) => Math.max(1, p - 1))}
                  disabled={itemPaged.currentPage === 1}
                >
                  이전
                </button>
                <span>
                  {itemPaged.currentPage} / {itemPaged.totalPages}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-gray-200 px-3 py-1 dark:border-white/15"
                  onClick={() => setItemPage((p) => Math.min(itemPaged.totalPages, p + 1))}
                  disabled={itemPaged.currentPage === itemPaged.totalPages}
                >
                  다음
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <Transition show={drawerOpen} as={Fragment}>
        <Dialog className="relative z-50" onClose={closeDrawer}>
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-out duration-200"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in duration-150"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-xl">
                    <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-900">
                      <div className="flex items-center justify-between px-6 py-4 sm:px-8">
                        <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                          {drawerMode === 'supplier'
                            ? '구매처 정보 수정'
                            : drawerMode === 'contact'
                              ? '담당자 등록/수정'
                              : drawerMode === 'contract'
                                ? '계약 등록/수정'
                                : drawerMode === 'item'
                                  ? '상품 등록/수정'
                                  : '편집'}
                        </Dialog.Title>
                        <button
                          type="button"
                          onClick={closeDrawer}
                          className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <span className="sr-only">닫기</span>
                          ×
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                        {drawerMode === 'supplier' && (
                          <div className="space-y-4">
                            <Field label="업체명">
                              <input className="input w-full" defaultValue={detail?.supplierName} />
                            </Field>
                            <Field label="사업자등록번호">
                              <input className="input w-full" defaultValue={detail?.businessRegNo} />
                            </Field>
                            <Field label="주소">
                              <textarea className="input w-full min-h-[96px]" defaultValue={detail?.address} />
                            </Field>
                          </div>
                        )}
                        {drawerMode === 'contact' && (
                          <div className="space-y-4">
                            <Field label="이름">
                              <input className="input w-full" />
                            </Field>
                            <Field label="역할">
                              <input className="input w-full" />
                            </Field>
                            <Field label="연락처">
                              <input className="input w-full" />
                            </Field>
                            <Field label="이메일">
                              <input className="input w-full" />
                            </Field>
                          </div>
                        )}
                        {drawerMode === 'contract' && (
                          <div className="space-y-4">
                            <Field label="계약번호">
                              <input className="input w-full" />
                            </Field>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <Field label="시작일">
                                <input type="date" className="input w-full" />
                              </Field>
                              <Field label="종료일">
                                <input type="date" className="input w-full" />
                              </Field>
                            </div>
                            <Field label="상태">
                              <input className="input w-full" />
                            </Field>
                          </div>
                        )}
                        {drawerMode === 'item' && (
                          <div className="space-y-4">
                            <Field label="상품명">
                              <input className="input w-full" />
                            </Field>
                            <Field label="Vendor SKU">
                              <input className="input w-full" />
                            </Field>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <Field label="통화">
                                <input className="input w-full" defaultValue="KRW" />
                              </Field>
                              <Field label="단가">
                                <input type="number" className="input w-full" />
                              </Field>
                            </div>
                            <Field label="상태">
                              <input className="input w-full" defaultValue="ACTIVE" />
                            </Field>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-3 px-6 py-4 sm:px-8">
                        <button
                          type="button"
                          onClick={closeDrawer}
                          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:text-gray-900 dark:border-white/15 dark:text-gray-200 dark:hover:border-white/25 dark:hover:text-white"
                        >
                          닫기
                        </button>
                        <button type="button" className="btn-register">
                          임시 저장
                        </button>
                      </div>
                    </div>
                  </DialogPanel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
