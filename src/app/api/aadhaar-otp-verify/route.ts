import { auth } from "@/auth";
import { getCashfree } from "@/config/cashfreeConfig";
import { db } from "@/lib/db";


export const POST = auth(async (request)=> {
   try{
      if(!request.auth) throw new Error("Unauthorized");
      
      const {otp, ref_id, aadhaarOtpRecordId} = await request.json();

      if(!otp) throw new Error("Missing otp");
      if(!ref_id) throw new Error("Missing ref_id");

      // Initialize Cashfree SDK
      // This is done in the cashfreeConfig.ts file, so we just need to get the instance

      const Cashfree = getCashfree();

      const params = {
         otp,
         ref_id : ref_id 
      }

      const response = await Cashfree.VrsOfflineAadhaarVerifyOtp(params);
      
      const aadhaarOtpRecord = await db.aadhaarOtp.update({
         where: { id: aadhaarOtpRecordId },
         data: {
            otpStatus: response.data.status || "",
            verifiedOTPResponse: JSON.parse(JSON.stringify(response.data)) // store the verification response
         }
      });

      return Response.json({
         success: true,
         data: response.data,
         aadhaarOtpRecord
      }, { status: 200 });
   }catch (error) {
      console.error("Error in Aadhaar OTP verification:", error);
      return Response.json({ error: { message: (error as Error).message } }, { status: 401 });
   }
})