import { Eye, LogOut } from "lucide-react";
import { FaEllipsisVertical } from "react-icons/fa6";

interface OffboardingRow {
  id: string;
  name: string;
  role: string;
  departmentName?: string;
  startDate: string;
  avatar: string;
  offboardingType: string;
}

type ActionMenuProps = {
  rowId: string;
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: () => void;
  onOffboard: () => void;
};

function OffboardingActionMenu({
  rowId,
  openMenuId,
  onToggleMenu,
  onView,
  onOffboard,
}: ActionMenuProps) {
  const isOpen = openMenuId === rowId;

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-600"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMenu(isOpen ? null : rowId);
        }}
      >
        <FaEllipsisVertical className="text-base" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-9 z-20 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-sm">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            onClick={onView}
          >
            <Eye size={15} /> View
          </button>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50"
            onClick={onOffboard}
          >
            <LogOut size={15} /> Offboard
          </button>
        </div>
      ) : null}
    </div>
  );
}

export const createOffboardingColumns = ({
  openMenuId,
  onToggleMenu,
  onView,
  onOffboard,
}: {
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: (id: string) => void;
  onOffboard: (id: string) => void;
}) => [
  {
    key: "name",
    header: "Employee",
    render: (value: string, row: OffboardingRow) => (
      <div className="flex items-center gap-3">
        <img
          src={row.avatar}
          alt={value}
          className="h-9 w-9 rounded-full object-cover"
        />
        <div>
          <span className="text-sm font-medium text-gray-900">{value || "-"}</span>
          <p className="text-xs text-gray-500">{row.role || "-"}</p>
        </div>
      </div>
    ),
  },
  {
    key: "departmentName",
    header: "Department",
    render: (value: string) => (
      <span className="text-sm text-gray-700">{value || "-"}</span>
    ),
  },
  {
    key: "offboardingType",
    header: "Type",
    render: (value: string) => {
      const styles: Record<string, string> = {
        employee: "bg-blue-100 text-blue-700",
        intern: "bg-purple-100 text-purple-700",
      };
      return (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
            styles[value] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {value || "-"}
        </span>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (value: string) => (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${value === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
        {value?.replace(/_/g, " ") || "-"}
      </span>
    ),
  },
  {
    key: "startDate",
    header: "Start Date",
    render: (value: string) => (
      <span className="text-sm text-gray-700">{value || "-"}</span>
    ),
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: OffboardingRow) => (
      <OffboardingActionMenu
        rowId={row.id}
        openMenuId={openMenuId}
        onToggleMenu={onToggleMenu}
        onView={() => onView(row.id)}
        onOffboard={() => onOffboard(row.id)}
      />
    ),
  },
];
