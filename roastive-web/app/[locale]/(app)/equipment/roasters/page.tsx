/* eslint-disable react/no-array-index-key */
'use client'

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { EquipmentCards, type EquipmentCardItem } from '@/components/EquipmentCards'
import { PageHeading } from '@/components/PageHeading'
import { useAuth } from '@/components/auth/AuthProvider'
import { useSessionGuard } from '@/lib/useSessionGuard'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid'

type MasterForm = {
  roasterName: string
  manufacturer: string
  model: string
  serialNumber: string
  capacityKg: string
  fuelType: string
  installDate: string
  status: string
  manager?: string
  lastInspection?: string
}

type LocationForm = {
  zone: string
  floor: string
  area: string
  coordinates: string
  ventilation: string
}

type SpecForm = {
  heatingType: string
  burnerCount: string
  sensorPackage: string
  power: string
  notes: string
  lastSync?: string
}

type StatusLog = {
  timestamp: string
  title: string
  message: string
  tone: 'success' | 'warning' | 'danger' | 'muted'
}

type RoasterRecord = {
  id: string
  roasteryId: string
  master: MasterForm & { lastInspection?: string; manager?: string }
  location: LocationForm
  spec: SpecForm & { lastSync?: string }
}

const STATUS_OPTIONS = [
  { value: 'OPERATIONAL', label: '가동중' },
  { value: 'STANDBY', label: '대기중' },
  { value: 'MAINTENANCE', label: '점검중' },
  { value: 'INACTIVE', label: '일시중지' },
]

const HEATING_TYPES = [
  { value: 'GAS', label: '가스 직화' },
  { value: 'HOT_AIR', label: '열풍' },
  { value: 'HYBRID', label: '하이브리드' },
  { value: 'INFRARED', label: '적외선' },
]

const MOCK_STATUS_LOGS: StatusLog[] = [
  { timestamp: '2025-11-18 07:42', title: '데이터 동기화', message: 'IoT 모듈 상태값을 수집했습니다.', tone: 'success' },
  { timestamp: '2025-11-10 16:05', title: '예방 점검', message: '버너 압력 센서 값이 기준치를 벗어났습니다.', tone: 'warning' },
  { timestamp: '2025-11-02 13:21', title: '알림', message: '로스터기 유지보수 일정이 필요합니다.', tone: 'muted' },
]

const initialMaster: MasterForm = {
  roasterName: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  capacityKg: '',
  fuelType: '가스',
  installDate: '',
  status: 'OPERATIONAL',
  manager: '',
  lastInspection: '',
}

const initialLocation: LocationForm = {
  zone: '',
  floor: '',
  area: '',
  coordinates: '',
  ventilation: '',
}

const initialSpec: SpecForm = {
  heatingType: 'GAS',
  burnerCount: '',
  sensorPackage: '',
  power: '',
  notes: '',
  lastSync: '',
}

const statusLogIconVariants: Record<
  StatusLog['tone'],
  { className: string; Icon: React.ComponentType<React.ComponentProps<'svg'>> }
> = {
  success: {
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30',
    Icon: CheckCircleIcon,
  },
  warning: {
    className: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30',
    Icon: ExclamationTriangleIcon,
  },
  danger: {
    className: 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30',
    Icon: ExclamationCircleIcon,
  },
  muted: {
    className: 'bg-gray-100 text-gray-500 ring-gray-200 dark:bg-gray-500/10 dark:text-gray-200 dark:ring-gray-500/30',
    Icon: ClockIcon,
  },
}

const STATUS_TONE_MAP: Record<string, NonNullable<EquipmentCardItem['status']>['tone']> = {
  OPERATIONAL: 'success',
  STANDBY: 'brand',
  MAINTENANCE: 'warning',
  INACTIVE: 'muted',
}

const ROSTER_CACHE_PREFIX = 'roastive:roaster:list:'

