import React, { useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import type { PendingEvaluation } from "../data";
import { pendingEvaluations } from "../data";

interface PerformanceEvaluationFormProps {
  evaluation?: PendingEvaluation | null;
  onBack: () => void;
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 bg-white transition";

const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export const PerformanceEvaluationForm: React.FC<PerformanceEvaluationFormProps> = ({
  evaluation,
  onBack,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<PendingEvaluation | null>(evaluation ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [goals, setGoals] = useState<string[]>([]);

  const addGoal = () => setGoals((prev) => [...prev, ""]);
  const updateGoal = (index: number, value: string) =>
    setGoals((prev) => prev.map((g, i) => (i === index ? value : g)));
  const removeGoal = (index: number) =>
    setGoals((prev) => prev.filter((_, i) => i !== index));

  // If no evaluation was passed and none selected yet, show employee picker
  if (!selectedEmployee) {
    const filtered = pendingEvaluations.filter(
      (e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="flex flex-col gap-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Back to Evaluations
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            New Performance Evaluation
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Select an employee to evaluate
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, code, or department..."
            className={`${inputCls} pl-9`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Employee list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((emp) => (
            <button
              key={emp.id}
              type="button"
              onClick={() => setSelectedEmployee(emp)}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm text-left hover:border-primary/40 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                {emp.avatar ? (
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {emp.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                  <p className="text-xs text-gray-500">{emp.code} · {emp.department}</p>
                  <p className="text-xs text-gray-500">{emp.position}</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {emp.cycle}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <span>Period: <span className="text-gray-600">{emp.period}</span></span>
                <span>Due: <span className="text-gray-600">{new Date(emp.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 py-12 text-center text-sm text-gray-400">
              No employees found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    );
  }

  const person = selectedEmployee;

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Evaluations
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Performance Evaluation</h1>
          <p className="text-sm text-gray-500">{person.period} Evaluation</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-3">
          {person.avatar ? (
            <img
              src={person.avatar}
              alt={person.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {person.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">{person.name}</p>
            <p className="text-xs text-gray-500">
              {person.code} - {person.department}
            </p>
            <p className="text-xs text-gray-500">{person.position}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">1. Task Completion Rate</h3>
          <div className="mt-3 space-y-2">
            <label className={labelCls}>Rating (1-5 Stars)</label>
            <StarRating />
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Tasks Completed On Time (%)</label>
            <input className={inputCls} defaultValue="70" />
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Comments</label>
            <input className={inputCls} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">2. Quality Of Work</h3>
          <div className="mt-3 space-y-2">
            <label className={labelCls}>Rating (1-5 Stars)</label>
            <StarRating />
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Comments</label>
            <input className={inputCls} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">3. Punctuality And Attendance</h3>
          <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 space-y-1">
            <p className="font-medium">Auto-Populated Metrics:</p>
            <p>Attendance Rate: 98%</p>
            <p>Late Arrivals: 1 Time</p>
            <p>Absences: 0 Days</p>
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Rating (1-5 Stars)</label>
            <StarRating />
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Comments</label>
            <input className={inputCls} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">4. Conduct And Behaviour</h3>
          <div className="mt-3 space-y-2">
            <label className={labelCls}>Rating (1-5 Stars)</label>
            <StarRating />
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Comments</label>
            <input className={inputCls} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">5. Productivity</h3>
          <div className="mt-3 space-y-2">
            <label className={labelCls}>Rating (1-5 Stars)</label>
            <StarRating />
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Comments</label>
            <input className={inputCls} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">6. Strengths & Achievements</h3>
          <div className="mt-3 space-y-2">
            <input
              className={inputCls}
              placeholder="List Key Accomplishments During Evaluation Period..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">7. Areas For Improvement</h3>
          <div className="mt-3 space-y-2">
            <input className={inputCls} placeholder="Specific Areas Needing Improvement..." />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">8. Goals For Next Period</h3>
            <Button
              variant="outline"
              className="gap-2 text-primary border-primary"
              onClick={addGoal}
              type="button"
            >
              + Add Goal
            </Button>
          </div>
          {goals.length > 0 && (
            <div className="mt-4 space-y-3">
              {goals.map((goal, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="mt-2.5 text-xs font-medium text-gray-400 w-5 shrink-0">
                    {idx + 1}.
                  </span>
                  <input
                    className={inputCls}
                    placeholder="Describe goal..."
                    value={goal}
                    onChange={(e) => updateGoal(idx, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeGoal(idx)}
                    className="mt-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {goals.length === 0 && (
            <p className="mt-3 text-sm text-gray-400">No goals added yet. Click "+ Add Goal" to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
};
