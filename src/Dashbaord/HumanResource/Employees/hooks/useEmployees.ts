import { useFetchHook } from "../../../../Hooks/UseFetchHook";
import { useDeleteHook } from "../../../../Hooks/UseDeleteHook";
import type { HrEmployee } from "../../hrApi";
import type { EmployeeRow } from "../types";

type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
};

const STATUS_MAP: Record<string, string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On Leave",
  SUSPENDED: "Suspended",
  TERMINATED: "Terminated",
  RESIGNED: "Resigned",
};

function toEmployeeRow(employee: HrEmployee): EmployeeRow {
  return {
    id: employee.employee_id,
    name: `${employee.first_name} ${employee.last_name}`.trim(),
    employeeId: employee.employee_code,
    department: employee.department?.department_name ?? "Unassigned",
    role: employee.position || "-",
    status: STATUS_MAP[employee.employment_status] ?? employee.employment_status,
    hireDate: employee.start_date
      ? new Date(employee.start_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-",
    email: employee.email,
  };
}

export function useEmployees() {
  const { data, isLoading, isError, refetch } =
    useFetchHook<PaginatedResponse<HrEmployee>>(
      "/employees?page_size=200",
      "hr-employees"
    );

  const { mutateAsync: deleteEmployee } = useDeleteHook("/employees", [
    "hr-employees",
  ]);

  const employees: EmployeeRow[] = (data?.data ?? []).map(toEmployeeRow);

  return { employees, isLoading, isError, refetch, deleteEmployee };
}
