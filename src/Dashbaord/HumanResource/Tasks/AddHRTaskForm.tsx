import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../../components/ui/button";

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

const hrProjects = [
  "HR Operations",
  "Payroll",
  "Performance Management",
  "Leave Management",
  "Attendance",
  "Recruitment",
  "Training & Development",
  "Employee Engagement",
  "Compliance",
  "Benefits",
  "Employee Relations",
  "Health & Safety",
];

const hrEmployees = [
  { value: "prescilia", label: "Prescilia Ebeh" },
  { value: "grace", label: "Grace Phillips" },
  { value: "gael", label: "Ateh Gael" },
  { value: "sophie", label: "Sophie Martin" },
  { value: "amanda", label: "Amanda Williams" },
  { value: "lisa", label: "Lisa Rodriguez" },
  { value: "emily", label: "Emily Nelson" },
  { value: "kevin", label: "Kevin Park" },
  { value: "rachel", label: "Rachel Brown" },
  { value: "david", label: "David Thompson" },
];

export interface HRTaskFormData {
  taskName: string;
  taskDescription: string;
  assignedTo: string;
  assignee: string;
  startDate: string;
  endDate: string;
  projectName: string;
  priority: string;
  notes: string;
}

interface AddHRTaskFormProps {
  onBack: () => void;
  onSubmit: (data: HRTaskFormData) => void;
}

export const AddHRTaskForm: React.FC<AddHRTaskFormProps> = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState<HRTaskFormData>({
    taskName: "",
    taskDescription: "",
    assignedTo: "",
    assignee: "",
    startDate: "",
    endDate: "",
    projectName: "",
    priority: "Medium",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const priorityColor: Record<string, string> = {
    Low: "text-gray-600 bg-gray-50",
    Medium: "text-amber-700 bg-amber-50",
    High: "text-red-600 bg-red-50",
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Tasks
      </button>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Add New Task</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Create a new HR department task
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Info */}
            <SectionCard>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h2 className="text-base font-semibold text-gray-800">Task Information</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelCls}>
                    Task Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="taskName"
                    placeholder="Enter task name"
                    className={inputCls}
                    value={formData.taskName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="taskDescription"
                    placeholder="Describe the task objectives and requirements..."
                    rows={4}
                    className={inputCls}
                    value={formData.taskDescription}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>
                    Project / Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="projectName"
                    className={inputCls}
                    value={formData.projectName}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select HR project or area</option>
                    {hrProjects.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* Assignment */}
            <SectionCard>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h2 className="text-base font-semibold text-gray-800">Assignment</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>
                    Assigned To <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assignedTo"
                    className={inputCls}
                    value={formData.assignedTo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select employee</option>
                    {hrEmployees.map((emp) => (
                      <option key={emp.value} value={emp.value}>
                        {emp.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>
                    Assignee <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assignee"
                    className={inputCls}
                    value={formData.assignee}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select assignee</option>
                    {hrEmployees.map((emp) => (
                      <option key={emp.value} value={emp.value}>
                        {emp.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* Schedule */}
            <SectionCard>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h2 className="text-base font-semibold text-gray-800">Schedule</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className={inputCls}
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className={inputCls}
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <label className={labelCls}>Additional Notes</label>
                <textarea
                  name="notes"
                  placeholder="Any extra context or instructions..."
                  rows={3}
                  className={inputCls}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit">Add Task</Button>
              </div>
            </SectionCard>
          </div>

          {/* Sidebar — 1/3 */}
          <div className="space-y-6">
            {/* Priority */}
            <SectionCard>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Priority
              </h3>
              <div className="flex gap-2">
                {["Low", "Medium", "High"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                      formData.priority === p
                        ? `${priorityColor[p]} border-current`
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Summary */}
            <SectionCard>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Task Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Task</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%] truncate">
                    {formData.taskName || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Project</span>
                  <span className="font-medium text-gray-800">
                    {formData.projectName || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Assigned To</span>
                  <span className="font-medium text-gray-800">
                    {formData.assignedTo
                      ? hrEmployees.find((e) => e.value === formData.assignedTo)?.label ?? formData.assignedTo
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Priority</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor[formData.priority] ?? "bg-gray-50 text-gray-600"}`}
                  >
                    {formData.priority}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Start</span>
                  <span className="font-medium text-gray-800">
                    {formData.startDate
                      ? new Date(formData.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Due</span>
                  <span className="font-medium text-gray-800">
                    {formData.endDate
                      ? new Date(formData.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Info */}
            <SectionCard>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The assigned employee will be notified once the task is created.
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      </form>
    </div>
  );
};
