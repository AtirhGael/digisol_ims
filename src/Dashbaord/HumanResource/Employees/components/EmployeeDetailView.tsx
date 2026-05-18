import React from "react";
import { ArrowLeft, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SkeletonLoading from "../../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { Button } from "../../../../components/ui/button";
import { useFetchHook } from "../../../../Hooks/UseFetchHook";
import type { HrEmployeeDetail } from "../../hrApi";
import type { EmployeeRow } from "../types";

interface Props {
  selectedEmployee: HrEmployeeDetail | null;
  selectedEmployeeRow: EmployeeRow | null;
  loading: boolean;
  onBack: () => void;
}

function DetailCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  IN_USE: "bg-blue-100 text-blue-700",
  UNDER_MAINTENANCE: "bg-yellow-100 text-yellow-700",
  RETIRED: "bg-gray-100 text-gray-500",
  DISPOSED: "bg-red-100 text-red-600",
};

function EmployeeDevicesSection({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useFetchHook<{
    success: boolean;
    data: {
      assets: Array<{
        asset_id: string;
        name: string;
        asset_type: string;
        serial_number?: string;
        status: string;
        purchase_date?: string;
      }>;
      pagination: unknown;
    };
  }>(`/assets?employee_id=${employeeId}&limit=50`, `employee-assets-${employeeId}`);

  const assets = data?.data?.assets ?? [];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="w-5 h-5 text-gray-600" />
        <h2 className="text-base font-semibold text-gray-900">Company Devices</h2>
      </div>
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading devices…</p>
      ) : assets.length === 0 ? (
        <p className="text-sm text-gray-500">No devices assigned to this employee.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="pb-2 pr-4 font-medium">Asset Name</th>
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 pr-4 font-medium">Serial Number</th>
                <th className="pb-2 pr-4 font-medium">Date Assigned</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.asset_id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-4 text-gray-800 font-medium">{asset.name || "-"}</td>
                  <td className="py-2 pr-4 text-gray-600">{asset.asset_type || "-"}</td>
                  <td className="py-2 pr-4 text-gray-600 font-mono text-xs">{asset.serial_number || "-"}</td>
                  <td className="py-2 pr-4 text-gray-600">
                    {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[asset.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {asset.status?.replace(/_/g, " ") || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export const EmployeeDetailView: React.FC<Props> = ({
  selectedEmployee,
  selectedEmployeeRow,
  loading,
  onBack,
}) => {
  const navigate = useNavigate();

  const detailDepartment =
    selectedEmployee?.employment_info?.department?.department_name ??
    selectedEmployeeRow?.department ??
    "-";

  return (
    <div className="min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Employee Records
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
          <p className="text-sm text-gray-500">
            Review the selected employee record.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={() =>
              selectedEmployee?.employee_id &&
              navigate(
                `/dashboard/employees/${selectedEmployee.employee_id}/edit`
              )
            }
          >
            Edit Employee
          </Button>
        </div>
      </div>

      {loading ? (
        <SkeletonLoading />
      ) : selectedEmployee ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <DetailCard
            label="Full Name"
            value={
              `${selectedEmployee.user_info?.first_name ?? ""} ${selectedEmployee.user_info?.last_name ?? ""}`.trim() ||
              "-"
            }
          />
          <DetailCard
            label="Employee Code"
            value={selectedEmployee.employee_code}
          />
          <DetailCard
            label="Email"
            value={
              selectedEmployee.user_info?.email ||
              selectedEmployeeRow?.email ||
              "-"
            }
          />
          <DetailCard label="Department" value={detailDepartment} />
          <DetailCard
            label="Position"
            value={selectedEmployee.employment_info?.position || "-"}
          />
          <DetailCard
            label="Employment Status"
            value={
              selectedEmployee.employment_info?.employment_status || "-"
            }
          />
          <DetailCard
            label="National ID"
            value={selectedEmployee.national_id || "-"}
          />
          <DetailCard
            label="Start Date"
            value={
              selectedEmployee.employment_info?.start_date
                ? new Date(
                    selectedEmployee.employment_info.start_date
                  ).toLocaleDateString()
                : "-"
            }
          />
          <DetailCard
            label="Address"
            className="md:col-span-2"
            value={
              [
                selectedEmployee.address?.street,
                selectedEmployee.address?.city,
                selectedEmployee.address?.region,
                selectedEmployee.address?.country,
              ]
                .filter(Boolean)
                .join(", ") || "-"
            }
          />
          <DetailCard
            label="Emergency Contact"
            className="md:col-span-2"
            value={
              [
                selectedEmployee.emergency_contact?.name,
                selectedEmployee.emergency_contact?.relationship,
                selectedEmployee.emergency_contact?.phone,
              ]
                .filter(Boolean)
                .join(" • ") || "-"
            }
          />
        </div>
      ) : null}

      {selectedEmployee && (
        <EmployeeDevicesSection employeeId={selectedEmployee.employee_id} />
      )}
    </div>
  );
};
