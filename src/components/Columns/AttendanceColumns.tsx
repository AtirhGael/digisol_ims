import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { FaEllipsisVertical } from "react-icons/fa6";

type AttendanceStatus = "Present" | "Absent" | "Late" | "On Leave";

interface AttendanceRow {
  id: number;
  name: string;
  status: AttendanceStatus;
  department: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: string;
}

const statusStyles: Record<AttendanceStatus, string> = {
  Present: "bg-green-100 text-green-800",
  Absent: "bg-red-100 text-red-800",
  Late: "bg-yellow-100 text-yellow-800",
  "On Leave": "bg-blue-100 text-blue-800",
};

function AttendanceActionMenu({
  rowId,
  openMenuId,
  onToggleMenu,
  onView,
  onDelete,
}: {
  rowId: number;
  openMenuId: number | null;
  onToggleMenu: (id: number | null) => void;
  onView: () => void;
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
            <Eye size={15} /> View
          </button>
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

export const createAttendanceColumns = ({
  openMenuId,
  onToggleMenu,
  onView,
  onDelete,
}: {
  openMenuId: number | null;
  onToggleMenu: (id: number | null) => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}) => [
  {
    key: "name",
    header: "Name",
    render: (value: string) => (
      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{value ?? "—"}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: AttendanceStatus) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[value] ?? "bg-gray-100 text-gray-700"}`}>
        {value ?? "—"}
      </span>
    ),
  },
  {
    key: "department",
    header: "Department",
    render: (value: string) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">{value ?? "—"}</span>
    ),
  },
  {
    key: "checkIn",
    header: "Check In",
    render: (value: string) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">{value ?? "—"}</span>
    ),
  },
  {
    key: "checkOut",
    header: "Check Out",
    render: (value: string) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">{value ?? "—"}</span>
    ),
  },
  {
    key: "hoursWorked",
    header: "Hours",
    render: (value: string) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">{value ?? "—"}</span>
    ),
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: number, row: AttendanceRow) => (
      <AttendanceActionMenu
        rowId={Number(row.id)}
        openMenuId={openMenuId}
        onToggleMenu={onToggleMenu}
        onView={() => onView(Number(row.id))}
        onDelete={() => onDelete(Number(row.id))}
      />
    ),
  },
];
