import React from "react";

export type PerformanceTabKey = "pending" | "completed" | "templates" | "analytics";

interface PerformanceTabsProps {
  active: PerformanceTabKey;
  pendingCount: number;
  onChange: (tab: PerformanceTabKey) => void;
}

const tabs: { key: PerformanceTabKey; label: string }[] = [
  { key: "pending", label: "Pending Evaluations" },
  { key: "completed", label: "Completed Evaluations" },
  { key: "templates", label: "Evaluation Templates" },
  { key: "analytics", label: "Analytics" },
];

export const PerformanceTabs: React.FC<PerformanceTabsProps> = ({ active, pendingCount, onChange }) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-500">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`pb-3 relative ${isActive ? "text-primary" : "hover:text-gray-700"}`}
            >
              {tab.label}
              {tab.key === "pending" && (
                <span className="ml-2 text-[11px] bg-red-500 text-white rounded-full px-2 py-0.5">
                  {pendingCount}
                </span>
              )}
              {isActive && (
                <span className="absolute left-0 -bottom-[1px] h-0.5 w-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
