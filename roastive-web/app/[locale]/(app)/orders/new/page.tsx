'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PageHeading } from '@/components/PageHeading'

export default function OrderCreatePlaceholderPage() {
  const pathname = usePathname() || '/ko'
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] === 'en' || segments[0] === 'ja' || segments[0] === 'ko' ? segments[0] : 'ko'
  const base = `/${locale}`

  return (
    <>
      <PageHeading
        title="주문 등록"
        description="새로운 주문을 등록하는 화면입니다."
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '주문관리', href: `${base}/orders` },
          { name: '주문 등록' },
        ]}
      />
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-12 text-center sm:px-6 lg:px-8">
        <p className="text-base text-gray-600 dark:text-gray-300">
          주문 등록 기능은 현재 준비 중입니다. 곧 정식 화면이 제공될 예정입니다.
        </p>
        <Link
          href={`${base}/orders`}
          className="btn-edit"
        >
          주문 목록으로 돌아가기
        </Link>
      </div>
    </>
  )
}



