import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useFetchHook } from '../../../../Hooks/UseFetchHook'
import type { HrAttendanceRecord, HrEmployee, HrLeaveRequest } from '../../hrApi'
import type { AttendanceRecord, AttendanceHistoryGroup, PaginatedResponse } from '../types'

const toTimeValue = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export const useAttendanceData = () => {
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([])
  const [historyRecords, setHistoryRecords] = useState<AttendanceHistoryGroup[]>([])
  const [attendanceEmployees, setAttendanceEmployees] = useState<AttendanceRecord[]>([])
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>('')

  const todayDate = new Date().toISOString().slice(0, 10)

  const {
    data: attendanceResponse,
    isLoading: loading,
    error,
    refetch: refetchAttendance,
  } = useFetchHook<PaginatedResponse<HrAttendanceRecord>>(
    '/attendance?page_size=500',
    'hr-attendance',
    { refetchOnWindowFocus: true, staleTime: 0 }
  )

  const {
    data: employeesResponse,
    isLoading: employeesLoading,
    error: employeesError,
  } = useFetchHook<PaginatedResponse<HrEmployee>>(
    '/employees?page_size=200',
    'hr-attendance-employees'
  )

  const {
    data: onLeaveResponse,
    isLoading: onLeaveLoading,
    error: onLeaveError,
  } = useFetchHook<PaginatedResponse<HrLeaveRequest>>(
    `/leaves/requests?status=APPROVED&page_size=200`,
    `hr-attendance-on-leave-${todayDate}`
  )

  useEffect(() => {
    if (employeesResponse?.data) {
      setAttendanceEmployees(
        employeesResponse.data.map((employee, index) => ({
          id: employee.employee_id || index + 1,
          name: `${employee.first_name} ${employee.last_name}`.trim(),
          status: employee.employment_status === 'ON_LEAVE' ? 'On Leave' : 'Present',
          department: employee.department?.department_name ?? 'Unassigned',
          checkIn: '',
          checkOut: '',
          hoursWorked: '',
        }))
      )
    } else {
      setAttendanceEmployees([])
    }
  }, [employeesResponse])

  useEffect(() => {
    if (error) {
      toast.error(error.response?.data?.message || 'Failed to load attendance records.')
    }
  }, [error])

  useEffect(() => {
    if (employeesError) {
      toast.error(employeesError.response?.data?.message || 'Failed to load employees.')
    }
  }, [employeesError])

  useEffect(() => {
    if (onLeaveError) {
      toast.error(onLeaveError.response?.data?.message || 'Failed to load leave requests.')
    }
  }, [onLeaveError])

  useEffect(() => {
    if (!attendanceResponse?.data) return

    const today = new Date().toISOString().slice(0, 10)
    const normalizedRecords = attendanceResponse.data.map((record) => ({
      id: record.attendance_id,
      attendanceId: record.attendance_id,
      employeeId: record.employee_id,
      name: record.employee_name,
      status:
        record.status === 'PRESENT'
          ? 'Present'
          : record.status === 'ABSENT'
            ? 'Absent'
            : record.status === 'LATE'
              ? 'Late'
              : 'On Leave',
      department: record.department?.department_name ?? 'Unassigned',
      checkIn: record.check_in_time
        ? new Date(record.check_in_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-',
      checkInValue: toTimeValue(record.check_in_time),
      checkOut: record.check_out_time
        ? new Date(record.check_out_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-',
      checkOutValue: toTimeValue(record.check_out_time),
      hoursWorked: record.working_hours ? `${record.working_hours}h` : '0h',
      attendanceDate: record.attendance_date,
    }))

    setTodayRecords(
      normalizedRecords.filter((record) => record.attendanceDate?.slice(0, 10) === today)
    )

    const groupedHistory = normalizedRecords
      .reduce<Record<string, AttendanceRecord[]>>((accumulator, record) => {
        const dateKey = record.attendanceDate?.slice(0, 10) ?? ''
        accumulator[dateKey] = [...(accumulator[dateKey] ?? []), record]
        return accumulator
      }, {})

    const history = Object.entries(groupedHistory)
      .sort(([left], [right]) => new Date(right).getTime() - new Date(left).getTime())
      .map(([date, records]) => ({ date, records }))

    setHistoryRecords(history)
    
    // Set fallback selected date safely if it hasn't been set yet
    if (!selectedHistoryDate && history.length > 0) {
        setSelectedHistoryDate(history[0].date)
    }
  }, [attendanceResponse])

  // Keeps selected date updated if the history list changes and selected date is invalid
  useEffect(() => {
    if (!historyRecords.some((entry) => entry.date === selectedHistoryDate) && historyRecords[0]) {
      setSelectedHistoryDate(historyRecords[0].date)
    }
  }, [historyRecords, selectedHistoryDate])

  const getTodayRecord = (id: string) => todayRecords.find((record) => record.id === id) ?? null

  const getHistoryRecord = (date: string, id: string) =>
    historyRecords.find((entry) => entry.date === date)?.records.find((record) => record.id === id) ?? null

  return {
    todayRecords,
    historyRecords,
    attendanceEmployees,
    employeesResponse,
    todayOnLeaveCount: (onLeaveResponse?.data ?? []).filter((leave) => {
      const startDate = new Date(leave.start_date).toISOString().slice(0, 10);
      const endDate = new Date(leave.end_date).toISOString().slice(0, 10);
      return startDate <= todayDate && todayDate <= endDate;
    }).length,
    loading: loading || employeesLoading || onLeaveLoading,
    refetchAttendance,
    selectedHistoryDate,
    setSelectedHistoryDate,
    getTodayRecord,
    getHistoryRecord,
  }
}
