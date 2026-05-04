import type { AttendanceProps } from '../Types/Types';

export const attendanceList: AttendanceProps[] = [
  {id: 1, name: 'John Doe', status: 'Present', department: 'HR', checkIn: '09:00 AM', checkOut: '05:00 PM', hoursWorked: '8h', actions: null},
  {id: 2, name: 'Jane Smith', status: 'Absent', department: 'Finance', checkIn: '09:00 AM', checkOut: '05:00 PM', hoursWorked: '0h', actions: null},
  {id: 3, name: 'Alice Johnson', status: 'Late', department: 'IT', checkIn: '09:15 AM', checkOut: '05:00 PM', hoursWorked: '7h 45m', actions: null},
  {id: 4, name: 'Bob Brown', status: 'Present', department: 'Marketing', checkIn: '08:55 AM', checkOut: '05:00 PM', hoursWorked: '8h 5m', actions: null}
];

export const attendanceTabTitles = [
  "Today's Attendance",
  "Attendance History",
  "Attendance reports",
  "Settings"
];


export const attendanceHistoryData = [
  {
    date: '2026-01-28',
    records: [
      { id: 1, name: 'John Doe', status: 'Present', department: 'HR', checkIn: '09:00 AM', checkOut: '05:00 PM', hoursWorked: '8h', actions: null },
      { id: 2, name: 'Jane Smith', status: 'Absent', department: 'Finance', checkIn: '09:00 AM', checkOut: '05:00 PM', hoursWorked: '0h', actions: null },
    ],
  },
  {
    date: '2026-01-27',
    records: [
      { id: 1, name: 'John Doe', status: 'Late', department: 'HR', checkIn: '09:20 AM', checkOut: '05:00 PM', hoursWorked: '7h 40m', actions: null },
      { id: 2, name: 'Jane Smith', status: 'Present', department: 'Finance', checkIn: '09:00 AM', checkOut: '05:00 PM', hoursWorked: '8h', actions: null },
    ],
  },
];
