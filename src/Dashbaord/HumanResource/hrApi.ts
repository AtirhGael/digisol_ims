import axios from "axios";
import { useUserStore } from "../../Store/UserStore";

const baseURL = (import.meta as any).env.VITE_BASE_URL;

const hrApiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

hrApiClient.interceptors.request.use(
  (config) => {
    const accessToken =
      useUserStore.getState().accessToken ||
      (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export type HrEmployee = {
  employee_id: string;
  employee_code: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  position: string;
  start_date?: string | null;
  department?: {
    department_id: string;
    department_name: string;
  } | null;
  employment_type: string;
  employment_status: string;
  user_status: string;
  last_login?: string | null;
};

export type HrDepartment = {
  department_id: string;
  department_name: string;
  department_code?: string;
};

export type HrAttendanceRecord = {
  attendance_id: string;
  employee_id: string;
  employee_name: string;
  attendance_date: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  working_hours?: number | null;
  status: string;
  attendance_type: string;
  reason?: string | null;
  department?: {
    department_id?: string;
    department_name?: string;
  } | null;
};

export type HrLeaveRequest = {
  request_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string;
  role: string;
  employment_status: string;
  hire_date: string;
  leave_type: string;
  leave_type_code: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  reason?: string | null;
  status: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
};

export type HrEmployeeDetail = {
  employee_id: string;
  employee_code: string;
  user_id: string;
  national_id: string;
  national_id_type?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  address: {
    street?: string | null;
    city?: string | null;
    region?: string | null;
    country?: string | null;
    postal_code?: string | null;
  };
  emergency_contact: {
    name?: string | null;
    relationship?: string | null;
    phone?: string | null;
  };
  employment_info: {
    position?: string | null;
    department?: {
      department_id: string;
      department_name: string;
    } | null;
    employment_type?: string | null;
    start_date?: string | null;
    employment_status?: string | null;
    manager_id?: string | null;
  };
  skills?: string[];
  certifications?: string[];
  created_at?: string | null;
  user_info?: {
    user_id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string | null;
    avatar_url?: string | null;
    status?: string;
    department?: {
      department_id: string;
      department_name: string;
    } | null;
    departments_users_department_idTodepartments?: {
      department_id: string;
      department_name: string;
    } | null;
  } | null;
};

export type HrLeaveType = {
  leave_type_id: string;
  leave_type_name: string;
  leave_type_code: string;
  description?: string | null;
  default_days_per_year?: number | null;
  requires_approval?: boolean | null;
  requires_documentation?: boolean | null;
  is_paid?: boolean | null;
};

export type HrTask = {
  task_id: string;
  title: string;
  // listTasks returns string[] (user IDs); getTaskById returns {user_id,name,email}[]
  assigned_to: string[] | { user_id: string; name: string; email: string }[];
  status: string;
  priority: string;
  deadline?: string | null;
  created_at?: string | null;
  department_id?: string | null;
  description?: string | null;
  notes?: string | null;
};

export type HrQuery = {
  query_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type HrQuerySummary = {
  open_queries: number;
  in_progress: number;
  resolved_this_month: number;
  total_resolved: number;
  avg_resolution_days: number;
};

export type HrReport = {
  report_id: string;
  report_name: string;
  report_code: string;
  report_type: string;
  category: string;
  description?: string | null;
  data_source: string;
  generated_by: string;
  generated_date?: string | null;
  status: string;
  period?: string | null;
  file_size: string;
  downloads: number;
  output_file_url?: string | null;
};

export type HrEvaluationPeriod = {
  period_id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  evaluations_count: number;
  created_at?: string | null;
};

export type HrEmployeeEvaluation = {
  evaluation_id: string;
  employee_id?: string;
  employee_name?: string;
  employee_email?: string;
  employee_code?: string;
  position?: string;
  department?: {
    department_id?: string;
    department_name?: string;
  } | null;
  period_id?: string;
  period: string;
  period_dates: {
    start: string;
    end: string;
  };
  evaluator: string;
  ratings: {
    task_completion_rate?: number | null;
    conduct_behavior_score?: number | null;
    productivity_score?: number | null;
    punctuality_score?: number | null;
    quality_of_work_score?: number | null;
  };
  overall_score?: number | null;
  comments?: string | null;
  strengths?: string | null;
  areas_for_improvement?: string | null;
  goals_for_next_period?: string | null;
  status: string;
  employee_acknowledged?: boolean | null;
  employee_acknowledged_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type HrRecruitmentPipelineStage = {
  key: string;
  stage: string;
  value: number;
  description: string;
};

export type HrRecruitmentPipelineSummary = {
  stages: HrRecruitmentPipelineStage[];
  summary_cards: {
    total_label: string;
    total_value: number;
    total_description: string;
    primary_rate_label: string;
    primary_rate_value: string;
    primary_rate_description: string;
    secondary_rate_label: string;
    secondary_rate_value: string;
    secondary_rate_description: string;
    next_review_label: string;
    next_review_value: string;
    next_review_description: string;
  };
};

export type HrUploadedPicture = {
  picture_id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

type PaginatedResponse<T> = {
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

const get = async <T>(url: string, params?: Record<string, string | number | boolean | undefined>) => {
  const response = await hrApiClient.get<T>(url, { params });
  return response.data;
};

export const fetchEmployees = async (params?: {
  department_id?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) => get<PaginatedResponse<HrEmployee>>("/employees", params);

export const fetchPositions = async () =>
  get<{ success: boolean; message: string; data: string[] }>("/employees/positions");

export const fetchHrDepartments = async () =>
  get<{ success: boolean; message: string; data: HrDepartment[] }>("/users/departments");

export const fetchAttendanceRecords = async (params?: {
  employee_id?: string;
  department_id?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  page?: number;
  page_size?: number;
}) => get<PaginatedResponse<HrAttendanceRecord>>("/attendance", params);

export type AttendanceSettings = {
  alert_department_head: boolean;
  alert_hr_late_arrivals: boolean;
  alert_employee_absences: boolean;
};

export const fetchAttendanceSettings = async () =>
  get<{ success: boolean; message: string; data: AttendanceSettings }>("/attendance/settings");

export const saveAttendanceSettings = async (payload: AttendanceSettings) => {
  const response = await hrApiClient.put("/attendance/settings", payload);
  return response.data;
};

export const createAttendanceRecord = async (payload: {
  employee_id: string;
  action: "CHECK_IN" | "CHECK_OUT" | "MANUAL_ENTRY";
  status: "PRESENT" | "ABSENT" | "LATE";
  timestamp?: string;
  reason?: string;
  check_out_timestamp?: string;
}) => {
  const response = await hrApiClient.post("/attendance", payload);
  return response.data;
};

export const updateAttendanceRecord = async (
  attendanceId: string,
  payload: {
    status?: "PRESENT" | "ABSENT" | "LATE";
    check_in_time?: string;
    check_out_time?: string;
    working_hours?: number;
    reason?: string;
    attendance_type?: "MANUAL" | "AUTOMATIC";
  }
) => {
  const response = await hrApiClient.patch(`/attendance/${attendanceId}`, payload);
  return response.data;
};

export const fetchLeaveRequests = async (params?: {
  status?: string;
  employee_id?: string;
  page?: number;
  page_size?: number;
}) => get<PaginatedResponse<HrLeaveRequest>>("/leaves/requests", params);

export const fetchLeaveTypes = async () =>
  get<{ success: boolean; message: string; data: HrLeaveType[] }>("/leaves/types");

export const updateLeaveType = async (
  leaveTypeId: string,
  payload: Partial<
    Pick<
      HrLeaveType,
      | "leave_type_name"
      | "description"
      | "default_days_per_year"
      | "requires_approval"
      | "requires_documentation"
      | "is_paid"
    >
  >
) => {
  const response = await hrApiClient.patch<{
    success: boolean;
    message: string;
    data: HrLeaveType;
  }>(`/leaves/types/${leaveTypeId}`, payload);
  return response.data;
};

export const createLeaveRequest = async (payload: {
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  attachments?: string[];
}) => {
  const response = await hrApiClient.post("/leaves/request", payload);
  return response.data;
};

export const getCurrentHrEmployeeId = async (): Promise<string | null> => {
  const profileResponse = await hrApiClient.get("/auth/profile");
  const profile = profileResponse.data?.data;
  const email = profile?.email as string | undefined;
  const userId = profile?.user_id as string | undefined;

  if (!email && !userId) {
    return null;
  }

  const employeeResponse = await hrApiClient.get("/employees", {
    params: {
      search: email || undefined,
      page: 1,
      page_size: 20,
    },
  });

  const employees = employeeResponse.data?.data ?? [];
  const match = employees.find((employee: HrEmployee) => employee.user_id === userId) || employees[0];
  return match?.employee_id ?? null;
};

export const approveLeaveRequest = async (
  requestId: string,
  payload: { status: "APPROVED" | "REJECTED"; comments?: string }
) => {
  const response = await hrApiClient.patch(`/leaves/request/${requestId}`, payload);
  return response.data;
};

export const fetchTasks = async (params?: {
  department_id?: string;
  project_id?: string;
  assigned_to?: string;
  status?: string;
  priority?: string;
  deadline_from?: string;
  deadline_to?: string;
  page?: number;
  page_size?: number;
}) => get<{ data: HrTask[]; pagination: PaginatedResponse<HrTask>["pagination"] }>("/tasks", params);

export const createTask = async (payload: {
  title: string;
  description?: string;
  assigned_to?: string[];
  department_id: string;
  deadline?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  tags?: string[];
}) => {
  const response = await hrApiClient.post("/tasks/task", payload);
  return response.data;
};

export const updateTask = async (
  taskId: string,
  payload: {
    title?: string;
    description?: string;
    status?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    assigned_to?: string[];
    deadline?: string;
    department_id?: string;
  }
) => {
  const response = await hrApiClient.patch(`/tasks/${taskId}`, payload);
  return response.data;
};

export const deleteTask = async (taskId: string) => {
  const response = await hrApiClient.delete(`/tasks/${taskId}`);
  return response.data;
};

export const addTaskComment = async (taskId: string, text: string) => {
  const response = await hrApiClient.post(`/tasks/${taskId}/comments`, { text });
  return response.data;
};

export const fetchQueries = async (params?: {
  status?: string;
  employee_id?: string;
  category?: string;
  page?: number;
  page_size?: number;
}) => get<PaginatedResponse<HrQuery>>("/queries", params);

export const createQuery = async (payload: {
  employee_id: string;
  category: string;
  title: string;
  description: string;
  priority?: string;
  assigned_to?: string;
}) => {
  const response = await hrApiClient.post("/queries", payload);
  return response.data;
};

export const updateQuery = async (
  queryId: string,
  payload: { status: string; resolution_notes?: string; assigned_to?: string }
) => {
  const response = await hrApiClient.patch(`/queries/${queryId}`, payload);
  return response.data;
};

export const deleteQuery = async (queryId: string) => {
  const response = await hrApiClient.delete(`/queries/${queryId}`);
  return response.data;
};

export const fetchReports = async (params?: {
  category?: string;
  page?: number;
  page_size?: number;
}) => get<PaginatedResponse<HrReport>>("/reports", params);

export const fetchEvaluationPeriods = async (params?: {
  is_active?: boolean;
  year?: number;
}) => get<{ success: boolean; message: string; data: HrEvaluationPeriod[] }>("/evaluation-periods", params);

export const fetchActiveEvaluationPeriod = async () =>
  get<{ success: boolean; message: string; data: HrEvaluationPeriod }>("/evaluation-periods/active");

export const fetchEmployeeEvaluations = async (
  employeeId: string,
  params?: {
    period?: string;
    page?: number;
    page_size?: number;
  }
) =>
  get<{
    success: boolean;
    message: string;
    data: {
      employee_id: string;
      employee_name: string;
      evaluations: HrEmployeeEvaluation[];
    };
    pagination?: PaginatedResponse<HrEmployeeEvaluation>["pagination"];
  }>(`/evaluations/${employeeId}`, params);

export const fetchEvaluations = async (params?: {
  employee_id?: string;
  period?: string;
  period_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
}) => get<PaginatedResponse<HrEmployeeEvaluation>>("/evaluations", params);

export const createEvaluationPeriod = async (payload: {
  period_name: string;
  start_date: string;
  end_date: string;
}) => {
  const response = await hrApiClient.post("/evaluation-periods", payload);
  return response.data;
};

export const activateEvaluationPeriod = async (periodId: string) => {
  const response = await hrApiClient.post(`/evaluation-periods/${periodId}/activate`);
  return response.data;
};

export const deactivateEvaluationPeriod = async (periodId: string) => {
  const response = await hrApiClient.post(`/evaluation-periods/${periodId}/deactivate`);
  return response.data;
};

export const deleteEvaluationPeriod = async (periodId: string) => {
  const response = await hrApiClient.delete(`/evaluation-periods/${periodId}`);
  return response.data;
};

export const updateEvaluationStatus = async (
  evaluationId: string,
  status: "DRAFT" | "SUBMITTED" | "COMPLETED"
) => {
  const response = await hrApiClient.patch(`/evaluations/${evaluationId}/status`, { status });
  return response.data;
};

export const acknowledgeEvaluation = async (evaluationId: string) => {
  const response = await hrApiClient.post(`/evaluations/${evaluationId}/acknowledge`);
  return response.data;
};

export const updateEvaluation = async (
  evaluationId: string,
  payload: {
    task_completion_rate?: number;
    conduct_behavior_score?: number;
    productivity_score?: number;
    punctuality_score?: number;
    quality_of_work_score?: number;
    overall_score?: number;
    comments?: string;
    strengths?: string;
    areas_for_improvement?: string;
    goals_for_next_period?: string;
    status?: string;
  }
) => {
  const response = await hrApiClient.put(`/evaluations/${evaluationId}`, payload);
  return response.data;
};

export type HrLeaveBalance = {
  leave_type: string;
  leave_type_code: string;
  is_paid: boolean | null;
  allocated_days: number;
  used_days: number;
  available_days: number;
  carried_over_days: number;
};

export const fetchLeaveBalance = async (employeeId: string) =>
  get<{
    success: boolean;
    message: string;
    data: {
      employee_id: string;
      employee_name: string;
      year: number;
      balances: HrLeaveBalance[];
    };
  }>(`/leaves/balance/${employeeId}`);

export const createPerformanceEvaluation = async (payload: {
  employee_id: string;
  period_id?: string;
  evaluation_period?: string;
  task_completion_rate?: number;
  quality_of_work_score?: number;
  punctuality_score?: number;
  conduct_behavior_score?: number;
  productivity_score?: number;
  overall_score?: number;
  comments?: string;
  strengths?: string;
  areas_for_improvement?: string;
  goals_for_next_period?: string;
  status?: "DRAFT" | "SUBMITTED" | "COMPLETED";
}) => {
  const response = await hrApiClient.post("/evaluations", {
    employee_id: payload.employee_id,
    period_id: payload.period_id,
    evaluation_period: payload.evaluation_period,
    ratings: {
      task_completion_rate: payload.task_completion_rate,
      quality_of_work: payload.quality_of_work_score,
      punctuality_and_attendance: payload.punctuality_score,
      conduct_and_behavior: payload.conduct_behavior_score,
      productivity_metrics: payload.productivity_score,
    },
    overall_score: payload.overall_score,
    comments: payload.comments,
    strengths: payload.strengths,
    areas_for_improvement: payload.areas_for_improvement,
    goals_for_next_period: payload.goals_for_next_period,
    status: payload.status,
  });
  return response.data;
};

export const uploadEmployeePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await hrApiClient.post<{
    success: boolean;
    message: string;
    data: HrUploadedPicture;
  }>("/pictures", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const fetchEmployeeById = async (employeeId: string) =>
  get<{
    success: boolean;
    message: string;
    data: HrEmployeeDetail;
  }>(`/employees/${employeeId}`);

export const fetchRecruitmentPipelineSummary = async () =>
  get<{
    success: boolean;
    message: string;
    data: HrRecruitmentPipelineSummary;
  }>('/employees/recruitment/pipeline-summary');

export const createEmployeeRecord = async (payload: {
  user?: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    avatar_url?: string;
    status?: "ACTIVE" | "INACTIVE" | "PENDING_ACTIVATION";
    roles?: string[];
  };
  user_id?: string;
  national_id: string;
  national_id_type?: "PASSPORT" | "NATIONAL_ID" | "DRIVER_LICENSE";
  date_of_birth: string;
  gender: "MALE" | "FEMALE";
  marital_status?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  address: {
    street?: string;
    city: string;
    region?: string;
    country?: string;
    postal_code?: string;
  };
  emergency_contact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  employment_info: {
    position: string;
    department_id: string;
    employment_type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
    start_date: string;
    manager_id?: string | null;
  };
  skills?: string[];
  certifications?: string[];
}) => {
  const response = await hrApiClient.post<{
    success: boolean;
    message: string;
    data: HrEmployeeDetail;
    meta?: {
      credentials_sent_to?: string;
    };
  }>("/employees", payload);

  return response.data;
};

export const updateEmployeeById = async (
  employeeId: string,
  payload: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string | null;
    avatar_url?: string | null;
      status?: "ACTIVE" | "INACTIVE" | "PENDING_ACTIVATION";
      national_id?: string;
      national_id_type?: string;
      date_of_birth?: string;
      gender?: string;
      marital_status?: string;
    address?: {
      street?: string;
      city?: string;
      region?: string;
      country?: string;
      postal_code?: string;
    };
    emergency_contact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
    employment_info?: {
      position?: string;
      department_id?: string;
      employment_type?: string;
      start_date?: string;
      employment_status?: string;
      manager_id?: string | null;
    };
    skills?: string[];
    certifications?: string[];
  }
) => {
  const response = await hrApiClient.patch<{
    success: boolean;
    message: string;
    data: HrEmployeeDetail;
  }>(`/employees/${employeeId}`, payload);

  return response.data;
};
