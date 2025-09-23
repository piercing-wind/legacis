"use client"

import { PieChart as RechartsePieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface PieChartDataPoint {
  name: string;
  value: number;
  fill: string;
  stocks?: number;
}

interface PieChartProps {
  className?: string;
  containerClassName?: string;
  height?: number;
  data: PieChartDataPoint[],
  chartConfig: ChartConfig;
}




export default function PieChart({className, containerClassName, height = 320, data, chartConfig }: PieChartProps) {

   const [responsiveHeight, setResponsiveHeight] = useState(height);

   useEffect(() => {
      function handleResize() {
         if (window.innerWidth < 1450) { // Tailwind 'md'
         setResponsiveHeight(240);
         } else {
             setResponsiveHeight(height);
         }
      }
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, [height]);

   if (data.length === 0) {
      return (
         <div className="flex items-center justify-center min-h-[200px] text-gray-500 dark:text-gray-400">
         No data available
         </div>
      );
   }

  return (
    <div className={cn("w-full", containerClassName)}>
      <ChartContainer config={chartConfig} className={cn("w-full min-h-72 md:min-h-52 p-4", className)}>
          <ResponsiveContainer width="100%" height={responsiveHeight}>
            <RechartsePieChart>
               <Pie
               data={data}
               cx="50%"
               cy="50%"
               outerRadius={responsiveHeight / 2 - 16}
               paddingAngle={0.5}
               dataKey="value"
               >
               {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
               ))}
               </Pie>
               <ChartTooltip 
               content={
                  <ChartTooltipContent 
                     hideLabel={true}
                     formatter={(value, name, props) => (
                     <div className="flex flex-col gap-1">
                        <div className="font-medium text-sm text-foreground">{name}</div>
                        <div className="text-xs text-muted-foreground">
                           Weight: <span className="font-mono font-semibold">{Number(value).toFixed(1)}%</span>
                        </div>
                        {props.payload?.stocks && (
                           <div className="text-xs text-muted-foreground">
                           Stocks: <span className="font-mono">{props.payload.stocks}</span>
                           </div>
                        )}
                     </div>
                     )}
                  />
               } 
               />
            </RechartsePieChart>
          </ResponsiveContainer>
      </ChartContainer>
              
      {/* Custom Legend with Dark Mode */}
      <div className="mt-4 flex flex-col gap-4 text-xs w-full">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: entry.fill }}
            />
            <span className="truncate text-gray-700 dark:text-gray-300">{entry.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {entry.value.toFixed(1)}%
            </span>
            {entry.stocks && (
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                ({entry.stocks} stocks)
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}