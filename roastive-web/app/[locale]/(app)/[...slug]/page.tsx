'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExclamationTriangleIcon, HomeIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'

type PlaceholderPageProps = {
  params: {
    locale: string
    slug?: string[]
  }
}

export default function PlaceholderPage({ params }: PlaceholderPageProps) {
  const router = useRouter()
  const locale = params.locale || 'ko'
  const segments = Array.isArray(params.slug) ? params.slug : []
  const formattedPath = ['/', locale, ...segments].join('/').replace(/\/+/g, '/')
  const homeHref = `/${locale}/dashboard`

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl border border-gray-200 bg-white text-gray-900 shadow-xl dark:border-white/10 dark:bg-gray-900 dark:text-white">
        <div className="px-6 py-8 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="inline-flex size-12 items-center justify-center border border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              <ExclamationTriangleIcon className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">
                서비스 준비중
              </p>
              <h1 className="text-2xl font-semibold">해당 페이지는 준비중입니다.</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                요청하신 페이지는 아직 콘텐츠가 준비되지 않았습니다. 필요하신 기능이 있다면 관리자에게 문의해주세요.
              </p>
              <div className="rounded border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-white/10 dark:bg-gray-800/30 dark:text-gray-300">
                현재 경로: <span className="font-semibold text-gray-900 dark:text-white">{formattedPath}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 text-sm dark:border-white/10 dark:bg-gray-800/40 sm:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900 dark:border-white/20 dark:text-gray-200 dark:hover:border-white/40 dark:hover:text-white"
          >
            <ArrowUturnLeftIcon className="size-4" aria-hidden="true" />
            이전 페이지
          </button>
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 border border-gray-900 bg-gray-900 px-4 py-2 font-semibold text-white transition hover:bg-gray-800 dark:border-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            <HomeIcon className="size-4" aria-hidden="true" />
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  )
}




























