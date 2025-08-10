import { sendMail } from '@/emails/sendmail';
import { SuccessPurchaseMailContext } from '@/emails/types';
import { db } from '@/lib/db';
import { formatDateWithTime } from '@/lib/utils';
import { createSubscription } from '@/lib/utils/subscription-service';
import { ServicePlan, ServiceType } from '@/prisma/generated/client';
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

      const existingTxn = await db.transaction.findFirst({
          where: { idempotencyKey }, 
    
         });
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
      let extraData :any; // Initialize extraData to hold additional information about agreement


      switch (body.type) {
         case "PAYMENT_SUCCESS_WEBHOOK":

            const res =  await db.$transaction(async (txn)=>{
               const transaction = await txn.transaction.findFirst({
                 where: { orderId: order.order_id, status: "PENDING" },
                 include: { servicePlan: true },
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
   
               // Grant main service access
               const mainService = await txn.service.findUnique({
                 where: { id: transaction.serviceId },
                 include: {
                  complimentaryService: {
                      include: {
                        complimentaryService: true, // Include the actual complimentary service details
                        complimentaryPlan : true
                     }
                 }},
               });

               if (!mainService) throw new Error("Service not found");

               const createdMainService = await createSubscription({
                  userId: customer_details.customer_id,
                  serviceId: mainService.id,
                  selectedPlan: transaction.servicePlan as ServicePlan,
                  grantType: 'PURCHASED',
                  paymentId: payment.cf_payment_id,
                  transactionId: transaction.id, // Link to the transaction record
                  agreementData: extraData.agreementSummary, // Store agreement data
                  agreementAcceptedAt: new Date(),
               });

               // Grant access to all complimentary services
               for (const comp of mainService.complimentaryService) {
                  // Get the complimentary service details to check its type
                  const complimentaryServiceType = comp.complimentaryService.type;
                 if (complimentaryServiceType === ServiceType.PORTFOLIO_REVIEW) {
                  await createSubscription({
                     userId: customer_details.customer_id,
                     serviceId: comp.complimentaryServiceId,
                     selectedPlan: comp.complimentaryPlan as ServicePlan, 
                     grantType: 'COMPLIMENTARY',
                     paymentId: payment.cf_payment_id,
                     transactionId: transaction.id,
                     parentServiceId: mainService.id, // Link to the main service that triggered this
                     agreementData: extraData.agreementSummary,
                     agreementAcceptedAt: new Date(),

                  });
                 } else {
                     // Other services: Use configured plan but override duration to match main service
                     await createSubscription({
                        userId: customer_details.customer_id,
                        serviceId: comp.complimentaryServiceId,
                        customPlanDays: transaction.servicePlan?.durationInDays, // Override duration
                        grantType: 'COMPLIMENTARY',
                        paymentId: payment.cf_payment_id,
                        transactionId: transaction.id,
                        parentServiceId: mainService.id,
                        agreementData: extraData.agreementSummary,
                        agreementAcceptedAt: new Date(),
                     });
                }
            }

               return createdMainService;
            });
            
            // Prepare mail context
            const data : SuccessPurchaseMailContext = {
               customerName: res.user.name || customer_details.customer_name,
               serviceName: res.service.name || extraData.agreementSummary?.serviceName,
               planDuration : order.order_tags?.plan,
               orderId: order.order_id,
               paymentId: payment.cf_payment_id,
               amount: payment.payment_amount.toString(),
               currency: payment.payment_currency,
               paymentMethod: payment_gateway_details.gateway_name,
               purchaseDate: formatDateWithTime(payment.payment_time),
               expiryDate : res.subscription.expiryDate ? formatDateWithTime(res.subscription.expiryDate) : 'N/A',
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
      console.log("Error processing webhook:", error);
      return Response.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 200 });
   }
}