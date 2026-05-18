import React, { useState } from "react";
import { ArrowLeft, Monitor, UserCheck, GraduationCap } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import useUpdate from "../../../Hooks/UseUpdateHook";
import { toast } from "sonner";
import type { HrEmployeeDetail } from "../hrApi";

// ── Types ──────────────────────────────────────────────────────────────────────

type ConvertForm = {
  newPosition: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT";
};

const DEFAULT_CONVERT_FORM: ConvertForm = {
  newPosition: "",
  employmentType: "FULL_TIME",
};

interface Props {
  internId: string;
  onBack: () => void;
  onConverted: () => void;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="font-medium text-gray-900 text-sm">{value || "-"}</p>
    </div>
  );
}

const ASSET_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  IN_USE: "bg-blue-100 text-blue-700",
  UNDER_MAINTENANCE: "bg-yellow-100 text-yellow-700",
  RETIRED: "bg-gray-100 text-gray-500",
  DISPOSED: "bg-red-100 text-red-600",
};

function InternDevicesSection({ internId }: { internId: string }) {
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
  }>(`/assets?employee_id=${internId}&limit=50`, `intern-assets-${internId}`);

  const assets = data?.data?.assets ?? [];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="w-5 h-5 text-gray-600" />
        <h2 className="text-base font-semibold text-gray-900">Assigned Devices</h2>
      </div>
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading devices…</p>
      ) : assets.length === 0 ? (
        <p className="text-sm text-gray-500">No devices assigned to this intern.</p>
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
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        ASSET_STATUS_COLORS[asset.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
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

// ── Main component ─────────────────────────────────────────────────────────────

export const InternDetailView: React.FC<Props> = ({ internId, onBack, onConverted }) => {
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [convertForm, setConvertForm] = useState<ConvertForm>(DEFAULT_CONVERT_FORM);
  const [converting, setConverting] = useState(false);

  const { updateData } = useUpdate();

  const { data: detailResponse, isLoading } = useFetchHook<{
    success: boolean;
    data: HrEmployeeDetail;
  }>(`/employees/${internId}`, `intern-detail-${internId}`);

  const intern = detailResponse?.data ?? null;

  const fullName =
    `${intern?.user_info?.first_name ?? ""} ${intern?.user_info?.last_name ?? ""}`.trim() || "-";

  const handleOpenConvert = () => {
    const currentPosition = intern?.employment_info?.position ?? "";
    setConvertForm({
      newPosition: currentPosition.replace(/intern/i, "").trim(),
      employmentType: "FULL_TIME",
    });
    setShowConvertDialog(true);
  };

  const handleConfirmConvert = async () => {
    if (!intern) return;
    if (!convertForm.newPosition.trim()) {
      toast.error("Please enter the new position.");
      return;
    }
    setConverting(true);
    try {
      await updateData(
        `/employees/${internId}`,
        {
          employment_info: {
            employment_type: convertForm.employmentType,
            position: convertForm.newPosition.trim(),
          },
        },
        "patch"
      );
      toast.success(`${fullName} has been converted to a full employee.`);
      setShowConvertDialog(false);
      onConverted();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to convert intern.");
    } finally {
      setConverting(false);
    }
  };

  const employmentStatus = intern?.employment_info?.employment_status ?? "-";
  const isActive = employmentStatus === "ACTIVE";

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Intern Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-sm text-gray-500">
                {intern?.employment_info?.position || "Intern"} •{" "}
                {intern?.employment_info?.department?.department_name ?? "Unassigned"}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap items-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {employmentStatus}
          </span>
          {isActive && (
            <button
              type="button"
              onClick={handleOpenConvert}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Convert to Employee
            </button>
          )}
        </div>
      </div>

      {/* Detail cards */}
      {isLoading ? (
        <SkeletonLoading />
      ) : intern ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <DetailCard label="Full Name" value={fullName} />
          <DetailCard label="Employee Code" value={intern.employee_code} />
          <DetailCard
            label="Email"
            value={intern.user_info?.email ?? "-"}
          />
          <DetailCard
            label="Phone"
            value={intern.user_info?.phone ?? intern.phone_number ?? "-"}
          />
          <DetailCard
            label="Department"
            value={intern.employment_info?.department?.department_name ?? "-"}
          />
          <DetailCard
            label="Position"
            value={intern.employment_info?.position ?? "-"}
          />
          <DetailCard
            label="Employment Type"
            value={intern.employment_info?.employment_type ?? "-"}
          />
          <DetailCard
            label="Start Date"
            value={
              intern.employment_info?.start_date
                ? new Date(intern.employment_info.start_date).toLocaleDateString()
                : "-"
            }
          />
          <DetailCard label="National ID" value={intern.national_id ?? "-"} />
          <DetailCard label="Gender" value={intern.gender ?? "-"} />
          <DetailCard
            label="Address"
            className="md:col-span-2"
            value={
              [
                intern.address?.street,
                intern.address?.city,
                intern.address?.region,
                intern.address?.country,
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
                intern.emergency_contact?.name,
                intern.emergency_contact?.relationship,
                intern.emergency_contact?.phone,
              ]
                .filter(Boolean)
                .join(" • ") || "-"
            }
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500">Intern record not found.</p>
      )}

      {/* Devices */}
      <InternDevicesSection internId={internId} />

      {/* Convert to Employee dialog */}
      <AlertDialog
        open={showConvertDialog}
        onOpenChange={(open) => !open && setShowConvertDialog(false)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Convert to Full Employee
            </AlertDialogTitle>
            <AlertDialogDescription>
              Converting <strong>{fullName}</strong> from intern to a full employee. Confirm the new role details below.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Position / Job Title
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Software Developer"
                value={convertForm.newPosition}
                onChange={(e) =>
                  setConvertForm((f) => ({ ...f, newPosition: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={convertForm.employmentType}
                onChange={(e) =>
                  setConvertForm((f) => ({
                    ...f,
                    employmentType: e.target.value as ConvertForm["employmentType"],
                  }))
                }
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={converting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmConvert}
              disabled={converting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {converting ? "Converting…" : "Convert to Employee"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
