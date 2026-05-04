import React from "react";
import { Download } from "lucide-react";
import { analyticsDepartments, ratingDistribution } from "../data";

export const PerformanceAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Performance Analytics</h3>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-600 uppercase mb-3">
              Average Rating per department
            </h4>
            <div className="space-y-3">
              {analyticsDepartments.map((dept) => (
                <div key={dept.name}>
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>{dept.name}</span>
                    <span>{dept.score.toFixed(1)}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: dept.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-600 uppercase mb-3">Rating Distribution</h4>
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
          </div>
        </div>

        <button
          type="button"
          className="mt-5 w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Export Analytics Report
        </button>
      </div>
    </div>
  );
};
