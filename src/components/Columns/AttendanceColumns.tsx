import React, { useEffect, useRef, useState } from "react";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";

type AttendanceStatus = "Present" | "Absent" | "Late" | "On Leave";

interface AttendanceRow {
  id: string;
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

function AttendanceRowActionsMenu({
  onView,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
}: {
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const updateMenuPosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPos({
      top: rect.bottom + 6,
      left: rect.right - 144,
    });
  };

  useEffect(() => {
    if (open) {
      updateMenuPosition();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleReposition = () => updateMenuPosition();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  return (
    <div className="relative" style={{ zIndex: open ? 1000 : 1 }}>
      <div
        ref={triggerRef}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-gray-100"
        onClick={() => setOpen(!open)}
      >
        <MoreVertical className="h-4 w-4" />
      </div>
      {open && (
        <div
          ref={menuRef}
          className="fixed z-1000 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-sm"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2.5 border-none bg-transparent px-4 py-2 text-left text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </button>
          {showEdit ? (
            <button
              type="button"
              className="flex w-full items-center gap-2.5 border-none bg-transparent px-4 py-2 text-left text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setOpen(false);
                onEdit?.();
              }}
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          ) : null}
          {showDelete ? (
            <button
              type="button"
              className="flex w-full items-center gap-2.5 border-none bg-transparent px-4 py-2 text-left text-sm text-red-500 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setOpen(false);
                onDelete?.();
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export const createAttendanceColumns = ({
  onView,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
}: {
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showEdit?: boolean;
  showDelete?: boolean;
}) => [
  {
    key: "name",
    header: "Name",
    render: (value: string) => (
      <span className="block max-w-48 truncate font-medium text-gray-900" title={value}>
        {value}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: AttendanceStatus) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
          statusStyles[value] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {value ?? "-"}
      </span>
    ),
  },
  {
    key: "department",
    header: "Department",
    render: (value: string) => <span className="text-sm text-gray-700">{value ?? "-"}</span>,
  },
  {
    key: "checkIn",
    header: "Check In",
    render: (value: string) => <span className="text-sm text-gray-700">{value ?? "-"}</span>,
  },
  {
    key: "checkOut",
    header: "Check Out",
    render: (value: string) => <span className="text-sm text-gray-700">{value ?? "-"}</span>,
  },
  {
    key: "hoursWorked",
    header: "Hours",
    render: (value: string) => <span className="text-sm text-gray-700">{value ?? "-"}</span>,
  },
  {
    key: "actions",
    header: "Actions",
    render: (_value: unknown, row: AttendanceRow) => (
      <AttendanceRowActionsMenu
        onView={() => onView(row.id)}
        onEdit={onEdit ? () => onEdit(row.id) : undefined}
        onDelete={onDelete ? () => onDelete(row.id) : undefined}
        showEdit={showEdit}
        showDelete={showDelete}
      />
    ),
  },
];
