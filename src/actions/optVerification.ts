'use server'
import { OTPEmail } from "@/emails/template";
import { sendMail } from "@/emails/sendmail";
import { db } from "@/lib/db";
import { identifyInputType } from "@/lib/utils";
import { findUser, markEmailVerifiedById, markPhoneVerifiedById, updateEmailAndVerifyById, updatePhoneAndVerifyById, updateTermsAcceptedById } from "@/lib/data/user";
import { Session } from "./session";
import { User, VerificationType } from "@/prisma/generated/client";
import { sendOTPSMS } from "@/sms/sms";


const OTP_EXPIRY_MS = 10 * 60 * 1000; // 3 minutes
const OTP_RATE_LIMIT_MS = 2 * 60 * 1000; // 2 minutes

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getVerificationTypeLabel(type: VerificationType) {
  switch (type) {
    case "EMAIL_VERIFY": return "Email Verification";
    case "PHONE_VERIFY": return "Phone Verification";
    case "EMAIL_UPDATE": return "Email Update";
    case "PHONE_UPDATE": return "Phone Update";
    case "RESET_PASS_VERIFY": return "Password Reset";
    case "CONSENT": return "Consent Verification";
    case "AGREEMENT_ACCEPTANCE": return "Agreement Acceptance";
    default: return "Verification";
  }
}

export const sendOTP = async ({ identifier, verificationType }: { identifier: string, verificationType : VerificationType}) => {
  try {
    const input_type = identifyInputType(identifier); 
    const session = await Session();
    const userSession : User = session?.user ?? null;

    let user: User | null = null;

    if (verificationType !== "PHONE_UPDATE") {
      user = await findUser(identifier);
      if (!user) {
        return { success: false, message: "No account found for this identifier." };
      }
    }
    
   if (verificationType === "PHONE_UPDATE" && !userSession) {
      return { success: false, message: "Authentication required for phone update." };
   }
    const userId =user?.id ?? userSession.id;
    
    if (verificationType === 'RESET_PASS_VERIFY') {
      if (!user?.password) {
        return { success: false, message: "Password reset is not available for accounts created via Google or social login. Try logging in with a different method." };
      }
    }


    // Rate limit check
    const recentOtp = await db.otp.findUnique({
      where: { userId_identifier_verificationType: { userId, identifier, verificationType } }
    });

    if (recentOtp && recentOtp.createdAt > new Date(Date.now() - OTP_RATE_LIMIT_MS)) {
      throw new Error("You can only request a new OTP after 2 minutes.");
    }

    const OTP = generateOTP();

    if (input_type === 'email') {
      const data = {
        name: user?.name ?? "",
        otp: OTP,
        year: new Date().getFullYear(),
      };
       let subject = `${getVerificationTypeLabel(verificationType)} - Legacis`;
    
      await sendMail({
        to: identifier,
        subject: subject,
        template: 'otp',
        context: data,
      });
    }
    if (input_type === 'phone') {
      const res = await  sendOTPSMS({
         phoneNumber: identifier,
         otp: OTP,
         type: getVerificationTypeLabel(verificationType) 
      })
      if(res.ErrorCode !== '000') throw new Error(`Failed to send OTP SMS: ${res.ErrorMessage}`);
    }

    await db.otp.upsert({
      where: { userId_identifier_verificationType: { userId, identifier, verificationType }},
      update: {
        otp: OTP,
        expires_at: new Date(Date.now() + OTP_EXPIRY_MS),
        createdAt: new Date(),
      },
      create: {
        userId,
        identifier,
        otp: OTP,
        verificationType,
        expires_at: new Date(Date.now() + OTP_EXPIRY_MS),
      },
    });

    return { success: true, message: `Code sent successfully to ${identifier}. Valid for 10 minutes.` };
  } catch (error) {
    console.log("Error sending OTP:", error);
    return { success: false, message: error instanceof Error ? error.message : "Something went wrong." };
  }
};


export const verifyOTP = async ({identifier, otp}:{identifier : string, otp: string})=>{ 
   try {

      const otpRecord = await db.otp.findFirst({
          where: { identifier, otp },
          orderBy: { createdAt: 'desc' }
        });

      if (!otpRecord) {
         throw new Error("Invalid OTP, please try again.");
      }
      
      if (otpRecord.expires_at < new Date()) {
         await db.otp.delete({ where: { id: otpRecord.id } });
         throw new Error("OTP has expired, please request a new one.");
      }

      let res;
      let message = "OTP verified successfully";
      if (
         otpRecord.verificationType === "EMAIL_UPDATE" ||
         otpRecord.verificationType === "PHONE_UPDATE" ||
         otpRecord.verificationType === "EMAIL_VERIFY" ||
         otpRecord.verificationType === "PHONE_VERIFY" ||
         otpRecord.verificationType === "CONSENT"
       ) {
 
         switch (otpRecord.verificationType) {
           case "EMAIL_UPDATE":
             res = await updateEmailAndVerifyById(otpRecord.userId, otpRecord.identifier);
             message = "Email updated and verified successfully";
             break;
           case "PHONE_UPDATE":
             res = await updatePhoneAndVerifyById(otpRecord.userId, otpRecord.identifier);
             message = "Phone number updated and verified successfully";
             break;
           case "EMAIL_VERIFY":
             res = await markEmailVerifiedById(otpRecord.userId);
             message = "Email verified successfully";
             break;
           case "PHONE_VERIFY":
             res = await markPhoneVerifiedById(otpRecord.userId);
             message = "Phone number verified successfully";
             break;
           case 'CONSENT':
            res = await updateTermsAcceptedById(otpRecord.userId);
            message = "Consent accepted successfully";
            break;
         }
       }
   
      
         await db.otp.delete({ where: { id: otpRecord.id } });

      return { success: true, message, res}
   } catch (error) {
      if(
         typeof error === "object" &&
         error !== null &&
         "code" in error && error.code === "P2002") {
        const fields = (error as any).meta?.target?.join(", ") || "";
        return { success: false, message: `This ${fields} is already in use.` };
      }
      return { success: false, message: (error as Error).message }
   }
}
