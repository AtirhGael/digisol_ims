import React from "react";
import { Eye, Download, Trash2, Star, Pencil } from "lucide-react";
import { FaEllipsisVertical } from "react-icons/fa6";

interface CompletedRow {
  id: string;
  name: string;
  department: string;
  position: string;
  date: string;
  evaluator: string;
  rating: number;
  status: string;
}

function EvaluationActionMenu({
  rowId,
  openMenuId,
  onToggleMenu,
  onView,
  onEdit,
  onDownload,
  onDelete,
  showDelete = true,
}: {
  rowId: string;
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: () => void;
  onEdit?: () => void;
  onDownload: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
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
          {onEdit && (
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
              onClick={onEdit}
            >
              <Pencil size={15} /> Edit
            </button>
          )}
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
            onClick={onDownload}
          >
            <Download size={15} /> Download
          </button>
          {showDelete ? (
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-red-500 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
              onClick={onDelete}
            >
              <Trash2 size={15} /> Delete
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export const createCompletedEvaluationColumns = ({
  openMenuId,
  onToggleMenu,
  onView,
  onEdit,
  onDownload,
  onDelete,
  showDelete = true,
}: {
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}) => [
  {
    key: "name",
    header: "Employee Name",
    render: (value: string) => (
      <span className="text-sm font-medium text-gray-900">{value ?? "—"}</span>
    ),
  },
  {
    key: "department",
    header: "Department",
    render: (value: string) => (
      <span className="text-sm text-gray-700">{value ?? "—"}</span>
    ),
  },
  {
    key: "position",
    header: "Position",
    render: (value: string) => (
      <span className="text-sm text-gray-700">{value ?? "—"}</span>
    ),
  },
  {
    key: "date",
    header: "Evaluation Date",
    render: (value: string) => (
      <span className="text-sm text-gray-700">
        {value
          ? new Date(value).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—"}
      </span>
    ),
  },
  {
    key: "evaluator",
    header: "Evaluator",
    render: (value: string) => (
      <span className="text-sm text-gray-700">{value ?? "—"}</span>
    ),
  },
  {
    key: "rating",
    header: "Overall Rating",
    render: (value: number) => (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
        <span className="text-sm font-medium text-gray-800">{value ?? "—"}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: string) => {
      const styles: Record<string, string> = {
        Reviewed: "bg-green-100 text-green-700",
        Completed: "bg-blue-100 text-blue-700",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            styles[value] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {value ?? "—"}
        </span>
      );
    },
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: CompletedRow) => (
      <EvaluationActionMenu
        rowId={row.id}
        openMenuId={openMenuId}
        onToggleMenu={onToggleMenu}
        onView={() => onView(row.id)}
        onEdit={onEdit ? () => onEdit(row.id) : undefined}
        onDownload={() => onDownload(row.id)}
        onDelete={onDelete ? () => onDelete(row.id) : undefined}
        showDelete={showDelete}
      />
    ),
  },
];
