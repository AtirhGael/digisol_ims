import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Save, Search, X } from "lucide-react";
import { toast } from "sonner";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { useFetchHook } from "../../../../Hooks/UseFetchHook";
import usePost from "../../../../Hooks/UsePostHook";
import type { HrEvaluationPeriod, HrEmployeeEvaluation } from "../../hrApi";
import { updateEvaluation } from "../../hrApi";
import type { PendingEvaluation } from "../data";

interface PerformanceEvaluationFormProps {
  evaluation?: PendingEvaluation | null;
  editingEvaluation?: HrEmployeeEvaluation | null;
  employeeOptions: PendingEvaluation[];
  onBack: () => void;
  onSaved?: () => void;
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 bg-white transition";

const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export const PerformanceEvaluationForm: React.FC<PerformanceEvaluationFormProps> = ({
  evaluation,
  editingEvaluation,
  employeeOptions,
  onBack,
  onSaved,
}) => {
  const isEditMode = Boolean(editingEvaluation);
  const [selectedEmployee, setSelectedEmployee] = useState<PendingEvaluation | null>(evaluation ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  // Period selection state
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(evaluation?.period_id ?? "");
  const [showNewPeriod, setShowNewPeriod] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState("");
  const [newPeriodStart, setNewPeriodStart] = useState("");
  const [newPeriodEnd, setNewPeriodEnd] = useState("");

  const { data: periodsData, isLoading: periodsLoading, refetch: refetchPeriods } = useFetchHook<{
    success: boolean; message: string; data: HrEvaluationPeriod[];
  }>('/evaluation-periods', 'hr-evaluation-periods');
  const periods: HrEvaluationPeriod[] = periodsData?.data ?? [];

  const { postData, loading: creatingPeriod } = usePost();

  useEffect(() => {
    if (!selectedPeriodId && periods.length > 0) {
      const active = periods.find((p) => p.is_active);
      if (active) setSelectedPeriodId(active.period_id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods]);

  // When an employee is selected, prefer their pre-linked period_id
  useEffect(() => {
    if (selectedEmployee?.period_id) {
      setSelectedPeriodId(selectedEmployee.period_id);
    }
  }, [selectedEmployee]);

  const selectedPeriod = periods.find((p) => p.period_id === selectedPeriodId) ?? null;

  const handleCreatePeriod = async () => {
    if (!newPeriodName.trim()) { toast.error("Period name is required."); return; }
    if (!newPeriodStart || !newPeriodEnd) { toast.error("Start and end dates are required."); return; }
    if (newPeriodEnd < newPeriodStart) { toast.error("End date must be after start date."); return; }
    try {
      const res = await postData('/evaluation-periods', {
        period_name: newPeriodName.trim(),
        start_date: newPeriodStart,
        end_date: newPeriodEnd,
      });
      const created: HrEvaluationPeriod = res.data;
      setSelectedPeriodId(created.period_id);
      setShowNewPeriod(false);
      setNewPeriodName("");
      setNewPeriodStart("");
      setNewPeriodEnd("");
      refetchPeriods();
      toast.success("Evaluation period created.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create evaluation period.");
    }
  };

  const [ratings, setRatings] = useState({
    taskCompletion: editingEvaluation?.ratings?.quality_of_work_score ?? 0,
    qualityOfWork: editingEvaluation?.ratings?.quality_of_work_score ?? 0,
    punctuality: editingEvaluation?.ratings?.punctuality_score ?? 0,
    conduct: editingEvaluation?.ratings?.conduct_behavior_score ?? 0,
    productivity: editingEvaluation?.ratings?.productivity_score ?? 0,
  });
  const [taskCompletionRate, setTaskCompletionRate] = useState(
    editingEvaluation?.ratings?.task_completion_rate?.toString() ?? "70"
  );
  const [comments, setComments] = useState({
    taskCompletion: "",
    qualityOfWork: "",
    punctuality: "",
    conduct: "",
    conductOther: "",
    productivity: editingEvaluation?.comments ?? "",
  });
  const [strengths, setStrengths] = useState(editingEvaluation?.strengths ?? "");
  const [areasForImprovement, setAreasForImprovement] = useState(editingEvaluation?.areas_for_improvement ?? "");
  const [goals, setGoals] = useState<string[]>(
    editingEvaluation?.goals_for_next_period
      ? editingEvaluation.goals_for_next_period.split("\n").filter(Boolean)
      : []
  );

  const addGoal = () => setGoals((prev) => [...prev, ""]);
  const updateGoal = (index: number, value: string) =>
    setGoals((prev) => prev.map((g, i) => (i === index ? value : g)));
  const removeGoal = (index: number) =>
    setGoals((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!isEditMode && !selectedEmployee) return;
    if (!isEditMode && !selectedPeriodId) {
      toast.error("Please select an evaluation period.");
      return;
    }

    const ratingValues = Object.values(ratings).filter((r) => r > 0);
    const overallScore =
      ratingValues.length > 0
        ? parseFloat((ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length).toFixed(2))
        : undefined;

    const combinedComments = [
      comments.taskCompletion && `Task Completion: ${comments.taskCompletion}`,
      comments.qualityOfWork && `Quality of Work: ${comments.qualityOfWork}`,
      comments.punctuality && `Punctuality: ${comments.punctuality}`,
      comments.conduct && `Misconduct: ${comments.conduct}`,
      comments.conductOther && `Misconduct (Other): ${comments.conductOther}`,
      comments.productivity && `Productivity: ${comments.productivity}`,
    ]
      .filter(Boolean)
      .join("\n") || undefined;

    const goalsText = goals.filter(Boolean).join("\n") || undefined;

    setSaving(true);
    try {
      if (isEditMode && editingEvaluation) {
        await updateEvaluation(editingEvaluation.evaluation_id, {
          task_completion_rate: parseInt(taskCompletionRate) || undefined,
          quality_of_work_score: ratings.qualityOfWork || undefined,
          punctuality_score: ratings.punctuality || undefined,
          conduct_behavior_score: ratings.conduct || undefined,
          productivity_score: ratings.productivity || undefined,
          overall_score: overallScore,
          comments: combinedComments,
          strengths: strengths || undefined,
          areas_for_improvement: areasForImprovement || undefined,
          goals_for_next_period: goalsText,
        });
        toast.success("Evaluation updated successfully.");
      } else {
        await postData('/evaluations', {
          employee_id: selectedEmployee.id,
          period_id: selectedPeriodId,
          evaluator: selectedEmployee.evaluator ?? "HR Department",
          task_completion_rate: parseInt(taskCompletionRate) || undefined,
          quality_of_work_score: ratings.qualityOfWork || undefined,
          punctuality_score: ratings.punctuality || undefined,
          conduct_behavior_score: ratings.conduct || undefined,
          productivity_score: ratings.productivity || undefined,
          overall_score: overallScore,
          comments: combinedComments,
          strengths: strengths || undefined,
          areas_for_improvement: areasForImprovement || undefined,
          goals_for_next_period: goalsText,
          status: "SUBMITTED",
        });
        toast.success("Evaluation saved successfully.");
      }
      setTimeout(() => {
        onSaved?.();
      }, 100);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save evaluation.");
    } finally {
      setSaving(false);
    }
  };

  // Employee picker screen (only in create mode)
  if (!isEditMode && !selectedEmployee) {
    const filtered = employeeOptions.filter(
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
          <p className="text-sm text-gray-500 mt-0.5">Select an employee to evaluate</p>
        </div>

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

  const person = isEditMode
    ? {
        name: editingEvaluation?.employee_name ?? "Employee",
        code: editingEvaluation?.employee_code ?? "",
        department: editingEvaluation?.department?.department_name ?? "",
        position: editingEvaluation?.position ?? "",
        avatar: undefined as string | undefined,
      }
    : selectedEmployee!;

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Evaluations
      </button>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Edit Evaluation" : "Performance Evaluation"}
        </h1>
        <p className="text-sm text-gray-500">
          {selectedPeriod ? selectedPeriod.period_name : isEditMode ? editingEvaluation?.period : "Select a period below"} Evaluation
        </p>
        {!isEditMode && selectedEmployee?.evaluator && (
          <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            selectedEmployee.evaluator === "Department Manager"
              ? "bg-indigo-100 text-indigo-700"
              : "bg-primary/10 text-primary"
          }`}>
            Evaluator: {selectedEmployee.evaluator}
          </span>
        )}
      </div>

      {/* Employee card */}
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
              {person.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">{person.name}</p>
            <p className="text-xs text-gray-500">{person.code} - {person.department}</p>
            <p className="text-xs text-gray-500">{person.position}</p>
          </div>
        </div>
      </div>

      {/* Period selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Evaluation Period <span className="text-red-500">*</span></h3>
          <button
            type="button"
            onClick={() => setShowNewPeriod((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {showNewPeriod ? <><X size={12} /> Cancel</> : <><Plus size={12} /> New period</>}
          </button>
        </div>

        {showNewPeriod ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
            <input
              type="text"
              placeholder="Period name (e.g. Q2 2026)"
              className={inputCls}
              value={newPeriodName}
              onChange={(e) => setNewPeriodName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Start date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={newPeriodStart}
                  onChange={(e) => setNewPeriodStart(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">End date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={newPeriodEnd}
                  onChange={(e) => setNewPeriodEnd(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleCreatePeriod}
              disabled={creatingPeriod}
              loading={creatingPeriod}
              className="w-full gap-1"
            >
              {creatingPeriod ? "Creating..." : "Create & select"}
            </Button>
          </div>
        ) : (
          <select
            className={inputCls}
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            disabled={periodsLoading}
          >
            <option value="">
              {periodsLoading
                ? "Loading periods..."
                : periods.length === 0
                  ? "No periods — create one →"
                  : "Select a period"}
            </option>
            {periods.map((p) => (
              <option key={p.period_id} value={p.period_id}>
                {p.period_name}{p.is_active ? " (Active)" : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-4">
        {/* 1. Task Completion Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">1. Task Completion Rate</h3>
          <div className="mt-3 space-y-2">
            <label className={labelCls}>Rating (1-5 Stars)</label>
            <div className="flex items-center gap-3">
              <StarRating
                value={ratings.taskCompletion}
                onChange={(value) => setRatings((prev) => ({ ...prev, taskCompletion: value }))}
              />
              <span className="text-sm font-medium text-gray-500">
                {ratings.taskCompletion > 0 ? `${ratings.taskCompletion}/5` : "Not rated"}
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Tasks Completed On Time (%)</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              max="100"
              value={taskCompletionRate}
              onChange={(e) => setTaskCompletionRate(e.target.value)}
            />
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Comments</label>
            <input
              className={inputCls}
              value={comments.taskCompletion}
              onChange={(e) => setComments((prev) => ({ ...prev, taskCompletion: e.target.value }))}
            />
          </div>
        </div>

        {/* 2. Quality Of Work */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">2. Quality Of Work</h3>
          <div className="mt-3 space-y-2">
            <label className={labelCls}>Rating (1-5 Stars)</label>
            <div className="flex items-center gap-3">
              <StarRating
                value={ratings.qualityOfWork}
                onChange={(value) => setRatings((prev) => ({ ...prev, qualityOfWork: value }))}
              />
              <span className="text-sm font-medium text-gray-500">
                {ratings.qualityOfWork > 0 ? `${ratings.qualityOfWork}/5` : "Not rated"}
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Comments</label>
            <input
              className={inputCls}
              value={comments.qualityOfWork}
              onChange={(e) => setComments((prev) => ({ ...prev, qualityOfWork: e.target.value }))}
            />
          </div>
        </div>

        {/* 3. Punctuality And Attendance */}
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
            <div className="flex items-center gap-3">
              <StarRating
                value={ratings.punctuality}
                onChange={(value) => setRatings((prev) => ({ ...prev, punctuality: value }))}
              />
              <span className="text-sm font-medium text-gray-500">
                {ratings.punctuality > 0 ? `${ratings.punctuality}/5` : "Not rated"}
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Comments</label>
            <input
              className={inputCls}
              value={comments.punctuality}
              onChange={(e) => setComments((prev) => ({ ...prev, punctuality: e.target.value }))}
            />
          </div>
        </div>

        {/* 4. Misconduct */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">4. Misconduct</h3>
          <div className="mt-3 space-y-2">
            <label className={labelCls}>Rating (1-5 Stars)</label>
            <div className="flex items-center gap-3">
              <StarRating
                value={ratings.conduct}
                onChange={(value) => setRatings((prev) => ({ ...prev, conduct: value }))}
              />
              <span className="text-sm font-medium text-gray-500">
                {ratings.conduct > 0 ? `${ratings.conduct}/5` : "Not rated"}
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Comments</label>
            <input
              className={inputCls}
              value={comments.conduct}
              onChange={(e) => setComments((prev) => ({ ...prev, conduct: e.target.value }))}
            />
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Other</label>
            <input
              className={inputCls}
              placeholder="Describe any other misconduct..."
              value={comments.conductOther ?? ""}
              onChange={(e) => setComments((prev) => ({ ...prev, conductOther: e.target.value }))}
            />
          </div>
        </div>

        {/* 5. Productivity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">5. Productivity</h3>
          <div className="mt-3 space-y-2">
            <label className={labelCls}>Rating (1-5 Stars)</label>
            <div className="flex items-center gap-3">
              <StarRating
                value={ratings.productivity}
                onChange={(value) => setRatings((prev) => ({ ...prev, productivity: value }))}
              />
              <span className="text-sm font-medium text-gray-500">
                {ratings.productivity > 0 ? `${ratings.productivity}/5` : "Not rated"}
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className={labelCls}>Comments</label>
            <input
              className={inputCls}
              value={comments.productivity}
              onChange={(e) => setComments((prev) => ({ ...prev, productivity: e.target.value }))}
            />
          </div>
        </div>

        {/* 6. Strengths & Achievements */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">6. Strengths & Achievements</h3>
          <div className="mt-3 space-y-2">
            <input
              className={inputCls}
              placeholder="List Key Accomplishments During Evaluation Period..."
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
            />
          </div>
        </div>

        {/* 7. Areas For Improvement */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">7. Areas For Improvement</h3>
          <div className="mt-3 space-y-2">
            <input
              className={inputCls}
              placeholder="Specific Areas Needing Improvement..."
              value={areasForImprovement}
              onChange={(e) => setAreasForImprovement(e.target.value)}
            />
          </div>
        </div>

        {/* 8. Goals For Next Period */}
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
          {goals.length > 0 ? (
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
          ) : (
            <p className="mt-3 text-sm text-gray-400">
              No goals added yet. Click "+ Add Goal" to get started.
            </p>
          )}
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="flex justify-end gap-3 pt-2 pb-4 border-t border-gray-100">
        <Button variant="outline" onClick={onBack} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          loading={saving}
          className="gap-2 bg-primary text-white hover:bg-primary/90"
        >
          {isEditMode ? "Update Evaluation" : "Save Evaluation"}
        </Button>
      </div>
    </div>
  );
};
