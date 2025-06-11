"use client"

import { AreaChart, Area, Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis, ComposedChart, Line } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChartDataPoint } from "@/types/service";



export default function Chart({chartData, mainLabel, comparisonLabel}:{chartData: ChartDataPoint[], mainLabel: string, comparisonLabel: string}) {
   
   const chartConfig = {
     main: { label: mainLabel, color: "#4AEDB9" },
     comparison: { label: comparisonLabel, color: "#2563eb" },
   } satisfies ChartConfig;

return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
         <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="main" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4AEDB9" stopOpacity={1}/>
              <stop offset="95%" stopColor="#4AEDB9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} horizontal={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(week, index) => {
                // Show month label only for the first week of each month
                const currentMonth = chartData[index]?.month;
                const prevMonth = chartData[index - 1]?.month;
                return currentMonth !== prevMonth ? currentMonth : "";
            }}
          />
          <YAxis />
           <ChartTooltip content={<ChartTooltipContent />} />
           <ChartLegend content={<ChartLegendContent />} />
           <Area
            type="monotone"
            dataKey="main"
            stroke="#4AEDB9"
            fill="url(#main)"
            fillOpacity={1}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="comparison"
            stroke="var(--text-color)"
            strokeWidth={1.5}
            dot={false}
            opacity={0.5}
            strokeDasharray="4 2"
            isAnimationActive={false}
          />
        </ComposedChart>
    </ChartContainer>
  )
}
