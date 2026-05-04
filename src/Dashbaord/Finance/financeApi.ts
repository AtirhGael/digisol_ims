import axios from "axios";
import { useUserStore } from "../../Store/UserStore";
import { navigationService } from "../../utils/navigationService";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

// Shared API client for finance endpoints.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token if available.
apiClient.interceptors.request.use((config) => {
  // Prefer in-memory token; fall back to localStorage for page refreshes.
  const accessToken =
    useUserStore.getState().accessToken ||
    (typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Redirect to login on expired/invalid token.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      useUserStore.getState().clearUser();
      if (typeof window !== "undefined") {
        navigationService.navigateTo("/", true);
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        navigationService.navigateTo("/dashboard/unauthorized", true);
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export interface Transaction {
  transaction_id: string;
  transaction_number: string;
  transaction_date: string;
  transaction_type: "Income" | "Expense";
  category: string;
  amount: number;
  currency: string;
  ledger_type: string;
  description: string;
  reference_number?: string;
  payment_method?: string;
  status: string;
  current_balance?: number;
}

export interface Invoice {
  invoice_id: string;
  invoice_number: string;
  client_id: string;
  client_name?: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  outstanding_balance: number;
  currency: string;
  status: string;
}

export interface Expense {
  expense_id: string;
  title: string;
  employee_id: string;
  employee_name?: string;
  department_id: string;
  department_name?: string;
  amount: number;
  currency: string;
  description: string;
  justification?: string;
  status: string;
  created_at: string;
  approved_amount?: number;
}

export interface Budget {
  budget_id: string;
  department_id?: string;
  department_name?: string;
  department?: {
    department_id: string;
    department_name: string;
  };
  start_date: string;
  end_date: string;
  description?: string;
  notes?: string;
  additional_notes?: string;
  total_amount: number;
  currency: string;
  status: string;
  line_items?: BudgetLineItem[];
  created_at?: string;
  updated_at?: string;
}

export interface BudgetLineItem {
  line_item_id: string;
  budget_id: string;
  category: string;
  allocated_amount: number;
  description?: string;
}

export interface PayrollRecordApi {
  record_id: string;
  payroll_id: string;
  employee_id: string;
  employee_name: string;
  department_id: string;
  department_name: string;
  pay_date: string;
  payroll_period?: string;
  bonuses: number;
  total_deduction: number;
  status: "PENDING" | "PAID" | "PARTIALLY_PAID";
  allowance: number;
  gross_salary: number;
  net_salary: number;
  amount_in_words?: string;
  signature_approvals?: {
    financial_clerk: "YES" | "NO";
    manager: "YES" | "NO";
  };
  payment_method?: string;
  payment_reference_number?: string;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      total_balance: number;
      monthly_income: number;
      monthly_expense: number;
      pending_approvals: number;
      total_transactions: number;
    };
    cash_flow_data: Array<{
      month: string;
      income: number;
      expense: number;
    }>;
    expense_distribution: Array<{
      name: string;
      value: number;
    }>;
    budget_vs_actual: Array<{
      department: string;
      allocated: number;
      spent: number;
    }>;
    recent_transactions: Transaction[];
    pending_invoices: Invoice[];
  };
}

export interface TransactionListResponse {
  success: boolean;
  data: Transaction[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InvoiceListResponse {
  success: boolean;
  data: Invoice[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExpenseListResponse {
  success: boolean;
  data: Expense[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type PaginationResponse = {
  page?: number;
  page_size?: number;
  total_count?: number;
  total_pages?: number;
};

const buildMeta = (pagination?: PaginationResponse, fallbackTotal = 0) => ({
  page: pagination?.page ?? 1,
  limit: pagination?.page_size ?? fallbackTotal,
  total: pagination?.total_count ?? fallbackTotal,
  totalPages: pagination?.total_pages ?? 1,
});

export const getFinanceDashboard = async (): Promise<DashboardResponse> => {
  const response = await apiClient.get("/finance/dashboard");
  return response.data;
};

export const getTransactions = async (params?: {
  page?: number;
  limit?: number;
  transaction_type?: string;
  category?: string;
  status?: string;
}): Promise<TransactionListResponse> => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  const response = await apiClient.get("/finance/transactions", {
    params: {
      page,
      page_size: limit,
      transaction_type: params?.transaction_type,
      category: params?.category,
      status: params?.status,
    },
  });

  const data = response.data?.data ?? [];
  const pagination = response.data?.pagination;

  return {
    success: true,
    data,
    meta: buildMeta(pagination, data.length),
  };
};

export const createTransaction = async (data: {
  amount: number;
  transaction_type: "Income" | "Expense";
  category: string;
  transaction_date: string;
  description: string;
  ledger_type: string;
  currency?: string;
  reference_number?: string;
  department_id?: string;
  project_id?: string;
  payment_method?: string;
  supporting_doc_url?: string;
}): Promise<{ success: boolean; message: string; data: Transaction }> => {
  const response = await apiClient.post("/finance/transactions", data);
  return {
    success: true,
    message: "Transaction recorded successfully.",
    data: response.data,
  };
};

export const getTransactionById = async (
  transactionId: string,
): Promise<Transaction> => {
  const response = await apiClient.get(
    `/finance/transactions/${transactionId}`,
  );
  return response.data;
};

export const voidTransaction = async (
  transactionId: string,
  reason: string,
): Promise<{ success: boolean; message: string }> => {
  await apiClient.delete(`/finance/transactions/${transactionId}`, {
    data: { reason },
  });
  return { success: true, message: "Transaction voided successfully." };
};

export const getInvoices = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  client_id?: string;
}): Promise<InvoiceListResponse> => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  const response = await apiClient.get("/finance/invoices", {
    params: {
      page,
      page_size: limit,
      status: params?.status,
      client_id: params?.client_id,
    },
  });

  const data = response.data?.data ?? [];
  const pagination = response.data?.pagination;

  return {
    success: true,
    data,
    meta: buildMeta(pagination, data.length),
  };
};

export const createInvoice = async (data: {
  client_id: string;
  invoice_date: string;
  due_date: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
  tax_rate?: number;
  tax_applied?: boolean;
  notes?: string;
  terms_conditions?: string;
  currency?: string;
  document_url?: string;
}): Promise<{ success: boolean; message: string; data: Invoice }> => {
  const response = await apiClient.post("/finance/invoices", data);
  return {
    success: true,
    message: "Invoice created successfully.",
    data: response.data,
  };
};

export const getInvoiceById = async (invoiceId: string): Promise<any> => {
  const response = await apiClient.get(`/finance/invoices/${invoiceId}`);
  return response.data;
};

export const updateInvoice = async (
  invoiceId: string,
  payload: { notes?: string; terms_conditions?: string; status?: string },
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.put(
    `/finance/invoices/${invoiceId}`,
    payload,
  );
  return {
    success: true,
    message: response.data?.message || "Invoice updated successfully.",
  };
};

export const recordInvoicePayment = async (
  invoiceId: string,
  payload: {
    payment_amount: number;
    payment_date: string;
    payment_method: string;
    reference_number?: string;
  },
): Promise<{ success: boolean; message: string }> => {
  await apiClient.patch(`/finance/invoices/${invoiceId}/payment`, payload);
  return { success: true, message: "Payment recorded successfully." };
};

export const getExpenses = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  department_id?: string;
}): Promise<ExpenseListResponse> => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  const response = await apiClient.get("/finance/expenses", {
    params: {
      page,
      page_size: limit,
      status: params?.status,
      department_id: params?.department_id,
    },
  });

  const data = response.data?.data ?? [];
  const pagination = response.data?.pagination;

  return {
    success: true,
    data,
    meta: buildMeta(pagination, data.length),
  };
};

export const getExpenseById = async (expenseId: string): Promise<Expense> => {
  const response = await apiClient.get(`/finance/expenses/${expenseId}`);
  return response.data;
};

export const createExpense = async (data: {
  title: string;
  employee_id: string;
  amount: number;
  description: string;
  department_id: string;
  justification?: string;
  currency?: string;
  procurement_id?: string;
  project_id?: string;
  prospection_id?: string;
}): Promise<{ success: boolean; message: string; data: Expense }> => {
  const response = await apiClient.post("/finance/expenses", data);
  return {
    success: true,
    message: "Expense submitted successfully.",
    data: response.data,
  };
};

export const getBudgets = async (params?: {
  page?: number;
  limit?: number;
  department_id?: string;
  status?: string;
}): Promise<{
  success: boolean;
  data: Budget[];
  meta?: TransactionListResponse["meta"];
}> => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  const response = await apiClient.get("/finance/budgets", {
    params: {
      page,
      page_size: limit,
      department_id: params?.department_id,
      status: params?.status,
    },
  });

  const data = response.data?.data ?? [];
  const pagination = response.data?.pagination;

  return {
    success: true,
    data,
    meta: buildMeta(pagination, data.length),
  };
};

