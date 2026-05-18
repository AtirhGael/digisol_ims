import type { HrEmployee, HrEmployeeDetail } from "../hrApi";
import type {
  OnboardingFormValues,
  OnboardingRecord,
  OnboardingType,
  OnboardingWorkflow,
} from "./onboardingData";

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

export const WORKFLOW_FILTER_OPTIONS = [
  { key: "hybrid", value: "Hybrid", label: "Hybrid" },
  { key: "onsite", value: "Onsite", label: "Onsite" },
  { key: "remote", value: "Remote", label: "Remote" },
];

export const ONBOARDING_QUERY_KEYS = [
  "hr-onboarding-employees",
  "employees",
  "hr-attendance-employees",
  "hr-performance-employees",
];

export const ONBOARDING_EMPLOYEES_ENDPOINT = "/employees?page_size=200";

export const ONBOARDING_HEADINGS = {
  all: "All Onboarding Records",
  employee: "Employee Onboarding Records",
  intern: "Intern Onboarding Records",
};

export const PROGRESS_COLORS = ["bg-emerald-500", "bg-blue-500", "bg-amber-400"];

export const getProgressColorIndex = (id: string) =>
  id.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0) % PROGRESS_COLORS.length;

export const employmentTypeToWorkflow = (employmentType?: string | null): OnboardingWorkflow => {
  if (employmentType === "INTERNSHIP") return "Hybrid";
  if (employmentType === "CONTRACT") return "Remote";
  if (employmentType === "PART_TIME") return "Hybrid";
  return "Onsite";
};

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";

export const workflowToEmploymentType = (workflow: OnboardingWorkflow): EmploymentType => {
  if (workflow === "Remote") return "CONTRACT";
  if (workflow === "Hybrid") return "PART_TIME";
  return "FULL_TIME";
};

export const employmentTypeToOnboardingType = (
  employmentType?: string | null,
  position?: string | null
): OnboardingType => {
  const normalizedPosition = position?.toLowerCase() ?? "";
  const hasInternPosition =
    normalizedPosition.includes("intern") ||
    normalizedPosition.includes("trainee") ||
    normalizedPosition.includes("student");

  return employmentType === "INTERNSHIP" || hasInternPosition ? "intern" : "employee";
};

