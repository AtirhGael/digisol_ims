import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Eye, Edit, Trash2, Download } from 'lucide-react'
import { Button } from '../ui/button'
import { Memorandum } from '../../Dashbaord/BusinessDevelopment/ProposalContracts/Memorandum/Memorandum.types'

// Column actions props
interface MemorandumColumnProps {
  onViewMemorandum: (id: string) => void
  onEditMemorandum: (id: string) => void
  onDeleteMemorandum: (id: string) => void
  onDownloadMemorandum: (id: string) => void
}

// Action dropdown component similar to ProposalRowActionsMenu and ContractRowActionsMenu
const MemorandumRowActionsMenu = ({ 
  onView, 
  onEdit, 
  onDelete
}: { 
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) => {
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
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
      {open && (
        <div
          className="fixed z-1000 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-sm"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button type="button" className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50" onClick={() => { setOpen(false); onView(); }}>
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          <button type="button" className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50" onClick={() => { setOpen(false); onEdit(); }}>
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button type="button" className="w-full px-4 py-2 text-left text-sm text-red-500 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50" onClick={() => { setOpen(false); onDelete(); }}>
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Column definitions for memorandum
export const createMemorandumColumns = ({
  onViewMemorandum,
  onEditMemorandum,
  onDeleteMemorandum,
}: MemorandumColumnProps) => [
  {
    key: 'thirdPartyName',
    header: 'Third Party Partner',
    render: (value: string, memorandum: Memorandum) => (
      <div className="flex flex-col">
        <span className="font-bold text-gray-900 leading-tight">
          {memorandum.thirdPartyName}
        </span>
        <span className="text-xs text-primary font-medium mt-0.5">
          {memorandum.thirdPartyNameLocal || 'MOU Partner'}
        </span>
        {memorandum.contractTitle && (
          <span className="text-[10px] text-gray-400 italic">
            Ref: {memorandum.contractTitle}
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (status: string) => {
      const getStatusColor = (status: string) => {
        switch (status) {
          case "ACCEPTED":
            return "bg-green-100 text-green-800"
          case "PENDING":
            return "bg-yellow-100 text-yellow-800"
          case "REJECTED":
            return "bg-red-100 text-red-800"
          default:
            return "bg-gray-100 text-gray-800"
        }
      }
      return (
        <span 
          className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${getStatusColor(status)}`}
        >
          {status}
        </span>
      )
    },
  },
  {
    key: 'dateCreated',
    header: 'Dates',
    render: (value: string, memorandum: Memorandum) => (
      <div className="text-[11px] text-gray-600 space-y-0.5">
        <div className="flex items-center gap-1">
          <span className="text-gray-400">Created:</span>
          <span className="font-medium">{memorandum.dateCreated}</span>
        </div>
        {memorandum.signedAt && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Signed:</span>
            <span className="font-medium">{new Date(memorandum.signedAt).toLocaleDateString("en-GB")}</span>
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'percentage_gain',
    header: 'Percentage Split',
    render: (value: string, memorandum: Memorandum) => (
      <div className="flex flex-col text-[10px] w-20 py-1">
        <div className="flex justify-between items-center gap-2">
          <span className="text-gray-400 font-medium">TP:</span>
          <span className="font-bold text-[#32CD32]">{memorandum.thirdPartyPercentageGain}%</span>
        </div>
        <div className="flex justify-between items-center gap-2 border-t border-gray-100 mt-1 pt-1">
          <span className="text-gray-400 font-medium">DG:</span>
          <span className="font-bold text-primary">{memorandum.digisolPercentageGain}%</span>
        </div>
      </div>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (value: any, memorandum: Memorandum) => (
      <MemorandumRowActionsMenu
        onView={() => onViewMemorandum(memorandum.id)}
        onEdit={() => onEditMemorandum(memorandum.id)}
        onDelete={() => onDeleteMemorandum(memorandum.id)}
      />
    ),
  },
]