export const getBudgetById = async (budgetId: string): Promise<Budget> => {
  const response = await apiClient.get(`/finance/budgets/${budgetId}`);
  return response.data;
};

export const createBudget = async (payload: {
  department_id: string;
  start_date: string;
  end_date: string;
  description: string;
  total_amount: number;
  currency?: string;
  notes?: string;
  additional_notes?: string;
}): Promise<{ success: boolean; message: string; data: Budget }> => {
  const response = await apiClient.post("/finance/budgets", payload);
  return {
    success: true,
    message: "Budget created successfully.",
    data: response.data,
  };
};

export const updateBudget = async (
  budgetId: string,
  payload: {
    start_date?: string;
    end_date?: string;
    description?: string;
    total_amount?: number;
    additional_notes?: string;
    status?: string;
  },
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.put(`/finance/budgets/${budgetId}`, payload);
  return {
    success: true,
    message: response.data?.message || "Budget updated successfully.",
  };
};

export const getBudgetUtilization = async (
  budgetId: string,
): Promise<{
  budget_id: string;
  department_name: string;
  start_date: string;
  end_date: string;
  total_allocated: number;
  total_spent: number;
  remaining: number;
  utilization_percentage: number;
}> => {
  const response = await apiClient.get(
    `/finance/budgets/${budgetId}/utilization`,
  );
  return response.data;
};

