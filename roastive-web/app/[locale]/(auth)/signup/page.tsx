"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useI18n } from '@/i18n/I18nProvider'
import { register as registerApi } from '@/lib/auth'

const schema = z.object({
  display_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  accept: z.boolean().refine(v => v === true, 'required'),
}).refine((v) => v.password === v.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] })

type FormValues = z.infer<typeof schema>

export default function SignupPage({ params }: { params: { locale: string } }) {
  const { t } = useI18n()
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { display_name: '', email: '', password: '', confirmPassword: '', accept: false },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      await registerApi({ email: values.email, password: values.password, display_name: values.display_name, autoLogin: true })
      router.push(`/${params.locale}/dashboard`)
    } catch (e: any) {
      setServerError(e?.message || 'Register failed')
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img alt="Your Company" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" className="mx-auto h-10 w-auto dark:hidden" />
        <img alt="Your Company" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" className="mx-auto h-10 w-auto hidden dark:block" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">{t('auth.signup.title')}</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {serverError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">{t('auth.displayName')}</label>
            <div className="mt-2">
              <input className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('display_name')} />
            </div>
            {errors.display_name && <p className="mt-1 text-sm text-red-600">{errors.display_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">{t('auth.email')}</label>
            <div className="mt-2">
              <input type="email" autoComplete="email" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('email')} />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">{t('auth.password')}</label>
            <div className="mt-2">
              <input type="password" autoComplete="new-password" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('password')} />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">{t('auth.confirm')}</label>
            <div className="mt-2">
              <input type="password" autoComplete="new-password" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500" {...register('confirmPassword')} />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex items-center">
            <input id="accept" type="checkbox" className="mr-2 size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" {...register('accept')} />
            <label htmlFor="accept" className="text-sm text-gray-700 dark:text-gray-300">{t('auth.acceptTerms')}</label>
          </div>

          <div>
            <button type="submit" disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500">
              {t('auth.signup')}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
          {t('auth.hasAccount')} {" "}
          <a href={`/${params.locale}/login`} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">{t('auth.signinLink')}</a>
        </p>
      </div>
    </div>
  )
}




