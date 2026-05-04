import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Eye, Trash2 } from 'lucide-react'
import type { Department } from '../../Dashbaord/HumanResource/Departments/types'

interface DepartmentColumnProps {
  onViewDepartment: (department: Department) => void
  onDeleteDepartment: (departmentId: string) => void
}

const DepartmentRowActionsMenu = ({ 
  onView, 
  onDelete
}: { 
  onView: () => void
  onDelete: () => void
}) => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  const updateMenuPosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMenuPos({
      top: rect.bottom + 6,
      left: rect.right - 144,
    })
  }

  useEffect(() => {
    if (open) {
      updateMenuPosition()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    const handleReposition = () => updateMenuPosition()
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("scroll", handleReposition, true)
    window.addEventListener("resize", handleReposition)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleReposition, true)
      window.removeEventListener("resize", handleReposition)
    }
  }, [open])

  return (
    <div className="relative" style={{ zIndex: open ? 1000 : 1 }}>
      <div
        ref={triggerRef}
        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 cursor-pointer"
        onClick={() => setOpen(!open)}
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
            className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50" 
            onClick={() => { setOpen(false); onView(); }}
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          <button 
            type="button" 
            className="w-full px-4 py-2 text-left text-sm text-red-500 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50" 
            onClick={() => { setOpen(false); onDelete(); }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}

export const createDepartmentColumns = ({
  onViewDepartment,
  onDeleteDepartment,
}: DepartmentColumnProps) => {
  
  const getManagerName = (department: Department): string => {
    if (department.department_head) {
      return `${department.department_head.first_name} ${department.department_head.last_name}`;
    }
    return "Not assigned";
  };

  return [
    {
      key: "name",
      header: "Department Name",
      render: (value: string) => (
        <span className="font-medium text-gray-900 max-w-48 truncate block" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: "code",
      header: "Code",
      render: (value: string) => (
        <span className="text-sm text-gray-700">{value || "—"}</span>
      ),
    },
    {
      key: "department_head",
      header: "Lead",
      render: (_: any, row: Department) => (
        <span className="text-sm text-gray-700">{getManagerName(row)}</span>
      ),
    },
    {
      key: "staff_count",
      header: "Staff",
      render: (value: number) => (
        <span className="text-sm text-gray-700">{value || 0}</span>
      ),
    },
    {
      key: "sub_departments_count",
      header: "Sub-depts",
      render: (value: number) => (
        <span className="text-sm text-gray-700">{value || 0}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap capitalize ${
          value === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value?.toLowerCase() || 'unknown'}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: any, row: Department) => (
        <DepartmentRowActionsMenu
          onView={() => onViewDepartment(row)}
          onDelete={() => onDeleteDepartment(row.department_id)}
        />
      ),
    },
  ];
};