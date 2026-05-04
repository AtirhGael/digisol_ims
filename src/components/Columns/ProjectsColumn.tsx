import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { FaEllipsisVertical } from "react-icons/fa6";
import { Button } from "../ui/button";

type ProjectStatus = "Pending" | "Active" | "On Hold" | "Completed";
type ProjectPriority = "Low" | "Medium" | "High";

interface ProjectRow {
  id: string;
  projectId: string;
  name: string;
  priority: ProjectPriority;
  department: string;
  team: string;
  progress: number;
  createdOn: string;
  status: ProjectStatus;
}

const getPriorityColor = (priority: ProjectPriority): string => {
  switch (priority) {
    case "High":
      return "text-red-600";
    case "Medium":
      return "text-green-600";
    case "Low":
      return "text-orange-500";
    default:
      return "text-gray-500";
  }
};

const getStatusColor = (
  status: ProjectStatus,
): { text: string; dot: string; bg: string; label: string } => {
  switch (status) {
    case "Active":
      return { text: "text-green-600", dot: "bg-green-500", bg: "bg-green-100/70", label: "Ongoing" };
    case "Pending":
      return { text: "text-orange-600", dot: "bg-orange-500", bg: "bg-orange-100/70", label: "Pending" };
    case "On Hold":
      return { text: "text-blue-600", dot: "bg-blue-500", bg: "bg-blue-100/70", label: "On Hold" };
    case "Completed":
      return { text: "text-blue-600", dot: "bg-blue-500", bg: "bg-blue-100/70", label: "Completed" };
    default:
      return { text: "text-gray-600", dot: "bg-gray-500", bg: "bg-gray-100", label: status };
  }
};

function ProjectActionMenu({
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
            className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2"
            onClick={onView}
          >
            <Eye size={15} />
            View
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2"
            onClick={onEdit}
          >
            <Pencil size={15} />
            Edit
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-red-500 bg-transparent border-none cursor-pointer flex items-center gap-2"
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

export const createProjectsColumns = ({
  openMenuId,
  onToggleMenu,
  onViewProject,
  onEditProject,
  onDeleteProject,
}: {
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onViewProject: (id: string) => void;
  onEditProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}) => [
  {
    key: "projectId",
    header: "ProjectsID",
    render: (value: string) => <span className="text-sm font-medium text-gray-900 block truncate max-w-[160px]">{value}</span>,
  },
  {
    key: "name",
    header: "Name",
    render: (value: string) => <span className="text-sm text-gray-900 font-medium block truncate max-w-[200px]">{value}</span>,
  },
  {
    key: "priority",
    header: "Priority",
    render: (value: ProjectPriority) => <span className={`text-sm font-semibold uppercase ${getPriorityColor(value)}`}>{value}</span>,
  },
  {
    key: "department",
    header: "Department",
    render: (value: string) => <span className="text-sm text-gray-900 block truncate max-w-[200px]">{value}</span>,
  },
  { key: "team", header: "Team" },
  {
    key: "progress",
    header: "Progress",
    render: (value: number) => (
      <div className="w-[90px]">
        <span className="text-[10px] text-gray-400 block leading-none mb-1 text-center">{value}%</span>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-green-600 h-1.5 rounded-full transition-all" style={{ width: `${value}%` }} />
        </div>
      </div>
    ),
  },
  {
    key: "createdOn",
    header: "Created On",
    render: (value: string) => (
      <span className="text-sm text-gray-900 whitespace-nowrap">{value}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: ProjectStatus) => {
      const statusStyle = getStatusColor(value);
      return (
        <span className={`inline-flex items-center justify-start gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.text} ${statusStyle.bg}`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${statusStyle.dot}`} />
          <span className="text-left whitespace-nowrap">{statusStyle.label}</span>
        </span>
      );
    },
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: ProjectRow) => (
      <ProjectActionMenu
        rowId={row.id}
        openMenuId={openMenuId}
        onToggleMenu={onToggleMenu}
        onView={() => onViewProject(row.id)}
        onEdit={() => onEditProject(row.id)}
        onDelete={() => onDeleteProject(row.id)}
      />
    ),
  },
];
