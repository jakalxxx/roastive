'use client'

import { PageHeading } from '@/components/PageHeading'
import { usePathname } from 'next/navigation'

export default function SystemRolesPage() {
  const pathname = usePathname() || '/ko'
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] === 'en' || segments[0] === 'ja' || segments[0] === 'ko' ? segments[0] : 'ko'
  const base = `/${locale}`

  return (
    <>
      <PageHeading
        title="권한 설정"
        description="역할/권한 관리 화면은 준비 중입니다."
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '시스템 설정', href: `${base}/system/settings` },
          { name: '권한 설정' },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-600 shadow-sm dark:border-white/10 dark:bg-gray-900/40 dark:text-gray-300">
          <p className="text-base font-semibold text-gray-900 dark:text-white">준비 중인 화면입니다.</p>
          <p className="mt-2">사용자 역할, 메뉴 권한 제어 기능을 곧 제공할 예정입니다.</p>
        </div>
      </div>
    </>
  )
}
























