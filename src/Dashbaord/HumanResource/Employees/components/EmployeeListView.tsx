import React from "react";
import { FileDown, CalendarDays } from "lucide-react";
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
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { createEmployeeColumns } from "../../../../components/Columns/EmployeeColumns";
import type { EmployeeRow } from "../types";

interface Props {
  employees: EmployeeRow[];
  employeeToDelete: EmployeeRow | null;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onAddNew: () => void;
  onExportPdf: () => void;
  onRequestLeave: () => void;
}

export const EmployeeListView: React.FC<Props> = ({
  employees,
  employeeToDelete,
  onView,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  onAddNew,
  onExportPdf,
  onRequestLeave,
}) => (
  <div className="min-h-screen">
    <AlertDialog
      open={employeeToDelete !== null}
      onOpenChange={(open) => !open && onCancelDelete()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Employee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <strong>{employeeToDelete?.name}</strong>? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Employee Records
        </h1>
        <p className="text-sm text-gray-500">
          Manage and view all employee information
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          className="border border-gray-300 text-gray-700 rounded px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
          onClick={onRequestLeave}
        >
          <CalendarDays size={15} />
          <span>Request Leave</span>
        </button>
        <button
          className="border rounded px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-50"
          onClick={onExportPdf}
          aria-label="Export Records as PDF"
        >
          <FileDown size={15} />
          <span>Export as PDF</span>
        </button>
        <button
          className="bg-primary hover:bg-[#35345f] text-white rounded px-4 py-2 text-sm font-semibold flex items-center gap-2"
          onClick={onAddNew}
        >
          + Add New Employee
        </button>
      </div>
    </div>

    <ReusableTable
      heading="Employee Table"
      columns={createEmployeeColumns({
        onViewEmployee: onView,
        onEditEmployee: onEdit,
        onDeleteEmployee: onDelete,
      })}
      data={employees}
      filterKey="status"
      filterOptions={[
        { key: "active", value: "Active", label: "Active" },
        { key: "on-leave", value: "On Leave", label: "On Leave" },
      ]}
      searchKeys={["name", "department", "role"]}
    />
  </div>
);
