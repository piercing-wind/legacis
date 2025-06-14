import { ComboPlanWithServices } from "@/lib/data/comboServices";
import { TenureDiscount } from "@/types/service";
import React from "react";

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

  return (
    <div className="w-full rounded-2xl border border-legacisBlue/10 p-6 bg-gradient-to-r from-pink-50/50 to-purple-100/50"
      style={{
         // boxShadow: "0 0 16px 0 rgba(255, 169, 252, 0.4)"
         boxShadow: "0 0 16px 0 rgba(225, 205, 255, 0.8)"
      }}
    >
      <h5 className="!text-xl">{comboPlanService.name}</h5>
      <p className="!text-sm">{comboPlanService.description}</p>
      <div className="flex items-baseline justify-between mt-6 mb-2">
         <span className="flex items-baseline">
            <h2 className="font-urbanist !text-5xl !font-semibold">₹{displayPrice}</h2><p className="text-sm">/ month</p>
         </span>
         <span className='p-2 py-1 rounded-lg shadow shadow-legacisGreen/50 text-sm'>Trending</span>
      </div>
      <ul>
        {comboPlanService.services.map((s) => (
          <li key={s.id}>{s.service?.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ComboPlanServiceCard;
