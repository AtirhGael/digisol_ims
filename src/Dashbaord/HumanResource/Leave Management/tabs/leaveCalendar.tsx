import React from "react";
import LeaveCalendarTable from "../components/leaveCalendarTable";

export const LeaveCalendarTab: React.FC<any> = ({
  weekDays,
  calendarDays,
  getLeaveColor,
}) => {
  return (
    <div className="bg-white rounded-xl">
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Leave Calendar
          </h2>
        </div>
        <LeaveCalendarTable
          weekDays={weekDays}
          calendarDays={calendarDays}
          getLeaveColor={getLeaveColor}
        />
      </div>
    </div>
  );
};

export default LeaveCalendarTab;
