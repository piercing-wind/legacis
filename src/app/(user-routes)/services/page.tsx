import { ServiceCard } from '@/components/services/serviceCard'
import { ServicesSearchBar } from '@/components/servicesSearchBar'
import { Button } from '@/components/ui/button'
import { findServices } from '@/lib/data/services'
import { cn, getServiceLink, getUniqueSpecialServices } from '@/lib/utils'
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

   const filteredServices = getUniqueSpecialServices(
   services.filter(service => service.type !== 'PLATINA_WEALTH')
   );
   
   const platinaWealthServices = services.filter(
     (service) => service.type === 'PLATINA_WEALTH'
   );

  return (
    <main className='w-full h-full px-5 lg:px-10 xl:px-24 py-14'>
      <ServicesSearchBar 
         q={query}
         type={type}
      />
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch gap-12 mt-16">
         {services.length === 0 && (
            <div className="col-span-3 text-center">
               <p className="text-lg text-gray-600">No services found.</p>
               </div>
         )}
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}

      </section>

      {platinaWealthServices.length > 0 && (
         <section className="mt-16">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {platinaWealthServices.map((service) => {
                     
               const { discountedPrice, basePrice } = getServiceDisplayPrice(service.plans);
               
               return (
                  <Link 
                     key={service.id} 
                     href={getServiceLink(service.type, '/services/platina-wealth')}
                     target="_blank"
                     className="w-full flex flex-col rounded-3xl col-span-2 border border-violet-400 
                     bg-gradient-to-br from-violet-50 via-white to-violet-100 
                     dark:bg-gradient-to-br dark:from-neutral-800 dark:via-neutral-50/10 dark:to-neutral-800 hover:shadow-neutral-50 dark:hover:shadow-neutral-800
                     shadow-xl p-8 relative overflow-hidden">
                     <div className="absolute top-4 right-4 bg-violet-400 text-white px-4 py-1 rounded-full text-xs font-bold shadow">
                        {service.label || "PREMIUM"}
                      </div>
                     <h3 className="text-2xl font-semibold text-violet-900 dark:text-violet-200 mb-2">{service.name}</h3>
                     <p className="text-base text-violet-800 mb-4">{service.tag}</p>
                     <div className="flex items-baseline gap-2 mb-4 text-violet-700 dark:text-violet-300">
                        <span className="text-4xl font-bold font-urbanist">₹{discountedPrice}</span>
                        <span className="text-sm">/ Yr</span>
                     </div>
                     <p className="text-sm text-violet-700 mb-6">{service.description}</p>
                     <Button
                        variant="outline"
                        className="w-full h-auto bg-violet-400 hover:bg-violet-500 dark:bg-violet-400 dark:hover:bg-violet-500 text-white hover:!text-white font-medium uppercase text-md rounded-full px-6 py-3 text-center transition"
                        >
                        View Details
                     </Button>
                  </Link>
               )
            })}
         </div>
      </section>
      )}

      

    </main>
  )
}

export default Page