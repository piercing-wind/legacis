import React from "react"
import { Line } from "@/components/icon"
import Chart from "@/components/services/chart"
import { findActivePurchasedServiceByUserAndService, findServiceBySlug, getServiceDataById } from "@/lib/data/services"
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
import { findAgreementById } from "@/lib/data/agreement"
import { CheckoutForm } from "@/components/services/checkoutForm"

export default async function Page({params}: { params: Promise<{ slug: string }>}) {
   const session = await Session();
   const user : User = session?.user

   const { slug } = await params
   const service = await findServiceBySlug(slug)
   
   let purchasedService = null;
   if (user?.id && service?.id) {
     purchasedService = await findActivePurchasedServiceByUserAndService(user.id, service.id);
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
   const sortedChartData = chartData
    .slice()
    .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());

   const latestData = sortedChartData[sortedChartData.length - 1];


   const agreement = await findAgreementById(service?.agreementId || '');

   return (
      <main className='w-full px-5 lg:px-10 xl:px-24 py-8'>
       
       {purchasedService && service &&
         <>
            <h5 className="mb-4">{service.name}</h5>
            <PurchasedServiceSection serviceType={service?.type} data={data}/>
         </>
       }
       <section className="flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-8 w-full my-8">
         <div className="w-full lg:min-w-3xl xl:min-w-4xl flex-1 relative border rounded-2xl py-2 mb-4 lg:mb-0">
            <div className="w-full flex items-center gap-8 justify-center">
               <p className="text-sm">{service?.name}: <span className="text-green-500">{latestData?.main ?? ""}</span></p>
               <p className="text-sm">{service?.comparisonTitle}: <span className="text-green-500">{latestData?.comparison ?? ""}</span></p>
            </div>
            <Chart
               chartData={sortedChartData}
               mainLabel={service?.name || "Main"}
               comparisonLabel={service?.comparisonTitle || "Comparison"}
            />
         </div>
         <div className="max-w-xl w-full flex-1 border rounded-2xl p-4 flex flex-col gap-2">
            <h6 className="!text-xl">{service?.name}</h6>
            <p className="text-xs">Legacis Direct - {service?.tag}</p>
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
               <Button  className="w-full mt-auto p-2 h-10 lg:h-14 uppercase rounded-full">
                  Subscribe Now
               </Button>
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
                      user={user}
                      service={service}
                      agreementContent={agreement?.content || ''}   
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