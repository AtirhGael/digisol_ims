export interface DepartmentHead {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

export interface ParentDepartment {
  department_id: string;
  department_name: string;
  department_code: string;
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Department {
  department_id: string;
  name: string;
  code: string;
  description: string | null;
  department_head_id: string | null;
  department_head: DepartmentHead | null;
  team_lead_id?: string | null;
  team_lead?: DepartmentHead | null;
  parent_department_id: string | null;
  parent_department: ParentDepartment | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  budget_allocation: number | null;
  status: string;
  staff_count: number;
  sub_departments_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  department_head_id?: string;
  parent_department_id?: string;
  contact_email?: string;
  contact_phone?: string;
  location?: string;
  budget_allocation?: number;
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  departmentId: string;
}

export interface DepartmentFormData {
  name: string;
  code: string;
  description: string;
  department_head_id: string;
  parent_department_id: string;
  contact_email: string;
  contact_phone: string;
  budget: string;
  location: string;
  status: string;
}
