export type ReportStatus = "Generated" | "Pending" | "Failed";
export type ReportCategory =
  | "Attendance"
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
  outputFileUrl?: string | null;
}
