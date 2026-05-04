import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Eye, Edit, Trash2, CheckCircle } from 'lucide-react'
import type { ProspectionPlan } from '../../Dashbaord/BusinessDevelopment/ProspectPlanning/prospectionMockData'

interface ProspectionColumnProps {
  onViewProspection: (prospection: ProspectionPlan) => void
  onEditProspection: (prospection: ProspectionPlan) => void
  onDeleteProspection: (prospection: ProspectionPlan) => void
  onApproveProspection: (prospection: ProspectionPlan) => void
}

const ProspectionRowActionsMenu = ({ 
  onView, 
  onEdit, 
  onDelete,
  onApprove,
  status
}: { 
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onApprove: () => void
  status: string
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
          {status === 'SUBMITTED' && (
            <button 
              type="button" 
              className="w-full px-4 py-2 text-left text-sm text-green-600 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50" 
              onClick={() => { setOpen(false); onApprove(); }}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </button>
          )}
          {(['DRAFT', 'SUBMITTED'].includes(status)) && (
            <button 
              type="button" 
              className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50" 
              onClick={() => { setOpen(false); onEdit(); }}
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
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

export const createProspectionColumns = ({
  onViewProspection,
  onEditProspection,
  onDeleteProspection,
  onApproveProspection,
}: ProspectionColumnProps) => [
  {
    key: 'title',
    header: 'Name',
    render: (value: string) => (
      <span className="font-medium text-gray-900 max-w-48 truncate block" title={value}>
        {value}
      </span>
    ),
  },
  {
    key: 'plannedStart',
    header: 'Start Date',
    render: (value: string) => (
      <span className="text-sm text-gray-700">{value}</span>
    ),
  },
  {
    key: 'plannedEnd',
    header: 'End Date',
    render: (value: string) => (
      <span className="text-sm text-gray-700">{value}</span>
    ),
  },
  {
    key: 'budgetAllocated',
    header: 'Budget',
    render: (value: number, prospection: ProspectionPlan) => {
      const formatBudget = (amount: number) => {
        if (amount >= 1000000) {
          return `${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
          return `${(amount / 1000).toFixed(0)}K`;
        } else {
          return amount.toString();
        }
      };
      
      return (
        <div className="text-sm text-gray-700">
          <span className="font-medium">{formatBudget(value)}</span>
          <span className="text-gray-400"> / </span>
          {prospection.budgetSpent === "-" ? (
            <span className="text-gray-400">–</span>
          ) : (
            <span>{typeof prospection.budgetSpent === 'number' ? formatBudget(prospection.budgetSpent) : prospection.budgetSpent}</span>
          )}
          <span className="text-gray-500 text-xs ml-1">XAF</span>
        </div>
      );
    },
  },
  {
    key: 'contactsCollected',
    header: 'Contacts',
    render: (value: number) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
          value > 0
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {value} contacts
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (value: string) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap capitalize ${
          value === "DRAFT"
            ? "bg-gray-100 text-gray-500"
            : value === "SUBMITTED" 
            ? "bg-blue-100 text-blue-800"
            : value === "PENDING"
            ? "bg-yellow-100 text-yellow-800"
            : value === "ACTIVE"
            ? "bg-green-100 text-green-800"
            : value === "COMPLETED"
            ? "bg-green-200 text-green-900"
            : value === "REJECTED"
            ? "bg-red-100 text-red-800"
            : value === "CANCELLED"
            ? "bg-gray-200 text-gray-700"
            : "bg-indigo-100 text-indigo-800"
        }`}
      >
        {value.replace("_", " ")}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (value: any, prospection: ProspectionPlan) => (
      <ProspectionRowActionsMenu
        onView={() => onViewProspection(prospection)}
        onEdit={() => onEditProspection(prospection)}
        onDelete={() => onDeleteProspection(prospection)}
        onApprove={() => onApproveProspection(prospection)}
        status={prospection.status}
      />
    ),
  },
]