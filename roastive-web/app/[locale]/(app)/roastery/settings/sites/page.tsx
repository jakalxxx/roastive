'use client'

import SettingsNav from '@/components/SettingsNav'
import AddressSearchFields from './SiteSearchFields'
import AddressCardList from './SiteCardList'
import ConfirmDialog from '@/components/ConfirmDialog'
import { AlertDialog } from '@/components/AlertDialog'
import { PageHeading } from '@/components/PageHeading'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { isValidAddress } from '@/lib/validators'

// no local nav helpers - SettingsNav renders tabs

export default function RoasteryAddressesPage() {
  const pathname = usePathname() || '/ko'
  const seg = pathname.split('/').filter(Boolean)
  const locale = (seg[0] === 'en' || seg[0] === 'ja' || seg[0] === 'ko') ? seg[0] : 'ko'
  const base = `/${locale}`
  const [loading, setLoading] = useState(true)
  const [siteAddress, setSiteAddress] = useState({ address_type: '', site_name: '', branch_seq_no: '', postal_code: '', address_line1: '', address_line2: '' })
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [items, setItems] = useState<{ id: number | string; title: string; subtitle?: string }[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null)
  const [showBasicInfoAlert, setShowBasicInfoAlert] = useState(false)
  const [alertDialog, setAlertDialog] = useState<{ title?: string; message: string } | null>(null)

  useEffect(() => {
    setLoading(false)
    // 로스터리 기본정보 확인
    fetch('/api/roastery/settings', { cache: 'no-store', credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        const hasBasicInfo = data?.legal_name || data?.business_reg_no
        if (!hasBasicInfo) {
          setShowBasicInfoAlert(true)
        }
      })
      .catch(() => {})
    refresh()
  }, [])

  function refresh() {
    fetch('/api/roastery/addresses', { cache: 'no-store' })
      .then((r) => r.json())
      .then(({ items }) => {
        const arr = Array.isArray(items) ? items : []
        setItems(
          arr.map((a: any) => {
            const branchNo = a.branch_seq_no ? `종사업장번호: ${a.branch_seq_no}` : ''
            const address = `${a.postal_code ? `[${a.postal_code}] ` : ''}${a.address_line1 ?? ''} ${a.address_line2 ?? ''}`.trim()
            const subtitle = [branchNo, address].filter(Boolean).join(' | ')
            return {
              id: a.address_id,
              title: a.address_type_label || a.address_type || '사업장 주소',
              subtitle: subtitle || undefined,
            }
          }),
        )
      })
      .catch(() => setItems([]))
  }

  return (
    <>
      <PageHeading
        title="사업장 관리"
        description="본사/제조공장/창고 등 사업장을 관리하세요"
        breadcrumbs={[
          { name: '홈', href: `${base}/dashboard` },
          { name: '로스터리 관리', href: `${base}/roastery/settings` },
          { name: '사업장 관리' },
        ]}
      />
      <SettingsNav />
      <div className="">
        <section className="divide-y divide-gray-200 dark:divide-white/10">
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">사업장 관리</h2>
            <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">본사/제조공장/창고 등 사업장 관리</p>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-y-8 sm:max-w-xl">
              <AddressSearchFields value={siteAddress as any} onChange={setSiteAddress as any} label="사업장 주소" />
              <div>
                <button
                  onClick={async () => {
                    if (!isValidAddress({ postal_code: siteAddress.postal_code, address_line1: siteAddress.address_line1 })) {
                      setAlertDialog({ title: '알림', message: '우편번호와 기본 주소를 입력하세요.' })
                      return
                    }
                    // HEADQUARTERS가 아닌 경우 종사업장 번호 필수
                    if (siteAddress.address_type && siteAddress.address_type !== 'HEADQUARTERS') {
                      if (!siteAddress.branch_seq_no || siteAddress.branch_seq_no.length !== 4) {
                        setAlertDialog({ title: '알림', message: '종사업장 번호는 숫자 4자리를 입력하세요.' })
                        return
                      }
                    }
                    // roastery_id 확인 및 갱신
                    try {
                      const meRes = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
                      if (meRes.status === 401) {
                        const pathname = window.location.pathname
                        const seg = pathname.split('/').filter(Boolean)
                        const locale = (seg[0] === 'en' || seg[0] === 'ja' || seg[0] === 'ko') ? seg[0] : 'ko'
                        window.location.href = `/${locale}/login`
                        return
                      }
                    } catch {
                      // me API 실패해도 계속 진행 (이미 쿠키에 있을 수 있음)
                    }
                    const payload = {
                      address_type: siteAddress.address_type,
                      site_name: siteAddress.site_name,
                      site_type: 'OFFICE', // 기본값
                      branch_seq_no: siteAddress.branch_seq_no || undefined,
                      postal_code: siteAddress.postal_code,
                      address_line1: siteAddress.address_line1,
                      address_line2: siteAddress.address_line2,
                    }
                    const url = editingId ? `/api/roastery/addresses/${editingId}` : '/api/roastery/addresses'
                    const method = editingId ? 'PATCH' : 'POST'
                    try {
                      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
                      if (res.status === 401) {
                        const pathname = window.location.pathname
                        const seg = pathname.split('/').filter(Boolean)
                        const locale = (seg[0] === 'en' || seg[0] === 'ja' || seg[0] === 'ko') ? seg[0] : 'ko'
                        window.location.href = `/${locale}/login`
                        return
                      }
                      if (!res.ok) {
                        const error = await res.json().catch(() => ({}))
                        setAlertDialog({ title: '알림', message: error?.message || '저장에 실패했습니다.' })
                        return
                      }
                      setEditingId(null)
                      setSiteAddress({ address_type: '', site_name: '', branch_seq_no: '', postal_code: '', address_line1: '', address_line2: '' })
                      refresh()
                    } catch (error) {
                      setAlertDialog({ title: '알림', message: '네트워크 오류가 발생했습니다.' })
                    }
                  }}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">사업장 목록</h2>
              <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">본사/제조공장/창고 등 사업장</p>
            </div>
            <div className="md:col-span-2">
              <AddressCardList
                items={items}
                onEdit={async (id) => {
                  const r = await fetch('/api/roastery/addresses', { cache: 'no-store', credentials: 'include' })
                  const j = await r.json().catch(() => ({}))
                  const found = (Array.isArray(j.items) ? j.items : []).find((a: any) => String(a.address_id) === String(id))
                  if (!found) return
                  setSiteAddress({ address_type: found.address_type || '', site_name: '', branch_seq_no: (found.branch_seq_no || ''), postal_code: found.postal_code || '', address_line1: found.address_line1 || '', address_line2: found.address_line2 || '' })
                  setEditingId(id)
                }}
                onDelete={(id) => { setPendingDeleteId(id); setConfirmOpen(true) }}
              />
              <ConfirmDialog
                open={confirmOpen}
                title="삭제 확인"
                message="선택한 주소를 삭제하시겠습니까?"
                cancelText="취소"
                confirmText="삭제"
                onClose={() => { setConfirmOpen(false); setPendingDeleteId(null) }}
                onConfirm={async () => {
                  const id = pendingDeleteId
                  setConfirmOpen(false)
                  setPendingDeleteId(null)
                  if (!id) return
                  const res = await fetch(`/api/roastery/addresses/${id}`, { method: 'DELETE', credentials: 'include' })
                  if (res.ok) {
                    refresh()
                    if (String(editingId) === String(id)) setEditingId(null)
                  }
                }}
              />
              {showBasicInfoAlert && (
                <ConfirmDialog
                  open={showBasicInfoAlert}
                  title="알림"
                  message="기본 정보를 등록하세요."
                  cancelText=""
                  confirmText="확인"
                  variant="info"
                  onClose={() => setShowBasicInfoAlert(false)}
                  onConfirm={() => {
                    setShowBasicInfoAlert(false)
                    const pathname = window.location.pathname
                    const seg = pathname.split('/').filter(Boolean)
                    const locale = (seg[0] === 'en' || seg[0] === 'ja' || seg[0] === 'ko') ? seg[0] : 'ko'
                    window.location.href = `/${locale}/roastery/settings`
                  }}
                />
              )}
              <AlertDialog
                open={Boolean(alertDialog)}
                title={alertDialog?.title}
                message={alertDialog?.message}
                onClose={() => setAlertDialog(null)}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}


