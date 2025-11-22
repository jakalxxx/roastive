'use client'

import { useDaumPostcode, type AddressSelectResult } from '@/lib/useDaumPostcode'

type Props = {
  onSelect: (r: AddressSelectResult) => void
  className?: string
  children?: React.ReactNode
}

export default function AddressSearchButton({ onSelect, className, children }: Props) {
  const { loaded, loading, open } = useDaumPostcode()
  return (
    <button
      type="button"
      disabled={!loaded || loading}
      onClick={() => open(onSelect)}
      className={className || 'shrink-0 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20'}
    >
      {children || '주소검색'}
    </button>
  )
}


