import { useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { CustomSelect } from "@/components/ui/CustomSelect"

interface ChartDataItem {
  month: string
  inflow: number
  outflow: number
  netIncome: number
}

// Recharts series config for colors/labels.
const chartConfig = {
  inflow: { label: "Inflow", color: "#10B981" },
  netIncome: { label: "Net Cash Flow", color: "#3B82F6" },
  outflow: { label: "Outflow", color: "#EF4444" },
} satisfies ChartConfig

export function ChartLineLabelCustom({ chartData }: { chartData: ChartDataItem[] }) {
  const [range, setRange] = useState("6m")
  const rangeOptions = [
    { value: "3m", label: "Last 3 months" },
    { value: "6m", label: "Last 6 months" },
    { value: "1y", label: "Last 1 year" },
  ]

  const filteredChartData = useMemo(() => {
    if (range === "3m") return chartData.slice(-3)
    if (range === "6m") return chartData.slice(-6)
    return chartData
  }, [chartData, range])

  return (
    <Card className="border border-gray-200 ">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Cash Flow Overview</CardTitle>
            <CardDescription>Monthly inflow vs outflow</CardDescription>
          </div>
          <div className="w-35">
            <CustomSelect
              options={rangeOptions}
              value={range}
              onChange={setRange}
              className="rounded-full border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Line chart */}
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <LineChart
            data={filteredChartData}
            margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, "auto"]}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Line
              dataKey="inflow"
              type="monotone"
              stroke="var(--color-inflow)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }}
            />
            <Line
              dataKey="netIncome"
              type="monotone"
              stroke="var(--color-netIncome)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }}
            />
            <Line
              dataKey="outflow"
              type="monotone"
              stroke="var(--color-outflow)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }}
            />
          </LineChart>
        </ChartContainer>
        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-2 text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Inflow
          </span>
          <span className="flex items-center gap-2 text-blue-600">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Net Cash Flow
          </span>
          <span className="flex items-center gap-2 text-red-500">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Outflow
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
