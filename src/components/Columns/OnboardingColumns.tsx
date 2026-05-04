import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { FaEllipsisVertical } from "react-icons/fa6";

const progressColors = ["bg-emerald-500", "bg-blue-500", "bg-amber-400"];

interface OnboardingRow {
  id: string;
  name: string;
  role: string;
  workflow: string;
  startDate: string;
  progress: number;
  avatar: string;
}

function OnboardingActionMenu({
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

export const createOnboardingColumns = ({
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
    key: "name",
    header: "Employee",
    render: (value: string, row: OnboardingRow) => (
      <div className="flex items-center gap-3">
        <img
          src={row.avatar}
          alt={value}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div>
          <span className="text-sm font-medium text-gray-900">{value ?? "—"}</span>
          <p className="text-xs text-gray-500">{row.role}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (value: string) => (
      <span className="text-sm text-gray-700">{value ?? "—"}</span>
    ),
  },
  {
    key: "workflow",
    header: "Workflow",
    render: (value: string) => {
      const styles: Record<string, string> = {
        Hybrid: "bg-blue-100 text-blue-700",
        Onsite: "bg-green-100 text-green-700",
        Remote: "bg-purple-100 text-purple-700",
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[value] ?? "bg-gray-100 text-gray-700"}`}>
          {value ?? "—"}
        </span>
      );
    },
  },
  {
    key: "startDate",
    header: "Start Date",
    render: (value: string) => (
      <span className="text-sm text-gray-700">{value ?? "—"}</span>
    ),
  },
  {
    key: "progress",
    header: "Progress",
    render: (value: number, row: OnboardingRow) => {
      const idx = parseInt(row.id, 10) % progressColors.length;
      return (
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 h-2 rounded-full bg-gray-100">
            <div
              className={`h-2 rounded-full ${progressColors[idx]}`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">{value}%</span>
        </div>
      );
    },
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: OnboardingRow) => (
      <OnboardingActionMenu
        rowId={row.id}
        openMenuId={openMenuId}
        onToggleMenu={onToggleMenu}
        onView={() => onView(row.id)}
        onDelete={() => onDelete(row.id)}
      />
    ),
  },
];
