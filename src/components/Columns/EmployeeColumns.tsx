import React, { useEffect, useRef, useState } from "react";
import { Eye, MoreVertical, Pencil, Trash2, UserCheck, LogOut } from "lucide-react";
import { FaEllipsisVertical } from "react-icons/fa6";

type EmployeeStatus = "Active" | "On Leave";

interface EmployeeRow {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  hireDate: string;
}

function EmployeeActionMenu({
  onView,
  onEdit,
  onDelete,
  onConvert,
  onOffboard,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onConvert?: () => void;
  onOffboard?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

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
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
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
        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <MoreVertical className="w-4 h-4" />
      </div>
      {open && (
        <div
          ref={menuRef}
          className="fixed z-1000 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-sm"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <Eye size={15} />
            View
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <Pencil size={15} />
            Edit
          </button>
          {onConvert && (
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-blue-600 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
              onClick={() => { setOpen(false); onConvert(); }}
            >
              <UserCheck size={15} />
              Convert
            </button>
          )}
          {onOffboard && (
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-orange-600 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
              onClick={() => { setOpen(false); onOffboard(); }}
            >
              <LogOut size={15} />
              Offboard
            </button>
          )}
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-red-500 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export const createEmployeeColumns = ({
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onConvertEmployee,
  onOffboardEmployee,
}: {
  onViewEmployee: (id: string) => void;
  onEditEmployee: (id: string) => void;
  onDeleteEmployee: (id: string) => void;
  onConvertEmployee?: (id: string) => void;
  onOffboardEmployee?: (id: string) => void;
}) => [
  {
    key: "name",
    header: "Employee Name",
    render: (value: string) => (
      <span className="text-sm font-medium text-gray-900 block truncate">{value}</span>
    ),
  },
  {
    key: "department",
    header: "Department",
    render: (value: string) => (
      <span className="text-sm text-gray-700 block truncate">{value}</span>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (value: string) => (
      <span className="text-sm text-gray-700 block truncate">{value}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: EmployeeStatus) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "Active"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {value}
      </span>
    ),
  },
  {
    key: "hireDate",
    header: "Hire Date",
    render: (value: string) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">{value}</span>
    ),
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: EmployeeRow) => (
      <EmployeeActionMenu
        onView={() => onViewEmployee(row.id)}
        onEdit={() => onEditEmployee(row.id)}
        onDelete={() => onDeleteEmployee(row.id)}
        onConvert={onConvertEmployee ? () => onConvertEmployee(row.id) : undefined}
        onOffboard={onOffboardEmployee ? () => onOffboardEmployee(row.id) : undefined}
      />
    ),
  },
];
