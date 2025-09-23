import { auth } from "@/auth";
import { getCashfree } from "@/config/cashfreeConfig";
import { db } from "@/lib/db";


export const POST = auth(async (request)=> {
   try{
      if(!request.auth) throw new Error("Unauthorized");
      
      const {aadhaar_number} = await request.json();

      if(!aadhaar_number) throw new Error("Missing aadhaar_number");
      if(aadhaar_number.length !== 12) throw new Error("Invalid aadhaar_number length");

      //Rate Limit 24 Hours - 3 requests per 24 hours

      const existingOtp = await db.aadhaarOtp.findMany({
         where: {
            aadhaarNumber: aadhaar_number,
            createdAt: {
               gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
         }
      });
      if (existingOtp.length >= 3) {
         throw new Error("You have reached the maximum limit of 3 OTP requests in 24 hours for this Aadhaar number.");
      }

      // Initialize Cashfree SDK
      // This is done in the cashfreeConfig.ts file, so we just need to get the instance

      const Cashfree = getCashfree();

      const params = {
         aadhaar_number
      }

      const response = await Cashfree.VrsOfflineAadhaarSendOtp(params)
      if(!response.data) {
         throw new Error("Failed to send OTP");
      }
      if (!response.data.ref_id) {
         throw new Error("ref_id missing in response");
      }
      const aadhaarOtpRecord = await db.aadhaarOtp.create({
         data: {
            aadhaarNumber : aadhaar_number,
            ref_id : response.data.ref_id,
            otpStatus : response.data.status || "",
            generatedOTPResponse: { ...response.data }
         }
      })
      console.log("Aadhaar OTP record created:", response);
      console.log("Aadhaar OTP sent successfully:", response.data);
      
      return Response.json({
         success: true,
         data: response.data, 
         aadhaarOtpRecord
      }, { status: 200 });
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