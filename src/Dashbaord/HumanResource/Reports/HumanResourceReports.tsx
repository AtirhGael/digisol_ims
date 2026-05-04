import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "../../../components/other/Card";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import { createReportColumns } from "./ReportColumns";
import { ViewReport } from "./ViewReport";
import { GenerateReport } from "./GenerateReport";
import { hrReports } from "./data";
import type { HRReport, ReportCategory } from "./data";

const categoryOptions: { key: string; value: string; label: string }[] = [
  { key: "all", value: "", label: "All Categories" },
  { key: "attendance", value: "Attendance", label: "Attendance" },
  { key: "payroll", value: "Payroll", label: "Payroll" },
  { key: "leave", value: "Leave", label: "Leave" },
  { key: "performance", value: "Performance", label: "Performance" },
  { key: "headcount", value: "Headcount", label: "Headcount" },
  { key: "onboarding", value: "Onboarding", label: "Onboarding" },
];

type PageView = "list" | "view" | "generate";

export const HumanResourceReports: React.FC = () => {
  const [view, setView] = useState<PageView>("list");
  const [selectedReport, setSelectedReport] = useState<HRReport | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totalReports = hrReports.length;
  const generatedCount = hrReports.filter((r) => r.status === "Generated").length;
  const pendingCount = hrReports.filter((r) => r.status === "Pending").length;
  const totalDownloads = hrReports.reduce((sum, r) => sum + r.downloads, 0);

  const handleView = (report: HRReport) => {
    setSelectedReport(report);
    setView("view");
    setOpenMenuId(null);
  };

  const handleDownload = (report: HRReport) => {
    setOpenMenuId(null);
    // Future: trigger real download
  };

  const handleDelete = (report: HRReport) => {
    setOpenMenuId(null);
    // Future: confirm & delete
  };

  const handleGenerate = () => {
    setView("generate");
  };

  const handleBack = () => {
    setView("list");
    setSelectedReport(null);
  };

  // Generate Report form
  if (view === "generate") {
    return <GenerateReport onBack={handleBack} />;
  }

  // View Report detail
  if (view === "view" && selectedReport) {
    return <ViewReport report={selectedReport} onBack={handleBack} />;
  }

  const columns = createReportColumns({
    openMenuId,
    onToggleMenu: setOpenMenuId,
    onView: handleView,
    onDownload: handleDownload,
    onDelete: handleDelete,
  });

  return (
    <div className="min-h-screen">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">HR Reports</h1>
            <p className="text-sm text-gray-500">
              Generate, view, and manage human resource reports
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export All
            </Button>
            <Button className="gap-2" onClick={handleGenerate}>
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card
            heading="Total Reports"
            amount={String(totalReports)}
            icons={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
            currency={`${generatedCount} generated`}
          />
          <Card
            heading="Generated"
            amount={String(generatedCount)}
            icons={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />}
            currency="Ready to download"
          />
          <Card
            heading="Pending"
            amount={String(pendingCount)}
            icons={<Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />}
            currency="In progress"
          />
          <Card
            heading="Total Downloads"
            amount={String(totalDownloads)}
            icons={<Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />}
            currency="Across all reports"
          />
        </div>

        {/* Reports Table */}
        <ReusableTable
          heading="All Reports"
          columns={columns}
          data={hrReports}
          filterKey="category"
          filterOptions={categoryOptions}
          searchKeys={["title", "id", "generatedBy", "period", "category"]}
        />
      </div>
    </div>
  );
};

