'use client'
import { Line } from "../icon"
import { Button } from "../ui/button"

import { AreaChart, Area, Line as ReLine, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Service } from "@/prisma/generated/client";
import Link from "next/link";
import type { ServiceFeature, TenureDiscount } from "@/types/service";
import React from "react";


export const ServiceCard = ({service} : {service : Service}) => {
   const { name, tag, description, price, chart, features, type, slug } = service;
   
   const parsedFeatures: ServiceFeature | undefined = features ? (features as ServiceFeature) : undefined;
   
   const chartData = Array.isArray(chart) ? chart : [];
  
   const chartConfig = {
     main: { label: "mainLabel", color: "#4AEDB9" },
     comparison: { label: "comparisonLabel", color: "#2563eb" },
   } satisfies ChartConfig;

   const tenureArr: TenureDiscount[] = Array.isArray(service?.tenureDiscounts) ? service?.tenureDiscounts as TenureDiscount[] : [];
   const maxTenure = tenureArr.reduce((max, curr) => curr.days > max.days ? curr : max, tenureArr[0]);

   const basePrice = Number(price || 0) * (maxTenure?.days ?? 0) / 30;
   const discountPercent = maxTenure?.discount ?? 0;
   const displayPrice = Math.round((basePrice * (1 - discountPercent / 100))/ 12) ;

   return (
      <div className="w-full max-w-sm rounded-2xl border border-legacisGreen/30 p-6"
         style={{
            boxShadow: "0 0 16px 0 rgba(74, 237, 185, 0.2)"
         }}
      >
         <h5 className="!text-xl">{name}</h5>
         <p className="text-sm">Legacis Direct - {tag}</p>
         <div className="flex items-baseline justify-between mt-6 mb-2">
            <span className="flex items-baseline">
               <h2 className="font-urbanist !text-5xl !font-semibold">₹{displayPrice}</h2><p className="text-sm">/ month</p>
            </span>
            <span className='p-2 py-1 rounded-lg shadow shadow-legacisGreen/50 text-sm'>Trending</span>
         </div>
         <Line color="var(--legacisGreen)" height="2px" width="100%"/>
            <div className="">
               <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <defs>
                        <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3eeab5" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3eeab5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="main"
                        stroke="#3eeab5"
                        fillOpacity={1}
                        fill="url(#colorDesktop)"
                        dot={false}
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
               </ChartContainer>
            </div>
         <Line color="var(--legacisGreen)" height="2px" width="100%"/>

         <div className="w-full flex flex-row flex-nowrap items-center text-nowrap gap-2 mt-2 h-20">
            {parsedFeatures?.highlights?.slice(0, 3).map(( item, idx, arr) => (
               <React.Fragment key={item.name}>
                 <span className="relative flex flex-col w-full h-full items-center justify-center">
                   <p className="text-xs">{item.name}</p>
                   <p className="font-medium">{item.value}</p>
                 </span>
                 {idx < arr.length - 1 && (
                   <Line color="var(--legacisGreen)" vertical height="100%"  width="2px" className="self-stretch h-full"/>
                 )}
               </React.Fragment>

            ))}
         </div>
         <Button asChild variant={'outline'} className="w-full p-2 h-14 border-2 border-legacisGreen/30 uppercase rounded-full">
           <Link href={`/services/${slug}`}>
              Subscribe Now
           </Link>
         </Button>
      </div>
   )
}