import React from 'react'
import { ArrowLeft } from 'lucide-react'

export const MissingRecordState = ({ onBack }: { onBack: () => void }) => (
  <div className="rounded-2xl bg-white px-6 py-5">
    <button
      onClick={onBack}
      className="mb-5 flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Attendance
    </button>
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
      <h2 className="text-lg font-semibold text-gray-900">Attendance record not found</h2>
      <p className="mt-2 text-sm text-gray-500">
        The record you requested may have been deleted or the link is invalid.
      </p>
    </div>
  </div>
)
