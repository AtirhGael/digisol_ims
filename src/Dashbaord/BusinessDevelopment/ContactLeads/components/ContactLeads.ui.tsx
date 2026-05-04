import React, { useEffect, useRef, useState } from "react";
import { LuEllipsisVertical, LuEye, LuPencil, LuTrash2 } from "react-icons/lu";
import { Button } from "../../../../components/ui/button";
import type { InterestLevel } from "../types";

const interestBadgeClass = (level: InterestLevel): string => ({
  "High": "bg-green-100 text-green-700",
  "Medium": "bg-amber-100 text-amber-600",
  "Low": "bg-blue-100  text-blue-600",
  "Lead": "bg-purple-100 text-purple-700",
}[level] || "bg-gray-100 text-gray-500");

const interestListBadgeClass = (level: InterestLevel): string => ({
  "High": "bg-green-50 text-green-700 border border-green-200",
  "Medium": "bg-amber-50 text-amber-600 border border-amber-200",
  "Low": "bg-blue-50  text-blue-600  border border-blue-200",
  "Lead": "bg-purple-50 text-purple-700 border border-purple-200",
}[level] || "bg-gray-50 text-gray-200 border border-gray-200");

export const thClass = "px-4 py-3 text-left text-xs font-semibold text-slate-700 bg-gray-50 border-b border-gray-100 whitespace-nowrap truncate";
export const tdClass = "px-4 py-3 text-[13.5px] text-slate-900 border-b border-gray-50 align-middle";
export const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white placeholder:text-gray-300 transition-all";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

const interestLabelMap: Record<InterestLevel, string> = {
  "High": "High",
  "Medium": "Medium",
  "Low": "Low",
  "Lead": "Lead",
};

export function InterestBadge({ level, small }: { level: InterestLevel; small?: boolean }) {
  return (
    <span className={`${small ? interestListBadgeClass(level) : interestBadgeClass(level)} inline-flex w-fit text-xs font-semibold px-2.5 py-0.5 rounded-md whitespace-nowrap`}>
      {interestLabelMap[level]}
    </span>
  );
}

export function RowActionsMenu({ onView, onEdit, onDelete }: { onView: () => void; onEdit: () => void; onDelete: () => void }) {
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
          className="text-gray-400 hover:bg-gray-200 cursor-pointer h-8 w-8"
          onClick={() => setOpen((prev) => !prev)}
        >
          <LuEllipsisVertical className="text-base" />
        </Button>
      </div>
      {open && (
        <div
          className="fixed z-1000 w-36 rounded-md border border-gray-200 bg-white py-1 px-1 "
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center gap-2.5"
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <LuEye className="text-base" />
            <span>View</span>
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center gap-2.5"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <LuPencil className="text-base" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center gap-2.5"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <LuTrash2 className="text-base" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
      className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function SelectField({ value, onChange, children, disabled }: { value: string; onChange: (v: string) => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <div className="relative">
      <select className={`${selectCls} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>{children}</select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
    </div>
  );
}

export function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200  ${className}`}>{children}</div>;
}

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}

export function HDivider() {
  return <div className="border-t border-gray-100 my-3" />;
}

export function TablePanel({ title, search, onSearch, total, children, filterPanel, hasActiveFilter }: {
  title: string;
  search: string;
  onSearch: (v: string) => void;
  total: number;
  children: React.ReactNode;
  filterPanel?: React.ReactNode | ((closeFilters: () => void) => React.ReactNode);
  hasActiveFilter?: boolean;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showFilters) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showFilters]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 ">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center px-6 py-4 border-b border-gray-100">
        <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative" ref={filterRef}>
            <Button
              variant="outline"
              size="icon"
              className={`h-9 w-9 ${hasActiveFilter ? "border-blue-400 text-blue-600" : ""}`}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <FilterIcon />
            </Button>
            {showFilters && filterPanel && (
              <div className="absolute right-0 top-11 z-10 w-64 rounded-lg border border-gray-200 bg-white p-3 ">
                {typeof filterPanel === "function" ? filterPanel(() => setShowFilters(false)) : filterPanel}
              </div>
            )}
          </div>
          <div className="relative w-full sm:w-auto">
            <input className="border border-gray-200 rounded-lg py-1.5 pl-3 pr-8 text-sm outline-none w-full sm:w-44 bg-gray-50 text-gray-700 focus:border-blue-400"
              placeholder="Search..." value={search} onChange={(e) => onSearch(e.target.value)} />
            <SearchIcon />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">{children}</div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center px-6 py-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">Showing 1 to {total} of {total} entries</span>
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="default" size="sm">1</Button>
          <Button variant="default" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}

