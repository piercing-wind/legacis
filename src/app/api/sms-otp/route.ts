// this is temp route for sms otp verification
import { auth } from "@/auth";
import { sendOTP, verifyOTP } from "@/actions/optVerification";

export const POST = auth(async (request)=> {
   try{
      if(!request.auth) throw new Error("Unauthorized");
      
      const { identifier, action, otp } = await request.json();

      if(!identifier) throw new Error("Missing phone");
      if(!action) throw new Error("Missing action parameter");

      let response;

      if (action === 'send') {
         // Send OTP
         response = await sendOTP({identifier, verificationType: 'CONSENT'});
         
         if(!response.success) {
            throw new Error(response.message || "Failed to send OTP");
         }

         return Response.json({
            success: true,
            data: response,
            message: "OTP sent successfully"
         }, { status: 200 });

      } else if (action === 'verify') {
         // Verify OTP
         if(!otp) throw new Error("Missing OTP");

         response = await verifyOTP({
            identifier,
            otp: otp
         });

         if(!response.success) {
            throw new Error(response.message || "Failed to verify OTP");
         }

         return Response.json({
            success: true,
            data: response,
            message: "OTP verified successfully"
         }, { status: 200 });

      } else {
         throw new Error("Invalid action. Use 'send' or 'verify'");
      }
      
   }catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            // Axios errors have a response property
            if ("response" in error && (error as any).response) {
               console.error("Error response data:", (error as any).response.data);
               console.error("Error response status:", (error as any).response.status);
               console.error("Error response headers:", (error as any).response.headers);
            }
            console.error("Error stack:", error.stack);
         } else {
            console.error("Unknown error:", error);
         }
      return Response.json({ error: { message: (error as Error).message } }, { status: 401 });
   }
})