import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  FileText,
  SendHorizonal,
  TimerReset,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import usePost from "../../../Hooks/UsePostHook";
import {
  getCurrentHrEmployeeId,
  type HrEmployee,
  type HrLeaveBalance,
  type HrLeaveType,
} from "../hrApi";

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

const FALLBACK_LEAVE_TYPES: HrLeaveType[] = [
  { leave_type_id: "vacation", leave_type_name: "Vacation", leave_type_code: "VACATION", is_paid: true, description: "Annual vacation leave" },
  { leave_type_id: "sick_leave", leave_type_name: "Sick Leave", leave_type_code: "SICK_LEAVE", is_paid: true, description: "Leave due to illness" },
  { leave_type_id: "personal", leave_type_name: "Personal Leave", leave_type_code: "PERSONAL", is_paid: false, description: "Personal matters leave" },
  { leave_type_id: "training", leave_type_name: "Training", leave_type_code: "TRAINING", is_paid: true, description: "Training or professional development" },
  { leave_type_id: "unpaid", leave_type_name: "Unpaid Leave", leave_type_code: "UNPAID", is_paid: false, description: "Unpaid leave of absence" },
  { leave_type_id: "attend_event", leave_type_name: "Attend Event", leave_type_code: "ATTEND_EVENT", is_paid: true, description: "Attending official event" },
  { leave_type_id: "leave_of_absence", leave_type_name: "Leave of Absence", leave_type_code: "LEAVE_OF_ABSENCE", is_paid: false, description: "Extended leave of absence" },
];

const formatLeaveTypeLabel = (leaveType?: HrLeaveType | null) =>
  leaveType?.leave_type_name || "Not selected";

