import React from "react";
import { Download, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PendingEvaluation } from "../data";
import {
  downloadEvaluationReport,
  type EvaluationDownloadFormat,
} from "./downloadEvaluationReport";
import { DownloadFormatDialog } from "./DownloadFormatDialog";

interface PendingEvaluationsProps {
  data: PendingEvaluation[];
  onStart: (evaluation: PendingEvaluation) => void;
  onView: (evaluation: PendingEvaluation) => void;
  onDelete: (id: string) => void;
  sectionTitle?: string;
  sectionDescription?: string;
}

export const PendingEvaluations: React.FC<PendingEvaluationsProps> = ({ data, onStart, onView, onDelete, sectionTitle, sectionDescription }) => {
  const [selectedDownload, setSelectedDownload] = React.useState<PendingEvaluation | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const handleDownload = (item: PendingEvaluation, format: EvaluationDownloadFormat) => {
    downloadEvaluationReport({
      name: item.name,
      department: item.department,
      position: item.position,
      evaluator: item.evaluator,
      date: new Date(item.dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      period: item.period,
      cycle: item.cycle,
      status: "Pending",
    }, format);
  };

  return (
    <>
      {sectionTitle && (
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">{sectionTitle}</h3>
          {sectionDescription && <p className="text-sm text-gray-500 mt-0.5">{sectionDescription}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.length === 0 && (
          <div className="col-span-2 py-12 text-center text-sm text-gray-400">
            No pending evaluations for this section.
          </div>
        )}
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
                    <p className={`text-sm ${item.period ? "text-gray-700" : "text-amber-600 font-medium"}`}>
                      {item.period || "No active period"}
                    </p>
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
                onClick={() => setSelectedDownload(item)}
                className="w-10 h-10 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center"
                aria-label="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(item.id)}
                className="w-10 h-10 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 flex items-center justify-center"
                aria-label="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <DownloadFormatDialog
        open={Boolean(selectedDownload)}
        onOpenChange={(open) => {
          if (!open) setSelectedDownload(null);
        }}
        onSelect={(format) => {
          if (!selectedDownload) return;
          handleDownload(selectedDownload, format);
          setSelectedDownload(null);
        }}
      />
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-900">Remove Pending Evaluation?</h3>
            <p className="mt-2 text-sm text-gray-500">
              This will remove the employee from the pending list. This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
