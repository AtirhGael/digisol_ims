import { useState } from "react";
import { Eye, X, ShieldAlert } from "lucide-react";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import {
  AuditLog,
  getActionBadge,
  getStatusBadge,
  formatDate,
  SYSTEM_MODULES,
} from "./auditTypes";

// ─── JSON Viewer ──────────────────────────────────────────────────────────────
const JsonViewer = ({
  label,
  data,
}: {
  label: string;
  data: object | null;
}) => {
  if (!data) return null;
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto max-h-48 text-gray-800 whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({
  log,
  onClose,
}: {
  log: AuditLog;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
        <div className="flex items-center gap-3">
          <ShieldAlert size={20} className="text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-800">Audit Log Detail</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Action</p>
            <div className="mt-1">{getActionBadge(log.action)}</div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Status</p>
            <div className="mt-1">{getStatusBadge(log.status)}</div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Timestamp</p>
            <p className="mt-1 text-sm font-medium text-gray-700">{formatDate(log.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Module</p>
            <p className="mt-1 text-sm font-medium text-gray-700">
              {SYSTEM_MODULES.find((m) => m.value === log.entity_type)?.label ?? log.entity_type ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Entity Name</p>
            <p className="mt-1 text-sm font-medium text-gray-700 break-words">{log.entity_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Entity ID</p>
            <p className="mt-1 text-xs font-mono text-gray-500 break-all">{log.entity_id ?? "—"}</p>
          </div>
        </div>

        {/* Actor */}
        {log.user && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Performed By</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {log.user.full_name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{log.user.full_name}</p>
                <p className="text-xs text-gray-500">
                  {log.user.email}
                  {log.user.role && <span className="ml-2 text-indigo-500">· {log.user.role}</span>}
                  {log.user.department && <span className="ml-2 text-gray-400">· {log.user.department}</span>}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {log.error_message && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Error Details</p>
            <p className="text-sm text-red-700">{log.error_message}</p>
          </div>
        )}

        {/* Before / After */}
        {(log.before_value || log.after_value) && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Changes</p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <JsonViewer label="Before" data={log.before_value} />
              <JsonViewer label="After" data={log.after_value} />
            </div>
          </div>
        )}

        {/* Technical */}
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Technical Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400 font-medium">Log ID: </span>
              <span className="font-mono text-gray-600 break-all">{log.log_id}</span>
            </div>
            {log.trace_id && (
              <div>
                <span className="text-gray-400 font-medium">Trace ID: </span>
                <span className="font-mono text-gray-600 break-all">{log.trace_id}</span>
              </div>
            )}
            {log.ip_address && (
              <div>
                <span className="text-gray-400 font-medium">IP: </span>
                <span className="font-mono text-gray-600">{log.ip_address}</span>
              </div>
            )}
            {log.user_agent && (
              <div className="sm:col-span-2">
                <span className="text-gray-400 font-medium">User Agent: </span>
                <span className="text-gray-600 break-all">{log.user_agent}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── TableAudit ───────────────────────────────────────────────────────────────
interface TableAuditProps {
  logs: AuditLog[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

const TableAudit = ({
  logs,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: TableAuditProps) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Map logs to flat rows for ReusableTable
  const tableData = logs.map((log) => ({
    // raw ref kept for modal
    _raw: log,
    // display fields
    timestamp: formatDate(log.created_at, false),
    action: log.action,
    module: log.entity_type ?? "—",
    entity: log.entity_name ?? "—",
    performed_by: log.user
      ? { name: log.user.full_name, sub: log.user.role ?? log.user.email }
      : null,
    status: log.status,
    _log_id: log.log_id,
  }));

  const columns = [
    {
      key: "timestamp",
      header: "Timestamp",
      truncate: false,
      render: (_: any, row: any) => (
        <span className="font-mono text-xs text-gray-500">{row.timestamp}</span>
      ),
    },
    {
      key: "action",
      header: "Action",
      truncate: false,
      render: (_: any, row: any) => getActionBadge(row.action),
    },
    {
      key: "module",
      header: "Module",
      truncate: true,
      cellClassName: "w-[140px] md:w-[160px]",
      render: (_: any, row: any) => (
        <span className="text-gray-600 text-sm truncate block">
          {SYSTEM_MODULES.find((m) => m.value === row.module)?.label ?? row.module}
        </span>
      ),
    },
    {
      key: "entity",
      header: "Entity",
      truncate: true,
      cellClassName: "w-[120px] md:w-[180px]",
      render: (_: any, row: any) => (
        <span className="font-medium text-gray-800 text-sm truncate block">{row.entity}</span>
      ),
    },
    {
      key: "performed_by",
      header: "Performed By",
      truncate: true,
      cellClassName: "w-[150px] md:w-[200px]",
      render: (_: any, row: any) =>
        row.performed_by ? (
          <div className="truncate">
            <p className="font-medium text-gray-800 text-sm truncate">
              {row.performed_by.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {row.performed_by.sub}
            </p>
          </div>
        ) : (
          <span className="text-gray-400 text-xs italic">System / Unknown</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      truncate: false,
      render: (_: any, row: any) => getStatusBadge(row.status),
    },
    {
      key: "_log_id",
      header: "",
      truncate: false,
      cellClassName: "w-10",
      render: (_: any, row: any) => (
        <button
          id={`audit-detail-${row._log_id}`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(row._raw);
          }}
          className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-500 cursor-pointer opacity-0 group-hover:opacity-100 transition"
          title="View details"
        >
          <Eye size={15} />
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <ReusableTable
          columns={columns}
          data={tableData}
          showToolbar={false}
          showHeading={false}
          showSearch={false}
          showFilter={false}
          serverPagination
          totalPages={totalPages}
          externalCurrentPage={page}
          onPageChange={onPageChange}
          onRowClick={(row) => setSelectedLog(row._raw)}
        />

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          </div>
        )}

        {!isLoading && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <ShieldAlert size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">No audit logs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {selectedLog && (
        <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </>
  );
};

export default TableAudit;
