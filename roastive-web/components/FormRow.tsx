'use client'

import type { ReactNode } from 'react'

type FormRowProps = {
  label: string
  htmlFor?: string
  description?: string
  children: ReactNode
}

export function FormRow({ label, htmlFor, description, children }: FormRowProps) {
  return (
    <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-6">
      <div>
        <label htmlFor={htmlFor} className="block text-sm/6 font-medium text-gray-900 dark:text-white sm:mt-2">
          {label}
        </label>
        {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      <div className="mt-2 sm:col-span-3 sm:mt-0">
        {children}
      </div>
    </div>
  )
}







































