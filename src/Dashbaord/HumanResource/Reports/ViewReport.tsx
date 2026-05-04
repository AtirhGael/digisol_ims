import React from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  Calendar,
  User,
  FileText,
  Clock,
  HardDrive,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HRReport } from "./data";

const statusStyles: Record<string, string> = {
  Generated: "bg-green-50 text-green-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-red-50 text-red-600",
};

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
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-b-0">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

interface ViewReportProps {
  report: HRReport;
  onBack: () => void;
}

export const ViewReport: React.FC<ViewReportProps> = ({ report, onBack }) => {
  const formattedDate = new Date(report.generatedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Reports
      </button>

      {/* Header Card */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{report.title}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{report.id} · {report.period}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyles[report.status] ?? "bg-gray-100 text-gray-600"}`}
            >
              {report.status}
            </span>
            {report.status === "Generated" && (
              <>
                <Button variant="outline" className="gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Period</p>
              <p className="text-sm font-semibold text-gray-900">{report.period}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Downloads</p>
              <p className="text-sm font-semibold text-gray-900">{report.downloads}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">File Size</p>
              <p className="text-sm font-semibold text-gray-900">{report.fileSize}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Report Details</h2>
            </div>
            <InfoRow
              icon={<FileText size={16} />}
              label="Report Title"
              value={report.title}
            />
            <InfoRow
              icon={<BarChart3 size={16} />}
              label="Category"
              value={report.category}
            />
            <InfoRow
              icon={<Calendar size={16} />}
              label="Reporting Period"
              value={report.period}
            />
            <InfoRow
              icon={<User size={16} />}
              label="Generated By"
              value={report.generatedBy}
            />
            <InfoRow
              icon={<Clock size={16} />}
              label="Date Generated"
              value={formattedDate}
            />
            <InfoRow
              icon={<HardDrive size={16} />}
              label="File Size"
              value={report.fileSize}
            />
          </SectionCard>

          {/* Preview Placeholder */}
          {report.status === "Generated" && (
            <SectionCard>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h2 className="text-base font-semibold text-gray-800">Report Preview</h2>
              </div>
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <FileText className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">Report preview will appear here</p>
                <p className="text-xs text-gray-400 mt-1">
                  Download the full report for detailed analysis
                </p>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-6">
          {/* Status Card */}
          <SectionCard>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Status
            </h3>
            <div className="flex flex-col items-center py-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                  report.status === "Generated"
                    ? "bg-green-100"
                    : report.status === "Pending"
                      ? "bg-amber-100"
                      : "bg-red-100"
                }`}
              >
                <FileText
                  className={`w-7 h-7 ${
                    report.status === "Generated"
                      ? "text-green-600"
                      : report.status === "Pending"
                        ? "text-amber-600"
                        : "text-red-500"
                  }`}
                />
              </div>
              <p className="text-sm font-semibold text-gray-900">{report.status}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formattedDate}</p>
            </div>
          </SectionCard>

          {/* Quick Info */}
          <SectionCard>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Quick Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Category</span>
                <span className="font-medium text-gray-800">{report.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Generated By</span>
                <span className="font-medium text-gray-800">{report.generatedBy}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Downloads</span>
                <span className="font-medium text-gray-800">{report.downloads}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">File Size</span>
                <span className="font-medium text-gray-800">{report.fileSize}</span>
              </div>
            </div>
          </SectionCard>

          {/* Note */}
          {report.status === "Pending" && (
            <SectionCard>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Pending:</strong> This report is still being generated. You will be notified once it is ready for download.
                </p>
              </div>
            </SectionCard>
          )}
          {report.status === "Failed" && (
            <SectionCard>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Failed:</strong> This report could not be generated. Please try regenerating it or contact support.
                </p>
              </div>
              <Button variant="outline" className="w-full mt-4 gap-2">
                Regenerate Report
              </Button>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};
