import { ServiceCard } from '@/components/services/serviceCard'
import { findServices } from '@/lib/data/services'
import React from 'react'

const Page = async () => {
   const services = await findServices()
  return (
    <main className='w-full px-5 lg:px-10 xl:px-24 border py-14'>
      <section className="grid grid-cols-3 items-center gap-8">
         {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
         ))}
         {/* // <ServiceCard service={services[0]}/> */}
      </section>
    
    </main>
  )
}

export default Page