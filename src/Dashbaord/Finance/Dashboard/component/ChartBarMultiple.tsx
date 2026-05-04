import type { ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// Recharts series config for colors/labels.
const chartConfig = {
  actual: { label: "Actual", color: "#3BA4E0" },
  budget: { label: "Budget", color: "#94A3B8" },
} satisfies ChartConfig

type ChartBarMultipleProps = {
  title?: string
  description?: string
  data?: Array<Record<string, string | number>>
  xKey?: string
  config?: ChartConfig
  className?: string
  headerClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  contentClassName?: string
  chartClassName?: string
  legendClassName?: string
  yTickFormatter?: (value: number) => string
  headerRight?: ReactNode
}

export function ChartBarMultiple({
  title = "Budget vs Actual",
  description = "Current month comparison",
  data = [],
  xKey = "department",
  config = chartConfig,
  className,
  headerClassName,
  titleClassName,
  descriptionClassName,
  contentClassName,
  chartClassName,
  legendClassName,
  yTickFormatter = (value) => value.toLocaleString(),
  headerRight,
}: ChartBarMultipleProps) {
  const seriesKeys = Object.keys(config)

  return (
    <Card className={cn("border border-gray-200", className)}>
      <CardHeader className={cn("pb-2", headerClassName)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className={cn("text-base", titleClassName)}>{title}</CardTitle>
            <CardDescription className={cn(descriptionClassName)}>{description}</CardDescription>
          </div>
          {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={cn("pt-2", contentClassName)}>
        {/* Bar chart */}
        <ChartContainer config={config} className={cn("h-60 w-full", chartClassName)}>
          <BarChart data={data} margin={{ left: 8, right: 8, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={yTickFormatter}
            />
            {seriesKeys.map((key) => (
              <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={2} />
            ))}
          </BarChart>
        </ChartContainer>
        {/* Legend */}
        <div className={cn("mt-3 flex items-center gap-4 text-xs", legendClassName)}>
          {seriesKeys.map((key) => (
            <span
              key={key}
              className="flex items-center gap-2"
              style={{ color: `var(--color-${key})` }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: `var(--color-${key})` }}
              />
              {config[key]?.label || key}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
