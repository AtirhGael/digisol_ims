import React from 'react';

import ReusableTable from '../../../../components/other/ReusableTable/ReusableTable';
import { createAttendanceColumns } from '../../../../components/Columns/AttendanceColumns';
import type { AttendanceRecord } from '../types';

interface TodayAttendanceTabProps {
  data: AttendanceRecord[];
  onViewRecord: (id: string) => void;
}

export const TodayAttendanceTab: React.FC<TodayAttendanceTabProps> = ({
  data,
  onViewRecord,
}) => {
  const columns = createAttendanceColumns({
    onView: onViewRecord,
    showEdit: false,
    showDelete: false,
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
