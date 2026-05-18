import React, { useMemo, useState } from "react";
import LeaveCalendarTable from "../components/leaveCalendarTable";

type LeaveTypeOption = { code: string; name: string };

const DEFAULT_LEAVE_TYPES: LeaveTypeOption[] = [
  { code: "annual", name: "Annual Leave" },
  { code: "sick", name: "Sick Leave" },
  { code: "personal", name: "Personal Leave" },
];

export const LeaveCalendarTab: React.FC<{
  weekDays: string[];
  calendarDays: any[];
  getLeaveColor: (t: string) => string;
  getLeaveHexColor?: (t: string) => string;
  leaveTypeOptions?: LeaveTypeOption[];
}> = ({ weekDays, calendarDays, getLeaveColor, getLeaveHexColor, leaveTypeOptions = [] }) => {
  const [selectedType, setSelectedType] = useState<string>("all");

  // Always show default types; append any additional types from actual data
  const mergedOptions = useMemo(() => {
    const map = new Map(DEFAULT_LEAVE_TYPES.map((t) => [t.code, t]));
    leaveTypeOptions.forEach((opt) => {
      if (!map.has(opt.code)) map.set(opt.code, opt);
    });
    return Array.from(map.values());
  }, [leaveTypeOptions]);
  const filteredCalendarDays = useMemo(() => {
    if (selectedType === "all") return calendarDays;
    return calendarDays.map((day) => ({
      ...day,
      leaves: day.leaves.filter((l: any) => l.type === selectedType),
    }));
  }, [calendarDays, selectedType]);

  return (
    <div className="bg-white rounded-xl">
      <div className="p-3 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Leave Calendar
          </h2>
        </div>

        <LeaveCalendarTable
          weekDays={weekDays}
          calendarDays={filteredCalendarDays}
          getLeaveColor={getLeaveColor}
          getLeaveHexColor={getLeaveHexColor}
          selectedType={selectedType !== "all" ? selectedType : undefined}
          legendTypes={mergedOptions}
        />
      </div>
    </div>
  );
};

export default LeaveCalendarTab;
