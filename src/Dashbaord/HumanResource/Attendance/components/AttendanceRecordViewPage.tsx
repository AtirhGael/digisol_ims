import React from 'react'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../../components/ui/button'
import { DetailRow } from './DetailRow'
import { MissingRecordState } from './MissingRecordState'
import type { AttendanceRecord } from '../types'

const detailDateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

type AttendanceRecordViewPageProps = {
  title: string
  backLabel: string
  record: AttendanceRecord | null
  recordDate?: string
  onBack: () => void
  onEdit: () => void
}

export const AttendanceRecordViewPage = ({
  title,
  backLabel,
  record,
  recordDate,
  onBack,
  onEdit,
}: AttendanceRecordViewPageProps) => {
  if (!record) {
    return <MissingRecordState onBack={onBack} />
  }

  return (
    <div className="rounded-2xl bg-white px-6 py-5">
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{record.name} attendance record details</p>
        </div>
        <Button variant="outline" onClick={onEdit}>
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DetailRow label="Department" value={record.department} />
        <DetailRow label="Status" value={record.status} />
        <DetailRow label="Check In" value={record.checkIn} />
        <DetailRow label="Check Out" value={record.checkOut} />
        <DetailRow label="Hours Worked" value={record.hoursWorked} />
        {recordDate ? (
          <DetailRow
            label="Record Date"
            value={new Date(recordDate).toLocaleDateString('en-US', detailDateFormat)}
          />
        ) : null}
      </div>
    </div>
  )
}
