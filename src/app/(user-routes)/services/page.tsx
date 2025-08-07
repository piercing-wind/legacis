import { GradientLine } from '@/components/icon'
import { ChartDummy, ServiceCard } from '@/components/services/serviceCard'
import { ServicesSearchBar } from '@/components/servicesSearchBar'
import { Button } from '@/components/ui/button'
import { findServices } from '@/lib/data/services'
import { cn, getServiceLink } from '@/lib/utils'
import { getColorForCardByServiceType } from '@/lib/utils/serviceCardColorGenerator'
import { getServiceDisplayPrice } from '@/lib/utils/servicePricingDisplay'
import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
    title: "Services",
    description: "Explore our range of financial services designed to meet your investment needs.",
};


type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams || {};
  const query = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const type = typeof params.type === "string" ? params.type : "";

  const services = (await findServices())
   .filter((service) => {
     if (type && type !== "ALL") {
       if (type === "RESEARCH_ADVISORY") {
         if (
           service.type !== "RESEARCH_ADVISORY" &&
           service.type !== "RESEARCH_ADVISORY_MODEL_PORTFOLIO" 
         ) return false;
      } else {
        if (service.type !== type) return false;
      }
    }
     // Filter by search query if present
     if (query && !service.name.toLowerCase().includes(query)) return false;
     return true;
   })
   // .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

   const filteredServices = services
     .filter((service) =>
     service.type !== 'PLATINA_WEALTH' && 
     service.type !== 'RESEARCH_ADVISORY_MUTUAL_FUNDS'

   )

   const mutualFundServices = services.filter(
      (service) => service.type === 'RESEARCH_ADVISORY_MUTUAL_FUNDS'
   )

   const platinaWealthServices = services.filter(
     (service) => service.type === 'PLATINA_WEALTH'
   );
   
  const {color, color_l, card_tw, btn_tw} = getColorForCardByServiceType('RESEARCH_ADVISORY_MUTUAL_FUNDS');
  return (
    <main className='w-full h-full px-5 lg:px-10 xl:px-24 py-14'>
      <ServicesSearchBar 
         q={query}
         type={type}
      />
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center gap-12 mt-16">
         {services.length === 0 && (
            <div className="col-span-3 text-center">
               <p className="text-lg text-gray-600">No services found.</p>
               </div>
         )}
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      { mutualFundServices.length > 0 && (
         <div className={cn('border w-full rounded-2xl p-6', card_tw)}>
            <h2 className="text-xl font-semibold">Legacis - Mutual Funds Portfolios</h2>
            <p className="text-base text-purple-800 my-4 ">Explore our curated mutual fund portfolios designed to meet your investment goals.</p>
            <GradientLine color={color_l} height="2px" width="100%"/>
               <ChartDummy color={color} />
            <GradientLine color={color_l} height="2px" width="100%"/>
            <Button 
               asChild 
               variant={'outline'} 
               className={cn(`w-full tracking-wider text-base text-neutral-700 dark:text-neutral-900 p-2 h-14 border uppercase rounded-full mt-4`, btn_tw)}
               >
            <Link href={getServiceLink('RESEARCH_ADVISORY_MUTUAL_FUNDS', '/mutual-funds')} target="_blank" className="dark:hover:!text-white">
               Explore More
            </Link>
            </Button>
         </div>
      )}
      </section>

      {platinaWealthServices.length > 0 && (
         <section className="mt-16">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {platinaWealthServices.map((service) => {
                     
               const { discountedPrice, basePrice } = getServiceDisplayPrice(service.plans);
               
               return (
                  <div key={service.id} className="w-full flex flex-col rounded-3xl col-span-2 border border-violet-400 
                     bg-gradient-to-br from-violet-50 via-white to-violet-100 
                     dark:bg-gradient-to-br dark:from-neutral-800 dark:via-neutral-50/10 dark:to-neutral-800 
                     shadow-xl p-8 relative overflow-hidden">
                     <div className="absolute top-4 right-4 bg-violet-400 text-white px-4 py-1 rounded-full text-xs font-bold shadow">
                        {service.label || "PREMIUM"}
                      </div>
                     <h3 className="text-2xl font-semibold text-violet-900 dark:text-violet-100 mb-2">{service.name}</h3>
                     <p className="text-base text-violet-800 mb-4 ">{service.tag}</p>
                     <div className="flex items-baseline gap-2 mb-4">
                     <span className="text-4xl font-bold text-violet-700 dark:text-violet-400 font-urbanist">₹{discountedPrice}</span>
                     <span className="text-sm text-violet-600 dark:text-violet-400">/ Yr</span>
                     </div>
                     <p className="text-sm text-violet-700 mb-6">{service.description}</p>
                     <Link
                        href={getServiceLink(service.type, service.slug)}
                        className="mt-auto inline-block bg-violet-400 hover:bg-violet-500 text-white hover:!text-white font-semibold rounded-full px-6 py-3 text-center transition"
                        >
                        View Details
                     </Link>
                  </div>
               )
            })}
         </div>
      </section>
      )}

      

    </main>
  )
}

export default Page