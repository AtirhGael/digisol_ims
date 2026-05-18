import { Link } from "react-router-dom"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

interface ChartBarHorizontalItem {
  stage: string
  value: number
  fill?: string
}

interface ChartBarHorizontalProps {
  data: ChartBarHorizontalItem[]
  title?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  ctaTo?: string
  showCard?: boolean
  maxValue?: number
  xAxisTicks?: number[]
  cardClassName?: string
  chartClassName?: string
}

const chartConfig = {
  value: {
    label: "Candidates",
    color: "#4285F4",
  },
} satisfies ChartConfig

export function ChartBarHorizontal({
  data = [],
  title = "Recruitment Pipeline",
  description = "Active recruitment status",
  ctaLabel = "View Details",
  ctaHref = "#",
  ctaTo,
  showCard = true,
  maxValue = 60,
  xAxisTicks = [0, 15, 30, 45, 60],
  cardClassName,
  chartClassName,
}: ChartBarHorizontalProps) {
  const headerContent = (
    <div className="flex items-start justify-between gap-4">
      <div>
        <CardTitle className="text-base text-gray-900">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-500">{description}</CardDescription>
      </div>
      {ctaTo ? (
        <Link to={ctaTo} className="text-sm font-medium text-blue-600 hover:underline">
          {ctaLabel}
        </Link>
      ) : (
        <a href={ctaHref} className="text-sm font-medium text-blue-600 hover:underline">
          {ctaLabel}
        </a>
      )}
    </div>
  )

  const chartArea = (
    <ChartContainer config={chartConfig} className={cn("h-64 w-full", chartClassName)}>
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 12, bottom: 8, left: 4 }}
        barCategoryGap={10}
      >
        <CartesianGrid stroke="#d1d5db" strokeDasharray="3 3" horizontal={true} vertical={true} />
        <XAxis
          type="number"
          domain={[0, maxValue]}
          ticks={xAxisTicks}
          tickLine={false}
          axisLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
          tickMargin={8}
        />
        <YAxis
          dataKey="stage"
          type="category"
          tickLine={false}
          axisLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
          tickMargin={6}
          width={85}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel formatter={(value) => <span>{value}</span>} />}
        />
        <Bar dataKey="value" radius={[0, 0, 0, 0]} barSize={42}>
          {data.map((entry) => (
            <Cell key={entry.stage} fill={entry.fill || "#4285F4"} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )

if (!showCard) {
    return (
    <div className="space-y-4">
        {headerContent}
        {chartArea}
    </div>
    )
}

return (
    <Card className={cn("border border-gray-200", cardClassName)}>
    <CardHeader className="pb-2">{headerContent}</CardHeader>
    <CardContent className="pt-0">{chartArea}</CardContent>
    </Card>
)
}
