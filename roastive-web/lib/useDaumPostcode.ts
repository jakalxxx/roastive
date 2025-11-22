'use client'

import { useCallback, useEffect, useState } from 'react'

type DaumPostcodeData = {
  zonecode: string
  roadAddress: string
  jibunAddress: string
  buildingName?: string
  apartment?: string
  sido?: string
  sigungu?: string
}

export type AddressSelectResult = {
  postalCode: string
  address1: string
  address2Suggestion?: string
}

export function useDaumPostcode() {
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window as any
    if (w.daum && w.daum.Postcode) {
      setLoaded(true)
      return
    }
    const id = 'daum-postcode-script'
    if (document.getElementById(id)) {
      // Script tag exists; wait a tick and mark loaded when ready
      const timer = setInterval(() => {
        if (w.daum && w.daum.Postcode) {
          setLoaded(true)
          clearInterval(timer)
        }
      }, 50)
      return () => clearInterval(timer)
    }
    const s = document.createElement('script')
    s.id = id
    s.async = true
    s.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    s.onload = () => setLoaded(true)
    document.head.appendChild(s)
    return () => {
      // keep script cached; no cleanup
    }
  }, [])

  const open = useCallback((onSelect: (r: AddressSelectResult) => void) => {
    if (typeof window === 'undefined') return
    const w = window as any
    if (!(w.daum && w.daum.Postcode)) return
    setLoading(true)
    new w.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        const base = data.roadAddress || data.jibunAddress || ''
        const building = data.buildingName && data.apartment === 'Y' ? ` (${data.buildingName})` : ''
        const suggestion = building || undefined
        onSelect({ postalCode: data.zonecode || '', address1: base, address2Suggestion: suggestion })
        setLoading(false)
      },
      onclose: () => setLoading(false),
    }).open()
  }, [])

  return { loaded, loading, open }
}


