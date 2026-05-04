import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { FaEllipsisVertical } from "react-icons/fa6";

const statusStyles: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  "in progress": "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

const priorityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  low: "bg-green-100 text-green-700",
};

function QueryActionMenu({
  rowId,
  openMenuId,
  onToggleMenu,
  onView,
  onDelete,
}: {
  rowId: string;
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
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

const formatDate = (dateStr: string) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

export const createQueryColumns = ({
  openMenuId,
  onToggleMenu,
  onView,
  onDelete,
}: {
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}) => [
  {
    key: "id",
    header: "Query ID",
    render: (value: string) => (
      <span className="text-sm font-medium whitespace-nowrap">{value ?? "—"}</span>
    ),
  },
  {
    key: "submittedDate",
    header: "Submitted Date",
    render: (value: string) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">{formatDate(value)}</span>
    ),
  },
  {
    key: "employee",
    header: "Employee",
    render: (value: string) => (
      <span className="text-sm text-gray-900 whitespace-nowrap">{value ?? "—"}</span>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (value: string) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">{value ?? "—"}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: string) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
          statusStyles[value?.toLowerCase()] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {value ?? "—"}
      </span>
    ),
  },
  {
    key: "priority",
    header: "Priority",
    render: (value: string) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
          priorityStyles[value?.toLowerCase()] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {value ?? "—"}
      </span>
    ),
  },
  {
    key: "assignedTo",
    header: "Assigned To",
    render: (value: string) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">{value ?? "—"}</span>
    ),
  },
  {
    key: "dueDate",
    header: "Due Date",
    render: (value: string) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">{formatDate(value)}</span>
    ),
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (value: string, row: { id: string }) => (
      <QueryActionMenu
        rowId={row.id}
        openMenuId={openMenuId}
        onToggleMenu={onToggleMenu}
        onView={() => onView(row.id)}
        onDelete={() => onDelete(row.id)}
      />
    ),
  },
];
