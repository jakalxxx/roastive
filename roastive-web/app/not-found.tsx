'use client'

import Link from 'next/link'
import type { Route } from 'next'

export default function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">페이지를 찾을 수 없습니다</h1>
        <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300">요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href={"/ko" as Route}
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            홈으로 이동
          </Link>
          <Link href={"/login" as Route} className="text-sm font-semibold text-gray-900 dark:text-white">
            로그인 하러가기 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  )
}


