import React from "react"
import { GradientLine, Line } from "@/components/icon"
import Chart from "@/components/services/chart"
import { isServicePurchased, findServiceBySlug, getServiceDataById, findServicesByIds } from "@/lib/data/services"
import { ChartDataPoint, FaqItem, Philosophy, ServiceFeature } from "@/types/service"
import { Button } from "@/components/ui/button"
import Faq from "@/components/services/faq"
import PurchasedServiceSection from "@/components/services/purchasedServiceSection"
import { Session } from "@/actions/session"
import { User } from "next-auth"
import { formatHumanDate, getUniqueSpecialServices } from "@/lib/utils"
import { findAgreementsByServiceId } from "@/lib/data/agreement"
import { notFound, redirect } from "next/navigation"
import { ZoomIn } from "@/components/animation/zoom"
import Image from "next/image"
import { getServiceDisplayPrice } from "@/lib/utils/servicePricingDisplay"
import { QuillHtmlViewer } from "@/components/richTextViewer"
import { ServiceCard } from "@/components/services/serviceCard"
import { Metadata } from "next"
import SubscribeDrawer from "@/components/services/SubscribeDrawer"

export async function generateMetadata({params}:{ params: Promise<{ slug: string }>}) : Promise<Metadata> {
   const { slug } = await params;
   const service = await findServiceBySlug(slug);
   if(!service || service.type === 'PLATINA_WEALTH' || service.type === 'MUTUAL_FUNDS') {
      return {
         title: "Service Not Found",
         description: "The requested service could not be found.",
         robots: {
            index : false,
            follow: true,
            nocache: true,
            googleBot: {
               index: false,
               follow: true,
               noimageindex: true,
               'max-video-preview': 0,
               'max-image-preview': 'none',
               'max-snippet': 0,
            },
            }
      }
   }
   return {
      title: service.name,
      description: service.description || `Learn more about Legacis Capital ${service.name} service.`,
   }
}