export const getPayrollRecords = async (params?: {
  page?: number;
  limit?: number;
  employee_id?: string;
  department_id?: string;
  status?: string;
}): Promise<{
  success: boolean;
  data: PayrollRecordApi[];
  meta?: TransactionListResponse["meta"];
}> => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  const response = await apiClient.get("/payroll", {
    params: {
      page,
      page_size: limit,
      employee_id: params?.employee_id,
      department_id: params?.department_id,
      status: params?.status,
    },
  });

  const data = response.data?.data ?? [];
  const pagination = response.data?.pagination;

  return {
    success: true,
    data,
    meta: buildMeta(pagination, data.length),
  };
};

export const getPayrollRecordById = async (
  recordId: string,
): Promise<PayrollRecordApi> => {
  const response = await apiClient.get(`/payroll/${recordId}`);
  return response.data;
};

export const createPayrollRecord = async (payload: {
  payroll_id: string;
  employee_id: string;
  gross_salary: number;
  basic_salary: number;
  allowances?: Record<string, number>;
  bonuses?: number;
  deductions?: Record<string, number>;
  payment_method?: string;
  currency?: string;
}): Promise<{ success: boolean; message: string; data: PayrollRecordApi }> => {
  const response = await apiClient.post("/payroll", payload);
  return {
    success: true,
    message: "Payroll record created successfully.",
    data: response.data,
  };
};

export const updatePayrollRecord = async (
  recordId: string,
  payload: {
    status?: "PENDING" | "PAID" | "PARTIALLY_PAID";
    payment_reference?: string;
    signature_approvals?: {
      financial_clerk?: "YES" | "NO";
      manager?: "YES" | "NO";
    };
  },
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.patch(`/payroll/${recordId}`, payload);
  return {
    success: true,
    message: response.data?.message || "Payroll record updated successfully.",
  };
};

export const approvePayrollRecord = async (
  recordId: string,
  payload: { role: "financial_clerk" | "manager"; approval: "YES" | "NO" },
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post(
    `/payroll/${recordId}/approve`,
    payload,
  );
  return {
    success: true,
    message: response.data?.message || "Approval recorded successfully.",
  };
};

export const getCurrentEmployeeId = async (): Promise<string | null> => {
  const profileResponse = await apiClient.get("/auth/profile");
  const profile = profileResponse.data?.data;
  const email = profile?.email as string | undefined;
  const userId = profile?.user_id as string | undefined;

  if (!email && !userId) {
    return null;
  }

  const employeeResponse = await apiClient.get("/employees", {
    params: {
      search: email || undefined,
      page: 1,
      page_size: 20,
    },
  });

  const employees = employeeResponse.data?.data ?? [];
  const match =
    employees.find((emp: any) => emp.user_id === userId) || employees[0];
  return match?.employee_id ?? null;
};
