import React from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EvaluationTemplate } from "../data";

interface EvaluationTemplatesProps {
  data: EvaluationTemplate[];
}

export const EvaluationTemplates: React.FC<EvaluationTemplatesProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            <div className="mt-4 text-xs text-gray-500 space-y-2">
              <div className="flex items-center justify-between">
                <span>Categories:</span>
                <span className="text-gray-700">{item.categories}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Modified:</span>
                <span className="text-gray-700">{item.lastModified}</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Button className="w-full">Start Evaluation</Button>
              <button
                type="button"
                className="w-12 h-10 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                aria-label="Schedule"
              >
                <Calendar className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="w-full border border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50"
      >
        + Create new template
      </button>
    </div>
  );
};
