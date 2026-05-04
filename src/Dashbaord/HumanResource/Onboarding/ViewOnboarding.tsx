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

const progressColors = ["bg-emerald-500", "bg-blue-500", "bg-amber-400"];

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
      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={16} className="text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
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
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
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
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
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
  onEdit: () => void;
}

export const ViewOnboarding: React.FC<ViewOnboardingProps> = ({
  record,
  onBack,
  onEdit,
}) => {
  const colorIdx = parseInt(record.id, 10) % progressColors.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Onboarding
      </button>

      {/* Header Card */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={record.avatar}
              alt={record.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{record.name}</h1>
                <StatusBadge status="Active" />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{record.role}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 uppercase">
                  {record.onboardingType === "intern" ? "Intern" : "Employee"} Onboarding
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">ID: ONB-{record.id.padStart(3, "0")}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </SectionCard>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
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
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
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
            <div className="w-full h-2.5 rounded-full bg-gray-100">
              <div
                className={`h-2.5 rounded-full transition-all ${progressColors[colorIdx]}`}
                style={{ width: `${record.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {record.progress >= 75
                ? "Almost complete"
                : record.progress >= 50
                ? "Halfway there"
                : "In early stages"}
            </p>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Content — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={User} label="Full Name" value={record.name} />
              <InfoRow icon={Mail} label="Email" value={`${record.name.toLowerCase().replace(/\s/g, ".")}@company.com`} />
              <InfoRow icon={Phone} label="Phone" value="+237 6XX XXX XXX" />
              <InfoRow icon={Briefcase} label="Role" value={record.role} />
            </div>
          </SectionCard>

          {/* Onboarding Details */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Onboarding Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              <InfoRow icon={FileText} label="Department" value={record.role} />
              {record.onboardingType === "intern" && (
                <>
                  <InfoRow icon={GraduationCap} label="School" value="—" />
                  <InfoRow icon={GraduationCap} label="Speciality" value="—" />
                  <InfoRow icon={GraduationCap} label="Level" value="—" />
                </>
              )}
            </div>
          </SectionCard>

          {/* Documentation */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Progress & Documentation</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={CreditCard} label="ID Card Number" value="—" />
              <InfoRow icon={FileText} label="Documents" value="No documents uploaded" />
            </div>
          </SectionCard>
        </div>

        {/* Right Sidebar — 1/3 */}
        <div className="space-y-6">
          {/* Profile Card */}
          <SectionCard>
            <div className="flex flex-col items-center text-center gap-3">
              <img
                src={record.avatar}
                alt={record.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-50"
              />
              <div>
                <p className="text-base font-semibold text-gray-900">{record.name}</p>
                <p className="text-sm text-gray-500">{record.role}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                {record.onboardingType}
              </span>
            </div>
          </SectionCard>

          {/* Status Card */}
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Onboarding Status</span>
                  <StatusBadge status="Active" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-800">{record.progress}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Workflow</span>
                  <WorkflowBadge workflow={record.workflow} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Timeline Card */}
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <div className="w-0.5 flex-1 bg-gray-200" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-800">Onboarding Started</p>
                    <p className="text-xs text-gray-400">
                      {new Date(record.startDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <div className="w-0.5 flex-1 bg-gray-200" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-800">Documents Submitted</p>
                    <p className="text-xs text-gray-400">Pending</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Onboarding Complete</p>
                    <p className="text-xs text-gray-400">Not yet</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
