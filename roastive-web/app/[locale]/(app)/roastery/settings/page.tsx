'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import SettingsNav from '@/components/SettingsNav'
import { PageHeading } from '@/components/PageHeading'
// Note: Link typed routes may require Route casting for dynamic locale paths
import type { Route } from 'next'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { formatKoreanPhone } from '@roastive/validation'
import { isValidBizRegNo, isValidTelephone, isValidMobile, isValidAddress, formatBizRegNo } from '@/lib/validators'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, InputGroup } from '@/components/input'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { useDaumPostcode } from '@/lib/useDaumPostcode'
import { FormRow } from '@/components/FormRow'
import { CodeSetSelect } from '@/components/CodeSetSelect'

// 사업자등록번호 포맷/검증은 공통 유틸 사용

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function RoasterySettingsPage(){
  const pathname = usePathname()
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [bizCheck, setBizCheck] = useState<null | { available: boolean }>(null)
  const [bizError, setBizError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [siteAddress, setSiteAddress] = useState<{ postal_code: string; address_line1: string; address_line2: string }>({ postal_code: '', address_line1: '', address_line2: '' })
  const [addressError, setAddressError] = useState<string | null>(null)
  const { open } = useDaumPostcode()

  const schema = z.object({
    legal_name: z.string().optional(),
    representative_name: z.string().optional(),
    brand_name: z.string().optional(),
    business_reg_no: z
      .string()
      .optional()
      .refine((v) => !v || v === '' || isValidBizRegNo(v), '유효하지 않은 사업자등록번호입니다.'),
    phone: z
      .string()
      .optional()
      .refine((v) => !v || v === '' || isValidTelephone(v) || isValidMobile(v), '유효하지 않은 전화번호입니다.'),
    email: z.string().email().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    timezone: z.string().min(1),
    base_currency: z.string().min(1),
    default_unit: z.string().min(1),
    status: z.string().optional(),
  })

  type FormValues = z.infer<typeof schema>

  const { register, handleSubmit, reset, setValue, control, getValues, formState: { errors, dirtyFields } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { legal_name: '', representative_name: '', brand_name: '', business_reg_no: '', phone: '', email: '', website: '', timezone: 'Asia/Seoul', base_currency: 'KRW', default_unit: 'KG', status: 'ACTIVE' },
  })


  useEffect(() => {
    let mounted = true
    fetch('/api/roastery/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(({ data }) => {
        if (!mounted) return
        const locale = (() => {
          const seg = (pathname || '/ko').split('/').filter(Boolean)[0]
          return (seg === 'en' || seg === 'ja' || seg === 'ko') ? seg : 'ko'
        })()
        const currencyByLocale: Record<string, string> = { ko: 'KRW', en: 'USD', ja: 'JPY' }
        reset({
          legal_name: data?.legal_name ?? '',
          representative_name: data?.representative_name ?? '',
          brand_name: data?.brand_name ?? '',
          business_reg_no: data?.business_reg_no ?? '',
          phone: data?.phone ?? '',
          email: data?.email ?? '',
          website: data?.website ?? '',
          timezone: data?.timezone ?? (locale === 'ko' ? 'Asia/Seoul' : locale === 'ja' ? 'Asia/Tokyo' : 'UTC'),
          base_currency: data?.base_currency ?? currencyByLocale[locale],
          default_unit: data?.default_unit ?? 'KG',
          status: data?.status ?? 'ACTIVE',
        })
        // 로드된 값이 있으면 수정 모드로 간주
        if ((data?.legal_name ?? '') || (data?.business_reg_no ?? '')) {
          setIsEdit(true)
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [reset])
  useEffect(() => {
    let mounted = true
    fetch('/api/roastery/addresses/headquarters', { cache: 'no-store' })
      .then(r => r.json())
      .then(({ data }) => {
        if (!mounted) return
        if (data) setSiteAddress({ postal_code: data.postal_code || '', address_line1: data.address_line1 || '', address_line2: data.address_line2 || '' })
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatKoreanPhone(e.target.value);
    e.target.value = formatted;
    setValue('phone', formatted, { shouldValidate: true, shouldDirty: true });
  };

  const handleBizNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBizRegNo(e.target.value);
    e.target.value = formatted;
    setValue('business_reg_no', formatted, { shouldValidate: true, shouldDirty: true });
    setBizCheck(null)
  };

  const checkBizNo = async () => {
    const current = String(getValues('business_reg_no') || '')
    if (!current) { setBizCheck(null); return }
    try {
      setBizError(null)
      setBizCheck(null)
      const res = await fetch('/api/roastery/settings', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ biz_no: current }) })
      if (res.status === 401) {
        const seg = (pathname || '/ko').split('/').filter(Boolean)
        const locale = (seg[0] === 'en' || seg[0] === 'ja' || seg[0] === 'ko') ? seg[0] : 'ko'
        window.location.href = `/${locale}/login`
        return
      }
      if (!res.ok) {
        setBizCheck(null)
        setBizError('조회에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }
      const j = await res.json().catch(() => ({} as any))
      setBizError(null)
      setBizCheck({ available: !!j?.available })
    } catch {
      setBizCheck(null)
      setBizError('네트워크 오류로 조회에 실패했습니다.')
    }
  }
  const handleBizBlur = () => {
    if (isEdit) return
    const current = String(getValues('business_reg_no') || '')
    if (current && !isValidBizRegNo(current)) {
      setBizError('유효한 사업자등록번호가 아닙니다.')
      setBizCheck(null)
      return
    }
    void checkBizNo()
  }


  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    setSavedAt(null)
    try {
      // 초기 생성 분기: 첫 등록(isEdit=false) 시에는 init API 사용하여 로스터리 생성 및 멤버십 부여
      if (!isEdit) {
        const initBody = {
          legal_name: values.legal_name ?? '',
          brand_name: values.brand_name ?? '',
          business_reg_no: values.business_reg_no ?? '',
          phone: values.phone || null,
          email: values.email || null,
          website: values.website || null,
          timezone: values.timezone,
          base_currency: values.base_currency,
          default_unit: values.default_unit,
          status: values.status || 'ACTIVE',
        }
        const initRes = await fetch('/api/roastery/settings/init', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(initBody),
        })
        if (!initRes.ok) {
          const j = await initRes.json().catch(() => ({} as any))
          throw new Error(j?.message || '초기 생성에 실패했습니다.')
        }
        setIsEdit(true)
      }

      // 저장 전 선차단 완화: 사용자가 현재 로스터리의 동일 번호를 그대로 둘 수 있도록 허용
      // 서버에서 최종 중복검증(자기 자신 제외)을 수행함
      if (String(values.business_reg_no || '').trim() && bizCheck && bizCheck.available === false) {
        throw new Error('이미 사용중인 사업자등록번호입니다.');
      }
      // 서버에서 legal_name/business_reg_no 수정은 차단
      // 또한 변경된 필드만 전송하여 불필요한 코드셋 검증 실패를 방지
      const { legal_name: _legal, business_reg_no: _biz, ...rest } = values as any
      const allow: (keyof FormValues)[] = ['representative_name','brand_name','phone','email','website','timezone','base_currency','default_unit','status']
      const payload: Record<string, any> = {}
      for (const k of allow) {
        if ((dirtyFields as any)[k]) {
          const v = (rest as any)[k]
          if (v !== undefined) payload[k] = v === '' ? null : v
        }
      }
      const res = await fetch('/api/roastery/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any))
        throw new Error(j?.message || '저장에 실패했습니다.')
      }
      // save site address if changed
      const hasZipAndAddr1 = isValidAddress(siteAddress)
      const hasDetail = String(siteAddress.address_line2 || '').trim()
      if (hasZipAndAddr1 && !hasDetail) {
        setAddressError('상세 주소를 입력하세요')
        ;(document.getElementById('site_address_line2') as HTMLInputElement | null)?.focus()
        setSaving(false)
        return
      }
      if (hasZipAndAddr1) {
        await fetch('/api/roastery/addresses/headquarters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          postal_code: siteAddress.postal_code,
          address_line1: siteAddress.address_line1,
          address_line2: siteAddress.address_line2,
          type: 'OFFICE',
        }) })
      }
      setSavedAt(new Date().toLocaleTimeString())
    } finally {
      setSaving(false)
    }
  }

  const seg = (pathname || '/ko').split('/').filter(Boolean)
  const locale = (seg[0] === 'en' || seg[0] === 'ja' || seg[0] === 'ko') ? seg[0] : 'ko'
  const base = `/${locale}`

  return (
    <>
      <PageHeading
        title="로스터리 설정"
        description="로스터리 기본 정보를 관리하세요"
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '로스터리 관리', href: `${base}/roastery/settings` },
          { name: '기본정보' },
        ]}
      />
      <SettingsNav />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-6 dark:border-white/5">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">기본정보</p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">로스터리 기본 정보</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">법인/상호, 사업자 등록번호, 기본 연락처 등을 관리하세요.</p>
            </div>
            {savedAt ? (
              <p className="text-xs text-gray-500 dark:text-gray-300">마지막 저장 {savedAt}</p>
            ) : null}
          </div>
          <form className="mt-6 space-y-8" onSubmit={handleSubmit(onSubmit)}>
                <FormRow label="사업자 등록번호" htmlFor="business_reg_no">
                  <div className="space-y-2">
                    <input
                      id="business_reg_no"
                      placeholder="000-00-00000"
                      inputMode="numeric"
                      autoComplete="off"
                      className={classNames(
                        'block w-full rounded-md px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500',
                        isEdit ? 'bg-gray-50 cursor-not-allowed dark:bg-white/10' : 'bg-white dark:bg-white/5'
                      )}
                      readOnly={isEdit}
                      {...register('business_reg_no', { onChange: handleBizNoChange, onBlur: handleBizBlur })}
                    />
                    {errors.business_reg_no && <p className="text-sm text-red-600">{errors.business_reg_no.message as string}</p>}
                    {bizError ? (
                      <p className="text-sm text-red-600">{bizError}</p>
                    ) : bizCheck ? (
                      <p className={bizCheck.available ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
                        {bizCheck.available ? '사용 가능한 사업자등록번호입니다.' : '이미 사용중인 사업자등록번호입니다.'}
                      </p>
                    ) : null}
                  </div>
                </FormRow>
                <FormRow label="사업자명(법인/상호)" htmlFor="legal_name">
                  <input
                    id="legal_name"
                    className={classNames(
                      'block w-full rounded-md px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500',
                      isEdit ? 'bg-gray-50 cursor-not-allowed dark:bg-white/10' : 'bg-white dark:bg-white/5'
                    )}
                    readOnly={isEdit}
                    {...register('legal_name')}
                  />
                </FormRow>
                <FormRow label="브랜드명(거래 표기명)" htmlFor="brand_name">
                  <input
                    id="brand_name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                    {...register('brand_name')}
                  />
                </FormRow>
                <FormRow label="사업장 주소">
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        readOnly
                        placeholder="우편번호"
                        value={siteAddress.postal_code}
                        className="col-span-1 bg-gray-50 cursor-not-allowed px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500"
                      />
                      <div className="col-span-2">
                        <InputGroup right={<MagnifyingGlassIcon className="size-5" />}>
                          <Input
                            readOnly
                            placeholder="주소"
                            value={siteAddress.address_line1}
                            className="w-full cursor-pointer hover:bg-gray-50 px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500"
                            onClick={() => open((r) =>
                              setSiteAddress((s) => ({
                                ...s,
                                postal_code: r.postalCode,
                                address_line1: r.address1,
                                address_line2: s.address_line2 || r.address2Suggestion || '',
                              }))
                            )}
                          />
                        </InputGroup>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="site_address_line2"
                        placeholder="상세 주소"
                        value={siteAddress.address_line2}
                        onChange={(e) => { setAddressError(null); setSiteAddress((s) => ({ ...s, address_line2: e.target.value })) }}
                      />
                      {addressError && <p className="text-sm text-red-600">{addressError}</p>}
                    </div>
                  </div>
                </FormRow>
                <FormRow label="대표자 성명" htmlFor="representative_name">
                  <input
                    id="representative_name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                    {...register('representative_name')}
                  />
                </FormRow>
                <FormRow label="대표 연락처" htmlFor="phone">
                  <div className="space-y-2">
                    <input
                      id="phone"
                      placeholder="010-1234-5678"
                      inputMode="tel"
                      autoComplete="tel-national"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                      {...register('phone', { onChange: handleContactChange })}
                    />
                    {errors.phone && <p className="text-sm text-red-600">{errors.phone.message as string}</p>}
                  </div>
                </FormRow>
                <FormRow label="대표 이메일" htmlFor="email">
                  <div className="space-y-2">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                      {...register('email')}
                    />
                    {errors.email && <p className="text-sm text-red-600">{String(errors.email.message)}</p>}
                  </div>
                </FormRow>
                <FormRow label="홈페이지" htmlFor="website">
                  <input
                    id="website"
                    placeholder="https://example.com"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                    {...register('website')}
                  />
                </FormRow>
                <FormRow label="타임존">
                  <Controller
                    control={control}
                    name="timezone"
                    render={({ field }) => (
                      <CodeSetSelect
                        codeType="TIMEZONE"
                        value={field.value}
                        onChange={(next) => field.onChange(next)}
                        placeholder="타임존 선택"
                        required
                      />
                    )}
                  />
                </FormRow>
                <FormRow label="기본 통화">
                  <Controller
                      control={control}
                      name="base_currency"
                      render={({ field }) => (
                        <CodeSetSelect
                          codeType="CURRENCY"
                          value={field.value}
                          onChange={(next) => field.onChange(next)}
                          placeholder="통화 선택"
                          required
                        />
                      )}
                    />
                  </FormRow>
                <FormRow label="기본 단위">
                  <Controller
                      control={control}
                      name="default_unit"
                      render={({ field }) => (
                        <CodeSetSelect
                          codeType="UNIT"
                          value={field.value}
                          onChange={(next) => field.onChange(next)}
                          placeholder="단위 선택"
                          required
                        />
                      )}
                    />
                </FormRow>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button type="button" onClick={() => reset()} className="btn-edit">
                  초기화
                </button>
                <button type="submit" disabled={saving} className="btn-register disabled:cursor-not-allowed">
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
          </form>
        </section>
      </div>
    </>
  )
}
