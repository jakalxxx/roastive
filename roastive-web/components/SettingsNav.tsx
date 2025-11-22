'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function classNames(...classes: string[]) { return classes.filter(Boolean).join(' ') }

function makeSettingsNav(pathname: string) {
  const seg = (pathname || '/ko').split('/').filter(Boolean)
  const locale = (seg[0] === 'en' || seg[0] === 'ja' || seg[0] === 'ko') ? seg[0] : 'ko'
  const base = `/${locale}/roastery/settings`
  return [
    { name: '기본정보', href: `${base}`, current: pathname === base },
    { name: '사업장 관리', href: `${base}/sites`, current: pathname.startsWith(`${base}/sites`) },
    { name: '담당자 관리', href: `${base}/contacts`, current: pathname.startsWith(`${base}/contacts`) },
  ]
}

export default function SettingsNav() {
  const pathname = usePathname() || '/ko/roastery/settings'
  const items = makeSettingsNav(pathname)
  return (
    <header className="border-b border-gray-200 dark:border-white/5">
      <nav className="flex overflow-x-auto py-4">
        <ul role="list" className="flex min-w-full flex-none gap-x-6 px-4 text-sm/6 font-semibold text-gray-500 sm:px-6 lg:px-8 dark:text-gray-400">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href as any} className={classNames('outline-none', item.current ? 'text-indigo-600 dark:text-indigo-400' : '')}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}


