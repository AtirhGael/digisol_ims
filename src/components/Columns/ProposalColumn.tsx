import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";

type ProposalStatus = "ACCEPTED" | "DRAFT" | "SENT" | "REJECTED" | "NEGOTIATION" | "PENDING";

interface ProposalRow {
  id: string;
  title: string;
  company: string;
  status: ProposalStatus;
  source: string;
  dateAdded: string;
  description?: string;
}

const getStatusColor = (
  status: ProposalStatus,
): { text: string; dot: string; bg: string; label: string } => {
  switch (status) {
    case "ACCEPTED":
      return { text: "text-emerald-600", dot: "bg-emerald-500", bg: "bg-emerald-50", label: "ACCEPTED" };
    case "DRAFT":
      return { text: "text-gray-500", dot: "bg-gray-500", bg: "bg-gray-100", label: "DRAFT" };
    case "PENDING":
      return { text: "text-yellow-600", dot: "bg-yellow-500", bg: "bg-yellow-50", label: "PENDING" };
    case "SENT":
      return { text: "text-sky-600", dot: "bg-sky-500", bg: "bg-sky-50", label: "SENT" };
    case "REJECTED":
      return { text: "text-red-500", dot: "bg-red-500", bg: "bg-red-50", label: "REJECTED" };
    case "NEGOTIATION":
      return { text: "text-amber-600", dot: "bg-amber-500", bg: "bg-amber-50", label: "NEGOTIATION" };
    default:
      return { text: "text-gray-600", dot: "bg-gray-500", bg: "bg-gray-100", label: status };
  }
};

function ProposalRowActionsMenu({ 
  onView, 
  onEdit, 
  onDelete 
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
          <button type="button" className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50" onClick={() => { setOpen(false); onView(); }}>
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          <button type="button" className="w-full px-4 py-2 text-left text-sm text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-2.5 hover:bg-gray-50" onClick={() => { setOpen(false); onEdit(); }}>
            <Pencil className="w-4 h-4" />
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

export const createProposalsColumns = ({
  onViewProposal,
  onEditProposal,
  onDeleteProposal,
}: {
  onViewProposal: (id: string) => void;
  onEditProposal: (id: string) => void;
  onDeleteProposal: (id: string) => void;
}) => [
  {
    key: "title",
    header: "Proposal Title",
    render: (value: string, row: ProposalRow) => (
      <div className="block max-w-50">
        <span className="text-sm font-medium text-gray-900 block truncate">{value}</span>
        <span className="text-xs text-gray-400 block truncate">{row.company}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: ProposalStatus) => {
      const statusStyle = getStatusColor(value);
      return (
        <span className={`inline-flex max-w-30 items-center justify-start gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide ${statusStyle.text} ${statusStyle.bg}`}>
          <span className="truncate text-left">{statusStyle.label}</span>
        </span>
      );
    },
  },
  {
    key: "dateAdded",
    header: "Date Added",
    render: (value: string) => (
      <span className="text-sm text-gray-500 whitespace-nowrap">{value}</span>
    ),
  },
  {
    key: "id",
    header: "Actions",
    render: (_value: string, row: ProposalRow) => (
      <ProposalRowActionsMenu
        onView={() => onViewProposal(row.id)}
        onEdit={() => onEditProposal(row.id)}
        onDelete={() => onDeleteProposal(row.id)}
      />
    ),
  },
];