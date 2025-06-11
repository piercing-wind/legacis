'use client'
import { Line } from "../icon"
import { Button } from "../ui/button"

import { Area, Line as ReLine, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import Link from "next/link";
import type { ServiceFeature, TenureDiscount } from "@/types/service";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getRecomendedServices, SerializedService } from "@/lib/slices/serviceSlice";

const RecomendedServices = () => {
   const dispatch = useAppDispatch();
   useEffect(() => {
      dispatch(getRecomendedServices(['momentum-thrust']));
   }, [dispatch]);
   
   const {services} = useAppSelector((state) => state.service);

  return (
    <section className="w-full p-4 border rounded-2xl mt-8">
      <h6 className="!text-xl mb-4">Recommended Services</h6>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <RecomendedServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </section>
  )
}

export default RecomendedServices



export const RecomendedServiceCard = ({service} : {service : SerializedService}) => {
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
         <div className="mt-2 mb-2 relative">
             <h5 className="!text-xl">{name}</h5>
             <p className="text-sm">Legacis Direct - {tag}</p>
            <span className='absolute top-2 right-2 p-2 py-1 rounded-lg shadow shadow-legacisGreen/50 text-sm'>Trending</span>
         </div>
        <Line color="var(--legacisGreen)" height="2px" width="100%"/>
            <div className="">
               <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
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
               </ChartContainer>
            </div>
         <div style={{ color: "var(--legacisGreen)" }}>
           <Line color="currentColor" height="2px" width="100%" />
         </div>
         <div className="w-full flex flex-row flex-nowrap items-center text-nowrap gap-2 mt-2 h-20">
            {parsedFeatures?.highlights?.slice(0, 3).map(( item, idx, arr) => (
               <React.Fragment key={item.name + idx}>
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
         <Button asChild variant={'outline'} className="w-full p-2 h-14 dark:bg-transparent border-2 border-legacisGreen/50 dark:border-legacisGreen/50 uppercase rounded-full">
           <Link href={`/services/${slug}`} className="flex items-center justify-center gap-2">
              Subscribe Now <span className="font-urbanist font-semibold">₹{displayPrice} / mo</span>
           </Link>
         </Button>
      </div>
   )
}