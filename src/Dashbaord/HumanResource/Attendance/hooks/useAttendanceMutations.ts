import { toast } from 'sonner'

import usePost from '../../../../Hooks/UsePostHook'
import useUpdate from '../../../../Hooks/UseUpdateHook'
import type { AttendanceRecord, AttendanceStatus } from '../types'

const mapRecordStatusToApiStatus = (
  status: AttendanceStatus
): 'PRESENT' | 'ABSENT' | 'LATE' => {
  switch (status) {
    case 'Present':
      return 'PRESENT'
    case 'Absent':
      return 'ABSENT'
    default:
      return 'LATE'
  }
}

const buildAttendanceDateTime = (date: string | undefined, time: string | undefined) => {
  if (!date || !time) return undefined
  return new Date(`${date.slice(0, 10)}T${time}:00`).toISOString()
}

const parseWorkingHours = (hoursWorked: string) => {
  const parsedHours = parseFloat(hoursWorked.replace(/[a-zA-Z]+/g, '').trim())
  return Number.isNaN(parsedHours) ? undefined : parsedHours
}

const shouldRetryWithManualEntry = (error: any) => {
  const statusCode = error?.response?.status
  const message = String(error?.response?.data?.message ?? '').toLowerCase()

  return (
    statusCode === 401 ||
    statusCode === 403 ||
    message.includes('user not found') ||
    message.includes('unauthorized')
  )
}

export const useAttendanceMutations = (
  refetchAttendance: () => void | Promise<unknown>
) => {
  const { postData: createRecord } = usePost()
  const { updateData: updateRecord } = useUpdate()

  const submitManualCorrection = async (updatedRecord: AttendanceRecord) => {
    if (!updatedRecord.employeeId || !updatedRecord.attendanceDate) {
      return false
    }

    await createRecord('/attendance', {
      employee_id: updatedRecord.employeeId,
      action: 'MANUAL_ENTRY',
      status: mapRecordStatusToApiStatus(updatedRecord.status),
      timestamp: buildAttendanceDateTime(updatedRecord.attendanceDate, updatedRecord.checkInValue),
      check_out_timestamp: buildAttendanceDateTime(
        updatedRecord.attendanceDate,
        updatedRecord.checkOutValue
      ),
    })

    return true
  }

  const handleAttendanceUpdate = async (updatedRecord: AttendanceRecord) => {
    if (!updatedRecord.attendanceId) {
      toast.error('Unable to update this attendance record.')
      return false
    }

    try {
      const payload: {
        status?: 'PRESENT' | 'ABSENT' | 'LATE'
        check_in_time?: string
        check_out_time?: string
        working_hours?: number
      } = {
        status: mapRecordStatusToApiStatus(updatedRecord.status),
      }

      const checkInTime = buildAttendanceDateTime(
        updatedRecord.attendanceDate,
        updatedRecord.checkInValue
      )
      if (checkInTime) {
        payload.check_in_time = checkInTime
      }

      const checkOutTime = buildAttendanceDateTime(
        updatedRecord.attendanceDate,
        updatedRecord.checkOutValue
      )
      if (checkOutTime) {
        payload.check_out_time = checkOutTime
      }

      const parsedHours = parseWorkingHours(updatedRecord.hoursWorked)
      if (parsedHours !== undefined) {
        payload.working_hours = parsedHours
      }

      await updateRecord(`/attendance/${updatedRecord.attendanceId}`, payload, 'patch')
      refetchAttendance()
      toast.success('Attendance record updated successfully.')
      return true
    } catch (error: any) {
      if (shouldRetryWithManualEntry(error)) {
        try {
          const retried = await submitManualCorrection(updatedRecord)
          if (retried) {
            refetchAttendance()
            toast.success('Attendance record updated successfully.')
            return true
          }
        } catch (retryError: any) {
          toast.error(
            retryError.response?.data?.message || 'Failed to update attendance record.'
          )
          return false
        }
      }

      toast.error(error.response?.data?.message || 'Failed to update attendance record.')
      return false
    }
  }

  return { handleAttendanceUpdate }
}
