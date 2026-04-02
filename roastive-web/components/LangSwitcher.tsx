'use client'

import { useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Route } from 'next'

type Props = {
  currentLocale: 'ko' | 'en' | 'ja'
}

const LOCALES: Array<{ code: 'ko'|'en'|'ja'; label: string }> = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
]

export function LangSwitcher({ currentLocale }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as 'ko'|'en'|'ja'
    const rest = (pathname || '/').replace(/^\/(ko|en|ja)(?=\/|$)/, '') || '/'
    const nextPath = `/${next}${rest === '/' ? '' : rest}`
    startTransition(() => {
      fetch('/api/i18n/set-locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: next }),
      }).finally(() => router.push(nextPath as Route))
    })
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      <span className="sr-only">Language</span>
      <select
        onChange={handleChange}
        defaultValue={currentLocale}
        disabled={isPending}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-white/10 dark:bg-gray-900 dark:text-white"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </label>
  )
}


