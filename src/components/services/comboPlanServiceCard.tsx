import { ComboPlanWithServices } from "@/lib/data/comboServices";
import { TenureDiscount } from "@/types/service";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Line } from "../icon";

const ComboPlanServiceCard = ({
  comboPlanService,
}: {
  comboPlanService: ComboPlanWithServices;
}) => {

     const tenureArr: TenureDiscount[] = Array.isArray(comboPlanService?.tenureDiscounts) ? comboPlanService?.tenureDiscounts as TenureDiscount[] : [];
     const maxTenure = tenureArr.reduce((max, curr) => curr.days > max.days ? curr : max, tenureArr[0]);
  
     const basePrice = Number(comboPlanService.price || 0) * (maxTenure?.days ?? 0) / 30;
     const discountPercent = maxTenure?.discount ?? 0;
     const displayPrice = Math.round((basePrice * (1 - discountPercent / 100))/ 12) ; 

     const slug = comboPlanService.slug;
   const color = "combo-plan"
  return (
    <div className="w-full rounded-2xl border border-legacisBlue/10 p-6 bg-gradient-to-r from-pink-50/50 to-purple-100/50 dark:bg-gradient-to-r dark:from-pink-500/5 dark:to-purple-500/5"
      style={{
         boxShadow: `0 0 16px 0 var(--${color})`,
      }}
    >
      <h5 className="!text-xl">{comboPlanService.name}</h5>
      <p className="!text-sm">{comboPlanService.description}</p>
      <h6 className="mt-4">Get Access to:</h6>
      <div className="w-full mt-4 flex flex-row flex-nowrap items-center gap-2 max-h-20">
        {comboPlanService.services?.slice(0, 3).map((item, idx, arr) => (
          <React.Fragment key={item.id}>
            <span className="relative flex flex-col w-full h-full items-center justify-center">
              <p className="text-xs">{idx + 1}</p>
              <p className="font-medium text-sm">{item.service?.name}</p>
            </span>
            {idx < arr.length - 1 && (
              <Line color="var(--text-color)" vertical height="100%" width="2px" className="self-stretch h-full" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="items-baseline grid grid-cols-2 mt-6 w-full">
         <span className="flex items-baseline">
            <h2 className="font-urbanist !text-5xl !font-semibold">₹{displayPrice}</h2><p className="text-sm">/ month</p>
         </span>
         <Button asChild variant={'outline'} className="w-full mt-auto p-2 h-14 border-2 bg-transparent border-legacisPurple/30 uppercase rounded-full">
           <Link href={`/services/combo/${slug}`}>
              Subscribe Now
           </Link>
         </Button>
      </div>
    </div>
  );
};

export default ComboPlanServiceCard;
