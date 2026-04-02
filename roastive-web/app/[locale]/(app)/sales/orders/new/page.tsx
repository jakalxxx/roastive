'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { Combobox, Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, PlusIcon } from '@heroicons/react/20/solid'
import { PageHeading } from '@/components/PageHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'

type Customer = { customerId: string; customerName: string; status?: string | null }
type Product = { productId: string; productName: string; status?: string | null }

const STATUS_OPTIONS = [
  { value: 'NEW', label: '신규' },
  { value: 'CONFIRMED', label: '확정' },
  { value: 'CANCELLED', label: '취소' },
] as const

const classNames = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

export default function SalesOrderNewPage({ params }: { params: { locale: string } }) {
  useSessionGuard(1000 * 60 * 5)
  const locale = params.locale ?? 'ko'

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customerQuery, setCustomerQuery] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [unit, setUnit] = useState('EA')
  const [currency, setCurrency] = useState('KRW')
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value)
  const [remarks, setRemarks] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successModal, setSuccessModal] = useState(false)

  useEffect(() => {
    fetch('/api/user/customers')
      .then((res) => res.json())
      .then((data) => {
        const items: Customer[] = Array.isArray(data?.items) ? data.items : []
        setCustomers(items.filter((c) => (c.status ?? 'ACTIVE') === 'ACTIVE'))
      })
      .catch(() => setCustomers([]))
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const items: Product[] = Array.isArray(data?.items) ? data.items : []
        setProducts(items.filter((p) => (p.status ?? 'ACTIVE') === 'ACTIVE'))
      })
      .catch(() => setProducts([]))
  }, [])

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => c.customerName.toLowerCase().includes(q))
  }, [customerQuery, customers])

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.productName.toLowerCase().includes(q))
  }, [productQuery, products])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!selectedCustomer) {
      setFormError('고객사를 선택하세요.')
      return
    }
    if (!selectedProduct) {
      setFormError('제품을 선택하세요.')
      return
    }
    const qty = Number(quantity)
    const price = Number(unitPrice)
    if (!qty || qty <= 0) {
      setFormError('수량을 입력하세요.')
      return
    }
    if (!price || price <= 0) {
      setFormError('단가를 입력하세요.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/sales/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.customerId,
          productId: selectedProduct.productId,
          quantity: qty,
          unitPrice: price,
          unit,
          currency,
          status,
          orderDate: new Date(orderDate).toISOString(),
          remarks: remarks.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || '주문 등록에 실패했습니다.')
      setSuccessModal(true)
    } catch (err: any) {
      setFormError(err?.message || '주문 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeading
        title="주문 등록"
        description="SALES_ORDER에 주문을 등록합니다."
        breadcrumbs={[
          { name: '판매', href: `/${locale}/sales/reports` },
          { name: '주문 등록' },
        ]}
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        {formError ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-100">
            {formError}
          </div>
        ) : null}

        <div className="space-y-6">
          <Field label="고객사">
            <SimpleCombobox
              options={filteredCustomers}
              displayValue={(item) => item?.customerName ?? ''}
              onQueryChange={setCustomerQuery}
              onChange={setSelectedCustomer}
              selected={selectedCustomer}
              placeholder="고객사 검색"
            />
          </Field>

          <Field label="제품">
            <SimpleCombobox
              options={filteredProducts}
              displayValue={(item) => item?.productName ?? ''}
              onQueryChange={setProductQuery}
              onChange={setSelectedProduct}
              selected={selectedProduct}
              placeholder="제품 검색"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="주문일시">
              <input
                type="datetime-local"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </Field>
            <Field label="통화">
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </Field>
            <Field label="수량">
              <input
                type="number"
                min={0}
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </Field>
            <Field label="단가">
              <input
                type="number"
                min={0}
                step="1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </Field>
            <Field label="단위">
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </Field>
            <Field label="상태">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="비고">
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            <PlusIcon className="size-4" />
            주문 등록
          </button>
        </div>
      </form>

      <Transition show={successModal}>
        <Dialog className="relative z-50" onClose={() => setSuccessModal(false)}>
          <TransitionChild
            as="div"
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </TransitionChild>
          <div className="fixed inset-0 flex items-center justify-center px-4">
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-lg dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">주문이 등록되었습니다.</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">SALES_ORDER와 SALES_ORDER_LINE에 반영되었습니다.</p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSuccessModal(false)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10"
                >
                  닫기
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
      {children}
    </div>
  )
}

type SimpleComboboxProps<T> = {
  options: T[]
  selected: T | null
  onChange: (value: T | null) => void
  onQueryChange: (value: string) => void
  displayValue: (item: T | null) => string
  placeholder?: string
}

function SimpleCombobox<T extends { [key: string]: any }>({
  options,
  selected,
  onChange,
  onQueryChange,
  displayValue,
  placeholder,
}: SimpleComboboxProps<T>) {
  return (
    <Combobox value={selected} onChange={onChange} nullable>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-white/10 dark:bg-white/5">
          <Combobox.Input
            className="w-full border-none bg-transparent py-2 pl-3 pr-10 text-sm text-gray-900 focus:outline-none dark:text-white"
            displayValue={displayValue}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => onQueryChange('')}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-white/10 dark:bg-gray-900 dark:text-gray-100">
            {options.length === 0 ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-500 dark:text-gray-300">검색 결과가 없습니다.</div>
            ) : (
              options.map((item, idx) => (
                <Combobox.Option
                  key={idx}
                  className={({ active }) =>
                    classNames(
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                      active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-white' : 'text-gray-900 dark:text-gray-100'
                    )
                  }
                  value={item}
                >
                  {({ active, selected }) => (
                    <>
                      <span className={classNames('block truncate', selected ? 'font-semibold' : 'font-normal')}>{displayValue(item)}</span>
                      {selected ? (
                        <span
                          className={classNames(
                            'absolute inset-y-0 right-0 flex items-center pr-4',
                            active ? 'text-indigo-700 dark:text-white' : 'text-indigo-600 dark:text-indigo-200'
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  )
}












