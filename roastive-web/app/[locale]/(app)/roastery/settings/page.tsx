'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import SettingsNav from '@/components/SettingsNav'
// Note: Link typed routes may require Route casting for dynamic locale paths
import type { Route } from 'next'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { formatKoreanPhone } from '@roastive/validation'
import { isValidBizRegNo, isValidTelephone, isValidMobile, isValidAddress, formatBizRegNo } from '@/lib/validators'
import { zodResolver } from '@hookform/resolvers/zod'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'
import { Input, InputGroup } from '@/components/input'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { useDaumPostcode } from '@/lib/useDaumPostcode'

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

  const [tzOptions, setTzOptions] = useState<{ code_key: string; label: string }[]>([])
  const [currencyOptions, setCurrencyOptions] = useState<{ code_key: string; label: string }[]>([])
  const [unitOptions, setUnitOptions] = useState<{ code_key: string; label: string }[]>([])

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

  useEffect(() => {
    let mounted = true
    Promise.all([
      fetch('/api/codes/TIMEZONE').then(r => r.json()).catch(() => ({ items: [] })),
      fetch('/api/codes/CURRENCY').then(r => r.json()).catch(() => ({ items: [] })),
      fetch('/api/codes/UNIT').then(r => r.json()).catch(() => ({ items: [] })),
    ]).then(([tz, cur, u]) => {
      if (!mounted) return
      const normalize = (res: any) => {
        const arr = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : Array.isArray(res?.data) ? res.data : []
        return arr.map((i: any) => ({
          code_key: i.code_key ?? i.codeKey ?? i.code ?? i.key,
          label: i.label ?? i.name ?? i.title ?? (i.code_key ?? i.codeKey ?? ''),
          active: (i.active ?? i.enabled ?? true) !== false,
        })).filter((i: any) => i.code_key)
      }
      setTzOptions(normalize(tz).filter((i: any) => i.active))
      setCurrencyOptions(normalize(cur).filter((i: any) => i.active))
      setUnitOptions(normalize(u).filter((i: any) => i.active))
    }).catch(() => {})
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

  return (
    <div className="">
      <SettingsNav />

      {
        <section className="divide-y divide-gray-200 dark:divide-white/10">
          <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
            <div>
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">로스터리 기본정보</h2>
              <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">법인/상호, 사업자 등록번호, 기본 연락처 등</p>
            </div>
            <form className="md:col-span-2" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-y-8 sm:max-w-xl">
              <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">사업자 등록번호</label>
                  <div className="mt-2 flex gap-2">
                    <input
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
                    {/* 검색 버튼 제거: 포커스 아웃 시 자동 검증 */}
                  </div>
                  {errors.business_reg_no && <p className="mt-1 text-sm text-red-600">{errors.business_reg_no.message as string}</p>}
                  {bizError ? (
                    <p className='mt-1 text-sm text-red-600'>{bizError}</p>
                  ) : bizCheck ? (
                    <p className={bizCheck.available ? 'mt-1 text-sm text-green-600' : 'mt-1 text-sm text-red-600'}>
                      {bizCheck.available ? '사용 가능한 사업자등록번호입니다.' : '이미 사용중인 사업자등록번호입니다.'}
                    </p>
                  ) : null}
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">사업자명(법인/상호)</label>
                  <div className="mt-2">
                    <input className={classNames(
                      'block w-full rounded-md px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500',
                      isEdit ? 'bg-gray-50 cursor-not-allowed dark:bg-white/10' : 'bg-white dark:bg-white/5'
                    )} readOnly={isEdit} {...register('legal_name')} />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">브랜드명(거래 표기명)</label>
                  <div className="mt-2">
                    <input className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('brand_name')} />
                  </div>
                </div>
                {/* 사업장 주소 */}
              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">사업장 주소</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
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
                        onClick={() => open((r) => setSiteAddress((s) => ({ ...s, postal_code: r.postalCode, address_line1: r.address1, address_line2: s.address_line2 || r.address2Suggestion || '' })))}
                      />
                    </InputGroup>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    id="site_address_line2"
                    placeholder="상세 주소"
                    value={siteAddress.address_line2}
                    onChange={(e) => { setAddressError(null); setSiteAddress((s) => ({ ...s, address_line2: e.target.value })) }}
                  />
                  {addressError && <p className="mt-1 text-sm text-red-600">{addressError}</p>}
                </div>
              </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">대표자 성명</label>
                  <div className="mt-2">
                    <input className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('representative_name')} />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">대표 연락처</label>
                  <div className="mt-2">
                    <input
                      placeholder="010-1234-5678"
                      inputMode="tel"
                      autoComplete="tel-national"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                      {...register('phone', { onChange: handleContactChange })}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message as string}</p>}
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">대표 이메일</label>
                  <div className="mt-2">
                    <input
                      type="email"
                      autoComplete="email"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{String(errors.email.message)}</p>}
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">홈페이지</label>
                  <div className="mt-2">
                    <input
                      placeholder="https://example.com"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                      {...register('website')}
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">타임존</label>
                  <div className="mt-2">
                    <Controller
                      control={control}
                      name="timezone"
                      render={({ field: { value, onChange } }) => (
                        <Listbox value={value} onChange={onChange}>
                          <div className="relative">
                            <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus-visible:ring-2 focus-visible:ring-indigo-600 sm:text-sm/6 bg-white dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus-visible:ring-indigo-500">
                              <span className="col-start-1 row-start-1 truncate pr-6">{value}</span>
                              <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400" />
                            </ListboxButton>
                            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 sm:text-sm dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
                              {tzOptions.map((opt) => (
                                <ListboxOption key={opt.code_key} value={opt.code_key} className="group relative cursor-default py-2 pr-4 pl-8 text-gray-900 select-none data-[focus]:bg-indigo-600 data-[focus]:text-white dark:text-white dark:data-[focus]:bg-indigo-500">
                                  <span className="block truncate font-normal group-data-[selected]:font-semibold">{opt.label || opt.code_key}</span>
                                  <span className="absolute inset-y-0 left-0 hidden items-center pl-1.5 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white dark:text-indigo-400">
                                    <CheckIcon aria-hidden="true" className="size-5" />
                                  </span>
                                </ListboxOption>
                              ))}
                            </ListboxOptions>
                          </div>
                        </Listbox>
                      )}
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">기본 통화</label>
                  <div className="mt-2">
                    <Controller
                      control={control}
                      name="base_currency"
                      render={({ field: { value, onChange } }) => (
                        <Listbox value={value} onChange={onChange}>
                          <div className="relative">
                            <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus-visible:ring-2 focus-visible:ring-indigo-600 sm:text-sm/6 bg-white dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus-visible:ring-indigo-500">
                              <span className="col-start-1 row-start-1 truncate pr-6">{value}</span>
                              <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400" />
                            </ListboxButton>
                            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 sm:text-sm dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
                              {currencyOptions.map((opt) => (
                                <ListboxOption key={opt.code_key} value={opt.code_key} className="group relative cursor-default py-2 pr-4 pl-8 text-gray-900 select-none data-[focus]:bg-indigo-600 data-[focus]:text-white dark:text-white dark:data-[focus]:bg-indigo-500">
                                  <span className="block truncate font-normal group-data-[selected]:font-semibold">{opt.label || opt.code_key}</span>
                                  <span className="absolute inset-y-0 left-0 hidden items-center pl-1.5 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white dark:text-indigo-400">
                                    <CheckIcon aria-hidden="true" className="size-5" />
                                  </span>
                                </ListboxOption>
                              ))}
                            </ListboxOptions>
                          </div>
                        </Listbox>
                      )}
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">기본 단위</label>
                  <div className="mt-2">
                    <Controller
                      control={control}
                      name="default_unit"
                      render={({ field: { value, onChange } }) => (
                        <Listbox value={value} onChange={onChange}>
                          <div className="relative">
                            <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus-visible:ring-2 focus-visible:ring-indigo-600 sm:text-sm/6 bg-white dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus-visible:ring-indigo-500">
                              <span className="col-start-1 row-start-1 truncate pr-6">{value}</span>
                              <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400" />
                            </ListboxButton>
                            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 sm:text-sm dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
                              {unitOptions.map((opt) => (
                                <ListboxOption key={opt.code_key} value={opt.code_key} className="group relative cursor-default py-2 pr-4 pl-8 text-gray-900 select-none data-[focus]:bg-indigo-600 data-[focus]:text-white dark:text-white dark:data-[focus]:bg-indigo-500">
                                  <span className="block truncate font-normal group-data-[selected]:font-semibold">{opt.label || opt.code_key}</span>
                                  <span className="absolute inset-y-0 left-0 hidden items-center pl-1.5 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white dark:text-indigo-400">
                                    <CheckIcon aria-hidden="true" className="size-5" />
                                  </span>
                                </ListboxOption>
                              ))}
                            </ListboxOptions>
                          </div>
                        </Listbox>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <button disabled={saving} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500">저장</button>
                {savedAt && <span className="text-sm text-gray-500 dark:text-gray-400">저장됨 {savedAt}</span>}
              </div>
            </form>
          </div>
        </section>
      }
    </div>
  )
}
