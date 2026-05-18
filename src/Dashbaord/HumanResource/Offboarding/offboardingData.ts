export type OffboardingType = "employee" | "intern";
export type OffboardingFilter = "all" | OffboardingType;
export type OffboardingView = "list" | "view" | "process";
export type OffboardReason =
  | "RESIGNED"
  | "TERMINATED"
  | "INTERNSHIP_COMPLETED"
  | "LEFT"
  | "SUSPENDED"
  | "OTHER";

export interface OffboardingRecord {
  id: string;
  name: string;
  role: string;
  departmentId?: string;
  departmentName?: string;
  employeeCode?: string;
  email?: string;
  phone?: string;
  status: string;
  startDate: string;
  avatar: string;
  offboardingType: OffboardingType;
}