export const RequestLeave: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Leave requests are created against a resolved employee profile, not just the user account.
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>("");
  const [resolvingEmployee, setResolvingEmployee] = useState(true);
  const [formValues, setFormValues] = useState({
    employeeId: "",
    leaveTypeCode: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const { postData: submitLeave, loading: submitting } = usePost();

  const {
    data: employeesResponse,
    isLoading: loadingEmployees,
    error: employeesError,
  } = useFetchHook<PaginatedResponse<HrEmployee>>(
    "/employees?page_size=200",
    "hr-request-leave-employees"
  );

  const {
    data: leaveTypesResponse,
    isLoading: loadingLeaveTypes,
    error: leaveTypesError,
  } = useFetchHook<{ success: boolean; message: string; data: HrLeaveType[] }>(
    "/leaves/types",
    "hr-request-leave-types"
  );

  const {
    data: leaveBalanceResponse,
  } = useFetchHook<{
    success: boolean;
    message: string;
    data: { employee_id: string; employee_name: string; year: number; balances: HrLeaveBalance[] };
  }>(
    `/leaves/balance/${currentEmployeeId}`,
    `hr-leave-balance-${currentEmployeeId}`,
    { enabled: Boolean(currentEmployeeId) }
  );

  useEffect(() => {
    let mounted = true;

    const resolveEmployee = async () => {
      try {
        const employeeId = await getCurrentHrEmployeeId();
        if (!mounted) return;
        setCurrentEmployeeId(employeeId ?? "");
        setFormValues((current) => ({
          ...current,
          employeeId: employeeId ?? current.employeeId,
        }));
      } catch (error: any) {
        if (!mounted) return;
        toast.error(error.response?.data?.message || "Failed to resolve your employee profile.");
      } finally {
        if (mounted) {
          setResolvingEmployee(false);
        }
      }
    };

    resolveEmployee();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (employeesError) {
      toast.error(employeesError.response?.data?.message || "Failed to load employees.");
    }
  }, [employeesError]);

  useEffect(() => {
    if (leaveTypesError) {
      toast.error(leaveTypesError.response?.data?.message || "Failed to load leave types.");
    }
  }, [leaveTypesError]);

  const employees = employeesResponse?.data ?? [];
  const leaveTypes = leaveTypesResponse?.data?.length
    ? leaveTypesResponse.data
    : FALLBACK_LEAVE_TYPES;
  const selectedEmployee =
    employees.find((employee) => employee.employee_id === formValues.employeeId) ?? null;
  const selectedLeaveType =
    leaveTypes.find((leaveType) => leaveType.leave_type_code === formValues.leaveTypeCode) ?? null;

  const leaveBalances = leaveBalanceResponse?.data?.balances ?? [];
  const selectedBalance = selectedLeaveType
    ? leaveBalances.find((b) => b.leave_type_code === selectedLeaveType.leave_type_code) ?? null
    : null;

  const durationDays = (() => {
    if (!formValues.startDate || !formValues.endDate) return 0;

    const start = new Date(formValues.startDate);
    const end = new Date(formValues.endDate);
    const difference = end.getTime() - start.getTime();

    if (Number.isNaN(difference) || difference < 0) return 0;
    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  })();

  // Today's date in YYYY-MM-DD (local) used as the minimum for date inputs.
  const todayStr = new Date().toLocaleDateString("en-CA"); // en-CA gives YYYY-MM-DD

  if (resolvingEmployee || loadingEmployees || loadingLeaveTypes) {
    return <SkeletonLoading />;
  }

  const updateField = (field: keyof typeof formValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  // Submit keeps cache keys aligned so the leave list reflects the new request immediately.
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formValues.employeeId) {
      toast.error("Unable to determine the employee profile for this leave request.");
      return;
    }

    if (!formValues.leaveTypeCode || !formValues.startDate || !formValues.endDate) {
      toast.error("Leave type, start date, and end date are required.");
      return;
    }

    if (formValues.startDate < todayStr) {
      toast.error("Start date cannot be in the past.");
      return;
    }

    if (durationDays <= 0) {
      toast.error("End date must be the same as or later than the start date.");
      return;
    }

    try {
      await submitLeave('/leaves/request', {
        employee_id: formValues.employeeId,
        leave_type: formValues.leaveTypeCode,
        start_date: `${formValues.startDate}T23:59:59`,
        end_date: `${formValues.endDate}T23:59:59`,
        reason: formValues.reason.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["hr-leaves"] });
      toast.success("Leave request submitted successfully.");
      navigate("/dashboard/leavemanagement");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit leave request.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => navigate("/dashboard/leavemanagement")}
        className="flex w-fit items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to Leave Management
      </button>

      <div>
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Request Leave</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Submit a leave request using the same workflow and layout as the rest of the HR system.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Employee Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName}>Employee</label>
                <select
                  className={inputClassName}
                  value={formValues.employeeId}
                  onChange={(e) => updateField("employeeId", e.target.value)}
                  disabled={loadingEmployees || resolvingEmployee}
                >
                  <option value="">
                    {resolvingEmployee
                      ? "Resolving employee..."
                      : loadingEmployees
                        ? "Loading employees..."
                        : "Select employee"}
                  </option>
                  {employees.map((employee) => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {`${employee.first_name} ${employee.last_name}`.trim()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClassName}>Employee Code</label>
                <input
                  className={inputClassName}
                  value={selectedEmployee?.employee_code ?? ""}
                  placeholder="Employee code"
                  readOnly
                />
              </div>
              <div>
                <label className={labelClassName}>Department</label>
                <input
                  className={inputClassName}
                  value={selectedEmployee?.department?.department_name ?? ""}
                  placeholder="Department"
                  readOnly
                />
              </div>
              <div>
                <label className={labelClassName}>Role</label>
                <input
                  className={inputClassName}
                  value={selectedEmployee?.position ?? ""}
                  placeholder="Role"
                  readOnly
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Leave Details</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClassName}>Leave Type</label>
                  <select
                    className={inputClassName}
                    value={formValues.leaveTypeCode}
                    onChange={(e) => updateField("leaveTypeCode", e.target.value)}
                    disabled={loadingLeaveTypes}
                  >
                    <option value="">
                      {loadingLeaveTypes ? "Loading leave types..." : "Select leave type"}
                    </option>
                    {leaveTypes.map((leaveType) => (
                      <option key={leaveType.leave_type_id} value={leaveType.leave_type_code}>
                        {leaveType.leave_type_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClassName}>Paid Leave</label>
                  <input
                    className={inputClassName}
                    value={
                      selectedLeaveType
                        ? selectedLeaveType.is_paid
                          ? "Paid"
                          : "Unpaid"
                        : ""
                    }
                    placeholder="Leave pay status"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClassName}>Start Date</label>
                  <input
                    type="date"
                    className={inputClassName}
                    value={formValues.startDate}
                    min={todayStr}
                    onChange={(e) => updateField("startDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClassName}>End Date</label>
                  <input
                    type="date"
                    className={inputClassName}
                    value={formValues.endDate}
                    min={formValues.startDate || todayStr}
                    onChange={(e) => updateField("endDate", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Reason</label>
                <textarea
                  rows={5}
                  className={inputClassName}
                  placeholder="Add the reason for your leave request"
                  value={formValues.reason}
                  onChange={(e) => updateField("reason", e.target.value)}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Submission</h2>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/leavemanagement")}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={submitting} loading={submitting}>
                Submit Leave Request
              </Button>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Request Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-600">Employee</span>
                  <span className="text-right font-medium text-gray-800">
                    {selectedEmployee
                      ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`.trim()
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-600">Leave Type</span>
                  <span className="text-right font-medium text-gray-800">
                    {formatLeaveTypeLabel(selectedLeaveType)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-600">Start Date</span>
                  <span className="text-right font-medium text-gray-800">
                    {formValues.startDate || "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-600">End Date</span>
                  <span className="text-right font-medium text-gray-800">
                    {formValues.endDate || "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="text-right font-medium text-gray-800">
                    {durationDays ? `${durationDays} day${durationDays > 1 ? "s" : ""}` : "-"}
                  </span>
                </div>
                {selectedBalance !== null && (
                  <>
                    <hr className="border-gray-100" />
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-600">Available Days</span>
                      <span
                        className={`text-right font-medium ${
                          durationDays > 0 && selectedBalance.available_days < durationDays
                            ? "text-red-600"
                            : "text-green-700"
                        }`}
                      >
                        {selectedBalance.available_days} / {selectedBalance.allocated_days}
                      </span>
                    </div>
                    {durationDays > 0 && selectedBalance.available_days < durationDays && (
                      <p className="text-xs text-red-600 bg-red-50 rounded-md px-2 py-1.5">
                        Insufficient balance — you have {selectedBalance.available_days} day{selectedBalance.available_days !== 1 ? "s" : ""} but requested {durationDays}.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-blue-800">
                <CalendarDays className="h-4 w-4" />
                <p className="text-sm font-semibold">Leave Type Notes</p>
              </div>
              <p className="text-sm text-blue-700">
                {selectedLeaveType?.description ||
                  "Select a leave type to review its description and submit the request with the correct category."}
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
                Confirm your dates carefully. The backend checks leave balance and overlapping requests before approval.
              </p>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-gray-800">
                  <TimerReset className="h-4 w-4" />
                  <p className="text-sm font-semibold">Duration</p>
                </div>
                <p className="text-sm text-gray-600">
                  {durationDays
                    ? `${durationDays} calendar day${durationDays > 1 ? "s" : ""}`
                    : "Choose start and end dates to calculate duration."}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-gray-800">
                  <FileText className="h-4 w-4" />
                  <p className="text-sm font-semibold">Request Reason</p>
                </div>
                <p className="text-sm text-gray-600">
                  {formValues.reason.trim()
                    ? `${formValues.reason.trim().slice(0, 120)}${formValues.reason.trim().length > 120 ? "..." : ""}`
                    : "Add a short reason to help the approver review your request faster."}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
};
