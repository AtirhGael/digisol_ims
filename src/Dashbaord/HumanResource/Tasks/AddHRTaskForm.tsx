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

type TaskDepartmentOption = {
  value: string;
  label: string;
};

type TaskEmployeeOption = {
  value: string;
  label: string;
};

export interface HRTaskFormData {
  taskName: string;
  taskDescription: string;
  assignedTo: string;
  endDate: string;
  departmentId: string;
  priority: string;
  notes: string;
}

interface AddHRTaskFormProps {
  onBack: () => void;
  departmentOptions: TaskDepartmentOption[];
  employeeOptions: TaskEmployeeOption[];
  onSubmit: (data: HRTaskFormData) => void;
}

export const AddHRTaskForm: React.FC<AddHRTaskFormProps> = ({
  onBack,
  departmentOptions,
  employeeOptions,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<HRTaskFormData>({
    taskName: "",
    taskDescription: "",
    assignedTo: "",
    endDate: "",
    departmentId: "",
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
    Critical: "text-purple-700 bg-purple-50",
  };

  const selectedDepartment =
    departmentOptions.find((department) => department.value === formData.departmentId)?.label || "—";
  const selectedAssignee =
    employeeOptions.find((employee) => employee.value === formData.assignedTo)?.label || "—";

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Tasks
      </button>

      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Add New Task</h1>
        <p className="text-sm text-gray-500 mt-0.5">Create a new HR department task</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                    Department / Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="departmentId"
                    className={inputCls}
                    value={formData.departmentId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select department or area</option>
                    {departmentOptions.map((department) => (
                      <option key={department.value} value={department.value}>
                        {department.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h2 className="text-base font-semibold text-gray-800">Assignment</h2>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>
                  Assignee <span className="text-red-500">*</span>
                </label>
                <select
                  name="assignedTo"
                  className={inputCls}
                  value={formData.assignedTo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select employee</option>
                  {employeeOptions.map((employee) => (
                    <option key={employee.value} value={employee.value}>
                      {employee.label}
                    </option>
                  ))}
                </select>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h2 className="text-base font-semibold text-gray-800">Schedule</h2>
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

          <div className="space-y-6">
            <SectionCard>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Priority
              </h3>
              <div className="flex gap-2">
                {["Low", "Medium", "High", "Critical"].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority }))}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                      formData.priority === priority
                        ? `${priorityColor[priority]} border-current`
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </SectionCard>

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
                  <span className="text-gray-500">Department</span>
                  <span className="font-medium text-gray-800">{selectedDepartment}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Assigned To</span>
                  <span className="font-medium text-gray-800">{selectedAssignee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Priority</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      priorityColor[formData.priority] ?? "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {formData.priority}
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
