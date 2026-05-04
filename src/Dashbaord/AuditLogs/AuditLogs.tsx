import { useState, useMemo, useEffect } from "react";
import { ShieldAlert, Clock } from "lucide-react";
import { useFetchHook } from "../../Hooks/UseFetchHook";
import { toast } from "sonner";
import AuditSearch from "./component/AuditSearch";
import TableAudit from "./component/TableAudit";
import { AuditLogsResponse } from "./component/auditTypes";

const LIMIT = 20;

export const AuditLogs = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // 400ms delay for API calls
    return () => clearTimeout(timer);
  }, [search]);

  // Build query string using debounced search
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (actionFilter) params.set("action", actionFilter);
    if (entityFilter) params.set("entity_type", entityFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    return params.toString();
  }, [page, debouncedSearch, actionFilter, entityFilter, statusFilter, fromDate, toDate]);

  const {
    data: response,
    isLoading,
    isError,
  } = useFetchHook<AuditLogsResponse>(
    `/audit-logs?${queryParams}`,
    `audit-logs-${queryParams}`,
  );

  // Optimistic/Local search: Filter current logs instantly while waiting for API
  const displayLogs = useMemo(() => {
    if (!response?.data) return [];
    if (!search || search === debouncedSearch) return response.data;
    
    const s = search.toLowerCase();
    return response.data.filter(log => 
      log.entity_name?.toLowerCase().includes(s) ||
      log.user?.full_name.toLowerCase().includes(s) ||
      log.action.toLowerCase().includes(s) ||
      log.entity_type?.toLowerCase().includes(s)
    );
  }, [response?.data, search, debouncedSearch]);

  const total = response?.total ?? 0;
  const totalPages = response?.totalPages ?? 1;

  const handleReset = () => {
    setSearch("");
    setActionFilter("");
    setEntityFilter("");
    setStatusFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleActionChange = (v: string) => {
    setActionFilter(v);
    setPage(1);
  };
  const handleEntityChange = (v: string) => {
    setEntityFilter(v);
    setPage(1);
  };
  const handleStatusChange = (v: string) => {
    setStatusFilter(v);
    setPage(1);
  };
  const handleFromChange = (v: string) => {
    setFromDate(v);
    setPage(1);
  };
  const handleToChange = (v: string) => {
    setToDate(v);
    setPage(1);
  };

  if (isError) toast.error("Failed to load audit logs");

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="text-indigo-600" size={28} />
            Audit Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete trail of all system actions — authentication events and
            data mutations
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={16} className="text-indigo-400" />
          <span>
            <strong className="text-gray-800">{total.toLocaleString()}</strong>{" "}
            total events
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <AuditSearch
        search={search}
        onSearchChange={handleSearchChange}
        actionFilter={actionFilter}
        onActionChange={handleActionChange}
        entityFilter={entityFilter}
        onEntityChange={handleEntityChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        fromDate={fromDate}
        onFromChange={handleFromChange}
        toDate={toDate}
        onToChange={handleToChange}
        onReset={handleReset}
      />

      {/* Table */}
      <TableAudit
        logs={displayLogs}
        isLoading={isLoading && !displayLogs.length} // Only show loader if we have NO data to show
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AuditLogs;
