'use client'

type Item = { id: string | number; title: string; subtitle?: string }

export default function AddressCardList({ items, onEdit, onDelete }: { items: Item[]; onEdit?: (id: string | number) => void; onDelete?: (id: string | number) => void }) {
  return (
    <ul role="list" className="space-y-3">
      {items.map((it) => (
        <li key={it.id} className="rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/5 dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{it.title}</p>
              {it.subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{it.subtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(it.id)}
                  className="rounded-full px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:ring-white/20 dark:hover:bg-white/10"
                >
                  수정
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(it.id)}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50 dark:text-red-300 dark:ring-red-500/40 dark:hover:bg-red-500/10"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
