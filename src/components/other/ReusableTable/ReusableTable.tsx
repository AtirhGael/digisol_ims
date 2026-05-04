import React, { useState } from "react";
import { Input } from "../../ui/input";
import { CustomSelect } from "../../ui/CustomSelect";

interface ReusableTableProps {
  columns: {
    key: string;
    header: string;
    render?: (value: any, row: any) => React.ReactNode;
    truncate?: boolean;
    cellClassName?: string;
  }[];
  data: any[];
  itemsPerPage?: number;
  filterOptions?: { key: string; value: string; label: string }[];
  filterKey?: string;
  searchKeys?: string[];
  heading?: string;
  showToolbar?: boolean;
  showHeading?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  totalPages?: number;
  externalCurrentPage?: number;
  onPageChange?: (page: number) => void;
  serverPagination?: boolean;
  onRowClick?: (row: any, event: React.MouseEvent<HTMLTableRowElement>) => void;
}

const ReusableTable = ({
  columns,
  data,
  itemsPerPage = 8,
  filterOptions,
  filterKey,
  searchKeys,
  heading,
  showToolbar = true,
  showHeading = true,
  showSearch = true,
  showFilter = true,
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  totalPages: externalTotalPages,
  externalCurrentPage,
  onPageChange,
  serverPagination = false,
  onRowClick,
}: ReusableTableProps) => {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalSelectedFilter, setInternalSelectedFilter] = useState("");

  const effectiveSearchTerm = searchTerm ?? internalSearchTerm;
  const effectiveSelectedFilter = selectedFilter ?? internalSelectedFilter;
  const currentPage = externalCurrentPage ?? internalCurrentPage;

  // Determine if client-side filters are active (for server pagination)
  const hasClientFilters = Boolean(effectiveSearchTerm || effectiveSelectedFilter);

  // Filter and Search Logic
  const filteredData = data.filter((row) => {
    // Search filter
    const matchesSearch = searchKeys
      ? searchKeys.some((key) =>
          row[key]?.toString().toLowerCase().includes(effectiveSearchTerm.toLowerCase()),
        )
      : Object.values(row).some((value) =>
          value?.toString().toLowerCase().includes(effectiveSearchTerm.toLowerCase()),
        );

    // Status/Category filter
    const matchesFilter =
      effectiveSelectedFilter === "" ||
      effectiveSelectedFilter === "All" ||
      (filterKey &&
        row[filterKey]?.toString().toLowerCase() ===
          effectiveSelectedFilter.toLowerCase());

    return (!effectiveSearchTerm || matchesSearch) && matchesFilter;
  });

  const computedTotalPages = serverPagination
    ? (hasClientFilters ? 1 : (externalTotalPages ?? 1))
    : Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const totalPages = computedTotalPages;

  // Pagination Calculations
  const startIndex = serverPagination ? 0 : (currentPage - 1) * itemsPerPage;
  const currentData = serverPagination
    ? filteredData
    : filteredData.slice(startIndex, startIndex + itemsPerPage);

  const didMountRef = React.useRef(false);

  // Reset to page 1 when search or filter changes (skip initial mount)
  React.useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setInternalCurrentPage(1);
    if (serverPagination && onPageChange) {
      onPageChange(1);
    }
  }, [effectiveSearchTerm, effectiveSelectedFilter, serverPagination, onPageChange]);

  const goToPage = (pageNumber: number) => {
    const newPage = Math.max(1, Math.min(pageNumber, totalPages));
    if (serverPagination && onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-white rounded-md">
      {showToolbar && (
        <div className="py-2 sm:py-3 px-3 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Heading */}
            {showHeading && heading && (
              <div className="flex-1 min-w-0">
                <p className="text-lg sm:text-xl font-semibold truncate">{heading}</p>
              </div>
            )}
            
            {/* filter and search */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {/* filter */}
              {showFilter && filterOptions && filterOptions.length > 0 && (
                <div className="w-full sm:w-auto">
                  <CustomSelect
                    options={[
                      { value: "", label: `All ${filterKey || "Items"}` },
                      ...filterOptions.map(option => ({ value: option.value, label: option.label }))
                    ]}
                    value={effectiveSelectedFilter}
                    onChange={(value) => {
                      if (onFilterChange) onFilterChange(value);
                      else setInternalSelectedFilter(value);
                    }}
                    placeholder={`All ${filterKey || "Items"}`}
                  />
                </div>
              )}
              {/* search */}
              {showSearch && (
                <div className="w-full sm:w-48 lg:w-56">
                  <Input
                    placeholder="Search..."
                    value={effectiveSearchTerm}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (onSearchChange) onSearchChange(next);
                      else setInternalSearchTerm(next);
                    }}
                    className="w-full text-xs sm:text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Mobile card layout */}
      <div className="sm:hidden flex flex-col gap-3">
        {currentData.length > 0 ? (
          currentData.map((row, rowIndex) => (
            <div key={rowIndex} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex flex-col gap-2">
                {columns.map((col) => {
                  const value = col.render ? col.render(row[col.key], row) : row[col.key];
                  return (
                    <div key={col.key} className="flex justify-between gap-3">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        {col.header}
                      </span>
                      <div className="text-xs text-gray-800 text-right max-w-[60%]">
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
            {effectiveSearchTerm || effectiveSelectedFilter
              ? "No results found for your search criteria."
              : "No data available."}
          </div>
        )}
      </div>

      {/* Desktop table layout */}
      <div className="hidden sm:block overflow-x-auto overflow-y-visible w-full rounded-lg">
        <div className="w-full min-w-0">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50 rounded-tl-lg">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 sm:px-6 py-3 text-left text-[11px] sm:text-xs font-semibold text-gray-600 tracking-wider whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.length > 0 ? (
                currentData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`hover:bg-gray-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={onRowClick ? (event) => onRowClick(row, event) : undefined}
                  >
                    {columns.map((col) => {
                      const shouldTruncate = col.truncate !== false;
                      const cellClasses = [
                        "px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700",
                        shouldTruncate ? "max-w-[120px] sm:max-w-[180px] overflow-hidden" : "overflow-visible",
                        col.cellClassName || "",
                      ].join(" ").trim();

                      return (
                        <td key={col.key} className={cellClasses}>
                          {col.render ? (
                            shouldTruncate ? (
                              <div className="block truncate max-w-30 sm:max-w-45">
                                {col.render(row[col.key], row)}
                              </div>
                            ) : (
                              col.render(row[col.key], row)
                            )
                          ) : (
                            <span className="block truncate max-w-30 sm:max-w-45">{row[col.key]}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    {effectiveSearchTerm || effectiveSelectedFilter
                      ? "No results found for your search criteria."
                      : "No data available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-white border-t border-gray-200 mt-5 w-full">
            <div className="text-sm text-gray-700 text-center sm:text-left">
              {serverPagination ? (
                <>
                  Showing <span className="font-medium">{currentData.length}</span> results
                  {hasClientFilters && (
                    <span className="text-gray-500">
                      {" "}
                      (filtered from {data.length} total)
                    </span>
                  )}
                </>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-medium">
                    {filteredData.length > 0 ? startIndex + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredData.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredData.length}</span>{" "}
                  results
                  {(effectiveSearchTerm || effectiveSelectedFilter) && (
                    <span className="text-gray-500">
                      {" "}
                      (filtered from {data.length} total)
                    </span>
                  )}
                </>
              )}
            </div>
            
            {/* Mobile-responsive pagination */}
            <div className="flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">{"<"}</span>
                </button>

                {/* Page Numbers - Mobile: Show current and total, Desktop: Show page numbers */}
                <div className="flex items-center gap-1">
                  {/* Mobile: Simple current/total display */}
                  <div className="sm:hidden text-sm text-gray-700 px-2">
                    {currentPage} / {totalPages}
                  </div>
                  
                  {/* Desktop: Full page number navigation */}
                  <div className="hidden sm:flex items-center gap-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => goToPage(1)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          1
                        </button>
                        {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                      </>
                    )}

                    {/* Page numbers around current page */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md border ${
                            currentPage === pageNum
                              ? 'bg-primary text-white border-primary'
                              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden"></span>
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Pagination Controls */}
      <div className="sm:hidden flex flex-col gap-3 px-4 py-3 bg-white border-t border-gray-200 mt-2 w-full">
        <div className="text-sm text-gray-700 text-center">
          Showing{" "}
          <span className="font-medium">
            {filteredData.length > 0 ? startIndex + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(startIndex + itemsPerPage, filteredData.length)}
          </span>{" "}
          of <span className="font-medium">{filteredData.length}</span> results
        </div>
        <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {"<"}
            </button>
            <div className="text-sm text-gray-700 px-2">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {">"}
            </button>
          </div>
      </div>
    </div>
  );
};

export default ReusableTable;

