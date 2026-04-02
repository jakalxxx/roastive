'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

type Props = {
  open: boolean
  title?: string
  message?: string
  actionText?: string
  onClose: () => void
}

export function AlertDialog({
  open,
  title = '알림',
  message = '',
  actionText = '확인',
  onClose,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-2xl bg-white px-6 py-7 text-center shadow-xl ring-1 ring-gray-900/10 dark:bg-gray-900 dark:text-white dark:ring-white/10">
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">{title}</DialogTitle>
          {message ? (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{message}</p>
          ) : null}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-w-[120px] items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              {actionText}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}


