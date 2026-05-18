import React, { useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'

import { AttendanceIndexPage } from './components/AttendanceIndexPage'
import { AttendanceRecordEditPage } from './components/AttendanceRecordEditPage'
import { AttendanceRecordViewPage } from './components/AttendanceRecordViewPage'
import { MarkAttendancePage } from './components/MarkAttendancePage'
import { useAttendanceData } from './hooks/useAttendanceData'
import { useAttendanceMutations } from './hooks/useAttendanceMutations'

import { ATTENDANCE_TAB_TITLES } from './constants'
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading'
import type {
  AttendanceNavigationState,
  AttendanceRecord,
  AttendanceScope,
} from './types'

const AttendanceTodayViewRoute = ({
  getTodayRecord,
  goBackToAttendance,
  goToTodayEdit,
}: {
  getTodayRecord: (id: string) => AttendanceRecord | null
  goBackToAttendance: () => void
  goToTodayEdit: (id: string) => void
}) => {
  const { id } = useParams()
  const record = getTodayRecord(id!)

  return (
    <AttendanceRecordViewPage
      title="View Attendance Record"
      backLabel="Back to Today's Attendance"
      record={record}
      onBack={goBackToAttendance}
      onEdit={() => {
        if (record) goToTodayEdit(record.id)
      }}
    />
  )
}

const AttendanceTodayEditRoute = ({
  getTodayRecord,
  goBackToAttendance,
  onSave,
}: {
  getTodayRecord: (id: string) => AttendanceRecord | null
  goBackToAttendance: () => void
  onSave: (record: AttendanceRecord) => void | Promise<void>
}) => {
  const { id } = useParams()
  const record = getTodayRecord(id!)

  return (
    <AttendanceRecordEditPage
      title="Edit Attendance Record"
      backLabel="Back to Today's Attendance"
      record={record}
      onBack={goBackToAttendance}
      onSave={onSave}
    />
  )
}

const AttendanceHistoryViewRoute = ({
  getHistoryRecord,
  goBackToHistory,
  goToHistoryEdit,
}: {
  getHistoryRecord: (date: string, id: string) => AttendanceRecord | null
  goBackToHistory: (date: string) => void
  goToHistoryEdit: (date: string, id: string) => void
}) => {
  const { date, id } = useParams()
  const record = date ? getHistoryRecord(date, id!) : null

  return (
    <AttendanceRecordViewPage
      title="View Attendance History Record"
      backLabel="Back to Attendance History"
      record={record}
      recordDate={date}
      onBack={() => {
        if (date) goBackToHistory(date)
      }}
      onEdit={() => {
        if (date && record) goToHistoryEdit(date, record.id)
      }}
    />
  )
}

const AttendanceHistoryEditRoute = ({
  getHistoryRecord,
  goBackToHistory,
  onSave,
}: {
  getHistoryRecord: (date: string, id: string) => AttendanceRecord | null
  goBackToHistory: (date: string) => void
  onSave: (date: string, record: AttendanceRecord) => void | Promise<void>
}) => {
  const { date, id } = useParams()
  const record = date ? getHistoryRecord(date, id!) : null

  return (
    <AttendanceRecordEditPage
      title="Edit Attendance History Record"
      backLabel="Back to Attendance History"
      record={record}
      onBack={() => {
        if (date) goBackToHistory(date)
      }}
      onSave={(updatedRecord) => {
        if (date) onSave(date, updatedRecord)
      }}
    />
  )
}

export const Attendance = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const navigationState = location.state as AttendanceNavigationState | null

  // Attendance owns nested routes so tab state survives view/edit navigation round trips.
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const {
    todayRecords,
    historyRecords,
    attendanceEmployees,
    employeesResponse,
    todayOnLeaveCount,
    loading,
    refetchAttendance,
    selectedHistoryDate,
    setSelectedHistoryDate,
    getTodayRecord,
    getHistoryRecord,
  } = useAttendanceData()

  const { handleAttendanceUpdate } = useAttendanceMutations(refetchAttendance)

  useEffect(() => {
    // Route state is used to restore the tab/date selection after view/edit navigation.
    if (navigationState?.activeTab !== undefined) {
      setActiveIndex(navigationState.activeTab)
    }
    if (navigationState?.selectedHistoryDate) {
      setSelectedHistoryDate(navigationState.selectedHistoryDate)
    }
  }, [navigationState])

  const navigateToAttendance = (state?: AttendanceNavigationState) => {
    navigate('/dashboard/attendance', { state })
  }

  // History records include a date segment, while today's records only need their row id.
  const navigateToRecord = (mode: 'view' | 'edit', scope: AttendanceScope, id: string, date?: string) => {
    if (scope === 'history' && date) {
      navigate(`/dashboard/attendance/${mode}/history/${date}/${id}`, {
        state: { activeTab: 1, selectedHistoryDate: date },
      })
      return
    }

    navigate(`/dashboard/attendance/${mode}/today/${id}`, {
      state: { activeTab: 0 },
    })
  }

  const totalStaff = employeesResponse?.data?.length ?? 0
  const todayPresentCount = todayRecords.filter((record) => record.status === 'Present').length
  const todayAbsentCount = todayRecords.filter((record) => record.status === 'Absent').length
  const todayLateCount = todayRecords.filter((record) => record.status === 'Late').length

  return (
    <Routes>
      <Route
        index
        element={
          loading ? (
            <SkeletonLoading />
          ) : (
            <AttendanceIndexPage
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              tabTitles={ATTENDANCE_TAB_TITLES}
              list={todayRecords}
              attendanceEmployees={attendanceEmployees}
              attendanceHistory={historyRecords}
              selectedHistoryDate={selectedHistoryDate}
              setSelectedHistoryDate={setSelectedHistoryDate}
              onViewTodayRecord={(id) => navigateToRecord('view', 'today', id)}
              onViewHistoryRecord={(date, id) => navigateToRecord('view', 'history', id, date)}
              onManualAttendanceSaved={refetchAttendance}
              totalStaff={totalStaff}
              todayPresentCount={todayPresentCount}
              todayAbsentCount={todayAbsentCount}
              todayLateCount={todayLateCount}
              todayOnLeaveCount={todayOnLeaveCount}
            />
          )
        }
      />
      <Route
        path="mark"
        element={
          <MarkAttendancePage
            onBack={() => navigateToAttendance({ activeTab: 0 })}
            onSaved={refetchAttendance}
          />
        }
      />
      <Route
        path="view/today/:id"
        element={
          loading ? (
            <SkeletonLoading />
          ) : (
            <AttendanceTodayViewRoute
              getTodayRecord={getTodayRecord}
              goBackToAttendance={() => navigateToAttendance({ activeTab: 0 })}
              goToTodayEdit={(id) => navigateToRecord('edit', 'today', id)}
            />
          )
        }
      />
      <Route
        path="edit/today/:id"
        element={
          loading ? (
            <SkeletonLoading />
          ) : (
            <AttendanceTodayEditRoute
              getTodayRecord={getTodayRecord}
              goBackToAttendance={() => navigateToAttendance({ activeTab: 0 })}
              onSave={async (updatedRecord) => {
                const success = await handleAttendanceUpdate(updatedRecord)
                if (success) {
                  navigateToRecord('view', 'today', updatedRecord.id)
                }
              }}
            />
          )
        }
      />
      <Route
        path="view/history/:date/:id"
        element={
          loading ? (
            <SkeletonLoading />
          ) : (
            <AttendanceHistoryViewRoute
              getHistoryRecord={getHistoryRecord}
              goBackToHistory={(date) =>
                navigateToAttendance({ activeTab: 1, selectedHistoryDate: date })
              }
              goToHistoryEdit={(date, id) => navigateToRecord('edit', 'history', id, date)}
            />
          )
        }
      />
      <Route
        path="edit/history/:date/:id"
        element={
          loading ? (
            <SkeletonLoading />
          ) : (
            <AttendanceHistoryEditRoute
              getHistoryRecord={getHistoryRecord}
              goBackToHistory={(date) =>
                navigateToAttendance({ activeTab: 1, selectedHistoryDate: date })
              }
              onSave={async (date, updatedRecord) => {
                const success = await handleAttendanceUpdate(updatedRecord)
                if (success) {
                  navigateToRecord('view', 'history', updatedRecord.id, date)
                }
              }}
            />
          )
        }
      />
    </Routes>
  )
}
