import { Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"

type PieChartItem = {
  name: string
  value: number
  fill: string
  amount?: string
}

type ChartPieLabelCustomProps = {
  data?: PieChartItem[]
  // When true, display the monetary amount below the percent.
  showAmount?: boolean
}

export function ChartPieLabelCustom({
  data = [],
  showAmount = false,
}: ChartPieLabelCustomProps) {
  // Build chart colors from the incoming dataset so labels match slices.
  const chartConfig = data.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill }
    return acc
  }, {} as ChartConfig)

  return (
    <Card className="border border-gray-200 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Expense Distribution</CardTitle>
        <CardDescription>By category</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        {/* Pie chart */}
        <ChartContainer config={chartConfig} className="mx-auto h-60 -mt-1">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
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
                    {payload.name} {payload.value}%
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
      </CardContent>
    </Card>
  )
}
