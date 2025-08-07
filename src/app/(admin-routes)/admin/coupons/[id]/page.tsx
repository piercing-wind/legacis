import { CouponForm } from "@/components/admin/coupon-form";
import { findCouponById } from "@/lib/data/admin/coupon";
import { findServices } from "@/lib/data/admin/services";

export default async function Page({params}: { params: Promise<{ id: string }>}) {
   const { id } = await params;
   console
   const [services, coupon] = await Promise.all([
      findServices(),
      id === "new" ? null : findCouponById(id),
   ]);

   return (
      <div className="p-8 w-full  overflow-x-auto mx-auto pb-14 mb-14">
         <CouponForm 
            defaultValues={coupon} 
            services={services?.map(service => ({ id: service.id, name: service.name, plans: service.plans }))} />
      </div>
   );
}