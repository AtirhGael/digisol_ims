import React from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PerformanceHeaderProps {
  onNewEvaluation: () => void;
  onSchedule: () => void;
}

export const PerformanceHeader: React.FC<PerformanceHeaderProps> = ({
  onNewEvaluation,
  onSchedule,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Performance Evaluation
        </h1>
        <p className="text-sm text-gray-500">
          Conduct and manage employee performance evaluations
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="gap-2" onClick={onSchedule}>
          <Calendar className="w-4 h-4" />
          Schedule Evaluation
        </Button>
        <Button onClick={onNewEvaluation} className="gap-2">
          + New Evaluation
        </Button>
      </div>
    </div>
  );
};
