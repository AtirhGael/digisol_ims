"use client"

import { useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, ReferenceArea, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { CustomSelect } from "@/components/ui/CustomSelect"
import Skeleton from "@/components/other/Loader/Skeleton"

// Short description used by dashboards/docs (if needed elsewhere).
export const description = "Monthly payroll trend chart"

type ChartPoint = { month: string; value: number }

// Recharts series config for consistent colors/labels.
const chartConfig = {
  value: {
    label: "Payroll",
    color: "#2F9BDE",
  },
} satisfies ChartConfig

// Custom tooltip matching the design style.
const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0)

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ value?: number }>
}) => {
  if (!active) return null
  const value = payload?.[0]?.value ?? 0
  return (
    <div className="rounded-lg bg-black px-3 py-2 text-xs text-white ">
      <div className="text-sm font-semibold">{formatCompact(Number(value))} XAF</div>
    </div>
  )
}

type ChartLineLabelProps = {
  data: ChartPoint[]
  currency?: string
}

export function ChartLineLabel({ data, currency = "XAF" }: ChartLineLabelProps) {
  // Dropdown state.
  const [range, setRange] = useState("6m")
  // Dropdown options.
  const rangeOptions = [
    { value: "3m", label: "Last 3 months" },
    { value: "6m", label: "Last 6 months" },
    { value: "1y", label: "Last 1 year" },
  ]
  const normalizedData = Array.isArray(data) ? data : []
  const hasData = normalizedData.some((item) => item.value > 0)
  // Chart data for the selected range.
  const chartData = useMemo(() => {
    if (!normalizedData.length) return []
    const limit = range === "3m" ? 3 : range === "1y" ? 12 : 6
    return normalizedData.slice(-limit)
  }, [normalizedData, range])
  // Highlight window for the reference area.
  const highlightMonth = chartData[chartData.length - 2]?.month
  const highlightEnd = chartData[chartData.length - 1]?.month

  const latestValue = chartData[chartData.length - 1]?.value ?? 0
  const previousValue = chartData[chartData.length - 2]?.value ?? 0
  const changePercent = previousValue
    ? ((latestValue - previousValue) / previousValue) * 100
    : null
  const changeLabel =
    changePercent === null
      ? "No prior data"
      : `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(1)}% from last month`
  const changeTone =
    changePercent === null
      ? "text-gray-500"
      : changePercent >= 0
        ? "text-emerald-600"
        : "text-red-600"

  const MonthTick = (props: { x?: number; y?: number; payload?: { value: string } }) => {
    const { x = 0, y = 0, payload } = props
    const isActive = payload?.value === highlightEnd
    return (
      <text
        x={x}
        y={y + 12}
        textAnchor="middle"
        className={isActive ? "fill-sky-500 text-[11px] font-semibold" : "fill-gray-500 text-[11px]"}
      >
        {payload?.value}
      </text>
    )
  }

  return (
    <Card className="border border-gray-200 ">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          {/* Title + metric */}
          <div className="space-y-2">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Monthly Payroll Trend
            </CardTitle>
            <div className="text-2xl font-bold text-gray-900">
              {formatCompact(latestValue)} {currency}
            </div>
            <div className={`text-xs ${changeTone}`}>{changeLabel}</div>
          </div>
          {/* Range selector */}
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
      <CardContent className="pt-2">
        {!hasData ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
              {/* Subtle vertical grid lines only */}
              <CartesianGrid vertical strokeDasharray="3 3" stroke="#EEF2F7" horizontal={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={<MonthTick />}
              />
              <YAxis hide domain={[0, "auto"]} />
              {/* Highlight band for the active window */}
              {highlightMonth && highlightEnd && (
                <ReferenceArea x1={highlightMonth} x2={highlightEnd} fill="#EAF4FF" fillOpacity={0.7} />
              )}
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: "#2F9BDE", stroke: "#ffffff" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
