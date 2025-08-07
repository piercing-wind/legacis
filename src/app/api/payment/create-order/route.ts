import {auth} from "@/auth";
import { findServiceById } from "@/lib/data/services";
import { cashfree } from "@/lib/payment/cashfree";
import { db } from "@/lib/db";
import { findCouponByCode } from "@/lib/data/coupon";


export const GET = (request: Request) => {
   return new Response(JSON.stringify({ message: "Ristricted Access" }), { status: 200 });
}

export const POST = auth(async (request)=> {
   try{
      if(!request.auth) throw new Error("Unauthorized");

      const user = request.auth.user;

      const { serviceId, selectedPlan, coupon, agreementSummary } = await request.json();

      if (!serviceId) {
         throw new Error("ServiceId must be present!");
      }
      if (!selectedPlan) {
         throw new Error("Selected tenure is required!");
      }

      let service = await findServiceById(serviceId);
      if (!service) throw new Error("Service not found");
      if (!service.active) throw new Error("Service is not active");
      

      const validPlan = service.plans.find(plan => plan.id === selectedPlan.id);
      if (!validPlan) throw new Error("Invalid plan selected.");

      // Calculate pricing using ServicePlan model
      let basePrice = validPlan.price;
      let planDiscountAmount = validPlan.discount 
         ? Math.round(basePrice * validPlan.discount) 
         : 0;
      let finalPrice = basePrice - planDiscountAmount;
      
      
      let couponData = null;
      if (coupon?.code) {
         couponData = await findCouponByCode({
           code: coupon.code,
           serviceId: serviceId || undefined,
           planId: validPlan.id,
         });
         if (couponData && couponData.percentOff) {
            const discount = Math.round(finalPrice * couponData.percentOff);
            finalPrice = finalPrice - discount;
         }
      }

      // Add tax
      const taxAmount = Math.round(finalPrice * (service.taxPercent || 0) / 100);
      const taxedPrice = finalPrice + taxAmount;

      const shortUserId = String(user.id).slice(0, 8);
      const order_id = `LGC-${shortUserId}-${Date.now()}`;

      let requestBody = {
         order_id,
         order_currency: "INR",
         order_amount: taxedPrice,
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
            servicePlanId: validPlan.id,
            coupon: coupon?.id || "",
            plan : service.type  === 'PORTFOLIO_REVIEW' ? `Portfolio review upto ${validPlan.stockLimit}` : Math.round(Number(validPlan.durationInDays)/ 30) + "Months",
            agreement: (agreementSummary.agreementNames).slice(0, 256),
         }
      }

      const order = await cashfree.PGCreateOrder(requestBody);
      if (order.status !== 200) throw new Error(`Failed to create order: ${order.statusText}`);
      
      console.log("Order created successfully:", order.data);

      await db.transaction.create({
       data: {
          orderId: order.data.order_id,
          userId: user.id,
          couponId : coupon?.id || null,
          serviceId,
          amount: order.data.order_amount || 0,
          servicePlanId: validPlan.id,
          status: "PENDING", // Store the entire tenure object
          paymentGateway: "CASHFREE",
          extraData : {
             couponCode: coupon,
             agreementSummary: agreementSummary,
          }
       }
      })
      return new Response(JSON.stringify(order.data), { status: 200 });
   
   }catch(error){
      console.log("Error creating order:", error);
      if (typeof error === "object" && error !== null && "response" in error) {
         // @ts-expect-error: error.response is not typed
         console.log("Cashfree error response:", error.response.data);
      }
      return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
   }
})