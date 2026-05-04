import React from "react";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface TaskRow {
  id: number;
  title: string;
  assignee: string;
  projectName: string;
  progress: number;
  deadline: string;
  priority: "Low" | "Medium" | "High";
}

const getPriorityColor = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-red-500 bg-red-50";
    case "medium":
      return "text-teal-500 bg-teal-50";
    case "low":
      return "text-gray-500 bg-gray-50";
    default:
      return "text-gray-500 bg-gray-50";
  }
};

function TaskActionMenu({
  rowId,
  openMenuId,
  onToggleMenu,
  onView,
  onEdit,
  onDelete,
  showEditDelete = true,
}: {
  rowId: number;
  openMenuId: number | null;
  onToggleMenu: (id: number | null) => void;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showEditDelete?: boolean;
}) {
  const isOpen = openMenuId === rowId;

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="p-1 text-gray-400 hover:text-gray-600"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMenu(isOpen ? null : rowId);
        }}
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 z-20 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-md">
          <button
            type="button"
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3"
            onClick={onView}
          >
            <Eye size={18} />
            View
          </button>
          {showEditDelete && (
            <>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3"
                onClick={onEdit}
              >
                <Pencil size={18} />
                Edit
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md flex items-center gap-3"
                onClick={onDelete}
              >
                <Trash2 size={18} />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export const createTaskColumns = ({
  openMenuId,
  onToggleMenu,
  onViewTask,
  onEditTask,
  onDeleteTask,
  showEditDelete = true,
}: {
  openMenuId: number | null;
  onToggleMenu: (id: number | null) => void;
  onViewTask: (task: TaskRow) => void;
  onEditTask?: (task: TaskRow) => void;
  onDeleteTask?: (task: TaskRow) => void;
  showEditDelete?: boolean;
}) => [
  {
    key: "title",
    header: "Task Name",
    render: (value: string) => <span className="block truncate max-w-[220px]">{value}</span>,
  },
  {
    key: "assignee",
    header: "Assignee",
    render: (value: string) => <span className="block truncate max-w-[140px]">{value}</span>,
  },
  {
    key: "projectName",
    header: "Project Name",
    render: (value: string) => <span className="block truncate max-w-[170px]">{value}</span>,
  },
  {
    key: "progress",
    header: "Progress",
    render: (value: number) => <span className="block truncate max-w-[80px]">{value}%</span>,
  },
  {
    key: "deadline",
    header: "Deadline",
    render: (value: string) => <span className="block truncate max-w-[130px]">{value}</span>,
  },
  {
    key: "priority",
    header: "Priority",
    render: (value: string) => (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(value)}`}>
        {value}
      </span>
    ),
  },
  {
    key: "id",
    header: "Action",
    render: (_value: number, row: TaskRow) => (
      <TaskActionMenu
        rowId={row.id}
        openMenuId={openMenuId}
        onToggleMenu={onToggleMenu}
        onView={() => onViewTask(row)}
        onEdit={onEditTask ? () => onEditTask(row) : undefined}
        onDelete={onDeleteTask ? () => onDeleteTask(row) : undefined}
        showEditDelete={showEditDelete}
      />
    ),
  },
];
