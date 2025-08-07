import ServiceEditClientWrapper from "@/components/admin/service-edit-client-wrapper";
import { findAgreementsId_Name } from "@/lib/data/admin/agreement";
import { findServiceById, findServices } from "@/lib/data/admin/services";
import { notFound } from "next/navigation";


export default async function Page({params}: { params: Promise<{ id: string }>}) {
   const { id } = await params;

    let service = null;
    
   const [agreement, services] = await Promise.all([
     findAgreementsId_Name(),
     findServices(),
   ]);

    if (id !== "new") {
       service = await findServiceById(id);
       if (!service) {
          notFound();
       }
    }

   return (
      <div className="p-8 max-w-7xl mx-auto pb-14 mb-14">

         <ServiceEditClientWrapper service={service} services={services} agreement={agreement} />
      </div>
   );
}