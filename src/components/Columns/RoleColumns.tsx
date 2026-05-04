import React, { useState, useEffect, useRef } from "react";
import { 
  FaEllipsisVertical, 
  FaEye, 
  FaPenToSquare, 
  FaTrash, 
  FaUserShield, 
  FaUsers, 
  FaKey, 
  FaShield
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";

// Types
export interface Permission {
  permission_id: string;
  permission_name: string;
  permission_code: string;
  module: string;
  action: string;
  description?: string;
  department_id?: string;
  created_at?: string;
}

export interface Role {
  role_id: string;
  role_name: string;
  role_code: string;
  description?: string;
  is_system_role?: boolean;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  user_count?: number;
  permission_count?: number;
  permissions?: Permission[];
}

interface ActionMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  tone?: "danger";
  disabled?: boolean;
}

const ActionMenu = ({ items }: { items: ActionMenuItem[] }) => {
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
      left: rect.right - 156,
    });
  };

  useEffect(() => {
    if (open) updateMenuPosition();
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
    <div className="relative" ref={menuRef}>
      <div ref={triggerRef}>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-gray-600 h-8 w-8"
          onClick={() => setOpen((prev) => !prev)}
        >
          <FaEllipsisVertical className="text-base" />
        </Button>
      </div>
      {open && (
        <div
          className="fixed z-[1000] w-40 rounded-md border border-gray-200 bg-white py-1 shadow-sm"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              className={`w-full px-4 py-2 text-left text-sm bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50 ${
                item.tone === "danger" ? "text-red-500" : "text-gray-700"
              } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => {
                if (item.disabled) return;
                setOpen(false);
                item.onClick();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const getRoleColumns = (
  openViewModal: (role: Role) => void,
  openEditModal: (role: Role) => void,
  requestDeleteRole: (role: Role) => void
) => [
  {
    key: "role_name",
    header: "Role",
    render: (value: string, row: Role) => (
      <div className="min-w-0 flex gap-2">
        <div className="flex items-center gap-2 font-medium text-gray-900">
          {row.is_system_role && (
            <FaShield className="text-orange-500 text-lg" />
          )}
        </div>
        <div className="text-md text-gray-500 truncate">
          {row.role_name || "No description"}
        </div>
      </div>
    ),
  },
  {
    key: "role_code",
    header: "Code",
    render: (value: string) => (
      <span className="bg-green-50 text-green-500 px-2 py-1 rounded-full text-md font-mono">
        {value}
      </span>
    ),
  },
  {
    key: "user_count",
    header: "Users",
    render: (value: number) => (
      <div className="flex items-center">
        <div className="flex items-center gap-2 px-3 bg-blue-50 py-1 rounded-full">
          <FaUsers className="text-blue-500 text-md" />
          <span className="text-md font-semibold text-blue-500">{value || 0}</span>
        </div>
      </div>
    ),
  },
  {
    key: "permissions",
    header: "Permissions",
    render: (_value: Permission[] | undefined, row: Role) => {
      const count = Array.isArray(row.permissions)
        ? row.permissions.length
        : row.permission_count || 0;
      return (
        <div className="flex items-center">
          <div className="flex items-center gap-2 px-3 bg-red-50 py-1 rounded-full">
            <FaKey className="text-red-500 text-md" />
            <span className="text-md font-semibold text-red-500">{count}</span>
          </div>
        </div>
      );
    },
  },
  {
    key: "role_id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: Role) => (
      <ActionMenu
        items={[
          {
            label: "View",
            icon: <FaEye className="text-base" />,
            onClick: () => openViewModal(row),
          },
          {
            label: "Edit",
            icon: <FaPenToSquare className="text-base" />,
            onClick: () => openEditModal(row),
            disabled: row.is_system_role,
          },
          {
            label: "Delete",
            icon: <FaTrash className="text-base" />,
            onClick: () => requestDeleteRole(row),
            tone: "danger",
            disabled: row.is_system_role,
          },
        ]}
      />
    ),
  },
];
