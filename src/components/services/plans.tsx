'use client'
import { TenureDiscount } from "@/types/service";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setTenureDiscount } from "@/lib/slices/checkoutSlice";
import { useEffect } from "react";



export default function Plans({price, tenureDiscounts}: {price: number, tenureDiscounts: TenureDiscount[]}) {
   const dispatch = useAppDispatch();
   const selectedTenure = useAppSelector(state => state.checkout.tenureDiscount);
   
   useEffect(() => {
      if (tenureDiscounts.length > 0) {
         dispatch(setTenureDiscount(tenureDiscounts[tenureDiscounts.length - 1]));
      }
   },[])

   return (
      <div className="w-full p-2 sm:p-4">

         <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-stretch sm:items-center justify-between gap-4">
            {tenureDiscounts.map((tenure, index) => {
              const months = Math.round(tenure.days / 30);
              const priceWithoutDisc = Math.round(months * price);
              const hasDiscount = tenure.discount > 0;
              const finalPrice = hasDiscount
                ? Math.round(priceWithoutDisc * (1 - tenure.discount / 100))
                : priceWithoutDisc;

              const isSelected = selectedTenure && selectedTenure.days === tenure.days && selectedTenure.discount === tenure.discount;
              return (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={()=>dispatch(setTenureDiscount(tenure))}
                  key={index}
                  className={`w-full hover:scale-105 transition-all duration-300 cursor-pointer rounded-xl p-4 flex flex-col gap-2 relative dark:shadow dark:shadow-neutral-600 bg-gradient-to-r from-purple-100 to-blue-100 dark:bg-gradient-to-r dark:from-neutral-800 dark:to-neutral-800
                    ${isSelected ? "border-2 border-legacisPurple" : "border border-transparent"}`}
                >
                  {hasDiscount && (
                    <span className="absolute right-2 top-2 text-sm">{tenure.discount}% Off</span>
                  )}
                  <h6 className="!text-xl">{months} Month{months > 1 ? "s" : ""}</h6>
                  <p>
                    {hasDiscount && (
                      <>
                        <span className="font-urbanist line-through">₹{priceWithoutDisc}</span> &nbsp;
                      </>
                    )}
                    <span className="font-urbanist text-2xl text-neutral-900 dark:text-neutral-50 font-semibold">₹{finalPrice}</span>
                    &nbsp;
                    <span className="text-xs">+ 18% GST</span> 
                  </p>
                </div>
              );
            })}
         </div>
      </div>
   )
}