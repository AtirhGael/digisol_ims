import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../components/ui/button";
import SkeletonLoading from "../../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { useFetchHook } from "../../../../Hooks/UseFetchHook";
import useUpdate from "../../../../Hooks/UseUpdateHook";
import { type HrLeaveRequest, type HrLeaveType } from "../../hrApi";

type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
};

type PolicyFormState = {
  leave_type_name: string;
  description: string;
  default_days_per_year: number;
  requires_approval: boolean;
  requires_documentation: boolean;
  is_paid: boolean;
};

const emptyPolicyForm: PolicyFormState = {
  leave_type_name: "",
  description: "",
  default_days_per_year: 0,
  requires_approval: true,
  requires_documentation: false,
  is_paid: true,
};

const PolicyLine = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 shrink-0">
      <CheckCircle className="h-5 w-5 text-green-500" />
    </div>
    <p className="text-sm text-gray-700">{children}</p>
  </div>
);

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const LeavePolicies: React.FC = () => {
  const [showPolicyHistory, setShowPolicyHistory] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<HrLeaveType | null>(null);
  const [policyForm, setPolicyForm] = useState<PolicyFormState>(emptyPolicyForm);
  const { updateData: updatePolicy, loading: savingPolicy } = useUpdate();
  const {
    data: leaveTypesResponse,
    isLoading: leaveTypesLoading,
    error: leaveTypesError,
    refetch: refetchLeaveTypes,
  } = useFetchHook<{ success: boolean; message: string; data: HrLeaveType[] }>(
    "/leaves/types",
    "hr-leave-policies-types"
  );
  const { data: leaveRequestsResponse, isLoading: leaveRequestsLoading, error: leaveRequestsError } =
    useFetchHook<PaginatedResponse<HrLeaveRequest>>(
      "/leaves/requests?page_size=200",
      "hr-leave-policies-requests"
    );

  useEffect(() => {
    if (leaveTypesError) {
      toast.error(leaveTypesError.response?.data?.message || "Failed to load leave policies.");
    }
  }, [leaveTypesError]);

  useEffect(() => {
    if (leaveRequestsError) {
      toast.error(leaveRequestsError.response?.data?.message || "Failed to load leave requests.");
    }
  }, [leaveRequestsError]);

  const leaveTypes = leaveTypesResponse?.data ?? [];
  const leaveRequests = leaveRequestsResponse?.data ?? [];

  const startEditPolicy = (policy: HrLeaveType) => {
    setEditingPolicy(policy);
    setPolicyForm({
      leave_type_name: policy.leave_type_name,
      description: policy.description ?? "",
      default_days_per_year: policy.default_days_per_year ?? 0,
      requires_approval: Boolean(policy.requires_approval),
      requires_documentation: Boolean(policy.requires_documentation),
      is_paid: Boolean(policy.is_paid),
    });
  };

  const handleSavePolicy = async () => {
    if (!editingPolicy) return;

    try {
      const response = await updatePolicy(`/leaves/types/${editingPolicy.leave_type_id}`, {
        ...policyForm,
        description: policyForm.description.trim() || null,
      }, 'patch');
      toast.success("Leave policy updated successfully");
      refetchLeaveTypes();
      setEditingPolicy(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update leave policy.");
    }
  };

  const typeUsage = leaveTypes.map((leaveType) => ({
    ...leaveType,
    requestCount: leaveRequests.filter((request) => request.leave_type === leaveType.leave_type_code)
      .length,
  }));

  const policyHistory = leaveRequests
    .slice()
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .map((request) => ({
      id: request.request_id,
      employeeName: request.employee_name,
      policyName: request.leave_type,
      status: request.status,
      period: `${formatDate(request.start_date)} - ${formatDate(request.end_date)}`,
      updatedAt: formatDate(request.updated_at || request.created_at),
      note:
        request.status === "REJECTED"
          ? request.rejection_reason || "Rejected without a note"
          : request.status === "APPROVED"
            ? `Approved by ${request.approved_by || "HR"}`
            : request.reason || "Pending review",
    }));

  if (leaveTypesLoading || leaveRequestsLoading) {
    return <SkeletonLoading />;
  }

  if (showPolicyHistory) {
    return (
      <div className="rounded-lg bg-white p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={() => setShowPolicyHistory(false)}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leave Policies
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Policy History</h2>
          <p className="text-sm text-gray-500">A clear audit trail of leave request activity.</p>
        </div>

        {policyHistory.length ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Policy", "Employee", "Period", "Status", "Updated", "Note"].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {policyHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.policyName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{entry.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{entry.period}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                      {entry.status.toLowerCase()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{entry.updatedAt}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="block truncate" title={entry.note}>
                        {entry.note}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-gray-900">No policy history yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Leave request activity will appear here once employees start using leave policies.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (editingPolicy) {
    const updateForm = (nextForm: Partial<PolicyFormState>) => {
      setPolicyForm((current) => ({
        ...current,
        ...nextForm,
      }));
    };

    return (
      <div className="rounded-lg bg-white p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={() => setEditingPolicy(null)}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leave Policies
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Edit Policy</h2>
          <p className="text-sm text-gray-500">Update the visible policy settings for this leave type.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Policy to Edit</span>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={editingPolicy.leave_type_id}
              onChange={(event) => {
                const selectedPolicy = leaveTypes.find(
                  (policy) => policy.leave_type_id === event.target.value
                );
                if (selectedPolicy) {
                  startEditPolicy(selectedPolicy);
                }
              }}
              disabled={savingPolicy}
            >
              {leaveTypes.map((policy) => (
                <option key={policy.leave_type_id} value={policy.leave_type_id}>
                  {policy.leave_type_name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Policy Name</span>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={policyForm.leave_type_name}
              onChange={(event) => updateForm({ leave_type_name: event.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Default Days Per Year</span>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={policyForm.default_days_per_year}
              onChange={(event) => updateForm({ default_days_per_year: Number(event.target.value) })}
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={policyForm.description}
              onChange={(event) => updateForm({ description: event.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-gray-100 p-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={policyForm.is_paid}
              onChange={(event) => updateForm({ is_paid: event.target.checked })}
            />
            Paid leave
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-gray-100 p-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={policyForm.requires_approval}
              onChange={(event) => updateForm({ requires_approval: event.target.checked })}
            />
            Requires approval
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-gray-100 p-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={policyForm.requires_documentation}
              onChange={(event) => updateForm({ requires_documentation: event.target.checked })}
            />
            Requires documentation
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => setEditingPolicy(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSavePolicy}
            disabled={savingPolicy}
            loading={savingPolicy}
          >
            Save Policy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Leave Policies</h2>
            <p className="text-sm text-gray-500">Manage the leave rules your team uses every day.</p>
          </div>
          <Button
            className="text-xs sm:text-sm"
            variant="outline"
            type="button"
            onClick={() => {
              const firstPolicy = leaveTypes[0];
              if (!firstPolicy) {
                toast.error("No policy available to edit.");
                return;
              }
              startEditPolicy(firstPolicy);
            }}
          >
            Edit Policy
          </Button>
        </div>

        {typeUsage.length ? (
          <div className="space-y-4">
            {typeUsage.map((leaveType) => (
              <div
                key={leaveType.leave_type_id}
                className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6"
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                      {leaveType.leave_type_name}
                    </h3>
                    <p className="text-sm text-gray-500">Code: {leaveType.leave_type_code}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {leaveType.requestCount} request{leaveType.requestCount === 1 ? "" : "s"} in system
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <PolicyLine>
                    {leaveType.default_days_per_year ?? 0} default days per year
                  </PolicyLine>
                  <PolicyLine>{leaveType.is_paid ? "Paid leave" : "Unpaid leave"}</PolicyLine>
                  <PolicyLine>
                    {leaveType.requires_approval ? "Approval required" : "Auto-approved"}
                  </PolicyLine>
                  <PolicyLine>
                    {leaveType.requires_documentation ? "Documentation required" : "No documents required"}
                  </PolicyLine>
                </div>

                {leaveType.description ? (
                  <p className="mt-4 text-sm text-gray-600">{leaveType.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-gray-900">No leave types found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The backend has not returned any leave policy types yet.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowPolicyHistory(true)}
          className="mt-6 flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/70"
        >
          View Policy History
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default LeavePolicies;
