import React from "react";
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  MapPin,
  User,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  CreditCard,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { OnboardingRecord } from "./onboardingData";
import { getProgressColorIndex, PROGRESS_COLORS } from "./onboardingUtils";

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
        <p className="mt-0.5 text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Completed: "bg-blue-100 text-blue-700",
    Inactive: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function WorkflowBadge({ workflow }: { workflow: string }) {
  const styles: Record<string, string> = {
    Hybrid: "bg-blue-100 text-blue-700",
    Onsite: "bg-green-100 text-green-700",
    Remote: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[workflow] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {workflow}
    </span>
  );
}

interface ViewOnboardingProps {
  record: OnboardingRecord;
  onBack: () => void;
  onEdit?: () => void;
}

export function ViewOnboarding({
  record,
  onBack,
  onEdit,
}: ViewOnboardingProps) {
  const colorIdx = getProgressColorIndex(record.id);
  const statusLabel =
    record.employmentStatus === "TERMINATED" || record.userStatus === "INACTIVE"
      ? "Inactive"
      : record.userStatus === "PENDING_ACTIVATION"
        ? "Pending"
        : record.progress >= 100
          ? "Completed"
          : "Active";
  const addressValue =
    [
      record.addressStreet,
      record.addressCity,
      record.addressRegion,
      record.addressCountry,
      record.addressPostalCode,
    ]
      .filter(Boolean)
      .join(", ") || "Not provided";

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={onBack}
        className="flex w-fit items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to Onboarding
      </button>

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
                <StatusBadge status={statusLabel} />
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{record.role}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs uppercase text-gray-400">
                  {record.onboardingType === "intern" ? "Intern" : "Employee"} Onboarding
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-400">
                  ID: {record.employeeCode || record.id}
                </span>
              </div>
            </div>
          </div>
          {onEdit ? (
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Calendar size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Start Date</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(record.startDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <MapPin size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Workflow</p>
              <WorkflowBadge workflow={record.workflow} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Progress</p>
              <span className="text-sm font-semibold text-gray-800">{record.progress}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100">
              <div
                className={`h-2.5 rounded-full transition-all ${PROGRESS_COLORS[colorIdx]}`}
                style={{ width: `${record.progress}%` }}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoRow icon={User} label="Full Name" value={record.name} />
              <InfoRow icon={Mail} label="Email" value={record.email || "Not provided"} />
              <InfoRow icon={Phone} label="Phone" value={record.phone || "Not provided"} />
              <InfoRow icon={Briefcase} label="Role" value={record.role} />
            </div>
          </SectionCard>

          <SectionCard>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Onboarding Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoRow
                icon={Briefcase}
                label="Onboarding Type"
                value={record.onboardingType === "intern" ? "Intern Onboarding" : "Employee Onboarding"}
              />
              <InfoRow icon={MapPin} label="Workflow" value={record.workflow} />
              <InfoRow
                icon={Calendar}
                label="Start Date"
                value={new Date(record.startDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
              <InfoRow
                icon={FileText}
                label="Department"
                value={record.departmentName || "Not provided"}
              />
              {record.onboardingType === "intern" ? (
                <>
                  <InfoRow icon={GraduationCap} label="School" value={record.school || "Not provided"} />
                  <InfoRow
                    icon={GraduationCap}
                    label="Speciality"
                    value={record.speciality || "Not provided"}
                  />
                  <InfoRow icon={GraduationCap} label="Level" value={record.level || "Not provided"} />
                </>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Documentation</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoRow icon={CreditCard} label="ID Card Number" value={record.nationalId || "Not provided"} />
              <InfoRow icon={FileText} label="Address" value={addressValue} />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <div className="flex flex-col items-center gap-3 text-center">
              <img
                src={record.avatar}
                alt={record.name}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-50"
              />
              <div>
                <p className="text-base font-semibold text-gray-900">{record.name}</p>
                <p className="text-sm text-gray-500">{record.role}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary">
                {record.onboardingType}
              </span>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Onboarding Status</span>
                  <StatusBadge status={statusLabel} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Employment Status</span>
                  <span className="font-medium text-gray-800">
                    {record.employmentStatus || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Account Status</span>
                  <span className="font-medium text-gray-800">{record.userStatus || "Not provided"}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
