'use client'

import type { ReactNode } from 'react'
import { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild, Menu, MenuButton, MenuItem, MenuItems, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, BellIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { HomeIcon, UsersIcon, FolderIcon, CalendarIcon, DocumentDuplicateIcon, ChartPieIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { LangSwitcher } from '@/components/LangSwitcher'
import { useAuth } from '@/components/auth/AuthProvider'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function AppShellLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const base = `/${params.locale}`

  const navigation = useMemo(() => ([
    { name: '홈', href: `${base}/dashboard`, icon: HomeIcon },
    { name: '로스터리 관리', href: `${base}/roastery/settings`, icon: Cog6ToothIcon },
    { name: '구매 관리', icon: FolderIcon, children: [
      { name: '구매 내역 (생두)', href: `${base}/procurement/green-bean` },
      { name: '구매 내역 (부자재)', href: `${base}/procurement/materials` },
      { name: '구매처 관리', href: `${base}/procurement/suppliers` },
      { name: '계약 관리', href: `${base}/procurement/contracts` },
      { name: '상품 관리', href: `${base}/procurement/items` },
    ] },
    { name: 'Documents', href: '#', icon: DocumentDuplicateIcon },
    { name: 'Reports', href: '#', icon: ChartPieIcon },
    
  ]), [base])

  const userNavigation = useMemo(() => ([
    { name: '프로필', action: () => {} },
    { name: '로그아웃', action: async () => { await logout(); window.location.href = `/${params.locale}/login`; } },
  ]), [logout, params.locale])

  const isCurrent = (href: string) => pathname?.startsWith(href)
  const isGroupOpen = (children: Array<{href:string}>) => children.some((c) => isCurrent(c.href))

  return (
    <div>
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
            <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 dark:bg-gray-900 dark:ring dark:ring-white/10 dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:bg-black/10">
              <div className="relative flex h-16 shrink-0 items-center">
                <img alt="Your Company" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" className="h-8 w-auto dark:hidden" />
                <img alt="Your Company" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" className="h-8 w-auto hidden dark:block" />
              </div>
              <nav className="relative flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item: any) => (
                        <li key={item.name}>
                          {!item.children ? (
                            <a href={item.href} className={classNames(isCurrent(item.href) ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white','group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold')}>
                              <item.icon aria-hidden="true" className={classNames(isCurrent(item.href) ? 'text-indigo-600 dark:text-white' : 'text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white','size-6 shrink-0')} />
                              {item.name}
                            </a>
                          ) : (
                            <Disclosure as="div" defaultOpen={isGroupOpen(item.children)} className="group">
                              {({ open }) => (
                                <>
                                  <DisclosureButton
                                    className={classNames(
                                      (open || isGroupOpen(item.children)) ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white' : '',
                                      'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                                    )}
                                  >
                                    <item.icon aria-hidden="true" className="size-6 shrink-0 text-gray-400 dark:text-current" />
                                    {item.name}
                                    <ChevronRightIcon
                                      aria-hidden="true"
                                      className={classNames(
                                        open ? 'rotate-90 text-indigo-600' : 'text-gray-400',
                                        'ml-auto size-5 shrink-0 transition-transform'
                                      )}
                                    />
                                  </DisclosureButton>
                                  <DisclosurePanel as="ul" className="mt-1 px-2">
                                    {item.children.map((sub: any) => (
                                      <li key={sub.name}>
                                        <a
                                          href={sub.href}
                                          className={classNames(
                                            isCurrent(sub.href) ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white' : '',
                                            'block rounded-md py-2 pr-2 pl-9 text-sm/6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                                          )}
                                        >
                                          {sub.name}
                                        </a>
                                      </li>
                                    ))}
                                  </DisclosurePanel>
                                </>
                              )}
                            </Disclosure>
                          )}
                        </li>
                      ))}
                                      <li className="-mx-6 mt-auto">
                  <a
                    href="#"
                    className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                  >
                    <img
                      alt=""
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                    />
                    <span className="sr-only">Your profile</span>
                    <span aria-hidden="true">Tom Cook</span>
                  </a>
                </li>
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4 dark:border-white/10 dark:bg-black/10">
          <div className="flex h-16 shrink-0 items-center">
            <img alt="Your Company" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" className="h-8 w-auto dark:hidden" />
            <img alt="Your Company" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" className="h-8 w-auto hidden dark:block" />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item: any) => (
                    <li key={item.name}>
                      {!item.children ? (
                        <a href={item.href} className={classNames(isCurrent(item.href) ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white','group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold')}>
                          <item.icon aria-hidden="true" className={classNames(isCurrent(item.href) ? 'text-indigo-600 dark:text-white' : 'text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white','size-6 shrink-0')} />
                          {item.name}
                        </a>
                      ) : (
                        <Disclosure as="div" defaultOpen={isGroupOpen(item.children)} className="group">
                          {({ open }) => (
                            <>
                              <DisclosureButton
                                className={classNames(
                                  (open || isGroupOpen(item.children)) ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white' : '',
                                  'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                                )}
                              >
                                <item.icon aria-hidden="true" className="size-6 shrink-0 text-gray-400 dark:text-current" />
                                {item.name}
                                <ChevronRightIcon
                                  aria-hidden="true"
                                  className={classNames(
                                    open ? 'rotate-90 text-indigo-600' : 'text-gray-400',
                                    'ml-auto size-5 shrink-0 transition-transform'
                                  )}
                                />
                              </DisclosureButton>
                              <DisclosurePanel as="ul" className="mt-1 px-2">
                                {item.children.map((sub: any) => (
                                  <li key={sub.name}>
                                    <a
                                      href={sub.href}
                                      className={classNames(
                                        isCurrent(sub.href) ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white' : '',
                                        'block rounded-md py-2 pr-2 pl-9 text-sm/6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                                      )}
                                    >
                                      {sub.name}
                                    </a>
                                  </li>
                                ))}
                              </DisclosurePanel>
                            </>
                          )}
                        </Disclosure>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8 dark:border-white/10 dark:bg-gray-900 dark:shadow-none">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden dark:text-gray-400 dark:hover:text-white">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <div aria-hidden="true" className="h-6 w-px bg-gray-200 lg:hidden dark:bg-white/10" />
          <div className="flex flex-1" />
          <LangSwitcher currentLocale={params.locale as 'ko'|'en'|'ja'} />
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-white">
            <span className="sr-only">View notifications</span>
            <BellIcon aria-hidden="true" className="size-6" />
          </button>
          <div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-white/10" />
          <Menu as="div" className="relative">
            <MenuButton className="relative flex items-center">
              <span className="absolute -inset-1.5" />
              <span className="sr-only">Open user menu</span>
              <img
                alt=""
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
              />
              <span className="hidden lg:flex lg:items-center">
                <span aria-hidden="true" className="ml-4 text-sm/6 font-semibold text-gray-900 dark:text-white">{(useAuth().user as any)?.user?.display_name || (useAuth().user as any)?.user?.email || ''}</span>
                <ChevronDownIcon aria-hidden="true" className="ml-2 size-5 text-gray-400 dark:text-gray-500" />
              </span>
            </MenuButton>
            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg outline-1 outline-gray-900/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
            >
              {userNavigation.map((item) => (
                <MenuItem key={item.name}>
                  <button onClick={item.action} className="block w-full px-3 py-1 text-left text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden dark:text-white dark:data-focus:bg-white/5">
                    {item.name}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>

        </div>

        <main>
          {children}
        </main>
      </div>
    </div>
  )
}



