import { sendMail } from '@/emails/sendmail';
import { SuccessPurchaseMailContext } from '@/emails/types';
import { db } from '@/lib/db';
import crypto from 'crypto';

function verifyWebhookSignature(rawBody : string, signature : string, timestamp : string) {
   const signedPayload = timestamp + rawBody;
   const secretKey = process.env.CASHFREE_PAYMENT_GATEWAY_TEST_SECRET;
  
   const expectedSignature = crypto
     .createHmac('sha256', secretKey!)
     .update(signedPayload)
     .digest('base64');
  
   return expectedSignature === signature;
}

export async function POST(request: Request) {
   try {
      
      const signature = request.headers.get('x-webhook-signature');
      const timestamp = request.headers.get('x-webhook-timestamp');
      const idempotencyKey = request.headers.get('x-idempotency-key');

      if(!signature) throw new Error("Signature header is missing");
      if(!timestamp) throw new Error("Timestamp header is missing");
      const now = Date.now();
      const FIVE_MINUTES = 5 * 60 * 1000;

      // if (Math.abs(now - Number(timestamp)) > FIVE_MINUTES) {
      //    throw new Error("Webhook timestamp is outside the acceptable window");
      // }

      const existingTxn = await db.transaction.findFirst({ where: { idempotencyKey } });
      if (existingTxn) {
         console.log("Duplicate webhook event received, ignoring");
         return Response.json({ message: "Duplicate event ignored" }, { status: 200 });
      }

      const rawBody = await request.text();

      if (!verifyWebhookSignature(rawBody, signature, timestamp)) throw new Error("Invalid signature");

      const body = JSON.parse(rawBody);
      
      const payment = body.data.payment;
      const order = body.data.order;
      const customer_details = body.data.customer_details;
      const payment_gateway_details = body.data.payment_gateway_details;
      let extraData :any;

      switch (body.type) {
         case "PAYMENT_SUCCESS_WEBHOOK":
            console.log("Payment successful:", body.data);

            await db.$transaction(async (txn)=>{
               const transaction = await txn.transaction.findFirst({
                 where: { orderId: order.order_id, status: "PENDING" },
               });
               if (!transaction) throw new Error("Transaction not found");
               
               extraData = transaction.extraData;
               
               await txn.transaction.update({
                  
                 where: { orderId: order.order_id },
                 data: {
                   status: payment.payment_status,
                   paymentGateway: payment_gateway_details.gateway_name,
                   webhookResponse : JSON.stringify(body),
                   idempotencyKey: idempotencyKey,
                   paymentId: payment.cf_payment_id,
                   amount: payment.payment_amount,
                   currency : payment.payment_currency,
                   updatedAt: new Date(),
                 }
               })
   
               //Handles single service purchase
               if(transaction?.serviceId){
                  const days = (transaction.tenure as any)?.tenureDays! || 0;
                  const planDiscount = (transaction.tenure as any)?.tenureDiscount || 0;
                  const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                   await txn.userPurchasedServices.create({
                       data: {
                         userId: customer_details.customer_id,
                         serviceId: transaction?.serviceId,
                         expiryDate,
                         planDays: days,
                         planDiscount,
                         agreementAcceptedAt: new Date(),
                         agreementData: (extraData as any)?.agreementSummary || {},
                       }
                     })
                  }
               // Handles combo plan
               if (transaction?.comboPlanId) {
                  const comboPlan = await txn.comboPlan.findUnique({
                     where: { id: transaction.comboPlanId },
                     include: { services: true },
                  })
                  const days = (transaction.tenure as any)?.tenureDays! || 0;
                  const planDiscount = (transaction.tenure as any)?.tenureDiscount || 0;
                  const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                  
                  if (comboPlan && comboPlan.services && comboPlan.services.length > 0) {
                     for (const service of comboPlan?.services) {
                        await txn.userPurchasedServices.create({
                           data: {
                             userId: customer_details.customer_id,
                             serviceId: service.serviceId,
                             expiryDate,
                             planDays: days,
                             planDiscount,
                             agreementAcceptedAt: new Date(), 
                             agreementData : (extraData as any)?.agreementSummary || {},
                           }
                        })
                     }
                  }
               }
            })
            const months = Math.round(Number(order.order_tags.tenureDays) / 30);
            const planDuration = months + ' ' + (months === 1 ? 'Month' : 'Months');

            const data : SuccessPurchaseMailContext = {
               customerName: customer_details.customer_name,
               serviceName: extraData.agreementSummary?.serviceName,
               planDuration,
               planType: order.order_tags.serviceId ? "Individual Service" : "Combo Service",
               orderId: order.order_id,
               transactionId: payment.cf_payment_id,
               amount: payment.payment_amount.toString(),
               currency: payment.payment_currency,
               paymentMethod: payment_gateway_details.gateway_name,
               purchaseDate: new Date(payment.payment_time).toLocaleDateString(),
               dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
               profileUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
               year: new Date().getFullYear().toString(),
            }
            await sendMail({
              to: customer_details.customer_email,
              subject: `Payment Successful - Order ID: ${order.order_id}`,
              template: 'successPurchase',
              context: data,
            });

            return Response.json({ message: "Payment success event received" }, { status: 200 });
         default:
            return Response.json({ message: "Event type not handled" }, { status: 200 });
      }

   }catch(error){
      console.error("Error processing webhook:", error);
      return Response.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
   }
}