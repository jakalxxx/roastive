'use client'

import SettingsNav from '@/components/SettingsNav'
import AddressSearchFields from './SiteSearchFields'
import AddressCardList from './SiteCardList'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useEffect, useState } from 'react'
import { isValidAddress } from '@/lib/validators'

// no local nav helpers - SettingsNav renders tabs

export default function RoasteryAddressesPage() {
  const [loading, setLoading] = useState(true)
  const [siteAddress, setSiteAddress] = useState({ address_type: '', site_name: '', branch_seq_no: '', postal_code: '', address_line1: '', address_line2: '' })
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [items, setItems] = useState<{ id: number | string; title: string; subtitle?: string }[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null)

  useEffect(() => {
    setLoading(false)
    refresh()
  }, [])

  function refresh() {
    fetch('/api/roastery/addresses', { cache: 'no-store' })
      .then((r) => r.json())
      .then(({ items }) => {
        const arr = Array.isArray(items) ? items : []
        setItems(
          arr.map((a: any) => ({
            id: a.address_id,
            title: a.address_type_label || a.address_type || '사업장 주소',
            subtitle: `${a.postal_code ? `[${a.postal_code}] ` : ''}${a.address_line1 ?? ''} ${a.address_line2 ?? ''}`.trim(),
          })),
        )
      })
      .catch(() => setItems([]))
  }

  return (
    <div className="">
      <SettingsNav />

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
                      alert('우편번호와 기본 주소를 입력하세요.')
                      return
                    }
                    const payload = {
                      address_type: siteAddress.address_type,
                      site_name: siteAddress.site_name,
                      branch_seq_no: siteAddress.branch_seq_no || undefined,
                      postal_code: siteAddress.postal_code,
                      address_line1: siteAddress.address_line1,
                      address_line2: siteAddress.address_line2,
                    }
                    const url = editingId ? `/api/roastery/addresses/${editingId}` : '/api/roastery/addresses'
                    const method = editingId ? 'PATCH' : 'POST'
                    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
                    if (res.ok) {
                      setEditingId(null)
                      const r = await fetch('/api/roastery/addresses', { cache: 'no-store', credentials: 'include' })
                      const j = await r.json().catch(() => ({}))
                      const arr = Array.isArray(j.items) ? j.items : []
                      setItems(arr.map((a: any) => ({ id: a.address_id, title: a.address_type_label || a.address_type || '사업장 주소', subtitle: `${a.postal_code ?? ''} ${a.address_line1 ?? ''} ${a.address_line2 ?? ''}`.trim() })))
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
                    const r = await fetch('/api/roastery/addresses', { cache: 'no-store', credentials: 'include' })
                    const j = await r.json().catch(() => ({}))
                    const arr = Array.isArray(j.items) ? j.items : []
                    setItems(arr.map((a: any) => ({ id: a.address_id, title: a.address_type_label || a.address_type || '사업장 주소', subtitle: `${a.postal_code ? `[${a.postal_code}] ` : ''}${a.address_line1 ?? ''} ${a.address_line2 ?? ''}`.trim() })))
                    if (String(editingId) === String(id)) setEditingId(null)
                  }
                }}
              />
            </div>
          </div>
      </section>
    </div>
  )
}


