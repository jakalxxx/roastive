'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { bizRegNoSchema, phoneKrSchema, emailSchema, formatKoreanPhone } from '@roastive/validation'
import SettingsNav from '@/components/SettingsNav'
type SupplierItem = {
  supplier_id: string;
  supplier_name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  business_reg_no: string;
  address?: string;
}

// Format KR Business Registration Number: 000-00-00000
function formatBizRegNo(v: string): string {
  const s = (v || '').replace(/\D+/g, '').slice(0, 10)
  if (s.length <= 3) return s
  if (s.length <= 5) return `${s.slice(0, 3)}-${s.slice(3)}`
  return `${s.slice(0, 3)}-${s.slice(3, 5)}-${s.slice(5)}`
}

const schema = z.object({
  supplier_name: z.string().min(2, '업체명을 2자 이상 입력하세요.').max(160),
  contact_name: z.string().min(1, '담당자명을 입력하세요.').max(80).optional(),
  phone: phoneKrSchema.optional(),
  email: emailSchema.optional(),
  business_reg_no: bizRegNoSchema,
  address: z.string().max(255).optional(),
})
 type FormValues = z.infer<typeof schema>

 export default function SuppliersPage({ params }: { params: { locale: string } }) {
  const [items, setItems] = useState<SupplierItem[]>([])
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const { register, handleSubmit, reset, trigger, setValue, formState: { errors, isSubmitting, touchedFields, isValid } } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onChange', reValidateMode: 'onChange' })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatKoreanPhone(e.target.value)
    e.target.value = formatted
    setValue('phone', formatted as any, { shouldValidate: true, shouldDirty: true })
  }

  const handleBizNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBizRegNo(e.target.value)
    e.target.value = formatted
    setValue('business_reg_no', formatted as any, { shouldValidate: true, shouldDirty: true })
  }

  const load = async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const r = await fetch('/api/procurement/suppliers', { signal })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        throw new Error((d as any)?.message || '목록 조회 실패')
      }
      const arr = Array.isArray((d as any)?.items) ? (d as any).items : (Array.isArray(d) ? (d as any) : [])
      setItems(arr as SupplierItem[])
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setServerError(e?.message || '목록 조회 중 오류가 발생했습니다')
      }
    } finally { setLoading(false) }
  }
  useEffect(() => {
    const ac = new AbortController()
    load(ac.signal)
    return () => ac.abort()
  }, [])

  const onSubmit = async (v: FormValues) => {
    setServerError(null)
    setSavedAt(null)
    try {
      const res = await fetch('/api/procurement/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setServerError(data?.message || '저장 실패')
        return
      }
      reset()
      setSavedAt(new Date().toLocaleTimeString())
      await load()
    } catch (e: any) {
      setServerError(e?.message || '저장 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="">
      <SettingsNav />

      <section className="divide-y divide-gray-200 dark:divide-white/10">
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">구매처 관리</h2>
            <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">구매처 정보를 등록하고 관리하세요</p>
            {serverError && (
              <div role="status" aria-live="polite" className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">{serverError}</div>
            )}
            {savedAt && (
              <div role="status" aria-live="polite" className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-emerald-500/10 dark:text-emerald-200">저장됨 {savedAt}</div>
            )}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-2 grid grid-cols-1 gap-y-6 sm:max-w-xl">
            <div>
              <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">생두업체명</label>
              <input className="mt-2 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('supplier_name', { onBlur: () => trigger('supplier_name') })} />
              {touchedFields.supplier_name && errors.supplier_name && <p className="mt-1 text-sm text-red-600">{errors.supplier_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">담당자명</label>
              <input className="mt-2 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('contact_name', { onBlur: () => trigger('contact_name') })} />
              {touchedFields.contact_name && errors.contact_name && <p className="mt-1 text-sm text-red-600">{errors.contact_name.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">담당자 연락처</label>
              <input
                inputMode="tel"
                autoComplete="tel-national"
                className="mt-2 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                {...register('phone', { onBlur: () => trigger('phone'), onChange: handlePhoneChange })}
              />
              {touchedFields.phone && errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">이메일</label>
              <input className="mt-2 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('email', { onBlur: () => trigger('email') })} />
              {touchedFields.email && errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">사업자등록번호</label>
              <input
                placeholder="000-00-00000"
                inputMode="numeric"
                autoComplete="off"
                className="mt-2 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                {...register('business_reg_no', { onBlur: () => trigger('business_reg_no'), onChange: handleBizNoChange })}
              />
              {touchedFields.business_reg_no && errors.business_reg_no && <p className="mt-1 text-sm text-red-600">{errors.business_reg_no.message}</p>}
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">주소</label>
              <input className="mt-2 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('address', { onBlur: () => trigger('address') })} />
            </div>
            <div>
              <button disabled={isSubmitting || !isValid} aria-busy={isSubmitting} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">추가</button>
            </div>
          </form>
        </div>

        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">구매처 목록</h2>
            <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">등록된 구매처 목록</p>
          </div>
          <div className="md:col-span-2">
            <div className="overflow-hidden rounded-md border border-gray-200 dark:border-white/10">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-white/10">
                <caption className="sr-only">구매처 목록</caption>
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">업체명</th>
                    <th className="px-4 py-2 text-left font-semibold">담당자</th>
                    <th className="px-4 py-2 text-left font-semibold">연락처</th>
                    <th className="px-4 py-2 text-left font-semibold">이메일</th>
                    <th className="px-4 py-2 text-left font-semibold">사업자등록번호</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">불러오는 중…</td>
                    </tr>
                  )}
                  {!loading && items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">등록된 구매처가 없습니다.</td>
                    </tr>
                  )}
                  {!loading && items.length > 0 && items.map((it) => (
                    <tr key={it.supplier_id}>
                      <td className="px-4 py-2">{it.supplier_name}</td>
                      <td className="px-4 py-2">{it.contact_name}</td>
                      <td className="px-4 py-2">{it.phone}</td>
                      <td className="px-4 py-2">{it.email}</td>
                      <td className="px-4 py-2">{it.business_reg_no}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
 }
