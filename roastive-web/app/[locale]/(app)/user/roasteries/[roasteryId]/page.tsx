'use client'

import { Fragment, useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PageHeading } from '@/components/PageHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'
import AddressSearchFields from '@/app/[locale]/(app)/roastery/settings/sites/SiteSearchFields'
import { isValidAddress } from '@/lib/validators'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

type BasicInfo = {
  roasteryId: string
  roasteryName: string
  brandName?: string | null
  legalName?: string | null
  businessRegNo?: string | null
  representativeName?: string | null
  phone?: string | null
  email?: string | null
  status?: string | null
  code?: string | null
  createdAt?: string | null
}

type AddressForm = {
  address_type: string
  site_name: string
  branch_seq_no: string
  postal_code: string
  address_line1: string
  address_line2: string
}

type AddressItem = AddressForm & {
  address_id: string
  address_type_label?: string
  created_at?: string
}

type ContactForm = {
  contact_name: string
  position: string
  phone: string
  email: string
  is_primary: boolean
}

type ContactItem = ContactForm & {
  contact_id: string
  created_at?: string
}

type TaxProfileForm = {
  vat_no: string
  tax_type: string
  invoice_emission: string
  invoice_email: string
  remarks: string
}

type TaxProfile = TaxProfileForm & {
  tax_profile_id: string
  created_at?: string
}

type BankAccountForm = {
  bank_name: string
  account_no: string
  account_holder: string
  swift_bic: string
  iban: string
  currency: string
  is_primary: boolean
}

type BankAccount = BankAccountForm & {
  bank_id: string
  created_at?: string
}

const EMPTY_ADDRESS_FORM: AddressForm = {
  address_type: '',
  site_name: '',
  branch_seq_no: '',
  postal_code: '',
  address_line1: '',
  address_line2: '',
}

const EMPTY_CONTACT_FORM: ContactForm = {
  contact_name: '',
  position: '',
  phone: '',
  email: '',
  is_primary: false,
}

const EMPTY_TAX_FORM: TaxProfileForm = {
  vat_no: '',
  tax_type: '',
  invoice_emission: '',
  invoice_email: '',
  remarks: '',
}

const EMPTY_BANK_FORM: BankAccountForm = {
  bank_name: '',
  account_no: '',
  account_holder: '',
  swift_bic: '',
  iban: '',
  currency: 'KRW',
  is_primary: false,
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

function formatPhoneNumber(value?: string | null) {
  if (!value) return '-'
  const digits = value.replace(/\D+/g, '')
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return value
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
      <Dialog className="relative z-50" onClose={() => (submitting ? null : onClose())}>
        <TransitionChild as={Fragment} enter="ease-in-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                        {description ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p> : null}
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
                      <button type="submit" disabled={submitting} className="btn-register disabled:cursor-not-allowed">
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

const STATUS_TONES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-400/30',
  INACTIVE: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-200 dark:ring-gray-400/30',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-400/30',
}

const useNotice = () => {
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])
  return { notice, setNotice }
}

