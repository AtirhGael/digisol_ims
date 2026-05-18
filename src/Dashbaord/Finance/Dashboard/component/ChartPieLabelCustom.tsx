import { Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type PieChartItem = {
  name: string
  value: number
  fill: string
  amount?: string
  count?: number
}

type ChartPieLabelCustomProps = {
  data?: PieChartItem[]
  summaryData?: PieChartItem[]
  showAmount?: boolean
  title?: string
  description?: string
  showCard?: boolean
  outerRadius?: number
  chartClassName?: string
  cardClassName?: string
  showSummaryList?: boolean
  valueSuffix?: string
  countLabelClassName?: string
}

export function ChartPieLabelCustom({
  data = [],
  summaryData,
  showAmount = false,
  title = "Expense Distribution",
  description = "By category",
  showCard = true,
  outerRadius = 80,
  chartClassName,
  cardClassName,
  showSummaryList = false,
  valueSuffix = "%",
  countLabelClassName,
}: ChartPieLabelCustomProps) {
  const chartConfig = data.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill }
    return acc
  }, {} as ChartConfig)

  const headerContent = (
    <>
      <CardTitle className="text-base text-gray-900">{title}</CardTitle>
      <CardDescription className="text-sm text-gray-500">{description}</CardDescription>
    </>
  )

  const chartArea = (
    <ChartContainer config={chartConfig} className={cn("mx-auto h-60 -mt-1", chartClassName)}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={outerRadius}
          labelLine={false}
          label={({ x, y, payload, textAnchor }) => (
            <text
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="central"
              fill={payload.fill}
              fontSize={11}
            >
              <tspan x={x} dy={showAmount && payload.amount ? "-0.2em" : "0"}>
                {payload.name} {payload.value}{valueSuffix}
              </tspan>
              {showAmount && payload.amount ? (
                <tspan x={x} dy="1.1em">
                  {payload.amount}
                </tspan>
              ) : null}
            </text>
          )}
        />
      </PieChart>
    </ChartContainer>
  )

  const summaryList = showSummaryList ? (
    <div className="mt-2 w-full space-y-3">
      {(summaryData ?? data).map((item) => (
        <div key={item.name} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
            <span className="text-sm text-gray-700">{item.name}</span>
          </div>
          <span className={cn("text-base font-semibold text-gray-900", countLabelClassName)}>
            {item.count ?? item.amount ?? item.value}
          </span>
        </div>
      ))}
    </div>
  ) : null

  if (!showCard) {
    return (
      <div className="space-y-4">
        <div>{headerContent}</div>
        {chartArea}
        {summaryList}
      </div>
    )
  }

  return (
    <Card className={cn("border border-gray-200 h-full", cardClassName)}>
      <CardHeader className="pb-2">{headerContent}</CardHeader>
      <CardContent className="pt-0 pb-4">
        {chartArea}
        {summaryList}
      </CardContent>
    </Card>
  )
}
