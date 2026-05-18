import React, { useState } from "react";
import { ArrowLeft, CircleAlert, LifeBuoy, SendHorizonal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import usePost from "../../../Hooks/UsePostHook";
import type { HrEmployee } from "../hrApi";

type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
};

const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30";

const labelClassName = "mb-1 block text-sm font-medium text-gray-700";

const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-xl border border-gray-100 bg-white p-6 ${className}`}>
    {children}
  </div>
);

export const SubmitQuery: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // This form posts a query for a selected employee and refreshes the query list cache.
  const {
    data: employeesResponse,
    isLoading: loadingEmployees,
    error: employeesError,
  } = useFetchHook<PaginatedResponse<HrEmployee>>(
    "/employees?page_size=200",
    "hr-query-form-employees"
  );
  const { postData: submitQuery, loading: submitting } = usePost();
  const [formValues, setFormValues] = useState({
    employeeName: "",
    employeeId: "",
    department: "",
    category: "OTHER",
    otherDetails: "",
    priority: "Medium",
    subject: "",
    description: "",
    assignedTo: "",
  });

  React.useEffect(() => {
    if (employeesError) {
      toast.error(employeesError.response?.data?.message || "Failed to load employees.");
    }
  }, [employeesError]);

  const employees = employeesResponse?.data ?? [];

  if (loadingEmployees) {
    return <SkeletonLoading />;
  }

  const updateField = (field: keyof typeof formValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  // The UI labels use friendly priority names; the API expects normalized priority codes.
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formValues.employeeId) {
      toast.error("Please select an employee.");
      return;
    }
    if (!formValues.subject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    if (!formValues.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    try {
      await submitQuery('/queries', {
        employee_id: formValues.employeeId,
        category: formValues.category,
        title: formValues.subject,
        description:
          formValues.category === "OTHER" && formValues.otherDetails.trim()
            ? `${formValues.description}\n\nOther Details: ${formValues.otherDetails.trim()}`
            : formValues.description,
        priority:
          formValues.priority === "High"
            ? "HIGH"
            : formValues.priority === "Low"
              ? "LOW"
            : "NORMAL",
        assigned_to: formValues.assignedTo || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["hr-queries"] });
      toast.success("Query submitted successfully.");
      navigate("/dashboard/queries");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit query.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => navigate("/dashboard/queries")}
        className="flex w-fit items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to Queries
      </button>

      <div>
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          Submit New Query
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Raise a staff query or issue and assign it for follow-up.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">
                Employee Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName}>Employee Name <span className="text-red-500">*</span></label>
                <select
                  className={inputClassName}
                  value={formValues.employeeId}
                  onChange={(e) => {
                    const selected = employees.find(
                      (employee) => employee.employee_id === e.target.value
                    );

                    setFormValues((current) => ({
                      ...current,
                      employeeName: selected ? `${selected.first_name} ${selected.last_name}`.trim() : "",
                      employeeId: selected?.employee_id ?? "",
                      department: selected?.department?.department_name ?? "",
                    }));
                  }}
                  disabled={loadingEmployees}
                >
                  <option value="">
                    {loadingEmployees ? "Loading employees..." : "Select employee"}
                  </option>
                  {employees.map((employee) => {
                    const fullName = `${employee.first_name} ${employee.last_name}`.trim();
                    return (
                      <option key={employee.employee_id} value={employee.employee_id}>
                        {fullName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClassName}>Department</label>
                <input
                  className={inputClassName}
                  placeholder="Enter department"
                  value={formValues.department}
                  onChange={(e) => updateField("department", e.target.value)}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">
                Query Details
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClassName}>Category</label>
                  <select
                    className={inputClassName}
                    value={formValues.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    <option value="PERFORMANCE">Performance</option>
                    <option value="LEAVE">Leave</option>
                    <option value="BENEFITS">Benefits</option>
                    <option value="MISCONDUCT">Misconduct</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {formValues.category === "OTHER" && (
                  <div className="sm:col-span-2">
                    <label className={labelClassName}>Other Details</label>
                    <input
                      className={inputClassName}
                      placeholder="Please specify..."
                      value={formValues.otherDetails}
                      onChange={(e) => updateField("otherDetails", e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className={labelClassName}>Priority</label>
                  <select
                    className={inputClassName}
                    value={formValues.priority}
                    onChange={(e) => updateField("priority", e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClassName}>Subject <span className="text-red-500">*</span></label>
                <input
                  required
                  className={inputClassName}
                  placeholder="Brief summary of the query"
                  value={formValues.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClassName}>Description <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={5}
                  className={inputClassName}
                  placeholder="Describe the issue or request in more detail"
                  value={formValues.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">
                Assignment
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName}>Assign To</label>
                <select
                  className={inputClassName}
                  value={formValues.assignedTo}
                  onChange={(e) => updateField("assignedTo", e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {employees.map((employee) => {
                    const fullName = `${employee.first_name} ${employee.last_name}`.trim();
                    return (
                      <option key={employee.user_id} value={employee.user_id}>
                        {fullName} — {employee.position}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 pt-6 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/queries")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2"
                disabled={submitting || !formValues.employeeId || !formValues.subject.trim() || !formValues.description.trim()}
                loading={submitting}
              >
                Submit Query
              </Button>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Submission Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Employee</span>
                  <span className="font-medium text-gray-800">
                    {formValues.employeeName || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-800">
                    {formValues.category}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Priority</span>
                  <span className="font-medium text-gray-800">
                    {formValues.priority}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Assigned To</span>
                  <span className="font-medium text-gray-800">
                    {formValues.assignedTo
                      ? employees.find((e) => e.user_id === formValues.assignedTo)
                          ? `${employees.find((e) => e.user_id === formValues.assignedTo)!.first_name} ${employees.find((e) => e.user_id === formValues.assignedTo)!.last_name}`.trim()
                          : "-"
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-blue-800">
                <LifeBuoy className="h-4 w-4" />
                <p className="text-sm font-semibold">Helpful Tip</p>
              </div>
              <p className="text-sm text-blue-700">
                Add a clear subject and enough detail so the assigned person can
                resolve the query quickly.
              </p>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="rounded-lg bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-800">
                <CircleAlert className="h-4 w-4" />
                <p className="text-sm font-semibold">Before You Submit</p>
              </div>
              <p className="text-sm text-amber-700">
                Make sure the assignee and due date are set for urgent or high
                priority issues.
              </p>
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
};
