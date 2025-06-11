import {auth} from "@/auth";
import { findServiceById } from "@/lib/data/services";
import { TenureDiscount } from "@/types/service";
import { cashfree } from "@/lib/payment/cashfree";


export const GET = (request: Request) => {
   return new Response(JSON.stringify({ message: "Ristricted Access" }), { status: 200 });
}

export const POST = auth(async (request)=> {
   try{
      if(!request.auth) throw new Error("Unauthorized");

      const user = request.auth.user;

      const { serviceId, tenureDays, tenureDicount } = await request.json();

      if (!serviceId) throw new Error("Service ID is required");
      if (tenureDays == null || tenureDicount == null) throw new Error("Tenure days and discount are required");


      const service = await findServiceById(serviceId);
      if (!service) throw new Error("Service not found");
      if (!service.active) throw new Error("Service is not active");
      
      if (!Array.isArray(service.tenureDiscounts)) {
      throw new Error("No plans available for this service.");
      }

      const validPlan = service.tenureDiscounts.find(
      (plan): plan is TenureDiscount =>
         typeof plan === "object" &&
         plan !== null &&
         "days" in plan &&
         "discount" in plan &&
         typeof (plan as any).days === "number" &&
         typeof (plan as any).discount === "number" &&
         (plan as any).days === tenureDays &&
         (plan as any).discount === tenureDicount
      );

      if (!validPlan) throw new Error("Invalid plan selected. Please choose a valid plan.");


      const planMonths = Math.round(Number(tenureDays) / 30);
      const price = Number(service.price) * planMonths
      const finalPrice = Math.round(price * (1 - Number(tenureDicount) / 100));

      const shortUserId = String(user.id).slice(0, 8);
      const order_id = `LGC-${shortUserId}-${Date.now()}`;

      let requestBody = {
         order_id,
         order_currency: "INR",
         order_amount: finalPrice,
         customer_details: {
            customer_id: user.id,
            customer_name: user.name || "Guest",   
            customer_phone : user.phone || "0000000000",
            customer_email: user.email || "",

         },
         order_meta: {
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
         },
         order_tags : {
            serviceId: String(serviceId),
            tenureDays: String(tenureDays),
            tenureDicount: String(tenureDicount),
         }
      }

      const order = await cashfree.PGCreateOrder(requestBody);
      if (order.status === 200) {
         console.log("Order created successfully:", order.data);
        return new Response(JSON.stringify(order.data), { status: 200 });
      }
      throw new Error(`Failed to create order: ${order.statusText}`);

   }catch(error){
      if (typeof error === "object" && error !== null && "response" in error) {
         // @ts-expect-error: error.response is not typed
         console.error("Cashfree error response:", error.response.data);
      }
      return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
   }
})