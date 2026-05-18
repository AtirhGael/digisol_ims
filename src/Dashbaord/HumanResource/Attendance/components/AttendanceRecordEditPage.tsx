import React, { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../../components/ui/button'
import { MissingRecordState } from './MissingRecordState'
import type { AttendanceRecord, AttendanceStatus } from '../types'

const inputClassName =
  'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30'

type AttendanceRecordEditPageProps = {
  title: string
  backLabel: string
  record: AttendanceRecord | null
  onBack: () => void
  onSave: (record: AttendanceRecord) => void | Promise<void>
}

export const AttendanceRecordEditPage = ({
  title,
  backLabel,
  record,
  onBack,
  onSave,
}: AttendanceRecordEditPageProps) => {
  const [formValues, setFormValues] = useState<AttendanceRecord | null>(record)

  useEffect(() => {
    setFormValues(record)
  }, [record])

  if (!record || !formValues) {
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

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">
          Update {record.name}&apos;s attendance information below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Employee Name</label>
          <input className={inputClassName} value={formValues.name} readOnly />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Department</label>
          <input className={inputClassName} value={formValues.department} readOnly />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
          <select
            className={inputClassName}
            value={formValues.status}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                status: event.target.value as AttendanceStatus,
              })
            }
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Check In</label>
          <input
            type="time"
            className={inputClassName}
            value={formValues.checkInValue ?? ''}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                checkInValue: event.target.value,
                checkIn: event.target.value,
              })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Check Out</label>
          <input
            type="time"
            className={inputClassName}
            value={formValues.checkOutValue ?? ''}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                checkOutValue: event.target.value,
                checkOut: event.target.value,
              })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Hours Worked</label>
          <input
            type="text"
            className={inputClassName}
            value={formValues.hoursWorked}
            onChange={(event) =>
              setFormValues({ ...formValues, hoursWorked: event.target.value })
            }
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formValues)}>Update Record</Button>
      </div>
    </div>
  )
}
