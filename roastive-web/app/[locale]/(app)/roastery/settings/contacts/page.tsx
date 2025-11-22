'use client'

import SettingsNav from '@/components/SettingsNav'
import ContactCardList from '@/app/[locale]/(app)/roastery/settings/contacts/ContactCardList'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useEffect, useState } from 'react'
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
  const [items, setItems] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
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

  useEffect(() => { refresh() }, [])

  const onSubmit = async (v: any) => {
    // 전화/휴대전화 간단 검증 (하나라도 형식 유효하면 통과)
    if (v.phone && !(isValidTelephone(v.phone) || isValidMobile(v.phone))) {
      alert('유효한 전화번호 형식이 아닙니다.')
      return
    }
    const url = editingId ? `/api/roastery/contacts/${editingId}` : '/api/roastery/contacts'
    const method = editingId ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(v) as any })
    if (res.status === 401) {
      // Try preflight then notify
      const pre = await fetch('/api/roastery/settings', { cache: 'no-store', credentials: 'include' })
      if (pre.status === 401) {
        alert('로그인이 필요합니다. 다시 로그인 후 시도해주세요.')
        return
      }
    }
    if (res.ok) { reset(); setEditingId(null); refresh() }
  }

  return (
    <div className="">
      <SettingsNav />
      <section className="divide-y divide-gray-200 dark:divide-white/10">
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">담당자 관리</h2>
            <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">대표/실무 연락처를 관리하세요</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-2 grid grid-cols-1 gap-y-6 sm:max-w-xl">
            <div>
              <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">이름</label>
              <input className="mt-2 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('contact_name')} />
              {errors.contact_name && <p className="mt-1 text-sm text-red-600">{errors.contact_name.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">직책/직무</label>
              <input className="mt-2 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('position')} />
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">연락처</label>
              <input
                className="mt-2 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                {...register('phone', { onChange: (e) => { e.target.value = formatKoreanPhone(e.target.value) } })}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">이메일</label>
              <input type="email" className="mt-2 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('email')} />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 text-sm/6 text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register('is_primary')} /> 대표 연락처로 지정
              </label>
            </div>
            <div>
              <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500">저장</button>
            </div>
          </form>
        </div>

        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
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
      </section>
    </div>
  )
}