export default async function Page({params}: { params: Promise<{ slug: string }>}) {
   const session = await Session();
   const user : User = session?.user

   const { slug } = await params
   const service = await findServiceBySlug(slug);
   
   if(!service || service.type === 'PLATINA_WEALTH' || service.type === 'MUTUAL_FUNDS') notFound(); 
   let purchasedService = null;

   if (user?.id && service?.id) {
     purchasedService = await isServicePurchased(user.id, service.id);
   }

   let data = null;
   if (service?.id && service?.type) {
      data = await getServiceDataById(service.id, service.type);
   }

   const features: ServiceFeature | undefined = service?.features ? (service?.features as ServiceFeature) : undefined;
   
   const { displayPrice } = getServiceDisplayPrice(service.plans);

   

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

   const agreement = await findAgreementsByServiceId(service?.id || '');

   const philosophyColor = [
      "#F0F7FF", "#F1FFFA", "#E2FFE9", "#F6F0FF", "#E6F7FF", "#F0F7FF"
   ];

   let recommendations;
   const recommendedServicesIds: string[] = Array.isArray(service?.recommendedService) ? (service.recommendedService as string[]) : [];
   
   if(recommendedServicesIds.length > 0) {
      recommendations = await findServicesByIds(recommendedServicesIds);
   }
   
   const recommendedServices = getUniqueSpecialServices(recommendations ?? []);


   let delta: any = service.afterPurchaseFeaturesDelta || { ops: [{ insert: "Thank you for your purchase!" }] }
   if (typeof delta === "string") {
      try {
         delta = JSON.parse(delta);
      } catch {
         delta = { ops: [{ insert: service.afterPurchaseFeaturesDelta }] };
      }
   }

   const complimentaryServices = (service?.complimentaryService ?? [])
     .map((item: any) => item?.complimentaryService ?? item)
     .filter(Boolean);

   
   return (
      <main className='w-full px-5 lg:px-10 xl:px-24 py-8'>
       
       {purchasedService && service &&
         <>
            <h5 className="mb-4 text-xl font-medium">{service.name}</h5>
            <PurchasedServiceSection serviceType={service.type} data={data}/>
         </>
       }
       <section className="flex flex-col-reverse xl:flex-row items-stretch justify-center gap-8 w-full my-8">
         {!service.chart ? (
            <div className="w-full lg:min-w-3xl xl:min-w-4xl flex-1 relative rounded-2xl lg:mb-0">
               <h2 className="text-xl font-medium mb-4">Our Philosphy</h2>
               <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.isArray(service?.philosophy) &&
                     (service.philosophy as Philosophy[]).map((item, index) => (
                        <ZoomIn
                           key={index}
                           delay={index * 0.1}
                           className={`w-full p-8 overflow-clip rounded-xl text-neutral-800 min-h-52 flex gap-6 flex-col items-start justify-center hover:shadow-lg transition-all duration-500 relative`}
                           style={{ background: `var(--philosophy-bg-${index % 6})` }}
                        >
                           <Image
                              src={`/icons/philosophy/${(index % philosophyColor.length) + 1 }.png`}
                              alt={`Philosophy ${index + 1}`}
                              width={100}
                              height={100}
                              className="absolute top-0 right-0 w-14 h-14 opacity-60"
                           />
                           <h3 className="font-medium text-lg">{item.title}</h3>
                           <p className="text-sm !text-neutral-600">{item.description}</p>
                        </ZoomIn>
                     ))
                  }
               </div>
              
            </div>
         ):(
         <div className="w-full lg:min-w-3xl xl:min-w-4xl flex-1 relative border rounded-2xl p-2 mb-4 lg:mb-0 ">
            <div className="w-full flex flex-col md:flex-row md:items-center gap-1 md:gap-8 justify-center">
               <p className="text-sm">{(service?.name)?.slice(0, 20)}: <span className="text-green-500">{latestData?.main ?? ""}</span></p>
               <p className="text-sm">{service?.comparisonTitle}: <span className="text-green-500">{latestData?.comparison ?? ""}</span></p>
            </div>
            <Chart
               chartData={chartData}
               mainLabel={service?.name || "Main"}
               comparisonLabel={service?.comparisonTitle || "Comparison"}
            />
         </div>
         )}

         <div className="xl:max-w-xl w-full flex-1 rounded-2xl p-4 flex flex-col gap-2 border">
            <h1 className="!text-xl font-medium">{service?.name}</h1>
            <p className="text-xs">{service?.tag}</p>
            <p className="text-xs my-2">{service?.description}</p>
            <GradientLine color="var(--text-color)" height="2px" className="self-stretch opacity-20"/>
            
            {purchasedService && service.type !== 'PORTFOLIO_REVIEW'? (
               <div className="max-h-96 overflow-y-auto h-full">
                  <QuillHtmlViewer delta={delta} className="text-xs"/>   
               </div>
            ):(
            <>         
               {complimentaryServices.length > 0 && (
                  <div>
                     <h5 className="font-medium mb-2">Get Access to:</h5>
                     <div className="w-full grid grid-cols-2 gap-4">
                        {complimentaryServices.map((item, index) => (
                           <div  key={index} className="flex items-start gap-1 sm:gap-3 p-2 border rounded-lg">
                           <Image
                              src="/icons/favicon.ico"  
                              alt={item.name || "Service Icon"}
                              width={20}
                              height={20}
                              className="rounded-full sm:mt-1"
                           />
         
                           <div>
                              <h3 className="text-xs font-semibold">
                                 {item.name.substring(0, 44)}
                              </h3>
                              <p className="text-[10px] text-muted-foreground uppercase mt-1 sm:leading-[14px] tracking-wide">
                                 {(item.tag || "").substring(0, 75)}
                              </p>
                           </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
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
                              <span className="relative flex flex-col gap-2 text-wrap text-center w-full h-full items-center justify-center">
                                 <p className="text-xs">{item.name}</p>
                                 <p className="text-sm font-medium ">{item.value}</p>
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
            </>
         )}
           
            <Line color="var(--text-color)" height="2px" className="self-stretch opacity-20"/>
            {purchasedService && service.type !== 'PORTFOLIO_REVIEW' && purchasedService.expiryDate ? (
               <Button variant={'outline'}  className="w-full border-2 mt-auto p-2 h-10 lg:h-14 uppercase rounded-full">
                  <span className="text-green-500">Subscribed</span> | 
                  <span className="text-xs">
                     Expiring On: {formatHumanDate(purchasedService.expiryDate)}
                  </span>
               </Button>
            ):(
               <SubscribeDrawer
                  user={user}
                  service={service}
                  servicePlans={service.plans}
                  agreement={agreement}
                  complimentaryServices={complimentaryServices}
               />
            )}
         </div>
         </section>
         
         <Faq className="mt-8" title={service?.name || ''}   
            faq={Array.isArray((service?.faq as any)?.faq)
                ? ((service?.faq as any).faq as FaqItem[])
                : []
          }/>   
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