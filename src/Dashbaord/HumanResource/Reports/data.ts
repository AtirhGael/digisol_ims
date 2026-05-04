export type ReportStatus = "Generated" | "Pending" | "Failed";
export type ReportCategory =
  | "Attendance"
  | "Payroll"
  | "Leave"
  | "Performance"
  | "Headcount"
  | "Onboarding";

export interface HRReport {
  id: string;
  title: string;
  category: ReportCategory;
  status: ReportStatus;
  generatedBy: string;
  generatedDate: string;
  period: string;
  fileSize: string;
  downloads: number;
}

export const hrReports: HRReport[] = [
  {
    id: "RPT-001",
    title: "Monthly Attendance Summary",
    category: "Attendance",
    status: "Generated",
    generatedBy: "Mrs. Egbe",
    generatedDate: "2026-04-01",
    period: "March 2026",
    fileSize: "1.2 MB",
    downloads: 12,
  },
  {
    id: "RPT-002",
    title: "Q1 Payroll Report",
    category: "Payroll",
    status: "Generated",
    generatedBy: "Mr. Fongang",
    generatedDate: "2026-04-03",
    period: "Q1 2026",
    fileSize: "3.5 MB",
    downloads: 8,
  },
  {
    id: "RPT-003",
    title: "Leave Balance Report",
    category: "Leave",
    status: "Pending",
    generatedBy: "Mrs. Egbe",
    generatedDate: "2026-04-05",
    period: "April 2026",
    fileSize: "—",
    downloads: 0,
  },
  {
    id: "RPT-004",
    title: "Performance Evaluation Summary",
    category: "Performance",
    status: "Generated",
    generatedBy: "Mr. Ateh",
    generatedDate: "2026-03-28",
    period: "Q1 2026",
    fileSize: "2.1 MB",
    downloads: 15,
  },
  {
    id: "RPT-005",
    title: "Employee Headcount Report",
    category: "Headcount",
    status: "Generated",
    generatedBy: "Mr. Fongang",
    generatedDate: "2026-04-02",
    period: "April 2026",
    fileSize: "0.8 MB",
    downloads: 5,
  },
  {
    id: "RPT-006",
    title: "Onboarding Progress Report",
    category: "Onboarding",
    status: "Failed",
    generatedBy: "Mrs. Egbe",
    generatedDate: "2026-04-04",
    period: "March 2026",
    fileSize: "—",
    downloads: 0,
  },
  {
    id: "RPT-007",
    title: "Annual Leave Utilization",
    category: "Leave",
    status: "Generated",
    generatedBy: "Mr. Ateh",
    generatedDate: "2026-03-15",
    period: "2025",
    fileSize: "1.7 MB",
    downloads: 22,
  },
  {
    id: "RPT-008",
    title: "Monthly Payroll Breakdown",
    category: "Payroll",
    status: "Generated",
    generatedBy: "Mr. Fongang",
    generatedDate: "2026-03-30",
    period: "March 2026",
    fileSize: "2.8 MB",
    downloads: 10,
  },
];
