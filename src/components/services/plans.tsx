'use client'
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectPlan, setCoupon } from "@/lib/slices/checkoutSlice";
import { useEffect } from "react";
import { Service, ServicePlan } from "@/prisma/generated/client";
import Link from "next/link";



export default function Plans({plans, service}: {plans: ServicePlan[], service?: Service | null}) {
   const dispatch = useAppDispatch();
   const selectedPlan = useAppSelector(state => state.checkout.service.selectedPlan);
   
   useEffect(() => {
      if (plans.length > 0) {
         dispatch(selectPlan(plans[plans.length - 1]));
      }
   },[plans, dispatch])

  const isPortfolioReview = service?.type === 'PORTFOLIO_REVIEW';
  const highestStocks = Math.max(
    ...plans
      .filter(p => typeof p.stockLimit === "number")
      .map(p => p.stockLimit ?? 0)
  );

   return (
      <div className="w-full p-2 sm:p-4">

         <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-stretch sm:items-center justify-between gap-4">
           {plans.map((plan, index) => {
          const months = Math.round(plan.durationInDays / 30);
          const hasDiscount = !!plan.discount && plan.discount > 0;
          let priceWithoutDisc = plan.price;
          let finalPrice = hasDiscount
            ? Math.round(plan.price * (1 - plan.discount!))
            : plan.price;

          const isSelected = selectedPlan && selectedPlan.id === plan.id;

          return (
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                dispatch(selectPlan(plan));
                dispatch(setCoupon(null));
              }}
              key={plan.id}
              className={`w-full hover:scale-105 transition-all duration-300 cursor-pointer rounded-xl p-4 flex flex-col gap-2 relative dark:shadow dark:shadow-neutral-600 bg-gradient-to-r from-purple-100 to-blue-100 dark:bg-gradient-to-r dark:from-neutral-800 dark:to-neutral-800
                ${isSelected ? "border-2 border-legacisPurple" : "border border-transparent"}`}
            >
              {hasDiscount && (
                <span className="absolute right-2 top-2 text-sm">{Math.round((plan.discount ?? 0) * 100)}% Off</span>
              )}
              {isPortfolioReview ? (
                <>
                  <h6 className="!text-xl">Up to {plan.stockLimit || `Plan ${index + 1}`} Stocks</h6>
                  <p>
                    {hasDiscount && (
                      <>
                        <span className="font-urbanist line-through">₹{priceWithoutDisc}</span> &nbsp;
                      </>
                    )}
                    <span className="font-urbanist text-2xl text-neutral-900 dark:text-neutral-50 font-semibold">₹{finalPrice}</span>
                    &nbsp;
                    <span className="text-xs">+ Tax</span>
                  </p>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          );
        })}
        {/* Only for Portfolio review */}
        {isPortfolioReview && highestStocks > 0 && (
          <Link href={'/contact'}>
            <div
              className={`w-full hover:scale-105 transition-all min-h-26 duration-300 cursor-pointer rounded-xl p-4 flex flex-col gap-2 relative dark:shadow dark:shadow-neutral-600 bg-gradient-to-r from-purple-100 to-blue-100 dark:bg-gradient-to-r dark:from-neutral-800 dark:to-neutral-800`}
            >
              <h6 className="!text-xl text-neutral-800 dark:text-neutral-100">For more than {highestStocks} Stocks</h6>
              <p className="!text-sm"> Please contact our sales team. <span className="text-purple-600">here</span></p>
            </div>
          </Link>
        )}
      </div>
    </div>
   )
}