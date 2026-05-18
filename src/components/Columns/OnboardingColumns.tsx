import { Eye, Trash2 } from "lucide-react";
import { FaEllipsisVertical } from "react-icons/fa6";

interface OnboardingRow {
  id: string;
  name: string;
  role: string;
  workflow: string;
  startDate: string;
  avatar: string;
}

type OnboardingActionMenuProps = {
  rowId: string;
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
};

function OnboardingActionMenu({
  rowId,
  openMenuId,
  onToggleMenu,
  onView,
  onDelete,
  showDelete = true,
}: OnboardingActionMenuProps) {
  const isOpen = openMenuId === rowId;

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-600"
        onClick={(event) => {
          event.stopPropagation();
          onToggleMenu(isOpen ? null : rowId);
        }}
      >
        <FaEllipsisVertical className="text-base" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-9 z-20 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-sm">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            onClick={onView}
          >
            <Eye size={15} /> View
          </button>
          {showDelete ? (
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50"
              onClick={onDelete}
            >
              <Trash2 size={15} /> Delete
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export const createOnboardingColumns = ({
  openMenuId,
  onToggleMenu,
  onView,
  onDelete,
  showDelete = true,
}: {
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: (id: string) => void;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}) => [
  {
    key: "name",
    header: "Employee",
    render: (value: string, row: OnboardingRow) => (
      <div className="flex items-center gap-3">
        <img src={row.avatar} alt={value} className="h-9 w-9 rounded-full object-cover" />
        <div>
          <span className="text-sm font-medium text-gray-900">{value || "-"}</span>
          <p className="text-xs text-gray-500">{row.role || "-"}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (value: string) => <span className="text-sm text-gray-700">{value || "-"}</span>,
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
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            styles[value] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {value || "-"}
        </span>
      );
    },
  },
  {
    key: "startDate",
    header: "Start Date",
    render: (value: string) => <span className="text-sm text-gray-700">{value || "-"}</span>,
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
        onDelete={onDelete ? () => onDelete(row.id) : undefined}
        showDelete={showDelete}
      />
    ),
  },
];
