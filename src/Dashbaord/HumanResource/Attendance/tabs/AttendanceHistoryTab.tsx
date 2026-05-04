import React, { useState, useEffect } from 'react';
import ReusableTable from '../../../../components/other/ReusableTable/ReusableTable';
import { createAttendanceColumns } from '../../../../components/Columns/AttendanceColumns';

interface AttendanceHistoryTabProps {
  records: any[];
  attendanceHistory: any[];
  selectedHistoryDate: string;
  setSelectedHistoryDate: (date: string) => void;
}

export const AttendanceHistoryTab: React.FC<AttendanceHistoryTabProps> = ({
  records,
  attendanceHistory,
  selectedHistoryDate,
  setSelectedHistoryDate,
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const columns = createAttendanceColumns({
    openMenuId,
    onToggleMenu: (id) => setOpenMenuId(id),
    onView: (_id) => {},
    onDelete: (_id) => {},
  });

  return (
    <div className='w-full'>
      {/* Date filter — first dimension of the double filter */}
      <div className='flex items-center gap-2 mb-4'>
        <span className='text-xs text-gray-500 font-medium'>Select Date:</span>
        <select
          className='border border-gray-200 rounded-sm px-2 py-1 text-sm text-gray-500'
          value={selectedHistoryDate}
          onChange={e => setSelectedHistoryDate(e.target.value)}
        >
          {attendanceHistory.map(h => (
            <option key={h.date} value={h.date}>
              {new Date(h.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </option>
          ))}
        </select>
      </div>
      {/* ReusableTable handles the second-dimension status filter + search */}
      <ReusableTable
        heading="Attendance History"
        columns={columns}
        data={records}
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
