import React from "react";
import { Calendar, CheckCircle, Users, Clock } from "lucide-react";
import { Card } from "../../../../components/other/Card";

export const LeaveCards: React.FC = () => {
  const cards = [
    { title: "Pending Requests", value: 23, icon: Clock },
    { title: "Approved", value: 23, icon: CheckCircle },
    { title: "Staff on Leave Today", value: 23, icon: Users },
    { title: "Total Available Days", value: 23, icon: Calendar },
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
              currency={c.title.includes("Days") ? "Available" : "Request"}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LeaveCards;
