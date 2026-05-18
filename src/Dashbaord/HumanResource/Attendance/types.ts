export type PaginatedResponse<T> = {
  success: boolean
  message: string
  data: T[]
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'On Leave'
export type AttendanceScope = 'today' | 'history'

export type AttendanceRecord = {
  id: string
  attendanceId?: string
  employeeId?: string
  name: string
  status: AttendanceStatus
  department: string
  checkIn: string
  checkOut: string
  hoursWorked: string
  checkInValue?: string
  checkOutValue?: string
  attendanceDate?: string
  actions?: null
}

export type AttendanceHistoryGroup = {
  date: string
  records: AttendanceRecord[]
}

export type AttendanceNavigationState = {
  activeTab?: number
  selectedHistoryDate?: string
}
