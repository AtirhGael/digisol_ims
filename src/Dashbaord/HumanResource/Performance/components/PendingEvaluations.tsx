import React from "react";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PendingEvaluation } from "../data";

interface PendingEvaluationsProps {
  data: PendingEvaluation[];
  onStart: (evaluation: PendingEvaluation) => void;
  onView: (evaluation: PendingEvaluation) => void;
}

export const PendingEvaluations: React.FC<PendingEvaluationsProps> = ({ data, onStart, onView }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {data.map((item) => (
        <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <img
              src={item.avatar}
              alt={item.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.code}</p>
                  <p className="text-xs text-gray-500">{item.department}</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-full">
                  {item.cycle}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div>
                  <p className="text-[11px] uppercase text-gray-400 tracking-wider">Position</p>
                  <p className="text-sm text-gray-700">{item.position}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase text-gray-400 tracking-wider">Period</p>
                  <p className="text-sm text-gray-700">{item.period}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase text-gray-400 tracking-wider">Due Date</p>
                  <p className="text-sm text-gray-700">
                    {new Date(item.dueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase text-gray-400 tracking-wider">Evaluator</p>
                  <p className="text-sm text-gray-700">{item.evaluator}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button className="flex-1" onClick={() => onStart(item)}>
              Start Evaluation
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={() => onView(item)}>
              <Eye className="w-4 h-4" /> View
            </Button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center"
              aria-label="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