const readRoasterCache = (roasteryId: string): RoasterRecord[] | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(`${ROSTER_CACHE_PREFIX}${roasteryId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed
  } catch (error) {
    console.warn('로스터기 캐시를 불러오지 못했습니다.', error)
    return null
  }
}

const writeRoasterCache = (roasteryId: string, records: RoasterRecord[]) => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(`${ROSTER_CACHE_PREFIX}${roasteryId}`, JSON.stringify(records))
  } catch (error) {
    console.warn('로스터기 캐시를 저장하지 못했습니다.', error)
  }
}

export default function RoasterManagementPage({ params }: { params: { locale: string } }) {
  useSessionGuard(1000 * 60 * 5)
  const { user } = useAuth()
  const dashboardHref = `/${params.locale}/dashboard`
  const [records, setRecords] = useState<RoasterRecord[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [masterForm, setMasterForm] = useState<MasterForm>(initialMaster)
  const [locationForm, setLocationForm] = useState<LocationForm>(initialLocation)
  const [specForm, setSpecForm] = useState<SpecForm>(initialSpec)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<string | null>(null)

  const roasterySource = (user?.roasteries?.[0] ?? null) as any
  const roasteryId = useMemo(() => {
    if (!roasterySource) return ''
    return String(roasterySource.roastery_id ?? roasterySource.id ?? '')
  }, [roasterySource])

  useEffect(() => {
    setHydrated(true)
  }, [])

  const resetDrawer = useCallback(() => {
    setMasterForm(initialMaster)
    setLocationForm(initialLocation)
    setSpecForm(initialSpec)
    setError(null)
  }, [])

  const handleOpenDrawer = () => {
    setMode('create')
    setEditingId(null)
    resetDrawer()
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    if (submitting) return
    setDrawerOpen(false)
  }

  const handleMasterChange = (field: keyof MasterForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value } = event.target
    setMasterForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleLocationChange = (field: keyof LocationForm) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setLocationForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSpecChange = (field: keyof SpecForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { value } = event.target
    setSpecForm((prev) => ({ ...prev, [field]: value }))
  }

  const convertToCardItem = useCallback(
    (master: MasterForm, location: LocationForm, spec: SpecForm, identifier?: string): EquipmentCardItem => {
      const heatingLabel = HEATING_TYPES.find((opt) => opt.value === spec.heatingType)?.label || spec.heatingType || '-'
      return {
        id: identifier || `roaster-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: master.roasterName || '새 로스터기',
        code: master.serialNumber || '신규',
        description: `${master.manufacturer || '제조사 미확인'} ${master.model || ''}`.trim(),
        area: location.area || location.zone || '배치 위치 미지정',
        initials: master.roasterName ? master.roasterName.slice(0, 2).toUpperCase() : 'NR',
        status: {
          label: STATUS_OPTIONS.find((opt) => opt.value === master.status)?.label || '확인필요',
          tone: STATUS_TONE_MAP[master.status] || 'brand',
        },
        attributes: [
          { label: '배치 용량', value: master.capacityKg ? `${master.capacityKg} kg` : '-' },
          { label: '연료', value: master.fuelType || '-' },
          { label: '설치일', value: master.installDate || '-' },
          { label: '위치', value: location.area || `${location.floor || ''} ${location.zone || ''}`.trim() || '-' },
          { label: '담당자', value: master.manager || '-' },
          { label: '최근 점검', value: master.lastInspection || '-' },
          { label: '가열 방식', value: heatingLabel },
          { label: 'IoT 동기화', value: spec.lastSync || '-' },
        ],
      }
    },
    []
  )
  const cards = useMemo(
    () => (hydrated ? records : []).map((record) => convertToCardItem(record.master, record.location, record.spec, record.id)),
    [hydrated, records, convertToCardItem]
  )
  const registeredCount = hydrated ? records.length : 0

  useEffect(() => {
    if (!roasteryId) {
      setRecords([])
      return
    }
    const cached = readRoasterCache(roasteryId)
    if (cached?.length) {
      setRecords(cached)
    }
  }, [roasteryId])

  useEffect(() => {
    const controller = new AbortController()
    setListLoading(true)
    setListError(null)
    const query = roasteryId ? `?roasteryId=${encodeURIComponent(roasteryId)}` : ''
    fetch(`/api/equipment/roasters${query}`, { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data?.message || '로스터기 목록을 불러오지 못했습니다.')
        }
        const recordsRaw = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
        const normalized = (recordsRaw as any[]).map((record: any, index: number) => ({
          id: String(record.id ?? record.master?.serialNumber ?? `roaster-${index}`),
          roasteryId: String(record.roasteryId ?? roasteryId ?? ''),
          master: { ...initialMaster, ...record.master },
          location: { ...initialLocation, ...record.location },
          spec: { ...initialSpec, ...record.spec },
        }))
        setRecords(normalized)
        if (roasteryId) writeRoasterCache(roasteryId, normalized)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setListError(err?.message || '로스터기 목록을 불러오지 못했습니다.')
        setRecords([])
      })
      .finally(() => setListLoading(false))
    return () => controller.abort()
  }, [roasteryId, convertToCardItem])

  const handleViewRecord = useCallback(
    (recordId: string) => {
      const target = records.find((record) => record.id === recordId)
      if (!target) return
      setMode('edit')
      setEditingId(recordId)
      setMasterForm({ ...initialMaster, ...target.master })
      setLocationForm({ ...initialLocation, ...target.location })
      setSpecForm({ ...initialSpec, ...target.spec })
      setError(null)
      setDrawerOpen(true)
    },
    [records]
  )

  const handleDeleteRecord = useCallback(
    async (recordId: string) => {
      const target = records.find((record) => record.id === recordId)
      if (!target) return
      if (typeof window !== 'undefined') {
        const confirmed = window.confirm(`"${target.master.roasterName}" 로스터기를 삭제하시겠습니까?`)
        if (!confirmed) return
      }
      try {
        const res = await fetch('/api/equipment/roasters', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: recordId }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.message || '로스터기를 삭제하지 못했습니다.')
        }
        setRecords((prev) => {
          const next = prev.filter((record) => record.id !== recordId)
          if (roasteryId) writeRoasterCache(roasteryId, next)
          return next
        })
      } catch (err: any) {
        if (typeof window !== 'undefined') {
          window.alert(err?.message || '로스터기를 삭제하지 못했습니다.')
        }
      }
    },
    [records, roasteryId]
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!roasteryId) {
      setError('로스터리 정보를 확인할 수 없습니다.')
      return
    }
    setSubmitting(true)
    setError(null)
    const payload = {
      id: editingId,
      roasteryId,
      master: masterForm,
      location: locationForm,
      spec: specForm,
    }
    try {
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const res = await fetch('/api/equipment/roasters', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || '로스터기를 등록하지 못했습니다.')
      }
      const backendEntity = data?.data ?? data
      const backendId = backendEntity?.roasterId ?? backendEntity?.id ?? null
      const effectiveId = typeof backendId === 'string' && backendId ? backendId : editingId || masterForm.serialNumber || `roaster-${Date.now()}`

      if (mode === 'edit' && editingId) {
        setRecords((prev) => {
          const next = prev.map((record) =>
            record.id === editingId
              ? {
                  ...record,
                  id: effectiveId,
                  master: { ...masterForm },
                  location: { ...locationForm },
                  spec: { ...specForm },
                }
              : record
          )
          if (roasteryId) writeRoasterCache(roasteryId, next)
          return next
        })
      } else {
        const newRecord: RoasterRecord = {
          id: effectiveId,
          roasteryId,
          master: { ...masterForm },
          location: { ...locationForm },
          spec: { ...specForm },
        }
        setRecords((prev) => {
          const next = [...prev, newRecord]
          if (roasteryId) writeRoasterCache(roasteryId, next)
          return next
        })
      }
      setDrawerOpen(false)
      resetDrawer()
      setMode('create')
      setEditingId(null)
    } catch (err: any) {
      setError(err?.message || '로스터기를 등록하지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hydrated) {
    return (
      <div className="space-y-4 px-4 py-10 text-sm text-gray-500 dark:text-gray-300">
        <div className="h-5 w-40 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-32 animate-pulse rounded-3xl border border-dashed border-gray-200 dark:border-white/10" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeading
        title="로스터기 관리"
        description="설비별 상태와 점검 이력을 한눈에 확인하고 유지보수 이력을 확인하세요."
        meta={<p className="text-sm text-gray-500 dark:text-gray-400">총 {registeredCount}대 등록</p>}
        actions={
          <button
            type="button"
            onClick={handleOpenDrawer}
            className="inline-flex size-11 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-white/10 dark:text-gray-200 dark:hover:border-white/30 dark:hover:text-white dark:focus-visible:outline-white/40"
          >
            <span className="sr-only">로스터기 추가</span>
            <PlusIcon aria-hidden="true" className="size-5" />
          </button>
        }
        breadcrumbs={[
          { name: '홈', href: dashboardHref },
          { name: '기기 관리' },
          { name: '로스터기 관리' },
        ]}
      />
      <section className="px-4 sm:px-6 lg:px-8">
        {listError ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {listError}
          </div>
        ) : null}
        {!hydrated || listLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-300">
            로스터기 정보를 불러오는 중입니다...
          </div>
        ) : (
          <EquipmentCards
            items={cards}
            onView={(item) => handleViewRecord(item.id)}
            onDelete={(item) => handleDeleteRecord(item.id)}
            emptyMessage="등록된 로스터기가 없습니다."
          />
        )}
        <div className="mt-8 rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-5 text-sm text-gray-600 shadow-sm dark:border-white/10 dark:bg-gray-900/40 dark:text-gray-300">
          <p className="font-semibold text-gray-900 dark:text-white">아래의 기능이 업데이트 될 예정입니다.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>로스터기 유지보수 내역 및 스케줄 관리</li>
            <li>로스터기 센서 관리</li>
          </ul>
        </div>
      </section>

      <SlideOver
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSubmit={handleSubmit}
        submitting={submitting}
        title={mode === 'edit' ? '로스터기 수정' : '로스터기 등록'}
        description=""
        submitLabel={mode === 'edit' ? '수정' : '등록'}
      >
        <div className="space-y-6">
          {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">{error}</p> : null}

          <FormCard title="기본정보">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="로스터기명" value={masterForm.roasterName} onChange={handleMasterChange('roasterName')} placeholder="예: Loring S35" required />
              <TextField label="제조사" value={masterForm.manufacturer} onChange={handleMasterChange('manufacturer')} placeholder="예: Loring" required />
              <TextField label="모델명" value={masterForm.model} onChange={handleMasterChange('model')} placeholder="예: S35 Kestrel" required />
              <TextField label="시리얼 번호" value={masterForm.serialNumber} onChange={handleMasterChange('serialNumber')} placeholder="공급사 제공 시리얼" required />
              <TextField label="배치 용량 (kg)" value={masterForm.capacityKg} onChange={handleMasterChange('capacityKg')} placeholder="예: 35" inputMode="decimal" />
              <TextField label="연료 타입" value={masterForm.fuelType} onChange={handleMasterChange('fuelType')} placeholder="예: 가스" />
              <TextField label="설치일" type="date" value={masterForm.installDate} onChange={handleMasterChange('installDate')} />
              <SelectField label="운영 상태" value={masterForm.status} onChange={handleMasterChange('status')} options={STATUS_OPTIONS} />
            </div>
          </FormCard>

          <FormCard title="동작 로그">
            <p className="text-sm text-gray-500 dark:text-gray-400"></p>
            <div className="mt-6 flow-root">
              <ul role="list" className="-mb-8">
                {MOCK_STATUS_LOGS.map((log, index) => {
                  const variant = statusLogIconVariants[log.tone]
                  const Icon = variant.Icon
                  return (
                    <li key={`${log.timestamp}-${index}`}>
                      <div className="relative pb-8">
                        {index !== MOCK_STATUS_LOGS.length - 1 ? (
                          <span className="absolute left-5 top-5 -ml-px h-full w-px bg-gray-200 dark:bg-white/10" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex items-start gap-4">
                          <span className={`flex size-10 items-center justify-center rounded-full ring-1 ring-inset ${variant.className}`}>
                            <Icon className="size-5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.title}</p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{log.message}</p>
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{log.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </FormCard>

        </div>
      </SlideOver>
    </div>
  )
}

type TextFieldProps = {
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  className?: string
  required?: boolean
}

function TextField({ label, value, onChange, placeholder, type = 'text', inputMode, className, required }: TextFieldProps) {
  return (
    <label className={`block text-sm font-medium text-gray-900 dark:text-gray-200 ${className ?? ''}`}>
      {label}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        required={required}
        className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </label>
  )
}

type TextareaFieldProps = {
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
  className?: string
}

function TextareaField({ label, value, onChange, rows = 3, className }: TextareaFieldProps) {
  return (
    <label className={`block text-sm font-medium text-gray-900 dark:text-gray-200 ${className ?? ''}`}>
      {label}
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </label>
  )
}

type SelectFieldProps = {
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
      {label}
      <select
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

type FormCardProps = {
  title: string
  children: ReactNode
}

function FormCard({ title, children }: FormCardProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900/40">
      <div className="border-b border-gray-100 px-4 py-3 dark:border-white/5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="px-4 py-4 sm:px-6 sm:py-6">{children}</div>
    </section>
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
                        className="rounded p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-300"
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
                        className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
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
