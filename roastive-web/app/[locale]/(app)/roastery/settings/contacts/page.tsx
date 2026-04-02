'use client'

import SettingsNav from '@/components/SettingsNav'
import ContactCardList from '@/app/[locale]/(app)/roastery/settings/contacts/ContactCardList'
import ConfirmDialog from '@/components/ConfirmDialog'
import { AlertDialog } from '@/components/AlertDialog'
import { PageHeading } from '@/components/PageHeading'
import { FormRow } from '@/components/FormRow'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { phoneKrSchema, emailSchema, formatKoreanPhone } from '@roastive/validation'
import { useSessionGuard } from '@/lib/useSessionGuard'
import { isValidTelephone, isValidMobile } from '@/lib/validators'

function classNames(...classes: string[]) { return classes.filter(Boolean).join(' ') }

type Contact = { contact_id: string; contact_name: string; position?: string|null; phone?: string|null; email?: string|null; is_primary: boolean }

export default function RoasteryContactsPage() {
  useSessionGuard(1000 * 60 * 5)
  const pathname = usePathname() || '/ko'
  const seg = pathname.split('/').filter(Boolean)
  const locale = (seg[0] === 'en' || seg[0] === 'ja' || seg[0] === 'ko') ? seg[0] : 'ko'
  const base = `/${locale}`
  const [items, setItems] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showBasicInfoAlert, setShowBasicInfoAlert] = useState(false)
  const [alertDialog, setAlertDialog] = useState<{ title?: string; message: string } | null>(null)
  const schema = z.object({
    contact_name: z.string().min(1, '이름은 필수입니다.'),
    position: z.string().optional(),
    phone: phoneKrSchema.optional().or(z.literal('')),
    email: emailSchema.optional().or(z.literal('')),
    is_primary: z.boolean().optional(),
  })
  type FormValues = z.infer<typeof schema>
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { contact_name: '', position: '', phone: '', email: '', is_primary: false },
  })

  const refresh = () => {
    setLoading(true)
    fetch('/api/roastery/contacts', { cache: 'no-store', credentials: 'include' as RequestCredentials })
      .then(async (r) => {
        if (r.status === 401) throw new Error('AUTH')
        const j = await r.json().catch(() => ({}))
        setItems(Array.isArray(j.items) ? j.items : [])
      })
      .catch(async (e) => {
        if (String(e?.message) === 'AUTH') {
          // Try to prime cookies (roastery_id) and re-check auth
          const pre = await fetch('/api/roastery/settings', { cache: 'no-store', credentials: 'include' as RequestCredentials })
          if (pre.status === 401) {
            // not logged in
            setItems([])
          } else {
            // retry
            return refresh()
          }
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // 로스터리 기본정보 확인
    fetch('/api/roastery/settings', { cache: 'no-store', credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        const hasBasicInfo = data?.legal_name || data?.business_reg_no
        if (!hasBasicInfo) {
          setShowBasicInfoAlert(true)
        }
      })
      .catch(() => {})
    refresh()
  }, [])

  const onSubmit = async (v: any) => {
    // 전화/휴대전화 간단 검증 (하나라도 형식 유효하면 통과)
    if (v.phone && !(isValidTelephone(v.phone) || isValidMobile(v.phone))) {
      setAlertDialog({ title: '알림', message: '유효한 전화번호 형식이 아닙니다.' })
      return
    }
    const url = editingId ? `/api/roastery/contacts/${editingId}` : '/api/roastery/contacts'
    const method = editingId ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(v) as any })
    if (res.status === 401) {
      // Try preflight then notify
      const pre = await fetch('/api/roastery/settings', { cache: 'no-store', credentials: 'include' })
      if (pre.status === 401) {
        setAlertDialog({ title: '알림', message: '로그인이 필요합니다. 다시 로그인 후 시도해주세요.' })
        return
      }
    }
    if (res.ok) { reset(); setEditingId(null); refresh() }
  }

  return (
    <>
      <PageHeading
        title="담당자 관리"
        description="대표/실무 연락처를 관리하세요"
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '로스터리 관리', href: `${base}/roastery/settings` },
          { name: '담당자 관리' },
        ]}
      />
      <SettingsNav />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <section className="space-y-10">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
              <div>
                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">담당자 관리</h2>
                <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">대표/실무 연락처를 관리하세요</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-2 space-y-8">
            <FormRow label="이름" htmlFor="contact_name">
              <div className="space-y-2">
                <input
                  id="contact_name"
                  className="w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                  {...register('contact_name')}
                />
                {errors.contact_name && <p className="text-sm text-red-600">{errors.contact_name.message as string}</p>}
              </div>
            </FormRow>
            <FormRow label="직책/직무" htmlFor="position">
              <input
                id="position"
                className="w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                {...register('position')}
              />
            </FormRow>
            <FormRow label="연락처" htmlFor="phone">
              <div className="space-y-2">
                <input
                  id="phone"
                  className="w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                  {...register('phone', { onChange: (e) => { e.target.value = formatKoreanPhone(e.target.value) } })}
                />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message as string}</p>}
              </div>
            </FormRow>
            <FormRow label="이메일" htmlFor="email">
              <div className="space-y-2">
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message as string}</p>}
              </div>
            </FormRow>
            <FormRow label="대표 연락처 지정">
              <label className="inline-flex items-center gap-2 text-sm/6 text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register('is_primary')} /> 대표 연락처로 지정
              </label>
            </FormRow>
            <div className="flex justify-end">
              <button className="btn-register">
                {editingId ? '담당자 수정' : '담당자 등록'}
              </button>
            </div>
              </form>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
              <div>
                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">담당자 목록</h2>
                <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">등록된 담당자 목록</p>
              </div>
              <div className="md:col-span-2">
            <ContactCardList
              items={items.map((c) => ({ id: c.contact_id, title: c.contact_name, subtitle: `${c.position || ''} ${c.phone || ''} ${c.email || ''}`.trim() }))}
              onEdit={(id) => {
                const found = items.find((c) => c.contact_id === String(id))
                if (!found) return
                setEditingId(String(id))
                setValue('contact_name', found.contact_name)
                setValue('position', found.position || '')
                setValue('phone', found.phone || '')
                setValue('email', found.email || '')
                setValue('is_primary', !!found.is_primary)
              }}
              onDelete={async (id) => {
                setConfirmDeleteId(String(id))
              }}
            />
              </div>
            </div>
          </div>
        </section>
        <ConfirmDialog
          open={confirmDeleteId !== null}
          title="삭제하시겠습니까?"
          message="이 작업은 되돌릴 수 없습니다."
          cancelText="취소"
          confirmText="확인"
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={async () => {
            const id = confirmDeleteId
            setConfirmDeleteId(null)
            if (id == null) return
            const res = await fetch(`/api/roastery/contacts/${id}`, { method: 'DELETE', credentials: 'include' })
            if (res.ok) refresh()
          }}
        />
        <AlertDialog
          open={Boolean(alertDialog)}
          title={alertDialog?.title}
          message={alertDialog?.message}
          onClose={() => setAlertDialog(null)}
        />
        {showBasicInfoAlert && (
          <ConfirmDialog
            open={showBasicInfoAlert}
            title="알림"
            message="로스터리 기본 정보를 먼저 등록해주세요."
            cancelText=""
            confirmText="확인"
            variant="info"
            onClose={() => setShowBasicInfoAlert(false)}
            onConfirm={() => {
              setShowBasicInfoAlert(false)
              const pathname = window.location.pathname
              const seg = pathname.split('/').filter(Boolean)
              const locale = (seg[0] === 'en' || seg[0] === 'ja' || seg[0] === 'ko') ? seg[0] : 'ko'
              window.location.href = `/${locale}/roastery/settings`
            }}
          />
        )}
      </div>
    </>
  )
}


