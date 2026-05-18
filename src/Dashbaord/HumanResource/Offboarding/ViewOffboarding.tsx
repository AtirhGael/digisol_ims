import React from "react";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { OffboardingRecord } from "./offboardingData";

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-6 ${className}`}>
      {children}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Icon size={16} className="text-gray-500" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-800">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    employee: "bg-blue-100 text-blue-700",
    intern: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        styles[type] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    RESIGNED: "bg-orange-100 text-orange-700",
    TERMINATED: "bg-red-100 text-red-700",
    ON_LEAVE: "bg-yellow-100 text-yellow-700",
    SUSPENDED: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

interface ViewOffboardingProps {
  record: OffboardingRecord;
  onBack: () => void;
  onOffboard?: () => void;
}

export function ViewOffboarding({ record, onBack, onOffboard }: ViewOffboardingProps) {
  const canOffboard = record.status === "ACTIVE";

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={onBack}
        className="flex w-fit items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-orange-600"
      >
        <ArrowLeft size={16} />
        Back to Offboarding
      </button>

      {/* Profile card */}
      <SectionCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={record.avatar}
              alt={record.name}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{record.name}</h1>
                <StatusBadge status={record.status} />
                <TypeBadge type={record.offboardingType} />
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{record.role}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-gray-400">
                ID: {record.employeeCode || record.id}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            {canOffboard && onOffboard ? (
              <Button
                onClick={onOffboard}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                Offboard
              </Button>
            ) : null}
          </div>
        </div>
      </SectionCard>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SectionCard>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Contact
          </h2>
          <div className="space-y-4">
            <InfoRow icon={Mail} label="Email" value={record.email ?? ""} />
            <InfoRow icon={Phone} label="Phone" value={record.phone ?? ""} />
          </div>
        </SectionCard>

        <SectionCard>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Employment
          </h2>
          <div className="space-y-4">
            <InfoRow icon={Briefcase} label="Role" value={record.role} />
            <InfoRow icon={User} label="Department" value={record.departmentName ?? ""} />
            <InfoRow icon={Calendar} label="Start Date" value={record.startDate} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
