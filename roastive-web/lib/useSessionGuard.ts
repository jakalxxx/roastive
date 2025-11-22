'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const LOCALES = ['ko','en','ja'] as const

export function useSessionGuard(intervalMs: number = 10000) {
  const pathname = usePathname() || '/ko'
  useEffect(() => {
    let mounted = true
    const timer = setInterval(async () => {
      if (!mounted) return
      try {
        const res = await fetch('/api/roastery/settings', { cache: 'no-store', credentials: 'include' })
        if (res.status === 401) {
          const seg = (pathname || '/ko').split('/').filter(Boolean)
          const locale = LOCALES.includes(seg[0] as any) ? seg[0] : 'ko'
          window.location.href = `/${locale}/login`
        }
      } catch {}
    }, intervalMs)
    return () => { mounted = false; clearInterval(timer) }
  }, [pathname, intervalMs])
}





