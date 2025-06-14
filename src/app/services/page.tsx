import ComboPlanServiceCard from '@/components/services/comboPlanServiceCard'
import { ServiceCard } from '@/components/services/serviceCard'
import { findComboPlanServices } from '@/lib/data/comboServices'
import { findServices } from '@/lib/data/services'
import React from 'react'

const Page = async () => {
   const services = await findServices()
   const comboPlanServices = await findComboPlanServices()
  return (
    <main className='w-full h-full px-5 lg:px-10 xl:px-24 py-14'>
      <section className="grid grid-cols-2 items-center gap-12 mb-8">
         {comboPlanServices.map((comboPlanService) => (
           <ComboPlanServiceCard key={comboPlanService.id} comboPlanService={comboPlanService} />
         ))}
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center gap-8 mt-16">
         {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
         ))}
      </section>
    
    </main>
  )
}

export default Page