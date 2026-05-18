import React from "react";
import { Calendar, CheckCircle, Users, Clock } from "lucide-react";
import { Card } from "../../../../components/other/Card";

type LeaveCardsProps = {
  pendingRequests: number;
  approvedLeaves: number;
  staffOnLeaveToday: number;
  attendanceLoggedToday: number;
  staffOnLeaveDetail?: string;
  attendanceTodayDetail?: string;
};

export const LeaveCards: React.FC<LeaveCardsProps> = ({
  pendingRequests,
  approvedLeaves,
  staffOnLeaveToday,
  attendanceLoggedToday,
  staffOnLeaveDetail = "Currently on leave",
  attendanceTodayDetail = "Backend attendance",
}) => {
  const cards = [
    { title: "Pending Requests", value: pendingRequests, icon: Clock, caption: "Awaiting action" },
    { title: "Approved Leaves", value: approvedLeaves, icon: CheckCircle, caption: "Approved requests" },
    { title: "Staff on Leave Today", value: staffOnLeaveToday, icon: Users, caption: staffOnLeaveDetail },
    { title: "Attendance Logged Today", value: attendanceLoggedToday, icon: Calendar, caption: attendanceTodayDetail },
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3 lg:gap-4">
        {cards.map((c) => {
          const Icon = c.icon as any;
          return (
            <Card
              key={c.title}
              heading={c.title}
              amount={c.value.toString()}
              icons={<Icon className="w-5 h-5 text-white" />}
              currency={c.caption}
              currencyClassName="truncate text-[11px] sm:text-xs"
            />
          );
        })}
      </div>
    </div>
  );
};

export default LeaveCards;
