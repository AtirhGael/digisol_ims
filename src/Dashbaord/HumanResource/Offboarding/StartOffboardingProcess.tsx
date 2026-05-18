import { useState } from "react";
import { ArrowLeft, Search, UserMinus, CheckCircle2, Monitor } from "lucide-react";
import { toast } from "sonner";
import useUpdate from "../../../Hooks/UseUpdateHook";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import type { OffboardingRecord, OffboardingType, OffboardReason } from "./offboardingData";

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = "select" | "reason" | "devices" | "confirm";

interface Props {
  type: OffboardingType;
  records: OffboardingRecord[];
  isLoadingRecords: boolean;
  onBack: () => void;
  onDone: () => void;
}

// ── Step indicator ─────────────────────────────────────────────────────────────

const EMPLOYEE_STEPS: { key: Step; label: string }[] = [
  { key: "select", label: "Select Person" },
  { key: "reason", label: "Reason" },
  { key: "devices", label: "Devices" },
  { key: "confirm", label: "Confirm" },
];

const INTERN_STEPS: { key: Step; label: string }[] = [
  { key: "select", label: "Select Intern" },
  { key: "reason", label: "Reason" },
  { key: "confirm", label: "Confirm" },
];

function StepIndicator({
  steps,
  current,
}: {
  steps: { key: Step; label: string }[];
  current: Step;
}) {
  const currentIdx = steps.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  done
                    ? "bg-primary text-white"
                    : active
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`mt-1 text-xs font-medium ${
                  active ? "text-primary" : done ? "text-primary/70" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`mx-2 mb-4 h-0.5 w-12 sm:w-20 transition-all ${
                  done ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Reason option configs ─────────────────────────────────────────────────────

const EMPLOYEE_REASONS: { value: OffboardReason; label: string; description: string }[] = [
  {
    value: "RESIGNED",
    label: "Resigned",
    description: "The person voluntarily resigned from the position",
  },
  {
    value: "TERMINATED",
    label: "Terminated",
    description: "The person's employment was terminated by the company",
  },
];

const INTERN_REASONS: { value: OffboardReason; label: string; description: string }[] = [
  {
    value: "INTERNSHIP_COMPLETED",
    label: "Internship Completed",
    description: "The intern has successfully completed their internship programme",
  },
  {
    value: "LEFT",
    label: "Left",
    description: "The intern voluntarily left before completing the programme",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
    description: "The intern was suspended from the programme",
  },
  {
    value: "OTHER",
    label: "Other (specify)",
    description: "Enter a custom reason below",
  },
];

type DeviceAsset = {
  asset_id: string;
  name: string;
  asset_type: string;
  serial_number?: string;
  status: string;
};

function DeviceChecklist({
  employeeId,
  returnedIds,
  onToggle,
}: {
  employeeId: string;
  returnedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { data, isLoading } = useFetchHook<{
    success: boolean;
    data: { assets: DeviceAsset[]; pagination: unknown };
  }>(`/assets?employee_id=${employeeId}&limit=50`, `offboard-proc-assets-${employeeId}`);

  const assets = data?.data?.assets ?? [];

  if (isLoading) return <p className="text-sm text-gray-400 py-4">Loading assigned devices…</p>;
  if (assets.length === 0)
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
        <Monitor className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No devices are currently assigned to this person.</p>
      </div>
    );

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-3">
        Mark each device as returned before proceeding.
      </p>
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
        {assets.map((asset) => (
          <label
            key={asset.asset_id}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 accent-primary"
              checked={returnedIds.has(asset.asset_id)}
              onChange={() => onToggle(asset.asset_id)}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{asset.name}</p>
              {asset.serial_number && (
                <p className="text-xs text-gray-400 font-mono">{asset.serial_number}</p>
              )}
            </div>
            <span className="text-xs text-gray-400 shrink-0">{asset.asset_type}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function StartOffboardingProcess({
  type,
  records,
  isLoadingRecords,
  onBack,
  onDone,
}: Props) {
  const [step, setStep] = useState<Step>("select");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<OffboardingRecord | null>(null);
  const [reason, setReason] = useState<OffboardReason>(
    type === "intern" ? "INTERNSHIP_COMPLETED" : "RESIGNED"
  );
  const [customReason, setCustomReason] = useState("");
  const [returnedIds, setReturnedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateData } = useUpdate();

  const steps = type === "employee" ? EMPLOYEE_STEPS : INTERN_STEPS;

  const filtered = records
    .filter((r) => r.offboardingType === type)
    .filter(
      (r) =>
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.departmentName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.role ?? "").toLowerCase().includes(search.toLowerCase())
    );

  const toggleDevice = (id: string) => {
    setReturnedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const goNext = () => {
    if (step === "select") {
      if (!selected) { toast.error("Please select a person to offboard."); return; }
      setStep("reason");
    } else if (step === "reason") {
      if (reason === "OTHER" && !customReason.trim()) {
        toast.error("Please enter a reason.");
        return;
      }
      setStep(type === "employee" ? "devices" : "confirm");
    } else if (step === "devices") {
      setStep("confirm");
    }
  };

  const goPrev = () => {
    if (step === "reason") setStep("select");
    else if (step === "devices") setStep("reason");
    else if (step === "confirm") setStep(type === "employee" ? "devices" : "reason");
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const finalReason = reason === "OTHER" ? customReason.trim() : reason;
      await updateData(
        `/employees/${selected.id}`,
        { employment_info: { employment_status: finalReason } },
        "patch"
      );
      toast.success(`${selected.name} has been successfully offboarded.`);
      onDone();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to offboard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeLabel = type === "employee" ? "Employee" : "Intern";

  return (
    <div className="min-h-screen space-y-6">
      {/* Page header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Offboarding Dashboard
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <UserMinus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{typeLabel} Offboarding</h1>
            <p className="text-sm text-gray-500">
              Complete the offboarding process for a departing {typeLabel.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator steps={steps} current={step} />

      {/* Step content */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

        {/* ── Step 1: Select person ── */}
        {step === "select" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900">
              Select {typeLabel} to Offboard
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={`Search by name, department or role…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {isLoadingRecords ? (
              <SkeletonLoading />
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <UserMinus className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active {typeLabel.toLowerCase()}s found.</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg">
                {filtered.map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => setSelected(record)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                      selected?.id === record.id ? "bg-primary/5 border-l-2 border-primary" : ""
                    }`}
                  >
                    <img
                      src={record.avatar}
                      alt={record.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{record.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {record.role} · {record.departmentName ?? "Unassigned"}
                      </p>
                    </div>
                    {selected?.id === record.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Reason ── */}
        {step === "reason" && selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <img src={selected.avatar} alt={selected.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-500">{selected.role} · {selected.departmentName}</p>
              </div>
            </div>
            <h2 className="text-base font-semibold text-gray-900">Reason for Offboarding</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(type === "intern" ? INTERN_REASONS : EMPLOYEE_REASONS).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReason(opt.value)}
                  className={`flex items-center gap-3 rounded-lg border-2 px-4 py-4 text-left transition-all ${
                    reason === opt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full border-2 shrink-0 ${
                      reason === opt.value ? "border-primary bg-primary" : "border-gray-300"
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
            {reason === "OTHER" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Please specify the reason
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter the reason for offboarding…"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 resize-none focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Devices (employees only) ── */}
        {step === "devices" && selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <img src={selected.avatar} alt={selected.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-500">{selected.role} · {selected.departmentName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-gray-600" />
              <h2 className="text-base font-semibold text-gray-900">Device Return Checklist</h2>
            </div>
            <DeviceChecklist
              employeeId={selected.id}
              returnedIds={returnedIds}
              onToggle={toggleDevice}
            />
          </div>
        )}

        {/* ── Step 4: Confirm ── */}
        {step === "confirm" && selected && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-gray-900">Confirm Offboarding</h2>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-5 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <img src={selected.avatar} alt={selected.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-500">{selected.role} · {selected.departmentName}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Reason</p>
                  <p className="font-medium text-gray-900">
                    {reason === "OTHER"
                      ? customReason || "—"
                      : (type === "intern" ? INTERN_REASONS : EMPLOYEE_REASONS).find(
                          (o) => o.value === reason
                        )?.label ?? reason}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Department</p>
                  <p className="font-medium text-gray-900">{selected.departmentName ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Employee Code</p>
                  <p className="font-medium text-gray-900">{selected.employeeCode ?? "-"}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              This will update the {typeLabel.toLowerCase()}'s status and cannot be undone.
              Please review carefully before confirming.
            </p>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={step === "select" ? onBack : goPrev}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === "select" ? "Cancel" : "Back"}
        </button>

        {step === "confirm" ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-[#35345f] transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Processing…" : "Confirm Offboarding"}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-[#35345f] transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
