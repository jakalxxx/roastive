'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import type { ReactNode } from 'react'

type DropdownItem = {
  label: string
  onSelect: () => void
  danger?: boolean
}

type SectionHeadingTab = { label: string; value: string }

type SectionHeadingProps = {
  title: string
  description?: string
  badge?: { label: string; tone?: 'gray' | 'green' | 'blue' | 'indigo' }
  dropdownItems?: DropdownItem[]
  actions?: ReactNode
  tabs?: SectionHeadingTab[]
  currentTab?: string
  onTabChange?: (value: string) => void
}

const BADGE_CLASS: Record<NonNullable<SectionHeadingProps['badge']>['tone'], string> = {
  gray: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200',
  green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200',
}

export function SectionHeading({
  title,
  description,
  badge,
  dropdownItems,
  actions,
  tabs,
  currentTab,
  onTabChange,
}: SectionHeadingProps) {
  const activeTab = currentTab ?? tabs?.[0]?.value

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-6 dark:border-white/10">
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {badge && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_CLASS[badge.tone ?? 'gray']}`}>
              {badge.label}
            </span>
          )}
        </div>
        {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        {tabs && tabs.length > 0 ? (
          <div className="mt-4 inline-flex flex-wrap gap-2 rounded-full bg-gray-100 p-1 text-sm font-semibold dark:bg-gray-800">
            {tabs.map((tab) => {
              const isActive = tab.value === activeTab
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onTabChange?.(tab.value)}
                  className={classNames(
                    'rounded-full px-4 py-2 transition focus-visible:outline-none',
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 dark:bg-gray-700 dark:text-white dark:ring-white/10'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {dropdownItems && dropdownItems.length > 0 && (
          <Menu as="div" className="relative">
            <MenuButton className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/5">
              <EllipsisHorizontalIcon className="size-5" aria-hidden="true" />
              <span className="sr-only">더보기</span>
            </MenuButton>
            <MenuItems className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-900 dark:ring-white/10">
              {dropdownItems.map((item) => (
                <MenuItem key={item.label}>
                  {({ focus }) => (
                    <button
                      onClick={item.onSelect}
                      className={`block w-full px-4 py-2 text-left text-sm ${item.danger ? 'text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-white/10'} ${focus ? 'bg-gray-50 dark:bg-white/10' : ''}`}
                    >
                      {item.label}
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        )}
      </div>
    </div>
  )
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

















