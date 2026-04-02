'use client'

import { PageHeading } from '@/components/PageHeading'
import SystemSettingsNav from '@/components/SystemSettingsNav'
import { SUPPORT_BOARD_COPY, SUPPORT_BOARD_DATA } from '../supportData'

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function SystemQnaPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale && ['ko', 'en', 'ja'].includes(params.locale) ? params.locale : 'ko'
  const base = `/${locale}`
  const posts = SUPPORT_BOARD_DATA.qna
  const copy = SUPPORT_BOARD_COPY.qna

  return (
    <>
      <PageHeading
        title={copy.title}
        description="접수된 문의를 답변하고 기록을 남겨주세요."
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '시스템 설정', href: `${base}/system/settings/qna` },
          { name: copy.title },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <SystemSettingsNav />
        <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4 dark:border-white/5">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">사용자 문의</p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{copy.title}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{copy.description}</p>
            </div>
            <button
              type="button"
              onClick={() => console.log('[SystemSettings] Q&A 등록')}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              {copy.button}
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-white/10">
            <div className="max-h-[520px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-4 py-3 sm:px-6">No.</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">제목</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">작성자</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">등록일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">등록된 Q&A가 없습니다.</td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={`qna-${post.id}`} className="bg-white dark:bg-gray-900/40">
                        <td className="px-4 py-4 sm:px-6">{post.id}</td>
                        <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white sm:px-6">{post.title}</td>
                        <td className="px-4 py-4 sm:px-6">{post.author}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 sm:px-6">{formatDate(post.createdAt, locale)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
