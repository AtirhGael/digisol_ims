import React from 'react';

import ReusableTable from '../../../../components/other/ReusableTable/ReusableTable';
import { createAttendanceColumns } from '../../../../components/Columns/AttendanceColumns';
import type { AttendanceHistoryGroup } from '../types';

interface AttendanceHistoryTabProps {
  attendanceHistory: AttendanceHistoryGroup[];
  selectedHistoryDate: string;
  setSelectedHistoryDate: (date: string) => void;
  onViewRecord: (date: string, id: string) => void;
}

export const AttendanceHistoryTab: React.FC<AttendanceHistoryTabProps> = ({
  attendanceHistory,
  selectedHistoryDate,
  setSelectedHistoryDate,
  onViewRecord,
}) => {
  const currentRecords =
    attendanceHistory.find((entry) => entry.date === selectedHistoryDate)?.records ?? [];

  const columns = createAttendanceColumns({
    onView: (id) => onViewRecord(selectedHistoryDate, id),
    showEdit: false,
    showDelete: false,
  });

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Select Date:</span>
        <select
          className="rounded-sm border border-gray-200 px-2 py-1 text-sm text-gray-500"
          value={selectedHistoryDate}
          onChange={(e) => setSelectedHistoryDate(e.target.value)}
        >
          {attendanceHistory.map((historyGroup) => (
            <option key={historyGroup.date} value={historyGroup.date}>
              {new Date(historyGroup.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </option>
          ))}
        </select>
      </div>
      <ReusableTable
        heading="Attendance History"
        columns={columns}
        data={currentRecords}
        filterKey="status"
        filterOptions={[
          { key: 'Present', label: 'Present', value: 'Present' },
          { key: 'Absent', label: 'Absent', value: 'Absent' },
          { key: 'Late', label: 'Late', value: 'Late' },
          { key: 'On Leave', label: 'On Leave', value: 'On Leave' },
        ]}
        searchKeys={['name', 'department']}
      />
    </div>
  );
};
