import type { HrEmployee } from "../hrApi";
import type { OffboardingRecord, OffboardingType } from "./offboardingData";

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
};

export const OFFBOARDING_QUERY_KEYS = [
  "hr-offboarding-employees",
  "employees",
];

export const OFFBOARDING_EMPLOYEES_ENDPOINT = "/employees?page_size=200&status=ACTIVE";

export const OFFBOARDING_HEADINGS = {
  all: "All Active Staff",
  employee: "Active Employees",
  intern: "Active Interns",
};

const avatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E5E7EB&color=374151`;

const displayAvatarUrl = (name: string, uploadedUrl?: string | null) =>
  uploadedUrl || avatarUrl(name);

const isoDate = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

export const offboardingTypeFromEmployee = (
  employmentType?: string | null,
  position?: string | null
): OffboardingType => {
  const pos = position?.toLowerCase() ?? "";
  const hasInternPosition =
    pos.includes("intern") || pos.includes("trainee") || pos.includes("student");
  return employmentType === "INTERNSHIP" || hasInternPosition ? "intern" : "employee";
};

export const mapEmployeeToOffboardingRecord = (employee: HrEmployee): OffboardingRecord => {
  const name = `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim();
  return {
    id: employee.employee_id,
    name: name || employee.employee_code,
    role: employee.position || employee.department?.department_name || "Unassigned",
    departmentId: employee.department?.department_id,
    departmentName: employee.department?.department_name || "Unassigned",
    employeeCode: employee.employee_code,
    email: employee.email,
    phone: employee.phone ?? "",
    status: employee.employment_status ?? "ACTIVE",
    startDate: isoDate(employee.start_date),
    avatar: displayAvatarUrl(name, employee.avatar_url),
    offboardingType: offboardingTypeFromEmployee(employee.employment_type, employee.position),
  };
};
