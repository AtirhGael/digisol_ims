import React, { useState } from "react";
import { Download } from "lucide-react";
import { DownloadFormatDialog } from "./DownloadFormatDialog";
import { downloadAnalyticsReport } from "./downloadEvaluationReport";
import type { EvaluationDownloadFormat } from "./downloadEvaluationReport";

interface PerformanceAnalyticsProps {
  analyticsDepartments: { name: string; score: number; width: string }[];
  ratingDistribution: { label: string; count: number; color: string }[];
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  analyticsDepartments,
  ratingDistribution,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleExport = (format: EvaluationDownloadFormat) => {
    setDialogOpen(false);
    downloadAnalyticsReport(
      {
        departments: analyticsDepartments.map(({ name, score }) => ({ name, score })),
        ratingDistribution: ratingDistribution.map(({ label, count }) => ({ label, count })),
        generatedAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
      format
    );
  };

  return (
    <div className="space-y-6">
      <DownloadFormatDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={handleExport}
      />
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Performance Analytics</h3>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-600 uppercase mb-3">
              Average Rating per department
            </h4>
            {analyticsDepartments.length ? (
              <div className="space-y-3">
                {analyticsDepartments.map((dept) => (
                  <div key={dept.name}>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>{dept.name}</span>
                      <span>{dept.score.toFixed(1)}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-primary" style={{ width: dept.width }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No performance data from the backend yet.</p>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-600 uppercase mb-3">Rating Distribution</h4>
            {ratingDistribution.length ? (
              <div className="space-y-3 text-sm text-gray-700">
                {ratingDistribution.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded ${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No distribution data available from the backend.</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="mt-5 w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Export Analytics Report
        </button>
      </div>
    </div>
  );
};
