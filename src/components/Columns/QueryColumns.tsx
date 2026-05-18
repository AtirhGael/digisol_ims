import React, { useEffect, useRef, useState } from "react";
import { Eye, MoreVertical, Trash2 } from "lucide-react";

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
  onView,
  onDelete,
}: {
  onView: () => void;
  onDelete: () => void;
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
            className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </button>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
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
    : "-";

export const createQueryColumns = ({
  onView,
  onDelete,
}: {
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}) => [
  {

    key: "submittedDate",
    header: "Submitted Date",
    render: (value: string) => (
      <span className="whitespace-nowrap text-sm text-gray-700">{formatDate(value)}</span>
    ),
  },
  {
    key: "employee",
    header: "Employee",
    render: (value: string) => (
      <span className="whitespace-nowrap text-sm text-gray-900">{value ?? "-"}</span>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (value: string) => (
      <span className="whitespace-nowrap text-sm text-gray-700">{value ?? "-"}</span>
    ),
  },
  {
    key: "title",
    header: "Subject",
    render: (value: string) => (
      <span className="text-sm text-gray-800 font-medium line-clamp-1 max-w-200px block">{value ?? "-"}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: string) => (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
          statusStyles[value?.toLowerCase()] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {value ?? "-"}
      </span>
    ),
  },
  {
    key: "priority",
    header: "Priority",
    render: (value: string) => (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
          priorityStyles[value?.toLowerCase()] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {value ?? "-"}
      </span>
    ),
  },
  {
    key: "assignedTo",
    header: "Assigned To",
    render: (value: string) => (
      <span className="whitespace-nowrap text-sm text-gray-700">{value ?? "-"}</span>
    ),
  },
  {
    key: "lastUpdated",
    header: "Last Updated",
    render: (value: string) => (
      <span className="whitespace-nowrap text-sm text-gray-700">{formatDate(value)}</span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: { id: string }) => (
      <QueryActionMenu
        onView={() => onView(row.id)}
        onDelete={() => onDelete(row.id)}
      />
    ),
  },
];
