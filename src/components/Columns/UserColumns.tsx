import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

// Type definitions
type UserRole = 'Admin' | 'Manager' | 'Employee' | 'HR';
type UserStatus = 'Active' | 'Suspended';

interface UserProps {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  avatar: string;
  createdOn: string;
}

// User Action Menu Component
function UserActionMenu({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

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
    <div className="relative" ref={menuRef}>
      <div ref={triggerRef}>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-gray-600 h-8 w-8"
          onClick={() => setOpen((prev) => !prev)}
        >
          <MoreVertical className="text-base" />
        </Button>
      </div>
      {open && (
        <div
          className="fixed z-1000 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-sm"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <Eye className="text-base" />
            <span>View</span>
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <Pencil className="text-base" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-red-500 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="text-base" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Create columns for the users table
export const createUsersColumns = ({
  onViewUser,
  onEditUser,
  onDeleteUser,
}: {
  onViewUser: (id: string) => void;
  onEditUser: (id: string) => void;
  onDeleteUser: (id: string) => void;
}) => [
  {
    key: 'avatar',
    header: 'Image',
    render: (value: string, row: UserProps) => (
      <img 
        src={value} 
        alt={row.name}
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />
    ),
  },
  {
    key: 'name',
    header: 'Name',
    render: (value: string, row: UserProps) => (
      <div className="min-w-0 max-w-48">
        <div className="font-medium text-gray-900 truncate" title={value}>{value}</div>
        <div className="text-sm text-gray-500 truncate" title={row.email}>{row.email}</div>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    render: (value: UserRole) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Admin' ? 'bg-red-100 text-red-800' :
        value === 'Manager' ? 'bg-blue-100 text-blue-800' :
        value === 'HR' ? 'bg-purple-100 text-purple-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    ),
  },
  {
    key: 'department',
    header: 'Department',
    render: (value: string) => <span className="text-gray-700">{value}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (value: UserStatus) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Active' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    ),
  },
  {
    key: 'createdOn',
    header: 'Created On',
    render: (value: string) => <span className="text-gray-500">{value}</span>,
  },
  {
    key: 'id',
    header: 'Actions',
    render: (_value: string, row: UserProps) => (
      <UserActionMenu
        onView={() => onViewUser(row.id)}
        onEdit={() => onEditUser(row.id)}
        onDelete={() => onDeleteUser(row.id)}
      />
    ),
  },
];