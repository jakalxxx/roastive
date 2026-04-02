'use client'

import type { JSX, ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  TransitionChild,
} from '@headlessui/react'
import { Bars3Icon, ChevronRightIcon } from '@heroicons/react/20/solid'
import {
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  PhoneArrowUpRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { CameraIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/components/auth/AuthProvider'
import { apiFetch } from '@/lib/api'

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type MenuNode = {
  menuId: string
  menuKey: string
  title: string
  path?: string | null
  depth: number
  children?: MenuNode[]
}

const MENU_FALLBACK_PATHS: Record<string, string> = {
  HOME_DASHBOARD: '/dashboard',
  ORDER_LIST: '/orders',
  PRODUCTION_LIST: '/production',
  PRODUCT_LIST: '/products',
  USER_CUSTOMER_LIST: '/user/customers',
  USER_ACCOUNT_LIST: '/user/accounts',
  USER_ROASTERY_LIST: '/user/roasteries',
  PROCUREMENT_GREEN_BEAN: '/procurement/green-bean',
  PROCUREMENT_MATERIAL: '/procurement/materials',
  PROCUREMENT_CONTRACT: '/procurement/contracts',
  PROCUREMENT_ITEM: '/procurement/items',
  INBOUND_GREEN_BEAN: '/inbound/green-bean',
  INBOUND_SILO: '/inbound/silos',
  USER_SUPPLIER_LIST: '/procurement/suppliers',
  ROASTERY_INFO: '/roastery/settings',
  ROASTERY_SITE: '/roastery/settings/sites',
  ROASTERY_CONTACT: '/roastery/settings/contacts',
  EQUIPMENT_ROASTER: '/equipment/roasters',
  EQUIPMENT_SILO: '/equipment/silos',
  EQUIPMENT_WAREHOUSE: '/equipment/warehouses',
  INVENTORY_WAREHOUSE: '/inventory/warehouses',
  INVENTORY_SILO: '/inventory/silos',
  SETTLEMENT_LIST: '/settlement',
  SETTLEMENT_TAX: '/settlement/tax',
  SETTLEMENT_STATEMENT: '/settlement/statement',
  MATERIAL_LEDGER: '/procurement/materials/ledger',
  MATERIAL_LEDGER_EXPORT: '/procurement/materials/ledger',
  SYSTEM_GENERAL: '/system/settings',
  SYSTEM_FAQ: '/system/settings/faq',
  SYSTEM_QNA: '/system/settings/qna',
  SYSTEM_ROLE: '/system/roles',
  ANALYTICS_SALES: '/sales/reports',
}

const isSystemSettingsNode = (node: MenuNode) => {
  const title = (node.title || '').trim()
  return node.menuKey === 'SYSTEM_GENERAL' || title.includes('시스템 설정')
}

const shouldRemoveNode = (node: MenuNode) => {
  const title = (node.title || '').trim()
  return node.menuKey === 'PRODUCT_CREATE' || title.includes('제품등록')
}

const createSystemChild = (type: 'faq' | 'qna', depth: number): MenuNode => {
  const isFaq = type === 'faq'
  return {
    menuId: `custom-system-${type}`,
    menuKey: isFaq ? 'SYSTEM_FAQ' : 'SYSTEM_QNA',
    title: isFaq ? 'FAQ' : 'Q&A',
    path: isFaq ? '/system/settings/faq' : '/system/settings/qna',
    depth,
    children: [],
  }
}

const customizeMenuTree = (nodes: MenuNode[], parentDepth = 0): MenuNode[] => {
  return nodes
    .map((node) => {
      if (shouldRemoveNode(node)) return null
      const next: MenuNode = {
        ...node,
        children: node.children ? customizeMenuTree(node.children, node.depth ?? parentDepth + 1) : undefined,
      }
      if (isSystemSettingsNode(next)) {
        const childDepth = (next.depth ?? parentDepth) + 1
        const children = next.children ? [...next.children] : []
        if (!children.some((child) => child.menuKey === 'SYSTEM_FAQ')) {
          children.push(createSystemChild('faq', childDepth))
        }
        if (!children.some((child) => child.menuKey === 'SYSTEM_QNA')) {
          children.push(createSystemChild('qna', childDepth))
        }
        next.children = children
      }
      return next
    })
    .filter(Boolean) as MenuNode[]
}

const SUPPORT_LINKS = [
  {
    name: 'KAKAO',
    href: 'https://pf.kakao.com/_support',
    external: true,
    icon: ChatBubbleLeftRightIcon,
  },
  { name: 'TEL', href: 'tel:+821041122356', external: false, icon: PhoneArrowUpRightIcon },
  { name: 'SNS', href: 'https://instagram.com/_standardsquare_', external: true, icon: CameraIcon },
] as const

const MENU_CACHE_PREFIX = 'roastive:menu-cache:'

const readMenuCache = (locale: string): MenuNode[] | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(`${MENU_CACHE_PREFIX}${locale}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch (error) {
    console.warn('메뉴 캐시를 불러오지 못했습니다.', error)
    return null
  }
}

const writeMenuCache = (locale: string, items: MenuNode[]) => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(`${MENU_CACHE_PREFIX}${locale}`, JSON.stringify(items))
  } catch (error) {
    console.warn('메뉴 캐시를 저장하지 못했습니다.', error)
  }
}

export default function AppShellLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  const { logout, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const base = `/${params.locale}`

  const [menus, setMenus] = useState<MenuNode[]>([])
  const [menusLoading, setMenusLoading] = useState(true)

  useEffect(() => {
    let active = true
    const cached = readMenuCache(params.locale)
    if (cached?.length) {
      const customized = customizeMenuTree(cached)
      setMenus(customized)
      setMenusLoading(false)
    } else {
      setMenusLoading(true)
    }
    apiFetch(`/v2/menus?locale=${params.locale}`)
      .then((data) => {
        if (!active) return
        const nextMenus = Array.isArray(data) ? (data as MenuNode[]) : []
        const customized = customizeMenuTree(nextMenus)
        setMenus(customized)
        writeMenuCache(params.locale, customized)
      })
      .catch((err) => {
        console.error('메뉴를 불러오지 못했습니다.', err)
      })
      .finally(() => {
        if (active) setMenusLoading(false)
      })
    return () => {
      active = false
    }
  }, [params.locale])

  const buildHref = useCallback(
    (path?: string | null, menuKey?: string) => {
      const fallback = menuKey ? MENU_FALLBACK_PATHS[menuKey] : undefined
      const candidate = path || fallback
      if (!candidate) return undefined
      if (/^https?:\/\//i.test(candidate)) return candidate
      const normalized = candidate.startsWith('/') ? candidate : `/${candidate}`
      return `${base}${normalized}`
    },
    [base]
  )

  const isCurrentPath = useCallback(
    (path?: string | null, menuKey?: string) => {
      const href = buildHref(path, menuKey)
      return Boolean(href && pathname?.startsWith(href))
    },
    [buildHref, pathname]
  )

  const isNodeActive = useCallback(
    (node: MenuNode): boolean => {
      if (isCurrentPath(node.path, node.menuKey)) return true
      return node.children?.some((child) => isNodeActive(child)) ?? false
    },
    [isCurrentPath]
  )

  const indentLevels = ['pl-5', 'pl-7', 'pl-9', 'pl-11', 'pl-13', 'pl-15']
  const menuTypographyClass = 'text-[clamp(0.68rem,0.32vw+0.55rem,0.95rem)] leading-[1.45]'
  const getIndentClass = (level: number) => {
    if (level <= 0) return ''
    return indentLevels[Math.min(level - 1, indentLevels.length - 1)]
  }

  const renderMenuNodes = (
    nodes: MenuNode[],
    level = 0,
    variant: 'mobile' | 'desktop',
    onNavigate?: () => void
  ): JSX.Element | null => {
    if (!nodes?.length) return null
    return (
      <ul role="list" className={level === 0 ? '-mx-2 space-y-1' : 'space-y-1'}>
        {nodes.map((node) => {
          const key = node.menuId || node.menuKey
          const indentClass = getIndentClass(level)
          const href = buildHref(node.path, node.menuKey)
          const hasChildren = Boolean(node.children?.length)
          const active = isNodeActive(node)

          if (hasChildren) {
            return (
              <li key={key}>
                <Disclosure as="div" defaultOpen={active} className="group">
                  {({ open }) => (
                    <>
                      <DisclosureButton
                        className={classNames(
                          active
                            ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white'
                            : 'text-gray-700 dark:text-gray-200',
                          'flex w-full items-center justify-between rounded-md px-3 py-2 text-left font-semibold hover:bg-gray-50 hover:text-indigo-600 dark:hover:bg-white/5 dark:hover:text-white',
                          menuTypographyClass,
                          indentClass
                        )}
                      >
                        <span className="flex-1 min-w-0 break-words pr-3 text-left">{node.title}</span>
                        <ChevronRightIcon
                          aria-hidden="true"
                          className={classNames(
                            open ? 'rotate-90 text-indigo-600' : 'text-gray-400',
                            'size-5 transition-transform'
                          )}
                        />
                      </DisclosureButton>
                      <DisclosurePanel className="mt-1 pl-1">
                        {renderMenuNodes(node.children ?? [], level + 1, variant, onNavigate)}
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              </li>
            )
          }

          return (
            <li key={key}>
              {href ? (
                <a
                  href={href}
                  onClick={() => {
                    if (variant === 'mobile') onNavigate?.()
                  }}
                    className={classNames(
                    isCurrentPath(node.path, node.menuKey)
                      ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                      'block rounded-md py-2 pr-2 text-left',
                      menuTypographyClass,
                      'break-words whitespace-normal',
                    indentClass || (variant === 'desktop' ? 'pl-3' : 'pl-4')
                  )}
                >
                  {node.title}
                </a>
              ) : (
                <span
                  className={classNames(
                    'block cursor-not-allowed rounded-md py-2 pr-2 text-left text-gray-400 dark:text-gray-500',
                    menuTypographyClass,
                    'break-words whitespace-normal',
                    indentClass || (variant === 'desktop' ? 'pl-3' : 'pl-4')
                  )}
                >
                  {node.title}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  const renderNavigation = (variant: 'mobile' | 'desktop', onNavigate?: () => void) => {
    if (!menus.length) {
      return (
        <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:bg-white/5 dark:text-gray-300">
          {menusLoading ? '메뉴를 불러오는 중입니다...' : '표시할 메뉴가 없습니다.'}
        </div>
      )
    }
    return renderMenuNodes(menus, 0, variant, onNavigate)
  }

  const displayName = user?.user?.display_name || user?.user?.email || '사용자'
  const secondaryInfo =
    user?.user?.display_name && user?.user?.email && user?.user?.display_name !== user?.user?.email
      ? user?.user?.email
      : ''
  const roasteries = Array.isArray(user?.roasteries) ? (user?.roasteries as Array<any>) : []
  const primaryRoastery = roasteries[0] as any
  const companyName = primaryRoastery?.legal_name || '회사 정보 없음'

  const handleLogout = useCallback(async () => {
    await logout()
    window.location.href = `${base}/login`
  }, [base, logout])

  const renderUserInfo = () => (
    <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold text-gray-600 dark:text-gray-300">{companyName}</p>
          <p className="truncate text-base font-semibold text-gray-900 dark:text-white">{displayName}</p>
          {secondaryInfo ? <p className="truncate text-xs text-gray-500 dark:text-gray-300">{secondaryInfo}</p> : null}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:border-white/10 dark:text-gray-200 dark:hover:border-white/20 dark:hover:text-white dark:focus-visible:outline-white/40"
        >
          <span className="sr-only">로그아웃</span>
          <ArrowRightOnRectangleIcon aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  )

  const renderLogoCard = () => (
    <div className="flex items-center justify-center py-2">
      <img alt="Roastive" src="/assets/roastive-logo.svg" className="h-12 w-auto" />
    </div>
  )

  const renderSloganCard = () => (
    <div className="space-y-1 rounded-lg border border-gray-100 bg-white p-4 text-xs text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
      <p className="text-base font-semibold text-gray-900 dark:text-white">로스티브</p>
      <p className="italic">Smart Roasting & Archive System</p>
      <p className="italic">스마트 로스팅 데이터 아카이브 시스템</p>
    </div>
  )

  const renderSupportCard = () => (
    <div className="rounded-lg border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">고객센터</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {SUPPORT_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-100 bg-white px-2 py-3 text-center text-xs font-medium text-gray-700 transition hover:border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-gray-200 dark:hover:border-white/20 dark:hover:bg-white/10"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
              <link.icon className="size-4" aria-hidden="true" />
            </span>
            {link.name}
          </a>
        ))}
      </div>
    </div>
  )

  const renderMenuCard = (variant: 'mobile' | 'desktop', onNavigate?: () => void) => (
    <div className="rounded-lg border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      {renderNavigation(variant, onNavigate)}
    </div>
  )

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop transition className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0" />
        <div className="fixed inset-0 flex">
          <DialogPanel transition className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full">
            <TransitionChild>
              <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>
            <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-6 dark:bg-gray-900 dark:ring dark:ring-white/10 dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:bg-black/10">
              <div className="flex flex-col gap-6">
                {renderLogoCard()}
                {renderSloganCard()}
                {renderUserInfo()}
                {renderMenuCard('mobile', () => setSidebarOpen(false))}
                {renderSupportCard()}
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="relative flex grow flex-col border-r border-gray-200 bg-white px-6 pb-6 dark:border-white/10 dark:bg-black/10">
          <div className="flex h-full flex-col gap-6 overflow-y-auto pb-6">
            {renderLogoCard()}
            {renderSloganCard()}
            {renderUserInfo()}
            {renderMenuCard('desktop')}
            {renderSupportCard()}
          </div>
        </div>
      </div>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 shadow-xs dark:border-white/10 dark:bg-gray-900 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">메뉴</span>
        </div>

        <main className="px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pb-40">
          {children}
        </main>
        <footer className="px-4 pb-8 text-center text-xs text-gray-500 sm:px-6 lg:px-8 lg:sticky lg:bottom-0 lg:bg-white/95 lg:py-6 dark:text-gray-400 dark:lg:bg-gray-900/95">
          <p className="font-bold">© 2024 ROASTIVE. All rights reserved.</p>
          <p className="italic">스마트 로스팅 데이터 아카이브 시스템 | Smart Roasting & Active Archiving System</p>
          <p>로스티브의 모든 콘텐츠와 기능은 저작권법의 보호를 받습니다.</p>
        </footer>
      </div>

    </div>
  )
}
