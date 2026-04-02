'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { PageHeading } from '@/components/PageHeading'
import { useSessionGuard } from '@/lib/useSessionGuard'

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type UserAccount = {
  userId: string
  email: string
  displayName?: string
  status?: string
  lastLoginAt?: string | null
  createdAt?: string | null
}

const STATUS_TONES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/40',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/40',
  SUSPENDED: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-400/40',
}

const PAGE_SIZES = [10, 20, 30] as const
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0]

const USER_SORT_OPTIONS = [
  { value: 'created_desc', label: '가입일 최신순', sort: 'createdAt', direction: 'desc' as const },
  { value: 'created_asc', label: '가입일 오래된순', sort: 'createdAt', direction: 'asc' as const },
  { value: 'email_asc', label: '이메일 A-Z', sort: 'email', direction: 'asc' as const },
  { value: 'email_desc', label: '이메일 Z-A', sort: 'email', direction: 'desc' as const },
] as const

type UserSortValue = (typeof USER_SORT_OPTIONS)[number]['value']

function formatDate(value?: string | null, locale: string = 'ko-KR') {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date)
}

export default function UserAccountsPage() {
  useSessionGuard(1000 * 60 * 5)
  const pathname = usePathname() || '/ko'
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] === 'en' || segments[0] === 'ja' || segments[0] === 'ko' ? segments[0] : 'ko'
  const base = `/${locale}`

  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortOption, setSortOption] = useState<UserSortValue>(USER_SORT_OPTIONS[0].value)
  const [sortKey, setSortKey] = useState<'createdAt' | 'email'>('createdAt')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetch('/api/user/accounts', { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || '사용자 목록을 불러오지 못했습니다.')
        const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
        const mapped = (list as any[]).map((item) => ({
          userId: String(item.userId ?? item.user_id ?? ''),
          email: String(item.email ?? ''),
          displayName: item.displayName ?? item.display_name ?? '',
          status: item.status ?? 'ACTIVE',
          lastLoginAt: item.lastLoginAt ?? item.last_login_at ?? null,
          createdAt: item.createdAt ?? item.created_at ?? null,
        })) as UserAccount[]
        setUsers(mapped)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setUsers([])
        setError(err?.message || '사용자 목록을 불러오지 못했습니다.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [pageSize])

  const filteredUsers = useMemo(() => {
    let list = users
    if (search) {
      const lower = search.toLowerCase()
      list = list.filter((user) => {
        const target = `${user.email ?? ''} ${user.displayName ?? ''}`.toLowerCase()
        return target.includes(lower)
      })
    }
    if (statusFilter) {
      list = list.filter((user) => (user.status ?? '').toUpperCase() === statusFilter)
    }
    const sorted = [...list].sort((a, b) => {
      const av = (a[sortKey] ?? '').toString().toLowerCase()
      const bv = (b[sortKey] ?? '').toString().toLowerCase()
      if (av === bv) return 0
      if (direction === 'asc') return av > bv ? 1 : -1
      return av < bv ? 1 : -1
    })
    return sorted
  }, [users, search, statusFilter, sortKey, direction])

  const total = filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)

  const handleSortChange = (value: UserSortValue) => {
    setSortOption(value)
    const option = USER_SORT_OPTIONS.find((opt) => opt.value === value) ?? USER_SORT_OPTIONS[0]
    setSortKey(option.sort)
    setDirection(option.direction)
    setPage(1)
  }

  return (
    <>
      <PageHeading
        title="사용자 목록"
        description="플랫폼 사용자 계정을 조회합니다."
        breadcrumbs={[
          { name: '사용자 관리', href: `${base}/user/accounts` },
          { name: '사용자 목록' },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 dark:border-white/5">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              총 <span className="font-semibold text-gray-900 dark:text-white">{total}</span>명
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn-register">
                <PlusIcon className="size-4" aria-hidden="true" />
                사용자 등록
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="이메일 또는 이름 검색"
                  className="w-64 rounded-full border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="">전체 상태</option>
                <option value="ACTIVE">활성</option>
                <option value="PENDING">대기</option>
                <option value="SUSPENDED">중단</option>
              </select>
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value as UserSortValue)}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {USER_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              페이지당
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}명
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-white/10">
            <div className="max-h-[540px] overflow-auto">
              <table className="min-w-full divide-y.divide-gray-100 text-sm text-gray-900 dark:divide-white/10 dark:text-gray-100">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-4 py-3 sm:px-6">이메일</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">이름</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">상태</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">마지막 접속</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">가입일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {pagedUsers.map((user) => (
                    <tr key={user.userId} className="bg-white dark:bg-gray-900/40">
                      <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white sm:px-6">{user.email}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-200 sm:px-6">{user.displayName || '-'}</td>
                      <td className="px-4 py-4 sm:px-6">
                        <span className={classNames('inline-flex items-center px-3 py-1 text-xs font-semibold ring-1 ring-inset', STATUS_TONES[user.status?.toUpperCase?.() ?? 'ACTIVE'] ?? STATUS_TONES.ACTIVE)}>
                          {user.status ?? 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 sm:px-6">{formatDate(user.lastLoginAt, locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR')}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 sm:px-6">{formatDate(user.createdAt, locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {loading ? (
              <div className="border-t border-gray-100 px-6 py-6 text-center text-sm text-gray-500 dark:border-white/5 dark:text-gray-300">
                사용자 데이터를 불러오는 중입니다...
              </div>
            ) : null}
            {!loading && !total ? (
              <div className="border-t border-gray-100 px-6 py-10 text-center text-sm text-gray-500 dark:border-white/5 dark:text-gray-300">
                등록된 사용자 데이터가 없습니다.
              </div>
            ) : null}
          </div>

          {!loading ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div>
                총 <span className="font-semibold text-gray-900 dark:text-white">{total}</span>명
              </div>
              <div className="flex.items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10.dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
                >
                  이전
                </button>
                <span>
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
                >
                  다음
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </>
  )
}



