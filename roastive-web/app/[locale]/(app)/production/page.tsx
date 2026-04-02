'use client'

import { PageHeading } from '@/components/PageHeading'
import { usePathname } from 'next/navigation'

export default function ProductionListPage() {
  const pathname = usePathname() || '/ko'
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] === 'en' || segments[0] === 'ja' || segments[0] === 'ko' ? segments[0] : 'ko'
  const base = `/${locale}`

  return (
    <>
      <PageHeading
        title="생산 목록"
        description="생산 계획 및 배치 정보 화면은 준비 중입니다."
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '생산 관리' },
          { name: '생산 목록' },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-600 shadow-sm dark:border-white/10 dark:bg-gray-900/40 dark:text-gray-300">
          <p className="text-base font-semibold text-gray-900 dark:text-white">준비 중인 화면입니다.</p>
          <p className="mt-2">
            생산 계획/진행 현황을 이 페이지에서 확인할 수 있도록 차후 업데이트 예정입니다.
          </p>
        </div>
      </div>
    </>
  )
}
























