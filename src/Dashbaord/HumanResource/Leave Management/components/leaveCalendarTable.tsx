import React from "react";

type Day = {
  day: number;
  leaves: any[];
  isToday?: boolean;
  nextMonth?: boolean;
};

export const LeaveCalendarTable: React.FC<{
  weekDays: string[];
  calendarDays: Day[];
  getLeaveColor?: (t: string) => string;
}> = ({ weekDays, calendarDays, getLeaveColor }) => {
  return (
    <div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-semibold text-gray-600 border-r border-b border-gray-200 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((dayData, index) => (
            <div
              key={index}
              className={`min-h-24 p-2 border-r border-b border-gray-200 last:border-r-0 hover:bg-gray-50 transition-colors ${
                dayData.isToday ? "bg-blue-50 border-2 border-blue-500" : ""
              } ${dayData.nextMonth ? "bg-gray-50" : ""}`}
            >
              <div
                className={`text-sm font-semibold mb-2 ${dayData.nextMonth ? "text-gray-400" : "text-gray-900"}`}
              >
                {dayData.day}
              </div>
              {dayData.leaves.map((leave: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getLeaveColor ? getLeaveColor(leave.type) : "bg-gray-400"}`}
                  ></div>
                  <span className="text-xs text-gray-600">{leave.text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-500"></div>
          <span className="text-sm font-medium text-gray-700">
            Annual Leave
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
          <span className="text-sm font-medium text-gray-700">Sick Leave</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-cyan-400"></div>
          <span className="text-sm font-medium text-gray-700">
            Personal Leave
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendarTable;
