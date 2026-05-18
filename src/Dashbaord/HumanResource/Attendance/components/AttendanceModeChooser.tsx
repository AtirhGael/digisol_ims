import React from 'react'
import { ChevronRight, Keyboard, PencilLine } from 'lucide-react'

export const AttendanceModeChooser = ({
  isOpen,
  onClose,
  onManual,
  onAutomatic,
}: {
  isOpen: boolean
  onClose: () => void
  onManual: () => void
  onAutomatic: () => void
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Mark Attendance</h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose how you want to enter attendance for today.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            X
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onManual}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 text-primary shadow-sm">
                <PencilLine className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Manual</p>
                <p className="text-xs text-gray-500">Fill it in by hand</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={onAutomatic}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 text-primary shadow-sm">
                <Keyboard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Automatic</p>
                <p className="text-xs text-gray-500">Use the row-by-row entry sheet</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
