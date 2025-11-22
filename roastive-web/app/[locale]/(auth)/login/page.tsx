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
      // 라우터 내비게이션 + 하드 네비게이션 폴백
      router.replace(dest)
      setTimeout(() => { try { window.location.assign(dest as string) } catch {} }, 50)
    } catch (e: any) {
      setServerError(e?.message || 'Login failed')
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img alt="Your Company" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" className="mx-auto h-10 w-auto dark:hidden" />
        <img alt="Your Company" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" className="mx-auto h-10 w-auto hidden dark:block" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">{t('auth.login.title')}</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {serverError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">{t('auth.email')}</label>
            <div className="mt-2">
              <input id="email" type="email" autoComplete="email"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                {...register('email')} />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">{t('auth.password')}</label>
              <div className="text-sm">
                <a href="#" tabIndex={-1} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">{t('auth.forgot')}</a>
              </div>
            </div>
            <div className="mt-2">
              <input id="password" type="password" autoComplete="current-password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                {...register('password')} />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="flex items-center">
            <input id="remember" type="checkbox" className="mr-2 size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" {...register('remember')} />
            <label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">{t('auth.remember')}</label>
          </div>

          <div>
            <button type="submit" disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500">
              {t('auth.signin')}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
          {t('auth.notMember')} {" "}
          <a href={`/${params.locale}/signup`} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">{t('auth.freeTrial')}</a>
        </p>
      </div>
    </div>
  )
}



