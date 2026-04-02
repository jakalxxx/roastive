'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { id: 'faq', name: 'FAQ', helper: '자주 묻는 질문', slug: 'faq' },
  { id: 'qna', name: 'Q&A', helper: '사용자 문의', slug: 'qna' },
] as const

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function SystemSettingsNav() {
  const pathname = usePathname() || '/ko/system/settings/faq'
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] === 'en' || segments[0] === 'ja' || segments[0] === 'ko' ? segments[0] : 'ko'
  const base = `/${locale}/system/settings`

  return (
    <div className="mt-4 rounded-2xl bg-gray-50/90 p-1 ring-1 ring-gray-200 shadow-sm dark:bg-gray-900/70 dark:ring-white/10">
      <div className="flex flex-wrap items-center gap-2">
        {ITEMS.map((item) => {
          const href = `${base}/${item.slug}`
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={item.id}
              href={href}
              className={classNames(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                isActive
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-200 dark:bg-gray-900 dark:text-indigo-200 dark:ring-indigo-400/30'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              )}
            >
              {item.name}
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{item.helper}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
