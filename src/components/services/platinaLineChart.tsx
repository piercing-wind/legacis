"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface SimpleLineChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  color?: string;
  title?: string;
}

export default function PlatinaSimpleLineChart({ 
  data, 
  color = "#4AEDB9", 
  title = "Performance" 
}: SimpleLineChartProps) {
  
  const chartConfig = {
    value: {
      label: title,
      color: color,
    },
  } satisfies ChartConfig

  // Create unique gradient ID based on color
  const gradientId = `gradient-${color.replace('#', '')}`

  return (
    <div className="w-full">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
         <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
              className="text-xs dark:text-neutral-100"
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              className="text-xs dark:text-neutral-100"
            />
            <ChartTooltip content={<ChartTooltipContent className="dark:text-neutral-100" />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1}
              fill={`url(#${gradientId})`}
              dot={{ fill: color, strokeWidth: 0.5, r: 2 }}
              activeDot={{ r: 3, stroke: color, strokeWidth: 1 }}
            />
          </AreaChart>
      </ChartContainer>
    </div>
  )
}