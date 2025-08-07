import { ServiceCard } from "./services/serviceCard";
import { ServiceWithComplimentary } from "@/lib/data/services";

async function HomeServices({services}:{services: ServiceWithComplimentary[]}) {
   return(
      <div>
         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center gap-12 mt-16">
            {services.length === 0 && (
               <div className="col-span-3 text-center">
                  <p className="text-lg text-gray-600">No services found.</p>
               </div>
            )}
            {services.map((service) => (
               <ServiceCard key={service.id} service={service} />
            ))}
         </section>
      </div>
   )
}

export default HomeServices;