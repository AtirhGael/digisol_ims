import React, { useState } from 'react'
import { FaClock } from 'react-icons/fa'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

import { AttendanceCards } from './AttendanceCards'
import { AttendanceModeChooser } from './AttendanceModeChooser'
import { ManualAttendancePopup } from './ManualAttendancePopup'
import { AttendanceHistoryTab } from '../tabs/AttendanceHistoryTab'
import { AttendanceReportsTab } from '../tabs/AttendanceReportsTab'
import { AttendanceSettingsTab } from '../tabs/AttendanceSettingsTab'
import { TodayAttendanceTab } from '../tabs/TodayAttendanceTab'
import { createAttendanceRecord } from '../../hrApi'
import type { AttendanceHistoryGroup, AttendanceRecord } from '../types'

const getTodayDisplayDate = () =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

type AttendanceIndexPageProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  activeIndex: number
  setActiveIndex: (index: number) => void
  tabTitles: readonly string[]
  list: AttendanceRecord[]
  attendanceEmployees: AttendanceRecord[]
  attendanceHistory: AttendanceHistoryGroup[]
  selectedHistoryDate: string
  setSelectedHistoryDate: (date: string) => void
  onViewTodayRecord: (id: string) => void
  onViewHistoryRecord: (date: string, id: string) => void
  onManualAttendanceSaved: () => void | Promise<void>
  totalStaff: number
  todayPresentCount: number
  todayAbsentCount: number
  todayLateCount: number
  todayOnLeaveCount: number
}

export const AttendanceIndexPage = ({
  isOpen,
  setIsOpen,
  activeIndex,
  setActiveIndex,
  tabTitles,
  list,
  attendanceEmployees,
  attendanceHistory,
  selectedHistoryDate,
  setSelectedHistoryDate,
  onViewTodayRecord,
  onViewHistoryRecord,
  onManualAttendanceSaved,
  totalStaff,
  todayPresentCount,
  todayAbsentCount,
  todayLateCount,
  todayOnLeaveCount,
}: AttendanceIndexPageProps) => {
  const navigate = useNavigate()
  const [manualEmployeeId, setManualEmployeeId] = useState('')
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10))
  const [manualStatus, setManualStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE'>('PRESENT')
  const [manualCheckIn, setManualCheckIn] = useState('')
  const [manualCheckOut, setManualCheckOut] = useState('')
  const [manualReason, setManualReason] = useState('')
  const [savingManualEntry, setSavingManualEntry] = useState(false)
  const [showManualAttendancePopup, setShowManualAttendancePopup] = useState(false)
  const [showAttendanceModeChooser, setShowAttendanceModeChooser] = useState(false)

  const resetManualForm = () => {
    setManualEmployeeId('')
    setManualStatus('PRESENT')
    setManualCheckIn('')
    setManualCheckOut('')
    setManualReason('')
  }

  const handleManualSubmit = async () => {
    if (!manualEmployeeId) {
      toast.error('Please select an employee.')
      return
    }

    try {
      setSavingManualEntry(true)
      await createAttendanceRecord({
        employee_id: manualEmployeeId,
        action: 'MANUAL_ENTRY',
        status: manualStatus,
        timestamp: manualCheckIn
          ? new Date(`${manualDate}T${manualCheckIn}:00`).toISOString()
          : new Date(`${manualDate}T00:00:00Z`).toISOString(),
        check_out_timestamp: manualCheckOut
          ? new Date(`${manualDate}T${manualCheckOut}:00`).toISOString()
          : undefined,
        reason: manualReason.trim() || undefined,
      })
      await onManualAttendanceSaved()
      toast.success('Attendance saved successfully.')
      resetManualForm()
      setShowManualAttendancePopup(false)
    } catch (submitError: any) {
      toast.error(submitError.response?.data?.message || 'Failed to save attendance.')
    } finally {
      setSavingManualEntry(false)
    }
  }

  const openManualAttendance = () => {
    setShowAttendanceModeChooser(false)
    setShowManualAttendancePopup(true)
  }

  const openAutomaticAttendance = () => {
    setShowAttendanceModeChooser(false)
    setIsOpen(true)
  }

  const renderTabContent = () => {
    switch (activeIndex) {
      case 0:
        return <TodayAttendanceTab data={list} onViewRecord={onViewTodayRecord} />
      case 1:
        return (
          <AttendanceHistoryTab
            attendanceHistory={attendanceHistory}
            selectedHistoryDate={selectedHistoryDate}
            setSelectedHistoryDate={setSelectedHistoryDate}
            onViewRecord={onViewHistoryRecord}
          />
        )
      case 2:
        return <AttendanceReportsTab />
      case 3:
        return <AttendanceSettingsTab />
      default:
        return null
    }
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Attendance Tracking</h1>
            <p className="text-xs font-light text-gray-500">{getTodayDisplayDate()}</p>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl border bg-[#3D3C7A] px-7 py-3 text-sm text-white duration-100 hover:opacity-85"
            onClick={() => navigate('/dashboard/attendance/mark')}
          >
            <FaClock /> Mark Attendance
          </button>
        </div>

        <AttendanceCards
          totalStaff={totalStaff}
          present={todayPresentCount}
          absent={todayAbsentCount}
          late={todayLateCount}
          onLeave={todayOnLeaveCount}
        />

        <div className="flex flex-wrap border-b-2 border-gray-200">
          {tabTitles.map((title, index) => (
            <button
              key={title}
              className={`px-4 py-2 text-xs font-medium text-gray-500 hover:cursor-pointer sm:px-8 sm:py-3 sm:text-sm md:px-12 md:py-4 ${
                activeIndex === index
                  ? 'border-b-2 border-primary text-primary'
                  : 'duration-100 hover:opacity-70'
              }`}
              onClick={() => setActiveIndex(index)}
            >
              {title}
            </button>
          ))}
        </div>

        <div>{renderTabContent()}</div>
      </div>

      <ManualAttendancePopup
        isOpen={showManualAttendancePopup}
        onClose={() => setShowManualAttendancePopup(false)}
        employeeOptions={attendanceEmployees}
        manualEmployeeId={manualEmployeeId}
        setManualEmployeeId={setManualEmployeeId}
        manualDate={manualDate}
        setManualDate={setManualDate}
        manualStatus={manualStatus}
        setManualStatus={setManualStatus}
        manualCheckIn={manualCheckIn}
        setManualCheckIn={setManualCheckIn}
        manualCheckOut={manualCheckOut}
        setManualCheckOut={setManualCheckOut}
        manualReason={manualReason}
        setManualReason={setManualReason}
        onSave={handleManualSubmit}
        saving={savingManualEntry}
      />
    </>
  )
}
