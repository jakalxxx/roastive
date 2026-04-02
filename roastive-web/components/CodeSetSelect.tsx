'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CodeSetOption } from '@/lib/codeSets'
import { fetchCodeSetOptions } from '@/lib/codeSets'

type CodeSetSelectProps = {
  codeType: string
  value?: string
  defaultValue?: string
  onChange?: (value: string, option?: CodeSetOption) => void
  label?: string
  placeholder?: string
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  includePlaceholder?: boolean
  includeInactive?: boolean
  helperText?: string
  className?: string
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function CodeSetSelect({
  codeType,
  value,
  defaultValue,
  onChange,
  label,
  placeholder = '선택하세요',
  name,
  id,
  disabled = false,
  required = false,
  includePlaceholder = true,
  includeInactive = false,
  helperText,
  className,
}: CodeSetSelectProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const [options, setOptions] = useState<CodeSetOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedValue = isControlled ? (value ?? '') : internalValue
  const selectId = id || name

  useEffect(() => {
    if (!isControlled) {
      setInternalValue(defaultValue ?? '')
    }
  }, [defaultValue, isControlled])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetchCodeSetOptions(codeType, { includeInactive, signal: controller.signal })
      .then((opts) => {
        if (cancelled) return
        setOptions(opts)
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return
        setOptions([])
        setError(err?.message || '코드 정보를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [codeType, includeInactive])

  const placeholderOption = useMemo(() => {
    if (!includePlaceholder) return null
    return (
      <option value="" key="placeholder">
        {loading ? '불러오는 중...' : placeholder}
      </option>
    )
  }, [includePlaceholder, loading, placeholder])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value
    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onChange?.(
      nextValue,
      options.find((opt) => opt.codeKey === nextValue)
    )
  }

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      ) : null}
      <select
        id={selectId}
        name={name}
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled || loading}
        required={required}
        className={classNames(
          'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400 dark:disabled:bg-white/10',
          className
        )}
      >
        {placeholderOption}
        {options.map((option) => (
          <option key={option.codeKey} value={option.codeKey}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText ? <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p> : null}
      {error ? <p className="text-xs text-rose-500">{error}</p> : null}
    </div>
  )
}





























