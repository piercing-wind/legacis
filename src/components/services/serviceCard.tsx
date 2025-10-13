"use client";
import { GradientLine, GradientLineVertical, Line } from "../icon";
import { Button } from "../ui/button";

import { Area, ComposedChart } from "recharts";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import Link from "next/link";
import type { ServiceFeature } from "@/types/service";
import React from "react";
import { chartDataForServiceCard } from "@/lib/data/static-data";
import { cn, getServiceLink } from "@/lib/utils";
import { getColorForCardByServiceType } from "@/lib/utils/serviceCardColorGenerator";
import { getServiceDisplayPrice } from "@/lib/utils/servicePricingDisplay";
import { ServiceWithComplimentary } from "@/lib/data/services";
import Image from "next/image";

export const ServiceCard = ({
  service,
}: {
  service: ServiceWithComplimentary;
}) => {
   switch (service.type) {
      case "MUTUAL_FUNDS":
         return <MutualFundServiceCard />;
      case "PORTFOLIO_REVIEW":
         return <PortfolioReviewServiceCard />;
      default:
         return <RegularServiceCard service={service} />;
   }
}


export const RegularServiceCard = ({
  service,
}: {
  service: ServiceWithComplimentary;
}) => {
  const { name, tag, features, type, slug } = service;
  const { color, color_l, card_tw, btn_tw } =
    getColorForCardByServiceType(type);
  const parsedFeatures: ServiceFeature | undefined = features
    ? (features as ServiceFeature)
    : undefined;

  // Array.isArray(chart) ? chart : [];
  const chartData = chartDataForServiceCard;

  const chartConfig = {
    main: { label: "mainLabel", color: "#4AEDB9" },
    comparison: { label: "comparisonLabel", color: "#2563eb" },
  } satisfies ChartConfig;

  const { displayPrice } = getServiceDisplayPrice(service.plans);

  return (
    <Link
      href={getServiceLink(type, slug)}
      target="_blank"
      className={cn(
        "w-full relative overflow-clip flex flex-col rounded-2xl border p-4 sm:p-6 self-stretch dark:bg-neutral-800/50 hover:shadow-neutral-50 dark:hover:shadow-neutral-800",
        card_tw
      )}
    >
      {service.type == "COMBO" && (
        <span className="absolute rotate-45 top-6 -right-8 bg-purple-400 text-white px-12 py-1 text-xs font-bold shadow">
          COMBO
        </span>
      )}
      <h5 className="text-2xl font-semibold mb-1 text-neutral-800 dark:text-neutral-100">{name}</h5>
      <p className="text-sm">{tag}</p>
      <div className="flex items-baseline justify-between mt-6 mb-2">
        <span className="flex items-baseline">
          <h2 className="font-urbanist !text-5xl !font-semibold text-neutral-800 dark:text-neutral-100">
            ₹{displayPrice}
          </h2>
          <p className="text-sm">/ month</p>
        </span>
        <span
          className="p-2 py-1 rounded-lg text-sm"
          style={{
            background: color + "20",
          }}
        >
          {service.label || "New"}
        </span>
      </div>
      <GradientLine color={color_l} height="2px" width="100%" />
      {service.type === "COMBO" && service.complimentaryService?.length ? (
        <div className="w-full flex flex-col justify-center min-h-[150px] h-full items-stretch mb-2 sm:mb-auto py-4 text-neutral-800 dark:text-neutral-100">
          <h6 className="font-medium mb-4">Get Access to :</h6>
          <div className="grid grid-cols-2
           gap-4 ">
            {service.complimentaryService.map((cs, idx) => (
              <div
                key={cs.id + idx}
                className={cn(
                  "w-full h-full border rounded-lg p-2 relative",
                  `border-[${color}]`
                )}
              >
                <Image
                  src={`/trading.png`}
                  alt={cs.name || "Service Icon"}
                  width={20}
                  height={20}
                  className="absolute bottom-1 right-1 w-6 h-6 sm:w-8 sm:h-8 opacity-50 filter grayscale"
                />

                <div className="flex items-start gap-1 sm:gap-3">
                  <Image
                    src="/icons/favicon.ico"
                    alt={cs.name || "Service Icon"}
                    width={20}
                    height={20}
                    className="rounded-full sm:mt-1"
                  />

                  <div>
                    <h3 className="text-xs font-semibold">
                      {cs.name.substring(0, 44)}
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1 sm:leading-5 tracking-wide">
                      {(cs.tag || "").substring(0, 75)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="">
          <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient
                  id={`colorDesktop-${service.slug}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
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
      )}
      <GradientLine color={color_l} height="2px" width="100%" />
      {parsedFeatures?.highlights && parsedFeatures.highlights.length > 0 ? (
         <div className="w-full flex flex-row flex-nowrap items-stretch text-nowrap gap-2 my-2 h-20 sm:min-h-20">
         {parsedFeatures?.highlights?.slice(0, 3).map((item, idx, arr) => (
            <React.Fragment key={item.name + idx}>
               <div className="relative flex flex-col w-full h-24 items-center justify-center text-wrap text-center">
                  <p className="text-xs">{item.name}</p>
                  <p className="text-sm sm:text-base font-medium mt-2">{item.value}</p>
               </div>
               {idx < arr.length - 1 && (
               <GradientLineVertical
                  color={color_l}
                  height="100%"
                  width="2px"
                  className="self-stretch h-full"
               />
               )}
            </React.Fragment>
         ))}
         </div>
      ) : (
         <div className="mb-4"/>
      )}
      <Button
        variant={"outline"}
        className={cn(
          `w-full tracking-wider text-base text-neutral-700 dark:text-neutral-900 hover:dark:text-neutral-200 mt-auto p-2 h-14 border uppercase rounded-full`,
          btn_tw
        )}
      >
        Explore More
      </Button>
    </Link>
  );
};

export const MutualFundServiceCard = () => {
   const {color, color_l, card_tw, btn_tw} = getColorForCardByServiceType('MUTUAL_FUNDS');
   return (
      <Link 
         href={getServiceLink('MUTUAL_FUNDS', '/mutual-funds')} target="_blank"
         className={cn('border w-full rounded-2xl p-6 hover:shadow-neutral-50 dark:hover:shadow-neutral-800 items-stretch h-full flex flex-col', card_tw)}>
         <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Legacis - Mutual Funds Portfolios</h2>
         <p className="text-base text-purple-800 my-4 ">Explore our curated mutual fund portfolios designed to meet your investment goals.</p>
         <GradientLine color={color_l} height="2px" width="100%"/>
            <ChartDummy color={color} />
         <GradientLine color={color_l} height="2px" width="100%"/>
         <div className="py-2"/>
         <Button 
            variant={'outline'} 
            className={cn(`w-full mt-auto tracking-wider text-base text-neutral-700 dark:text-neutral-900 p-2 h-14 border uppercase rounded-full dark:hover:!text-white`, btn_tw)}
            >
            Explore More
         </Button>
      </Link>
   );
};

export const PortfolioReviewServiceCard = () => {
   const {color, color_l, card_tw, btn_tw} = getColorForCardByServiceType('MUTUAL_FUNDS');
   return (
      <Link 
         href={getServiceLink('PORTFOLIO_REVIEW', '/portfolio-review')} target="_blank"
         className={cn('border w-full rounded-2xl p-6 hover:shadow-neutral-50 dark:hover:shadow-neutral-800 items-stretch h-full flex flex-col', card_tw)}>
         <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Legacis - Portfolio Review</h2>
         <p className="text-base text-purple-800 my-4 ">Get expert analysis of your stock portfolio with clear advice on which stocks to hold or sell for better returns.</p>
         <GradientLine color={color_l} height="2px" width="100%"/>
            <ChartDummy color={color} />
         <GradientLine color={color_l} height="2px" width="100%"/>
         <div className="py-2"/>
         <Button 
            variant={'outline'} 
            className={cn(`w-full mt-auto tracking-wider text-base text-neutral-700 dark:text-neutral-900 p-2 h-14 border uppercase rounded-full dark:hover:!text-white`, btn_tw)}
            >
            Explore More
         </Button>
      </Link>
   );
};

export const ChartDummy = ({color}:{color:string}) => {
   const chartData = chartDataForServiceCard;
   const chartConfig = {
      main: { label: "mainLabel", color: "#4AEDB9" },
      comparison: { label: "comparisonLabel", color: "#2563eb" },
   } satisfies ChartConfig;
  return (
    <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
      <ComposedChart data={chartData}>
        <defs>
          <linearGradient
            id={`colorDesktop`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="main"
          stroke={color}
          fillOpacity={1}
          fill={`url(#colorDesktop)`}
          dot={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
};
