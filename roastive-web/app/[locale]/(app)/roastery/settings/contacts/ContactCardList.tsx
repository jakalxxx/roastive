'use client'

type Item = { id: number|string; title: string; subtitle?: string }

export default function ContactCardList({ items, onEdit, onDelete }: { items: Item[]; onEdit?: (id: number|string) => void; onDelete?: (id: number|string) => void }) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-4 sm:max-w-xl">
      {items.map((it) => (
        <li key={it.id} className="flex items-center gap-4 rounded-md border border-gray-200 p-4 dark:border-white/10">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{it.title}</p>
            {it.subtitle && <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">{it.subtitle}</p>}
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {onEdit && (
              <button onClick={() => onEdit(it.id)} className="rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20">수정</button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(it.id)} className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-500">삭제</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}


