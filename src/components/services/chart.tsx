"use client"

import { Area, CartesianGrid, XAxis, YAxis, ComposedChart, Line } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ChartDataPoint } from "@/types/service";
import { useMemo, useState } from "react";

function parseDMY(dateStr: string) {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getMonthLabel(dateStr: string) {
  const date = parseDMY(dateStr);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Jan 2025"
}
export default function Chart({
  chartData,
  mainLabel,
  comparisonLabel,
}: {
  chartData: ChartDataPoint[],
  mainLabel: string,
  comparisonLabel: string
}) {
  const chartConfig = {
    main: { label: mainLabel, color: "#4AEDB9" },
    comparison: { label: comparisonLabel, color: "#2563eb" },
  } satisfies ChartConfig;


  const [range, setRange] = useState("1y");

   const ranges = [
     { value: "1m", label: "1 Month" },
     { value: "6m", label: "6 Months" },
     { value: "1y", label: "1 Year" },
     { value: "3y", label: "3 Years" },
     { value: "5y", label: "5 Years" },
     { value: "all", label: "Since Launch" },
   ];

   const filteredData = useMemo(() => {
     if (range === "all") return chartData;
     const now = new Date();
     let fromDate: Date;
     switch (range) {
       case "1m":
         fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
         break;
       case "6m":
         fromDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
         break;
       case "1y":
         fromDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
         break;
       case "3y":
         fromDate = new Date(now.getFullYear() - 3, now.getMonth(), 1);
         break;
       case "5y":
         fromDate = new Date(now.getFullYear() - 5, now.getMonth(), 1);
         break;
       default:
         fromDate = new Date(0);
     }
     return chartData.filter(item => parseDMY(item.date) >= fromDate);
   }, [chartData, range]);

    const dataWithMonth = filteredData.map((item) => ({
    ...item,
    month: getMonthLabel(item.date),
  }));

  return (
      <div className="min-h-[200px] w-full">
         <div className="absolute top-1 right-1 z-10 p-2">
            <Select onValueChange={setRange} defaultValue="5y">
               <SelectTrigger className="min-w-[100px] p-1 px-2 text-xs">
                  <SelectValue placeholder="5y" />
               </SelectTrigger>
            <SelectContent>
               <SelectGroup>
                  {ranges.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
               </SelectGroup>
            </SelectContent>
         </Select>
         </div>
    <ChartContainer config={chartConfig} className="w-full relative">
      <ComposedChart data={dataWithMonth}>
        <defs>
          <linearGradient id="main" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4AEDB9" stopOpacity={1} />
            <stop offset="95%" stopColor="#4AEDB9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} horizontal={false} />
        <XAxis
          dataKey="week"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(_, index) => {
            // Show month label only for the first week of each month
            const currentMonth = dataWithMonth[index]?.month;
            const prevMonth = dataWithMonth[index - 1]?.month;
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
      </div>

  )
}