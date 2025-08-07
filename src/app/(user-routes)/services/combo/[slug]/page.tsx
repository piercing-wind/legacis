import React from "react"
import { Line } from "@/components/icon"
import { ChartDataPoint, FaqItem, ServiceFeature } from "@/types/service"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import Plans from "@/components/services/plans"
import Faq from "@/components/services/faq"
import RecomendedServices from "@/components/services/recommendedServices"
import PurchasedServiceSection from "@/components/services/purchasedServiceSection"
import { Session } from "@/actions/session"
import { User } from "next-auth"
import { formatHumanDate } from "@/lib/utils"
import { findAgreementsByServiceId } from "@/lib/data/agreement"
import { CheckoutForm } from "@/components/services/checkoutForm"
// import { findActivePurchasedComboPlanServiceByUserIdAndId, findComboPlanServiceBySlug } from "@/lib/data/comboServices"
import Link from "next/link"

export default async function Page({params}: { params: Promise<{ slug: string }>}) {
   const session = await Session();
   const user : User = session?.user

   const { slug } = await params
   // const comboPlanservice = await findComboPlanServiceBySlug(slug);
   
   let purchasedService = null;
   // if (user?.id && comboPlanservice?.id) {
   // //   purchasedService = await findActivePurchasedComboPlanServiceByUserIdAndId(user.id, comboPlanservice.id);
   // }

   // let data = null;
   // if (service?.id && service?.type) {
   //    data = await getServiceDataById(service.id, service.type);
   // }


   // const tenureArr: TenureDiscount[] = Array.isArray(comboPlanservice?.tenureDiscounts) ? comboPlanservice?.tenureDiscounts as TenureDiscount[] : [];
   // const maxTenure = tenureArr.reduce((max, curr) => curr.days > max.days ? curr : max, tenureArr[0]);

   // const basePrice = Number(comboPlanservice?.price || 0) * (maxTenure?.days ?? 0) / 30;
   // const discountPercent = maxTenure?.discount ?? 0;
   // const displayPrice = Math.round((basePrice * (1 - discountPercent / 100))/ 12) ;

   // const chartData = Array.isArray(service?.chart) ? (service.chart as ChartDataPoint[]) : [];
   // chartData.sort((a, b) => {
   //   const [dayA, monthA, yearA] = a.date.split('-').map(Number);
   //   const [dayB, monthB, yearB] = b.date.split('-').map(Number);
   //   const dateA = new Date(yearA, monthA - 1, dayA);
   //   const dateB = new Date(yearB, monthB - 1, dayB);
   //   return dateA.getTime() - dateB.getTime();
   // });

   // const latestData = chartData[chartData.length - 1];


   // const agreement = await findAgreementsByComboPlanServiceId(comboPlanservice?.id || '');
   return (
      <div>
         No longer supported. Please visit our <Link href="/services">Services</Link> page to explore our offerings.
      </div>
   )

//    return (
//       <main className='w-full px-5 lg:px-10 xl:px-24 py-8'>
//        {purchasedService && comboPlanservice &&
//          <>
//             <h5 className="mb-4">{comboPlanservice.name}</h5>
//             {/* <PurchasedServiceSection serviceType={service?.type} data={data}/> */}
//          </>
//        }
//        <section className="flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-8 w-full my-8">
//          <div className="w-full lg:min-w-3xl xl:min-w-4xl flex-1 relative border rounded-2xl p-4 mb-4 lg:mb-0 ">
//             <h6>Get Access to:</h6>
//             <div className="flex flex-col gap-4 mt-4">
//                {comboPlanservice?.services?.map((item, idx) => {
//                   const service = item.service;
//                   const parsedFeatures: ServiceFeature | undefined = service?.features ? (service?.features as ServiceFeature) : undefined;
//                   return(
//                      <div key={service?.name + idx} className="w-full border rounded-xl p-4 relative">
//                         <span className="text-[10px] top-2 left-2 absolute">{idx + 1}</span>
//                         <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
//                            <div className="">
//                               <h6>{service.name}</h6>
//                               <p className="text-xs mb-2">{service.tag}</p>
//                               <p className="text-xs my-2">{(service.description)?.slice(0,50) + '...'}</p>
//                            </div>
//                            <Button asChild variant={'outline'} className="bg-blue-50">
//                               <Link href={`/services/${service.slug}`}>
//                                  View Details
//                               </Link>
//                            </Button>
//                         </div>
//                         <div className="w-full flex flex-row flex-nowrap items-center text-nowrap gap-2 mt-2 h-20">
//                         {parsedFeatures?.highlights?.slice(0, 3).map(( item, idx, arr) => (
//                            <React.Fragment key={item.name}>
//                              <span className="relative flex flex-col w-full h-full items-center justify-center">
//                                <p className="text-xs">{item.name}</p>
//                                <p className="font-medium">{item.value}</p>
//                              </span>
//                              {idx < arr.length - 1 && (
//                                <Line color="var(--text-color)" vertical height="100%"  width="2px" className="self-stretch h-full"/>
//                              )}
//                            </React.Fragment>
                        
//                            ))}
//                         </div>

//                      </div>
//                   )
//                })}
//             </div>
//          </div>
         
//          <div className="max-w-xl w-full flex-1 border rounded-2xl p-4 flex flex-col gap-2">
//             <h6 className="!text-xl">{comboPlanservice?.name}</h6>
//             <p className="text-xs my-2">{comboPlanservice?.description}</p>
//             <Line color="var(--text-color)" height="2px" className="self-stretch opacity-20"/>
//             <h6 className="!font-normal text-legacisPurple dark:text-legacisGreen">Maximize Your Value with These Services</h6>
//             <span className="mt-8 mb-4">Services:</span>
//             <div className="w-full flex flex-col gap-4 mb-8">
//                {comboPlanservice?.services?.map((item, idx) => (
//                   <div key={item.service.id} className="flex items-center gap-2 mb-2 w-full border-b pb-2 ">
//                      <span>{item?.service.name}</span>
//                   </div>
//                ))}
//             </div>


//             <span className="flex items-baseline w-full mt-auto">
//                <h2 className="font-urbanist !text-5xl !font-semibold">₹{displayPrice}</h2><p className="text-sm">/ month</p>
//             </span>
//             <Line color="var(--text-color)" height="2px" className="self-stretch opacity-20"/>
//             {purchasedService ? (
//                <Button variant={'outline'}  className="w-full mt-auto border-2 p-2 h-10 lg:h-14 uppercase rounded-full">
//                   <span className="text-green-500">Subscribed</span> | 
//                   <span className="text-xs">
//                      Expiring On: {formatHumanDate(purchasedService.expiryDate)}
//                   </span>
//                </Button>
//             ):(
//              <Drawer >
//                <DrawerTrigger asChild>
//                <Button  className="w-full mt-0 p-2 h-10 lg:h-14 uppercase rounded-full">
//                   Subscribe Now
//                </Button>
//                </DrawerTrigger>
//                <DrawerContent>
//               <div className="mx-auto w-full max-w-7xl p-4 pb-24 overflow-x-hidden overflow-y-auto flex flex-col lg:flex-row items-stretch justify-between gap-4">
//                   <div className="rounded-2xl border flex-1 min-w-0 flex flex-col mb-4 lg:mb-0">
//                     <DrawerHeader>
//                       <DrawerTitle className="!text-2xl lg:!text-3xl">Subscription Plans</DrawerTitle>
//                     </DrawerHeader>
//                     <Plans
//                       price={Number(comboPlanservice?.price) || 0}
//                       tenureDiscounts={tenureArr}
//                     />
//                   </div>
//                   <div className="flex-1 min-w-0 flex flex-col">
//                     <CheckoutForm
//                       service={comboPlanservice}
//                       agreement={agreement}   
//                     />
//                   </div>
//                </div>
//                </DrawerContent>
//             </Drawer>
//             )}
//          </div>
//          </section>
         
//          <Faq className="mt-8" title={comboPlanservice?.name || ''}   
//             faq={Array.isArray((comboPlanservice?.faq as any)?.faq)
//                 ? ((comboPlanservice?.faq as any).faq as FaqItem[])
//                 : []
//           }/>   
          
//          <RecomendedServices/>
//       </main>
//   )
}