import React, { useEffect, useRef } from 'react'

import { Button } from '../../../../components/ui/button'
import type { AttendanceRecord } from '../types'

const inputClassName =
  'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30'

type ManualAttendancePopupProps = {
  isOpen: boolean
  onClose: () => void
  employeeOptions: AttendanceRecord[]
  manualEmployeeId: string
  setManualEmployeeId: (value: string) => void
  manualDate: string
  setManualDate: (value: string) => void
  manualStatus: 'PRESENT' | 'ABSENT' | 'LATE'
  setManualStatus: (value: 'PRESENT' | 'ABSENT' | 'LATE') => void
  manualCheckIn: string
  setManualCheckIn: (value: string) => void
  manualCheckOut: string
  setManualCheckOut: (value: string) => void
  manualReason: string
  setManualReason: (value: string) => void
  onSave: () => Promise<void>
  saving: boolean
}

export const ManualAttendancePopup = ({
  isOpen,
  onClose,
  employeeOptions,
  manualEmployeeId,
  setManualEmployeeId,
  manualDate,
  setManualDate,
  manualStatus,
  setManualStatus,
  manualCheckIn,
  setManualCheckIn,
  manualCheckOut,
  setManualCheckOut,
  manualReason,
  setManualReason,
  onSave,
  saving,
}: ManualAttendancePopupProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Manual Attendance</h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter attendance by hand and save it directly to the backend.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close manual attendance dialog"
          >
            X
          </button>
        </div>

        <div className="max-h-[calc(90vh-160px)] overflow-auto pr-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Employee</span>
              <select
                className={inputClassName}
                value={manualEmployeeId}
                onChange={(event) => setManualEmployeeId(event.target.value)}
              >
                <option value="">Select employee</option>
                {employeeOptions.map((employee) => (
                  <option key={String(employee.id)} value={String(employee.id)}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Date</span>
              <input
                type="date"
                className={inputClassName}
                value={manualDate}
                onChange={(event) => setManualDate(event.target.value)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <select
                className={inputClassName}
                value={manualStatus}
                onChange={(event) =>
                  setManualStatus(event.target.value as 'PRESENT' | 'ABSENT' | 'LATE')
                }
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Check In</span>
              <input
                type="time"
                className={inputClassName}
                value={manualCheckIn}
                onChange={(event) => setManualCheckIn(event.target.value)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Check Out</span>
              <input
                type="time"
                className={inputClassName}
                value={manualCheckOut}
                onChange={(event) => setManualCheckOut(event.target.value)}
              />
            </label>
            <label className="space-y-1 md:col-span-2 lg:col-span-1">
              <span className="text-sm font-medium text-gray-700">Reason</span>
              <input
                className={inputClassName}
                value={manualReason}
                onChange={(event) => setManualReason(event.target.value)}
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} loading={saving}>
              Save Attendance
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
