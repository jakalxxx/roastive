'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

type Props = {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  onClose: () => void
  onConfirm: () => void
  variant?: 'danger' | 'info'
}

export default function ConfirmDialog({ open, title = '확인', message = '이 작업을 계속하시겠습니까?', confirmText = '확인', cancelText = '취소', onClose, onConfirm, variant = 'danger' }: Props) {
  const confirmButtonClass = variant === 'info' 
    ? 'rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
    : 'rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500'
  
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg ring-1 ring-black/5 dark:bg-gray-900 dark:text-white dark:ring-white/10">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</div>
          <div className="mt-6 flex justify-end gap-2">
            {cancelText && (
              <button onClick={onClose} className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20">{cancelText}</button>
            )}
            <button onClick={onConfirm} className={confirmButtonClass}>{confirmText}</button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
