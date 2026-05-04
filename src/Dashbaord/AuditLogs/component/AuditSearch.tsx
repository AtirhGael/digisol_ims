import { Search, Filter } from "lucide-react";
import { ACTION_CONFIG, MODULE_FILTER_OPTIONS } from "./auditTypes";

interface AuditSearchProps {
  search: string;
  onSearchChange: (v: string) => void;
  actionFilter: string;
  onActionChange: (v: string) => void;
  entityFilter: string;
  onEntityChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  fromDate: string;
  onFromChange: (v: string) => void;
  toDate: string;
  onToChange: (v: string) => void;
  onReset: () => void;
}

const AuditSearch = ({
  search,
  onSearchChange,
  actionFilter,
  onActionChange,
  entityFilter,
  onEntityChange,
  statusFilter,
  onStatusChange,
  fromDate,
  onFromChange,
  toDate,
  onToChange,
  onReset,
}: AuditSearchProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:flex xl:flex-wrap gap-4 items-end">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-2 xl:flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Search
          </label>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              id="audit-search-input"
              type="text"
              placeholder="Name, entity, user..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
            />
          </div>
        </div>

        {/* Action */}
        <div className="min-w-[140px]">
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Action
          </label>
          <select
            id="audit-action-filter"
            value={actionFilter}
            onChange={(e) => onActionChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none transition bg-white"
          >
            <option value="">All Actions</option>
            {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>

        {/* Module */}
        <div className="min-w-[160px]">
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Module
          </label>
          <select
            id="audit-module-filter"
            value={entityFilter}
            onChange={(e) => onEntityChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none transition bg-white"
          >
            <option value="">All Modules</option>
            {MODULE_FILTER_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="min-w-[120px]">
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Status
          </label>
          <select
            id="audit-status-filter"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none transition bg-white"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
          </select>
        </div>

        {/* From Date */}
        <div className="min-w-[140px]">
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            From
          </label>
          <input
            id="audit-from-date"
            type="date"
            value={fromDate}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none transition"
          />
        </div>

        {/* To Date */}
        <div className="min-w-[140px]">
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            To
          </label>
          <input
            id="audit-to-date"
            type="date"
            value={toDate}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none transition"
          />
        </div>

        {/* Reset */}
        <div className="flex justify-end xl:w-auto">
          <button
            id="audit-reset-filters"
            onClick={onReset}
            className="w-full xl:w-auto flex items-center justify-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            <Filter size={14} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditSearch;
