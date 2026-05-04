import Skeleton from "./Skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
}

const TableSkeleton = ({ 
  rows = 5, 
  columns = 6, 
  showHeader = true, 
  showSearch = true,
  showFilters = true 
}: TableSkeletonProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Table Header */}
      {showHeader && (
        <div className="p-6 border-b border-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <Skeleton className="h-8 w-48" /> {/* Title */}
            <div className="flex gap-3">
              {showFilters && <Skeleton className="h-9 w-32 rounded-lg" />} {/* Filter */}
              <Skeleton className="h-9 w-24 rounded-lg" /> {/* Button */}
            </div>
          </div>
          {showSearch && (
            <div className="flex gap-3">
              <Skeleton className="h-10 w-80 rounded-lg" /> {/* Search */}
              <Skeleton className="h-10 w-32 rounded-lg" /> {/* Export */}
            </div>
          )}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Headers */}
          <thead className="border-b border-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Rows */}
          <tbody className="divide-y divide-gray-50">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-25">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {colIndex === 0 ? (
                      // First column with title and subtitle
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ) : colIndex === 1 ? (
                      // Services column
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-6 w-20 rounded-md" />
                        <Skeleton className="h-6 w-16 rounded-md" />
                      </div>
                    ) : colIndex === columns - 2 ? (
                      // Status column
                      <Skeleton className="h-6 w-16 rounded-full" />
                    ) : colIndex === columns - 1 ? (
                      // Actions column
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    ) : (
                      // Regular columns
                      <Skeleton className="h-4 w-24" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
        <Skeleton className="h-4 w-32" /> {/* Items per page */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;