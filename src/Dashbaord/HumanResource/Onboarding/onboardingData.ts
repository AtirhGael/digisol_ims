export type OnboardingType = "employee" | "intern";
export type OnboardingWorkflow = "Hybrid" | "Onsite" | "Remote";
export type OnboardingFilter = "all" | OnboardingType;
export type OnboardingView = "list" | "view" | "form";

export interface OnboardingRecord {
  id: string;
  name: string;
  role: string;
  departmentId?: string;
  departmentName?: string;
  employeeCode?: string;
  email?: string;
  phone?: string;
  userStatus?: string;
  employmentStatus?: string;
  nationalId?: string;
  nationalIdType?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE";
  maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  addressStreet?: string;
  addressCity?: string;
  addressRegion?: string;
  addressCountry?: string;
  addressPostalCode?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  workflow: OnboardingWorkflow;
  startDate: string;
  progress: number;
  avatar: string;
  avatarUrl?: string;
  onboardingType: OnboardingType;
  school?: string;
  speciality?: string;
  level?: string;
}

export interface DeviceEntry {
  name: string;
  serialNumber: string;
}

export interface OnboardingFormValues {
  onboardingType: OnboardingType;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  nationalIdType: "PASSPORT" | "NATIONAL_ID" | "DRIVER_LICENSE";
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  position: string;
  departmentId: string;
  workflow: OnboardingWorkflow;
  startDate: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  school: string;
  speciality: string;
  level: string;
  profilePictureUrl?: string;
  devices: DeviceEntry[];
}