export default function RoasteryDetailPage() {
  useSessionGuard(1000 * 60 * 5)
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname() || '/ko'
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] === 'en' || segments[0] === 'ja' || segments[0] === 'ko' ? segments[0] : 'ko'
  const base = `/${locale}`
  const roasteryIdParam = typeof params?.roasteryId === 'string' ? params?.roasteryId : Array.isArray(params?.roasteryId) ? params?.roasteryId[0] : ''
  const roasteryId = roasteryIdParam || ''

  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null)
  const [basicLoading, setBasicLoading] = useState(true)

  const [addresses, setAddresses] = useState<AddressItem[]>([])
  const [addressLoading, setAddressLoading] = useState(true)
  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false)
  const [addressForm, setAddressForm] = useState<AddressForm>(EMPTY_ADDRESS_FORM)
  const [addressEditingId, setAddressEditingId] = useState<string | null>(null)
  const [addressSaving, setAddressSaving] = useState(false)

  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [contactLoading, setContactLoading] = useState(true)
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false)
  const [contactForm, setContactForm] = useState<ContactForm>(EMPTY_CONTACT_FORM)
  const [contactEditingId, setContactEditingId] = useState<string | null>(null)
  const [contactSaving, setContactSaving] = useState(false)

  const [taxProfile, setTaxProfile] = useState<TaxProfile | null>(null)
  const [taxLoading, setTaxLoading] = useState(true)
  const [taxDrawerOpen, setTaxDrawerOpen] = useState(false)
  const [taxForm, setTaxForm] = useState<TaxProfileForm>(EMPTY_TAX_FORM)
  const [taxSaving, setTaxSaving] = useState(false)

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [bankLoading, setBankLoading] = useState(true)
  const [bankDrawerOpen, setBankDrawerOpen] = useState(false)
  const [bankForm, setBankForm] = useState<BankAccountForm>(EMPTY_BANK_FORM)
  const [bankEditingId, setBankEditingId] = useState<string | null>(null)
  const [bankSaving, setBankSaving] = useState(false)

  const { notice, setNotice } = useNotice()

  const apiFetch = useCallback(async (url: string, init?: RequestInit) => {
    const res = await fetch(url, { cache: 'no-store', ...init })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data?.message || '요청을 처리하지 못했습니다.')
    }
    return data
  }, [])

  const loadBasic = useCallback(() => {
    if (!roasteryId) return
    setBasicLoading(true)
    apiFetch(`/api/user/roasteries/${roasteryId}`)
      .then((data) => {
        const mapped: BasicInfo = {
          roasteryId: data?.roasteryId ?? data?.roastery_id ?? roasteryId,
          roasteryName: data?.roasteryName ?? data?.roastery_name ?? '',
          brandName: data?.brandName ?? data?.brand_name ?? '',
          legalName: data?.legalName ?? data?.legal_name ?? '',
          businessRegNo: data?.businessRegNo ?? data?.business_reg_no ?? '',
          representativeName: data?.representativeName ?? data?.representative_name ?? '',
          phone: data?.phone ?? '',
          email: data?.email ?? '',
          status: data?.status ?? '',
          code: data?.code ?? data?.roasteryCode ?? '',
          createdAt: data?.createdAt ?? data?.created_at ?? '',
        }
        setBasicInfo(mapped)
      })
      .catch((err) => setNotice({ type: 'error', message: err.message }))
      .finally(() => setBasicLoading(false))
  }, [apiFetch, roasteryId, setNotice])

  const loadAddresses = useCallback(() => {
    if (!roasteryId) return
    setAddressLoading(true)
    apiFetch(`/api/user/roasteries/${roasteryId}/addresses`)
      .then((data) => {
        const arr = Array.isArray(data?.items) ? data.items : []
        setAddresses(
          arr.map((item: any) => ({
            address_id: String(item.address_id ?? item.addressId ?? ''),
            address_type: item.address_type ?? '',
            address_type_label: item.address_type_label ?? item.addressTypeLabel ?? '',
            site_name: item.site_name ?? '',
            branch_seq_no: item.branch_seq_no ?? '',
            postal_code: item.postal_code ?? '',
            address_line1: item.address_line1 ?? '',
            address_line2: item.address_line2 ?? '',
            created_at: item.created_at ?? '',
          }))
        )
      })
      .catch((err) => setNotice({ type: 'error', message: err.message }))
      .finally(() => setAddressLoading(false))
  }, [apiFetch, roasteryId, setNotice])

  const loadContacts = useCallback(() => {
    if (!roasteryId) return
    setContactLoading(true)
    apiFetch(`/api/user/roasteries/${roasteryId}/contacts`)
      .then((data) => {
        const arr = Array.isArray(data?.items) ? data.items : []
        setContacts(
          arr.map((item: any) => ({
            contact_id: String(item.contact_id ?? item.contactId ?? ''),
            contact_name: item.contact_name ?? item.contactName ?? '',
            position: item.position ?? '',
            phone: item.phone ?? '',
            email: item.email ?? '',
            is_primary: Boolean(item.is_primary ?? item.isPrimary ?? item.primary),
            created_at: item.created_at ?? '',
          }))
        )
      })
      .catch((err) => setNotice({ type: 'error', message: err.message }))
      .finally(() => setContactLoading(false))
  }, [apiFetch, roasteryId, setNotice])

  const loadTaxProfile = useCallback(() => {
    if (!roasteryId) return
    setTaxLoading(true)
    apiFetch(`/api/user/roasteries/${roasteryId}/tax-profile`)
      .then((data) => {
        const profile = data?.data
        if (profile) {
          setTaxProfile({
            tax_profile_id: profile.tax_profile_id ?? profile.taxProfileId ?? '',
            vat_no: profile.vat_no ?? '',
            tax_type: profile.tax_type ?? '',
            invoice_emission: profile.invoice_emission ?? '',
            invoice_email: profile.invoice_email ?? '',
            remarks: profile.remarks ?? '',
            created_at: profile.created_at ?? '',
          })
        } else {
          setTaxProfile(null)
        }
      })
      .catch((err) => setNotice({ type: 'error', message: err.message }))
      .finally(() => setTaxLoading(false))
  }, [apiFetch, roasteryId, setNotice])

  const loadBankAccounts = useCallback(() => {
    if (!roasteryId) return
    setBankLoading(true)
    apiFetch(`/api/user/roasteries/${roasteryId}/bank-accounts`)
      .then((data) => {
        const arr = Array.isArray(data?.items) ? data.items : []
        setBankAccounts(
          arr.map((item: any) => ({
            bank_id: String(item.bank_id ?? item.bankId ?? ''),
            bank_name: item.bank_name ?? '',
            account_no: item.account_no ?? '',
            account_holder: item.account_holder ?? '',
            swift_bic: item.swift_bic ?? '',
            iban: item.iban ?? '',
            currency: item.currency ?? 'KRW',
            is_primary: Boolean(item.is_primary ?? item.primary),
            created_at: item.created_at ?? '',
          }))
        )
      })
      .catch((err) => setNotice({ type: 'error', message: err.message }))
      .finally(() => setBankLoading(false))
  }, [apiFetch, roasteryId, setNotice])

  useEffect(() => {
    if (!roasteryId) return
    loadBasic()
    loadAddresses()
    loadContacts()
    loadTaxProfile()
    loadBankAccounts()
  }, [roasteryId, loadBasic, loadAddresses, loadContacts, loadTaxProfile, loadBankAccounts])

  const handleAddressSubmit = async () => {
    if (!roasteryId) return
    if (!isValidAddress({ postal_code: addressForm.postal_code, address_line1: addressForm.address_line1 })) {
      setNotice({ type: 'error', message: '우편번호와 기본 주소를 입력하세요.' })
      return
    }
    if (addressForm.address_type && addressForm.address_type !== 'HEADQUARTERS') {
      if (!addressForm.branch_seq_no || addressForm.branch_seq_no.length !== 4) {
        setNotice({ type: 'error', message: '종사업장 번호는 숫자 4자리를 입력하세요.' })
        return
      }
    }
    setAddressSaving(true)
    const payload = {
      address_type: addressForm.address_type,
      site_name: addressForm.site_name || undefined,
      branch_seq_no: addressForm.branch_seq_no || undefined,
      postal_code: addressForm.postal_code,
      address_line1: addressForm.address_line1,
      address_line2: addressForm.address_line2 || undefined,
    }
    try {
      const method = addressEditingId ? 'PATCH' : 'POST'
      const url = addressEditingId
        ? `/api/user/roasteries/${roasteryId}/addresses/${addressEditingId}`
        : `/api/user/roasteries/${roasteryId}/addresses`
      await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setNotice({ type: 'success', message: addressEditingId ? '사업장 주소를 수정했습니다.' : '사업장 주소를 등록했습니다.' })
      setAddressForm(EMPTY_ADDRESS_FORM)
      setAddressEditingId(null)
      setAddressDrawerOpen(false)
      loadAddresses()
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message })
    } finally {
      setAddressSaving(false)
    }
  }

  const handleContactSubmit = async () => {
    if (!roasteryId) return
    if (!contactForm.contact_name.trim()) {
      setNotice({ type: 'error', message: '담당자명을 입력하세요.' })
      return
    }
    setContactSaving(true)
    const payload = {
      contact_name: contactForm.contact_name.trim(),
      position: contactForm.position.trim() || undefined,
      phone: contactForm.phone.trim() || undefined,
      email: contactForm.email.trim() || undefined,
      is_primary: contactForm.is_primary,
    }
    try {
      const method = contactEditingId ? 'PATCH' : 'POST'
      const url = contactEditingId
        ? `/api/user/roasteries/${roasteryId}/contacts/${contactEditingId}`
        : `/api/user/roasteries/${roasteryId}/contacts`
      await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setNotice({ type: 'success', message: contactEditingId ? '담당자 정보를 수정했습니다.' : '담당자를 등록했습니다.' })
      setContactForm(EMPTY_CONTACT_FORM)
      setContactEditingId(null)
      setContactDrawerOpen(false)
      loadContacts()
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message })
    } finally {
      setContactSaving(false)
    }
  }

  const handleTaxSubmit = async () => {
    if (!roasteryId) return
    if (!taxForm.vat_no.trim()) {
      setNotice({ type: 'error', message: '사업자등록번호(또는 VAT 번호)를 입력하세요.' })
      return
    }
    setTaxSaving(true)
    const payload = {
      vat_no: taxForm.vat_no.trim(),
      tax_type: taxForm.tax_type.trim() || undefined,
      invoice_emission: taxForm.invoice_emission.trim() || undefined,
      invoice_email: taxForm.invoice_email.trim() || undefined,
      remarks: taxForm.remarks.trim() || undefined,
    }
    try {
      const method = taxProfile?.tax_profile_id ? 'PATCH' : 'POST'
      const url =
        method === 'PATCH'
          ? `/api/user/roasteries/${roasteryId}/tax-profile/${taxProfile?.tax_profile_id}`
          : `/api/user/roasteries/${roasteryId}/tax-profile`
      await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setNotice({ type: 'success', message: taxProfile ? '계산서 정보를 수정했습니다.' : '계산서 정보를 등록했습니다.' })
      setTaxForm(EMPTY_TAX_FORM)
      setTaxDrawerOpen(false)
      loadTaxProfile()
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message })
    } finally {
      setTaxSaving(false)
    }
  }

  const handleBankSubmit = async () => {
    if (!roasteryId) return
    if (!bankForm.bank_name.trim() || !bankForm.account_no.trim() || !bankForm.account_holder.trim()) {
      setNotice({ type: 'error', message: '은행명, 계좌번호, 예금주를 입력하세요.' })
      return
    }
    setBankSaving(true)
    const payload = {
      bank_name: bankForm.bank_name.trim(),
      account_no: bankForm.account_no.trim(),
      account_holder: bankForm.account_holder.trim(),
      swift_bic: bankForm.swift_bic.trim() || undefined,
      iban: bankForm.iban.trim() || undefined,
      currency: bankForm.currency.trim() || 'KRW',
      primary: bankForm.is_primary,
    }
    try {
      const method = bankEditingId ? 'PATCH' : 'POST'
      const url = bankEditingId
        ? `/api/user/roasteries/${roasteryId}/bank-accounts/${bankEditingId}`
        : `/api/user/roasteries/${roasteryId}/bank-accounts`
      await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setNotice({ type: 'success', message: bankEditingId ? '계좌 정보를 수정했습니다.' : '계좌를 등록했습니다.' })
      setBankForm(EMPTY_BANK_FORM)
      setBankEditingId(null)
      setBankDrawerOpen(false)
      loadBankAccounts()
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message })
    } finally {
      setBankSaving(false)
    }
  }

  const resetAddressForm = () => {
    setAddressForm(EMPTY_ADDRESS_FORM)
    setAddressEditingId(null)
  }

  const resetContactForm = () => {
    setContactForm(EMPTY_CONTACT_FORM)
    setContactEditingId(null)
  }

  const resetBankForm = () => {
    setBankForm(EMPTY_BANK_FORM)
    setBankEditingId(null)
  }

  const renderEmptyRow = (message: string, colSpan: number = 6) => (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
        {message}
      </td>
    </tr>
  )

  const actionButtonClass =
    'inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900 dark:border-white/10 dark:text-gray-200 dark:hover:border-white/20 dark:hover:text-white'

  return (
    <>
      <PageHeading
        title="로스터리 상세"
        description="선택한 로스터리의 기본 정보와 사업장/담당자/계좌 정보를 확인하세요."
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '사용자 관리', href: `${base}/user/roasteries` },
          { name: basicInfo?.roasteryName || '로스터리 상세' },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => router.push(`${base}/user/roasteries`)} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            목록으로
          </button>
          {notice ? (
            <div
              className={classNames(
                'rounded-full px-4 py-1.5 text-sm font-medium',
                notice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200'
              )}
            >
              {notice.message}
            </div>
          ) : null}
        </div>

        <section className="space-y-8">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{basicInfo?.roasteryName || '로스터리 기본 정보'}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">등록된 기본 정보를 확인하세요.</p>
              </div>
              {basicInfo?.status ? (
                <span
                  className={classNames(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1',
                    STATUS_TONES[basicInfo.status.toUpperCase()] || STATUS_TONES.ACTIVE
                  )}
                >
                  {basicInfo.status}
                </span>
              ) : null}
            </div>
            <div className="mt-6 grid gap-6 rounded-2xl bg-gray-50/70 p-6 text-sm text-gray-900 ring-1 ring-gray-100 dark:bg-white/5 dark:text-gray-100 dark:ring-white/10 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">로스터리명</p>
                <p className="mt-1 font-semibold">{basicInfo?.roasteryName || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">브랜드명</p>
                <p className="mt-1 font-semibold">{basicInfo?.brandName || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">사업자명(법인명)</p>
                <p className="mt-1 font-semibold">{basicInfo?.legalName || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">사업자등록번호</p>
                <p className="mt-1 font-semibold">{basicInfo?.businessRegNo || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">대표자명</p>
                <p className="mt-1 font-semibold">{basicInfo?.representativeName || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">연락처 / 이메일</p>
                <p className="mt-1 font-semibold">{basicInfo?.phone || '-'} / {basicInfo?.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">로스터리 ID</p>
                <p className="mt-1 font-semibold">{basicInfo?.roasteryId || roasteryId}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">등록일시</p>
                <p className="mt-1 font-semibold">{basicInfo?.createdAt ? formatDateTime(basicInfo.createdAt, locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR') : '-'}</p>
              </div>
            </div>
            {basicLoading && <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">기본 정보를 불러오는 중입니다...</p>}
          </div>

          {/* Address Section */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">사업장 주소 정보</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ROASTERY_SITE / roastery_address</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetAddressForm()
                    setAddressDrawerOpen(true)
                  }}
                  className="btn-register"
                >
                  <PlusIcon className="size-4" aria-hidden="true" />
                  사업장 등록
                </button>
                <button type="button" onClick={loadAddresses} className={actionButtonClass}>
                  새로고침
                </button>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-white/10">
              <div className="max-h-[420px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                  <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                    <tr>
                      <th scope="col" className="px-4 py-3 sm:px-6">주소 유형</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">사업장명</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">종사업장번호</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">주소</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">등록일</th>
                      <th scope="col" className="px-4 py-3 text-right sm:px-6">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {addresses.length === 0
                      ? renderEmptyRow('등록된 사업장 주소 정보가 없습니다.', 6)
                      : addresses.map((address) => (
                          <tr key={address.address_id} className="bg-white dark:bg-gray-900/40">
                            <td className="px-4 py-4 font-semibold sm:px-6">{address.address_type_label || address.address_type || '-'}</td>
                            <td className="px-4 py-4 sm:px-6">{address.site_name || '-'}</td>
                            <td className="px-4 py-4 sm:px-6">{address.branch_seq_no || '-'}</td>
                            <td className="px-4 py-4 sm:px-6">
                              <p className="text-sm text-gray-900 dark:text-gray-100">{address.address_line1 || '-'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{address.address_line2 || ''}</p>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 sm:px-6">
                              {formatDateTime(address.created_at, locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR')}
                            </td>
                            <td className="px-4 py-4 text-right sm:px-6">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddressEditingId(address.address_id)
                                    setAddressForm({
                                      address_type: address.address_type,
                                      site_name: address.site_name,
                                      branch_seq_no: address.branch_seq_no,
                                      postal_code: address.postal_code,
                                      address_line1: address.address_line1,
                                      address_line2: address.address_line2,
                                    })
                                    setAddressDrawerOpen(true)
                                  }}
                                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!confirm('선택한 사업장 주소를 삭제하시겠습니까?')) return
                                    try {
                                      await apiFetch(`/api/user/roasteries/${roasteryId}/addresses/${address.address_id}`, { method: 'DELETE' })
                                      setNotice({ type: 'success', message: '사업장 주소를 삭제했습니다.' })
                                      loadAddresses()
                                    } catch (err: any) {
                                      setNotice({ type: 'error', message: err.message })
                                    }
                                  }}
                                  className="text-xs font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-300"
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
              {addressLoading && <p className="border-t border-gray-100 px-6 py-4 text-sm text-gray-500 dark:border-white/5 dark:text-gray-400">사업장 주소를 불러오는 중입니다...</p>}
            </div>
          </div>

          {/* Contact Section */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">담당자 정보</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ROASTERY_CONTACT</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetContactForm()
                    setContactDrawerOpen(true)
                  }}
                  className="btn-register"
                >
                  <PlusIcon className="size-4" aria-hidden="true" />
                  담당자 등록
                </button>
                <button type="button" onClick={loadContacts} className={actionButtonClass}>
                  새로고침
                </button>
              </div>
            </div>
            
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-white/10">
              <div className="max-h-[420px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                  <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                    <tr>
                      <th scope="col" className="px-4 py-3 sm:px-6">담당자</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">직책</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">연락처</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">이메일</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">대표 여부</th>
                      <th scope="col" className="px-4 py-3 text-right sm:px-6">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {contacts.length === 0
                      ? renderEmptyRow('등록된 담당자 정보가 없습니다.', 6)
                      : contacts.map((contact) => (
                          <tr key={contact.contact_id} className="bg-white dark:bg-gray-900/40">
                            <td className="px-4 py-4 font-semibold sm:px-6">{contact.contact_name || '-'}</td>
                            <td className="px-4 py-4 sm:px-6">{contact.position || '-'}</td>
                            <td className="px-4 py-4 sm:px-6">{formatPhoneNumber(contact.phone)}</td>
                            <td className="px-4 py-4 sm:px-6">{contact.email || '-'}</td>
                            <td className="px-4 py-4 sm:px-6">
                              {contact.is_primary ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                                  대표
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right sm:px-6">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactEditingId(contact.contact_id)
                                    setContactForm({
                                      contact_name: contact.contact_name,
                                      position: contact.position,
                                      phone: contact.phone,
                                      email: contact.email,
                                      is_primary: contact.is_primary,
                                    })
                                    setContactDrawerOpen(true)
                                  }}
                                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!confirm('선택한 담당자 정보를 삭제하시겠습니까?')) return
                                    try {
                                      await apiFetch(`/api/user/roasteries/${roasteryId}/contacts/${contact.contact_id}`, { method: 'DELETE' })
                                      setNotice({ type: 'success', message: '담당자 정보를 삭제했습니다.' })
                                      loadContacts()
                                    } catch (err: any) {
                                      setNotice({ type: 'error', message: err.message })
                                    }
                                  }}
                                  className="text-xs font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-300"
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
              {contactLoading && <p className="border-t border-gray-100 px-6 py-4 text-sm text-gray-500 dark:border-white/5 dark:text-gray-400">담당자 정보를 불러오는 중입니다...</p>}
            </div>
          </div>

          {/* Tax Profile Section */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">계산서 정보</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ROASTERY_TAX_PROFILE</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTaxForm(
                      taxProfile
                        ? {
                            vat_no: taxProfile.vat_no,
                            tax_type: taxProfile.tax_type,
                            invoice_emission: taxProfile.invoice_emission,
                            invoice_email: taxProfile.invoice_email,
                            remarks: taxProfile.remarks,
                          }
                        : EMPTY_TAX_FORM
                    )
                    setTaxDrawerOpen(true)
                  }}
                  className="btn-register"
                >
                  <PlusIcon className="size-4" aria-hidden="true" />
                  {taxProfile ? '계산서 정보 수정' : '계산서 정보 등록'}
                </button>
                <button type="button" onClick={loadTaxProfile} className={actionButtonClass}>
                  새로고침
                </button>
              </div>
            </div>
            {taxProfile ? (
              <dl className="mt-6 grid gap-4 rounded-2xl bg-gray-50/70 p-6 text-sm ring-1 ring-gray-100 dark:bg-white/5 dark:text-gray-100 dark:ring-white/10 md:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">VAT 번호</dt>
                  <dd className="mt-1 font-semibold">{taxProfile.vat_no || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">세금 유형</dt>
                  <dd className="mt-1 font-semibold">{taxProfile.tax_type || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">계산서 발행 방식</dt>
                  <dd className="mt-1 font-semibold">{taxProfile.invoice_emission || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">수신 이메일</dt>
                  <dd className="mt-1 font-semibold">{taxProfile.invoice_email || '-'}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">비고</dt>
                  <dd className="mt-1 font-semibold">{taxProfile.remarks || '-'}</dd>
                </div>
              </dl>
            ) : (
              !taxLoading && (
                <p className="mt-6 rounded-2xl bg-gray-50/70 p-6 text-sm text-gray-500 ring-1 ring-dashed ring-gray-200 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10">
                  등록된 계산서 정보가 없습니다.
                </p>
              )
            )}
            {taxLoading && <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">계산서 정보를 불러오는 중입니다...</p>}
          </div>
          {/* Bank Account Section */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">계좌 정보</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ROASTERY_BANK_ACCOUNT</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetBankForm()
                    setBankDrawerOpen(true)
                  }}
                  className="btn-register"
                >
                  <PlusIcon className="size-4" aria-hidden="true" />
                  계좌 등록
                </button>
                <button type="button" onClick={loadBankAccounts} className={actionButtonClass}>
                  새로고침
                </button>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-white/10">
              <div className="max-h-[420px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                  <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                    <tr>
                      <th scope="col" className="px-4 py-3 sm:px-6">은행</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">계좌번호</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">예금주</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">통화</th>
                      <th scope="col" className="px-4 py-3 sm:px-6">대표 여부</th>
                      <th scope="col" className="px-4 py-3 text-right sm:px-6">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {bankAccounts.length === 0
                      ? renderEmptyRow('등록된 계좌 정보가 없습니다.', 6)
                      : bankAccounts.map((account) => (
                          <tr key={account.bank_id} className="bg-white dark:bg-gray-900/40">
                            <td className="px-4 py-4 font-semibold sm:px-6">
                              <p>{account.bank_name || '-'}</p>
                              {account.swift_bic ? <p className="text-xs text-gray-500 dark:text-gray-400">SWIFT: {account.swift_bic}</p> : null}
                            </td>
                            <td className="px-4 py-4 sm:px-6">{account.account_no || '-'}</td>
                            <td className="px-4 py-4 sm:px-6">{account.account_holder || '-'}</td>
                            <td className="px-4 py-4 sm:px-6">{account.currency || 'KRW'}</td>
                            <td className="px-4 py-4 sm:px-6">
                              {account.is_primary ? (
                                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                                  대표
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right sm:px-6">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBankEditingId(account.bank_id)
                                    setBankForm({
                                      bank_name: account.bank_name,
                                      account_no: account.account_no,
                                      account_holder: account.account_holder,
                                      swift_bic: account.swift_bic,
                                      iban: account.iban,
                                      currency: account.currency,
                                      is_primary: account.is_primary,
                                    })
                                    setBankDrawerOpen(true)
                                  }}
                                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!confirm('선택한 계좌 정보를 삭제하시겠습니까?')) return
                                    try {
                                      await apiFetch(`/api/user/roasteries/${roasteryId}/bank-accounts/${account.bank_id}`, { method: 'DELETE' })
                                      setNotice({ type: 'success', message: '계좌 정보를 삭제했습니다.' })
                                      loadBankAccounts()
                                    } catch (err: any) {
                                      setNotice({ type: 'error', message: err.message })
                                    }
                                  }}
                                  className="text-xs font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-300"
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
              {bankLoading && <p className="border-t border-gray-100 px-6 py-4 text-sm text-gray-500 dark:border-white/5 dark:text-gray-400">계좌 정보를 불러오는 중입니다...</p>}
            </div>
          </div>
        </section>
      </div>

      <SlideOver
        open={addressDrawerOpen}
        title={addressEditingId ? '사업장 수정' : '사업장 등록'}
        description="사업장 주소 및 종사업장 정보를 입력하세요."
        submitting={addressSaving}
        onClose={() => {
          setAddressDrawerOpen(false)
          resetAddressForm()
        }}
        onSubmit={(event) => {
          event.preventDefault()
          handleAddressSubmit()
        }}
        submitLabel={addressEditingId ? '사업장 수정' : '사업장 등록'}
      >
        <div className="space-y-6">
          <AddressSearchFields value={addressForm} onChange={setAddressForm} label="사업장 주소" />
        </div>
      </SlideOver>

      <SlideOver
        open={contactDrawerOpen}
        title={contactEditingId ? '담당자 수정' : '담당자 등록'}
        description="로스터리 담당자 연락처 정보를 입력하세요."
        submitting={contactSaving}
        onClose={() => {
          setContactDrawerOpen(false)
          resetContactForm()
        }}
        onSubmit={(event) => {
          event.preventDefault()
          handleContactSubmit()
        }}
        submitLabel={contactEditingId ? '담당자 수정' : '담당자 등록'}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">담당자명 *</label>
            <input
              required
              value={contactForm.contact_name}
              onChange={(e) => setContactForm((prev) => ({ ...prev, contact_name: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">직책</label>
            <input
              value={contactForm.position}
              onChange={(e) => setContactForm((prev) => ({ ...prev, position: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">전화번호</label>
            <input
              value={contactForm.phone}
              onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="예: 010-0000-0000"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">이메일</label>
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="contact@example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <input
                type="checkbox"
                checked={contactForm.is_primary}
                onChange={(e) => setContactForm((prev) => ({ ...prev, is_primary: e.target.checked }))}
                className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              대표 담당자로 지정
            </label>
          </div>
        </div>
      </SlideOver>

      <SlideOver
        open={taxDrawerOpen}
        title={taxProfile ? '계산서 정보 수정' : '계산서 정보 등록'}
        description="계산서 발행을 위한 기본 정보를 입력하세요."
        submitting={taxSaving}
        onClose={() => {
          setTaxDrawerOpen(false)
          setTaxForm(EMPTY_TAX_FORM)
        }}
        onSubmit={(event) => {
          event.preventDefault()
          handleTaxSubmit()
        }}
        submitLabel={taxProfile ? '계산서 정보 수정' : '계산서 정보 등록'}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">VAT 번호 *</label>
            <input
              required
              value={taxForm.vat_no}
              onChange={(e) => setTaxForm((prev) => ({ ...prev, vat_no: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">세금 유형</label>
            <input
              value={taxForm.tax_type}
              onChange={(e) => setTaxForm((prev) => ({ ...prev, tax_type: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="예: 일반과세"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">계산서 발행 방식</label>
            <input
              value={taxForm.invoice_emission}
              onChange={(e) => setTaxForm((prev) => ({ ...prev, invoice_emission: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">수신 이메일</label>
            <input
              type="email"
              value={taxForm.invoice_email}
              onChange={(e) => setTaxForm((prev) => ({ ...prev, invoice_email: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">비고</label>
            <textarea
              rows={3}
              value={taxForm.remarks}
              onChange={(e) => setTaxForm((prev) => ({ ...prev, remarks: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>
      </SlideOver>

      <SlideOver
        open={bankDrawerOpen}
        title={bankEditingId ? '계좌 정보 수정' : '계좌 등록'}
        description="정산을 위한 계좌 정보를 입력하세요."
        submitting={bankSaving}
        onClose={() => {
          setBankDrawerOpen(false)
          resetBankForm()
        }}
        onSubmit={(event) => {
          event.preventDefault()
          handleBankSubmit()
        }}
        submitLabel={bankEditingId ? '계좌 정보 수정' : '계좌 등록'}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">은행명 *</label>
            <input
              required
              value={bankForm.bank_name}
              onChange={(e) => setBankForm((prev) => ({ ...prev, bank_name: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">계좌번호 *</label>
            <input
              required
              value={bankForm.account_no}
              onChange={(e) => setBankForm((prev) => ({ ...prev, account_no: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">예금주 *</label>
            <input
              required
              value={bankForm.account_holder}
              onChange={(e) => setBankForm((prev) => ({ ...prev, account_holder: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">통화</label>
            <input
              value={bankForm.currency}
              onChange={(e) => setBankForm((prev) => ({ ...prev, currency: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="예: KRW"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">SWIFT / BIC</label>
            <input
              value={bankForm.swift_bic}
              onChange={(e) => setBankForm((prev) => ({ ...prev, swift_bic: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">IBAN</label>
            <input
              value={bankForm.iban}
              onChange={(e) => setBankForm((prev) => ({ ...prev, iban: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <input
                type="checkbox"
                checked={bankForm.is_primary}
                onChange={(e) => setBankForm((prev) => ({ ...prev, is_primary: e.target.checked }))}
                className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              대표 계좌로 설정
            </label>
          </div>
        </div>
      </SlideOver>
    </>
  )
}

