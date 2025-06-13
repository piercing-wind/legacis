import {auth} from "@/auth";
import { findServiceById } from "@/lib/data/services";
import { TenureDiscount } from "@/types/service";
import { cashfree } from "@/lib/payment/cashfree";
import { db } from "@/lib/db";
import { findCouponByCode } from "@/lib/data/coupon";
import { findComboPlanServiceById } from "@/lib/data/comboServices";


export const GET = (request: Request) => {
   return new Response(JSON.stringify({ message: "Ristricted Access" }), { status: 200 });
}

export const POST = auth(async (request)=> {
   try{
      if(!request.auth) throw new Error("Unauthorized");

      const user = request.auth.user;

      const { serviceId, comboPlanId, tenureDays, tenureDicount, coupon, agreementSummary } = await request.json();

      if ((!serviceId && !comboPlanId) || (serviceId && comboPlanId)) {
         throw new Error("Either serviceId or comboPlanId must be present, but not both.");
      }
      if (tenureDays == null || tenureDicount == null) throw new Error("Tenure days and discount are required");

      let entity = null;
      if (serviceId) {
        entity = await findServiceById(serviceId);
      } else if (comboPlanId) {
        entity = await findComboPlanServiceById(comboPlanId);
      }
       
      if (!entity) throw new Error("Service not found");
      if (!entity.active) throw new Error("Service is not active");
      
      if (!Array.isArray(entity.tenureDiscounts)) {
      throw new Error("No plans available for this service.");
      }

      const validPlan = entity.tenureDiscounts.find(
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
      const price = Number(entity.price) * planMonths
      let finalPrice = Math.round(price * (1 - Number(tenureDicount) / 100));

      let couponData = null;
      if (coupon?.code) {
         couponData = await findCouponByCode({
           code: coupon.code,
           serviceId: serviceId || undefined,
           planDays: tenureDays,
           comboPlanId: comboPlanId || undefined
         });
         if (couponData && couponData.percentOff) {
            const discount = Math.round(finalPrice * (couponData.percentOff / 100));
            finalPrice = finalPrice - discount;
         }
      }


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
            serviceId: serviceId ? String(serviceId) : "",
            comboPlanId: comboPlanId ? String(comboPlanId) : "",
            tenureDays: String(tenureDays),
            tenureDicount: String(tenureDicount),
            coupon: coupon?.id || "",
            agreement: (agreementSummary.agreementNames).slice(0, 256),
         }
      }

      const order = await cashfree.PGCreateOrder(requestBody);
      if (order.status === 200) {
        console.log("Order created successfully:", order.data);
        await db.transaction.create({
         data: {
            orderId: order.data.order_id,
            userId: user.id,
            couponId : coupon.code || "",
            serviceId,
            comboPlanId,
            amount: order.data.order_amount || 0,
            tenure : {tenureDays, tenureDicount},
            status: "PENDING",
            paymentGateway: "CASHFREE",
            extraData : {
               couponCode: coupon,
               agreementSummary: agreementSummary,
            }
         }
        })
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