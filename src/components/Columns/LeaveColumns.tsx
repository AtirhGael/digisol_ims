import React from "react";
import { Check, X, Eye, Pencil, Trash2 } from "lucide-react";
import { FaEllipsisVertical } from "react-icons/fa6";

export type LeaveStatus = "Present" | "Absent" | "Late" | "On Leave" | "No Record";

interface LeaveRow {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  status: LeaveStatus;
  hireDate: string;
  approvalStatus?: string;
}

const statusClasses: Record<LeaveStatus, string> = {
  Present: "bg-green-100 text-green-800",
  Absent: "bg-red-100 text-red-800",
  Late: "bg-amber-100 text-amber-800",
  "On Leave": "bg-blue-100 text-blue-800",
  "No Record": "bg-gray-100 text-gray-700",
};

const statusDotClasses: Record<LeaveStatus, string> = {
  Present: "bg-green-500",
  Absent: "bg-red-500",
  Late: "bg-amber-500",
  "On Leave": "bg-blue-500",
  "No Record": "bg-gray-500",
};

function LeaveActionMenu({
  rowId,
  openMenuId,
  onToggleMenu,
  onView,
  onEdit,
  onDelete,
  showEdit = true,
}: {
  rowId: string;
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showEdit?: boolean;
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
            <Eye size={15} /> View
          </button>
          {showEdit ? (
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
              onClick={onEdit}
            >
              <Pencil size={15} /> Edit
            </button>
          ) : null}
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-red-500 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
            onClick={onDelete}
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// Base columns shared across all leave tabs
const baseLeaveColumns = () => [
  {
    key: "name",
    header: "Employee Name",
    render: (value: string) => (
      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{value}</span>
    ),
  },
  {
    key: "employeeId",
    header: "Employee ID",
    render: (value: string) => (
      <span className="text-sm text-gray-600 whitespace-nowrap">{value}</span>
    ),
  },
  {
    key: "department",
    header: "Department",
    render: (value: string) => (
      <span className="text-sm text-gray-600 whitespace-nowrap">{value}</span>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (value: string) => (
      <span className="text-sm text-gray-600 whitespace-nowrap">{value}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: LeaveStatus) => (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusClasses[value]}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusDotClasses[value]}`} />
        {value}
      </span>
    ),
  },
  {
    key: "hireDate",
    header: "Hire Date",
    render: (value: string) => (
      <span className="text-sm text-gray-600 whitespace-nowrap">{value}</span>
    ),
  },
];

// Columns for Approved / Rejected tabs — with View/Edit/Delete action menu
export const createLeaveColumns = ({
  openMenuId,
  onToggleMenu,
  onView,
  onEdit,
  onDelete,
  showEdit = true,
}: {
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  showEdit?: boolean;
}) => [
  ...baseLeaveColumns(),
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: LeaveRow) => (
      <LeaveActionMenu
        rowId={row.id}
        openMenuId={openMenuId}
        onToggleMenu={onToggleMenu}
        onView={() => onView(row.id)}
        onEdit={() => onEdit(row.id)}
        onDelete={() => onDelete(row.id)}
        showEdit={showEdit}
      />
    ),
  },
];

// Columns for Pending Requests tab — with approve/reject/edit buttons
export const createPendingLeaveColumns = ({
  onApprove,
  onReject,
  onEdit,
}: {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit?: (id: string) => void;
}) => [
  ...baseLeaveColumns(),
  {
    key: "approvalStatus",
    header: "Stage",
    truncate: false,
    render: (value: string) => {
      const isManagerApproved = value === "Manager Approved";
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            isManagerApproved
              ? "bg-amber-100 text-amber-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              isManagerApproved ? "bg-amber-500" : "bg-blue-500"
            }`}
          />
          {isManagerApproved ? "Awaiting HR" : "Awaiting Manager"}
        </span>
      );
    },
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: LeaveRow) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onApprove(row.id)}
          className="p-1.5 sm:p-2 text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors cursor-pointer"
          title={row.approvalStatus === "Manager Approved" ? "Final Approve (HR)" : "Approve (Manager)"}
        >
          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => onReject(row.id)}
          className="p-1.5 sm:p-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors cursor-pointer"
          title="Reject"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(row.id)}
            className="p-1.5 sm:p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors cursor-pointer"
            title="Edit"
          >
            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    ),
  },
];
