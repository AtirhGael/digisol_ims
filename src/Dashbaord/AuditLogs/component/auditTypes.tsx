// ─── Shared types & utilities for the AuditLogs feature ──────────────────────
import {
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuditUser {
  user_id: string;
  full_name: string;
  email: string;
  department: string | null;
  role: string | null;
  role_code: string | null;
}

export interface AuditLog {
  log_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_name: string | null;
  status: string | null;
  created_at: string;
  trace_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  before_value: object | null;
  after_value: object | null;
  error_message: string | null;
  user: AuditUser | null;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Modules list (system-level groupings) ────────────────────────────────────
export const SYSTEM_MODULES = [
  { value: "Auth", label: "Authentication & Authorization" },
  { value: "User", label: "User Management" },
  { value: "Role", label: "Role Management" },
  { value: "Employee", label: "Human Resource" },
  { value: "PERFORMANCE_EVALUATION", label: "Human Resource" },
  { value: "EvaluationPeriod", label: "Human Resource" },
  { value: "Department", label: "Department Management" },
  { value: "Finance", label: "Finance Management" },
  { value: "FinancialTransaction", label: "Finance Management" },
  { value: "Project", label: "Project Management" },
  { value: "Task", label: "Task Management" },
  { value: "Asset", label: "Asset Management" },
  { value: "Document", label: "Document Management" },
  { value: "BusinessDevelopment", label: "Business Development" },
  { value: "Contact", label: "Business Development" },
  { value: "Lead", label: "Business Development" },
  { value: "Client", label: "Business Development" },
  { value: "Contract", label: "Business Development" },
  { value: "Proposal", label: "Business Development" },
  { value: "AuditLog", label: "System Administration" },
];

// Unique values for the dropdown (deduplicated by label)
export const MODULE_FILTER_OPTIONS = [
  { value: "Auth", label: "Authentication & Authorization" },
  { value: "User", label: "User Management" },
  { value: "Role", label: "Role Management" },
  { value: "Employee", label: "Human Resource" },
  { value: "Department", label: "Department Management" },
  { value: "FinancialTransaction", label: "Finance Management" },
  { value: "Project", label: "Project Management" },
  { value: "Task", label: "Task Management" },
  { value: "Asset", label: "Asset Management" },
  { value: "Document", label: "Document Management" },
  // BD sub-entities all map to the parent module
  { value: "Contact", label: "Business Development – Contacts" },
  { value: "Lead", label: "Business Development – Leads" },
  { value: "Client", label: "Business Development – Clients" },
  { value: "Contract", label: "Business Development – Contracts" },
  { value: "Proposal", label: "Business Development – Proposals" },
];

// ─── Action Config ────────────────────────────────────────────────────────────
export const ACTION_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  LOGIN: {
    label: "Login",
    icon: <LogIn size={12} />,
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  LOGOUT: {
    label: "Logout",
    icon: <LogOut size={12} />,
    color: "text-slate-700",
    bg: "bg-slate-100",
  },
  CREATE: {
    label: "Create",
    icon: <Plus size={12} />,
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  UPDATE: {
    label: "Update",
    icon: <Pencil size={12} />,
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  DELETE: {
    label: "Delete",
    icon: <Trash2 size={12} />,
    color: "text-red-700",
    bg: "bg-red-100",
  },
  REFRESH_TOKEN_REUSE_DETECTED: {
    label: "Token Reuse",
    icon: <ShieldAlert size={12} />,
    color: "text-rose-700",
    bg: "bg-rose-100",
  },
};

// ─── Badge Helpers ────────────────────────────────────────────────────────────
export const getActionBadge = (action: string) => {
  const cfg = ACTION_CONFIG[action] ?? {
    label: action,
    icon: <ShieldAlert size={12} />,
    color: "text-purple-700",
    bg: "bg-purple-100",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

export const getStatusBadge = (status: string | null) => {
  if (status === "SUCCESS")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle2 size={12} />
        Success
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      <XCircle size={12} />
      Failure
    </span>
  );
};

export const formatDate = (iso: string, showTime: boolean = true) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  
  if (showTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.second = "2-digit";
  }

  return new Date(iso).toLocaleString("en-GB", options);
};
