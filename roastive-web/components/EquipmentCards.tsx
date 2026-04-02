'use client'

import type { ReactNode } from 'react'
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline'

export type EquipmentCardAttribute = {
  label: string
  value: ReactNode
}

export type EquipmentCardItem = {
  id: string
  name: string
  code?: string
  description?: string
  area?: string
  initials?: string
  avatarClassName?: string
  status?: {
    label: string
    tone?: 'brand' | 'success' | 'warning' | 'danger' | 'muted'
  }
  attributes?: EquipmentCardAttribute[]
}

interface EquipmentCardsProps {
  items: EquipmentCardItem[]
  emptyMessage?: string
  onView?: (item: EquipmentCardItem) => void
  onDelete?: (item: EquipmentCardItem) => void
}

const STATUS_TONE_CLASSES: Record<NonNullable<EquipmentCardItem['status']>['tone'], string> = {
  brand: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-400/40',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/40',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/40',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-400/40',
  muted: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/30',
}

const DEFAULT_AVATAR = 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-200'

export function EquipmentCards({ items, emptyMessage = '등록된 장비가 없습니다.', onView, onDelete }: EquipmentCardsProps) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-gray-900 dark:text-gray-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.id}
          className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10"
        >
          <div className="flex items-start gap-4 p-6">
            <div
              className={classNames(
                'flex size-14 items-center justify-center rounded-xl text-base font-semibold uppercase tracking-tight',
                item.avatarClassName || DEFAULT_AVATAR
              )}
            >
              {item.initials || item.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  {item.code && <p className="text-sm text-gray-500 dark:text-gray-400">{item.code}</p>}
                </div>
                <div className="flex items-center gap-2">
                {item.status?.label && (
                  <span
                    className={classNames(
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                      STATUS_TONE_CLASSES[item.status.tone ?? 'brand']
                    )}
                  >
                    {item.status.label}
                  </span>
                )}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onView?.(item)}
                      title="상세조회"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/30 dark:hover:text-white"
                    >
                      <span className="sr-only">{`${item.name} 상세조회`}</span>
                      <EyeIcon aria-hidden="true" className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(item)}
                      title="삭제"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-rose-100 text-rose-500 transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                    >
                      <span className="sr-only">{`${item.name} 삭제`}</span>
                      <TrashIcon aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
              {item.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
              )}
              {item.area && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{item.area}</p>
              )}
            </div>
          </div>
          {item.attributes && item.attributes.length > 0 && (
            <dl className="grid gap-x-6 gap-y-4 border-t border-gray-100 px-6 py-4 text-sm text-gray-600 dark:border-white/5 dark:text-gray-300 sm:grid-cols-2">
              {item.attributes.map((attribute) => (
                <div key={`${item.id}-${attribute.label}`} className="flex flex-col">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {attribute.label}
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{attribute.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </article>
      ))}
    </div>
  )
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
