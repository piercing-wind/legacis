'use client';

import React, { use, useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button";
import Plans from "@/components/services/plans"
import { CheckoutForm } from "@/components/services/checkoutForm"
import { Service, ServicePlan, Agreement, UserRiskProfile } from "@/prisma/generated/client";
import { useSession } from 'next-auth/react';
import { User } from 'next-auth';
import { toast } from 'sonner';



const MutualFundSubscribeNow = ({
   service,
   plans,
   agreement,
   riskProfile,
   complimentaryServices
}:{
   service: Service | null,
   plans: ServicePlan[],
   agreement: Agreement[] | null,
   riskProfile: UserRiskProfile | null,
   complimentaryServices?: Service[]
}) => {
   const [open, setOpen] = useState(false);

   const riskLevel = riskProfile?.riskLevel;
   function handleClick() {
      if (!riskProfile) {
         toast("Please complete your risk profile before subscribing.",{
            action: {
               label: "Complete Now",
               onClick: () => {
                  window.location.href = "/profile";
               }
            }
         });
         return;
      }
      if(riskLevel === 'CONSERVATIVE' && (service?.slug.includes('aggressive') || service?.slug.includes('moderate'))) {
         toast.error("Your risk score is too low to subscribe to this service.", {
            description: "Please update your risk profile or choose a different Mutual Funds service to subscribe.",
            action:{
               label: "Update Now",
               onClick: () => {
                  window.location.href = "/profile";
               }
            }
         });
         return;
      }
      if(riskLevel === 'MODERATE' && service?.slug.includes('aggressive')) {
         toast.error("Your risk score is too low to subscribe to this service.", {
            description: "Please update your risk profile or choose a different Mutual Funds service to subscribe.",
            action:{
               label: "Update Now",
               onClick: () => {
                  window.location.href = "/profile";
               }
            }
         });
         return;
      }
      setOpen(true);
   }

   return (
      <Drawer open={open} onOpenChange={setOpen}>
         <Button 
            className="w-full mt-auto p-2 h-10 lg:h-14 uppercase rounded-full"
             onClick={handleClick}
          >Subscribe Now
         </Button>
        <DrawerContent>
          <div className="mx-auto w-full max-w-7xl p-4 pb-24 overflow-x-hidden overflow-y-auto flex flex-col lg:flex-row items-stretch justify-between gap-4">
            <div className="rounded-2xl border flex-1 min-w-0 flex flex-col mb-4 lg:mb-0">
              <DrawerHeader>
                <DrawerTitle className="!text-2xl lg:!text-3xl">Subscription Plans</DrawerTitle>
              </DrawerHeader>
              <Plans 
                service={service}
                plans={plans}
             />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <CheckoutForm service={service} agreement={agreement} complimentaryServices={complimentaryServices} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
   )
}

export default MutualFundSubscribeNow;