export const calculateProgress = (startDate?: string | null, employmentStatus?: string | null) => {
  if (employmentStatus === "TERMINATED" || employmentStatus === "RESIGNED") return 100;
  if (!startDate) return 10;

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return 10;

  const daysSinceStart = Math.max(
    0,
    Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
  return Math.min(100, Math.max(10, daysSinceStart * 5));
};

const isoDate = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

const avatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E5E7EB&color=374151`;

const displayAvatarUrl = (name: string, uploadedUrl?: string | null) =>
  uploadedUrl || avatarUrl(name);

const normalizeGender = (value?: string | null): "MALE" | "FEMALE" | undefined => {
  const normalized = value?.trim().toUpperCase();
  if (normalized === "MALE" || normalized === "FEMALE") return normalized;
  return undefined;
};

const normalizeMaritalStatus = (
  value?: string | null
): "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | undefined => {
  const normalized = value?.trim().toUpperCase();
  if (
    normalized === "SINGLE" ||
    normalized === "MARRIED" ||
    normalized === "DIVORCED" ||
    normalized === "WIDOWED"
  ) {
    return normalized;
  }
  return undefined;
};

export const mapEmployeeToOnboardingRecord = (employee: HrEmployee): OnboardingRecord => {
  const name = `${employee.first_name} ${employee.last_name}`.trim();

  return {
    id: employee.employee_id,
    name,
    role: employee.position || employee.department?.department_name || "Unassigned",
    departmentId: employee.department?.department_id,
    departmentName: employee.department?.department_name || "Unassigned",
    employeeCode: employee.employee_code,
    email: employee.email,
    phone: employee.phone ?? "",
    workflow: employmentTypeToWorkflow(employee.employment_type),
    startDate: isoDate(employee.start_date),
    progress: calculateProgress(employee.start_date, employee.employment_status),
    avatar: displayAvatarUrl(name, employee.avatar_url),
    avatarUrl: employee.avatar_url ?? undefined,
    onboardingType: employmentTypeToOnboardingType(employee.employment_type, employee.position),
    userStatus: employee.user_status,
    employmentStatus: employee.employment_status,
  };
};

export const mapEmployeeDetailToOnboardingRecord = (employee: HrEmployeeDetail): OnboardingRecord => {
  const firstName = employee.user_info?.first_name ?? "";
  const lastName = employee.user_info?.last_name ?? "";
  const name = `${firstName} ${lastName}`.trim();
  const department =
    employee.user_info?.department ??
    employee.user_info?.departments_users_department_idTodepartments ??
    employee.employment_info.department;
  const skills = employee.skills ?? [];
  const certifications = employee.certifications ?? [];

  return {
    id: employee.employee_id,
    name,
    role: employee.employment_info.position || "Unassigned",
    departmentId: department?.department_id,
    departmentName: department?.department_name || "Unassigned",
    employeeCode: employee.employee_code,
    email: employee.user_info?.email ?? "",
    phone: employee.user_info?.phone ?? "",
    userStatus: employee.user_info?.status ?? "",
    employmentStatus: employee.employment_info.employment_status ?? "",
    nationalId: employee.national_id,
    nationalIdType: employee.national_id_type ?? undefined,
    dateOfBirth: employee.date_of_birth ?? undefined,
    gender: normalizeGender(employee.gender),
    maritalStatus: normalizeMaritalStatus(employee.marital_status),
    addressStreet: employee.address.street ?? "",
    addressCity: employee.address.city ?? "",
    addressRegion: employee.address.region ?? "",
    addressCountry: employee.address.country ?? "",
    addressPostalCode: employee.address.postal_code ?? "",
    emergencyContactName: employee.emergency_contact.name ?? "",
    emergencyContactRelationship: employee.emergency_contact.relationship ?? "",
    emergencyContactPhone: employee.emergency_contact.phone ?? "",
    workflow: employmentTypeToWorkflow(employee.employment_info.employment_type),
    startDate: isoDate(employee.employment_info.start_date),
    progress: calculateProgress(
      employee.employment_info.start_date,
      employee.employment_info.employment_status
    ),
    avatar: displayAvatarUrl(name, employee.user_info?.avatar_url),
    avatarUrl: employee.user_info?.avatar_url ?? undefined,
    onboardingType: employmentTypeToOnboardingType(
      employee.employment_info.employment_type,
      employee.employment_info.position
    ),
    school: certifications[0] ?? "",
    speciality: skills[0] ?? "",
    level: skills[1] ?? "",
  };
};

export const createOnboardingPayload = (values: OnboardingFormValues) => ({
  national_id: values.nationalId,
  national_id_type: values.nationalIdType,
  date_of_birth: values.dateOfBirth,
  gender: normalizeGender(values.gender) ?? "MALE",
  marital_status: normalizeMaritalStatus(values.maritalStatus) ?? "SINGLE",
  address: {
    street: values.address || undefined,
    city: values.city,
    region: values.region || undefined,
    country: values.country || undefined,
    postal_code: values.postalCode || undefined,
  },
  emergency_contact: {
    name: values.emergencyContactName || undefined,
    relationship: values.emergencyContactRelationship || undefined,
    phone: values.emergencyContactPhone || undefined,
  },
  employment_info: {
    position: values.position,
    department_id: values.departmentId,
    employment_type:
      values.onboardingType === "intern" ? "INTERNSHIP" : workflowToEmploymentType(values.workflow),
    start_date: values.startDate,
  },
  skills: values.onboardingType === "intern" ? [values.speciality, values.level].filter(Boolean) : undefined,
  certifications: values.onboardingType === "intern" ? [values.school].filter(Boolean) : undefined,
});
