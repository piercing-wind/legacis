import React from "react"
import { Line } from "@/components/icon"
import Chart from "@/components/services/chart"
import { isServicePurchased, findServiceBySlug, getServiceDataById } from "@/lib/data/services"
import { ChartDataPoint, FaqItem, ServiceFeature, TenureDiscount } from "@/types/service"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import Plans from "@/components/services/plans"
import Faq from "@/components/services/faq"
import RecomendedServices from "@/components/services/recomendedServices"
import PurchasedServiceSection from "@/components/services/purchasedServiceSection"
import { Session } from "@/actions/session"
import { User } from "next-auth"
import { formatHumanDate } from "@/lib/utils"
import { findAgreementsByServiceId } from "@/lib/data/agreement"
import { CheckoutForm } from "@/components/services/checkoutForm"
import {notFound} from "next/navigation"
import { SparklesText } from "@/components/magicui/sparkles-text";
import { ShinyButton } from "@/components/magicui/shiny-button";
import { PlatinaPendingStage, PlatinaServiceCard } from "@/components/services/platinaServicePurchasedSection"
import { findUserPlatinaRecommendation } from "@/lib/data/platina"


export default async function Page() {
   const session = await Session();
   const user : User = session?.user

   const service = await findServiceBySlug('platina-wealth');
   if(!service) notFound();

   let purchasedService = null;
   if (user?.id && service?.id) {
     purchasedService = await isServicePurchased(user.id, service.id);
   }

   let data = null;
   if (service?.id && service?.type) {
      data = await getServiceDataById(service.id, service.type);
   }


   const features: ServiceFeature | undefined = service?.features ? (service?.features as ServiceFeature) : undefined;
   
   const tenureArr: TenureDiscount[] = Array.isArray(service?.tenureDiscounts) ? service?.tenureDiscounts as TenureDiscount[] : [];
   const maxTenure = tenureArr.reduce((max, curr) => curr.days > max.days ? curr : max, tenureArr[0]);

   const basePrice = Number(service?.price || 0) * (maxTenure?.days ?? 0) / 30;
   const discountPercent = maxTenure?.discount ?? 0;
   const displayPrice = Math.round((basePrice * (1 - discountPercent / 100))/ 12) ;

   const highlights = [
    ...(features?.highlights ?? []),
    { name: "Subscription Starting", value: `₹${displayPrice}/mo` }
   ];


   const chartData = Array.isArray(service?.chart) ? (service.chart as ChartDataPoint[]) : [];
   chartData.sort((a, b) => {
     const [dayA, monthA, yearA] = a.date.split('-').map(Number);
     const [dayB, monthB, yearB] = b.date.split('-').map(Number);
     const dateA = new Date(yearA, monthA - 1, dayA);
     const dateB = new Date(yearB, monthB - 1, dayB);
     return dateA.getTime() - dateB.getTime();
   });

   const latestData = chartData[chartData.length - 1];

   let agreement = null;
   if(!purchasedService){
      agreement = await findAgreementsByServiceId(service?.id || '');
   }
   
   const userRecommendation = await findUserPlatinaRecommendation(user?.id);
   
   return (
      <main className='wfull px-5 lg:px-10 xl:px-24 py-8'>
       
       {purchasedService && service &&
         <>
            <h5 className="mb-4 text-xl font-medium">{service.name}</h5>
            {!userRecommendation ? 
            (
            <PlatinaPendingStage 
              serviceName={service.name} 
              expiryDate={purchasedService.expiryDate} 
            />
            ) : (
               <PlatinaServiceCard userRecommendation={userRecommendation}/>
            )}
         </>
       }
      <section className=" z-20 bg-background flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-8 w-full my-8">
         <div className="w-full relative lg:min-w-2xl xl:min-w-3xl flex-1 border space-y-8 rounded-2xl p-2 mb-4 lg:mb-0 max-h-[64vh] overflow-y-auto">
            <div className="sticky top-0 z-5 bg-background p-4 rounded-2xl mb-4 min-h-[60vh]">
               <h3 className="text-lg font-semibold mb-2">Section 1</h3>
               <p>Your content here - this will stick to top when scrolling within the left container</p>
            </div>
            <div className="sticky top-0 z-6 bg-pink-100 p-4 rounded-2xl mb-4 min-h-[60vh]">
               <h3 className="text-lg font-semibold mb-2">Section 2</h3>
               <p>Your content here - this will stick after section 1</p>
            </div>
            <div className="sticky top-0 z-7 bg-amber-100 p-4 rounded-2xl mb-4 min-h-[60vh]">
               <h3 className="text-lg font-semibold mb-2">Section 3</h3>
               <p>Your content here - this will stick after section 2</p>
            </div>
            <div className="sticky top-0 z-8 bg-green-100 p-4 rounded-2xl mb-4 min-h-[60vh]">
               <h3 className="text-lg font-semibold mb-2">Section 4</h3>
               <p>Your content here - this will stick after section 3</p>
            </div>
            <div className="sticky top-0 z-9 bg-purple-100 p-4 rounded-2xl mb-4 min-h-[60vh]">
               <h3 className="text-lg font-semibold mb-2">Section 5</h3>
               <p>Your content here - this will stick after section 4</p>
            </div>
            <div className="sticky top-4 z-10 bg-red-100 p-4 rounded-2xl mb-4 min-h-[60vh]">
               <h3 className="text-lg font-semibold mb-2">Section 6</h3>
               <p>Your content here - this will stick after section 5</p>
            </div>
         </div>
         <div className={`max-w-xl w-full flex-1 border border-platina/70 rounded-2xl p-4 flex flex-col gap-2 shadow-[0_0_20px_var(--platina)]/50 self-stretch`}>
            <h6 className="text-xl font-medium">{service?.name}</h6>
            <p className="text-xs">{service?.tag}</p>
            <p className="text-xs my-2">{service?.description}</p>
            <Line color="var(--text-color)" height="2px" className="self-stretch opacity-20"/>
            {highlights &&
               Array.from({ length: Math.ceil(highlights.length / 3) }).map((_, rowIdx) => {
               const rowItems = highlights.slice(rowIdx * 3, rowIdx * 3 + 3);
               return (
               <div
                  key={rowIdx}
                  className="w-full flex flex-row items-center justify-center text-nowrap gap-2 my-2 h-20"
               >
                  {rowItems.map((item, idx) => (
                  <React.Fragment key={item.name + idx}>
                     <span className="relative flex flex-col gap-2 w-full h-full items-center justify-center">
                     <p className="text-xs text-wrap text-center">{item.name}</p>
                     <p className="font-medium">{item.value}</p>
                     </span>
                     {idx < rowItems.length - 1 && (
                     <Line
                     color="var(--text-color)"
                     vertical
                     height="100%"
                     width="2px"
                     className="self-stretch h-full opacity-20"
                     />
                     )}
                  </React.Fragment>
                  ))}
               </div>
               );
               })}
            <Line color="var(--text-color)" height="2px" className="self-stretch opacity-20"/>
            {purchasedService ? (
               <Button variant={'outline'}  className="w-full border-2 mt-auto p-2 h-10 lg:h-14 uppercase rounded-full">
               <span className="text-green-500">Subscribed</span> | 
               <span className="text-xs">
                  Expiring On: {formatHumanDate(purchasedService.expiryDate)}
               </span>
               </Button>
            ):(
            <Drawer >
               <DrawerTrigger asChild>
               <ShinyButton  className={`w-full bg-platina/70 mt-auto p-2 h-10 lg:h-14 uppercase rounded-full flex items-center`}>
               Subscribe Now
               </ShinyButton>
               </DrawerTrigger>
               <DrawerContent>
               <div className="mx-auto w-full max-w-7xl p-4 pb-24 overflow-x-hidden overflow-y-auto flex flex-col lg:flex-row items-stretch justify-between gap-4">
               <div className="rounded-2xl border flex-1 min-w-0 flex flex-col mb-4 lg:mb-0">
                  <DrawerHeader>
                     <DrawerTitle className="!text-2xl lg:!text-3xl">Subscription Plans</DrawerTitle>
                  </DrawerHeader>
                  <Plans
                     price={Number(service?.price) || 0}
                     tenureDiscounts={tenureArr}
                  />
               </div>
               <div className="flex-1 min-w-0 flex flex-col">
                  <CheckoutForm
                     service={service}
                     agreement={agreement}   
                  />
               </div>
               </div>
               </DrawerContent>
            </Drawer>
            )}
         </div>
      </section>
         
         <Faq className="mt-8" title={service?.name || ''}   
            faq={Array.isArray((service?.faq as any)?.faq)
                ? ((service?.faq as any).faq as FaqItem[])
                : []
          }/>   
          
         <RecomendedServices/>
      </main>
  )
}