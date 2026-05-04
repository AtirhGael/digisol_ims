import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Eye, Edit, Trash2, Calendar, ArrowRight, Clock3 } from 'lucide-react'
import { Button } from '../ui/button'

interface Contract {
  id: string
  key: string
  contractTitle?: string
  selectedProposal?: string
  clientName?: string
  clientContacts?: string[]
  startDate?: string
  endDate?: string
  startDateISO?: string | null
  endDateISO?: string | null
  durationDays?: number | null
  contractValue?: number
  currency?: string
  status?: string
  renewalType?: string
  billingCycle?: string
  nextBilling?: string
  services?: string[]
  dateCreated?: string
  description?: string
}

interface ContractsColumnProps {
  onViewContract: (id: string) => void
  onEditContract: (id: string) => void
  onDeleteContract: (id: string) => void
}

const ContractRowActionsMenu = ({ 
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

export const createContractsColumns = ({
  onViewContract,
  onEditContract,
  onDeleteContract,
}: ContractsColumnProps) => [
  {
    key: 'contractTitle',
    header: 'Contract',
    render: (value: string, contract: Contract) => (
      <div className="flex flex-col max-w-48">
        <span className="font-medium text-gray-900 truncate" title={contract.contractTitle}>
          {contract.contractTitle}
        </span>
        <span className="text-sm text-gray-500 truncate" title={contract.selectedProposal}>
          {contract.selectedProposal}
        </span>
      </div>
    ),
  },
  {
    key: 'clientContacts',
    header: 'Contacts',
    render: (value: string[] | undefined, contract: Contract) => {
      const contacts = Array.isArray(contract.clientContacts)
        ? contract.clientContacts.filter(Boolean)
        : [];
      return (
        <div className="max-w-64">
          <span className="text-sm text-gray-700 break-words">
            {contacts.length ? contacts.join(", ") : "N/A"}
          </span>
        </div>
      );
    },
  },
  {
    key: 'contractValue',
    header: 'Value',
    render: (value: number | undefined, contract: Contract) => (
      <div className="text-left">
        <span className="font-medium text-gray-900">
          {contract.currency || 'XAF'} {value?.toLocaleString() || '0'}
        </span>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (status: string | undefined) => {
      const getStatusColor = (s: string) => {
        switch (s?.toUpperCase()) {
          case "ACTIVE":
          case "SIGNED":
            return "bg-green-100 text-green-800"
          case "PENDING":
            return "bg-yellow-100 text-yellow-800"
          case "DRAFT":
            return "bg-gray-100 text-gray-800"
          case "EXPIRED":
          case "TERMINATED":
            return "bg-red-100 text-red-800"
          default:
            return "bg-gray-100 text-gray-800"
        }
      }
      return (
        <span 
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status || '')}`}
        >
          {status || 'N/A'}
        </span>
      )
    },
  },
  {
    key: 'startDate',
    header: 'Duration',
    render: (value: string, contract: Contract) => (
      <div className="max-w-48 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 mb-1">
          <Calendar className="h-3.5 w-3.5" />
          <span className="truncate" title={`${contract.startDate} to ${contract.endDate}`}>
            {contract.startDate}
          </span>
          <ArrowRight className="h-3 w-3 shrink-0" />
          <span className="truncate">{contract.endDate}</span>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
          <Clock3 className="h-3 w-3" />
          {contract.durationDays ? `${contract.durationDays} days` : 'Duration N/A'}
        </div>
      </div>
    ),
  },
  {
    key: 'id',
    header: 'Actions',
    render: (value: any, contract: Contract) => (
      <ContractRowActionsMenu
        onView={() => onViewContract(contract.id)}
        onEdit={() => onEditContract(contract.id)}
        onDelete={() => onDeleteContract(contract.id)}
      />
    ),
  },
]
