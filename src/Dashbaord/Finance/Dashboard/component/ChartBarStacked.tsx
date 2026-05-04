import { Bar, BarChart, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import Skeleton from "@/components/other/Loader/Skeleton"

// Short description used by dashboards/docs (if needed elsewhere).
export const description = "A stacked bar chart with a legend"

// Recharts series config for consistent colors/labels.
const chartConfig = {
  salary: {
    label: "Salary",
    color: "#2F9BDE",
  },
  bonuses: {
    label: "Bonuses",
    color: "#EAF4FF",
  },
} satisfies ChartConfig

type ChartBarStackedProps = {
  data: Array<{ department: string; salary: number; bonuses: number }>
  currency?: string
  changeLabel?: string
  changeTone?: "positive" | "negative" | "neutral"
}

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0)

export function ChartBarStacked({
  data,
  currency = "XAF",
  changeLabel,
  changeTone = "neutral",
}: ChartBarStackedProps) {
  const totalValue = data.reduce((sum, item) => sum + (item.salary || 0) + (item.bonuses || 0), 0)
  const hasData = data.some((item) => (item.salary || 0) + (item.bonuses || 0) > 0)
  const toneClass =
    changeTone === "positive"
      ? "text-emerald-600"
      : changeTone === "negative"
        ? "text-red-600"
        : "text-gray-500"

  return (
    <Card className="border border-gray-200 ">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          {/* Title + summary */}
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Payroll Distribution By Department
            </CardTitle>
            <div className="text-2xl font-bold text-gray-900">
              {formatCompact(totalValue)} {currency}
            </div>
            <div className={`text-xs ${toneClass}`}>
              {changeLabel || "No comparison data"}
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2F9BDE]" />
              Salary
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E7F2FB]" />
              Bonuses
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {!hasData ? (
          <Skeleton className="h-44 w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-44 w-full">
            <BarChart data={data} margin={{ left: 0, right: 0, top: 8 }}>
              <XAxis
                dataKey="department"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
              />
              <YAxis hide />
              <Bar
                dataKey="salary"
                stackId="a"
                fill="var(--color-salary)"
                radius={[0, 0, 8, 8]}
                barSize={18}
              />
              <Bar
                dataKey="bonuses"
                stackId="a"
                fill="var(--color-bonuses)"
                radius={[8, 8, 0, 0]}
                barSize={18}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
