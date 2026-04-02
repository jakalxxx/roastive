'use client'

import { PageHeading } from '@/components/PageHeading'
import { usePathname } from 'next/navigation'

export default function SettlementTaxPage() {
  const pathname = usePathname() || '/ko'
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] === 'en' || segments[0] === 'ja' || segments[0] === 'ko' ? segments[0] : 'ko'
  const base = `/${locale}`

  return (
    <>
      <PageHeading
        title="세금계산서 발행"
        description="전자 세금계산서 발행 화면은 준비 중입니다."
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '정산 관리', href: `${base}/settlement` },
          { name: '세금계산서 발행' },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-600.shadow-sm dark:border-white/10 dark:bg-gray-900/40 dark:text-gray-300">
          <p className="text-base font-semibold text-gray-900 dark:text-white">준비 중인 화면입니다.</p>
          <p className="mt-2">전자 세금계산서 연동 및 발행 이력을 이곳에서 제공할 예정입니다.</p>
        </div>
      </div>
    </>
  )
}
























