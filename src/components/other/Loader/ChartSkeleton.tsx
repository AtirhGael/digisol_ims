import Skeleton from "./Skeleton"
import { cn } from "@/lib/utils"

type ChartSkeletonProps = {
  className?: string
  bodyClassName?: string
}

const ChartSkeleton = ({ className, bodyClassName }: ChartSkeletonProps) => (
  <div className={cn("rounded-lg border border-dashed border-gray-200 bg-white p-4", className)}>
    <Skeleton className="h-4 w-40 mb-3" />
    <Skeleton className="h-3 w-24 mb-4" />
    <Skeleton className={cn("h-48 w-full", bodyClassName)} />
  </div>
)

export default ChartSkeleton
