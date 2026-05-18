export type EmployeePageView = "list" | "form" | "success" | "detail" | "edit";

export type EmployeeRow = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  status: string;
  hireDate: string;
  email: string;
};

export type EditForm = {
  national_id: string;
  gender: string;
  marital_status: string;
  position: string;
  department_id: string;
  employment_type: string;
  employment_status: string;
  address_street: string;
  address_city: string;
  address_region: string;
  address_country: string;
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
};

export const EMPTY_EDIT_FORM: EditForm = {
  national_id: "",
  gender: "",
  marital_status: "",
  position: "",
  department_id: "",
  employment_type: "",
  employment_status: "",
  address_street: "",
  address_city: "",
  address_region: "",
  address_country: "",
  emergency_name: "",
  emergency_relationship: "",
  emergency_phone: "",
};
