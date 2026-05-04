import Skeleton from "../Skeleton";

const SkeletonLoading = () => {
  return (
    <div className="min-h-screen space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-4 w-32" /> {/* Label */}
              <Skeleton className="h-8 w-8 rounded-lg" /> {/* Icon */}
            </div>
            <Skeleton className="h-10 w-24 mb-2" /> {/* Value (1.1M) */}
            <Skeleton className="h-3 w-40" /> {/* Subtext/Trend */}
          </div>
        ))}
      </div>

      {/* Alert/Notice Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 h-80">
          <div className="flex justify-between mb-8">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <div className="flex items-end justify-between h-40 px-4">
            {/* Mocking the line graph path points */}
            {[40, 70, 45, 90, 65, 30].map((h, i) => (
              <Skeleton
                key={i}
                className={`w-2 rounded-full`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Department Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 h-80">
          <Skeleton className="h-6 w-56 mb-10" />
          <div className="flex items-end justify-around h-40">
            {[60, 80, 55, 100, 45, 75].map((h, i) => (
              <Skeleton
                key={i}
                className="w-10 rounded-t-md"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-64 rounded-lg" />
        </div>
        <div className="p-6 space-y-6">
          {/* Table Rows */}
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="grid grid-cols-6 gap-4 items-center">
              <Skeleton className="h-4 w-20" /> {/* Name */}
              <Skeleton className="h-4 w-24" /> {/* Salary */}
              <Skeleton className="h-4 w-28" /> {/* Dept */}
              <Skeleton className="h-4 w-24" /> {/* Date */}
              <Skeleton className="h-4 w-20" /> {/* Total */}
              <div className="flex justify-end">
                <Skeleton className="h-7 w-20 rounded-full" />{" "}
                {/* Status Badge */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoading;
+237689189149