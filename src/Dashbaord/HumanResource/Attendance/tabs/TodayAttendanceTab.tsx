import React, { useState, useEffect } from 'react';
import ReusableTable from '../../../../components/other/ReusableTable/ReusableTable';
import { createAttendanceColumns } from '../../../../components/Columns/AttendanceColumns';

interface TodayAttendanceTabProps {
  data: any[];
}

export const TodayAttendanceTab: React.FC<TodayAttendanceTabProps> = ({ data }) => {
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
    <ReusableTable
      heading="Today's Attendance"
      columns={columns}
      data={data}
      filterKey="status"
      filterOptions={[
        { key: 'Present', label: 'Present', value: 'Present' },
        { key: 'Absent', label: 'Absent', value: 'Absent' },
        { key: 'Late', label: 'Late', value: 'Late' },
        { key: 'On Leave', label: 'On Leave', value: 'On Leave' },
      ]}
      searchKeys={['name', 'department']}
    />
  );
};
