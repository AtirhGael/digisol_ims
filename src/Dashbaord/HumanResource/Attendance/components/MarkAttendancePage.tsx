import React, { useMemo, useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '../../../../components/ui/button'
import SkeletonLoading from '../../../../components/other/Loader/SkeletonLoading/SkeletonLoading'
import { useFetchHook } from '../../../../Hooks/UseFetchHook'
import { createAttendanceRecord } from '../../hrApi'
import type { HrEmployee, HrLeaveRequest } from '../../hrApi'
import type { PaginatedResponse } from '../types'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE'

type RowState = {
  status: AttendanceStatus
  checkIn: string
  checkOut: string
}

const calcHoursWorked = (checkIn: string, checkOut: string): string => {
  if (!checkIn || !checkOut) return ''
  const [inH, inM] = checkIn.split(':').map(Number)
  const [outH, outM] = checkOut.split(':').map(Number)
  if (Number.isNaN(inH) || Number.isNaN(outH)) return ''
  const total = (outH * 60 + outM) - (inH * 60 + inM)
  if (total <= 0) return ''
  const hours = Math.floor(total / 60)
  const mins = total % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

type MarkAttendancePageProps = {
  onBack: () => void
  onSaved: () => void | Promise<void>
}

export const MarkAttendancePage: React.FC<MarkAttendancePageProps> = ({ onBack, onSaved }) => {
  const today = new Date().toISOString().slice(0, 10)
  const queryClient = useQueryClient()

  const { data: employeesResponse, isLoading: employeesLoading } =
    useFetchHook<PaginatedResponse<HrEmployee>>(
      '/employees?page_size=200',
      'hr-mark-attendance-employees'
    )

  const { data: leaveResponse, isLoading: leaveLoading } =
    useFetchHook<PaginatedResponse<HrLeaveRequest>>(
      `/leaves/requests?status=APPROVED&page_size=200`,
      `hr-mark-attendance-on-leave-${today}`
    )

  const employees = employeesResponse?.data ?? []

  const onLeaveIds = useMemo(() => {
    const ids = new Set<string>()
    for (const req of leaveResponse?.data ?? []) {
      const start = req.start_date?.slice(0, 10) ?? ''
      const end = req.end_date?.slice(0, 10) ?? ''
      if (today >= start && today <= end) {
        ids.add(req.employee_id)
      }
    }
    return ids
  }, [leaveResponse, today])

  const [rows, setRows] = useState<Record<string, RowState>>({})
  const [submitting, setSubmitting] = useState(false)

  const getRow = (id: string): RowState =>
    rows[id] ?? { status: 'PRESENT', checkIn: '', checkOut: '' }

  const setField = <K extends keyof RowState>(id: string, field: K, value: RowState[K]) => {
    setRows((prev) => ({
      ...prev,
      [id]: { ...getRow(id), [field]: value },
    }))
  }

  const handleSubmit = async () => {
    if (employees.length === 0) {
      toast.error('No employees to mark attendance for.')
      return
    }

    setSubmitting(true)
    let successCount = 0
    let failCount = 0

    for (const emp of employees) {
      const row = getRow(emp.employee_id)
      // Skip employees currently on approved leave
      if (onLeaveIds.has(emp.employee_id)) continue

      try {
        await createAttendanceRecord({
          employee_id: emp.employee_id,
          action: 'MANUAL_ENTRY',
          status: row.status,
          timestamp: row.checkIn
            ? new Date(`${today}T${row.checkIn}:00`).toISOString()
            : new Date(`${today}T00:00:00Z`).toISOString(),
          check_out_timestamp: row.checkOut
            ? new Date(`${today}T${row.checkOut}:00`).toISOString()
            : undefined,
        })
        successCount++
      } catch {
        failCount++
      }
    }

    setSubmitting(false)

    if (successCount > 0) {
      toast.success(
        `Attendance saved for ${successCount} employee${successCount !== 1 ? 's' : ''}.`
      )
    }
    if (failCount > 0) {
      toast.error(
        `Failed for ${failCount} employee${failCount !== 1 ? 's' : ''}. They may already have a record for today.`
      )
    }

    if (successCount > 0) {
      await queryClient.invalidateQueries({ queryKey: ['hr-attendance'] })
      await onSaved()
      onBack()
    }
  }

  if (employeesLoading || leaveLoading) return <SkeletonLoading />

  const displayDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Attendance
          </button>
          <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-xs text-gray-500 mt-0.5">{displayDate}</p>
        </div>
        <Button
          onClick={handleSubmit}
          loading={submitting}
          disabled={submitting || employees.length === 0}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Attendance
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                  Employee
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                  Department
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                  Check In
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                  Check Out
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                  Hours Worked
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-500">
                    No employees found.
                  </td>
                </tr>
              )}
              {employees.map((emp) => {
                const row = getRow(emp.employee_id)
                const isOnLeave = onLeaveIds.has(emp.employee_id)
                const hoursWorked = calcHoursWorked(row.checkIn, row.checkOut)

                return (
                  <tr
                    key={emp.employee_id}
                    className={`hover:bg-gray-50 transition-colors ${isOnLeave ? 'opacity-60' : ''}`}
                  >
                    {/* Employee name */}
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {emp.first_name} {emp.last_name}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                      {emp.department?.department_name ?? 'Unassigned'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {isOnLeave ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                          On Leave
                        </span>
                      ) : (
                        <select
                          value={row.status}
                          onChange={(e) =>
                            setField(emp.employee_id, 'status', e.target.value as AttendanceStatus)
                          }
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="LATE">Late</option>
                        </select>
                      )}
                    </td>

                    {/* Check In */}
                    <td className="py-3 px-4">
                      {isOnLeave || row.status === 'ABSENT' ? (
                        <span className="text-sm text-gray-400">—</span>
                      ) : (
                        <input
                          type="time"
                          value={row.checkIn}
                          onChange={(e) => setField(emp.employee_id, 'checkIn', e.target.value)}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      )}
                    </td>

                    {/* Check Out */}
                    <td className="py-3 px-4">
                      {isOnLeave || row.status === 'ABSENT' ? (
                        <span className="text-sm text-gray-400">—</span>
                      ) : (
                        <input
                          type="time"
                          value={row.checkOut}
                          onChange={(e) => setField(emp.employee_id, 'checkOut', e.target.value)}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      )}
                    </td>

                    {/* Hours Worked — auto-calculated */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700 whitespace-nowrap">
                        {isOnLeave || row.status === 'ABSENT' ? '—' : hoursWorked || '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MarkAttendancePage
