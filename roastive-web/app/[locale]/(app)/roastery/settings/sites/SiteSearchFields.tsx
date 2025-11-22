'use client'

import { useEffect, useState } from 'react'
import { useDaumPostcode } from '@/lib/useDaumPostcode'
import { Input, InputGroup } from '@/components/input'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'

type Props = {
  value: { address_type?: string; site_name?: string; branch_seq_no?: string; postal_code: string; address_line1: string; address_line2: string }
  onChange: (v: { address_type?: string; site_name?: string; branch_seq_no?: string; postal_code: string; address_line1: string; address_line2: string }) => void
  label?: string
}

export default function AddressSearchFields({ value, onChange, label = '사업장 주소' }: Props) {
  const { open } = useDaumPostcode()
  const [addressTypeOptions, setAddressTypeOptions] = useState<{ code_key: string; label: string }[]>([])

  useEffect(() => {
    let mounted = true
    fetch('/api/codes/ADDRESS_TYPE').then(r => r.json()).then((res) => {
      if (!mounted) return
      const arr = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : Array.isArray(res?.data) ? res.data : []
      const opts = arr.map((i: any) => ({ code_key: i.code_key ?? i.codeKey ?? i.code, label: i.label ?? i.name ?? i.title ?? (i.code_key ?? i.codeKey ?? '') }))
        .filter((o: any) => o.code_key && o.code_key !== 'HEADQUARTERS')
      setAddressTypeOptions(opts)
      if (!value.address_type && opts.length) onChange({ ...value, address_type: opts[0].code_key })
    }).catch(() => setAddressTypeOptions([]))
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="sm:col-span-3">
      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">{label}</label>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <Listbox value={value.address_type || ''} onChange={(v) => onChange({ ...value, address_type: v })}>
            <div className="relative">
              <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus-visible:ring-2 focus-visible:ring-indigo-600 sm:text-sm/6 bg-white dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus-visible:ring-indigo-500">
                <span className="col-start-1 row-start-1 truncate pr-6">
                  {addressTypeOptions.find(o => o.code_key === value.address_type)?.label || value.address_type || '주소 유형 선택'}
                </span>
                <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400" />
              </ListboxButton>
              <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 sm:text-sm dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
                {addressTypeOptions.map((opt) => (
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
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-2">
          <Input placeholder="사업장명" value={value.site_name || ''} onChange={(e) => onChange({ ...value, site_name: e.target.value })} />
          <Input placeholder="종사업장번호(4자리)" value={value.branch_seq_no || ''} onChange={(e) => onChange({ ...value, branch_seq_no: e.target.value.replace(/\D+/g, '').slice(0,4) })} />
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <Input
          readOnly
          placeholder="우편번호"
          value={value.postal_code}
          className="col-span-1 bg-gray-50 cursor-not-allowed px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500"
        />
        <div className="col-span-2">
          <InputGroup right={<MagnifyingGlassIcon className="size-5" />}>
            <Input
              readOnly
              placeholder="주소"
              value={value.address_line1}
              className="w-full cursor-pointer hover:bg-gray-50 px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500"
              onClick={() => open((r) => onChange({ ...value, postal_code: r.postalCode, address_line1: r.address1, address_line2: value.address_line2 || r.address2Suggestion || '' }))}
            />
          </InputGroup>
        </div>
      </div>
      <div className="mt-2">
        <Input placeholder="상세 주소" value={value.address_line2} onChange={(e) => onChange({ ...value, address_line2: e.target.value })} />
      </div>
    </div>
  )
}


