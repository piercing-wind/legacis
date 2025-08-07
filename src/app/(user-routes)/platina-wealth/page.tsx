import React, { use } from "react"
import { GradientLine, GradientLineVertical, Line } from "@/components/icon"
import Chart from "@/components/services/chart"
import { isServicePurchased, findServiceBySlug, getServiceDataById, findServicesByIds, ServiceWithComplimentary } from "@/lib/data/services"
import { ChartDataPoint, FaqItem, ServiceFeature } from "@/types/service"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import Plans from "@/components/services/plans"
import Faq from "@/components/services/faq"
import { Session } from "@/actions/session"
import { User } from "next-auth"
import { formatHumanDate, getServiceLink } from "@/lib/utils"
import { findAgreementsByServiceId } from "@/lib/data/agreement"
import { CheckoutForm } from "@/components/services/checkoutForm"
import {notFound} from "next/navigation"
import { ShinyButton } from "@/components/magicui/shiny-button";
import { PlatinaPendingStage, PlatinaServiceCard } from "@/components/services/platinaServicePurchasedSection"
import { findUserPlatinaRecommendation } from "@/lib/data/platina"
import { getUserRiskProfileById } from "@/lib/data/admin/risk-profile"
import { redirect } from "next/navigation";
import { ServiceCard } from "@/components/services/serviceCard"
import { getServiceDisplayPrice } from "@/lib/utils/servicePricingDisplay"
import { ArrowBigDownDash, Layers, LineChart, Shuffle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default async function Page() {
   const session = await Session();
   const user : User = session?.user

   const service = await findServiceBySlug('platina-wealth');
   
   if(!service) notFound(); 
   if(!user) redirect('/authenticate?callbackurl=/platina-wealth');

   let purchasedService = null;
   if (user?.id && service?.id) {
     purchasedService = await isServicePurchased(user.id, service.id);
   }

   // To show premium user 
   let data = null;
   if (service?.id && service?.type) {
      data = await getServiceDataById(service.id, service.type);
   }

   const features: ServiceFeature | undefined = service?.features ? (service?.features as ServiceFeature) : undefined;
   
   const { displayPrice } = getServiceDisplayPrice(service.plans);

   const highlights = [
    ...(features?.highlights ?? [])
   ];

   let agreement = null;
   if(!purchasedService){
      agreement = await findAgreementsByServiceId(service?.id || '');
   }
   
   const [userRecommendation, riskProfile ] = await Promise.all([
      findUserPlatinaRecommendation(user?.id),
      getUserRiskProfileById(user?.id)
   ]);

   let recommendedServices : ServiceWithComplimentary[] = []
   const recommendedServicesIds: string[] = Array.isArray(service?.recommendedService)
      ? Array.from(new Set(service.recommendedService as string[]))
      : [];
      
   if(recommendedServicesIds.length > 0) {
      recommendedServices = await findServicesByIds(recommendedServicesIds);
   }

   return (
      <main className='w-full px-5 lg:px-10 xl:px-24 py-8'>
       
      <h5 className="mb-4 text-2xl font-medium">{service.name}</h5>
       {purchasedService && service &&
            <PlatinaServiceCard 
               userRecommendation={userRecommendation} 
               riskProfile={riskProfile} 
               expiryDate={purchasedService.expiryDate}
            />
       }
      <section className="relative z-20 bg-background flex flex-col lg:flex-row justify-center gap-4 lg:gap-8 w-full my-8">
         <div className="w-full relative lg:min-w-2xl xl:min-w-3xl space-y-12 rounded-2xl mb-4 lg:mb-0">
            <div className="sticky top-40 z-5 bg-gradient-to-br from-[#e3d4f9] via-white to-[#e3d4f9] dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 p-4 sm:p-10 rounded-2xl mb-4 min-h-[550px] sm:min-h-[500px] shadow-lg shadow-neutral-100 dark:shadow-neutral-800">
               <h3 className="text-lg sm:text-2xl font-medium mb-2">Custom <span className="text-legacisPurple/90 dark:text-purple-400">Investment</span> Advisory</h3>
               <p className="text-sm sm:text-base">Bespoke equity & mutual fund portfolio construction aligned to your goals, risk profile, and liquidity needs.</p>
               <div className="mt-4 sm:mt-8 border-t-2 w-1/2 border-purple-300/80 dark:border-purple-200/80"/>
               <div className="w-full mt-6 sm:mt-12 grid sm:grid-cols-3 gap-6 place-items-center relative">
                  <div className="flex flex-row sm:flex-col min-h-24 sm:min-h-52 w-full items-center justify-center gap-2 p-4 rounded-xl bg-white border border-purple-200/50 dark:bg-[#e3d4f9] transition shadow-2xl hover:shadow-lg shadow-neutral-100 dark:shadow-purple-500/10">
                     <Image
                        src="/icons/line.png"
                        alt="Portfolio Icon"
                        width={40}
                        height={40}
                        className="mb-2 filter "
                     />
                     <span className="text-xs sm:text-sm md:text-base text-neutral-700 text-center">
                      Fresh portfolio design from the ground up
                     </span>
                  </div>
                  <div className="flex flex-row sm:flex-col min-h-24 sm:min-h-52 w-full items-center justify-center gap-2 p-4 rounded-xl bg-white border border-purple-200/50 dark:bg-[#e3d4f9] transition shadow-2xl hover:shadow-lg shadow-neutral-100 dark:shadow-purple-500/10">
                     <Image
                        src="/icons/money.png"
                        alt="Portfolio Icon"
                        width={40}
                        height={40}
                        className="mb-2 filter "
                     />
                     <span className="text-xs sm:text-sm md:text-base text-neutral-700 text-center">
                     Balanced allocation across market caps & sectors
                     </span>
                  </div>
                  <div className="flex flex-row sm:flex-col min-h-24 sm:min-h-52 w-full items-center justify-center gap-2 p-4 rounded-xl bg-white border border-purple-200/50 dark:bg-[#e3d4f9] transition shadow-2xl hover:shadow-lg shadow-neutral-100 dark:shadow-purple-500/10">
                     <Image
                        src="/icons/planning.png"
                        alt="Portfolio Icon"
                        width={40}
                        height={40}
                        className="mb-2 filter "
                     />
                     <span className="text-xs sm:text-sm md:text-base text-neutral-700 text-center">
                      Strategic, rule-based entries & exits using the LEGACIS framework
                     </span>
                  </div>
               </div>
            </div>
            <div className="sticky top-40 z-5 bg-gradient-to-br from-[#e3d4f9] via-white to-[#e3d4f9] dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 p-4 sm:p-10 rounded-2xl mb-4 min-h-[550px] sm:min-h-[500px] shadow-lg shadow-neutral-100 dark:shadow-neutral-800">
               <h3 className="text-lg sm:text-2xl font-medium mb-2"><span className="text-legacisPurple/90 dark:text-purple-400">Comprehensive</span> Portfolio Review</h3>
               <p className="text-sm sm:text-base">A deep dive into your existing holdings to assess quality, risk, and alignment with your objectives.</p>
               <div className="mt-4 sm:mt-8 border-t-2 w-1/2 border-purple-300/80 dark:border-purple-200/80"/>
               <div className="w-full mt-6 sm:mt-12 grid sm:grid-cols-3 gap-6 place-items-center relative">
                  <div className="flex flex-row sm:flex-col min-h-24 sm:min-h-52 w-full items-center justify-center gap-2 p-4 rounded-xl bg-white border border-purple-200/50 dark:bg-[#e3d4f9] transition shadow-2xl hover:shadow-lg shadow-neutral-100 dark:shadow-purple-500/10">
                     <Image
                        src="/icons/technical.png"
                        alt="Technical Icon"
                        width={40}
                        height={40}
                        className="mb-2 filter"
                     />
                     <span className="text-xs sm:text-sm md:text-base text-neutral-700 text-center">
                      Technical & fundamental rating for each stock
                     </span>
                  </div>
                  <div className="flex flex-row sm:flex-col min-h-24 sm:min-h-52 w-full items-center justify-center gap-2 p-4 rounded-xl bg-white border border-purple-200/50 dark:bg-[#e3d4f9] transition shadow-2xl hover:shadow-lg shadow-neutral-100 dark:shadow-purple-500/10">
                     <Image
                        src="/icons/allocation.png"
                        alt="Allocation Icon"
                        width={40}
                        height={40}
                        className="mb-2 filter"
                     />
                     <span className="text-xs sm:text-sm md:text-base text-neutral-700  text-center">
                      Sector, market-cap, and diversification analysis
                     </span>
                  </div>
                  <div className="flex flex-row sm:flex-col min-h-24 sm:min-h-52 w-full items-center justify-center gap-2 p-4 rounded-xl bg-white border border-purple-200/50 dark:bg-[#e3d4f9] transition shadow-2xl hover:shadow-lg shadow-neutral-100 dark:shadow-purple-500/10">
                     <Image
                        src="/icons/thumbs-up.png"
                        alt="Portfolio Icon"
                        width={40}
                        height={40}
                        className="mb-2 filter"
                     />
                     <span className="text-xs sm:text-sm md:text-base text-neutral-700  text-center">
                      Clear hold/exit recommendations with rationale
                     </span>
                  </div>
               </div>
            </div>
            <div className="sticky top-40 z-5 bg-gradient-to-br from-[#e3d4f9] via-white to-[#e3d4f9] dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 p-4 sm:p-10 rounded-2xl mb-4 min-h-[550px] sm:min-h-[500px] shadow-lg shadow-neutral-100 dark:shadow-neutral-800">
               <h3 className="text-lg sm:text-2xl font-medium mb-2"> Access to <span className="text-legacisPurple/90 dark:text-purple-400">Research</span> Services</h3>
               <p className="text-sm sm:text-base">Exclusive access to our flagship research services for idea flow and market insights</p>
               <div className="mt-4 sm:mt-8 border-t-2 w-1/2 border-purple-300/80 dark:border-purple-200/80"/>
               <div className="w-full mt-6 sm:mt-12 grid sm:grid-cols-3 gap-6 place-items-center relative">
                  {service?.complimentaryService.map((item, idx) => {                    
                     return(
                        <div key={item.complimentaryService.id + idx} className="flex flex-col w-full items-center justify-center gap-2 p-4 rounded-xl bg-white border border-purple-200/50 dark:bg-[#e3d4f9] transition shadow-2xl hover:shadow-lg shadow-neutral-100 dark:shadow-purple-500/10 self-stretch">
                           <Link href={getServiceLink(item.complimentaryService.type, item.complimentaryService.slug)} className="flex items-start gap-1 sm:gap-3 w-full sm:min-h-28">
                              <Image
                                 src="/icons/favicon.ico"
                                 alt={item.complimentaryService.name || "Service Icon"}
                                 width={40}
                                 height={40}
                                 className="rounded-full sm:mt-1"
                              />
                              <div>
                                 <h3 className="text-base font-medium text-neutral-700">
                                    {item.complimentaryService.name.substring(0, 44)}
                                 </h3>
                                 <span className="text-xs sm:text-sm text-neutral-700 text-center">
                                    {(item.complimentaryService.tag || "").substring(0, 75)}
                                 </span>
                              </div>
                           </Link>
                        </div>
                  )})}
               </div>
            </div>
            <div className="sticky top-40 z-5 bg-gradient-to-br from-[#e3d4f9] via-white to-[#e3d4f9] dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 p-4 sm:p-10 rounded-2xl mb-4 min-h-[550px] sm:min-h-[500px] shadow-lg shadow-neutral-100 dark:shadow-neutral-800">
               <h3 className="text-lg sm:text-2xl font-medium mb-2"><span className="text-legacisPurple/90 dark:text-purple-400">Dedicated</span> Access to the Desk</h3>
               <p className="text-sm sm:text-base">Direct WhatsApp channel with our research team Year-round access for clarifications, portfolio queries, and review notes so you never feel adrift between reviews..</p>
               <div className="mt-4 sm:mt-8 border-t-2 w-1/2 border-purple-300/80 dark:border-purple-200/80"/>
               <div className="w-full mt-6 sm:mt-12 grid sm:grid-cols-3 gap-6 place-items-center relative">
                  <div className="flex flex-row sm:flex-col min-h-24 sm:min-h-52 w-full items-center justify-center gap-2 p-4 rounded-xl bg-white border border-purple-200/50 dark:bg-[#e3d4f9] transition shadow-2xl hover:shadow-lg shadow-neutral-100 dark:shadow-purple-500/10">
                     <Image
                        src="/icons/customer-support.png"
                        alt="Customer Support Icon"
                        width={40}
                        height={40}
                        className="mb-2 filter"
                     />
                     <span className="text-xs sm:text-sm md:text-base text-neutral-700  text-center">
                      Fast responses during market hours
                     </span>
                  </div>
                  <div className="flex flex-row sm:flex-col min-h-24 sm:min-h-52 w-full items-center justify-center gap-2 p-4 rounded-xl bg-white border border-purple-200/50 dark:bg-[#e3d4f9] transition shadow-2xl hover:shadow-lg shadow-neutral-100 dark:shadow-purple-500/10">
                     <Image
                        src="/icons/chat.png"
                        alt="Chat Icon"
                        width={40}
                        height={40}
                        className="mb-2 filter"
                     />
                     <span className="text-xs sm:text-sm md:text-base text-neutral-700  text-center">
                      Clear, actionable answers
                     </span>
                  </div>
                  <div className="flex flex-row sm:flex-col min-h-24 sm:min-h-52 w-full items-center justify-center gap-2 p-4 rounded-xl bg-white border border-purple-200/50 dark:bg-[#e3d4f9] transition shadow-2xl hover:shadow-lg shadow-neutral-100 dark:shadow-purple-500/10">
                     <Image
                        src="/icons/document.png"
                        alt="Document Icon"
                        width={40}
                        height={40}
                        className="mb-2 filter"
                     />
                     <span className="text-xs sm:text-sm md:text-base text-neutral-700  text-center">
                      Documented follow-ups
                     </span>
                  </div>
               </div>
            </div>
          
         </div>
         <div className={`max-w-lg w-full sticky top-40 rounded-2xl p-4 flex flex-col gap-2 self-start shadow-[0_0_30px_var(--platina)]/10 dark:bg-gradient-to-br dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900`}>
            <h6 className="text-xl font-medium text-legacisPurple/90 dark:text-purple-200">{service?.name}</h6>
            <p className="text-xs">{service?.tag}</p>
            <p className="text-xs my-2">{service?.description}</p>
            <GradientLine color="var(--text-color)" height="2px" className="self-stretch opacity-20"/>
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
                        <p className="text-xs font-medium sm:text-sm text-wrap text-center">{item.value}</p>
                     </span>
                     {idx < rowItems.length - 1 && (
                     <GradientLineVertical
                        color="var(--text-color)"
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
            <GradientLine color="var(--text-color)" height="2px" className="self-stretch opacity-20"/>
            {purchasedService && purchasedService.expiryDate ? (
               <Button variant={'outline'}  className="w-full border-2 p-2 h-10 lg:h-14 uppercase rounded-full">
               <span className="text-green-500">Subscribed</span> | 
               <span className="text-xs">
                  Expiring On: {formatHumanDate(purchasedService.expiryDate)}
               </span>
               </Button>
            ):(
            <Drawer >
               <DrawerTrigger asChild>
                  <ShinyButton  className={`w-full text-neutral-700 dark:text-neutral-800  font-medium bg-gradient-to-br from-legacisPurple/20 to-legacisBlue/20 dark:bg-gradient-to-br dark:from-purple-300 dark:to-purple-300 border border-purple-200 mt-auto p-2 h-10 lg:h-14 uppercase rounded-full flex items-center tracking-widest`}>
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
                    plans={service?.plans || []} 
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
          {}
         {/* <RecomendedServices/> */}
         { recommendedServices && recommendedServices.length > 0 && (
            <section className="w-full p-4 border rounded-2xl mt-8 dark:bg-neutral-800">
               <h6 className="text-xl font-medium mb-4">Recommended Services</h6>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                
                  {recommendedServices.map((service, idx) => (
                     <ServiceCard 
                        key={idx} 
                        service={service} 
                     />
                  ))}
               </div>
            </section>
         )}
      </main>
  )
}