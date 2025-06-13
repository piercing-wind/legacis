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

      if(!signature) throw new Error("Signature header is missing");
      if(!timestamp) throw new Error("Timestamp header is missing");

      const rawBody = await request.text();

      if (!verifyWebhookSignature(rawBody, signature, timestamp)) throw new Error("Invalid signature");

      const body = JSON.parse(rawBody);
      
      console.log("Received webhook event:", body);

      switch (body.type) {
         case "PAYMENT_SUCCESS_WEBHOOK":
            console.log("Payment successful:", body.data);
            let extraData;

            const transaction = await db.transaction.findFirst({
            where: { orderId: body.data.order_id },
            });
            if (transaction && transaction.extraData) {
             extraData = transaction.extraData;
            }

            const payment = body.data.payment;
            const order = body.data.order;
            const customer_details = body.data.customer_details;
            const payment_gateway_details = body.data.payment_gateway_details;


            await db.transaction.update({
              where: { orderId: body.data.order_id },
              data: {
                status: payment.payment_status,
                paymentGateway: payment_gateway_details.gateway_name,
                webhookResponse : JSON.stringify(body),
                paymentId: payment.cf_payment_id,
                amount: payment.payment_amount,
                currency : payment.payment_currency,
                updatedAt: new Date(),
              }
            })

            if(transaction?.serviceId){
               const days = (transaction.tenure as any)?.tenureDays! || 0;
               const planDiscount = (transaction.tenure as any)?.tenureDicount || 0;
               const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                await db.userPurchasedServices.create({
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

            if (transaction?.comboPlanId) {
               const comboPlan = await db.comboPlan.findUnique({
                  where: { id: transaction.comboPlanId },
                  include: { services: true },
               })
               const days = (transaction.tenure as any)?.tenureDays! || 0;
               const planDiscount = (transaction.tenure as any)?.tenureDicount || 0;
               const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

               for (const service of comboPlan?.services || []) {
                  await db.userPurchasedServices.create({
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

            return Response.json({ message: "Payment success event received" }, { status: 200 });
         default:
            return Response.json({ message: "Event type not handled" }, { status: 200 });
      }

   }catch(error){
      return Response.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
   }
}