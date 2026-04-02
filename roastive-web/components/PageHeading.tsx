'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'

export interface BreadcrumbItem {
  name: string
  href?: string | Route
}

export interface PageHeadingProps {
  title: string
  description?: string
  meta?: ReactNode
  actions?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export function PageHeading({ title, description, meta, actions, breadcrumbs }: PageHeadingProps) {
  return (
    <div className="sticky top-[3.5rem] z-20 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-white/10 dark:bg-gray-900/90 dark:supports-[backdrop-filter]:bg-gray-900/70 lg:top-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className="mb-4 w-full rounded-2xl bg-gray-50/95 px-6 py-3 text-sm font-medium text-gray-600 ring-1 ring-gray-200 shadow-sm dark:bg-gray-900/70 dark:text-gray-300 dark:ring-white/10"
            aria-label="Breadcrumb"
          >
            <ol role="list" className="flex flex-wrap items-center gap-3">
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1
                const showHome = index === 0
                return (
                  <li key={item.name} className="flex items-center gap-3">
                    {index !== 0 && <ChevronRightIcon className="size-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />}
                    {item.href && !isLast ? (
                      <Link
                        href={item.href as Route}
                        className="inline-flex items-center gap-2 text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      >
                        {showHome && <HomeIcon className="size-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />}
                        {item.name}
                      </Link>
                    ) : (
                      <span
                        className={classNames(
                          'inline-flex items-center gap-2',
                          isLast ? 'text-indigo-700 dark:text-indigo-200' : 'text-gray-600 dark:text-gray-300'
                        )}
                        aria-current={isLast ? 'page' : undefined}
                      >
                        {showHome && <HomeIcon className="size-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />}
                        {item.name}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}
        <div className="flex items-center justify-between py-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl/8 font-semibold text-gray-900 dark:text-white sm:text-3xl/9">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
            {meta && (
              <div className="mt-2">
                {meta}
              </div>
            )}
          </div>
          {actions && (
            <div className="ml-4 flex shrink-0 items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

