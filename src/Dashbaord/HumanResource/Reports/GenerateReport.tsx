import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ReportCategory } from "./data";

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 bg-white transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const categories: ReportCategory[] = [
  "Attendance",
  "Leave",
  "Performance",
  "Headcount",
  "Onboarding",
];

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

interface GenerateReportProps {
  onBack: () => void;
}

export const GenerateReport: React.FC<GenerateReportProps> = ({ onBack }) => {
  const [category, setCategory] = useState<ReportCategory | "">("" );
  const [period, setPeriod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState<"PDF" | "Excel" | "CSV">("PDF");
  const [notes, setNotes] = useState("");

  const handleGenerate = () => {
    if (!category) {
      toast.error("Please select a category.");
      return;
    }
    if (!period) {
      toast.error("Please enter a report period.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select a start and end date.");
      return;
    }
    toast.info("Report generation is not yet available. Please check back later.");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Reports
      </button>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Generate Report
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Configure and generate a new HR report
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Report Type</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className={inputCls}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>
                  Report Period <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q1 2026, March 2026, 2025"
                  className={inputCls}
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </div>
            </div>
          </SectionCard>

          {/* Date Range */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Date Range</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelCls}>
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </SectionCard>

          {/* Options */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Output Options</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Export Format</label>
                <div className="flex gap-3">
                  {(["PDF", "Excel", "CSV"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                        format === f
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Additional Notes</label>
                <textarea
                  rows={3}
                  placeholder="Any specific instructions or filters for the report..."
                  className={inputCls}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button onClick={handleGenerate}>Generate Report</Button>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-6">
          {/* Summary */}
          <SectionCard>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Report Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Category</span>
                <span className="font-medium text-gray-800">{category || "Not selected"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Period</span>
                <span className="font-medium text-gray-800">{period || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Start Date</span>
                <span className="font-medium text-gray-800">
                  {startDate
                    ? new Date(startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">End Date</span>
                <span className="font-medium text-gray-800">
                  {endDate
                    ? new Date(endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Format</span>
                <span className="font-medium text-gray-800">{format}</span>
              </div>
            </div>
          </SectionCard>

          {/* Info */}
          <SectionCard>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Reports are generated in the background. You will be notified once the report is ready for download.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
