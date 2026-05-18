import { useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { cn } from "@/lib/utils"

type ChartValue = string | number

interface ChartDataItem {
  month?: string
  [key: string]: ChartValue | undefined
}

interface ChartSeriesItem {
  dataKey: string
  label: string
  color: string
}

interface ChartLineLabelCustomProps {
  chartData: ChartDataItem[]
  title?: string
  description?: string
  xKey?: string
  series?: ChartSeriesItem[]
  showRangeSelector?: boolean
  showCard?: boolean
  defaultRange?: string
  yAxisTicks?: number[]
  yAxisDomain?: [number | "auto" | "dataMin", number | "auto" | "dataMax"]
  yTickFormatter?: (value: number) => string
  xTickFormatter?: (value: string) => string
  cardClassName?: string
  chartClassName?: string
  legendClassName?: string
}

const defaultRangeOptions = [
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last 1 year" },
]

const defaultSeries: ChartSeriesItem[] = [
  { dataKey: "inflow", label: "Inflow", color: "#10B981" },
  { dataKey: "netIncome", label: "Net Cash Flow", color: "#3B82F6" },
  { dataKey: "outflow", label: "Outflow", color: "#EF4444" },
]

const getChartConfig = (series: ChartSeriesItem[]): ChartConfig =>
  series.reduce<ChartConfig>((config, item) => {
    config[item.dataKey] = {
      label: item.label,
      color: item.color,
    }

    return config
  }, {})

export function ChartLineLabelCustom({
  chartData,
  title = "Cash Flow Overview",
  description = "Monthly inflow vs outflow",
  xKey = "month",
  series = defaultSeries,
  showRangeSelector = true,
  showCard = true,
  defaultRange = "6m",
  yAxisTicks,
  yAxisDomain = [0, "auto"],
  yTickFormatter = (value) => value.toLocaleString(),
  xTickFormatter = (value) => value.slice(0, 3),
  cardClassName,
  chartClassName,
  legendClassName,
}: ChartLineLabelCustomProps) {
  const [range, setRange] = useState(defaultRange)

  const filteredChartData = useMemo(() => {
    if (!showRangeSelector) return chartData
    if (range === "3m") return chartData.slice(-3)
    if (range === "6m") return chartData.slice(-6)
    return chartData
  }, [chartData, range, showRangeSelector])

  const chartConfig = useMemo(() => getChartConfig(series), [series])

  const headerContent = (
    <div className="flex items-start justify-between gap-4">
      <div>
        <CardTitle className="text-base text-gray-900">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-500">{description}</CardDescription>
      </div>
      {showRangeSelector ? (
        <div className="w-35">
          <CustomSelect
            options={defaultRangeOptions}
            value={range}
            onChange={setRange}
            className="rounded-full border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300"
          />
        </div>
      ) : null}
    </div>
  )

  const chartArea = (
    <ChartContainer config={chartConfig} className={cn("h-64 w-full", chartClassName)}>
      <LineChart data={filteredChartData} margin={{ left: 8, right: 16, top: 10, bottom: 8 }}>
        <CartesianGrid stroke="#d1d5db" strokeDasharray="3 3" vertical horizontal />
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => xTickFormatter(String(value))}
        />
        <YAxis
          ticks={yAxisTicks}
          tickLine={false}
          axisLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
          tickMargin={8}
          domain={yAxisDomain}
          tickFormatter={yTickFormatter}
        />
        {series.map((item) => (
          <Line
            key={item.dataKey}
            dataKey={item.dataKey}
            type="monotone"
            stroke={`var(--color-${item.dataKey})`}
            strokeWidth={2}
            dot={{ r: 3.5, strokeWidth: 2, fill: "#ffffff" }}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )

  const legendContent = (
    <div className={cn("mt-4 flex items-center justify-center gap-4 text-xs sm:text-sm", legendClassName)}>
      {series.map((item) => (
        <span key={item.dataKey} className="flex items-center gap-2" style={{ color: item.color }}>
          <span className="relative inline-block h-3 w-4">
            <span
              className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span
              className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white"
              style={{ borderColor: item.color }}
            />
          </span>
          {item.label}
        </span>
      ))}
    </div>
  )

  if (!showCard) {
    return (
      <div className="space-y-4">
        {headerContent}
        {chartArea}
        {legendContent}
      </div>
    )
  }

  return (
    <Card className={cn("border border-gray-200", cardClassName)}>
      <CardHeader className="pb-2">{headerContent}</CardHeader>
      <CardContent className="pt-0">
        {chartArea}
        {legendContent}
      </CardContent>
    </Card>
  )
}
