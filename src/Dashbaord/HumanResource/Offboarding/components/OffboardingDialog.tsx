import React, { useState } from "react";
import { AlertTriangle, LogOut, Monitor } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import { useFetchHook } from "../../../../Hooks/UseFetchHook";
import type { OffboardingRecord, OffboardReason } from "../offboardingData";

// ── Device checklist (employees only) ────────────────────────────────────────

type DeviceAsset = {
  asset_id: string;
  name: string;
  asset_type: string;
  serial_number?: string;
};

function DeviceReturnChecklist({
  employeeId,
  returnedIds,
  onToggle,
}: {
  employeeId: string;
  returnedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { data, isLoading } = useFetchHook<{ success: boolean; data: { assets: DeviceAsset[]; pagination: unknown } }>(
    `/assets?employee_id=${employeeId}&limit=50`,
    `offboard-assets-${employeeId}`
  );

  const assets = data?.data?.assets ?? [];

  if (isLoading) {
    return <p className="py-3 text-sm text-gray-400">Loading assigned devices…</p>;
  }

  if (assets.length === 0) {
    return (
      <p className="py-3 text-sm text-gray-500">
        No devices are currently assigned to this person.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Monitor className="h-4 w-4 text-gray-500" />
        Confirm devices returned
      </p>
      <div className="max-h-52 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
        {assets.map((asset) => (
          <label
            key={asset.asset_id}
            className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50"
          >
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 accent-orange-600"
              checked={returnedIds.has(asset.asset_id)}
              onChange={() => onToggle(asset.asset_id)}
            />
            <span className="flex-1 text-sm text-gray-800">{asset.name}</span>
            <span className="text-xs text-gray-400">{asset.asset_type}</span>
            {asset.serial_number ? (
              <span className="font-mono text-xs text-gray-400">{asset.serial_number}</span>
            ) : null}
          </label>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Check each device once it has been physically returned.
      </p>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({
  labels,
  current,
}: {
  labels: string[];
  current: number;
}) {
  return (
    <div className="mb-4 flex items-center gap-1">
      {labels.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <React.Fragment key={label}>
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${
                active ? "text-orange-600" : done ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  active
                    ? "bg-orange-100 text-orange-700"
                    : done
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {n}
              </span>
              {label}
            </div>
            {i < labels.length - 1 ? <div className="mx-1 h-px flex-1 bg-gray-200" /> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main dialog ───────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

type OffboardingDialogProps = {
  record: OffboardingRecord;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: OffboardReason) => void;
};

export function OffboardingDialog({
  record,
  isSubmitting,
  onClose,
  onConfirm,
}: OffboardingDialogProps) {
  const isIntern = record.offboardingType === "intern";
  const stepLabels = isIntern ? ["Reason", "Confirm"] : ["Reason", "Devices", "Confirm"];

  const [step, setStep] = useState<Step>(1);
  const [reason, setReason] = useState<OffboardReason | "">("");
  const [returnedIds, setReturnedIds] = useState<Set<string>>(new Set());

  // For interns we jump 1 → 3; displayStep maps that back for the indicator
  const displayStep = isIntern && step === 3 ? 2 : step;

  const toggleDevice = (id: string) =>
    setReturnedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleNext = () => {
    if (step === 1) {
      if (!reason) {
        return; // button is disabled
      }
      setStep(isIntern ? 3 : 2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-orange-600" />
            Offboard {isIntern ? "Intern" : "Employee"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{record.name}</strong> · {record.role} · {record.departmentName ?? "-"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <StepIndicator labels={stepLabels} current={displayStep} />

        {/* Step 1 – Reason */}
        {step === 1 ? (
          <div className="space-y-3 pt-1">
            <p className="text-sm font-medium text-gray-700">Select offboarding reason</p>
            {(["RESIGNED", "TERMINATED"] as const).map((r) => (
              <label
                key={r}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  reason === r
                    ? r === "RESIGNED"
                      ? "border-orange-400 bg-orange-50"
                      : "border-red-400 bg-red-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="offboard-reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="mt-0.5 h-4 w-4"
                />
                <div>
                  <p className="text-sm font-medium capitalize text-gray-800">
                    {r.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {r === "RESIGNED"
                      ? "The person voluntarily resigned from the company."
                      : "Employment was terminated by the company."}
                  </p>
                </div>
              </label>
            ))}
          </div>
        ) : null}

        {/* Step 2 – Device return (employees only) */}
        {step === 2 && !isIntern ? (
          <DeviceReturnChecklist
            employeeId={record.id}
            returnedIds={returnedIds}
            onToggle={toggleDevice}
          />
        ) : null}

        {/* Step 3 – Confirm */}
        {step === 3 ? (
          <div className="space-y-1.5 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              Confirm Offboarding
            </div>
            <p>
              <span className="text-gray-500">Name: </span>
              <span className="font-medium text-gray-800">{record.name}</span>
            </p>
            <p>
              <span className="text-gray-500">Role: </span>
              {record.role}
            </p>
            <p>
              <span className="text-gray-500">Department: </span>
              {record.departmentName ?? "-"}
            </p>
            <p>
              <span className="text-gray-500">Reason: </span>
              <span className="font-medium capitalize">{reason.toLowerCase()}</span>
            </p>
            {!isIntern && returnedIds.size > 0 ? (
              <p>
                <span className="text-gray-500">Devices returned: </span>
                {returnedIds.size}
              </p>
            ) : null}
            <p className="pt-1 text-xs text-orange-600">
              This will mark the {isIntern ? "intern" : "employee"} as{" "}
              {reason.toLowerCase()}. This action cannot be undone without manual
              intervention.
            </p>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 && !reason}
              onClick={handleNext}
              className="inline-flex items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <AlertDialogAction
              onClick={() => reason && onConfirm(reason as OffboardReason)}
              disabled={isSubmitting}
              className="bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-600"
            >
              {isSubmitting ? "Processing…" : "Confirm Offboard"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
