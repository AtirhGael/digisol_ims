import React from "react";

type Day = {
  day: number;
  leaves: any[];
  isToday?: boolean;
  nextMonth?: boolean;
};

type LeaveTypeOption = { code: string; name: string };

const FALLBACK_LEGEND: LeaveTypeOption[] = [
  { code: "annual", name: "Annual Leave" },
  { code: "sick", name: "Sick Leave" },
  { code: "personal", name: "Personal Leave" },
];

const MAX_VISIBLE_LEAVES = 3;

export const LeaveCalendarTable: React.FC<{
  weekDays: string[];
  calendarDays: Day[];
  getLeaveColor?: (t: string) => string;
  getLeaveHexColor?: (t: string) => string;
  selectedType?: string;
  legendTypes?: LeaveTypeOption[];
}> = ({ weekDays, calendarDays, getLeaveColor, getLeaveHexColor, selectedType, legendTypes }) => {
  const legend = legendTypes && legendTypes.length > 0 ? legendTypes : FALLBACK_LEGEND;

  const hexColor = (type: string) =>
    getLeaveHexColor ? getLeaveHexColor(type) : "#9CA3AF";

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
              className={`min-h-24 p-1.5 border-r border-b border-gray-200 last:border-r-0 transition-colors ${
                dayData.isToday ? "bg-blue-50 ring-2 ring-inset ring-blue-400" : "hover:bg-gray-50"
              } ${dayData.nextMonth ? "bg-gray-50" : ""}`}
            >
              <div
                className={`text-xs font-semibold mb-1.5 ${
                  dayData.isToday
                    ? "text-blue-600"
                    : dayData.nextMonth
                    ? "text-gray-400"
                    : "text-gray-800"
                }`}
              >
                {dayData.day}
              </div>

              {dayData.leaves.slice(0, MAX_VISIBLE_LEAVES).map((leave: any, idx: number) => {
                const color = hexColor(leave.type);
                const isSelected = !!selectedType && leave.type === selectedType;
                return (
                  <div
                    key={idx}
                    title={`${leave.text} — ${leave.leaveType || leave.type}`}
                    className="mb-0.5 flex items-center gap-1 cursor-default transition-all"
                    style={{ opacity: selectedType && !isSelected ? 0.35 : 1 }}
                  >
                    <div
                      className="shrink-0 rounded-full"
                      style={{ width: 8, height: 8, backgroundColor: color }}
                    />
                    <span className="text-[10px] text-gray-600 truncate leading-tight">
                      On Leave
                    </span>
                  </div>
                );
              })}

              {dayData.leaves.length > MAX_VISIBLE_LEAVES && (
                <div
                  className="mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold text-center"
                  style={{ backgroundColor: "#E5E7EB", color: "#6B7280" }}
                >
                  +{dayData.leaves.length - MAX_VISIBLE_LEAVES} more
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-5">
        {legend.map((item) => {
          const color = hexColor(item.code);
          const isActive = selectedType === item.code;
          return (
            <div
              key={item.code}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all"
              style={
                isActive
                  ? { backgroundColor: `${color}20`, boxShadow: `0 0 0 1.5px ${color}80` }
                  : {}
              }
            >
              <div
                className="shrink-0 rounded"
                style={{ width: 14, height: 14, backgroundColor: color }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: isActive ? color : "#374151" }}
              >
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaveCalendarTable;