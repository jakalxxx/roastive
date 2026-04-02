"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useI18n } from '@/i18n/I18nProvider'
import { useAuth } from '@/components/auth/AuthProvider'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional().default(false),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage({ params }: { params: { locale: string } }) {
  const { t } = useI18n()
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const { login } = useAuth()
  const safeText = (key: string, fallback = '') => {
    const text = t(key)
    return text && !text.startsWith('auth.') ? text : fallback
  }

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
  })

  useEffect(() => {
    try {
      const remember = typeof window !== 'undefined' ? window.localStorage.getItem('rv_login_remember') : null
      const email = typeof window !== 'undefined' ? window.localStorage.getItem('rv_login_email') : null
      const password = typeof window !== 'undefined' ? window.localStorage.getItem('rv_login_password') : null
      if (remember === '1' && email && password) {
        reset({ email, password, remember: true })
      }
    } catch {}
  }, [reset])

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      await login(values.email, values.password)
      try {
        if (values.remember) {
          window.localStorage.setItem('rv_login_remember', '1')
          window.localStorage.setItem('rv_login_email', values.email)
          window.localStorage.setItem('rv_login_password', values.password)
        } else {
          window.localStorage.removeItem('rv_login_remember')
          window.localStorage.removeItem('rv_login_email')
          window.localStorage.removeItem('rv_login_password')
        }
      } catch {}
      const dest = `/${params.locale}/dashboard` as Route
      router.replace(dest)
      setTimeout(() => { try { window.location.assign(dest as string) } catch {} }, 50)
    } catch (e: any) {
      setServerError(e?.message || 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white lg:flex-row">
      <div
        className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-indigo-600 bg-cover bg-center lg:flex"
        style={{ backgroundImage: 'url(/assets/login-bg.jpg)' }}
      >
        <img src="/assets/roastive-logo.svg" alt="Roastive" className="absolute left-8 top-8 h-10 w-auto mix-blend-screen dark:hidden" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 opacity-80" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">{safeText('auth.login.tagline', 'Smart Roasting Platform')}</p>
            <h1 className="mt-6 text-4xl font-bold leading-tight">Roastive</h1>
            <p className="mt-4 max-w-sm text-base text-white/90">
              {safeText('auth.login.description', '원료 입출고부터 판매까지, 로스터리를 위한 올인원 운영 플랫폼입니다.')}
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
            <p className="text-sm text-white/70">{safeText('auth.login.highlight', '현재 연결된 로스터리 수')}</p>
            <p className="mt-2 text-3xl font-semibold">42</p>
            <p className="mt-1 text-xs text-white/60">Updated 5 mins ago</p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-6 py-16 sm:px-10 lg:w-2/5">
        <div className="w-full max-w-md space-y-10">
          <div className="flex flex-col items-center gap-4 lg:hidden">
            <img alt="Roastive" src="/assets/roastive-logo.svg" className="h-10 w-auto dark:hidden" />
            <img alt="Roastive" src="/assets/roastive-logo.svg" className="hidden h-10 w-auto dark:block" />
          </div>
          <div className="hidden items-center justify-center lg:flex">
            <img alt="Roastive" src="/assets/roastive-logo.svg" className="h-12 w-auto" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{safeText('auth.login.subtitle', 'Welcome back')}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">{safeText('auth.login.title', '로그인')}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{safeText('auth.login.subcopy', '계정으로 로그인해 로스터리 운영을 시작하세요.')}</p>
          </div>

          {serverError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                {safeText('auth.email', '이메일')}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {safeText('auth.password', '비밀번호')}
                </label>
                <a href="#" tabIndex={-1} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  {safeText('auth.forgot', '비밀번호 찾기')}
                </a>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" className="mr-2 size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" {...register('remember')} />
                {safeText('auth.remember', '로그인 상태 유지')}
              </label>
              <span className="text-xs text-gray-400 dark:text-gray-500">{safeText('auth.login.secure', 'TLS 1.3 Encrypted')}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {safeText('auth.signin', '로그인')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {safeText('auth.notMember', '아직 계정이 없으신가요?')}{" "}
            <a href={`/${params.locale}/signup`} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              {safeText('auth.freeTrial', '무료 체험 신청')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
