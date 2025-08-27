'use client'
'This Component is nolonger being used'
import { GradientLine, GradientLineVertical, Line } from "../icon"
import { Button } from "../ui/button"

import { Area, Line as ReLine, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import Link from "next/link";
import type { ServiceFeature } from "@/types/service";
import React, { useEffect } from "react";
import { getRecommendedServices, SerializedService } from "@/lib/slices/serviceSlice";
import { Service } from "@/prisma/generated/client";
import { cn, getServiceLink } from "@/lib/utils";
import { chartDataForServiceCard } from "@/lib/data/static-data";
import { getColorForCardByServiceType } from "@/lib/utils/serviceCardColorGenerator";
import { getServiceDisplayPrice } from "@/lib/utils/servicePricingDisplay";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const RecommendedServices = ({servicesId}:{servicesId: string[]}) => {
   const dispatch = useAppDispatch();
   useEffect(() => {
      dispatch(getRecommendedServices(servicesId));
   }, [dispatch, servicesId]);
   
   const {services} = useAppSelector((state) => state.service);

  return (
    <section className="w-full p-4 border rounded-2xl mt-8">
      <h6 className="!text-xl mb-4">Recommended Services</h6>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <RecomendedServiceCard 
            key={service.slug} 
            service={service}
           />
        ))}
      </div>
    </section>
  )
}

export default RecommendedServices


export const RecomendedServiceCard = ({
  service,
}: {
  service: Service | SerializedService;
}) => {
  const { name, tag, description, chart, features, type, slug } = service;
  const {color, color_l, card_tw} = getColorForCardByServiceType(type);


  const parsedFeatures: ServiceFeature | undefined = features ? (features as ServiceFeature) : undefined;

  const chartConfig = {
    main: { label: "mainLabel", color },
    comparison: { label: "comparisonLabel", color: "#2563eb" },
  } satisfies ChartConfig;

   const { displayPrice } = getServiceDisplayPrice([]); // Empty

  return (
    <div
      className={cn("w-full rounded-2xl border p-6", card_tw)}
    >
      <div className="mt-2 mb-2 relative">
        <h5 className="text-2xl font-medium mb-4">{name}</h5>
        <p className="text-sm">Legacis Direct - {tag}</p>
        <span
          className="absolute top-2 right-2 p-2 py-1 rounded-lg shadow text-xs"
          style={{
            boxShadow: `0 0 8px 0 ${color}80`,
            background: color,
            color: "#fff",
          }}
        >
          {service.label || "New"}
        </span>
      </div>
     <GradientLine color={color_l} height="2px" width="100%"/>
      <div>
        <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
          <ComposedChart data={chartDataForServiceCard}>
            <defs>
               <linearGradient id={`colorDesktop-${service.slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
               </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="main"
              stroke={color}
              fillOpacity={1}
              fill={`url(#colorDesktop-${service.slug})`}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
      <div style={{ color }}>
        <GradientLine color={color_l} height="2px" width="100%"/>
      </div>
      <div className="w-full flex flex-row flex-nowrap items-center text-nowrap gap-2 mt-2 h-20">
        {parsedFeatures?.highlights?.slice(0, 3).map((item, idx, arr) => (
          <React.Fragment key={item.name + idx}>
            <span className="relative flex flex-col w-full h-full items-center justify-center">
              <p className="text-xs">{item.name}</p>
              <p className="font-medium">{item.value}</p>
            </span>
            {idx < arr.length - 1 && (
              <GradientLineVertical color={color_l} height="100%" width="2px" className="self-stretch h-full" />
            )}
          </React.Fragment>
        ))}
      </div>
      <Button
        asChild
        variant={"outline"}
        className="w-full p-2 h-14 dark:bg-transparent uppercase rounded-full"
        style={{
          borderColor: color_l,
        }}
      >
        <Link href={getServiceLink(type, slug)} className="flex items-center justify-center gap-2">
          Subscribe Now <span className="font-urbanist font-semibold">₹{displayPrice} / mo</span>
        </Link>
      </Button>
    </div>
  );
};