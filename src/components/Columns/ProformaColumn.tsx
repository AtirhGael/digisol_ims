import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

type ProformaStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED";

interface ProformaRow {
  id: string;
  proformaTitle: string;
  proposalTitle: string;
  value: number;
  status: ProformaStatus;
  services: string[];
  dateAdded: string;
  description?: string;
}

const getStatusColor = (
  status: ProformaStatus,
): { text: string; dot: string; bg: string; label: string } => {
  switch (status) {
    case "APPROVED":
      return { text: "text-emerald-600", dot: "bg-emerald-500", bg: "bg-emerald-50", label: "APPROVED" };
    case "DRAFT":
      return { text: "text-gray-500", dot: "bg-gray-500", bg: "bg-gray-100", label: "DRAFT" };
    case "SENT":
      return { text: "text-blue-600", dot: "bg-blue-500", bg: "bg-blue-50", label: "SENT" };
    case "REJECTED":
      return { text: "text-red-500", dot: "bg-red-500", bg: "bg-red-50", label: "REJECTED" };
    default:
      return { text: "text-gray-600", dot: "bg-gray-500", bg: "bg-gray-100", label: status };
  }
};

const getValueColor = (value: number): string => {
  if (value >= 30000000) return "text-emerald-600 font-bold";
  if (value >= 15000000) return "text-blue-600 font-semibold";
  if (value >= 5000000) return "text-amber-600 font-medium";
  return "text-gray-600";
};

function ProformaRowActionsMenu({ 
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

export const createProformaColumns = ({
  onViewProforma,
  onEditProforma,
  onDeleteProforma,
}: {
  onViewProforma: (id: string) => void;
  onEditProforma: (id: string) => void;
  onDeleteProforma: (id: string) => void;
}) => [
  {
    key: "proformaTitle",
    header: "Proforma Title",
    render: (value: string, row: ProformaRow) => (
      <div className="block max-w-50">
        <span className="text-sm font-medium text-gray-900 block truncate">{value}</span>
        <span className="text-xs text-gray-500 block truncate">{row.proposalTitle}</span>
      </div>
    ),
  },
  {
    key: "value",
    header: "Value",
    render: (value: number) => (
      <span className={`text-sm whitespace-nowrap ${getValueColor(value)}`}>
        XAF {value.toLocaleString()}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: ProformaStatus) => {
      const statusStyle = getStatusColor(value);
      return (
        <span className={`inline-flex max-w-30 items-center justify-start gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide ${statusStyle.text} ${statusStyle.bg}`}>
          <span className="truncate text-left">{statusStyle.label}</span>
        </span>
      );
    },
  },
  {
    key: "services",
    header: "Services",
    render: (services: string[]) => (
      <div className="flex flex-col gap-1 max-w-40">
        {services.slice(0, 2).map((service, index) => (
          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md truncate">
            {service}
          </span>
        ))}
        {services.length > 2 && (
          <span className="text-xs text-gray-500 italic">+{services.length - 2} more</span>
        )}
      </div>
    ),
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
    render: (_value: string, row: ProformaRow) => (
      <ProformaRowActionsMenu
        onView={() => onViewProforma(row.id)}
        onEdit={() => onEditProforma(row.id)}
        onDelete={() => onDeleteProforma(row.id)}
      />
    ),
  },
];