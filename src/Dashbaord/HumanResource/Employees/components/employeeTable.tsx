import React, { useEffect, useState } from "react";
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { EmployeeColumns } from "../../../../components/Columns/Employee";
import { useDeleteHook } from "../../../../Hooks/UseDeleteHook";
import { useFetchHook } from "../../../../Hooks/UseFetchHook";
import { toast } from "sonner";
import { type HrEmployee } from "../../hrApi";
import SkeletonLoading from "../../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";

type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
};

type EmployeeRow = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  status: "Active" | "On Leave";
  hireDate: string;
};

const statusStyles: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  "On Leave": "bg-yellow-100 text-yellow-700",
};

interface EmployeeTableProps {
  selected: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  selectAll: boolean;
  onView: (id: string) => void;
  EmployeeColumns: typeof EmployeeColumns;
}

// table heads
// const tableHeaders = [
//   { label: "Employee Name", key: "name" },
//   { label: "Employee ID", key: "employeeId" },
//   { label: "Department", key: "department" },
//   { label: "Role", key: "role" },
//   { label: "Status", key: "status" },
//   { label: "Hire Date", key: "hireDate" },
// ];

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  selected,
  onSelect,
  onSelectAll,
  selectAll,
  onView,
  EmployeeColumns,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRow | null>(null);
  const {
    data: employeesResponse,
    isLoading,
    error,
  } = useFetchHook<PaginatedResponse<HrEmployee>>(
    "/employees?page_size=200",
    "hr-employees-table"
  );
  const deleteEmployeeMutation = useDeleteHook("/employees", [
    "hr-employees-table",
    "hr-employees",
    "employees",
    "hr-onboarding-employees",
    "hr-attendance-employees",
    "hr-performance-employees",
  ]);

  // Close menu when clicking outside
  useEffect(() => {
    if (error) {
      toast.error(error.response?.data?.message || "Failed to load employees.");
    }

    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [error]);

  useEffect(() => {
    setRows(
      (employeesResponse?.data ?? []).map((employee) => ({
        id: employee.employee_id,
        name: `${employee.first_name} ${employee.last_name}`.trim(),
        employeeId: employee.employee_code,
        department: employee.department?.department_name ?? "Unassigned",
        role: employee.position,
        status: employee.employment_status === "ACTIVE" ? "Active" : "On Leave",
        hireDate: employee.start_date
          ? new Date(employee.start_date).toISOString().slice(0, 10)
          : "-",
      }))
    );
  }, [employeesResponse]);

  const handleToggleMenu = (id: string | null) => {
    setOpenMenuId(id);
  };

  const handleDeleteEmployee = (id: string) => {
    const row = rows.find((item) => item.id === id);
    if (!row) return;
    setEmployeeToDelete(row);
    setOpenMenuId(null);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployeeMutation.mutateAsync(employeeToDelete.id);
      setRows((current) => current.filter((row) => row.id !== employeeToDelete.id));
      setEmployeeToDelete(null);
      toast.success("Employee record deleted successfully.");
    } catch (deleteError: any) {
      toast.error(
        deleteError?.response?.data?.message || "Failed to delete employee."
      );
    }
  };

  if (isLoading) {
    return <SkeletonLoading />;
  }

  return (
    <>
      <ReusableTable
        heading={"Employee Table"}
        columns={EmployeeColumns(openMenuId, handleToggleMenu, handleDeleteEmployee)}
        data={rows}
      />

      <AlertDialog
        open={employeeToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setEmployeeToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {employeeToDelete?.name ?? "this employee"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" onClick={() => setEmployeeToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={confirmDeleteEmployee}
              className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
            >
              {deleteEmployeeMutation.isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmployeeTable;
