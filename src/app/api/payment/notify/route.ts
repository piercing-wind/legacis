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
            
            
            return Response.json({ message: "Payment success event received" }, { status: 200 });
         default:
            return Response.json({ message: "Event type not handled" }, { status: 200 });
      }

   }catch(error){
      return Response.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
   }
}