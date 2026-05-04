import React, { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pendingEvaluations } from "../data";
import type { PendingEvaluation } from "../data";

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 bg-white transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

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

interface ScheduleEvaluationProps {
  onBack: () => void;
}

export const ScheduleEvaluation: React.FC<ScheduleEvaluationProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<PendingEvaluation | null>(null);
  const [evaluationType, setEvaluationType] = useState<"Quarterly" | "Annual">("Quarterly");
  const [scheduledDate, setScheduledDate] = useState("");
  const [period, setPeriod] = useState("");
  const [notes, setNotes] = useState("");

  const filtered = pendingEvaluations.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Evaluations
      </button>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Schedule Evaluation
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Set up a future performance evaluation for an employee
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Selection */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Select Employee</h2>
            </div>

            {selectedEmployee ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedEmployee.avatar ? (
                    <img
                      src={selectedEmployee.avatar}
                      alt={selectedEmployee.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {selectedEmployee.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.name}</p>
                    <p className="text-xs text-gray-500">{selectedEmployee.code} · {selectedEmployee.department}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="text-xs text-primary hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className={`${inputCls} pl-9`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filtered.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition"
                    >
                      {emp.avatar ? (
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                          {emp.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.code} · {emp.position}</p>
                      </div>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No employees found</p>
                  )}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Schedule Details */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Schedule Details</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>
                    Evaluation Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={inputCls}
                    value={evaluationType}
                    onChange={(e) => setEvaluationType(e.target.value as "Quarterly" | "Annual")}
                  >
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>
                    Evaluation Period <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q4 2025"
                    className={inputCls}
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>
                  Scheduled Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Notes</label>
                <textarea
                  rows={3}
                  placeholder="Add any notes or instructions for this evaluation..."
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
              <Button>Schedule Evaluation</Button>
            </div>
          </SectionCard>
        </div>

        {/* Right Sidebar — 1/3 */}
        <div className="space-y-6">
          {/* Summary */}
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Schedule Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Employee</span>
                  <span className="font-medium text-gray-800">
                    {selectedEmployee?.name ?? "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Department</span>
                  <span className="font-medium text-gray-800">
                    {selectedEmployee?.department ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-800">{evaluationType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Period</span>
                  <span className="font-medium text-gray-800">{period || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-800">
                    {scheduledDate
                      ? new Date(scheduledDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Info */}
          <SectionCard>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The employee and their evaluator will be notified once the evaluation is scheduled.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
