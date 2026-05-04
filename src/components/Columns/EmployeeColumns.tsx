import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { FaEllipsisVertical } from "react-icons/fa6";

type EmployeeStatus = "Active" | "On Leave";

interface EmployeeRow {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  hireDate: string;
}

function EmployeeActionMenu({
  rowId,
  openMenuId,
  onToggleMenu,
  onView,
  onEdit,
  onDelete,
}: {
  rowId: string;
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOpen = openMenuId === rowId;

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMenu(isOpen ? null : rowId);
        }}
      >
        <FaEllipsisVertical className="text-base" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-9 z-20 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-sm">
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
            onClick={onView}
          >
            <Eye size={15} />
            View
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
            onClick={onEdit}
          >
            <Pencil size={15} />
            Edit
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-red-500 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
            onClick={onDelete}
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export const createEmployeeColumns = ({
  openMenuId,
  onToggleMenu,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
}: {
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onViewEmployee: (id: string) => void;
  onEditEmployee: (id: string) => void;
  onDeleteEmployee: (id: string) => void;
}) => [
  {
    key: "name",
    header: "Employee Name",
    render: (value: string) => (
      <span className="text-sm font-medium text-gray-900 block truncate">{value}</span>
    ),
  },
  {
    key: "employeeId",
    header: "Employee ID",
    render: (value: string) => (
      <span className="text-sm text-gray-700">{value}</span>
    ),
  },
  {
    key: "department",
    header: "Department",
    render: (value: string) => (
      <span className="text-sm text-gray-700 block truncate">{value}</span>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (value: string) => (
      <span className="text-sm text-gray-700 block truncate">{value}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: EmployeeStatus) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "Active"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {value}
      </span>
    ),
  },
  {
    key: "hireDate",
    header: "Hire Date",
    render: (value: string) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">{value}</span>
    ),
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: EmployeeRow) => (
      <EmployeeActionMenu
        rowId={row.id}
        openMenuId={openMenuId}
        onToggleMenu={onToggleMenu}
        onView={() => onViewEmployee(row.id)}
        onEdit={() => onEditEmployee(row.id)}
        onDelete={() => onDeleteEmployee(row.id)}
      />
    ),
  },
];
