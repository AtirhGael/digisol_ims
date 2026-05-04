// ─── Prospection Planning Types ───────────────────────────────
export interface ExpenseLine {
  id: number;
  expense_id?: string; // Optional field for existing expenses from backend
  type: string;
  description: string;
  amount: string;
}

export interface TeamMember {
  id: number;
  department: string;
  name: string;
}

export interface BasicInfo {
  title: string;
  description: string;
  city: string;
  region: string;
  venue: string;
  address: string;
  startDate: string;
  endDate: string;
  targetAudience: string;
  expectedContacts: string;
  successCriteria: string;
  status?: string;
}
export interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: AttendanceProps[];
  selectedStatuses: { [key: string]: string };
  handleStatusChange: (id: string | number, value: string) => void;
  inputValues: InputValues;
  handleInputChange: (id: string | number, field: string, value: string) => void;
}

export interface TodayAttendanceTabProps {
  data: any;
  pagination: any;
  openActionId: number | null;
  setOpenActionId: (id: number | null) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export interface AttendanceProps {
  id: string | number;
  name: string;
  status: string;
  department?: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: string;
  actions?: React.ReactNode;
}

export type InputValues = {
  [id: string | number]: {
    checkin?: string;
    checkout?: string;
  };
};

export interface SimpleTask {
  id: string;
  title: string;
  status: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  projectName: string;
  progress: number;
  deadline: string;
  priority: string;
  description: string;
  status: string;
}

export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  status: "Active" | "On Leave";
  hireDate: string;
}